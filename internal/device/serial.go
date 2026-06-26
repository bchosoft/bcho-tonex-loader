package device

import (
	"fmt"
	"strings"
	"time"

	"go.bug.st/serial"
	"go.bug.st/serial/enumerator"
)

// Identificadores USB de IK Multimedia.
const (
	tonexVID       = "1963"
	tonexOnePID    = "00D1"
	tonexPedalPID  = "0068"
	defaultBaud    = 115200
	defaultDTRWait = 300 * time.Millisecond
)

// Model identifica el modelo de pedal Tonex conectado.
//
// El byte de "protocolo/sesion" del handshake es DISTINTO por modelo y es
// obligatorio: el Tonex One usa 0x0b y el Tonex Pedal grande usa 0x10
// (verificado contra el hardware real: el Pedal NO responde al HELLO con 0x0b).
type Model int

const (
	ModelUnknown Model = iota
	ModelOne
	ModelPedal
)

// Proto devuelve el byte de protocolo del handshake para el modelo.
func (m Model) Proto() byte {
	if m == ModelPedal {
		return 0x10
	}
	return 0x0b // One (y por defecto)
}

// SlotCount devuelve el numero de slots de presets del modelo.
func (m Model) SlotCount() int {
	if m == ModelPedal {
		return 150 // 50 bancos x 3 (A/B/C)
	}
	return 20 // Tonex One
}

// Key devuelve un identificador estable ("one"/"pedal") para el frontend.
func (m Model) Key() string {
	switch m {
	case ModelPedal:
		return "pedal"
	case ModelOne:
		return "one"
	default:
		return "unknown"
	}
}

// DisplayName devuelve el nombre legible del modelo.
func (m Model) DisplayName() string {
	switch m {
	case ModelPedal:
		return "Tonex Pedal"
	case ModelOne:
		return "Tonex One"
	default:
		return "Tonex (desconocido)"
	}
}

// modelFromPID deduce el modelo a partir del PID USB.
func modelFromPID(pid string) Model {
	switch {
	case strings.EqualFold(pid, tonexOnePID):
		return ModelOne
	case strings.EqualFold(pid, tonexPedalPID):
		return ModelPedal
	default:
		return ModelUnknown
	}
}

// helloPayloadFor construye el HELLO (sin framing) para el byte de protocolo dado.
func helloPayloadFor(proto byte) []byte {
	return []byte{0xB9, 0x03, 0x00, 0x82, 0x04, 0x00, 0x80, proto, 0x01,
		0xB9, 0x02, 0x02, proto}
}

// stateRequestPayloadFor construye la peticion de estado para el byte de protocolo.
// El sub-opcode tras "81 06" es 0x03 en el Tonex One y 0x02 en el Tonex Pedal
// (verificado en captura USB del editor oficial).
func stateRequestPayloadFor(proto byte) []byte {
	sub := byte(0x03)
	if proto == 0x10 { // Tonex Pedal
		sub = 0x02
	}
	return []byte{0xB9, 0x03, 0x00, 0x82, 0x06, 0x00, 0x80, proto, 0x03,
		0xB9, 0x02, 0x81, 0x06, sub, proto}
}

// PortInfo describe un puerto serie candidato.
type PortInfo struct {
	Name       string `json:"name"`
	VID        string `json:"vid"`
	PID        string `json:"pid"`
	Product    string `json:"product"`
	IsTonexOne bool   `json:"isTonexOne"`
	Model      string `json:"model"`     // "one" | "pedal" | "unknown"
	ModelName  string `json:"modelName"` // nombre legible
}

// Describe da una linea legible del puerto.
func (p PortInfo) Describe() string {
	return fmt.Sprintf("%s  [VID=0x%s PID=0x%s]  %s  %s", p.Name, p.VID, p.PID, p.ModelName, p.Product)
}

