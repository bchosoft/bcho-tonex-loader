package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"go-tonex-loader/internal/device"
	"go-tonex-loader/internal/librarian"
	"go-tonex-loader/internal/preset"
	"go-tonex-loader/internal/upload"

	wruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// App es el backend Wails expuesto al frontend.
//
// Todo acceso al pedal pasa por un unico mutex (mu) para serializar lecturas y
// escrituras. El poller del footswitch mantiene el puerto COM abierto de forma
// persistente; por eso, antes de cualquier operacion que abra el puerto (leer
// snapshot, subir, asignar, color) hay que PAUSAR el poller y reanudarlo despues
// — si no, la segunda apertura del COM falla con "acceso denegado". Esta logica
// (equivalente a _run_worker en la version Python) vive en withPedal().
type App struct {
	ctx context.Context

	mu                sync.Mutex
	pollCancel        context.CancelFunc
	pollDone          chan struct{}
	pollPort          string
	pollWanted        bool
	uploadMeta        map[int]*upload.Metadata
	hideBChoOnDisplay map[int]bool
}

// NewApp crea la estructura de la app.
func NewApp() *App {
	a := &App{
		uploadMeta:        make(map[int]*upload.Metadata),
		hideBChoOnDisplay: make(map[int]bool),
	}
	a.loadDisplayPolicy()
	return a
}

// startup guarda el contexto. El drag & drop de ficheros se gestiona en el
// frontend con window.runtime.OnFileDrop (necesita registrar listeners en el
// navegador para evitar que WebView2 abra el .txp soltado).
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) shutdown(_ context.Context) {
	a.StopPolling()
}

func (a *App) progress(msg string) {
	wruntime.EventsEmit(a.ctx, "progress", msg)
}

// withPedal serializa el acceso al pedal: pausa el poller si esta activo, ejecuta
// fn (que puede abrir el puerto libremente) y reanuda el poller si el usuario lo
// quiere. Devuelve el error de fn.
func (a *App) withPedal(fn func() error) error {
	a.mu.Lock()
	defer a.mu.Unlock()

	a.pausePollLoopLocked()
	err := fn()
	a.resumePollLoopLocked()
	return err
}

// ---- Puertos --------------------------------------------------------------

// ListPorts devuelve los puertos Tonex detectados por USB.
func (a *App) ListPorts() ([]device.PortInfo, error) {
	return device.FindTonexPorts()
}

// ListAllPorts devuelve TODOS los puertos COM del sistema marcando los que se
// reconocen como Tonex por PID. Red de seguridad para cuando la enumeracion USB
// no expone el VID/PID del pedal: el usuario puede elegir cualquier COM y al
// conectar se detecta el modelo por sondeo de HELLO.
func (a *App) ListAllPorts() ([]device.PortInfo, error) {
	names, err := device.ListAllPortNames()
	if err != nil {
		return nil, err
	}
	tonex, _ := device.FindTonexPorts()
	known := make(map[string]device.PortInfo, len(tonex))
	for _, p := range tonex {
		known[strings.ToUpper(p.Name)] = p
	}
	out := make([]device.PortInfo, 0, len(names))
	for _, n := range names {
		if p, ok := known[strings.ToUpper(n)]; ok {
			out = append(out, p)
		} else {
			out = append(out, device.PortInfo{Name: n, Model: "unknown", ModelName: "COM"})
		}
	}
	return out, nil
}

// ---- Lectura --------------------------------------------------------------

// slotCountFor devuelve el numero de slots segun el modelo detectado en el puerto
// (Tonex One = 20, Tonex Pedal = 150). Si no se detecta, asume One.
func slotCountFor(port string) int {
	return device.DetectModel(port).SlotCount()
}

// Snapshot lee el estado completo del pedal y los presets. Emite eventos de carga
// progresiva ("snap-state" con el estado base y "snap-slot" por cada preset) para
// que la tabla aparezca al instante y se rellene fila a fila (clave con 150 slots).
func (a *App) Snapshot(port string) (*librarian.Snapshot, error) {
	var snap *librarian.Snapshot
	count := slotCountFor(port)
	err := a.withPedal(func() error {
		s, e := librarian.ReadSnapshot(port, count, true, a.progress,
			func(st *librarian.Snapshot) { wruntime.EventsEmit(a.ctx, "snap-state", st) },
			func(sum preset.Summary) { wruntime.EventsEmit(a.ctx, "snap-slot", a.applyDisplayPolicy(sum)) },
		)
		if s != nil {
			a.applySnapshotDisplayPolicy(s)
		}
		snap = s
		return e
	})
	return snap, err
}

