import './style.css';

/* ---------------------------------------------------------------------------
 * Tonex Loader — frontend (vanilla). Habla con el backend Go vía los globals
 * que inyecta Wails (window.go.main.App y window.runtime).
 * ------------------------------------------------------------------------- */

/* ===========================================================================
 * i18n — Español / English
 * ========================================================================= */
const I18N = {
    es: {
        subtitle: 'IK Multimedia Tonex One · USB',
        btnRefresh: '⟳ Refrescar',
        btnOpen: '📂 Abrir .txp',
        btnBackup: '💾 Backup',
        btnHelp: '❔ Ayuda',
        btnDonate: '☕ Donar',
        donateTitle: 'Invítame a un café y apoya el proyecto',
        portTitle: 'Puerto COM del pedal',
        pollTitle: 'Seguir el footswitch en vivo',
        thSlot: 'Slot', thName: 'Nombre', thCharacter: 'Carácter', thTone: 'Modelo',
        thStomp: 'Stomp', thAmp: 'Ampli', thCab: 'Pantalla', thAssigned: 'Asignado',
        emptyRow: 'Conecta el pedal y pulsa <b>Refrescar</b>.',
        statusReady: 'Listo. Conecta un pedal Tonex.',
        noPedal: 'No se detecta ningún pedal Tonex por USB.',
        pedalDetected: 'Pedal detectado en {port}.',
        pickPortHint: 'No se detectó por USB. Elige el puerto COM del pedal y pulsa Refrescar.',
        errPorts: 'Error listando puertos: {e}',
        reading: 'Leyendo el pedal…',
        readDone: 'Leídos {n} slots desde {port}.',
        readErr: 'No se pudo leer el pedal: {e}',
        genericErr: 'Error: {e}',
        active: '● ACTIVO',
        ampLabel: 'Ampli', cabLabel: 'Pantalla',
        ctxDetails: '🔍 Ver detalles',
        ctxUpload: '⬆ Subir .txp aquí…',
        ctxExport: 'Exportar .txp',
        ctxExportBcho: 'Exportar Txp con BCho',
        ctxLoadA: '🎚 Cargar en A', ctxLoadB: '🎚 Cargar en B', ctxLoadStomp: '🎚 Cargar en Stomp',
        ctxColor: '🎨 Cambiar color…',
        mEffects: 'Efectos', mGate: 'Noise Gate', mComp: 'Compressor', mMod: 'Modulation',
        mDelay: 'Delay', mReverb: 'Reverb', mAssignedTo: 'Asignado a', mColor: 'Color LED',
        close: 'Cerrar', cancel: 'Cancelar',
        slotWord: 'Slot',
        loading: 'Cargando slot {n} en {pos}…',
        loaded: 'Slot {n} cargado en {pos}.',
        selected: 'Preset {n} activo en el pedal: {name}',
        selectErr: 'No se pudo cambiar el preset: {e}',
        assignErr: 'No se pudo asignar: {e}',
        colorTitle: 'Color del slot {n}',
        colorSub: 'Elige el color del LED para este preset.',
        colorChanging: 'Cambiando color del slot {n}…',
        colorDone: 'Color del slot {n} actualizado.',
        colorErr: 'No se pudo cambiar el color: {e}',
        dlgErr: 'Error abriendo diálogo: {e}',
        uploading: 'Subiendo {file} al slot {n}… ({i}/{total})',
        noAck: 'Sin ACK al subir {file} (puede haberse aplicado).',
        uploadFileErr: 'Error subiendo {file}: {e}',
        uploadDone: 'Subida completada: {ok}/{total}.',
        exporting: 'Exportando slot {n} a .txp...',
        exportSaved: '.txp exportado: {path}',
        exportErr: 'No se pudo exportar .txp: {e}',
        backupFirst: 'Primero refresca el pedal.',
        backupSaved: 'Backup guardado: {path}',
        backupErr: 'Error guardando backup: {e}',
        pollErr: 'Polling: {e}',
        pollStopped: 'Polling detenido: {msg}',
        droppedToast: '{n} .txp recibido(s). Elige el slot de destino.',
        onlyTxp: 'Solo se pueden subir archivos .txp.',
        overflowWarn: '{n} no caben por debajo y se omitieron.',
        pickTitleMulti: 'Subir {n} presets', pickTitleOne: 'Subir preset',
        pickSubMulti: 'Se subirán a slots consecutivos desde el que elijas.',
        pickSubOne: 'Elige el slot de destino.',
        dropHint: 'Suelta los <b>.txp</b> aquí para subirlos',
        offlineWarning: 'No se puede conectar con el servidor de control. Modo sin conexión: sin pantalla de donación y con límite de 1 importación y 1 exportación por sesión.',
        offlineImportLimit: 'Modo sin conexión: límite de 1 importación por sesión.',
        offlineExportLimit: 'Modo sin conexión: límite de 1 exportación por sesión.',
        // progreso (traducción de los mensajes del backend)
        pConnecting: 'Conectando con el pedal…',
        pReadingSlot: 'Leyendo slot {n}/{total}…',
        pGenerating: 'Generando datos de subida…',
        pSendingSetup: 'Enviando configuración…',
        pUploadingSlot: 'Subiendo al slot {n}…',
        pReadingUpdated: 'Leyendo el slot actualizado…',
        pLoadingInto: 'Cargando en {pos}…',
        helpTitle: 'Ayuda — Tonex Loader',
    },
    en: {
        subtitle: 'IK Multimedia Tonex One · USB',
        btnRefresh: '⟳ Refresh',
        btnOpen: '📂 Open .txp',
        btnBackup: '💾 Backup',
        btnHelp: '❔ Help',
        btnDonate: '☕ Donate',
        donateTitle: 'Buy me a coffee and support the project',
        portTitle: 'Pedal COM port',
        pollTitle: 'Follow the footswitch live',
        thSlot: 'Slot', thName: 'Name', thCharacter: 'Character', thTone: 'Tone Model',
        thStomp: 'Stomp', thAmp: 'Amp', thCab: 'Cab', thAssigned: 'Assigned',
        emptyRow: 'Connect the pedal and click <b>Refresh</b>.',
        statusReady: 'Ready. Connect a Tonex pedal.',
        noPedal: 'No Tonex pedal detected over USB.',
        pedalDetected: 'Pedal detected on {port}.',
        pickPortHint: 'Not detected over USB. Pick the pedal’s COM port and click Refresh.',
        errPorts: 'Error listing ports: {e}',
        reading: 'Reading the pedal…',
        readDone: 'Read {n} slots from {port}.',
        readErr: 'Couldn’t read the pedal: {e}',
        genericErr: 'Error: {e}',
        active: '● ACTIVE',
        ampLabel: 'Amp', cabLabel: 'Cab',
        ctxDetails: '🔍 View details',
        ctxUpload: '⬆ Upload .txp here…',
        ctxExport: 'Export .txp',
        ctxExportBcho: 'Export Txp with BCho',
        ctxLoadA: '🎚 Load into A', ctxLoadB: '🎚 Load into B', ctxLoadStomp: '🎚 Load into Stomp',
        ctxColor: '🎨 Change colour…',
        mEffects: 'Effects', mGate: 'Noise Gate', mComp: 'Compressor', mMod: 'Modulation',
        mDelay: 'Delay', mReverb: 'Reverb', mAssignedTo: 'Assigned to', mColor: 'LED colour',
        close: 'Close', cancel: 'Cancel',
        slotWord: 'Slot',
        loading: 'Loading slot {n} into {pos}…',
        loaded: 'Slot {n} loaded into {pos}.',
        selected: 'Preset {n} active on the pedal: {name}',
        selectErr: 'Couldn’t change the preset: {e}',
        assignErr: 'Couldn’t assign: {e}',
        colorTitle: 'Colour for slot {n}',
        colorSub: 'Pick the LED colour for this preset.',
        colorChanging: 'Changing slot {n} colour…',
        colorDone: 'Slot {n} colour updated.',
        colorErr: 'Couldn’t change the colour: {e}',
        dlgErr: 'Error opening dialog: {e}',
        uploading: 'Uploading {file} to slot {n}… ({i}/{total})',
        noAck: 'No ACK uploading {file} (it may still have applied).',
        uploadFileErr: 'Error uploading {file}: {e}',
        uploadDone: 'Upload finished: {ok}/{total}.',
        exporting: 'Exporting slot {n} to .txp...',
        exportSaved: '.txp exported: {path}',
        exportErr: 'Could not export .txp: {e}',
        backupFirst: 'Refresh the pedal first.',
        backupSaved: 'Backup saved: {path}',
        backupErr: 'Error saving backup: {e}',
        pollErr: 'Polling: {e}',
        pollStopped: 'Polling stopped: {msg}',
        droppedToast: '{n} .txp received. Choose the target slot.',
        onlyTxp: 'Only .txp files can be uploaded.',
        overflowWarn: '{n} didn’t fit below and were skipped.',
        pickTitleMulti: 'Upload {n} presets', pickTitleOne: 'Upload preset',
        pickSubMulti: 'They’ll go to consecutive slots from the one you pick.',
        pickSubOne: 'Choose the target slot.',
        dropHint: 'Drop <b>.txp</b> files here to upload',
        offlineWarning: 'The control server cannot be reached. Offline mode: no donation overlay, limited to 1 import and 1 export per session.',
        offlineImportLimit: 'Offline mode: limited to 1 import per session.',
        offlineExportLimit: 'Offline mode: limited to 1 export per session.',
        pConnecting: 'Connecting to the pedal…',
        pReadingSlot: 'Reading slot {n}/{total}…',
        pGenerating: 'Generating upload data…',
        pSendingSetup: 'Sending setup…',
        pUploadingSlot: 'Uploading to slot {n}…',
        pReadingUpdated: 'Reading the updated slot…',
        pLoadingInto: 'Loading into {pos}…',
        helpTitle: 'Help — Tonex Loader',
    },
};

