// Package upload transcodifica un .txp descifrado al payload on-wire de subida,
// por sustitucion sobre la plantilla out_3 (subida valida capturada de UK100).
// Portado de gen_upload.py. La ruta principal extrae TODO del propio .txp
// (GUID + Model + Cab + nombre + tags + parametros base/HW A/HW B), sin depender
// de library.db.
package upload

import (
	"encoding/binary"
	"fmt"
	"math"
	"strings"

	"go-tonex-loader/internal/crypto"

	"github.com/google/uuid"
)

// Offsets en el .txp DESCIFRADO (fijos).
const (
	txpGUIDOff   = 0x26
	txpModelOff  = 0x61
	modelLen     = 5196
	txpCabOff    = 0x14ad
	cabLen       = 8192
	txpParamsOff = 0x6f70
	txpHWAOff    = 0x7124
	txpHWBOff    = 0x72d4
	txpNameOff   = 0x6d98
)

// Offsets en la plantilla wire del Tonex One (out_3).
const (
	wireGUIDOff  = 0x8ae
	wireModelOff = 0x915
	wireCabOff   = 0x1e11
	slotOff      = 0x0e
	wireNameOff  = 0x17
	wireNameLen  = 33
)

// pedalShift: la plantilla del Tonex Pedal es identica a la del One pero con el
// campo de slot 1 byte mas ancho (b9 04 01 00 NN vs b9 03 01 NN), asi que TODO
// desde el offset del slot en adelante esta desplazado +1. Los marcadores de
// parametros se localizan dinamicamente (paramMarkerOffsets), no se ven afectados.
const pedalShift = 1

// wireLayout son los offsets fijos de la plantilla wire, dependientes del modelo.
type wireLayout struct {
	guidOff, modelOff, cabOff, slotOff, nameOff int
	tags                                        []tagField
	metas                                       []wireMetaSlot
}

// oneLayout devuelve el layout del Tonex One (offsets tal cual).
func oneLayout() wireLayout {
	return wireLayout{
		guidOff: wireGUIDOff, modelOff: wireModelOff, cabOff: wireCabOff,
		slotOff: slotOff, nameOff: wireNameOff,
		tags: tagFields, metas: wireMetaSlots,
	}
}

// pedalLayout devuelve el layout del Tonex Pedal (One + pedalShift en todos los
// offsets wire; el byte de slot queda en 15).
func pedalLayout() wireLayout {
	tags := make([]tagField, len(tagFields))
	for i, tf := range tagFields {
		tags[i] = tf
		tags[i].wireOff += pedalShift
	}
	metas := make([]wireMetaSlot, len(wireMetaSlots))
	for i, ws := range wireMetaSlots {
		metas[i] = ws
		metas[i].wireOff += pedalShift
	}
	return wireLayout{
		guidOff: wireGUIDOff + pedalShift, modelOff: wireModelOff + pedalShift,
		cabOff: wireCabOff + pedalShift, slotOff: slotOff + pedalShift,
		nameOff: wireNameOff + pedalShift,
		tags:    tags, metas: metas,
	}
}

// SlotUnchanged indica a Build que no toque el byte de slot de la plantilla.
const SlotUnchanged = -1

type tagField struct {
	wireOff int
	maxLen  int
	txpOff  int
}

// Campos de tags: (offset wire, longitud, offset en el .txp descifrado).
var tagFields = []tagField{
	{0x6b6, 33, 0x6db9}, // Tag_UserName
	{0x6dc, 11, 0x6dda}, // Tag_Date
	{0x6ec, 33, 0x6de5}, // Tag_ModelCategory
	{0x712, 33, 0x6e06}, // Tag_Instrument
	{0x738, 33, 0x6e27}, // Tag_InstrumentType
	{0x75e, 33, 0x6e48}, // Tag_PickupPosition
	{0x784, 33, 0x6e69}, // Tag_PickupType
	{0x7aa, 33, 0x6e8a}, // Tag_Artist
	{0x7d0, 33, 0x6eab}, // Tag_Album
	{0x7f6, 33, 0x6ecc}, // Tag_Song
	{0x81c, 33, 0x6eed}, // Tag_SongPart
	{0x842, 33, 0x6f0e}, // Tag_Genre
	{0x868, 65, 0x6f2f}, // Tag_Description
}

