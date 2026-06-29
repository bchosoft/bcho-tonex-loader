package main

import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
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

	mu                 sync.Mutex // serializa el acceso al pedal (lecturas/escrituras + poller)
	licMu              sync.Mutex // protege el estado de monetización/licencia (independiente del pedal)
	configMu           sync.Mutex
	pollCancel         context.CancelFunc
	pollDone           chan struct{}
	pollPort           string
	pollWanted         bool
	uploadMeta         map[int]*upload.Metadata
	hideBChoOnDisplay  map[int]bool
	unlocked           bool
	monetizationLoaded bool
	monetizationConfig MonetizationConfig
	importsDone        int
	exportsDone        int
	uiLang             string
}

// NewApp crea la estructura de la app.
func NewApp() *App {
	a := &App{
		uploadMeta:        make(map[int]*upload.Metadata),
		hideBChoOnDisplay: make(map[int]bool),
		uiLang:            "es",
	}
	a.loadDisplayPolicy()
	return a
}

// SetLanguage keeps backend-owned dialogs aligned with the frontend language.
func (a *App) SetLanguage(lang string) {
	a.licMu.Lock()
	defer a.licMu.Unlock()
	switch strings.ToLower(lang) {
	case "es", "en", "gl", "pt", "it", "fr", "de":
		a.uiLang = strings.ToLower(lang)
	default:
		a.uiLang = "es"
	}
}

func (a *App) uiText(es, en string, rest ...string) string {
	a.licMu.Lock()
	lang := a.uiLang
	a.licMu.Unlock()
	switch lang {
	case "en":
		return en
	case "gl":
		if len(rest) > 0 {
			return rest[0]
		}
	case "pt":
		if len(rest) > 1 {
			return rest[1]
		}
	case "it":
		if len(rest) > 2 {
			return rest[2]
		}
	case "fr":
		if len(rest) > 3 {
			return rest[3]
		}
	case "de":
		if len(rest) > 4 {
			return rest[4]
		}
	}
	return es
}

func (a *App) restoreConfirmMessage(count int, modelName string) string {
	switch a.uiText("es", "en", "gl", "pt", "it", "fr", "de") {
	case "en":
		return fmt.Sprintf("%d pedal presets will be overwritten with the backup (%s).\n\nThis cannot be undone. Continue?", count, modelName)
	case "gl":
		return fmt.Sprintf("Sobrescribiranse %d presets do pedal co backup (%s).\n\nEsta accion non se pode desfacer. Continuar?", count, modelName)
	case "pt":
		return fmt.Sprintf("%d presets do pedal serao substituidos pelo backup (%s).\n\nEsta acao nao pode ser desfeita. Continuar?", count, modelName)
	case "it":
		return fmt.Sprintf("%d preset del pedale saranno sovrascritti con il backup (%s).\n\nQuesta azione non puo essere annullata. Continuare?", count, modelName)
	case "fr":
		return fmt.Sprintf("%d presets de la pedale seront remplaces par la sauvegarde (%s).\n\nCette action est irreversible. Continuer ?", count, modelName)
	case "de":
		return fmt.Sprintf("%d Pedal-Presets werden mit dem Backup (%s) ueberschrieben.\n\nDiese Aktion kann nicht rueckgaengig gemacht werden. Fortfahren?", count, modelName)
	}
	return fmt.Sprintf("Se van a sobrescribir %d presets del pedal con el backup (%s).\n\nEsta accion no se puede deshacer. ¿Continuar?", count, modelName)
}

