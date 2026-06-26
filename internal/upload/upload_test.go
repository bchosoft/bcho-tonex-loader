package upload

import (
	"bytes"
	"crypto/md5"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// TestSelftestUK100 replica el selftest de gen_upload.py: regenerar la subida de
// UK100 desde su .txp debe coincidir EXACTAMENTE con la plantilla out_3 (0 diff).
func TestSelftestUK100(t *testing.T) {
	txp, err := os.ReadFile(filepath.Join("testdata", "original.txp"))
	if err != nil {
		t.Fatalf("no se pudo leer original.txp: %v", err)
	}
	tmpl, err := os.ReadFile(filepath.Join("testdata", "out_3_30367B.bin"))
	if err != nil {
		t.Fatalf("no se pudo leer out_3_30367B.bin: %v", err)
	}

	gen, err := Build(txp, tmpl, SlotUnchanged)
	if err != nil {
		t.Fatalf("Build fallo: %v", err)
	}
	if len(gen) != len(tmpl) {
		t.Fatalf("longitud distinta: generado %d, plantilla %d", len(gen), len(tmpl))
	}

	var diffs []int
	for i := range tmpl {
		if tmpl[i] != gen[i] {
			diffs = append(diffs, i)
		}
	}
	if len(diffs) != 0 {
		// Resumir rangos como hace el selftest Python.
		t.Errorf("selftest UK100: %d bytes distintos de %d", len(diffs), len(tmpl))
		var first []int
		if len(diffs) > 20 {
			first = diffs[:20]
		} else {
			first = diffs
		}
		t.Errorf("  primeros offsets: %#x", first)
		return
	}
	t.Logf("selftest UK100: 0 bytes distintos de %d  ✓", len(tmpl))

	// Comprobar GUID/Model/Cab.
	pt, err := DecryptTXP(txp)
	if err != nil {
		t.Fatalf("DecryptTXP fallo: %v", err)
	}
	mc, err := extractModelCabGUID(pt)
	if err != nil {
		t.Fatalf("extractModelCabGUID fallo: %v", err)
	}
	if !bytes.Equal(mc.GUID, tmpl[wireGUIDOff:wireGUIDOff+16]) {
		t.Errorf("GUID no coincide con plantilla@0x8ae")
	}
	if got := GUIDString(mc.GUID); got != "78c94b8f-fcae-3605-0291-14b407dce47e" {
		t.Errorf("GUID string = %q, esperado 78c94b8f-fcae-3605-0291-14b407dce47e", got)
	}
	if !bytes.Equal(mc.Model, tmpl[wireModelOff:wireModelOff+modelLen]) {
		t.Errorf("Model no coincide con plantilla@0x915")
	}
	if !bytes.Equal(mc.Cab, tmpl[wireCabOff:wireCabOff+cabLen]) {
		t.Errorf("Cab no coincide con plantilla@0x1e11")
	}
}

// TestBlankIfIK comprueba la regla "borrar solo si es IK": los campos de marca IK
// se vacian, pero un creador real (ej. Bogren) se conserva.
func TestBlankIfIK(t *testing.T) {
	cases := []struct {
		in, want string
	}{
		{"IK Multimedia", ""},
		{"IK Multimedia Premium Preset", ""},
		{"IK Multimedia Premium Tone Model", ""},
		{"ik multimedia premium tone model", ""},
		{"Bogren Digital Plugin BDM Bad Boy + Stomp + Modern Cab (V30)", "Bogren Digital Plugin BDM Bad Boy + Stomp + Modern Cab (V30)"},
		{"MARSHALL JCM 800 Euge Valovirta", "MARSHALL JCM 800 Euge Valovirta"},
		{"", ""},
	}
	for _, c := range cases {
		if got := blankIfIK(c.in); got != c.want {
			t.Errorf("blankIfIK(%q) = %q, esperado %q", c.in, got, c.want)
		}
	}
}

// TestExportSuffixBCho: el export firmado anade " BCho" al nombre del modelo en
// todas sus apariciones, sin alterar el sonido ni el nombre del preset (que aqui
// difiere del modelo).
func TestExportSuffixBCho(t *testing.T) {
	tmpl, err := os.ReadFile(filepath.Join("testdata", "out_3_30367B.bin"))
	if err != nil {
		t.Fatalf("no out_3: %v", err)
	}
	plain, err := ExportFromPayloadSuffixed(tmpl, "")
	if err != nil {
		t.Fatalf("export normal: %v", err)
	}
	bcho, err := ExportFromPayloadSuffixed(tmpl, " BCho")
	if err != nil {
		t.Fatalf("export BCho: %v", err)
	}
	ptPlain, _ := DecryptTXP(plain.Data)
	ptBcho, _ := DecryptTXP(bcho.Data)

	if bytes.Equal(ptPlain[txpGUIDOff:txpGUIDOff+16], ptBcho[txpGUIDOff:txpGUIDOff+16]) {
		t.Errorf("export BCho debe clonar el Tone Model con un GUID nuevo")
	}

	// GUID BCho determinista: dos exports del mismo payload deben dar el mismo GUID.
	bcho2, err := ExportFromPayloadSuffixed(tmpl, " BCho")
	if err != nil {
		t.Fatalf("export BCho 2: %v", err)
	}
	ptBcho2, _ := DecryptTXP(bcho2.Data)
	if !bytes.Equal(ptBcho[txpGUIDOff:txpGUIDOff+16], ptBcho2[txpGUIDOff:txpGUIDOff+16]) {
		t.Errorf("GUID BCho no es determinista: dos exports del mismo payload dieron GUIDs distintos")
	}

	// GUID BCho debe terminar en "bc00" (los ultimos 2 bytes del UUID wire = 0xBC 0x00).
	// El .txp guarda el GUID con word-swap, asi que hay que reconstruir el wire GUID.
	mc, _ := extractModelCabGUID(ptBcho)
	guidStr := GUIDString(mc.GUID)
	if !strings.HasSuffix(guidStr, "bc00") {
		t.Errorf("GUID BCho = %q, esperado que termine en 'bc00'", guidStr)
	}

	// Nombre del modelo (0x34ad): "Bridging The Gap" -> "Bridging The Gap BCho".
	if got := readStrTag(ptPlain, 0x34ad, 33); got != "Bridging The Gap" {
		t.Fatalf("nombre modelo base inesperado: %q", got)
	}
	if got := readStrTag(ptBcho, 0x34ad, 33); got != "Bridging The Gap BCho" {
		t.Errorf("nombre modelo con BCho = %q, esperado \"Bridging The Gap BCho\"", got)
	}
	// El nombre del PRESET aqui es "UK100" (distinto) -> no debe cambiar.
	if got := readStrTag(ptBcho, 0x6d98, 33); got != "UK100" {
		t.Errorf("nombre preset no debia cambiar: %q", got)
	}
	// Conversion LiBeRaToR: el modelo cambia solo para forzar MD5/GUID BCho.
	if bytes.Equal(ptPlain[txpModelOff:txpModelOff+modelLen], ptBcho[txpModelOff:txpModelOff+modelLen]) {
		t.Errorf("BCho debe crear una variante del modelo")
	}
	modelHash := md5.Sum(ptBcho[txpModelOff : txpModelOff+modelLen])
	if !bytes.Equal(mc.GUID, modelHash[:]) {
		t.Errorf("GUID BCho debe ser el MD5 del modelo convertido")
	}
	if !bytes.Equal(ptPlain[txpCabOff:txpCabOff+cabLen], ptBcho[txpCabOff:txpCabOff+cabLen]) {
		t.Errorf("el sufijo altero la cab")
	}
}

// TestExportFromPayloadSoundFidelity: al exportar el slot UK100 (out_3) el .txp
// resultante debe (a) conservar el SONIDO exacto -> al reconstruir la subida, el
// modelo y la cabina salen byte-identicos al payload original; (b) llevar los
// metadatos correctos del propio slot (amp/cab/nombre-modelo); (c) NO arrastrar
// nada de marca IK.
func TestExportFromPayloadSoundFidelity(t *testing.T) {
	tmpl, err := os.ReadFile(filepath.Join("testdata", "out_3_30367B.bin"))
	if err != nil {
		t.Fatalf("no se pudo leer out_3_30367B.bin: %v", err)
	}
	exported, err := ExportFromPayload(tmpl)
	if err != nil {
		t.Fatalf("ExportFromPayload fallo: %v", err)
	}
	if exported.Info == nil || exported.Info.Name != "UK100" {
		t.Fatalf("nombre del preset no preservado: %#v", exported.Info)
	}

	// (a) Sonido idéntico: reconstruir la subida desde el .txp exportado y exigir
	// modelo+cabina byte-identicos al original (los pesos del modelo y la IR).
	gen, err := Build(exported.Data, tmpl, SlotUnchanged)
	if err != nil {
		t.Fatalf("Build del .txp exportado fallo: %v", err)
	}
	if !bytes.Equal(gen[wireModelOff:wireModelOff+modelLen], tmpl[wireModelOff:wireModelOff+modelLen]) {
		t.Errorf("modelo NO idéntico tras export+rebuild (cambiaría el sonido)")
	}
	if !bytes.Equal(gen[wireCabOff:wireCabOff+cabLen], tmpl[wireCabOff:wireCabOff+cabLen]) {
		t.Errorf("cabina NO idéntica tras export+rebuild (cambiaría el sonido)")
	}

	// Descifrar el .txp exportado para inspeccionar metadatos.
	pt, err := DecryptTXP(exported.Data)
	if err != nil {
		t.Fatalf("DecryptTXP del export fallo: %v", err)
	}

	// (b) Metadatos correctos sacados del slot real.
	if got := readStrTag(pt, 0x359d, 33); got != "Marshall Super Lead HW59 100w" {
		t.Errorf("amp del modelo = %q, esperado del slot real", got)
	}
	if got := readStrTag(pt, 0x3633, 33); got != "Marshall 1960 JCM900" {
		t.Errorf("cab del modelo = %q, esperado del slot real", got)
	}
	if got := readStrTag(pt, 0x34ad, 33); got != "Bridging The Gap" {
		t.Errorf("nombre del modelo = %q, esperado del slot real", got)
	}

	// (c) El modeler premium del Tone Model se conserva; los tags IK genéricos del
	// preset siguen vacíos porque no son autoría real del usuario.
	if got := readStrTag(pt, 0x353b, 65); got != "IK Multimedia Premium Tone Model" {
		t.Errorf("modeler premium no preservado, got %q", got)
	}
	for _, c := range []struct {
		off, ln int
		what    string
	}{
		{0x6db9, 33, "UserName"},
		{0x6f2f, 65, "Description"},
	} {
		if got := readStrTag(pt, c.off, c.ln); got != "" {
			t.Errorf("%s debería ir vacío (era marca IK), got %q", c.what, got)
		}
	}
}