// wireMetaSlot copia un campo de metadatos del MODELO desde el .txp descifrado al
// payload wire de subida. Sin esto, el preset subido muestra los metadatos de la
// plantilla UK100 (mismo amp/cab/modelo en todos los slots) aunque el SONIDO sea
// el correcto. wireMax es una capacidad CONSERVADORA (incl. el NUL) para no pisar
// datos contiguos del wire; el sonido (params 0x38-0x8a0, modelo 0x915, cab
// 0x1e11) esta en otros offsets y NO se toca. Espejo de upload/export.modelMetaSlots.
type wireMetaSlot struct {
	txpOff, txpLen   int
	wireOff, wireMax int
	field            string
}

var wireMetaSlots = []wireMetaSlot{
	{0x34ad, 33, 0x8C2, 33, "nombre-modelo"}, // slot wire bc21 = 33 B (32 chars + NUL)
	{0x359d, 33, 0x8ED, 32, "amp"},
	{0x35be, 33, 0x1D75, 33, "drive"},
	{0x35df, 9, 0x1D61, 7, "pickup"},
	{0x3633, 33, 0x1DE9, 21, "cab"},
	{0x34ef, 11, 0x3EE6, 11, "fecha-modelo"},
	{0x353b, 65, 0x3F62, 64, "modeler"},
}

// reverbDetailFields = Reverb{Spring1..Plate}{Time,PreDelay,Color,Mix} (24).
var reverbDetailFields = buildReverbDetail()

func buildReverbDetail() []string {
	kinds := []string{"Spring1", "Spring2", "Spring3", "Spring4", "Room", "Plate"}
	attrs := []string{"Time", "PreDelay", "Color", "Mix"}
	out := make([]string, 0, len(kinds)*len(attrs))
	for _, k := range kinds {
		for _, a := range attrs {
			out = append(out, "Reverb"+k+a)
		}
	}
	return out
}

var modFields = []string{
	"ModPost", "ModEnable", "ModModel",
	"ModChorusSync", "ModChorusTS", "ModChorusRate", "ModChorusDepth", "ModChorusLevel",
	"ModTremoloSync", "ModTremoloTS", "ModTremoloRate", "ModTremoloShape",
	"ModTremoloSpread", "ModTremoloLevel",
	"ModPhaserSync", "ModPhaserTS", "ModPhaserRate", "ModPhaserDepth", "ModPhaserLevel",
	"ModFlangerSync", "ModFlangerTS", "ModFlangerRate", "ModFlangerDepth",
	"ModFlangerFeedback", "ModFlangerLevel",
	"ModRotarySync", "ModRotaryTS", "ModRotarySpeed", "ModRotaryRadius",
	"ModRotarySpread", "ModRotaryLevel",
}

var delayFields = []string{
	"DelayPost", "DelayEnable", "DelayModel",
	"DelayDigitalSync", "DelayDigitalTS", "DelayDigitalTime", "DelayDigitalFeedback",
	"DelayDigitalMode", "DelayDigitalMix",
	"DelayTapeSync", "DelayTapeTS", "DelayTapeTime", "DelayTapeFeedback",
	"DelayTapeMode", "DelayTapeMix",
}

// paramFieldsNoBPM: orden observado en el wire (sin BPM). Los "" son campos
// constantes/desconocidos de la plantilla que no se escriben.
var paramFieldsNoBPM = buildParamFieldsNoBPM()

