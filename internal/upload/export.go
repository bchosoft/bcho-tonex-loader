package upload

import (
	"bytes"
	_ "embed"
	"encoding/binary"
	"fmt"
	"math"
	"os"
	"strings"

	"go-tonex-loader/internal/crypto"
)

// exportTemplateTXP es un .txp valido usado como contenedor base. ExportFromPayload
// reemplaza sus blobs, tags y parametros con los leidos del slot del pedal.
//
//go:embed testdata/original.txp
var exportTemplateTXP []byte

// ExportedTXP es el resultado de reconstruir un .txp desde un payload completo
// leido del pedal.
type ExportedTXP struct {
	Data []byte
	Info *Info
}

// Metadata conserva campos de texto del .txp original que el pedal no devuelve
// en el payload de lectura, pero que queremos preservar al re-exportar un slot que
// acaba de importarse con la app.
type Metadata struct {
	values map[int]string
}

type metadataField struct {
	off, ln int
}

var metadataFields = []metadataField{
	{txpNameOff, 33},
	{0x34ad, 33}, // Model name
	{0x34ef, 11}, // Model date
	{0x34fa, 65}, // Model author/brand
	{0x353b, 65}, // Modeler
	{0x357c, 33}, // Model character
	{0x359d, 33}, // Amp
	{0x35be, 33}, // Drive/stomp model
	{0x35df, 9},  // Pickup/model
	{0x35e8, 65}, // Model website
	{0x3629, 10}, // Cab config
	{0x3633, 33}, // Cab
	{0x3654, 17}, // Mic 1
	{0x3665, 17}, // Mic 2
	{0x3676, 33}, // Preamp
	{0x3697, 65}, // Cab description
}

// MetadataFromTXP lee metadatos ricos del .txp original para reinyectarlos al
// exportar desde el slot importado.
func MetadataFromTXP(raw []byte) (*Metadata, error) {
	pt, err := DecryptTXP(raw)
	if err != nil {
		return nil, err
	}
	m := &Metadata{values: make(map[int]string, len(metadataFields))}
	for _, f := range metadataFields {
		m.values[f.off] = readStrTag(pt, f.off, f.ln)
	}
	return m, nil
}

func MetadataFromTXPFile(path string) (*Metadata, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	return MetadataFromTXP(raw)
}

func (m *Metadata) ModelName() string {
	if m == nil {
		return ""
	}
	return m.values[txpModelNameOff]
}

func (m *Metadata) ModelNameHasBChoSuffix() bool {
	return strings.HasSuffix(strings.TrimSpace(m.ModelName()), bchoSuffix)
}

func applyMetadataOverlay(pt []byte, m *Metadata) error {
	if m == nil {
		return nil
	}
	for _, f := range metadataFields {
		if value, ok := m.values[f.off]; ok {
			if err := writeTXPCString(pt, f.off, f.ln, value); err != nil {
				return err
			}
		}
	}
	return nil
}

func payloadDelta(payload []byte) int {
	marker := bytes.Index(payload, []byte{0xbc, 0x21})
	if marker >= 0 {
		return (marker + 2) - wireNameOff
	}
	return 0
}

func checkRange(buf []byte, off, ln int, what string) error {
	if off < 0 || ln < 0 || off+ln > len(buf) {
		return fmt.Errorf("%s fuera de rango: off=0x%x len=%d total=%d", what, off, ln, len(buf))
	}
	return nil
}

func readPayloadCString(payload []byte, off, maxLen int) (string, error) {
	if err := checkRange(payload, off, maxLen, "string payload"); err != nil {
		return "", err
	}
	raw := payload[off : off+maxLen]
	if nul := indexZero(raw); nul >= 0 {
		raw = raw[:nul]
	}
	return string(raw), nil
}

