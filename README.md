# BCho TONEX Loader

[Español](#español) | [English](#english)

---

## Español

Herramienta de código abierto (Go + [Wails](https://wails.io)) para subir presets `.txp` a un **IK Multimedia TONEX One / TONEX Pedal** por USB, sin necesidad de abrir el software oficial TONEX Editor.

No es un sustituto del TONEX Editor: no edita modelos ni amplificadores, solo permite **mover presets `.txp` al pedal y leer su estado** directamente.

### Funciones

- Leer los 20 slots del pedal (nombre, ampli, modelo, asignaciones A/B/Stomp).
- Subir un `.txp` arrastrándolo a un slot.
- Asignar slots a los footswitches A/B/Stomp.
- Cambiar el color del LED de cada slot.
- Hacer backup de un slot.
- Exportar un slot del pedal de vuelta a `.txp` (fiel o con firma BCho).
- Sondeo en vivo del footswitch activo.
- Interfaz en español/inglés con selector de idioma.

### Descarga

Ve a la pestaña [Releases](../../releases) y descarga el instalador/ejecutable de tu sistema:

- **Windows**: `BCho-TONEX-Loader-windows-amd64.exe`
- **macOS**: `BCho-TONEX-Loader-macos-*.zip` (Intel y Apple Silicon)
- **Linux**: `BCho-TONEX-Loader-linux-amd64`

### Uso básico

1. Conecta el pedal por USB.
2. Cierra TONEX Editor si está abierto (solo un programa puede usar el puerto serie a la vez).
3. Abre la aplicación.
4. Pulsa refrescar para leer el pedal y elige el slot de destino.
5. Arrastra o abre un archivo `.txp` para subirlo.

### Build desde el código fuente

Requisitos: [Go](https://go.dev) 1.25+, [Node.js](https://nodejs.org) 18+, [Wails v2](https://wails.io/docs/gettingstarted/installation).

```bash
git clone https://github.com/bchosoft/bcho-tonex-loader.git
cd bcho-tonex-loader
go test ./...
wails build
```

El ejecutable queda en `build/bin/`.

### Estructura del proyecto

- `app.go` — backend Wails expuesto al frontend; serializa el acceso al pedal y expone import/export.
- `main.go` — arranque de la app Wails.
- `internal/device` — comunicación serie/USB con el pedal.
- `internal/librarian` — workflows de alto nivel: snapshot, upload, export, asignaciones, color, polling.
- `internal/upload` — parser/conversor entre `.txp` y el payload en el cable del pedal.
- `internal/assets` — plantilla de subida y frames de setup embebidos.
- `frontend/` — interfaz de usuario (HTML/CSS/JS vanilla).

### Licencia

[MIT](LICENSE) — software libre, úsalo, modifícalo y redistribúyelo como quieras.

Este proyecto no está afiliado ni respaldado por IK Multimedia. "TONEX" es marca de IK Multimedia.

---

## English

Open-source tool (Go + [Wails](https://wails.io)) to upload `.txp` presets to an **IK Multimedia TONEX One / TONEX Pedal** over USB, without needing to open the official TONEX Editor software.

It is not a replacement for TONEX Editor: it does not edit amp/cab models, it only **moves `.txp` presets to the pedal and reads its state** directly.

### Features

- Read all 20 pedal slots (name, amp, model, A/B/Stomp assignments).
- Upload a `.txp` by dragging it onto a slot.
- Assign slots to the A/B/Stomp footswitches.
- Change each slot's LED color.
- Back up a slot.
- Export a pedal slot back to `.txp` (faithful or with BCho signature).
- Live polling of the active footswitch.
- Spanish/English UI with a language switcher.

### Download

Check the [Releases](../../releases) tab for your platform's build:

- **Windows**: `BCho-TONEX-Loader-windows-amd64.exe`
- **macOS**: `BCho-TONEX-Loader-macos-*.zip` (Intel and Apple Silicon)
- **Linux**: `BCho-TONEX-Loader-linux-amd64`

### Basic usage

1. Connect the pedal over USB.
2. Close TONEX Editor if it's open (only one program can hold the serial port at a time).
3. Open the app.
4. Refresh to read the pedal and pick a destination slot.
5. Drag or open a `.txp` file to upload it.

### Build from source

Requirements: [Go](https://go.dev) 1.25+, [Node.js](https://nodejs.org) 18+, [Wails v2](https://wails.io/docs/gettingstarted/installation).

```bash
git clone https://github.com/bchosoft/bcho-tonex-loader.git
cd bcho-tonex-loader
go test ./...
wails build
```

The binary will be in `build/bin/`.

### License

[MIT](LICENSE) — free software, use it, modify it, redistribute it as you like.

This project is not affiliated with or endorsed by IK Multimedia. "TONEX" is a trademark of IK Multimedia.
