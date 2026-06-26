// Package preset parsea presets/slots y el estado del Tonex One a partir de los
// payloads del protocolo. Portado de tonex_tool/presets.py.
package preset

import (
	"bytes"
	"encoding/binary"
	"math"
	"regexp"
	"strconv"
	"strings"
)

// Summary resume los campos visibles de un preset.
type Summary struct {
	Index     int    `json:"index"`
	Name      string `json:"name"`
	Character string `json:"character"`
	ToneModel string `json:"toneModel"`
	Stomp     string `json:"stomp"`
	Amp       string `json:"amp"`
	Cab       string `json:"cab"`
	GateFX    string `json:"gateFx"`
	CompFX    string `json:"compFx"`
	ModFX     string `json:"modFx"`
	DelayFX   string `json:"delayFx"`
	ReverbFX  string `json:"reverbFx"`
	Assigned  string `json:"assigned"`
	HideBCho  bool   `json:"hideBCho,omitempty"`
}

var requestPresetTemplate = []byte{
	0xb9, 0x03, 0x81, 0x00, 0x03, 0x82, 0x06, 0x00, 0x80, 0x0b, 0x03, 0xb9, 0x04, 0x0b, 0x01, 0x00, 0x00,
}

var fxParamIndices = map[string]int{
	"NoiseGateEnable": 3,
	"CompEnable":      8,
	"ReverbEnable":    39,
	"ReverbModel":     40,
	"ModEnable":       66,
	"ModModel":        67,
	"DelayEnable":     97,
	"DelayModel":      98,
}

var reverbModels = map[int]string{0: "Spring 1", 1: "Spring 2", 2: "Spring 3", 3: "Spring 4", 4: "Room", 5: "Plate"}
var modModels = map[int]string{0: "Chorus", 1: "Tremolo", 2: "Phaser", 3: "Flanger", 4: "Rotary"}
var delayModels = map[int]string{0: "Digital", 1: "Tape"}

var dateRe = regexp.MustCompile(`^\d{4}-\d{2}-\d{2}$`)

// RequestPresetPayload construye el mensaje para pedir el preset `index`.
// fullDetails: 0 = resumen corto, 1 = preset completo.
func RequestPresetPayload(index, fullDetails int) []byte {
	req := append([]byte{}, requestPresetTemplate...)
	req[15] = byte(index & 0xFF)
	req[16] = byte(fullDetails & 0x01)
	return req
}

func firstStringAt(payload []byte, offset, maxLen int) string {
	if offset < 0 || offset >= len(payload) {
		return ""
	}
	end := offset + maxLen
	if end > len(payload) {
		end = len(payload)
	}
	raw := payload[offset:end]
	if nul := indexZero(raw); nul >= 0 {
		raw = raw[:nul]
	}
	if len(raw) == 0 {
		return ""
	}
	for _, b := range raw {
		if b < 32 || b >= 127 {
			return ""
		}
	}
	return string(raw)
}

func indexZero(b []byte) int {
	for i, c := range b {
		if c == 0 {
			return i
		}
	}
	return -1
}

func payloadOffsetDelta(payload []byte) int {
	marker := indexOf(payload, []byte{0xbc, 0x21})
	if marker >= 0 {
		return (marker + 2) - 0x17
	}
	return 0
}

func indexOf(haystack, needle []byte) int {
	return bytes.Index(haystack, needle)
}

func paramMarkerOffsets(payload []byte) []int {
	offsets := make([]int, 0, 329)
	end := 0x8a0
	if end > len(payload) {
		end = len(payload)
	}
	for i := 0x30; i < end; i++ {
		if payload[i] == 0x88 && i+5 <= len(payload) {
			v := float64(math.Float32frombits(binary.LittleEndian.Uint32(payload[i+1 : i+5])))
			if !math.IsInf(v, 0) && !math.IsNaN(v) && v > -10000 && v < 10000 {
				offsets = append(offsets, i)
				if len(offsets) >= 329 {
					break
				}
			}
		}
	}
	return offsets
}

func paramValue(payload []byte, markers []int, index int) (float64, bool) {
	if index >= len(markers) {
		return 0, false
	}
	off := markers[index]
	if off+5 > len(payload) {
		return 0, false
	}
	return float64(math.Float32frombits(binary.LittleEndian.Uint32(payload[off+1 : off+5]))), true
}