func writeTXPCString(pt []byte, off, maxLen int, value string) error {
	if err := checkRange(pt, off, maxLen, "string txp"); err != nil {
		return err
	}
	for i := 0; i < maxLen; i++ {
		pt[off+i] = 0
	}
	raw := []byte(value)
	if len(raw) > maxLen-1 {
		raw = raw[:maxLen-1]
	}
	copy(pt[off:], raw)
	return nil
}

func writeGUIDToTXP(pt []byte, wireGUID []byte) error {
	return writeGUIDToTXPAt(pt, txpGUIDOff, wireGUID)
}

func payloadParamMap(payload []byte, markers []int, startIndex int, fields []string) map[string]float64 {
	out := make(map[string]float64, len(fields))
	for rel, field := range fields {
		if field == "" {
			continue
		}
		markerIdx := startIndex + rel
		if markerIdx >= len(markers) {
			continue
		}
		off := markers[markerIdx]
		if off+5 > len(payload) {
			continue
		}
		out[field] = float64(math.Float32frombits(binary.LittleEndian.Uint32(payload[off+1 : off+5])))
	}
	return out
}

func writeTXPParamBlock(pt []byte, startOffset int, fields []string, values map[string]float64) error {
	for idx, field := range fields {
		if field == "" {
			continue
		}
		value, ok := values[field]
		if !ok {
			continue
		}
		off := startOffset + idx*4
		if err := checkRange(pt, off, 4, "parametro txp"); err != nil {
			return err
		}
		if intParams[field] {
			binary.LittleEndian.PutUint32(pt[off:off+4], uint32(int32(math.Round(value))))
		} else {
			binary.LittleEndian.PutUint32(pt[off:off+4], math.Float32bits(float32(value)))
		}
	}
	return nil
}

// ikBranded indica si un valor de metadato es marca IK (autor/modeler/descripcion
// "IK Multimedia ..."). Esos campos van VACIOS en presets de usuario.
func ikBranded(v string) bool {
	return strings.Contains(strings.ToLower(v), "ik multimedia")
}

// blankIfIK vacia el valor si es marca IK; conserva creadores reales (ej. Bogren).
func blankIfIK(v string) string {
	if ikBranded(v) {
		return ""
	}
	return v
}

// readWireString lee un string NUL-terminado del payload en off (longitud maxima
// maxLen). Devuelve "" si el rango es invalido o contiene bytes no imprimibles
// (offset desalineado en este preset) => el slot destino queda vacio, nunca con
// basura ni con datos heredados de la plantilla.
func readWireString(payload []byte, off, maxLen int) string {
	if off < 0 || maxLen <= 0 || off+maxLen > len(payload) {
		return ""
	}
	raw := payload[off : off+maxLen]
	if nul := indexZero(raw); nul >= 0 {
		raw = raw[:nul]
	}
	for _, b := range raw {
		if b < 0x20 || b >= 0x7f {
			return ""
		}
	}
	return string(raw)
}

// modelMetaSlot describe un slot string del sub-bloque de metadatos del MODELO en
// el .txp descifrado y de donde sacarlo en el payload wire.
type modelMetaSlot struct {
	txpOff, txpLen int
	wireOff        int // -1 = sin origen en el wire => el slot se vacia
	ikBlank        bool
	field          string
}

