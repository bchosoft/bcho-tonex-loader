// Package librarian ofrece la API de alto nivel del Tonex One (snapshot, subida,
// asignacion, color, estado rapido), separando la GUI del protocolo de bajo nivel.
// Portado de tonex_tool/librarian.py.
package librarian

import (
	"fmt"
	"os"
	"strings"
	"time"

	"go-tonex-loader/internal/assets"
	"go-tonex-loader/internal/device"
	"go-tonex-loader/internal/preset"
	"go-tonex-loader/internal/upload"
)

// stateSetHeader es la cabecera del mensaje "set state" (longitud en [6],[7]).
var stateSetHeader = []byte{0xb9, 0x03, 0x81, 0x06, 0x03, 0x82, 0x00, 0x00, 0x80, 0x0b, 0x03}

// Snapshot es la foto completa del pedal.
type Snapshot struct {
	Port        string             `json:"port"`
	Model       string             `json:"model"`     // "one" | "pedal" | "unknown"
	ModelName   string             `json:"modelName"` // nombre legible
	Count       int                `json:"count"`
	Assignments preset.Assignments `json:"assignments"`
	ActiveSlot  int                `json:"activeSlot"`
	Presets     []preset.Summary   `json:"presets"`
	Colors      []preset.RGB       `json:"colors"`
}

// QuickState es el estado ligero usado por el polling del footswitch.
type QuickState struct {
	Assignments  preset.Assignments `json:"assignments"`
	ActiveSlot   int                `json:"activeSlot"`
	Colors       []preset.RGB       `json:"colors"`
	ActivePreset int                `json:"activePreset"` // Pedal: indice del preset activo; -1 si N/A
}

// UploadResult agrupa el ACK, el preset releido y el estado tras una subida.
type UploadResult struct {
	OK        bool            `json:"ok"`
	Preset    *preset.Summary `json:"preset,omitempty"`
	Assigned  string          `json:"assigned,omitempty"`
	ReadError string          `json:"readError,omitempty"`
}

// TXPExport agrupa un .txp reconstruido desde un slot del pedal.
type TXPExport struct {
	Data []byte
	Info *upload.Info
}

// ProgressFunc recibe mensajes de progreso para la GUI.
type ProgressFunc func(string)

func report(p ProgressFunc, msg string) {
	if p != nil {
		p(msg)
	}
}

func resolvePort(port string) (string, error) {
	if port != "" {
		return port, nil
	}
	return device.AutodetectPort()
}

func readPayloadFrame(dev *device.Device, timeout time.Duration) ([]byte, error) {
	frame, err := dev.ReadFrame(timeout)
	if err != nil {
		return nil, err
	}
	return device.RemoveFraming(frame)
}

func assignedLabel(a preset.Assignments, idx int) string {
	var parts []string
	if a.A == idx {
		parts = append(parts, "A")
	}
	if a.B == idx {
		parts = append(parts, "B")
	}
	if a.C == idx {
		parts = append(parts, "C")
	}
	return strings.Join(parts, "/")
}

// ReadSnapshot lee el estado y los `count` presets del pedal. Para no bloquear la
// UI con pedales de muchos slots (el Tonex Pedal tiene 100), admite dos callbacks
// opcionales de carga progresiva: onState se llama una vez con el estado base
// (asignaciones/activo/colores) en cuanto se lee, y onSlot por cada preset leído.
func ReadSnapshot(port string, count int, full bool, progress ProgressFunc,
	onState func(*Snapshot), onSlot func(preset.Summary)) (*Snapshot, error) {
	port, err := resolvePort(port)
	if err != nil {
		return nil, err
	}
	dev, err := device.Open(port, device.ModelUnknown, 0)
	if err != nil {
		return nil, err
	}
	defer dev.Close()

	if _, err := dev.HelloWithRetry(2); err != nil {
		return nil, err
	}
	// El modelo definitivo lo da la conexion (sondeo HELLO), no el PID: ajustamos
	// el numero de slots al modelo realmente detectado (One=20, Pedal=150).
	if mc := dev.Model().SlotCount(); mc > 0 {
		count = mc
	}
	state, err := dev.RequestStateWithRetry(2)
	if err != nil {
		return nil, err
	}
	asg := preset.ParseStateAssignments(state)
	active := preset.ParseActiveSlot(state)
	colors, _ := preset.ParseStateColors(state)
	modelKey := dev.Model().Key()
	modelName := dev.Model().DisplayName()

	if onState != nil {
		onState(&Snapshot{Port: port, Model: modelKey, ModelName: modelName, Count: count, Assignments: asg, ActiveSlot: active, Colors: colors})
	}

	fullByte := 0
	timeout := 3 * time.Second
	if full {
		fullByte = 1
		timeout = 8 * time.Second
	}

	presets := make([]preset.Summary, 0, count)
	for idx := 0; idx < count; idx++ {
		report(progress, fmt.Sprintf("Leyendo slot %d/%d...", idx+1, count))
		if err := dev.Send(preset.RequestPresetPayloadFor(idx, fullByte, dev.Proto())); err != nil {
			return nil, err
		}
		payload, err := readPayloadFrame(dev, timeout)
		if err != nil {
			return nil, fmt.Errorf("slot %d: %w", idx, err)
		}
		s := preset.ParseUploadLike(payload, idx)
		s.Assigned = assignedLabel(asg, idx)
		presets = append(presets, s)
		if onSlot != nil {
			onSlot(s)
		}
	}

	return &Snapshot{
		Port:        port,
		Model:       modelKey,
		ModelName:   modelName,
		Count:       count,
		Assignments: asg,
		ActiveSlot:  active,
		Presets:     presets,
		Colors:      colors,
	}, nil
}