func buildParamFieldsNoBPM() []string {
	head := []string{
		"NoiseGatePost", "NoiseGateEnable", "NoiseGateThreshold", "NoiseGateRelease",
		"NoiseGateDepth",
		"CompPost", "CompEnable", "CompThreshold", "CompMakeUp", "CompAttack",
		"EqPost", "EqBass", "EqBassFreq", "EqMid", "EqMidQ", "EqMidFreq",
		"EqTreble", "EqTrebleFreq",
		"ModelEnable", "", "ModelGain", "ModelVolume", "ModelMix",
		"", "CabType", "VIRCabModel", "VIRCabResonance", "VIRCabMic1Model",
		"VIRCabMic1X", "VIRCabMic1Z", "VIRCabMic2Model", "VIRCabMic2X",
		"VIRCabMic2Z", "VIRCabMicBlend", "PwrAmpEqPresence", "PwrAmpEqDepth",
		"ReverbPosition", "ReverbEnable", "ReverbModel",
	}
	out := append([]string{}, head...)
	out = append(out, reverbDetailFields...)
	out = append(out, modFields...)
	out = append(out, delayFields...)
	return out
}

// paramFieldsBase = ["", "BPM"] + paramFieldsNoBPM.
var paramFieldsBase = append([]string{"", "BPM"}, paramFieldsNoBPM...)

// txpParamsOrder: orden contiguo de parametros DENTRO del .txp (distinto del wire).
var txpParamsOrder = buildTXPParamsOrder()

func buildTXPParamsOrder() []string {
	o := []string{"BPM"}
	// Model + EQ + Comp + NoiseGate (24)
	o = append(o,
		"ModelEnable", "ModelMix", "ModelGain", "ModelVolume",
		"PwrAmpEqPresence", "PwrAmpEqDepth",
		"EqPost", "EqBass", "EqBassFreq", "EqMid", "EqMidQ", "EqMidFreq", "EqTreble", "EqTrebleFreq",
		"CompPost", "CompEnable", "CompThreshold", "CompMakeUp", "CompAttack",
		"NoiseGatePost", "NoiseGateEnable", "NoiseGateThreshold", "NoiseGateRelease", "NoiseGateDepth")
	// Reverb (27)
	o = append(o, "ReverbPosition", "ReverbEnable", "ReverbModel")
	o = append(o, reverbDetailFields...)
	// Modulation (31)
	o = append(o, modFields...)
	// Delay (15)
	o = append(o, delayFields...)
	// Cabinet (11, primero relleno)
	o = append(o,
		"", // 0x70f8 relleno
		"CabType", "VIRCabModel", "VIRCabMic1Model", "VIRCabMic1X", "VIRCabMic1Z",
		"VIRCabMic2Model", "VIRCabMic2X", "VIRCabMic2Z", "VIRCabMicBlend", "VIRCabResonance")
	return o
}

// intParams: parametros que el .txp guarda como int32 (el resto float32). Al
// escribir al wire se convierten igualmente a float32.
var intParams = sset(
	"ModelEnable", "EqPost", "CompPost", "CompEnable", "NoiseGatePost", "NoiseGateEnable",
	"ModPost", "ModEnable", "ModModel", "ModChorusSync", "ModChorusTS", "ModTremoloSync",
	"ModTremoloTS", "ModPhaserSync", "ModPhaserTS", "ModFlangerSync", "ModFlangerTS",
	"ModRotarySync", "ModRotaryTS", "DelayPost", "DelayEnable", "DelayModel",
	"DelayDigitalSync", "DelayDigitalTS", "DelayDigitalMode", "DelayTapeSync", "DelayTapeTS",
	"DelayTapeMode", "ReverbPosition", "ReverbEnable", "ReverbModel", "CabType",
	"VIRCabModel", "VIRCabMic1Model", "VIRCabMic2Model")

var reverbDetailSet = sset(reverbDetailFields...)

func sset(keys ...string) map[string]bool {
	m := make(map[string]bool, len(keys))
	for _, k := range keys {
		m[k] = true
	}
	return m
}

// DecryptTXP descifra un .txp completo a su plaintext (sin padding).
func DecryptTXP(raw []byte) ([]byte, error) {
	dec, err := crypto.DecodeTXP(raw)
	if err != nil {
		return nil, err
	}
	pt, err := crypto.Decrypt(dec)
	if err != nil {
		return nil, err
	}
	return crypto.Unpad(pt), nil
}

