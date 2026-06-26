package upload

import (
	"bytes"
	"crypto/md5"
	"fmt"
	"os"
	"testing"

	"go-tonex-loader/internal/preset"
)

// TestBChoFullCycle reproduce: subir un .txp -> exportar CON BCho -> volver a subir,
// y mira el nombre del modelo (wire 0x8C2) y del preset (wire 0x17) en cada paso.
func TestBChoFullCycle(t *testing.T) {
	txp, err := os.ReadFile("testdata/js_imp_king.txp")
	if err != nil {
		t.Fatalf("no js: %v", err)
	}
	tmpl, err := os.ReadFile("testdata/out_3_30367B.bin")
	if err != nil {
		t.Fatalf("no tmpl: %v", err)
	}

	// Paso 1: subir el original -> wire (slot 6/7).
	wire1, err := Build(txp, tmpl, SlotUnchanged)
	if err != nil {
		t.Fatalf("build original: %v", err)
	}
	fmt.Printf("PASO1 subida original:    NOMBRE(0x17)=%q  MODELO(0x8C2)=%q\n",
		wireStr(wire1, 0x17, 40), wireStr(wire1, 0x8C2, 40))

	// Paso 2: exportar CON BCho desde ese wire -> .txp BCho.
	bcho, err := ExportFromPayloadSuffixed(wire1, " BCho")
	if err != nil {
		t.Fatalf("export bcho: %v", err)
	}
	ptB, _ := DecryptTXP(bcho.Data)
	fmt.Printf("PASO2 .txp BCho:          preset(0x6d98)=%q  modelo(0x34ad)=%q\n",
		readStrTag(ptB, 0x6d98, 40), readStrTag(ptB, 0x34ad, 40))

	// Paso 3: volver a subir el .txp BCho -> wire (slot 8).
	wire3, err := Build(bcho.Data, tmpl, SlotUnchanged)
	if err != nil {
		t.Fatalf("rebuild: %v", err)
	}
	fmt.Printf("PASO3 subida BCho:        NOMBRE(0x17)=%q  MODELO(0x8C2)=%q\n",
		wireStr(wire3, 0x17, 40), wireStr(wire3, 0x8C2, 40))
	sum := preset.ParseUploadLike(wire3, 7)
	if sum.ToneModel != "JS Imp King V30 Lead 3 v2.0 BCho" {
		t.Fatalf("columna Modelo tras reimportar = %q, esperado con BCho", sum.ToneModel)
	}
}

func TestBuildBChoMatchesLiberatorRules(t *testing.T) {
	txp, err := os.ReadFile("testdata/js_imp_king.txp")
	if err != nil {
		t.Fatalf("no js: %v", err)
	}
	tmpl, err := os.ReadFile("testdata/out_3_30367B.bin")
	if err != nil {
		t.Fatalf("no tmpl: %v", err)
	}
	wire, err := BuildBCho(txp, tmpl, SlotUnchanged)
	if err != nil {
		t.Fatalf("BuildBCho: %v", err)
	}
	sum := preset.ParseUploadLike(wire, 0)
	if sum.ToneModel != "JS Imp King V30 Lead 3 v2.0 BCho" {
		t.Fatalf("modelo wire = %q, esperado con BCho", sum.ToneModel)
	}
	modelHash := md5.Sum(wire[wireModelOff : wireModelOff+modelLen])
	if !bytes.Equal(wire[wireGUIDOff:wireGUIDOff+16], modelHash[:]) {
		t.Fatalf("GUID wire no coincide con MD5 del modelo convertido")
	}
	if modelHash[14] != 0xBC || modelHash[15] != 0x00 {
		t.Fatalf("MD5/GUID BCho = %x, esperado final bc00", modelHash)
	}
}
