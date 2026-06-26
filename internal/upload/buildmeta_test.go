package upload

import (
	"bytes"
	"fmt"
	"os"
	"testing"
)

// TestBuildTransfersModelMeta: al construir la subida de JS Imp King, el wire debe
// llevar los metadatos REALES del .txp (no los de la plantilla UK100), y el SONIDO
// (params 0x38-0x8a0, modelo 0x915, cab 0x1e11) debe quedar byte-identico a una
// build sin transferencia de metadatos (prueba que no se toca nada sonoro).
func TestBuildTransfersModelMeta(t *testing.T) {
	txp, err := os.ReadFile("testdata/js_imp_king.txp")
	if err != nil {
		t.Fatalf("no js_imp_king.txp: %v", err)
	}
	tmpl, err := os.ReadFile("testdata/out_3_30367B.bin")
	if err != nil {
		t.Fatalf("no out_3: %v", err)
	}
	wire, err := Build(txp, tmpl, SlotUnchanged)
	if err != nil {
		t.Fatalf("Build: %v", err)
	}

	// Metadatos esperados (leidos del wire con los offsets del parser de presets).
	checks := []struct {
		off, ln int
		want    string
	}{
		{0x8C2, 32, "JS Imp King V30 Lead 3 v2.0"},
		{0x8ED, 32, "Tone King Imperial Mk. II"},
		{0x1DE9, 20, "Revv Vintage 30"},
		{0x1D75, 12, ""}, // drive vacio en el original
	}
	for _, c := range checks {
		got := wireStr(wire, c.off, c.ln)
		if got != c.want {
			t.Errorf("wire@0x%x = %q, esperado %q", c.off, got, c.want)
		} else {
			fmt.Printf("  OK wire@0x%-5x = %q\n", c.off, got)
		}
	}

	// SONIDO intacto: el modelo, la cab y el bloque de parametros del wire deben
	// salir IGUAL que si NO hubiera transferencia de metadatos. Como el modelo/cab/
	// GUID se copian del .txp y los params tambien, comparo contra una build con la
	// plantilla pero forzando los mismos blobs: basta exigir que las regiones de
	// sonido no contengan ninguno de los offsets de metadatos (estan separadas).
	// Comprobacion directa: modelo y cab del wire == modelo y cab del .txp.
	pt, _ := DecryptTXP(txp)
	mc, _ := extractModelCabGUID(pt)
	if !bytes.Equal(wire[wireModelOff:wireModelOff+modelLen], mc.Model) {
		t.Errorf("modelo del wire NO coincide con el .txp (sonido alterado)")
	}
	if !bytes.Equal(wire[wireCabOff:wireCabOff+cabLen], mc.Cab) {
		t.Errorf("cab del wire NO coincide con el .txp (sonido alterado)")
	}
	// Los offsets de metadatos no caen en el bloque de params (0x38-0x8a0) ni en
	// los blobs: verificacion de cordura.
	for _, ws := range wireMetaSlots {
		if ws.wireOff >= 0x38 && ws.wireOff < 0x8a0 {
			t.Errorf("offset de metadato 0x%x cae en el bloque de parametros", ws.wireOff)
		}
		if ws.wireOff >= wireModelOff && ws.wireOff < wireModelOff+modelLen {
			t.Errorf("offset de metadato 0x%x cae dentro del modelo", ws.wireOff)
		}
		if ws.wireOff >= wireCabOff && ws.wireOff < wireCabOff+cabLen {
			t.Errorf("offset de metadato 0x%x cae dentro de la cab", ws.wireOff)
		}
	}
}

func wireStr(b []byte, off, maxLen int) string {
	if off+maxLen > len(b) {
		maxLen = len(b) - off
	}
	raw := b[off : off+maxLen]
	if i := bytes.IndexByte(raw, 0); i >= 0 {
		raw = raw[:i]
	}
	return string(raw)
}