// modelMetaSlots: solo los slots que la plantilla UK100 rellena (los demas ya
// salen vacios de la plantilla, sin fuga). Se reescriben con el contenido del
// slot real leido del pedal, o se vacian si no viajan en el wire / son marca IK.
// Offsets wire validados contra el parser de presets (preset.ParseUploadLike).
var modelMetaSlots = []modelMetaSlot{
	{0x34ad, 33, 0x8C2, false, "nombre-modelo"},
	{0x34ef, 11, 0x3EE6, false, "fecha-modelo"},
	{0x353b, 65, 0x3F62, false, "modeler"},
	{0x357c, 33, 0x6EC, false, "character-modelo"},
	{0x359d, 33, 0x8ED, false, "amp"},
	{0x35be, 33, 0x1D75, false, "drive"},
	{0x35df, 9, 0x1D61, false, "pickup"},
	{0x3629, 10, -1, false, "cab-config"}, // ausente en el wire => vaciar
	{0x3633, 33, 0x1DE9, false, "cab"},
	// mic1/mic2/preamp: en el wire van pegados a floats de sonido (no se pueden
	// transferir al subir sin corromper el sonido), asi que en el slot real salen
	// los de UK100. Se VACIAN para no arrastrar datos de la plantilla (acordado con
	// el usuario: vacio mejor que un valor heredado de UK100).
	{0x3654, 17, -1, false, "mic1"},
	{0x3665, 17, -1, false, "mic2"},
	{0x3676, 33, -1, false, "preamp"},
}

// txpModelNameOff es el offset del nombre del modelo en el .txp descifrado.
const txpModelNameOff = 0x34ad

// appendModelNameSuffix anade `suffix` al final del nombre del modelo en TODAS sus
// apariciones del .txp descifrado (campo de modelo 0x34ad y nombre de preset 0x6d98
// cuando coincide). Solo busca a partir de 0x34ad (tras los blobs de modelo/cab,
// que NO se tocan) y solo en campos NUL-terminados con hueco suficiente para el
// sufijo mas su terminador.
func appendModelNameSuffix(pt []byte, suffix string) {
	modelName := readStrTag(pt, txpModelNameOff, 33)
	if modelName == "" || suffix == "" {
		return
	}
	if !strings.HasSuffix(modelName, suffix) {
		suffixed := modelName + suffix
		if len([]byte(suffixed)) <= 32 {
			_ = writeTXPCString(pt, txpModelNameOff, 33, suffixed)
		}
	}
	nb := []byte(modelName)
	sb := []byte(suffix)
	for i := txpModelNameOff + 33; i+len(nb) < len(pt); i++ {
		if !bytes.Equal(pt[i:i+len(nb)], nb) {
			continue
		}
		end := i + len(nb)
		if pt[end] != 0 { // no es un campo completo NUL-terminado
			continue
		}
		zeros := 0
		for end+zeros < len(pt) && pt[end+zeros] == 0 {
			zeros++
		}
		if zeros < len(sb)+1 { // hace falta hueco para el sufijo + terminador
			continue
		}
		copy(pt[end:end+len(sb)], sb)
		i = end + len(sb) // saltar lo ya escrito
	}
}

// ExportFromPayload reconstruye un .txp desde el payload completo de un slot del
// pedal. La salida es un .txp funcional y fiel al SONIDO del slot (modelo, cabina,
// y todos los parametros base/HW A/HW B) con sus metadatos correspondientes
// (nombre, character, amp, cab, micros, etc. leidos del propio slot). NO arrastra
// marca IK: los campos de autor/modeler/descripcion "IK Multimedia ..." se vacian
// (como en un preset de usuario). El .txp no contiene nombre de coleccion (la
// coleccion es un concepto de library.db, no viaja en el fichero).
func ExportFromPayload(payload []byte) (*ExportedTXP, error) {
	return ExportFromPayloadSuffixed(payload, "")
}

