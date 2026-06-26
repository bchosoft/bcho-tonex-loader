package upload

import (
	"crypto/md5"
	"fmt"

	"go-tonex-loader/internal/crypto"
)

const (
	txpPresetGUIDOff = 0x09
	txpUserGenOff    = 0x36
	txpIKGenOff      = 0x3a
	bchoSuffix       = " BCho"
)

// applyBChoConversionToPlaintext replica la conversion de TXP LiBeRaToR:
// marca el Tone Model como usuario, fuerza una variante de los pesos cuyo MD5
// acaba en bc00, usa ese MD5 como GUID del modelo, genera un GUID de preset
// derivado y anade el sufijo BCho al nombre del modelo.
func applyBChoConversionToPlaintext(pt []byte) error {
	if err := checkRange(pt, txpPresetGUIDOff, 16, "GUID preset txp"); err != nil {
		return err
	}
	if err := checkRange(pt, txpGUIDOff, 16, "GUID modelo txp"); err != nil {
		return err
	}
	if err := checkRange(pt, txpUserGenOff, 4, "flag user generated txp"); err != nil {
		return err
	}
	if err := checkRange(pt, txpIKGenOff, 1, "flag IK generated txp"); err != nil {
		return err
	}
	if err := checkRange(pt, txpModelOff, modelLen, "modelo txp"); err != nil {
		return err
	}

	pt[txpUserGenOff+0] = 1
	pt[txpUserGenOff+1] = 0
	pt[txpUserGenOff+2] = 0
	pt[txpUserGenOff+3] = 0
	pt[txpIKGenOff] = 0

	modelBytes := pt[txpModelOff : txpModelOff+modelLen]
	var modelMD5 [16]byte
	found := false
	for i := uint32(0); i < 1<<24; i++ {
		modelBytes[modelLen-4] = byte(i)
		modelBytes[modelLen-3] = byte(i >> 8)
		modelBytes[modelLen-2] = byte(i >> 16)
		modelBytes[modelLen-1] = byte(i >> 24)

		modelMD5 = md5.Sum(modelBytes)
		if modelMD5[14] == 0xBC && modelMD5[15] == 0x00 {
			found = true
			break
		}
	}
	if !found {
		return fmt.Errorf("no se encontro variante BCho del modelo con MD5 terminado en bc00")
	}

	origPresetGUID, err := txpGUIDToWire(pt[txpPresetGUIDOff : txpPresetGUIDOff+16])
	if err != nil {
		return err
	}
	if err := writeGUIDToTXP(pt, modelMD5[:]); err != nil {
		return err
	}

	hPreset := md5.New()
	hPreset.Write(origPresetGUID)
	hPreset.Write(modelMD5[:])
	hPreset.Write([]byte("BCHO_PRESET"))
	newPresetGUID := hPreset.Sum(nil)
	if err := writeGUIDToTXPAt(pt, txpPresetGUIDOff, newPresetGUID); err != nil {
		return err
	}

	appendModelNameSuffix(pt, bchoSuffix)
	return nil
}

func writeGUIDToTXPAt(pt []byte, off int, wireGUID []byte) error {
	if len(wireGUID) != 16 {
		return fmt.Errorf("GUID wire incompleto (%d bytes)", len(wireGUID))
	}
	if err := checkRange(pt, off, 16, "GUID txp"); err != nil {
		return err
	}
	for i := 0; i < 16; i += 4 {
		pt[off+i+0] = wireGUID[i+3]
		pt[off+i+1] = wireGUID[i+2]
		pt[off+i+2] = wireGUID[i+1]
		pt[off+i+3] = wireGUID[i+0]
	}
	return nil
}

// ConvertTXPBCho devuelve un .txp convertido con exactamente la misma regla que
// TXP LiBeRaToR. Es util para pruebas y para cualquier flujo que necesite un
// fichero BCho completo, no solo el payload de subida.
func ConvertTXPBCho(raw []byte) ([]byte, error) {
	pt, err := DecryptTXP(raw)
	if err != nil {
		return nil, err
	}
	pt = append([]byte{}, pt...)
	if err := applyBChoConversionToPlaintext(pt); err != nil {
		return nil, err
	}
	enc, err := crypto.Encrypt(pt)
	if err != nil {
		return nil, err
	}
	return []byte(crypto.EncodeBytes(enc)), nil
}