let lang = localStorage.getItem('tonexLang') || 'es';

function t(key, vars) {
    let s = (I18N[lang] && I18N[lang][key]);
    if (s == null) s = I18N.es[key];
    if (s == null) s = key;
    if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
    return s;
}

/* Banderas (SVG inline). */
const FLAG_ES = `<svg viewBox="0 0 24 16" width="22" height="15" aria-label="Español">
  <rect width="24" height="16" rx="2.5" fill="#c60b1e"/><rect y="4" width="24" height="8" fill="#ffc400"/></svg>`;
const FLAG_EN = `<svg viewBox="0 0 24 16" width="22" height="15" aria-label="English">
  <defs><clipPath id="ukr"><rect width="24" height="16" rx="2.5"/></clipPath></defs>
  <g clip-path="url(#ukr)">
    <rect width="24" height="16" fill="#012169"/>
    <path d="M0,0 24,16 M24,0 0,16" stroke="#fff" stroke-width="3.2"/>
    <path d="M0,0 24,16 M24,0 0,16" stroke="#c8102e" stroke-width="1.8"/>
    <rect x="9.5" width="5" height="16" fill="#fff"/><rect y="5.5" width="24" height="5" fill="#fff"/>
    <rect x="10.5" width="3" height="16" fill="#c8102e"/><rect y="6.5" width="24" height="3" fill="#c8102e"/>
  </g></svg>`;

/* Contenido de ayuda por idioma (HTML). */
const HELP_HTML = {
    es: `
    <p class="help-lead">Tonex Loader es una utilidad independiente para cargar presets <b>.txp</b> en un
    <b>IK Multimedia Tonex One</b> por USB, sin abrir el editor oficial TONEX.</p>
    <div class="help-warn">⚠️ <b>No sustituye al TONEX Editor.</b> No crea, edita, captura ni entrena
    modelos de amplificador, y no gestiona la librería en la nube. Su único trabajo es <b>pasar al pedal
    cualquier archivo .txp</b> que ya tengas (por ejemplo, uno que te pase un amigo).</div>

    <div class="help-section">✅ Qué SÍ puedes hacer</div>
    <ul class="help-list">
      <li><b>Leer</b> los 20 slots del Tonex One en vivo (nombre, character, amp, cab, efectos).</li>
      <li><b>Subir</b> cualquier <b>.txp</b> a cualquier slot: arrastrándolo a la ventana, con <b>Abrir .txp</b>,
      o con clic derecho en un slot → <i>Subir aquí</i>. Si sueltas varios, se cargan en slots consecutivos.</li>
      <li><b>Asignar</b> un slot al footswitch <b>A</b>, <b>B</b> o <b>Stomp</b> (clic derecho → <i>Cargar</i>,
      o arrastrando una fila sobre una tarjeta).</li>
      <li>Ver en <b>tiempo real</b> qué preset está activo al pisar el footswitch.</li>
      <li><b>Cambiar el color del LED</b> de un slot (clic en el punto de color).</li>
      <li><b>Hacer copia de seguridad</b> de los slots del pedal en un archivo JSON.</li>
    </ul>

    <div class="help-section">🚫 Qué NO puedes hacer</div>
    <ul class="help-list">
      <li>No es un editor: aquí no se ajustan ganancia/EQ/efectos. Eso se hace en TONEX o en el origen del .txp.</li>
      <li>No crea ni captura modelos de amplificador nuevos.</li>
      <li><b>Cierra el software oficial TONEX antes de usar esta app</b>: solo un programa puede usar el puerto USB a la vez.</li>
    </ul>

    <div class="help-section">▶️ Cómo subir un preset</div>
    <ol class="help-list">
      <li>Conecta el Tonex One por USB (aparece solo; si hace falta, elige el puerto COM arriba).</li>
      <li>Arrastra un <b>.txp</b> a la ventana — o pulsa <b>Abrir .txp</b> — y elige el slot de destino.</li>
      <li>Espera el OK. Si quieres oírlo, carga ese slot en <b>A/B/Stomp</b> y písalo.</li>
    </ol>`,
    en: `
    <p class="help-lead">Tonex Loader is an independent utility to load <b>.txp</b> presets onto an
    <b>IK Multimedia Tonex One</b> over USB, without opening the official TONEX editor.</p>
    <div class="help-warn">⚠️ <b>It is not a replacement for the TONEX Editor.</b> It does not create, edit,
    capture or train amp models, and it does not manage the cloud library. Its only job is to <b>push any
    .txp file</b> you already have onto your pedal (for example, one a friend sends you).</div>

    <div class="help-section">✅ What you CAN do</div>
    <ul class="help-list">
      <li><b>Read</b> the 20 slots of your Tonex One live (name, character, amp, cab, effects).</li>
      <li><b>Upload</b> any <b>.txp</b> to any slot: drag it onto the window, use <b>Open .txp</b>,
      or right-click a slot → <i>Upload here</i>. Drop several and they fill consecutive slots.</li>
      <li><b>Assign</b> a slot to footswitch <b>A</b>, <b>B</b> or <b>Stomp</b> (right-click → <i>Load</i>,
      or drag a row onto a card).</li>
      <li>See in <b>real time</b> which preset is active when you press the footswitch.</li>
      <li><b>Change a slot's LED colour</b> (click the colour dot).</li>
      <li><b>Back up</b> the pedal's slots to a JSON file.</li>
    </ul>

    <div class="help-section">🚫 What you CANNOT do</div>
    <ul class="help-list">
      <li>It is not an editor: you can't tweak gain/EQ/effects here. Do that in TONEX or in the .txp's source.</li>
      <li>It can't create or capture new amp models.</li>
      <li><b>Close the official TONEX software before using this app</b>: only one program can use the USB port at a time.</li>
    </ul>

    <div class="help-section">▶️ How to upload a preset</div>
    <ol class="help-list">
      <li>Connect the Tonex One over USB (it shows up automatically; pick the COM port above if needed).</li>
      <li>Drag a <b>.txp</b> onto the window — or click <b>Open .txp</b> — and choose the target slot.</li>
      <li>Wait for the OK. To hear it, load that slot into <b>A/B/Stomp</b> and step on it.</li>
    </ol>`,
};