// SelectPreset fija el preset activo del pedal (el pedal cambia a ese sonido).
// Implementado para el Tonex Pedal (registro 81 01); en el Tonex One la seleccion
// se hace asignando a A/B/Stomp, asi que aqui se rechaza con un mensaje claro.
func SelectPreset(index int, port string) error {
	port, err := resolvePort(port)
	if err != nil {
		return err
	}
	dev, err := device.Open(port, device.ModelUnknown, 0)
	if err != nil {
		return err
	}
	defer dev.Close()
	if _, err := dev.HelloWithRetry(2); err != nil {
		return err
	}
	if dev.Model() != device.ModelPedal {
		return fmt.Errorf("cambiar el preset activo solo está disponible en el Tonex Pedal; en el Tonex One usa A/B/Stomp")
	}
	if index < 0 || index >= dev.Model().SlotCount() {
		return fmt.Errorf("slot fuera de rango (0-%d)", dev.Model().SlotCount()-1)
	}
	if err := dev.Send(preset.SelectActivePresetPayload(index, dev.Proto())); err != nil {
		return err
	}
	// El pedal responde con el detalle del preset ya activo; lo leemos para dejar
	// el puerto limpio (si no llega, no es fatal).
	_, _ = dev.ReadFrame(2 * time.Second)
	return nil
}

// ReadStateQuick lee solo el estado (rapido), para el polling del footswitch.
func ReadStateQuick(port string) (*QuickState, error) {
	port, err := resolvePort(port)
	if err != nil {
		return nil, err
	}
	dev, err := device.Open(port, device.ModelUnknown, 50*time.Millisecond)
	if err != nil {
		return nil, err
	}
	defer dev.Close()
	if _, err := dev.HelloWithRetry(2); err != nil {
		return nil, err
	}
	state, err := dev.RequestStateWithRetry(2)
	if err != nil {
		return nil, err
	}
	colors, _ := preset.ParseStateColors(state)
	return &QuickState{
		Assignments:  preset.ParseStateAssignments(state),
		ActiveSlot:   preset.ParseActiveSlot(state),
		Colors:       colors,
		ActivePreset: -1,
	}, nil
}

// readActivePresetOpen lee el indice del preset activo del Pedal (registro 81 01).
func readActivePresetOpen(dev *device.Device) (int, error) {
	if err := dev.Send(preset.RequestActivePresetPayload(dev.Proto())); err != nil {
		return -1, err
	}
	payload, err := readPayloadFrame(dev, 2*time.Second)
	if err != nil {
		return -1, err
	}
	return preset.ParseActivePresetIndex(payload), nil
}

// ReadPreset lee un unico preset del pedal.
func ReadPreset(index int, port string, full bool) (*preset.Summary, error) {
	if index < 0 || index > 255 {
		return nil, fmt.Errorf("index fuera de rango")
	}
	port, err := resolvePort(port)
	if err != nil {
		return nil, err
	}
	dev, err := device.Open(port, device.ModelUnknown, 0)
	if err != nil {
		return nil, err
	}
	defer dev.Close()
	if _, err := dev.HelloWithRetry(2); err != nil {
		return nil, err
	}
	return readPresetOpen(dev, index, full)
}

func readPresetOpen(dev *device.Device, index int, full bool) (*preset.Summary, error) {
	payload, err := readPresetPayloadOpen(dev, index, full)
	if err != nil {
		return nil, err
	}
	s := preset.ParseUploadLike(payload, index)
	return &s, nil
}