// txpGUIDToWire convierte el GUID del .txp (4 uint32 LE) a bytes UUID del wire.
func txpGUIDToWire(raw16 []byte) ([]byte, error) {
	if len(raw16) != 16 {
		return nil, fmt.Errorf("GUID incompleto (%d bytes)", len(raw16))
	}
	out := make([]byte, 16)
	for i := 0; i < 16; i += 4 {
		out[i+0] = raw16[i+3]
		out[i+1] = raw16[i+2]
		out[i+2] = raw16[i+1]
		out[i+3] = raw16[i+0]
	}
	return out, nil
}

// GUIDString formatea 16 bytes UUID como string canonico.
func GUIDString(guid []byte) string {
	u, err := uuid.FromBytes(guid)
	if err != nil {
		return ""
	}
	return u.String()
}

// paramMarkerOffsets escanea la plantilla buscando marcadores 0x88 seguidos de un
// float32 finito y razonable. Devuelve los primeros 329 (111 base + 109 HWA + 109 HWB).
func paramMarkerOffsets(payload []byte) []int {
	offsets := make([]int, 0, 329)
	end := 0x8a0
	if end > len(payload) {
		end = len(payload)
	}
	for i := 0x38; i < end; i++ {
		if payload[i] == 0x88 && i+5 <= len(payload) {
			v := math.Float32frombits(binary.LittleEndian.Uint32(payload[i+1 : i+5]))
			v64 := float64(v)
			if !math.IsInf(v64, 0) && !math.IsNaN(v64) && v64 > -10000 && v64 < 10000 {
				offsets = append(offsets, i)
				if len(offsets) >= 329 {
					break
				}
			}
		}
	}
	return offsets
}

func writeParamFloat(payload []byte, markerOff int, value float64) {
	binary.LittleEndian.PutUint32(payload[markerOff+1:markerOff+5], math.Float32bits(float32(value)))
}

func setWireCString(payload []byte, offset, maxLen int, value string) {
	raw := []byte(value)
	if len(raw) > maxLen-1 {
		raw = raw[:maxLen-1]
	}
	copy(payload[offset:offset+len(raw)], raw)
	payload[offset+len(raw)] = 0
}

func setWireName(payload []byte, name string, nameOff int) {
	raw := []byte(name)
	if len(raw) > wireNameLen-1 {
		raw = raw[:wireNameLen-1]
	}
	for i := 0; i < wireNameLen; i++ {
		if i < len(raw) {
			payload[nameOff+i] = raw[i]
		} else {
			payload[nameOff+i] = 0
		}
	}
}

// parseTXPParamBlock lee un bloque de parametros contiguos del .txp descifrado.
func parseTXPParamBlock(pt []byte, startOffset int, fields []string) map[string]float64 {
	parsed := make(map[string]float64, len(fields))
	for idx, name := range fields {
		if name == "" {
			continue
		}
		off := startOffset + idx*4
		if off+4 > len(pt) {
			continue
		}
		raw := pt[off : off+4]
		if intParams[name] {
			parsed[name] = float64(int32(binary.LittleEndian.Uint32(raw)))
		} else {
			parsed[name] = float64(math.Float32frombits(binary.LittleEndian.Uint32(raw)))
		}
	}
	return parsed
}

// writeParamMap escribe un bloque de parametros al wire usando los marker offsets.
func writeParamMap(payload []byte, markerOffsets []int, startIndex int, fields []string, values map[string]float64) {
	reverbEnabled := values["ReverbEnable"] != 0
	for rel, field := range fields {
		if field == "" {
			continue
		}
		v, ok := values[field]
		if !ok {
			continue
		}
		// Como el editor: si la reverb esta apagada en un bloque HW, deja los
		// detalles inactivos con los defaults de la plantilla.
		if startIndex != 0 && !reverbEnabled && reverbDetailSet[field] {
			continue
		}
		writeParamFloat(payload, markerOffsets[startIndex+rel], v)
	}
}