const POSITIONS = [
    { label: 'A', proto: 'A', color: 'var(--pos-a)' },
    { label: 'B', proto: 'B', color: 'var(--pos-b)' },
    { label: 'Stomp', proto: 'C', color: 'var(--pos-c)' },
];

/* Paleta de colores del LED — los 21 colores del diálogo "Color Selection" del
 * editor oficial (5+5+5+5 + apagado), en orden de rejilla.
 *   rgb = valor CODIFICADO que se ESCRIBE al pedal (el que usa el editor oficial;
 *         p.ej. amarillo lleva el rojo bajado a 159 para que el LED no tire a
 *         naranja). Validado en la versión Python contra la app original.
 *   hex = color EXACTO muestreado del diálogo oficial (lo que se ve en el selector
 *         y en los LEDs de la tabla). Reading: el pedal devuelve el rgb codificado
 *         y se mapea a su hex de visualización.
 * "Apagado" escribe (0,0,0) y se muestra como gris medio. */
const OFF_HEX = '#777777';
const LED_PALETTE = [
    // Fila 1 — tonos vivos
    { rgb: [255, 0, 0], hex: '#ff000c', name: { es: 'Rojo', en: 'Red' } },
    { rgb: [255, 63, 0], hex: '#e65d00', name: { es: 'Naranja', en: 'Orange' } },
    { rgb: [159, 255, 0], hex: '#fde800', name: { es: 'Amarillo', en: 'Yellow' } },
    { rgb: [0, 255, 0], hex: '#00fb3b', name: { es: 'Verde', en: 'Green' } },
    { rgb: [15, 255, 47], hex: '#00fdd2', name: { es: 'Cian', en: 'Cyan' } },
    // Fila 2 — azules, violetas y rosas
    { rgb: [0, 255, 255], hex: '#00a3ff', name: { es: 'Celeste', en: 'Sky blue' } },
    { rgb: [0, 0, 255], hex: '#003bff', name: { es: 'Azul', en: 'Blue' } },
    { rgb: [47, 0, 255], hex: '#7f65ff', name: { es: 'Violeta', en: 'Violet' } },
    { rgb: [255, 0, 255], hex: '#ff00d1', name: { es: 'Magenta', en: 'Magenta' } },
    { rgb: [191, 191, 191], hex: '#ff90ff', name: { es: 'Rosa', en: 'Pink' } },
    // Fila 3 — tonos oscuros / tierra
    { rgb: [17, 0, 0], hex: '#8f1016', name: { es: 'Granate', en: 'Maroon' } },
    { rgb: [17, 17, 0], hex: '#823e10', name: { es: 'Marrón', en: 'Brown' } },
    { rgb: [17, 34, 0], hex: '#8e8310', name: { es: 'Oliva', en: 'Olive' } },
    { rgb: [0, 17, 0], hex: '#108d2d', name: { es: 'Verde oscuro', en: 'Dark green' } },
    { rgb: [0, 34, 6], hex: '#108e78', name: { es: 'Verde azulado', en: 'Teal' } },
    // Fila 4 — tonos apagados
    { rgb: [0, 25, 25], hex: '#10618f', name: { es: 'Azul acero', en: 'Steel blue' } },
    { rgb: [0, 0, 17], hex: '#102d8f', name: { es: 'Azul marino', en: 'Navy' } },
    { rgb: [5, 0, 17], hex: '#4f428f', name: { es: 'Morado', en: 'Indigo' } },
    { rgb: [10, 0, 10], hex: '#7a0d66', name: { es: 'Púrpura', en: 'Purple' } },
    { rgb: [11, 11, 11], hex: '#8f578f', name: { es: 'Malva', en: 'Mauve' } },
    // Fila 5 — apagado
    { rgb: [0, 0, 0], hex: OFF_HEX, name: { es: 'Apagado', en: 'Off' } },
];
const LED_MAP = Object.fromEntries(LED_PALETTE.map((e) => [e.rgb.join(','), e.hex]));
// Devuelve el hex de visualización de un RGB leído del pedal. Coincidencia exacta
// si está en la tabla; si no, el color más cercano de la tabla (los valores
// atenuados antiguos se muestran como su equivalente brillante). (0,0,0) = apagado.
function ledHex(r, g, b) {
    const key = `${r},${g},${b}`;
    if (LED_MAP[key]) return LED_MAP[key];
    if (r === 0 && g === 0 && b === 0) return OFF_HEX;
    let best = null, bestD = Infinity;
    for (const e of LED_PALETTE) {
        if (e.rgb[0] === 0 && e.rgb[1] === 0 && e.rgb[2] === 0) continue;
        const d = (e.rgb[0] - r) ** 2 + (e.rgb[1] - g) ** 2 + (e.rgb[2] - b) ** 2;
        if (d < bestD) { bestD = d; best = e; }
    }
    return best ? best.hex : `rgb(${r},${g},${b})`;
}

const state = {
    snapshot: null,
    port: '',
    selectedIndex: null,
    polling: false,
    busy: false,
    droppedPaths: [],
    dragRowIndex: null,
    pedalActiveIndex: null, // preset activo seleccionado en el Pedal
    selecting: false,
};

const $ = (id) => document.getElementById(id);
const backend = () => (window.go && window.go.main && window.go.main.App) || null;
const rt = () => window.runtime || null;

const monetizationConfig = {
    monetizationEnabled: false,
    donateButton: false,
    overlay: false,
    restrictions: false,
    offlineMode: false,
    activeLimit: 0,
    importsDone: 0,
    exportsDone: 0,
};

function monetizationPartEnabled(part) {
    return !!monetizationConfig.monetizationEnabled && monetizationConfig[part] !== false;
}

function applyMonetizationUI() {
    const donate = $('btnDonate');
    if (donate) donate.style.display = monetizationPartEnabled('donateButton') ? '' : 'none';
    showOfflineWarning(!!monetizationConfig.offlineMode);
}

async function loadMonetizationConfig() {
    try {
        const b = backend();
        if (!b || typeof b.GetUsageMode !== 'function') throw new Error('usage mode unavailable');
        const cfg = await b.GetUsageMode();
        Object.assign(monetizationConfig, {
            monetizationEnabled: !!cfg.monetizationEnabled,
            donateButton: cfg.donateButton !== false,
            overlay: cfg.overlay !== false,
            restrictions: cfg.restrictions !== false,
            offlineMode: !!cfg.offlineMode,
            activeLimit: cfg.activeLimit || 0,
            importsDone: cfg.importsDone || 0,
            exportsDone: cfg.exportsDone || 0,
        });
    } catch (e) {
        Object.assign(monetizationConfig, {
            monetizationEnabled: false,
            donateButton: false,
            overlay: false,
            restrictions: true,
            offlineMode: true,
            activeLimit: 1,
            importsDone: 0,
            exportsDone: 0,
        });
    }
    applyMonetizationUI();
}

function showOfflineWarning(show) {
    let el = $('offlineWarning');
    if (!el) {
        el = document.createElement('div');
        el.id = 'offlineWarning';
        el.style.cssText = 'display:none;margin:0 18px 12px;padding:10px 14px;border:1px solid rgba(255,184,77,.55);border-radius:8px;background:rgba(255,184,77,.12);color:var(--text);font-size:13px;line-height:1.35;';
        const topbar = document.querySelector('.topbar');
        if (topbar && topbar.parentNode) topbar.parentNode.insertBefore(el, topbar.nextSibling);
    }
    if (!el) return;
    el.textContent = t('offlineWarning');
    el.style.display = show ? 'block' : 'none';
}

function isOfflineLimitError(e) {
    return String(e && (e.message || e)).includes('OFFLINE_LIMIT');
}