// RefreshSlot relee un unico slot del pedal y devuelve su resumen actualizado.
// Permite a la GUI actualizar solo la fila cambiada (subida/color/asignacion) en
// vez de releer toda la snapshot — clave de velocidad, sobre todo en el Pedal (150).
func (a *App) RefreshSlot(slot int, port string) (*preset.Summary, error) {
	max := slotCountFor(port)
	if slot < 0 || slot >= max {
		return nil, fmt.Errorf("slot fuera de rango (0-%d)", max-1)
	}
	var out *preset.Summary
	err := a.withPedal(func() error {
		s, e := librarian.ReadPreset(slot, port, true)
		if e != nil {
			return e
		}
		applied := a.applyDisplayPolicy(*s)
		out = &applied
		return nil
	})
	return out, err
}

// QuickState lee solo el estado ligero (rapido).
func (a *App) QuickState(port string) (*librarian.QuickState, error) {
	var st *librarian.QuickState
	err := a.withPedal(func() error {
		s, e := librarian.ReadStateQuick(port)
		st = s
		return e
	})
	return st, err
}

// InspectTXP descifra un .txp y devuelve un resumen (para drag & drop / preview).
func (a *App) InspectTXP(txpPath string) (*upload.Info, error) {
	raw, err := os.ReadFile(txpPath)
	if err != nil {
		return nil, err
	}
	return upload.Inspect(raw)
}

// ---- Escritura ------------------------------------------------------------

// UploadAndAssign sube un .txp al slot indicado y opcionalmente lo asigna.
// assignTo: "", "A", "B" o "STOMP".
func (a *App) UploadAndAssign(txpPath string, slot int, assignTo, port string) (*librarian.UploadResult, error) {
	max := slotCountFor(port)
	if slot < 0 || slot >= max {
		return nil, fmt.Errorf("slot fuera de rango (0-%d)", max-1)
	}
	var res *librarian.UploadResult
	meta, _ := upload.MetadataFromTXPFile(txpPath)
	hideBCho := meta != nil && !meta.ModelNameHasBChoSuffix()
	err := a.withPedal(func() error {
		r, e := librarian.UploadTXPWorkflow(txpPath, slot, assignTo, port, a.progress)
		if e == nil {
			if meta != nil {
				a.uploadMeta[slot] = meta
			} else {
				delete(a.uploadMeta, slot)
			}
			if hideBCho {
				a.hideBChoOnDisplay[slot] = true
			} else {
				delete(a.hideBChoOnDisplay, slot)
			}
			a.saveDisplayPolicy()
			if r != nil && r.Preset != nil {
				s := a.applyDisplayPolicy(*r.Preset)
				r.Preset = &s
			}
		}
		res = r
		return e
	})
	return res, err
}

func (a *App) applyDisplayPolicy(s preset.Summary) preset.Summary {
	s.HideBCho = a.hideBChoOnDisplay[s.Index]
	return s
}

func (a *App) applySnapshotDisplayPolicy(snap *librarian.Snapshot) {
	for i := range snap.Presets {
		snap.Presets[i] = a.applyDisplayPolicy(snap.Presets[i])
	}
}

func displayPolicyPath() (string, error) {
	dir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(dir, "Tonex Loader", "display-policy.json"), nil
}

func (a *App) loadDisplayPolicy() {
	path, err := displayPolicyPath()
	if err != nil {
		return
	}
	raw, err := os.ReadFile(path)
	if err != nil {
		return
	}
	_ = json.Unmarshal(raw, &a.hideBChoOnDisplay)
}

func (a *App) saveDisplayPolicy() {
	path, err := displayPolicyPath()
	if err != nil {
		return
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return
	}
	raw, err := json.MarshalIndent(a.hideBChoOnDisplay, "", "  ")
	if err != nil {
		return
	}
	_ = os.WriteFile(path, raw, 0o644)
}

