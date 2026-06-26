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
	defaultBaud    = 115200
	defaultDTRWait = 300 * time.Millisecond
)

// Payloads (sin framing HDLC) tomados de vit3k/tonex_controller.
var (
	helloPayload = []byte{0xB9, 0x03, 0x00, 0x82, 0x04, 0x00, 0x80, 0x0B, 0x01,
		0xB9, 0x02, 0x02, 0x0B}
	stateRequestPayload = []byte{0xB9, 0x03, 0x00, 0x82, 0x06, 0x00, 0x80, 0x0B, 0x03,
		0xB9, 0x02, 0x81, 0x06, 0x03, 0x0B}
)

// PortInfo describe un puerto serie candidato.
type PortInfo struct {
	Name       string `json:"name"`
	VID        string `json:"vid"`
	PID        string `json:"pid"`
	Product    string `json:"product"`
	IsTonexOne bool   `json:"isTonexOne"`
}

// Describe da una linea legible del puerto.
func (p PortInfo) Describe() string {
	kind := "Tonex (PID desconocido)"
	if p.IsTonexOne {
		kind = "Tonex One"
	}
	return fmt.Sprintf("%s  [VID=0x%s PID=0x%s]  %s  %s", p.Name, p.VID, p.PID, kind, p.Product)
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
		out = append(out, PortInfo{
			Name:       p.Name,
			VID:        strings.ToUpper(p.VID),
			PID:        strings.ToUpper(p.PID),
			Product:    p.Product,
			IsTonexOne: strings.EqualFold(p.PID, tonexOnePID),
		})
	}
	return out, nil
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
	port serial.Port
	name string
}

// Open abre el puerto con DTR activo (obligatorio: el pedal solo transmite con
// DTR). dtrWait deja asentar el enlace tras subir las lineas.
func Open(name string, dtrWait time.Duration) (*Device, error) {
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
	return &Device{port: port, name: name}, nil
}

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
	if err := d.Send(helloPayload); err != nil {
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
	if err := d.Send(stateRequestPayload); err != nil {
		return nil, err
	}
	frame, err := d.ReadFrame(2 * time.Second)
	if err != nil {
		return nil, err
	}
	return RemoveFraming(frame)
}

// HelloWithRetry reintenta el handshake.
func (d *Device) HelloWithRetry(attempts int) ([]byte, error) {
	var lastErr error
	for i := 0; i < attempts; i++ {
		out, err := d.Hello()
		if err == nil {
			return out, nil
		}
		lastErr = err
		_ = d.ResetInput()
		time.Sleep(150 * time.Millisecond)
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
