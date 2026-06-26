package main

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"time"
)

const usageConfigURL = "https://bcho-donations.bcho.workers.dev/config?app=ldr"

var errOfflineLimit = errors.New("OFFLINE_LIMIT")

type UsageMode struct {
	MonetizationEnabled bool `json:"monetizationEnabled"`
	DonateButton        bool `json:"donateButton"`
	Overlay             bool `json:"overlay"`
	Restrictions        bool `json:"restrictions"`
	OfflineMode         bool `json:"offlineMode"`
	ActiveLimit         int  `json:"activeLimit"`
	ImportsDone         int  `json:"importsDone"`
	ExportsDone         int  `json:"exportsDone"`
}

func onlineUsageMode() UsageMode {
	return UsageMode{}
}

func offlineUsageMode() UsageMode {
	return UsageMode{
		Restrictions: true,
		OfflineMode:  true,
		ActiveLimit:  1,
	}
}

func fetchUsageMode() (UsageMode, error) {
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(usageConfigURL)
	if err != nil {
		return offlineUsageMode(), err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return offlineUsageMode(), errors.New("config server unavailable")
	}
	body, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))

	var cfg UsageMode
	if err := json.Unmarshal(body, &cfg); err != nil {
		return offlineUsageMode(), errors.New("respuesta de configuracion no valida")
	}
	cfg.OfflineMode = false
	cfg.ActiveLimit = 0
	return cfg, nil
}

func (a *App) GetUsageMode() UsageMode {
	a.mu.Lock()
	if a.usageLoaded {
		mode := a.usageMode
		mode.ImportsDone = a.importsDone
		mode.ExportsDone = a.exportsDone
		a.mu.Unlock()
		return mode
	}
	a.mu.Unlock()

	mode, err := fetchUsageMode()
	if err != nil {
		mode = offlineUsageMode()
	}

	a.mu.Lock()
	a.usageMode = mode
	a.usageLoaded = true
	mode.ImportsDone = a.importsDone
	mode.ExportsDone = a.exportsDone
	a.mu.Unlock()
	return mode
}

func (a *App) checkOfflineImportAllowed() error {
	mode := a.GetUsageMode()
	if !mode.OfflineMode {
		return nil
	}
	a.mu.Lock()
	defer a.mu.Unlock()
	if a.importsDone >= mode.ActiveLimit {
		return errOfflineLimit
	}
	return nil
}

func (a *App) addOfflineImport() {
	mode := a.GetUsageMode()
	if !mode.OfflineMode {
		return
	}
	a.mu.Lock()
	a.importsDone++
	a.mu.Unlock()
}

func (a *App) checkOfflineExportAllowed() error {
	mode := a.GetUsageMode()
	if !mode.OfflineMode {
		return nil
	}
	a.mu.Lock()
	defer a.mu.Unlock()
	if a.exportsDone >= mode.ActiveLimit {
		return errOfflineLimit
	}
	return nil
}

func (a *App) addOfflineExport() {
	mode := a.GetUsageMode()
	if !mode.OfflineMode {
		return
	}
	a.mu.Lock()
	a.exportsDone++
	a.mu.Unlock()
}