// ExportFromPayloadSuffixed es como ExportFromPayload pero anade `modelNameSuffix`
// al final del nombre del modelo en todas sus apariciones (export "firmado").
func ExportFromPayloadSuffixed(payload []byte, modelNameSuffix string, overlays ...*Metadata) (*ExportedTXP, error) {
	pt, err := DecryptTXP(exportTemplateTXP)
	if err != nil {
		return nil, fmt.Errorf("plantilla .txp: %w", err)
	}
	pt = append([]byte{}, pt...)
	delta := payloadDelta(payload)

	name, err := readPayloadCString(payload, wireNameOff+delta, wireNameLen)
	if err != nil {
		return nil, err
	}
	if err := writeTXPCString(pt, txpNameOff, 33, name); err != nil {
		return nil, err
	}
	for _, tf := range tagFields {
		value, err := readPayloadCString(payload, tf.wireOff+delta, tf.maxLen)
		if err != nil {
			return nil, err
		}
		// Sin marca IK: UserName "IK Multimedia" / Description "IK Multimedia
		// Premium Preset" se vacian (un nombre de usuario real se conserva).
		if err := writeTXPCString(pt, tf.txpOff, tf.maxLen, blankIfIK(value)); err != nil {
			return nil, err
		}
	}

	if err := checkRange(payload, wireGUIDOff+delta, 16, "GUID payload"); err != nil {
		return nil, err
	}
	if err := writeGUIDToTXP(pt, payload[wireGUIDOff+delta:wireGUIDOff+delta+16]); err != nil {
		return nil, err
	}
	if err := checkRange(payload, wireModelOff+delta, modelLen, "model payload"); err != nil {
		return nil, err
	}
	if err := checkRange(payload, wireCabOff+delta, cabLen, "cab payload"); err != nil {
		return nil, err
	}
	if err := checkRange(pt, txpModelOff, modelLen, "model txp"); err != nil {
		return nil, err
	}
	if err := checkRange(pt, txpCabOff, cabLen, "cab txp"); err != nil {
		return nil, err
	}
	copy(pt[txpModelOff:txpModelOff+modelLen], payload[wireModelOff+delta:wireModelOff+delta+modelLen])
	copy(pt[txpCabOff:txpCabOff+cabLen], payload[wireCabOff+delta:wireCabOff+delta+cabLen])

	markers := paramMarkerOffsets(payload)
	if len(markers) < 329 {
		return nil, fmt.Errorf("payload: solo %d marcadores de parametros (se necesitan 329)", len(markers))
	}
	base := payloadParamMap(payload, markers, 0, paramFieldsBase)
	hwa := payloadParamMap(payload, markers, 111, paramFieldsNoBPM)
	hwb := payloadParamMap(payload, markers, 220, paramFieldsNoBPM)
	if err := writeTXPParamBlock(pt, txpParamsOff, txpParamsOrder, base); err != nil {
		return nil, err
	}
	if err := writeTXPParamBlock(pt, txpHWAOff, txpParamsOrder[1:], hwa); err != nil {
		return nil, err
	}
	if err := writeTXPParamBlock(pt, txpHWBOff, txpParamsOrder[1:], hwb); err != nil {
		return nil, err
	}

	// Bloque de metadatos del MODELO: se saca del slot real (en vez de heredar la
	// plantilla UK100) para que amp/cab/micros/nombre-modelo sean los correctos.
	// Lo que no viaja en el wire o es marca IK queda vacio (nunca datos de UK100).
	for _, ms := range modelMetaSlots {
		value := ""
		if ms.wireOff >= 0 {
			value = readWireString(payload, ms.wireOff+delta, ms.txpLen)
		}
		if ms.ikBlank {
			value = blankIfIK(value)
		}
		if err := writeTXPCString(pt, ms.txpOff, ms.txpLen, value); err != nil {
			return nil, err
		}
	}

	var overlay *Metadata
	if len(overlays) > 0 {
		overlay = overlays[0]
	}
	if err := applyMetadataOverlay(pt, overlay); err != nil {
		return nil, err
	}
	if modelNameSuffix == bchoSuffix {
		if err := applyBChoConversionToPlaintext(pt); err != nil {
			return nil, err
		}
	} else {
		appendModelNameSuffix(pt, modelNameSuffix)
	}

	enc, err := crypto.Encrypt(pt)
	if err != nil {
		return nil, err
	}
	data := []byte(crypto.EncodeBytes(enc))
	info, err := Inspect(data)
	if err != nil {
		return nil, err
	}
	return &ExportedTXP{Data: data, Info: info}, nil
}
