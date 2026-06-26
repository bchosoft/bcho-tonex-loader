package librarian

import (
	"time"

	"go-tonex-loader/internal/device"
	"go-tonex-loader/internal/preset"
)

// Poller mantiene una conexion serie abierta para leer el estado del footswitch
// repetidamente con baja latencia (DTR delay corto, sin handshakes repetidos).
type Poller struct {
	dev *device.Device
}

// OpenPoller abre el pedal y hace el handshake una sola vez.
func OpenPoller(port string) (*Poller, error) {
	port, err := resolvePort(port)
	if err != nil {
		return nil, err
	}
	dev, err := device.Open(port, 50*time.Millisecond)
	if err != nil {
		return nil, err
	}
	if _, err := dev.HelloWithRetry(2); err != nil {
		dev.Close()
		return nil, err
	}
	return &Poller{dev: dev}, nil
}

// Read lee el estado actual (asignaciones, slot activo, colores).
func (p *Poller) Read() (*QuickState, error) {
	state, err := p.dev.RequestStateWithRetry(2)
	if err != nil {
		return nil, err
	}
	colors, _ := preset.ParseStateColors(state)
	return &QuickState{
		Assignments: preset.ParseStateAssignments(state),
		ActiveSlot:  preset.ParseActiveSlot(state),
		Colors:      colors,
	}, nil
}

// Close cierra la conexion del poller.
func (p *Poller) Close() error {
	if p.dev == nil {
		return nil
	}
	err := p.dev.Close()
	p.dev = nil
	return err
}
