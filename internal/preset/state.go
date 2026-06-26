package preset

import (
	"bytes"
	"fmt"
)

// Constantes del bloque de estado del Tonex One (de librarian.py).
const (
	StateDataStart          = 8
	StateOffsetStartColors  = 22
	TonexOnePresetCount     = 20
	StateOffsetStartStomp   = 19
	StateOffsetEndDirectMon = 7
	StateOffsetEndCurSlot   = 11
	StateOffsetEndSlotC     = 14
	StateOffsetEndSlotB     = 16
	StateOffsetEndSlotA     = 18
)

// SlotIndex mapea el nombre de posicion al indice interno.
var SlotIndex = map[string]int{"A": 0, "B": 1, "C": 2, "STOMP": 2}

// Assignments son los presets cargados en A, B y C/Stomp (-1 = ninguno).
type Assignments struct {
	A int `json:"a"`
	B int `json:"b"`
	C int `json:"c"`
}

// ParseStateAssignments extrae A/B/C del state payload (formato bc 06 ...).
func ParseStateAssignments(payload []byte) Assignments {
	res := Assignments{A: -1, B: -1, C: -1}
	pos := bytes.Index(payload, []byte{0xbc, 0x06})
	if pos < 0 || pos+8 > len(payload) {
		return res
	}
	res.A = int(payload[pos+2])
	res.B = int(payload[pos+4])
	res.C = int(payload[pos+6])
	return res
}

// ParseActiveSlot extrae el slot activo (tras A/B/C). -1 si no esta.
func ParseActiveSlot(payload []byte) int {
	pos := bytes.Index(payload, []byte{0xbc, 0x06})
	if pos < 0 || pos+12 > len(payload) {
		return -1
	}
	return int(payload[pos+9])
}

// StateDataFromPayload devuelve la parte de datos del estado (sin la cabecera).
func StateDataFromPayload(statePayload []byte) ([]byte, error) {
	if len(statePayload) <= StateDataStart {
		return nil, fmt.Errorf("estado del pedal demasiado corto")
	}
	return append([]byte{}, statePayload[StateDataStart:]...), nil
}

// parseValue lee un valor codificado (0x80/0x81/0x82 o literal) en state_data.
func parseValue(data []byte, offset int) (int, int) {
	marker := data[offset]
	switch marker {
	case 0x81, 0x82:
		return int(data[offset+2])<<8 | int(data[offset+1]), offset + 3
	case 0x80:
		return int(data[offset+1]), offset + 2
	default:
		return int(marker), offset + 1
	}
}

func encodeValue(value int) []byte {
	value &= 0xFFFF
	switch {
	case value >= 0x100:
		return []byte{0x81, byte(value & 0xFF), byte((value >> 8) & 0xFF)}
	case value >= 0x80:
		return []byte{0x80, byte(value & 0xFF)}
	default:
		return []byte{byte(value & 0xFF)}
	}
}

// RGB es un color de LED de slot.
type RGB struct {
	R int `json:"r"`
	G int `json:"g"`
	B int `json:"b"`
}

// ParseStateColors extrae los colores RGB de los 20 slots del state payload.
func ParseStateColors(statePayload []byte) ([]RGB, error) {
	stateData, err := StateDataFromPayload(statePayload)
	if err != nil {
		return nil, err
	}
	offset := StateOffsetStartColors + 2
	colors := make([]RGB, 0, TonexOnePresetCount)
	for idx := 0; idx < TonexOnePresetCount; idx++ {
		if offset+2 > len(stateData) || stateData[offset] != 0xb9 || stateData[offset+1] != 0x03 {
			break
		}
		offset += 2
		var r, g, b int
		r, offset = parseValue(stateData, offset)
		g, offset = parseValue(stateData, offset)
		b, offset = parseValue(stateData, offset)
		colors = append(colors, RGB{R: r & 0xFF, G: g & 0xFF, B: b & 0xFF})
	}
	return colors, nil
}

func colorSectionBounds(stateData []byte) (int, int, error) {
	offset := StateOffsetStartColors
	if len(stateData) <= offset+2 || stateData[offset] != 0xba || stateData[offset+1] != 0x14 {
		return 0, 0, fmt.Errorf("no se encontro el bloque de colores en el estado")
	}
	offset += 2
	for idx := 0; idx < TonexOnePresetCount; idx++ {
		if offset+2 > len(stateData) || stateData[offset] != 0xb9 || stateData[offset+1] != 0x03 {
			return 0, 0, fmt.Errorf("bloque de colores inesperado")
		}
		offset += 2
		_, offset = parseValue(stateData, offset)
		_, offset = parseValue(stateData, offset)
		_, offset = parseValue(stateData, offset)
	}
	return StateOffsetStartColors, offset, nil
}

// ReplaceStateColor devuelve un nuevo state_data con el color del slot indicado
// sustituido por rgb.
func ReplaceStateColor(stateData []byte, presetIndex int, rgb RGB) ([]byte, error) {
	offset := StateOffsetStartColors + 2
	colors := make([]RGB, 0, TonexOnePresetCount)
	for idx := 0; idx < TonexOnePresetCount; idx++ {
		if offset+2 > len(stateData) || stateData[offset] != 0xb9 || stateData[offset+1] != 0x03 {
			return nil, fmt.Errorf("bloque de colores inesperado")
		}
		offset += 2
		var r, g, b int
		r, offset = parseValue(stateData, offset)
		g, offset = parseValue(stateData, offset)
		b, offset = parseValue(stateData, offset)
		colors = append(colors, RGB{R: r & 0xFF, G: g & 0xFF, B: b & 0xFF})
	}
	if presetIndex < 0 || presetIndex >= len(colors) {
		return nil, fmt.Errorf("indice de preset fuera de rango")
	}
	colors[presetIndex] = RGB{R: rgb.R & 0xFF, G: rgb.G & 0xFF, B: rgb.B & 0xFF}

	start, end, err := colorSectionBounds(stateData)
	if err != nil {
		return nil, err
	}
	section := []byte{0xba, 0x14}
	for _, c := range colors {
		section = append(section, 0xb9, 0x03)
		section = append(section, encodeValue(c.R)...)
		section = append(section, encodeValue(c.G)...)
		section = append(section, encodeValue(c.B)...)
	}
	out := append([]byte{}, stateData[:start]...)
	out = append(out, section...)
	out = append(out, stateData[end:]...)
	return out, nil
}