// startup guarda el contexto. El drag & drop de ficheros se gestiona en el
// frontend con window.runtime.OnFileDrop (necesita registrar listeners en el
// navegador para evitar que WebView2 abra el .txp soltado).
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	go func() {
		_ = a.GetMonetizationConfig()
	}()
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
		return nil, fmt.Errorf("%s (0-%d)", a.uiText("slot fuera de rango", "slot out of range", "slot fóra de rango", "slot fora do intervalo", "slot fuori intervallo", "slot hors limites", "Slot ausserhalb des Bereichs"), max-1)
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
	if err := a.checkImportAllowed(); err != nil {
		return nil, err
	}
	max := slotCountFor(port)
	if slot < 0 || slot >= max {
		return nil, fmt.Errorf("%s (0-%d)", a.uiText("slot fuera de rango", "slot out of range", "slot fóra de rango", "slot fora do intervalo", "slot fuori intervallo", "slot hors limites", "Slot ausserhalb des Bereichs"), max-1)
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
	if err == nil && res != nil && res.OK {
		a.addImport()
	}
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
	if err := a.checkExportAllowed(); err != nil {
		return "", err
	}
	max := slotCountFor(port)
	if slot < 0 || slot >= max {
		return "", fmt.Errorf("%s (0-%d)", a.uiText("slot fuera de rango", "slot out of range", "slot fóra de rango", "slot fora do intervalo", "slot fuori intervallo", "slot hors limites", "Slot ausserhalb des Bereichs"), max-1)
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
		Title:           a.uiText("Exportar preset .txp", "Export .txp preset", "Exportar preset .txp", "Exportar preset .txp", "Esporta preset .txp", "Exporter le preset .txp", ".txp-Preset exportieren"),
		DefaultFilename: safeTXPFilename(name, slot),
		Filters: []wruntime.FileFilter{
			{DisplayName: "Tonex preset (*.txp)", Pattern: "*.txp"},
			{DisplayName: a.uiText("Todos los ficheros (*.*)", "All files (*.*)", "Todos os ficheiros (*.*)", "Todos os arquivos (*.*)", "Tutti i file (*.*)", "Tous les fichiers (*.*)", "Alle Dateien (*.*)"), Pattern: "*.*"},
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
	a.addExport()
	return path, nil
}

// ExportTXPMultiResult resume el resultado de exportar varios slots a una carpeta.
type ExportTXPMultiResult struct {
	Dir      string `json:"dir"`
	Exported int    `json:"exported"`
	Total    int    `json:"total"`
	Failed   []int  `json:"failed,omitempty"`
}

// ExportTXPMulti exporta varios slots a .txp en una carpeta elegida por el usuario.
// Pide la carpeta UNA sola vez (no un dialogo "guardar como" por slot) y escribe un
// fichero por slot, prefijado con su numero de slot para garantizar orden y unicidad
// aunque dos presets compartan nombre. Si bcho=true, firma los nombres de modelo.
// Cuenta como UNA sola exportacion de cara a los limites (igual que el Backup).
func (a *App) ExportTXPMulti(slots []int, port string, bcho bool) (*ExportTXPMultiResult, error) {
	if err := a.checkExportAllowed(); err != nil {
		return nil, err
	}
	max := slotCountFor(port)
	clean := make([]int, 0, len(slots))
	seen := make(map[int]bool, len(slots))
	for _, s := range slots {
		if s < 0 || s >= max || seen[s] {
			continue
		}
		seen[s] = true
		clean = append(clean, s)
	}
	if len(clean) == 0 {
		return nil, fmt.Errorf("%s", a.uiText("no hay slots validos seleccionados", "no valid slots selected", "non hai slots validos seleccionados", "nenhum slot valido selecionado", "nessuno slot valido selezionato", "aucun slot valide selectionne", "keine gueltigen Slots ausgewaehlt"))
	}
	sort.Ints(clean)

	dir, err := wruntime.OpenDirectoryDialog(a.ctx, wruntime.OpenDialogOptions{
		Title: a.uiText("Elige la carpeta donde exportar los .txp", "Choose the folder to export the .txp files", "Escolle o cartafol onde exportar os .txp", "Escolha a pasta para exportar os .txp", "Scegli la cartella in cui esportare i .txp", "Choisissez le dossier ou exporter les .txp", "Ordner fuer den Export der .txp-Dateien waehlen"),
	})
	if err != nil {
		return nil, err
	}
	if dir == "" {
		return nil, nil // cancelado
	}

	suffix := ""
	if bcho {
		suffix = " BCho"
	}
	width := len(fmt.Sprintf("%d", max-1))
	if width < 2 {
		width = 2
	}

	res := &ExportTXPMultiResult{Dir: dir, Total: len(clean)}
	err = a.withPedal(func() error {
		for i, slot := range clean {
			wruntime.EventsEmit(a.ctx, "export-progress", map[string]int{"done": i, "total": len(clean)})
			exported, e := librarian.ExportPresetTXP(slot, port, a.progress, suffix, a.uploadMeta[slot])
			if e != nil {
				res.Failed = append(res.Failed, slot)
				continue
			}
			name := fmt.Sprintf("slot-%02d", slot+1)
			if exported.Info != nil && strings.TrimSpace(exported.Info.Name) != "" {
				name = exported.Info.Name
			}
			fname := fmt.Sprintf("%0*d - %s", width, slot, safeTXPFilename(name, slot))
			if e := os.WriteFile(filepath.Join(dir, fname), exported.Data, 0o644); e != nil {
				res.Failed = append(res.Failed, slot)
				continue
			}
			res.Exported++
		}
		wruntime.EventsEmit(a.ctx, "export-progress", map[string]int{"done": len(clean), "total": len(clean)})
		return nil
	})
	if err != nil {
		return nil, err
	}
	if res.Exported > 0 {
		a.addExport()
	}
	return res, nil
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
		Title: a.uiText("Selecciona uno o varios .txp", "Select one or more .txp files", "Selecciona un ou varios .txp", "Selecione um ou varios .txp", "Seleziona uno o piu file .txp", "Selectionnez un ou plusieurs .txp", "Eine oder mehrere .txp-Dateien auswaehlen"),
		Filters: []wruntime.FileFilter{
			{DisplayName: "Tonex preset (*.txp)", Pattern: "*.txp"},
			{DisplayName: a.uiText("Todos los ficheros (*.*)", "All files (*.*)", "Todos os ficheiros (*.*)", "Todos os arquivos (*.*)", "Tutti i file (*.*)", "Tous les fichiers (*.*)", "Alle Dateien (*.*)"), Pattern: "*.*"},
		},
	})
}