func readStrTag(pt []byte, offset, maxLen int) string {
	if offset >= len(pt) {
		return ""
	}
	end := offset + maxLen
	if end > len(pt) {
		end = len(pt)
	}
	raw := pt[offset:end]
	if nul := indexZero(raw); nul >= 0 {
		raw = raw[:nul]
	}
	return strings.TrimSpace(string(raw))
}

func indexZero(b []byte) int {
	for i, c := range b {
		if c == 0 {
			return i
		}
	}
	return -1
}

// applyPresetFromTXP escribe nombre, tags y parametros (base/HWA/HWB) al wire
// extrayendolos del propio .txp descifrado.
func applyPresetFromTXP(payload, pt []byte, lay wireLayout) error {
	// 1. Nombre
	name := readStrTag(pt, txpNameOff, 33)
	setWireName(payload, name, lay.nameOff)

	// 2. Tags
	for _, tf := range lay.tags {
		setWireCString(payload, tf.wireOff, tf.maxLen, readStrTag(pt, tf.txpOff, tf.maxLen))
	}

	// 3. Parametros (base con BPM, HW A/B sin BPM)
	parsedBase := parseTXPParamBlock(pt, txpParamsOff, txpParamsOrder)
	parsedHWA := parseTXPParamBlock(pt, txpHWAOff, txpParamsOrder[1:])
	parsedHWB := parseTXPParamBlock(pt, txpHWBOff, txpParamsOrder[1:])

	markers := paramMarkerOffsets(payload)
	if len(markers) < 329 {
		return fmt.Errorf("plantilla: solo %d marcadores de parametros (se necesitan 329)", len(markers))
	}

	writeParamMap(payload, markers, 0, paramFieldsBase, parsedBase)
	if len(parsedHWA) == 0 {
		parsedHWA = parsedBase
	}
	if len(parsedHWB) == 0 {
		parsedHWB = parsedBase
	}
	writeParamMap(payload, markers, 111, paramFieldsNoBPM, parsedHWA)
	writeParamMap(payload, markers, 220, paramFieldsNoBPM, parsedHWB)

	// 4. Metadatos del modelo (amp/cab/nombre/drive/pickup/fecha/modeler): se
	// copian del .txp al wire para que el preset subido muestre los datos reales
	// y no los de la plantilla UK100. wireMax acota cada escritura para no pisar
	// bytes contiguos; el sonido no se ve afectado.
	for _, ws := range lay.metas {
		setWireCString(payload, ws.wireOff, ws.wireMax, readStrTag(pt, ws.txpOff, ws.txpLen))
	}
	return nil
}

// ModelCabGUID son los tres blobs grandes extraidos del .txp.
type ModelCabGUID struct {
	Model []byte
	Cab   []byte
	GUID  []byte
}

func extractModelCabGUID(pt []byte) (*ModelCabGUID, error) {
	needed := txpModelOff + modelLen
	if n := txpCabOff + cabLen; n > needed {
		needed = n
	}
	if n := txpGUIDOff + 16; n > needed {
		needed = n
	}
	if len(pt) < needed {
		return nil, fmt.Errorf("el .txp descifrado es demasiado corto (%d B, se necesitan %d B); puede estar corrupto o usar un formato no soportado", len(pt), needed)
	}
	guid, err := txpGUIDToWire(pt[txpGUIDOff : txpGUIDOff+16])
	if err != nil {
		return nil, err
	}
	mc := &ModelCabGUID{
		Model: append([]byte{}, pt[txpModelOff:txpModelOff+modelLen]...),
		Cab:   append([]byte{}, pt[txpCabOff:txpCabOff+cabLen]...),
		GUID:  guid,
	}
	return mc, nil
}

