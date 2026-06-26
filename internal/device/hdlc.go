// Package device implementa el framing HDLC y la comunicacion serie CDC-ACM con
// los pedales Tonex. Portado de tonex_tool/hdlc.py y device.py.
package device

import "fmt"

// El Tonex habla un protocolo binario envuelto en framing HDLC-async:
//
//	0x7E [ payload ... ] [ CRC-lo CRC-hi ] 0x7E
//
//   - Flag 0x7E marca inicio/fin de trama.
//   - 0x7E y 0x7D dentro de la trama se escapan como 0x7D, (byte XOR 0x20).
//   - CRC-16/X-25 (poly reflejado 0x8408, init 0xFFFF, refin/refout, xorout
//     0xFFFF), little-endian, sobre el payload sin escapar.
const (
	flagByte   = 0x7E
	escapeByte = 0x7D
	escapeMask = 0x20
)

// CRC16X25 calcula el CRC-16/X-25 (HDLC FCS-16).
func CRC16X25(data []byte) uint16 {
	crc := uint16(0xFFFF)
	for _, b := range data {
		crc ^= uint16(b)
		for i := 0; i < 8; i++ {
			if crc&1 != 0 {
				crc = (crc >> 1) ^ 0x8408
			} else {
				crc >>= 1
			}
		}
	}
	return crc ^ 0xFFFF
}

func stuff(out []byte, b byte) []byte {
	if b == flagByte || b == escapeByte {
		return append(out, escapeByte, b^escapeMask)
	}
	return append(out, b)
}

// AddFraming envuelve un payload crudo en una trama HDLC completa lista para enviar.
func AddFraming(payload []byte) []byte {
	crc := CRC16X25(payload)
	body := append([]byte{}, payload...)
	body = append(body, byte(crc&0xFF), byte((crc>>8)&0xFF))
	out := []byte{flagByte}
	for _, b := range body {
		out = stuff(out, b)
	}
	out = append(out, flagByte)
	return out
}

// RemoveFraming valida una trama HDLC completa y devuelve el payload sin escapar
// (CRC retirado). Error en cualquier fallo estructural o de CRC.
func RemoveFraming(frame []byte) ([]byte, error) {
	if len(frame) < 4 || frame[0] != flagByte || frame[len(frame)-1] != flagByte {
		return nil, fmt.Errorf("trama invalida (faltan los flags 0x7E)")
	}
	inner := frame[1 : len(frame)-1]
	unstuffed := make([]byte, 0, len(inner))
	for i := 0; i < len(inner); i++ {
		b := inner[i]
		if b == escapeByte {
			i++
			if i >= len(inner) {
				return nil, fmt.Errorf("secuencia de escape invalida")
			}
			unstuffed = append(unstuffed, inner[i]^escapeMask)
		} else {
			unstuffed = append(unstuffed, b)
		}
	}
	if len(unstuffed) < 2 {
		return nil, fmt.Errorf("trama demasiado corta para contener el CRC")
	}
	payload := unstuffed[:len(unstuffed)-2]
	rxCRC := uint16(unstuffed[len(unstuffed)-2]) | uint16(unstuffed[len(unstuffed)-1])<<8
	calc := CRC16X25(payload)
	if rxCRC != calc {
		return nil, fmt.Errorf("CRC no coincide: recibido %#06x, calculado %#06x", rxCRC, calc)
	}
	return payload, nil
}