// ---- Backup / Restore -----------------------------------------------------

type backupManifestSlot struct {
	Index int         `json:"index"`
	Name  string      `json:"name"`
	File  string      `json:"file"`
	Color *preset.RGB `json:"color,omitempty"`
}

type backupManifest struct {
	App         string               `json:"app"`
	Version     int                  `json:"version"`
	CreatedAt   string               `json:"createdAt"`
	Model       string               `json:"model"`
	ModelName   string               `json:"modelName"`
	Count       int                  `json:"count"`
	Assignments preset.Assignments   `json:"assignments"`
	ActiveSlot  int                  `json:"activeSlot"`
	Slots       []backupManifestSlot `json:"slots"`
}

// BackupZip exporta TODOS los slots del pedal a .txp y los empaqueta, junto con un
// manifest.json (modelo, asignaciones A/B/Stomp y colores de LED), en un unico
// .zip restaurable con RestoreZip. Devuelve la ruta guardada ("" si se cancela).
func (a *App) BackupZip(port string) (string, error) {
	if err := a.checkExportAllowed(); err != nil {
		return "", err
	}
	var bundle *librarian.BackupBundle
	err := a.withPedal(func() error {
		b, e := librarian.BackupAll(port, a.progress, func(done, total int) {
			wruntime.EventsEmit(a.ctx, "backup-progress", map[string]int{"done": done, "total": total})
		})
		bundle = b
		return e
	})
	if err != nil {
		return "", err
	}
	if bundle == nil || len(bundle.Slots) == 0 {
		return "", fmt.Errorf("%s", a.uiText("no se pudo leer ningun slot del pedal", "could not read any pedal slot", "non se puido ler ningun slot do pedal", "nao foi possivel ler nenhum slot do pedal", "impossibile leggere alcuno slot del pedale", "impossible de lire un slot de la pedale", "kein Pedal-Slot konnte gelesen werden"))
	}

	// Construir el ZIP en memoria.
	var buf bytes.Buffer
	zw := zip.NewWriter(&buf)
	manifest := backupManifest{
		App:         "BCho TONEX Loader",
		Version:     1,
		CreatedAt:   time.Now().Format(time.RFC3339),
		Model:       bundle.Model,
		ModelName:   bundle.ModelName,
		Count:       bundle.Count,
		Assignments: bundle.Assignments,
		ActiveSlot:  bundle.ActiveSlot,
	}
	width := len(fmt.Sprintf("%d", bundle.Count-1))
	if width < 2 {
		width = 2
	}
	isOne := bundle.Model != "pedal"
	for _, s := range bundle.Slots {
		fname := fmt.Sprintf("presets/%0*d - %s", width, s.Index, safeTXPFilename(s.Name, s.Index))
		w, e := zw.Create(fname)
		if e != nil {
			_ = zw.Close()
			return "", e
		}
		if _, e := w.Write(s.Data); e != nil {
			_ = zw.Close()
			return "", e
		}
		ms := backupManifestSlot{Index: s.Index, Name: s.Name, File: fname}
		if isOne && s.Index < len(bundle.Colors) {
			c := bundle.Colors[s.Index]
			ms.Color = &c
		}
		manifest.Slots = append(manifest.Slots, ms)
	}
	mj, err := json.MarshalIndent(manifest, "", "  ")
	if err != nil {
		_ = zw.Close()
		return "", err
	}
	mw, e := zw.Create("manifest.json")
	if e != nil {
		_ = zw.Close()
		return "", e
	}
	if _, e := mw.Write(mj); e != nil {
		_ = zw.Close()
		return "", e
	}
	if e := zw.Close(); e != nil {
		return "", e
	}

	def := fmt.Sprintf("tonex-backup-%s-%s.zip", bundle.Model, time.Now().Format("20060102-150405"))
	path, err := wruntime.SaveFileDialog(a.ctx, wruntime.SaveDialogOptions{
		Title:           a.uiText("Guardar backup del pedal", "Save pedal backup", "Gardar backup do pedal", "Salvar backup do pedal", "Salva backup del pedale", "Enregistrer la sauvegarde de la pedale", "Pedal-Backup speichern"),
		DefaultFilename: def,
		Filters: []wruntime.FileFilter{
			{DisplayName: "Backup ZIP (*.zip)", Pattern: "*.zip"},
		},
	})
	if err != nil {
		return "", err
	}
	if path == "" {
		return "", nil // cancelado
	}
	if !strings.EqualFold(filepath.Ext(path), ".zip") {
		path += ".zip"
	}
	if err := os.WriteFile(path, buf.Bytes(), 0o644); err != nil {
		return "", err
	}
	a.addExport()
	return path, nil
}

