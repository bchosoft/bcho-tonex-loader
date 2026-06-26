package device

import (
	"bytes"
	"testing"
)

func TestCRC16X25Check(t *testing.T) {
	// Valor de comprobacion estandar de CRC-16/X-25 para "123456789".
	if got := CRC16X25([]byte("123456789")); got != 0x906E {
		t.Fatalf("CRC16X25(\"123456789\") = %#04x, esperado 0x906E", got)
	}
}

func TestFramingRoundTrip(t *testing.T) {
	cases := [][]byte{
		{},
		{0x00},
		{0x7E, 0x7D, 0x20, 0x00, 0xFF}, // fuerza escapes
		{0xB9, 0x03, 0x00, 0x82, 0x04, 0x00, 0x80, 0x0B, 0x01, 0xB9, 0x02, 0x02, 0x0B},
	}
	for _, payload := range cases {
		frame := AddFraming(payload)
		if frame[0] != flagByte || frame[len(frame)-1] != flagByte {
			t.Fatalf("trama sin flags para %x", payload)
		}
		got, err := RemoveFraming(frame)
		if err != nil {
			t.Fatalf("RemoveFraming(%x) error: %v", payload, err)
		}
		if !bytes.Equal(got, payload) {
			t.Fatalf("round-trip: got %x, want %x", got, payload)
		}
	}
}

func TestRemoveFramingBadCRC(t *testing.T) {
	frame := AddFraming([]byte{0x01, 0x02, 0x03})
	frame[2] ^= 0xFF // corromper
	if _, err := RemoveFraming(frame); err == nil {
		t.Fatal("se esperaba error de CRC")
	}
}
