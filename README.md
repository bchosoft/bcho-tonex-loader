# BCho TONEX Loader

<p align="center">
  <img src="docs/banner_es.png" alt="BCho TONEX Loader" width="640">
</p>

<p align="center">
  Carga presets <code>.txp</code> en tu <b>IK Multimedia TONEX One</b> y <b>TONEX Pedal</b> por USB — sin abrir el editor oficial.<br>
  <i>Load <code>.txp</code> presets onto your <b>IK Multimedia TONEX One</b> and <b>TONEX Pedal</b> over USB — without the official editor.</i>
</p>

<p align="center">
  <a href="../../releases"><img src="https://img.shields.io/github/v/release/bchosoft/bcho-tonex-loader?label=descarga%20%2F%20download" alt="Release"></a>
  <img src="https://img.shields.io/badge/Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-red" alt="Plataformas">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT">
</p>

[Español](#español) | [English](#english)

---

## Español

Herramienta de **código abierto** (Go + [Wails](https://wails.io)) para subir presets `.txp` a un **IK Multimedia TONEX One** o **TONEX Pedal** por USB, **detectando automáticamente** qué pedal tienes conectado y adaptando la interfaz a cada uno.

> ⚠️ **No sustituye al TONEX Editor.** No crea, edita, captura ni entrena modelos de amplificador. Su trabajo es **mover presets `.txp` al pedal, leerlos y gestionarlos** directamente por USB.

### Compatibilidad

| | **TONEX One** | **TONEX Pedal** |
|---|---|---|
| Slots / presets | 20 | 150 (50 bancos × 3) |
| Numeración en la app | 1–20 | **0–149** (igual que la pantalla del pedal) |
| Subir `.txp` | ✅ | ✅ |
| Exportar slot a `.txp` | ✅ | ✅ |
| Cambiar preset activo desde la app | — (usa A/B/Stomp) | ✅ clic en un slot |
| Reflejar en la app el footswitch del pedal | ✅ (A/B/Stomp activo) | ✅ (preset activo en vivo) |
| Asignar slots a A / B / Stomp | ✅ | — (el Pedal usa bancos) |
| Color del LED por slot | ✅ | — |

La app detecta el modelo por USB. Si por lo que sea no lo reconoce, puedes **elegir el puerto COM a mano** y la conexión identifica el pedal al conectar.

### Funciones

- **Detección automática** del modelo (One / Pedal) y UI adaptada a cada uno.
- **Leer** todos los presets del pedal en vivo (nombre, character, ampli, pantalla, efectos).
- **Subir** cualquier `.txp` a cualquier slot: arrastrándolo a la ventana, con **Abrir .txp**, o clic derecho en un slot → *Subir aquí*. Si sueltas varios, se cargan en slots consecutivos.
- **Exportar** un slot del pedal de vuelta a `.txp` (fiel, o con firma BCho).
- **Cambio de preset bidireccional** (TONEX Pedal): clic en un slot → el pedal cambia a ese preset; y al pisar el footswitch del pedal, la app resalta el preset activo al instante.
- **Asignar** un slot a A / B / Stomp y **cambiar el color del LED** (solo TONEX One).
- **Backup y Restore completos**: **Backup** exporta todos los slots a un único `.zip` (un `.txp` por slot + un `manifest.json` con asignaciones A/B/Stomp y colores de LED), y **Restaurar** vuelve a cargar ese `.zip` en el pedal. Ideal para migrar a otro pedal, recuperar tras un reset o clonar una configuración.
- Recarga **solo el slot cambiado** tras una subida (rápido, sobre todo con 150 presets).
- Interfaz en **español / inglés** con selector de idioma.

### Descarga

Ve a la pestaña [Releases](../../releases) y descarga el ejecutable de tu sistema:

- **Windows**: `BCho-TONEX-Loader-windows-amd64.exe`
- **macOS**: `BCho-TONEX-Loader-macos-intel.zip` (Intel) · `BCho-TONEX-Loader-macos-apple-silicon.zip` (Apple Silicon)
- **Linux**: `BCho-TONEX-Loader-linux-amd64`

### Windows: aviso de SmartScreen ("Windows protegió tu PC")

Al abrir el `.exe` por primera vez es normal que aparezca una pantalla azul de
**Windows SmartScreen** diciendo *"Windows protegió tu PC"* / *editor desconocido*.

**No es un virus.** Ocurre porque la aplicación **no está firmada digitalmente** (un
certificado de firma cuesta dinero) y, al ser un binario nuevo, todavía no tiene
"reputación" en Windows. El proyecto es de código abierto: puedes revisar el código o
[compilarlo tú mismo](#compilar-desde-el-código-fuente).

Para ejecutarla igualmente:

1. En el aviso azul, pulsa **Más información**.
2. Pulsa **Ejecutar de todas formas**.

(Solo hace falta hacerlo la primera vez.) Si tu navegador bloquea la descarga, elige
**Conservar / Mantener**.

### Uso básico

1. Conecta el pedal (TONEX One o TONEX Pedal) por USB.
2. **Cierra el TONEX Editor** si está abierto (solo un programa puede usar el puerto a la vez).
3. Abre la aplicación: detecta el pedal y lee sus presets.
4. Arrastra un `.txp` a la ventana — o pulsa **Abrir .txp** — y elige el slot de destino.
5. **TONEX Pedal**: haz clic en un slot para que el pedal cambie a ese preset. **TONEX One**: carga el slot en A/B/Stomp para oírlo.

### Compilar desde el código fuente

Requisitos: [Go](https://go.dev) 1.25+, [Node.js](https://nodejs.org) 18+, [Wails v2](https://wails.io/docs/gettingstarted/installation).

```bash
git clone https://github.com/bchosoft/bcho-tonex-loader.git
cd bcho-tonex-loader
go test ./...
wails build
```

El ejecutable queda en `build/bin/`.

### Estructura del proyecto

- `app.go` — backend Wails expuesto al frontend; serializa el acceso al pedal y expone leer/subir/exportar/seleccionar.
- `main.go` — arranque de la app Wails.
- `internal/device` — comunicación serie/USB; detección de modelo y protocolo por pedal.
- `internal/librarian` — workflows de alto nivel: snapshot, subida, exportación, asignación, color, selección y polling.
- `internal/upload` — parser/conversor entre `.txp` y el payload en el cable (One y Pedal).
- `internal/preset` — parseo de presets/estado y codificación de comandos.
- `internal/assets` — plantillas de subida embebidas (One y Pedal).
- `frontend/` — interfaz de usuario (HTML/CSS/JS vanilla).

### Apoya el proyecto

Si te resulta útil, puedes invitarme a un café: **[ko-fi.com/bchosoft](https://ko-fi.com/bchosoft)** ☕

### Licencia

[MIT](LICENSE) — software libre, úsalo, modifícalo y redistribúyelo como quieras.

Este proyecto no está afiliado ni respaldado por IK Multimedia. "TONEX" es marca de IK Multimedia. Úsalo bajo tu responsabilidad.

---

## English

<p align="center">
  <img src="docs/banner_en.png" alt="BCho TONEX Loader" width="640">
</p>

**Open-source** tool (Go + [Wails](https://wails.io)) to upload `.txp` presets to an **IK Multimedia TONEX One** or **TONEX Pedal** over USB. It **auto-detects** which pedal is connected and adapts the UI to each one.

> ⚠️ **It is not a replacement for the TONEX Editor.** It does not create, edit, capture or train amp models. Its job is to **move `.txp` presets to the pedal, read them and manage them** directly over USB.

### Compatibility

| | **TONEX One** | **TONEX Pedal** |
|---|---|---|
| Slots / presets | 20 | 150 (50 banks × 3) |
| Numbering in the app | 1–20 | **0–149** (matches the pedal screen) |
| Upload `.txp` | ✅ | ✅ |
| Export slot to `.txp` | ✅ | ✅ |
| Change active preset from the app | — (uses A/B/Stomp) | ✅ click a slot |
| Reflect the pedal's footswitch in the app | ✅ (active A/B/Stomp) | ✅ (live active preset) |
| Assign slots to A / B / Stomp | ✅ | — (the Pedal uses banks) |
| Per-slot LED colour | ✅ | — |

The app detects the model over USB. If it can't, you can **pick the COM port manually** and the connection identifies the pedal on connect.

### Features

- **Auto-detect** the model (One / Pedal) with a UI tailored to each.
- **Read** all pedal presets live (name, character, amp, cab, effects).
- **Upload** any `.txp` to any slot: drag onto the window, use **Open .txp**, or right-click a slot → *Upload here*. Drop several and they fill consecutive slots.
- **Export** a pedal slot back to `.txp` (faithful, or with BCho signature).
- **Bidirectional preset switching** (TONEX Pedal): click a slot → the pedal jumps to it; press the pedal's footswitch → the app highlights the active preset instantly.
- **Assign** a slot to A / B / Stomp and **change the LED colour** (TONEX One only).
- **Full Backup & Restore**: **Backup** exports every slot to a single `.zip` (one `.txp` per slot + a `manifest.json` with A/B/Stomp assignments and LED colours), and **Restore** loads that `.zip` back onto the pedal. Ideal for migrating to another pedal, recovering after a reset or cloning a setup.
- Refreshes **only the changed slot** after an upload (fast, especially with 150 presets).
- **Spanish / English** UI with a language switcher.

### Download

Check the [Releases](../../releases) tab for your platform's build:

- **Windows**: `BCho-TONEX-Loader-windows-amd64.exe`
- **macOS**: `BCho-TONEX-Loader-macos-intel.zip` (Intel) · `BCho-TONEX-Loader-macos-apple-silicon.zip` (Apple Silicon)
- **Linux**: `BCho-TONEX-Loader-linux-amd64`

### Windows: SmartScreen warning ("Windows protected your PC")

The first time you open the `.exe`, Windows **SmartScreen** may show a blue
*"Windows protected your PC"* / *unknown publisher* screen.

**It is not a virus.** It happens because the app is **not code-signed** (a signing
certificate costs money) and, being a brand-new binary, it has no "reputation" with
Windows yet. The project is open source: you can review the code or
[build it yourself](#build-from-source).

To run it anyway:

1. On the blue dialog, click **More info**.
2. Click **Run anyway**.

(You only need to do this once.) If your browser blocks the download, choose **Keep**.

### Basic usage

1. Connect the pedal (TONEX One or TONEX Pedal) over USB.
2. **Close the TONEX Editor** if it's open (only one program can hold the port at a time).
3. Open the app: it detects the pedal and reads its presets.
4. Drag a `.txp` onto the window — or click **Open .txp** — and pick the target slot.
5. **TONEX Pedal**: click a slot to make the pedal switch to it. **TONEX One**: load the slot into A/B/Stomp to hear it.

### Build from source

Requirements: [Go](https://go.dev) 1.25+, [Node.js](https://nodejs.org) 18+, [Wails v2](https://wails.io/docs/gettingstarted/installation).

```bash
git clone https://github.com/bchosoft/bcho-tonex-loader.git
cd bcho-tonex-loader
go test ./...
wails build
```

The binary will be in `build/bin/`.

### Project layout

- `app.go` — Wails backend exposed to the frontend; serializes pedal access and exposes read/upload/export/select.
- `main.go` — Wails app entry point.
- `internal/device` — serial/USB communication; per-pedal model and protocol detection.
- `internal/librarian` — high-level workflows: snapshot, upload, export, assignment, colour, select and polling.
- `internal/upload` — parser/converter between `.txp` and the on-wire payload (One and Pedal).
- `internal/preset` — preset/state parsing and command encoding.
- `internal/assets` — embedded upload templates (One and Pedal).
- `frontend/` — UI (vanilla HTML/CSS/JS).

### Support the project

If you find it useful, you can buy me a coffee: **[ko-fi.com/bchosoft](https://ko-fi.com/bchosoft)** ☕

### License

[MIT](LICENSE) — free software, use it, modify it, redistribute it as you like.

This project is not affiliated with or endorsed by IK Multimedia. "TONEX" is a trademark of IK Multimedia. Use it at your own risk.
