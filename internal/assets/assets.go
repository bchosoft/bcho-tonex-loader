// Package assets embebe en el binario la plantilla de subida y los setup frames
// capturados del Tonex One (capturas/frames).
package assets

import _ "embed"

// Template es la subida on-wire completa de UK100 (out_3) del Tonex One, usada
// como plantilla de sustitucion para generar cualquier subida al One.
//
//go:embed frames/out_3_30367B.bin
var Template []byte

// TemplatePedal es la subida on-wire completa capturada del Tonex Pedal (preset
// "G DRIVE", 30368 B). Mismo formato que la del One pero desplazada +1 byte (el
// campo de slot es mas ancho). Plantilla de sustitucion para subir al Pedal.
//
//go:embed frames/pedal_upload_30368B.bin
var TemplatePedal []byte

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