func buildFromPlaintext(pt, template []byte, slot int, lay wireLayout) ([]byte, error) {
	mc, err := extractModelCabGUID(pt)
	if err != nil {
		return nil, err
	}
	payload := append([]byte{}, template...)
	if err := applyPresetFromTXP(payload, pt, lay); err != nil {
		return nil, err
	}
	copy(payload[lay.guidOff:lay.guidOff+16], mc.GUID)
	copy(payload[lay.modelOff:lay.modelOff+modelLen], mc.Model)
	copy(payload[lay.cabOff:lay.cabOff+cabLen], mc.Cab)
	if slot != SlotUnchanged {
		payload[lay.slotOff] = byte(slot & 0xFF)
	}
	return payload, nil
}

// Build genera el payload de subida (Tonex One) desde el .txp y la plantilla.
// slot == SlotUnchanged deja el byte de slot tal cual; en otro caso lo fija. Esta
// ruta es la transcodificacion fiel del .txp original y se conserva para validacion.
func Build(txpRaw, template []byte, slot int) ([]byte, error) {
	return buildFaithful(txpRaw, template, slot, oneLayout())
}

// BuildPedal es como Build pero para la plantilla del Tonex Pedal (layout +1).
func BuildPedal(txpRaw, template []byte, slot int) ([]byte, error) {
	lay := pedalLayout()
	out, err := buildFaithful(txpRaw, template, slot, lay)
	if err != nil {
		return nil, err
	}
	if slot != SlotUnchanged {
		out = pedalSlotFixup(out, lay.slotOff, slot)
	}
	return out, nil
}

func buildFaithful(txpRaw, template []byte, slot int, lay wireLayout) ([]byte, error) {
	pt, err := DecryptTXP(txpRaw)
	if err != nil {
		return nil, err
	}
	return buildFromPlaintext(pt, template, slot, lay)
}

// pedalSlotFixup ajusta el campo de slot del Pedal para slots >=128. La plantilla
// (capturada en un slot bajo) codifica el slot como 1 byte en lay.slotOff
// (`...01 00 <slot>`). Para slots 128..255 el editor lo codifica como `80 <slot>`
// (encodeValue), un byte MAS, y la longitud declarada [6:8] sube en 1. Insertamos
// el 0x80 justo antes del byte de slot (el resto del payload se desplaza +1, que es
// exactamente lo que hace el editor) y corregimos la longitud LE de 16 bits.
func pedalSlotFixup(payload []byte, slotOff, slot int) []byte {
	if slot < 0x80 || slot > 0xFF {
		return payload // 1 byte basta (la plantilla ya lo dejo en slotOff)
	}
	out := make([]byte, 0, len(payload)+1)
	out = append(out, payload[:slotOff]...)
	out = append(out, 0x80)
	out = append(out, payload[slotOff:]...)
	// Longitud declarada en [6:8] (LE16) +1 por el byte insertado.
	ln := int(out[6]) | int(out[7])<<8
	ln++
	out[6] = byte(ln & 0xFF)
	out[7] = byte((ln >> 8) & 0xFF)
	return out
}

// BuildBCho aplica primero la misma conversion que TXP LiBeRaToR y despues
// construye el payload de subida del Tonex One. Es la ruta usada por la app para
// importar al pedal: el slot recibe el modelo con GUID/MD5 BCho y metadatos BCho.
func BuildBCho(txpRaw, template []byte, slot int) ([]byte, error) {
	return buildBChoLayout(txpRaw, template, slot, oneLayout())
}

// BuildBChoPedal es como BuildBCho pero para la plantilla del Tonex Pedal.
func BuildBChoPedal(txpRaw, template []byte, slot int) ([]byte, error) {
	lay := pedalLayout()
	out, err := buildBChoLayout(txpRaw, template, slot, lay)
	if err != nil {
		return nil, err
	}
	if slot != SlotUnchanged {
		out = pedalSlotFixup(out, lay.slotOff, slot)
	}
	return out, nil
}

func buildBChoLayout(txpRaw, template []byte, slot int, lay wireLayout) ([]byte, error) {
	pt, err := DecryptTXP(txpRaw)
	if err != nil {
		return nil, err
	}
	pt = append([]byte{}, pt...)
	if err := applyBChoConversionToPlaintext(pt); err != nil {
		return nil, err
	}
	return buildFromPlaintext(pt, template, slot, lay)
}
