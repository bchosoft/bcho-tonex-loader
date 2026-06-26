// Package assets embebe en el binario la plantilla de subida y los setup frames
// capturados del Tonex One (capturas/frames).
package assets

import _ "embed"

// Template es la subida on-wire completa de UK100 (out_3), usada como plantilla
// de sustitucion para generar cualquier subida.
//
//go:embed frames/out_3_30367B.bin
var Template []byte

//go:embed frames/out_0_13B.bin
var setup0 []byte

//go:embed frames/out_1_17B.bin
var setup1 []byte

//go:embed frames/out_2_16B.bin
var setup2 []byte

// SetupFrames son los tres payloads de preparacion que preceden a la subida.
func SetupFrames() [][]byte {
	return [][]byte{setup0, setup1, setup2}
}