// FindTonexPorts devuelve los puertos cuyo VID es el de IK Multimedia.
func FindTonexPorts() ([]PortInfo, error) {
	ports, err := enumerator.GetDetailedPortsList()
	if err != nil {
		return nil, err
	}
	var out []PortInfo
	for _, p := range ports {
		if !p.IsUSB {
			continue
		}
		if !strings.EqualFold(p.VID, tonexVID) {
			continue
		}
		m := modelFromPID(p.PID)
		out = append(out, PortInfo{
			Name:       p.Name,
			VID:        strings.ToUpper(p.VID),
			PID:        strings.ToUpper(p.PID),
			Product:    p.Product,
			IsTonexOne: m == ModelOne,
			Model:      m.Key(),
			ModelName:  m.DisplayName(),
		})
	}
	return out, nil
}

// DetectModel devuelve el modelo del pedal en el puerto dado (por PID USB).
func DetectModel(port string) Model {
	ports, err := FindTonexPorts()
	if err != nil {
		return ModelUnknown
	}
	for _, p := range ports {
		if strings.EqualFold(p.Name, port) {
			return modelFromPID(p.PID)
		}
	}
	return ModelUnknown
}

// ListAllPortNames devuelve TODOS los puertos serie del sistema (no solo Tonex).
// Sirve de red de seguridad en la GUI: si la enumeracion USB no expone el VID/PID
// del pedal (a veces pasa), el usuario puede elegir el COM a mano y la conexion
// detecta el modelo por sondeo de HELLO (ver Open en modo sonda).
func ListAllPortNames() ([]string, error) {
	return serial.GetPortsList()
}

// AutodetectPort devuelve el primer puerto Tonex detectado.
func AutodetectPort() (string, error) {
	ports, err := FindTonexPorts()
	if err != nil {
		return "", err
	}
	if len(ports) == 0 {
		return "", fmt.Errorf("no se detecta un pedal TONEX por USB")
	}
	return ports[0].Name, nil
}

// Device es una conexion serie abierta con un pedal Tonex.
type Device struct {
	port  serial.Port
	name  string
	model Model
	proto byte
}

// Open abre el puerto del pedal del modelo indicado. Si model es ModelUnknown se
// autodetecta por PID; si aun asi no se sabe, la conexion queda en "modo sonda" y
// HelloWithRetry probara los dos bytes de protocolo (0x10 Pedal, luego 0x0b One)
// para descubrir el modelo sin depender de los metadatos USB.
func Open(name string, model Model, dtrWait time.Duration) (*Device, error) {
	if model == ModelUnknown {
		model = DetectModel(name)
	}
	if dtrWait <= 0 {
		dtrWait = defaultDTRWait
	}
	mode := &serial.Mode{
		BaudRate: defaultBaud,
		DataBits: 8,
		Parity:   serial.NoParity,
		StopBits: serial.OneStopBit,
	}
	port, err := serial.Open(name, mode)
	if err != nil {
		return nil, fmt.Errorf("no se pudo abrir %s: %w", name, err)
	}
	// IMPORTANTE: el pedal solo transmite con DTR activo (verificado en Tonex One).
	if err := port.SetDTR(true); err != nil {
		port.Close()
		return nil, err
	}
	_ = port.SetRTS(true)
	time.Sleep(dtrWait)
	_ = port.ResetInputBuffer()
	return &Device{port: port, name: name, model: model, proto: model.Proto()}, nil
}

// Model devuelve el modelo de pedal de esta conexion.
func (d *Device) Model() Model { return d.model }

// Proto devuelve el byte de protocolo del handshake de esta conexion.
func (d *Device) Proto() byte { return d.proto }

// Close cierra el puerto.
func (d *Device) Close() error {
	if d.port == nil {
		return nil
	}
	err := d.port.Close()
	d.port = nil
	return err
}

// Name devuelve el nombre del puerto.
func (d *Device) Name() string { return d.name }

// ResetInput vacia el buffer de entrada.
func (d *Device) ResetInput() error {
	if d.port == nil {
		return fmt.Errorf("puerto cerrado")
	}
	return d.port.ResetInputBuffer()
}

// Send envuelve el payload en HDLC y lo escribe.
func (d *Device) Send(payload []byte) error {
	if d.port == nil {
		return fmt.Errorf("puerto cerrado")
	}
	frame := AddFraming(payload)
	for len(frame) > 0 {
		n, err := d.port.Write(frame)
		if err != nil {
			return err
		}
		frame = frame[n:]
	}
	return d.port.Drain()
}