// RestoreZip lee un .zip creado con BackupZip y sube cada .txp a su slot,
// reaplicando asignaciones y colores (Tonex One). Pide confirmacion antes de
// sobrescribir el pedal. Devuelve el resumen del restore (nil si se cancela).
func (a *App) RestoreZip(port string) (*librarian.RestoreReport, error) {
	if err := a.checkImportAllowed(); err != nil {
		return nil, err
	}
	path, err := wruntime.OpenFileDialog(a.ctx, wruntime.OpenDialogOptions{
		Title: a.uiText("Selecciona un backup .zip", "Select a .zip backup", "Selecciona un backup .zip", "Selecione um backup .zip", "Seleziona un backup .zip", "Selectionnez une sauvegarde .zip", ".zip-Backup auswaehlen"),
		Filters: []wruntime.FileFilter{
			{DisplayName: "Backup ZIP (*.zip)", Pattern: "*.zip"},
		},
	})
	if err != nil {
		return nil, err
	}
	if path == "" {
		return nil, nil // cancelado
	}

	zr, err := zip.OpenReader(path)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", a.uiText("no se pudo abrir el zip", "could not open zip", "non se puido abrir o zip", "nao foi possivel abrir o zip", "impossibile aprire lo zip", "impossible d'ouvrir le zip", "Zip konnte nicht geoeffnet werden"), err)
	}
	defer zr.Close()

	files := make(map[string][]byte, len(zr.File))
	var manifestRaw []byte
	for _, f := range zr.File {
		rc, e := f.Open()
		if e != nil {
			return nil, e
		}
		data, e := io.ReadAll(rc)
		rc.Close()
		if e != nil {
			return nil, e
		}
		if f.Name == "manifest.json" {
			manifestRaw = data
		} else {
			files[f.Name] = data
		}
	}
	if manifestRaw == nil {
		return nil, fmt.Errorf("%s", a.uiText("el zip no contiene manifest.json (no es un backup valido)", "the zip does not contain manifest.json (not a valid backup)", "o zip non conten manifest.json (non e un backup valido)", "o zip nao contem manifest.json (nao e um backup valido)", "lo zip non contiene manifest.json (non e un backup valido)", "le zip ne contient pas manifest.json (sauvegarde non valide)", "die Zip-Datei enthaelt keine manifest.json (kein gueltiges Backup)"))
	}
	var manifest backupManifest
	if err := json.Unmarshal(manifestRaw, &manifest); err != nil {
		return nil, fmt.Errorf("%s: %w", a.uiText("manifest.json no valido", "invalid manifest.json", "manifest.json non valido", "manifest.json invalido", "manifest.json non valido", "manifest.json non valide", "ungueltige manifest.json"), err)
	}

	entries := make([]librarian.RestoreEntry, 0, len(manifest.Slots))
	colors := make([]preset.RGB, manifest.Count)
	haveColors := false
	for _, s := range manifest.Slots {
		data, ok := files[s.File]
		if !ok {
			continue
		}
		entries = append(entries, librarian.RestoreEntry{Index: s.Index, Data: data})
		if s.Color != nil && s.Index >= 0 && s.Index < len(colors) {
			colors[s.Index] = *s.Color
			haveColors = true
		}
	}
	if len(entries) == 0 {
		return nil, fmt.Errorf("%s", a.uiText("el backup no contiene presets", "the backup does not contain presets", "o backup non conten presets", "o backup nao contem presets", "il backup non contiene preset", "la sauvegarde ne contient pas de presets", "das Backup enthaelt keine Presets"))
	}

	// Confirmacion: el restore sobrescribe el contenido del pedal.
	confirm, _ := wruntime.MessageDialog(a.ctx, wruntime.MessageDialogOptions{
		Type:          wruntime.QuestionDialog,
		Title:         a.uiText("Restaurar backup", "Restore backup", "Restaurar backup", "Restaurar backup", "Ripristina backup", "Restaurer la sauvegarde", "Backup wiederherstellen"),
		Message:       a.restoreConfirmMessage(len(entries), manifest.ModelName),
		Buttons:       []string{a.uiText("Restaurar", "Restore", "Restaurar", "Restaurar", "Ripristina", "Restaurer", "Wiederherstellen"), a.uiText("Cancelar", "Cancel", "Cancelar", "Cancelar", "Annulla", "Annuler", "Abbrechen")},
		DefaultButton: a.uiText("Cancelar", "Cancel", "Cancelar", "Cancelar", "Annulla", "Annuler", "Abbrechen"),
		CancelButton:  a.uiText("Cancelar", "Cancel", "Cancelar", "Cancelar", "Annulla", "Annuler", "Abbrechen"),
	})
	if confirm != a.uiText("Restaurar", "Restore", "Restaurar", "Restaurar", "Ripristina", "Restaurer", "Wiederherstellen") && confirm != "Yes" {
		return nil, nil // cancelado por el usuario
	}

	var colorsArg []preset.RGB
	if haveColors && manifest.Model != "pedal" {
		colorsArg = colors
	}

	var rep *librarian.RestoreReport
	err = a.withPedal(func() error {
		r, e := librarian.RestoreAll(port, manifest.Model, entries, manifest.Assignments, colorsArg, a.progress, func(done, total int) {
			wruntime.EventsEmit(a.ctx, "restore-progress", map[string]int{"done": done, "total": total})
		})
		rep = r
		return e
	})
	if err != nil {
		return nil, err
	}
	if rep != nil && rep.Uploaded > 0 {
		a.addImport()
	}
	return rep, nil
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