/* Modelo del pedal actual ("one" | "pedal" | "unknown") y nº de slots. El Tonex
 * Pedal grande no tiene asignación libre A/B/Stomp (usa bancos), así que esas
 * tarjetas y opciones se ocultan en modo "pedal". */
function currentModel() { return (state.snapshot && state.snapshot.model) || 'one'; }
function isPedal() { return currentModel() === 'pedal'; }
function slotCount() { return (state.snapshot && state.snapshot.count) || 20; }
// Número de slot mostrado al usuario. El Tonex Pedal tiene pantalla y numera sus
// presets 0-149, así que mostramos el índice tal cual para que coincida. El Tonex
// One no tiene pantalla → numeración clásica 1-N.
function slotNum(idx) { return isPedal() ? idx : idx + 1; }

/* ---- util ---- */
function setStatus(msg, kind = '') {
    $('status').textContent = msg;
    const dot = $('statusDot');
    dot.className = 'status-dot' + (kind ? ' ' + kind : '');
}
let toastTimer = null;
function toast(msg, kind = '') {
    const t = $('toast');
    t.textContent = msg;
    t.className = 'toast' + (kind ? ' ' + kind : '');
    t.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add('hidden'), 3500);
}
function busy(on) {
    state.busy = on;
    ['btnRefresh', 'btnOpen', 'btnBackup'].forEach((id) => { $(id).disabled = on; });
}
function rgbCss(c) {
    if (!c) return '#595959';
    return ledHex(c.r, c.g, c.b);
}
function isOff(c) { return !c || (c.r + c.g + c.b) === 0; }
function presetByIndex(idx) {
    if (!state.snapshot || idx == null || idx < 0) return null;
    return state.snapshot.presets.find((p) => p.index === idx) || null;
}
function colorOf(idx) {
    if (!state.snapshot || !state.snapshot.colors || idx < 0) return null;
    return state.snapshot.colors[idx] || null;
}
function activeProto() {
    if (!state.snapshot) return '';
    return { 0: 'A', 1: 'B', 2: 'C' }[state.snapshot.activeSlot] || '';
}
// Indice del preset actualmente activo en el pedal. En el Pedal grande es el que
// el usuario ha seleccionado en la app (registro 81 01); en el One es el asignado
// a la posicion A/B/C activa.
function activePresetIndex() {
    if (isPedal()) return state.pedalActiveIndex == null ? -1 : state.pedalActiveIndex;
    const ap = activeProto();
    return ap ? assignmentFor(ap) : -1;
}
function assignmentFor(proto) {
    const a = state.snapshot && state.snapshot.assignments;
    if (!a) return -1;
    return proto === 'A' ? a.a : proto === 'B' ? a.b : a.c;
}
function posLabel(slotName) { return slotName === 'STOMP' || slotName === 'C' ? 'Stomp' : slotName; }
function assignedLabelJS(a, idx) {
    if (!a) return '';
    const parts = [];
    if (a.a === idx) parts.push('A');
    if (a.b === idx) parts.push('B');
    if (a.c === idx) parts.push('C');
    return parts.join('/');
}
const BCHO_SUFFIX = ' BCho';
function displayValue(p, value) {
    const s = String(value == null ? '' : value);
    if (p && p.hideBCho && s.endsWith(BCHO_SUFFIX)) return s.slice(0, -BCHO_SUFFIX.length);
    return s;
}
function displayName(p) { return displayValue(p, p && p.name); }
function displayToneModel(p) { return displayValue(p, p && p.toneModel); }
function pillsHtml(assigned) {
    return (assigned || '').split('/').filter(Boolean).map((ch) => {
        const lab = ch === 'C' ? 'Stomp' : ch;
        return `<span class="assigned-pill pill-${lab}">${lab}</span>`;
    }).join('');
}

/* ---- logo ---- */
function installLogo() {
    $('logo').innerHTML = `
    <svg viewBox="0 0 48 48" width="42" height="42" xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="4" width="34" height="40" rx="6" fill="#11131a" stroke="#ff2e7e" stroke-width="2"/>
      <circle cx="24" cy="14" r="5" fill="#0a0b0e" stroke="#2bf57e" stroke-width="2"/>
      <circle cx="24" cy="14" r="1.8" fill="#2bf57e"/>
      <path d="M11 28 q3 -6 6 0 t6 0 t6 0 t6 0" fill="none" stroke="#1fe3ff" stroke-width="2" stroke-linecap="round"/>
      <rect x="16" y="34" width="16" height="6" rx="3" fill="#ff2e7e"/>
    </svg>`;
}

/* ---- i18n apply ---- */
function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        el.innerHTML = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
        el.title = t(el.dataset.i18nTitle);
    });
    // banderas + estado activo
    $('langSwitch').querySelectorAll('.lang-btn').forEach((b) => {
        b.innerHTML = b.dataset.lang === 'es' ? FLAG_ES : FLAG_EN;
        b.classList.toggle('active', b.dataset.lang === lang);
    });
    $('dropHint').querySelector('.drop-inner').innerHTML = t('dropHint');
    applyMonetizationUI();
    // re-render dinámico
    renderCards();
    renderTable();
    if (!state.snapshot) {
        setStatus(state.port ? t('pedalDetected', { port: state.port }) : t('statusReady'),
            state.port ? 'ok' : '');
    }
}

function setLang(l) {
    if (l === lang) return;
    lang = l;
    localStorage.setItem('tonexLang', l);
    applyLang();
}

/* ---- UI según modelo ---- */
// En modo Pedal: ocultar la sección de tarjetas A/B/Stomp (no aplica) y reflejar
// el modelo en el subtítulo. En modo One: comportamiento clásico.
function applyModelUI() {
    const pedal = isPedal();
    document.body.classList.toggle('mode-pedal', pedal);
    const cards = $('cards');
    if (cards) cards.classList.toggle('hidden', pedal);
    const chip = document.querySelector('.mode-chip');
    if (chip) chip.classList.toggle('hidden', pedal);
    const sub = $('subtitle');
    if (sub) {
        const name = (state.snapshot && state.snapshot.modelName)
            || (pedal ? 'Tonex Pedal' : 'Tonex One');
        sub.textContent = `IK Multimedia ${name} · USB`;
    }
}

/* ---- cards ---- */
function renderCards() {
    if (isPedal()) { applyModelUI(); return; } // el Pedal no usa tarjetas A/B/Stomp
    const wrap = $('cards');
    const ap = activeProto();
    const parts = [];
    POSITIONS.forEach((pos, i) => {
        const idx = assignmentFor(pos.proto);
        const preset = presetByIndex(idx);
        const isActive = pos.proto === ap;
        const c = colorOf(idx);
        const led = rgbCss(c);
        const glow = !isOff(c) ? `box-shadow:0 0 10px ${led}` : '';
        parts.push(`
      <div class="card ${isActive ? 'active' : ''}" data-proto="${pos.proto}" style="--card-color:${pos.color}">
        <div class="card-head">
          <span class="card-led" style="background:${led};${glow}"></span>
          <span class="card-pos">${pos.label}</span>
          <span class="card-active">${t('active')}</span>
        </div>
        <div class="card-name">${esc(preset ? (displayName(preset) || '—') : '—')}</div>
        <div class="card-char">${esc(preset ? (preset.character || '') : '')}</div>
        <div class="card-meta">
          <span>${t('ampLabel')}</span><b>${esc(preset ? (preset.amp || '—') : '—')}</b>
          <span>${t('cabLabel')}</span><b>${esc(preset ? (preset.cab || '—') : '—')}</b>
        </div>
      </div>`);
        if (i === 1) {
            const mode = ap === 'C' ? 'STOMP' : 'DUAL';
            parts.push(`<div class="mode-chip">${mode}</div>`);
        }
    });
    wrap.innerHTML = parts.join('');
}