func readPresetPayloadOpen(dev *device.Device, index int, full bool) ([]byte, error) {
	fullByte := 0
	timeout := 3 * time.Second
	if full {
		fullByte = 1
		timeout = 8 * time.Second
	}
	if err := dev.Send(preset.RequestPresetPayloadFor(index, fullByte, dev.Proto())); err != nil {
		return nil, err
	}
	return readPayloadFrame(dev, timeout)
}

func sendStateData(dev *device.Device, stateData []byte) ([]byte, error) {
	header := append([]byte{}, stateSetHeader...)
	header[6] = byte(len(stateData) & 0xFF)
	header[7] = byte((len(stateData) >> 8) & 0xFF)
	msg := append(header, stateData...)
	if err := dev.Send(msg); err != nil {
		return nil, err
	}
	return readPayloadFrame(dev, 3*time.Second)
}

// BuildUpload genera el payload de subida desde un .txp (para inspeccion/preview).
func BuildUpload(txpPath string, slot int) ([]byte, error) {
	raw, err := os.ReadFile(txpPath)
	if err != nil {
		return nil, err
	}
	return upload.BuildBCho(raw, assets.Template, slot)
}

// ExportPresetTXP lee el slot completo y reconstruye un .txp funcional con el
// contenido actual del pedal. `modelNameSuffix` (p.ej. " BCho") se anade al final
// del nombre del modelo en todas sus apariciones; "" = sin sufijo.
func ExportPresetTXP(index int, port string, progress ProgressFunc, modelNameSuffix string, overlays ...*upload.Metadata) (*TXPExport, error) {
	if index < 0 {
		return nil, fmt.Errorf("index fuera de rango")
	}
	port, err := resolvePort(port)
	if err != nil {
		return nil, err
	}
	dev, err := device.Open(port, device.ModelUnknown, 0)
	if err != nil {
		return nil, err
	}
	defer dev.Close()

	report(progress, "Conectando con el pedal...")
	if _, err := dev.HelloWithRetry(2); err != nil {
		return nil, err
	}
	if index >= dev.Model().SlotCount() {
		return nil, fmt.Errorf("index fuera de rango (0-%d)", dev.Model().SlotCount()-1)
	}
	report(progress, fmt.Sprintf("Leyendo slot %d/%d...", index+1, dev.Model().SlotCount()))
	payload, err := readPresetPayloadOpen(dev, index, true)
	if err != nil {
		return nil, err
	}
	report(progress, "Generando .txp...")
	exported, err := upload.ExportFromPayloadSuffixed(payload, modelNameSuffix, overlays...)
	if err != nil {
		return nil, err
	}
	return &TXPExport{Data: exported.Data, Info: exported.Info}, nil
}

// UploadTXPWorkflow sube un .txp al slot, relee el slot y opcionalmente lo asigna
// a A/B/Stomp. Reutiliza una sola conexion serie.
func UploadTXPWorkflow(txpPath string, slot int, assignTo, port string, progress ProgressFunc) (*UploadResult, error) {
	port, err := resolvePort(port)
	if err != nil {
		return nil, err
	}
	raw, err := os.ReadFile(txpPath)
	if err != nil {
		return nil, err
	}

	dev, err := device.Open(port, device.ModelUnknown, 0)
	if err != nil {
		return nil, err
	}
	defer dev.Close()

	report(progress, "Conectando con el pedal...")
	if _, err := dev.HelloWithRetry(2); err != nil {
		return nil, err
	}

	// El payload y la secuencia de subida dependen del modelo realmente conectado.
	// Pedal: plantilla +1, sin setup frames. One: plantilla out_3 + 3 setup frames.
	report(progress, "Generando payload...")
	var payload []byte
	var setupFrames [][]byte
	if dev.Model() == device.ModelPedal {
		payload, err = upload.BuildBChoPedal(raw, assets.TemplatePedal, slot)
	} else {
		payload, err = upload.BuildBCho(raw, assets.Template, slot)
		setupFrames = assets.SetupFrames()
	}
	if err != nil {
		return nil, err
	}

	result := &UploadResult{}
	ack := uploadPayloadOpen(dev, txpPath, slot, payload, setupFrames, progress)
	result.OK = ack != nil
	if ack == nil {
		return result, nil
	}

	report(progress, "Leyendo slot actualizado...")
	if p, err := readPresetOpen(dev, slot, true); err != nil {
		result.ReadError = err.Error()
	} else {
		result.Preset = p
	}

	if assignTo != "" && dev.Model() != device.ModelPedal {
		label := strings.ToUpper(assignTo)
		if label == "STOMP" {
			label = "Stomp"
		}
		report(progress, "Cargando en "+label+"...")
		if _, err := setSlotAssignmentOpen(dev, assignTo, slot, true); err == nil {
			result.Assigned = strings.ToUpper(assignTo)
		}
	}
	return result, nil
}