func enabled(v float64, ok bool) bool {
	return ok && math.Round(v) != 0
}

func modelLabel(v float64, ok bool, labels map[int]string) string {
	if !ok {
		return ""
	}
	m := int(math.Round(v))
	if l, found := labels[m]; found {
		return l
	}
	return "Model " + strconv.Itoa(m)
}

func parseFXSummary(payload []byte, s *Summary) {
	markers := paramMarkerOffsets(payload)
	if len(markers) < 111 {
		return
	}
	gv, gok := paramValue(payload, markers, fxParamIndices["NoiseGateEnable"])
	cv, cok := paramValue(payload, markers, fxParamIndices["CompEnable"])
	rv, rok := paramValue(payload, markers, fxParamIndices["ReverbEnable"])
	mv, mok := paramValue(payload, markers, fxParamIndices["ModEnable"])
	dv, dok := paramValue(payload, markers, fxParamIndices["DelayEnable"])

	s.GateFX = onOff(enabled(gv, gok))
	s.CompFX = onOff(enabled(cv, cok))
	if enabled(rv, rok) {
		rm, rmok := paramValue(payload, markers, fxParamIndices["ReverbModel"])
		s.ReverbFX = "On " + modelLabel(rm, rmok, reverbModels)
	} else {
		s.ReverbFX = "Off"
	}
	if enabled(mv, mok) {
		mm, mmok := paramValue(payload, markers, fxParamIndices["ModModel"])
		s.ModFX = "On " + modelLabel(mm, mmok, modModels)
	} else {
		s.ModFX = "Off"
	}
	if enabled(dv, dok) {
		dm, dmok := paramValue(payload, markers, fxParamIndices["DelayModel"])
		s.DelayFX = "On " + modelLabel(dm, dmok, delayModels)
	} else {
		s.DelayFX = "Off"
	}
}

func onOff(b bool) string {
	if b {
		return "On"
	}
	return "Off"
}

// extractBCStrings extrae strings "b9 02 bc <len8> <data>" imprimibles.
func extractBCStrings(payload []byte) []string {
	var out []string
	i := 0
	for i < len(payload)-4 {
		if payload[i] == 0xb9 && payload[i+1] == 0x02 && payload[i+2] == 0xbc {
			ln := int(payload[i+3])
			start := i + 4
			end := start + ln
			if ln > 0 && ln <= 0x80 && end <= len(payload) {
				raw := payload[start:end]
				if nul := indexZero(raw); nul >= 0 {
					raw = raw[:nul]
				}
				if len(raw) > 0 && allPrintable(raw) {
					out = append(out, string(raw))
				}
				i = end
				continue
			}
		}
		i++
	}
	return out
}

func allPrintable(b []byte) bool {
	for _, c := range b {
		if c < 32 || c >= 127 {
			return false
		}
	}
	return true
}

// ParseUploadLike resume un payload tipo preset upload/response.
func ParseUploadLike(payload []byte, index int) Summary {
	s := Summary{Index: index}
	delta := payloadOffsetDelta(payload)

	s.Name = firstStringAt(payload, 0x17+delta, 33)
	s.Character = strings.Title(strings.ToLower(firstStringAt(payload, 0x6EC+delta, 33)))
	s.ToneModel = firstStringAt(payload, 0x8C2+delta, 33)
	s.Stomp = firstStringAt(payload, 0x1D75+delta, 33)
	s.Amp = firstStringAt(payload, 0x8ED+delta, 33)
	s.Cab = firstStringAt(payload, 0x1DE9+delta, 33)
	parseFXSummary(payload, &s)

	if s.Name != "" && s.Character != "" {
		return s
	}

	strs := extractBCStrings(payload)
	if len(strs) > 0 {
		s.Name = strs[0]
	}
	characterSet := map[string]bool{
		"CLEAN": true, "DRIVE": true, "HI-GAIN": true,
		"STOMP - DISTORTION": true, "STOMP - FUZZ": true,
	}
	for _, v := range strs {
		if characterSet[strings.ToUpper(v)] {
			s.Character = strings.Title(strings.ToLower(v))
			break
		}
	}
	for _, v := range strs {
		if v != s.Name && v != s.Character && v != "IK Multimedia" && v != "None" {
			if !dateRe.MatchString(v) {
				s.ToneModel = v
				break
			}
		}
	}
	return s
}