func safeTXPFilename(name string, slot int) string {
	name = strings.TrimSpace(name)
	if name == "" {
		name = fmt.Sprintf("slot-%02d", slot+1)
	}
	var b strings.Builder
	for _, r := range name {
		switch r {
		case '<', '>', ':', '"', '/', '\\', '|', '?', '*':
			b.WriteByte('_')
		default:
			if r < 32 {
				b.WriteByte('_')
			} else {
				b.WriteRune(r)
			}
		}
	}
	out := strings.TrimSpace(b.String())
	if out == "" {
		out = fmt.Sprintf("slot-%02d", slot+1)
	}
	if !strings.EqualFold(filepath.Ext(out), ".txp") {
		out += ".txp"
	}
	return out
}

// ExportTXP reconstruye un .txp desde el contenido actual de un slot y lo guarda.
// ExportTXP exporta el slot a un .txp fiel al contenido del pedal.
func (a *App) ExportTXP(slot int, port string) (string, error) {
	return a.exportTXP(slot, port, "")
}

// ExportTXPBCho exporta igual que ExportTXP pero anade " BCho" al final del nombre
// del modelo en todas sus apariciones (export firmado).
func (a *App) ExportTXPBCho(slot int, port string) (string, error) {
	return a.exportTXP(slot, port, " BCho")
}

func (a *App) exportTXP(slot int, port, modelNameSuffix string) (string, error) {
	max := slotCountFor(port)
	if slot < 0 || slot >= max {
		return "", fmt.Errorf("slot fuera de rango (0-%d)", max-1)
	}
	var data []byte
	name := fmt.Sprintf("slot-%02d", slot+1)
	err := a.withPedal(func() error {
		exported, e := librarian.ExportPresetTXP(slot, port, a.progress, modelNameSuffix, a.uploadMeta[slot])
		if e != nil {
			return e
		}
		data = exported.Data
		if exported.Info != nil && strings.TrimSpace(exported.Info.Name) != "" {
			name = exported.Info.Name
		}
		return nil
	})
	if err != nil {
		return "", err
	}

	path, err := wruntime.SaveFileDialog(a.ctx, wruntime.SaveDialogOptions{
		Title:           "Exportar preset .txp",
		DefaultFilename: safeTXPFilename(name, slot),
		Filters: []wruntime.FileFilter{
			{DisplayName: "Tonex preset (*.txp)", Pattern: "*.txp"},
			{DisplayName: "Todos los ficheros (*.*)", Pattern: "*.*"},
		},
	})
	if err != nil {
		return "", err
	}
	if path == "" {
		return "", nil
	}
	if !strings.EqualFold(filepath.Ext(path), ".txp") {
		path += ".txp"
	}
	if err := os.WriteFile(path, data, 0o644); err != nil {
		return "", err
	}
	return path, nil
}

// SetAssignment carga un preset en A, B o Stomp.
func (a *App) SetAssignment(slotName string, presetIndex int, port string) error {
	return a.withPedal(func() error {
		_, e := librarian.SetSlotAssignment(slotName, presetIndex, port, true)
		return e
	})
}

// SelectPreset cambia el preset activo del pedal al slot indicado (Tonex Pedal).
func (a *App) SelectPreset(slot int, port string) error {
	return a.withPedal(func() error {
		return librarian.SelectPreset(slot, port)
	})
}

// SetColor cambia el color RGB de un slot.
func (a *App) SetColor(presetIndex, r, g, b int, port string) error {
	return a.withPedal(func() error {
		_, e := librarian.SetPresetColor(presetIndex, preset.RGB{R: r, G: g, B: b}, port)
		return e
	})
}

// ---- Dialogos -------------------------------------------------------------

// OpenTXPDialog abre el selector de ficheros .txp (uno o varios).
func (a *App) OpenTXPDialog() ([]string, error) {
	return wruntime.OpenMultipleFilesDialog(a.ctx, wruntime.OpenDialogOptions{
		Title: "Selecciona uno o varios .txp",
		Filters: []wruntime.FileFilter{
			{DisplayName: "Tonex preset (*.txp)", Pattern: "*.txp"},
			{DisplayName: "Todos los ficheros (*.*)", Pattern: "*.*"},
		},
	})
}

