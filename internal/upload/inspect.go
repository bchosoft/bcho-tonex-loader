package upload

import "strings"

// Info es un resumen ligero de un .txp para la GUI (drag & drop, preview).
type Info struct {
	Name      string `json:"name"`
	Character string `json:"character"`
	Artist    string `json:"artist"`
	GUID      string `json:"guid"`
}

// Inspect descifra un .txp y extrae nombre, character, artista y GUID sin
// generar el payload completo.
func Inspect(raw []byte) (*Info, error) {
	pt, err := DecryptTXP(raw)
	if err != nil {
		return nil, err
	}
	mc, err := extractModelCabGUID(pt)
	if err != nil {
		return nil, err
	}
	info := &Info{
		Name:      readStrTag(pt, txpNameOff, 33),
		Character: strings.Title(strings.ToLower(readStrTag(pt, 0x6de5, 33))),
		Artist:    readStrTag(pt, 0x6e8a, 33),
		GUID:      GUIDString(mc.GUID),
	}
	return info, nil
}
