package upload

import (
	"bytes"
	"os"
	"testing"

	"go-tonex-loader/internal/assets"
)

// TestBuildPedalStructure valida que la subida al Tonex Pedal se construye sobre
// la plantilla del Pedal (30368 B) con los offsets desplazados +1: el modelo, la
// cab y el GUID del .txp se copian a las posiciones correctas, los metadatos del
// modelo aparecen en el wire y siguen apareciendo 329 marcadores de parametros.
// Es la validacion OFFLINE previa a la prueba en vivo del Pedal.
func TestBuildPedalStructure(t *testing.T) {
	txp, err := os.ReadFile("testdata/js_imp_king.txp")
	if err != nil {
		t.Fatalf("no js_imp_king.txp: %v", err)
	}
	if len(assets.TemplatePedal) != 30368 {
		t.Fatalf("plantilla Pedal: %d B, esperado 30368", len(assets.TemplatePedal))
	}

	const slot = 5
	wire, err := BuildPedal(txp, assets.TemplatePedal, slot)
	if err != nil {
		t.Fatalf("BuildPedal: %v", err)
	}
	if len(wire) != len(assets.TemplatePedal) {
		t.Fatalf("longitud %d, esperado %d", len(wire), len(assets.TemplatePedal))
	}

	lay := pedalLayout()

	// Byte de slot en el offset del Pedal (15).
	if wire[lay.slotOff] != slot {
		t.Errorf("slot byte @%d = %d, esperado %d", lay.slotOff, wire[lay.slotOff], slot)
	}

	// Modelo / Cab / GUID del .txp copiados a los offsets +1 del Pedal.
	pt, _ := DecryptTXP(txp)
	mc, _ := extractModelCabGUID(pt)
	if !bytes.Equal(wire[lay.modelOff:lay.modelOff+modelLen], mc.Model) {
		t.Errorf("modelo del wire no coincide con el .txp en offset Pedal 0x%x", lay.modelOff)
	}
	if !bytes.Equal(wire[lay.cabOff:lay.cabOff+cabLen], mc.Cab) {
		t.Errorf("cab del wire no coincide con el .txp en offset Pedal 0x%x", lay.cabOff)
	}
	if !bytes.Equal(wire[lay.guidOff:lay.guidOff+16], mc.GUID) {
		t.Errorf("GUID del wire no coincide con el .txp en offset Pedal 0x%x", lay.guidOff)
	}

	// Metadatos del modelo en el wire (offsets del One +1).
	metaChecks := []struct {
		off, ln int
		want    string
	}{
		{0x8C2 + pedalShift, 32, "JS Imp King V30 Lead 3 v2.0"},
		{0x8ED + pedalShift, 32, "Tone King Imperial Mk. II"},
		{0x1DE9 + pedalShift, 20, "Revv Vintage 30"},
	}
	for _, c := range metaChecks {
		if got := wireStr(wire, c.off, c.ln); got != c.want {
			t.Errorf("wire@0x%x = %q, esperado %q", c.off, got, c.want)
		}
	}

	// Nombre del preset en el offset de nombre del Pedal (24).
	if got := wireStr(wire, lay.nameOff, 33); got != "JS Imp King V30 Lead 3 v2.0" {
		t.Errorf("nombre @%d = %q", lay.nameOff, got)
	}

	// Siguen apareciendo los 329 marcadores de parametros (base+HWA+HWB).
	if n := len(paramMarkerOffsets(wire)); n < 329 {
		t.Errorf("solo %d marcadores de parametros (se necesitan 329)", n)
	}
}