/* ---- table ---- */
function renderTable() {
    const body = $('slotBody');
    if (!state.snapshot || !state.snapshot.presets.length) {
        body.innerHTML = `<tr class="empty-row"><td colspan="8">${t('emptyRow')}</td></tr>`;
        return;
    }
    const activePresetIdx = activePresetIndex();
    const rows = state.snapshot.presets.map((p) => {
        const led = rgbCss(colorOf(p.index));
        const pills = pillsHtml(p.assigned);
        const cls = [];
        if (p.index === state.selectedIndex) cls.push('selected');
        if (p.index === activePresetIdx) cls.push('active-preset');
        if (p.loading) cls.push('row-loading');
        return `<tr data-index="${p.index}" draggable="true" class="${cls.join(' ')}">
        <td><span class="slot-num"><span class="slot-led" title="${t('ctxColor')}" style="background:${led}"></span>${slotNum(p.index)}</span></td>
        <td>${esc(displayName(p))}</td>
        <td>${esc(p.character)}</td>
        <td>${esc(displayToneModel(p))}</td>
        <td>${esc(p.stomp)}</td>
        <td>${esc(p.amp)}</td>
        <td>${esc(p.cab)}</td>
        <td>${pills}</td>
      </tr>`;
    });
    body.innerHTML = rows.join('');
}

function updateActiveHighlight() {
    const activePresetIdx = activePresetIndex();
    document.querySelectorAll('#slotBody tr').forEach((tr) => {
        const idx = parseInt(tr.dataset.index, 10);
        tr.classList.toggle('active-preset', idx === activePresetIdx);
    });
}

function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
    ));
}

/* ---- carga progresiva (eventos snap-state / snap-slot) ---- */
// Llega el estado base: pintamos un esqueleto con números de slot, colores y
// asignaciones; los nombres/amp/cab se rellenan luego fila a fila.
function onSnapState(st) {
    const presets = Array.from({ length: st.count }, (_, i) => ({
        index: i, name: '', character: '', toneModel: '', stomp: '', amp: '', cab: '',
        gateFx: '', compFx: '', modFx: '', delayFx: '', reverbFx: '',
        assigned: assignedLabelJS(st.assignments, i), loading: true,
    }));
    state.snapshot = {
        port: st.port, model: st.model, modelName: st.modelName, count: st.count,
        assignments: st.assignments, activeSlot: st.activeSlot, colors: st.colors, presets,
    };
    applyModelUI();
    renderCards();
    renderTable();
}
// Llega un preset leído: rellenamos SOLO su fila (sin re-pintar toda la tabla).
function fillRow(s) {
    if (!state.snapshot || !state.snapshot.presets[s.index]) return;
    state.snapshot.presets[s.index] = s;
    const tr = document.querySelector(`#slotBody tr[data-index="${s.index}"]`);
    if (tr && tr.children.length >= 8) {
        const td = tr.children;
        td[1].textContent = displayName(s) || '';
        td[2].textContent = s.character || '';
        td[3].textContent = displayToneModel(s) || '';
        td[4].textContent = s.stomp || '';
        td[5].textContent = s.amp || '';
        td[6].textContent = s.cab || '';
        td[7].innerHTML = pillsHtml(s.assigned);
        tr.classList.remove('row-loading');
    }
    const a = state.snapshot.assignments || {};
    if (s.index === a.a || s.index === a.b || s.index === a.c) renderCards();
}

/* ---- ports ---- */
async function loadPorts() {
    const b = backend();
    if (!b) return;
    try {
        let ports = await b.ListPorts();
        const sel = $('portSelect');
        sel.innerHTML = '';
        const detected = ports && ports.length;
        if (!detected) {
            // Red de seguridad: la enumeración USB no expuso el pedal. Ofrecemos
            // TODOS los puertos COM para elegir a mano; al conectar se detecta el
            // modelo por sondeo de HELLO.
            try { ports = await b.ListAllPorts(); } catch (_) { ports = []; }
        }
        if (!ports || !ports.length) {
            sel.innerHTML = '<option value="">—</option>';
            state.port = '';
            setStatus(t('noPedal'), 'err');
            return;
        }
        ports.forEach((p) => {
            const opt = document.createElement('option');
            opt.value = p.name;
            const label = p.modelName && p.model !== 'unknown'
                ? p.modelName
                : (p.isTonexOne ? 'Tonex One' : (p.modelName || 'COM'));
            opt.textContent = `${p.name} · ${label}`;
            sel.appendChild(opt);
        });
        state.port = ports[0].name;
        state.autoDetected = !!detected;
        sel.value = state.port;
        setStatus(detected ? t('pedalDetected', { port: state.port }) : t('pickPortHint'), detected ? 'ok' : '');
    } catch (e) {
        setStatus(t('errPorts', { e }), 'err');
    }
}

/* ---- refresh ---- */
async function refresh() {
    const b = backend();
    if (!b) return;
    // El backend pausa/reanuda el poller automáticamente alrededor de la lectura
    // (withPedal). No paramos el polling aquí para no perder el auto-resume.
    busy(true);
    setStatus(t('reading'), 'busy');
    try {
        const snap = await b.Snapshot(state.port);
        state.snapshot = snap;
        applyModelUI();
        renderCards();
        renderTable();
        setStatus(t('readDone', { n: snap.presets.length, port: snap.port }), 'ok');
    } catch (e) {
        setStatus(t('genericErr', { e }), 'err');
        toast(t('readErr', { e }), 'err');
    } finally {
        busy(false);
    }
}

// Recarga SOLO un slot tras una subida (no relee todo el pedal). Clave de
// velocidad, sobre todo en el Pedal (150 slots).
async function refreshSlot(idx) {
    const b = backend();
    if (!b) return;
    try {
        const s = await b.RefreshSlot(idx, state.port);
        if (s) fillRow(s);
    } catch (e) { /* la fila se queda con lo que hubiera; no es fatal */ }
}

// Relee solo el estado ligero (asignaciones/activo/colores) tras color/asignación,
// sin volver a leer el contenido de los 20/150 presets.
async function refreshState() {
    const b = backend();
    if (!b || !state.snapshot) return;
    try {
        const st = await b.QuickState(state.port);
        if (!st) return;
        state.snapshot.assignments = st.assignments;
        state.snapshot.activeSlot = st.activeSlot;
        if (st.colors && st.colors.length) state.snapshot.colors = st.colors;
        // Recalcular pills "asignado" de todas las filas (cambió una asignación).
        state.snapshot.presets.forEach((p) => { p.assigned = assignedLabelJS(st.assignments, p.index); });
        renderCards();
        renderTable();
    } catch (e) { /* no fatal */ }
}

/* ---- selección ---- */
function selectRow(idx) {
    state.selectedIndex = idx;
    document.querySelectorAll('#slotBody tr').forEach((tr) => {
        tr.classList.toggle('selected', parseInt(tr.dataset.index, 10) === idx);
    });
}

// Cambia el preset activo del Pedal al hacer clic en una fila (registro 81 01).
// Resalta la fila como activa al instante (optimista) y envia el comando.
async function selectOnPedal(idx) {
    const b = backend();
    if (!b || state.selecting) return;
    state.selecting = true;
    state.pedalActiveIndex = idx;
    updateActiveHighlight();
    try {
        await b.SelectPreset(idx, state.port);
        const p = presetByIndex(idx);
        setStatus(t('selected', { n: slotNum(idx), name: (p && displayName(p)) || '' }), 'ok');
    } catch (e) {
        toast(t('selectErr', { e }), 'err');
    } finally {
        state.selecting = false;
    }
}