func uploadPayloadOpen(dev *device.Device, txpPath string, slot int, payload []byte, setupFrames [][]byte, progress ProgressFunc) []byte {
	time.Sleep(100 * time.Millisecond)
	names := []string{"out_0_13B.bin", "out_1_17B.bin", "out_2_16B.bin"}
	for i, setup := range setupFrames {
		report(progress, "Enviando setup "+names[i]+"...")
		_ = dev.Send(setup)
		_, _ = dev.ReadFrame(3 * time.Second) // ignoramos timeout
		time.Sleep(100 * time.Millisecond)
	}
	report(progress, fmt.Sprintf("Subiendo al slot %d...", slot+1))
	if err := dev.Send(payload); err != nil {
		return nil
	}
	time.Sleep(500 * time.Millisecond)
	ack, err := readPayloadFrame(dev, 12*time.Second)
	if err != nil {
		return nil
	}
	return ack
}

// SetSlotAssignment carga `presetIndex` en A, B o C/Stomp.
func SetSlotAssignment(slotName string, presetIndex int, port string, selectIt bool) ([]byte, error) {
	port, err := resolvePort(port)
	if err != nil {
		return nil, err
	}
	dev, err := device.Open(port, device.ModelUnknown, 0)
	if err != nil {
		return nil, err
	}
	defer dev.Close()
	if _, err := dev.HelloWithRetry(2); err != nil {
		return nil, err
	}
	return setSlotAssignmentOpen(dev, slotName, presetIndex, selectIt)
}

func setSlotAssignmentOpen(dev *device.Device, slotName string, presetIndex int, selectIt bool) ([]byte, error) {
	slotName = strings.ToUpper(slotName)
	slotIdx, ok := preset.SlotIndex[slotName]
	if !ok {
		return nil, fmt.Errorf("slot_name debe ser A, B o C/Stomp")
	}
	if presetIndex < 0 || presetIndex > 19 {
		return nil, fmt.Errorf("preset_index fuera de rango")
	}
	statePayload, err := dev.RequestStateWithRetry(2)
	if err != nil {
		return nil, err
	}
	state, err := preset.StateDataFromPayload(statePayload)
	if err != nil {
		return nil, err
	}
	ln := len(state)

	if slotName == "A" || slotName == "B" {
		state[preset.StateOffsetStartStomp] = 0
	} else {
		state[preset.StateOffsetStartStomp] = 1
	}
	state[ln-preset.StateOffsetEndDirectMon] = 1

	switch slotName {
	case "A":
		state[ln-preset.StateOffsetEndSlotA] = byte(presetIndex)
	case "B":
		state[ln-preset.StateOffsetEndSlotB] = byte(presetIndex)
	default:
		state[ln-preset.StateOffsetEndSlotC] = byte(presetIndex)
	}
	if selectIt {
		state[ln-preset.StateOffsetEndCurSlot] = byte(slotIdx)
	}

	ack, err := sendStateData(dev, state)
	if err == nil && ack != nil {
		return ack, nil
	}
	time.Sleep(250 * time.Millisecond)
	return dev.RequestStateWithRetry(2)
}

// SetPresetColor cambia el color RGB de un slot.
func SetPresetColor(presetIndex int, rgb preset.RGB, port string) ([]byte, error) {
	if presetIndex < 0 || presetIndex >= preset.TonexOnePresetCount {
		return nil, fmt.Errorf("preset_index fuera de rango")
	}
	port, err := resolvePort(port)
	if err != nil {
		return nil, err
	}
	dev, err := device.Open(port, device.ModelUnknown, 0)
	if err != nil {
		return nil, err
	}
	defer dev.Close()
	if _, err := dev.HelloWithRetry(2); err != nil {
		return nil, err
	}
	statePayload, err := dev.RequestStateWithRetry(2)
	if err != nil {
		return nil, err
	}
	state, err := preset.StateDataFromPayload(statePayload)
	if err != nil {
		return nil, err
	}
	newState, err := preset.ReplaceStateColor(state, presetIndex, rgb)
	if err != nil {
		return nil, err
	}
	ack, err := sendStateData(dev, newState)
	if err == nil && ack != nil {
		return ack, nil
	}
	time.Sleep(250 * time.Millisecond)
	return dev.RequestStateWithRetry(2)
}