// ReadFrame lee bytes hasta tener una trama completa 0x7E ... 0x7E.
func (d *Device) ReadFrame(overall time.Duration) ([]byte, error) {
	if d.port == nil {
		return nil, fmt.Errorf("puerto cerrado")
	}
	if overall <= 0 {
		overall = 2 * time.Second
	}
	if err := d.port.SetReadTimeout(50 * time.Millisecond); err != nil {
		return nil, err
	}
	deadline := time.Now().Add(overall)
	buf := make([]byte, 0, 512)
	started := false
	chunk := make([]byte, 512)
	for time.Now().Before(deadline) {
		n, err := d.port.Read(chunk)
		if err != nil {
			return nil, err
		}
		if n == 0 {
			continue
		}
		for _, b := range chunk[:n] {
			if b == flagByte {
				if !started {
					started = true
					buf = buf[:0]
					buf = append(buf, b)
				} else if len(buf) == 1 {
					// Flag de apertura repetido (idle): seguimos esperando.
					continue
				} else {
					buf = append(buf, b)
					return append([]byte{}, buf...), nil
				}
			} else if started {
				buf = append(buf, b)
			}
		}
	}
	return nil, fmt.Errorf("no se recibio ninguna trama completa (timeout)")
}

// Hello envia el handshake y devuelve el payload sin framing.
func (d *Device) Hello() ([]byte, error) {
	if err := d.Send(helloPayloadFor(d.proto)); err != nil {
		return nil, err
	}
	frame, err := d.ReadFrame(2 * time.Second)
	if err != nil {
		return nil, err
	}
	return RemoveFraming(frame)
}

// RequestState pide el estado y devuelve el payload sin framing.
func (d *Device) RequestState() ([]byte, error) {
	if err := d.Send(stateRequestPayloadFor(d.proto)); err != nil {
		return nil, err
	}
	frame, err := d.ReadFrame(2 * time.Second)
	if err != nil {
		return nil, err
	}
	return RemoveFraming(frame)
}

// HelloWithRetry reintenta el handshake. En "modo sonda" (modelo desconocido)
// prueba primero el protocolo del Pedal (0x10) y luego el del One (0x0b),
// fijando el modelo/protocolo del dispositivo segun cual responda. Asi la
// conexion funciona aunque la enumeracion USB no haya dado el PID.
func (d *Device) HelloWithRetry(attempts int) ([]byte, error) {
	if attempts < 1 {
		attempts = 1
	}
	// Candidatos de protocolo a probar.
	var candidates []struct {
		proto byte
		model Model
	}
	if d.model == ModelUnknown {
		candidates = append(candidates,
			struct {
				proto byte
				model Model
			}{0x10, ModelPedal},
			struct {
				proto byte
				model Model
			}{0x0b, ModelOne})
	} else {
		candidates = append(candidates, struct {
			proto byte
			model Model
		}{d.proto, d.model})
	}

	var lastErr error
	for _, c := range candidates {
		d.proto = c.proto
		for i := 0; i < attempts; i++ {
			out, err := d.Hello()
			if err == nil {
				if d.model == ModelUnknown {
					d.model = c.model // descubierto por sondeo
				}
				return out, nil
			}
			lastErr = err
			_ = d.ResetInput()
			time.Sleep(150 * time.Millisecond)
		}
	}
	if lastErr == nil {
		lastErr = fmt.Errorf("no se recibio hello del pedal")
	}
	return nil, lastErr
}

// RequestStateWithRetry reintenta la lectura de estado.
func (d *Device) RequestStateWithRetry(attempts int) ([]byte, error) {
	var lastErr error
	for i := 0; i < attempts; i++ {
		out, err := d.RequestState()
		if err == nil {
			return out, nil
		}
		lastErr = err
		_ = d.ResetInput()
		time.Sleep(150 * time.Millisecond)
	}
	if lastErr == nil {
		lastErr = fmt.Errorf("no se recibio estado del pedal")
	}
	return nil, lastErr
}