/* ---- context menu ---- */
function showContextMenu(x, y, idx) {
    selectRow(idx);
    const preset = presetByIndex(idx);
    const menu = $('ctxMenu');
    // Ambos: detalles + subir + exportar. La asignación A/B/Stomp y el color de LED
    // son específicos del Tonex One (en el Pedal se ocultan: usa bancos, no asignación
    // libre, y su estado no expone el bloque de colores del One).
    let items = `
    <div class="ctx-sub">${t('slotWord')} ${slotNum(idx)} · ${esc(preset ? displayName(preset) : '')}</div>
    <div class="ctx-item" data-act="details">${t('ctxDetails')}</div>
    <div class="ctx-item" data-act="upload">${t('ctxUpload')}</div>
    <div class="ctx-item" data-act="export">${t('ctxExport')}</div>
    <div class="ctx-item" data-act="export-bcho">${t('ctxExportBcho')}</div>`;
    if (!isPedal()) {
        items += `
    <div class="ctx-sep"></div>
    <div class="ctx-item" data-act="load-A">${t('ctxLoadA')}</div>
    <div class="ctx-item" data-act="load-B">${t('ctxLoadB')}</div>
    <div class="ctx-item" data-act="load-STOMP">${t('ctxLoadStomp')}</div>
    <div class="ctx-sep"></div>
    <div class="ctx-item" data-act="color">${t('ctxColor')}</div>`;
    }
    menu.innerHTML = items;
    menu.classList.remove('hidden');
    const mw = menu.offsetWidth, mh = menu.offsetHeight;
    menu.style.left = Math.min(x, window.innerWidth - mw - 8) + 'px';
    menu.style.top = Math.min(y, window.innerHeight - mh - 8) + 'px';

    menu.querySelectorAll('.ctx-item').forEach((it) => {
        it.onclick = () => {
            hideContextMenu();
            handleAction(it.dataset.act, idx);
        };
    });
}
function hideContextMenu() { $('ctxMenu').classList.add('hidden'); }

async function handleAction(act, idx) {
    if (act === 'details') return showDetails(idx);
    if (act === 'upload') return uploadFlow(idx);
    if (act === 'export') return exportTXP(idx);
    if (act === 'export-bcho') return exportTXP(idx, true);
    if (act === 'color') return colorFlow(idx);
    if (act.startsWith('load-')) return loadInto(act.slice(5), idx);
}

/* ---- detalles ---- */
function fxSpan(v) {
    const on = v && v.toLowerCase().startsWith('on');
    return `<span class="${on ? 'fx-on' : 'fx-off'}">${esc(v || 'Off')}</span>`;
}
function showDetails(idx) {
    const p = presetByIndex(idx);
    if (!p) return;
    const col = colorOf(idx);
    openModal(`
    <h2>${esc(displayName(p)) || t('slotWord') + ' ' + slotNum(idx)}</h2>
    <div class="modal-sub">${t('slotWord')} ${slotNum(idx)} · ${esc(p.character)}</div>
    <div class="modal-row"><span class="k">${t('thTone')}</span><span class="v">${esc(displayToneModel(p)) || '—'}</span></div>
    <div class="modal-row"><span class="k">${t('ampLabel')}</span><span class="v">${esc(p.amp) || '—'}</span></div>
    <div class="modal-row"><span class="k">${t('cabLabel')}</span><span class="v">${esc(p.cab) || '—'}</span></div>
    <div class="modal-row"><span class="k">${t('thStomp')}</span><span class="v">${esc(p.stomp) || '—'}</span></div>
    <div class="modal-section">${t('mEffects')}</div>
    <div class="modal-row"><span class="k">${t('mGate')}</span><span class="v">${fxSpan(p.gateFx)}</span></div>
    <div class="modal-row"><span class="k">${t('mComp')}</span><span class="v">${fxSpan(p.compFx)}</span></div>
    <div class="modal-row"><span class="k">${t('mMod')}</span><span class="v">${fxSpan(p.modFx)}</span></div>
    <div class="modal-row"><span class="k">${t('mDelay')}</span><span class="v">${fxSpan(p.delayFx)}</span></div>
    <div class="modal-row"><span class="k">${t('mReverb')}</span><span class="v">${fxSpan(p.reverbFx)}</span></div>
    <div class="modal-row"><span class="k">${t('mAssignedTo')}</span><span class="v">${esc(p.assigned) || '—'}</span></div>
    <div class="modal-row"><span class="k">${t('mColor')}</span><span class="v"><span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${rgbCss(col)};vertical-align:middle"></span></span></div>
    <div class="modal-actions"><button class="btn" data-close>${t('close')}</button></div>`);
}

/* ---- cargar en A/B/Stomp ---- */
async function loadInto(slotName, idx) {
    const b = backend();
    if (!b) return;
    busy(true);
    setStatus(t('loading', { n: idx + 1, pos: posLabel(slotName) }), 'busy');
    try {
        await b.SetAssignment(slotName, idx, state.port);
        toast(t('loaded', { n: idx + 1, pos: posLabel(slotName) }), 'ok');
        await refreshState();
        setStatus(t('loaded', { n: idx + 1, pos: posLabel(slotName) }), 'ok');
    } catch (e) {
        setStatus(t('genericErr', { e }), 'err');
        toast(t('assignErr', { e }), 'err');
    } finally {
        busy(false);
    }
}

/* ---- color ---- */
function colorFlow(idx) {
    const cur = colorOf(idx);
    const curKey = cur ? `${cur.r},${cur.g},${cur.b}` : '';
    const sw = LED_PALETTE.map((e, i) => {
        const sel = e.rgb.join(',') === curKey;
        const nm = esc(e.name[lang] || e.name.es);
        return `<div class="swatch-cell${sel ? ' swatch-current' : ''}" data-i="${i}" title="${nm}" style="--c:${e.hex}">
          <span class="swatch-dot" style="background:${e.hex}"></span>
        </div>`;
    }).join('');
    openModal(`
    <h2>${t('colorTitle', { n: idx + 1 })}</h2>
    <div class="modal-sub">${t('colorSub')}</div>
    <div class="palette">${sw}</div>
    <div class="modal-actions"><button class="btn" data-close>${t('cancel')}</button></div>`);
    $('modal').querySelectorAll('.swatch-cell').forEach((s) => {
        s.onclick = async () => {
            closeModal();
            const [r, g, bb] = LED_PALETTE[parseInt(s.dataset.i, 10)].rgb;
            const b = backend();
            busy(true);
            setStatus(t('colorChanging', { n: idx + 1 }), 'busy');
            try {
                await b.SetColor(idx, r, g, bb, state.port);
                toast(t('colorDone', { n: idx + 1 }), 'ok');
                await refreshState();
                setStatus(t('colorDone', { n: idx + 1 }), 'ok');
            } catch (e) {
                setStatus(t('genericErr', { e }), 'err');
                toast(t('colorErr', { e }), 'err');
            } finally {
                busy(false);
            }
        };
    });
}

/* ---- donación ---- */
const DONATE_URL = 'https://buymeacoffee.com/blackchorima';
function openDonate() {
    if (!monetizationPartEnabled('donateButton')) return;
    const r = rt();
    // Abrir en el navegador del sistema (no dentro del WebView).
    if (r && typeof r.BrowserOpenURL === 'function') {
        r.BrowserOpenURL(DONATE_URL);
    } else {
        window.open(DONATE_URL, '_blank');
    }
}

/* ---- ayuda ---- */
function showHelp() {
    openModal(`
    <h2>${t('helpTitle')}</h2>
    <div class="help-body">${HELP_HTML[lang]}</div>
    <div class="modal-actions"><button class="btn primary" data-close>${t('close')}</button></div>`);
}

/* ---- subir .txp ---- */
async function uploadFlow(slot) {
    const b = backend();
    if (!b) return;
    let paths = state.droppedPaths.length ? state.droppedPaths.slice() : null;
    state.droppedPaths = [];
    if (!paths) {
        try { paths = await b.OpenTXPDialog(); } catch (e) { toast(t('dlgErr', { e }), 'err'); return; }
    }
    if (!paths || !paths.length) return;
    await uploadPaths(paths, slot);
}