// Backup guarda el contenido JSON dado en un fichero elegido por el usuario.
// Devuelve la ruta guardada.
func (a *App) Backup(jsonContent string) (string, error) {
	def := fmt.Sprintf("tonex-backup-%s.json", time.Now().Format("20060102-150405"))
	path, err := wruntime.SaveFileDialog(a.ctx, wruntime.SaveDialogOptions{
		Title:           "Guardar backup del pedal",
		DefaultFilename: def,
		Filters: []wruntime.FileFilter{
			{DisplayName: "JSON (*.json)", Pattern: "*.json"},
		},
	})
	if err != nil {
		return "", err
	}
	if path == "" {
		return "", nil // cancelado
	}
	if err := os.WriteFile(path, []byte(jsonContent), 0o644); err != nil {
		return "", err
	}
	return path, nil
}

// ---- Polling del footswitch ----------------------------------------------

// StartPolling abre una conexion persistente y emite eventos "footswitch" cada
// ~500ms con el estado actual (slot activo, asignaciones, colores).
func (a *App) StartPolling(port string) error {
	a.mu.Lock()
	defer a.mu.Unlock()
	a.pollWanted = true
	a.pollPort = port
	if a.pollCancel != nil {
		return nil // ya activo
	}
	if err := a.startPollLoopLocked(port); err != nil {
		a.pollWanted = false
		return err
	}
	wruntime.EventsEmit(a.ctx, "polling-state", true)
	return nil
}

// StopPolling detiene el polling (el usuario apaga "Live").
func (a *App) StopPolling() {
	a.mu.Lock()
	defer a.mu.Unlock()
	wanted := a.pollWanted
	a.pollWanted = false
	a.pausePollLoopLocked()
	if wanted {
		wruntime.EventsEmit(a.ctx, "polling-state", false)
	}
}

// startPollLoopLocked arranca la goroutine de polling. Requiere mu y que no haya
// ya un loop corriendo.
func (a *App) startPollLoopLocked(port string) error {
	poller, err := librarian.OpenPoller(port)
	if err != nil {
		return err
	}
	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan struct{})
	a.pollCancel = cancel
	a.pollDone = done

	go func() {
		defer close(done)
		defer poller.Close()
		// 200ms: respuesta al footswitch más ágil que la versión Python (~500ms).
		ticker := time.NewTicker(200 * time.Millisecond)
		defer ticker.Stop()
		a.pollOnce(poller) // primera lectura inmediata
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				if !a.pollOnce(poller) {
					return
				}
			}
		}
	}()
	return nil
}

// pausePollLoopLocked detiene la goroutine de polling (cerrando el puerto) pero
// conserva pollWanted, para poder reanudarla tras una operacion. Requiere mu.
func (a *App) pausePollLoopLocked() {
	if a.pollCancel == nil {
		return
	}
	a.pollCancel()
	a.pollCancel = nil
	if a.pollDone != nil {
		<-a.pollDone // esperar a que la goroutine cierre el puerto
		a.pollDone = nil
	}
}

// resumePollLoopLocked vuelve a arrancar el polling si el usuario lo quiere y no
// esta ya corriendo. Requiere mu.
func (a *App) resumePollLoopLocked() {
	if !a.pollWanted || a.pollCancel != nil {
		return
	}
	if err := a.startPollLoopLocked(a.pollPort); err != nil {
		a.pollWanted = false
		wruntime.EventsEmit(a.ctx, "polling-error", err.Error())
		wruntime.EventsEmit(a.ctx, "polling-state", false)
	}
}

// pollOnce lee y emite un evento; devuelve false si hay que parar el loop. No
// toca el estado compartido bajo mu (corre en la goroutine), solo emite eventos.
func (a *App) pollOnce(poller *librarian.Poller) bool {
	st, err := poller.Read()
	if err != nil {
		wruntime.EventsEmit(a.ctx, "polling-error", err.Error())
		wruntime.EventsEmit(a.ctx, "polling-state", false)
		return false
	}
	wruntime.EventsEmit(a.ctx, "footswitch", st)
	return true
}