async function uploadPaths(paths, baseSlot) {
    const b = backend();
    // Solo caben (slotCount - baseSlot) presets desde el slot apuntado hacia abajo.
    const maxFit = slotCount() - baseSlot;
    let overflow = Math.max(0, paths.length - maxFit);
    let fit = paths.slice(0, maxFit);
    if (monetizationConfig.offlineMode) {
        const remaining = Math.max(0, (monetizationConfig.activeLimit || 1) - (monetizationConfig.importsDone || 0));
        if (remaining <= 0) {
            showOfflineWarning(true);
            toast(t('offlineImportLimit'), 'err');
            return;
        }
        if (fit.length > remaining) {
            overflow += fit.length - remaining;
            fit = fit.slice(0, remaining);
        }
    }
    if (overflow > 0) toast(t('overflowWarn', { n: overflow }), '');
    if (!fit.length) return;
    busy(true);
    let ok = 0;
    const done = [];
    for (let i = 0; i < fit.length; i++) {
        const slot = baseSlot + i;
        const file = fit[i].split(/[\\/]/).pop();
        setStatus(t('uploading', { file, n: slotNum(slot), i: i + 1, total: fit.length }), 'busy');
        try {
            const res = await b.UploadAndAssign(fit[i], slot, '', state.port);
            if (res && res.ok) {
                ok++;
                if (monetizationConfig.offlineMode) monetizationConfig.importsDone++;
                done.push(slot);
                // Si el backend ya devolvió el preset releído, pintamos esa fila ya.
                if (res.preset) fillRow(res.preset);
            } else {
                toast(t('noAck', { file }), '');
            }
        } catch (e) {
            if (isOfflineLimitError(e)) {
                showOfflineWarning(true);
                toast(t('offlineImportLimit'), 'err');
                break;
            }
            toast(t('uploadFileErr', { file, e }), 'err');
        }
    }
    setStatus(t('uploadDone', { ok, total: fit.length }), ok ? 'ok' : 'err');
    toast(t('uploadDone', { ok, total: fit.length }), ok ? 'ok' : 'err');
    busy(false);
    // Releer SOLO los slots subidos (no toda la snapshot).
    for (const slot of done) await refreshSlot(slot);
}

async function exportTXP(idx, bcho = false) {
    const b = backend();
    if (!b) return;
    if (monetizationConfig.offlineMode && (monetizationConfig.exportsDone || 0) >= (monetizationConfig.activeLimit || 1)) {
        showOfflineWarning(true);
        toast(t('offlineExportLimit'), 'err');
        return;
    }
    busy(true);
    setStatus(t('exporting', { n: slotNum(idx) }), 'busy');
    try {
        const path = bcho
            ? await b.ExportTXPBCho(idx, state.port)
            : await b.ExportTXP(idx, state.port);
        if (path) {
            if (monetizationConfig.offlineMode) monetizationConfig.exportsDone++;
            setStatus(t('exportSaved', { path }), 'ok');
            toast(t('exportSaved', { path }), 'ok');
        } else {
            setStatus(t('statusReady'), '');
        }
    } catch (e) {
        if (isOfflineLimitError(e)) {
            showOfflineWarning(true);
            toast(t('offlineExportLimit'), 'err');
            return;
        }
        setStatus(t('genericErr', { e }), 'err');
        toast(t('exportErr', { e }), 'err');
    } finally {
        busy(false);
    }
}

/* ---- drop de ficheros externos (.txp) con coordenadas ---- */
function targetSlotFromPoint(x, y) {
    const el = document.elementFromPoint(x, y);
    const tr = el && el.closest ? el.closest('tr[data-index]') : null;
    return tr ? parseInt(tr.dataset.index, 10) : null;
}
function clearDropCues() {
    $('dropHint').classList.add('hidden');
    document.querySelectorAll('#slotBody tr.drop-row-target').forEach((r) => r.classList.remove('drop-row-target'));
}
function showDropCues(x, y, count) {
    document.querySelectorAll('#slotBody tr.drop-row-target').forEach((r) => r.classList.remove('drop-row-target'));
    const base = targetSlotFromPoint(x, y);
    if (base == null) { $('dropHint').classList.remove('hidden'); return; }
    $('dropHint').classList.add('hidden');
    const last = Math.min(base + count - 1, slotCount() - 1);
    for (let idx = base; idx <= last; idx++) {
        const row = document.querySelector(`#slotBody tr[data-index="${idx}"]`);
        if (row) row.classList.add('drop-row-target');
    }
}
// Llega del runtime de Wails al soltar ficheros; (x,y) = punto del drop.
async function handleFileDrop(x, y, paths) {
    clearDropCues();
    const txps = (paths || []).filter((p) => /\.txp$/i.test(p));
    if (!txps.length) {
        if (paths && paths.length) toast(t('onlyTxp'), 'err');
        return;
    }
    const base = targetSlotFromPoint(x, y);
    if (base == null) {
        // Soltado fuera de la tabla: que el usuario elija el slot.
        state.droppedPaths = txps;
        toast(t('droppedToast', { n: txps.length }), '');
        pickSlotModal(txps);
        return;
    }
    await uploadPaths(txps, base);
}

/* ---- backup ---- */
async function backup() {
    const b = backend();
    if (!b || !state.snapshot) { toast(t('backupFirst'), ''); return; }
    try {
        const path = await b.Backup(JSON.stringify(state.snapshot, null, 2));
        if (path) toast(t('backupSaved', { path }), 'ok');
    } catch (e) {
        toast(t('backupErr', { e }), 'err');
    }
}

/* ---- polling ---- */
async function togglePolling(force) {
    const b = backend();
    if (!b) return;
    const want = force == null ? !state.polling : force;
    if (want === state.polling) return;
    try {
        if (want) {
            await b.StartPolling(state.port);
        } else {
            await b.StopPolling();
        }
    } catch (e) {
        toast(t('pollErr', { e }), 'err');
    }
}
function setPollingUI(on) {
    state.polling = on;
    $('btnPoll').classList.toggle('on', on);
    $('pollBadge').classList.toggle('hidden', !on);
}
function onFootswitch(st) {
    if (!state.snapshot) return;
    // Tonex Pedal: el poller reporta el preset activo (registro 81 01). Si cambió
    // (p.ej. el usuario pisó el footswitch del pedal), resaltamos esa fila y la
    // traemos a la vista. El Pedal no usa assignments/activeSlot/colores del One.
    if (isPedal()) {
        if (st && typeof st.activePreset === 'number' && st.activePreset >= 0
            && st.activePreset !== state.pedalActiveIndex) {
            state.pedalActiveIndex = st.activePreset;
            updateActiveHighlight();
            const tr = document.querySelector(`#slotBody tr[data-index="${st.activePreset}"]`);
            if (tr) tr.scrollIntoView({ block: 'nearest' });
        }
        return;
    }
    const a = state.snapshot.assignments || {};
    const na = st.assignments || {};
    const changed = st.activeSlot !== state.snapshot.activeSlot
        || na.a !== a.a || na.b !== a.b || na.c !== a.c;
    state.snapshot.activeSlot = st.activeSlot;
    state.snapshot.assignments = st.assignments;
    if (st.colors && st.colors.length) state.snapshot.colors = st.colors;
    if (changed) {
        renderCards();
        updateActiveHighlight();
    }
}

/* ---- traducir progreso del backend (mensajes en español) ---- */
function translateProgress(msg) {
    let m;
    if (/^Conectando con el pedal/.test(msg)) return t('pConnecting');
    if ((m = msg.match(/^Leyendo slot (\d+)\/(\d+)/))) return t('pReadingSlot', { n: m[1], total: m[2] });
    if (/^Generando/.test(msg)) return t('pGenerating');
    if (/^Enviando setup/.test(msg)) return t('pSendingSetup');
    if ((m = msg.match(/^Subiendo al slot (\d+)/))) return t('pUploadingSlot', { n: m[1] });
    if (/^Leyendo slot actualizado/.test(msg)) return t('pReadingUpdated');
    if ((m = msg.match(/^Cargando en (.+?)\.\.\./))) return t('pLoadingInto', { pos: m[1] });
    return msg;
}

/* ---- modal helpers ---- */
function openModal(html) {
    $('modal').innerHTML = html;
    $('overlay').classList.remove('hidden');
    $('modal').querySelectorAll('[data-close]').forEach((el) => { el.onclick = closeModal; });
}
function closeModal() { $('overlay').classList.add('hidden'); }

/* ---- init ---- */
function wireEvents() {
    $('btnRefresh').onclick = refresh;
    $('btnOpen').onclick = () => uploadFlowChooseSlot();
    $('btnBackup').onclick = backup;
    $('btnPoll').onclick = () => togglePolling();
    $('btnHelp').onclick = showHelp;
    $('btnDonate').onclick = openDonate;
    $('portSelect').onchange = (e) => { state.port = e.target.value; };
    $('langSwitch').querySelectorAll('.lang-btn').forEach((b) => {
        b.onclick = () => setLang(b.dataset.lang);
    });

    $('slotBody').addEventListener('click', (e) => {
        const tr = e.target.closest('tr[data-index]');
        if (!tr) return;
        const idx = parseInt(tr.dataset.index, 10);
        if (e.target.closest('.slot-led') && !isPedal()) {   // click en el LED → paleta de color (no en Pedal)
            e.stopPropagation();
            selectRow(idx);
            colorFlow(idx);
            return;
        }
        selectRow(idx);
        if (isPedal()) selectOnPedal(idx); // Pedal: clic = cambiar preset activo
    });
    $('slotBody').addEventListener('dblclick', (e) => {
        const tr = e.target.closest('tr[data-index]');
        if (tr) showDetails(parseInt(tr.dataset.index, 10));
    });
    $('slotBody').addEventListener('contextmenu', (e) => {
        const tr = e.target.closest('tr[data-index]');
        if (!tr) return;
        e.preventDefault();
        showContextMenu(e.clientX, e.clientY, parseInt(tr.dataset.index, 10));
    });

    // Drag interno: arrastrar una fila de la tabla sobre una tarjeta A/B/Stomp
    // la asigna (paridad con la versión Python).
    $('slotBody').addEventListener('dragstart', (e) => {
        const tr = e.target.closest('tr[data-index]');
        if (!tr) return;
        state.dragRowIndex = parseInt(tr.dataset.index, 10);
        tr.classList.add('drag-src');
        if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(state.dragRowIndex)); }
    });
    $('slotBody').addEventListener('dragend', (e) => {
        const tr = e.target.closest('tr[data-index]');
        if (tr) tr.classList.remove('drag-src');
        state.dragRowIndex = null;
        document.querySelectorAll('.card.drop-target').forEach((c) => c.classList.remove('drop-target'));
    });
    $('cards').addEventListener('dragover', (e) => {
        if (state.dragRowIndex == null) return;
        const card = e.target.closest('.card[data-proto]');
        if (!card) return;
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
        document.querySelectorAll('.card.drop-target').forEach((c) => { if (c !== card) c.classList.remove('drop-target'); });
        card.classList.add('drop-target');
    });
    $('cards').addEventListener('dragleave', (e) => {
        const card = e.target.closest('.card[data-proto]');
        if (card && !card.contains(e.relatedTarget)) card.classList.remove('drop-target');
    });
    $('cards').addEventListener('drop', (e) => {
        const card = e.target.closest('.card[data-proto]');
        if (!card || state.dragRowIndex == null) return;
        e.preventDefault();
        const idx = state.dragRowIndex;
        state.dragRowIndex = null;
        card.classList.remove('drop-target');
        const proto = card.dataset.proto;          // A | B | C
        loadInto(proto === 'C' ? 'STOMP' : proto, idx);
    });

    document.addEventListener('click', hideContextMenu);
    $('overlay').addEventListener('click', (e) => { if (e.target.id === 'overlay') closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { hideContextMenu(); closeModal(); } });

    // Drag de ficheros externos (.txp): resaltamos las filas-destino bajo el
    // puntero (desde el slot apuntado hacia abajo). El drop real lo entrega
    // window.runtime.OnFileDrop (registrado en subscribeBackend) con coordenadas.
    // Solo actuamos si el arrastre trae "Files" y NO es un arrastre interno de filas.
    window.addEventListener('dragover', (e) => {
        if (state.dragRowIndex != null) return;
        if (!Array.from((e.dataTransfer && e.dataTransfer.types) || []).includes('Files')) return;
        e.preventDefault();
        const count = (e.dataTransfer.items && e.dataTransfer.items.length) || 1;
        showDropCues(e.clientX, e.clientY, count);
    });
    window.addEventListener('dragleave', (e) => { if (e.clientX <= 0 || e.clientY <= 0) clearDropCues(); });
    window.addEventListener('drop', () => clearDropCues());
}

// Botón "Abrir .txp": elige ficheros y luego slot destino.
async function uploadFlowChooseSlot() {
    const b = backend();
    if (!b) return;
    let paths;
    try { paths = await b.OpenTXPDialog(); } catch (e) { toast(t('dlgErr', { e }), 'err'); return; }
    if (!paths || !paths.length) return;
    state.droppedPaths = paths;
    pickSlotModal(paths);
}

function pickSlotModal(paths) {
    const cells = (state.snapshot ? state.snapshot.presets : Array.from({ length: slotCount() }, (_, i) => ({ index: i, name: '' })))
        .map((p) => `<div class="slot-pick" data-slot="${p.index}">${slotNum(p.index)}<span class="sp-name">${esc(displayName(p) || '')}</span></div>`).join('');
    const n = paths.length;
    openModal(`
    <h2>${n > 1 ? t('pickTitleMulti', { n }) : t('pickTitleOne')}</h2>
    <div class="modal-sub">${n > 1 ? t('pickSubMulti') : t('pickSubOne')}</div>
    <div class="slot-grid">${cells}</div>
    <div class="modal-actions"><button class="btn" data-close>${t('cancel')}</button></div>`);
    $('modal').querySelectorAll('.slot-pick').forEach((c) => {
        c.onclick = () => {
            const slot = parseInt(c.dataset.slot, 10);
            closeModal();
            const p = state.droppedPaths.slice();
            state.droppedPaths = [];
            uploadPaths(p, slot);
        };
    });
}

function subscribeBackend() {
    const r = rt();
    if (!r) return;
    r.EventsOn('progress', (msg) => setStatus(translateProgress(msg), 'busy'));
    r.EventsOn('snap-state', onSnapState);   // carga progresiva: esqueleto
    r.EventsOn('snap-slot', fillRow);        // carga progresiva: fila a fila
    r.EventsOn('footswitch', onFootswitch);
    r.EventsOn('polling-state', (on) => setPollingUI(!!on));
    r.EventsOn('polling-error', (msg) => { toast(t('pollStopped', { msg }), 'err'); setPollingUI(false); });
    // Registrar el drag & drop de ficheros DEL FRONTEND: esto añade los listeners
    // del navegador que hacen preventDefault (si no, WebView2 abre el .txp soltado).
    // useDropTarget=false → el callback se dispara siempre, sin depender del CSS.
    if (typeof r.OnFileDrop === 'function') {
        r.OnFileDrop((x, y, paths) => { handleFileDrop(x, y, paths); }, false);
    }
}

async function init() {
    installLogo();
    wireEvents();
    subscribeBackend();
    applyMonetizationUI();
    // Cargar la configuración de monetización en paralelo sin bloquear el arranque
    loadMonetizationConfig();
    applyLang();
    await loadPorts();
    if (state.port && state.autoDetected) {
        // Paridad con la versión Python: al arrancar, lee el pedal y empieza el
        // polling del footswitch automáticamente (solo si se detectó un Tonex).
        await refresh();
        await togglePolling(true);
    } else if (!state.port) {
        setStatus(t('statusReady'), '');
    }
}

window.addEventListener('DOMContentLoaded', init);
