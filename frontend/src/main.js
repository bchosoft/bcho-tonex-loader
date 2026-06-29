import './style.css';

/* ---------------------------------------------------------------------------
 * Tonex Loader — frontend (vanilla). Habla con el backend Go vía los globals
 * que inyecta Wails (window.go.main.App y window.runtime).
 * ------------------------------------------------------------------------- */

/* ===========================================================================
 * i18n
 * ========================================================================= */
const SUPPORTED_LANGS = ['es', 'en', 'gl', 'pt', 'it', 'fr', 'de'];
const DEFAULT_LANG = 'es';
const LANGUAGE_STORAGE_KEY = 'tonexLang';

function normalizeLang(value) {
    return SUPPORTED_LANGS.includes(value) ? value : DEFAULT_LANG;
}

const I18N = {
    es: {
        subtitle: 'Tonex One & Tonex Pedal',
        btnRefresh: '⟳ Refrescar',
        btnOpen: '📂 Abrir .txp',
        btnBackup: '💾 Backup',
        btnHelp: '❔ Ayuda',
        btnDonate: '☕ Donar',
        donateTitle: 'Apoya el proyecto en Ko-fi',
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
        reloadProgressTitle: 'Recargando…',
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
        importProgressTitle: 'Importando presets…',
        noAck: 'Sin ACK al subir {file} (puede haberse aplicado).',
        uploadFileErr: 'Error subiendo {file}: {e}',
        uploadDone: 'Subida completada: {ok}/{total}.',
        exporting: 'Exportando slot {n} a .txp...',
        exportProgressTitle: 'Exportando preset…',
        exportMultiProgressTitle: 'Exportando presets…',
        exportingMulti: 'Exportando {total} presets…',
        exportRunning: 'Exportando… {done}/{total}',
        exportMultiDone: '{ok}/{total} .txp exportados a {dir}',
        exportMultiDoneFailed: 'Exportados {ok}/{total} .txp ({fail} con error).',
        ctxSelCount: '{n} slots seleccionados',
        ctxExportMulti: 'Exportar {n} .txp',
        ctxExportMultiBcho: 'Exportar {n} .txp con BCho',
        exportSaved: '.txp exportado: {path}',
        exportErr: 'No se pudo exportar .txp: {e}',
        btnBackupTitle: 'Backup completo del pedal a un .zip restaurable',
        btnRestore: '♻ Restaurar',
        btnRestoreTitle: 'Restaurar un backup .zip al pedal',
        backupFirst: 'Conecta el pedal primero.',
        backupRunning: 'Creando backup… {done}/{total} slots',
        backupProgressTitle: 'Creando backup…',
        backupSaved: 'Backup guardado: {path}',
        backupErr: 'Error guardando backup: {e}',
        restoreRunning: 'Restaurando… {done}/{total}',
        restoreProgressTitle: 'Restaurando backup…',
        restoreDone: 'Restauración completada: {ok}/{total} slots.',
        restoreDoneFailed: 'Restauración: {ok}/{total} slots ({fail} con error).',
        restoreErr: 'Error restaurando: {e}',
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
        reminderMsg: 'Recuerda que por una contribución mínima de 2 euros puedes tener la versión completa. ;-)',
        reminderCloseIn: 'Cerrar en {s} s',
        reminderCloseBtn: 'Cerrar',
        reminderCanClose: 'Ya puedes cerrar esta ventana',
        supportProject: '☕ Apoya el proyecto',
        supportProjectTitle: 'Apoya el proyecto',
        donateAndActivate: '☕ Dona y Activa',
        donateAndActivateTitle: 'Dona y Activa',
        languageSelectorLabel: 'Selector de idioma',
        fullVersion: 'Versión Completa',
        restrictedVersion: 'Versión Restringida',
        donationTitleText: 'Apoya el proyecto',
        donationBody: '<p>🇪🇸 Las herramientas usadas para desarrollar esta app <b>no son gratuitas</b>. Si te resulta útil, considera una donación. Sin donación, cada sesión permite <b>3 importaciones</b> y <b>3 exportaciones</b>. Al donar desaparecen esta pantalla y <b>todos los límites</b>, para siempre, en este equipo.</p>',
        donationImportant: 'IMPORTANTE: Pega este código en el mensaje de tu donación',
        donationDonateButton: '☕ Donar',
        donationCheckButton: 'Ya he donado',
        donationManualToggle: '¿Tienes un código?',
        donationSupportId: 'ID de soporte (envíalo si necesitas un código):',
        donationCodePlaceholder: 'Pega aquí tu código',
        donationApplyButton: 'Aplicar',
        donationCloseTitle: 'Cerrar',
        donationCopyTitle: 'Copiar',
        donationCountdown: 'Podrás usar la app en <span class="countdown-num">{s}</span> s',
        donationVerified: '¡Donación verificada! Gracias 💚',
        donationChecking: 'Comprobando...',
        donationNotFound: 'Aún no consta tu donación. Espera unos segundos tras donar y reinténtalo.',
        donationNotFoundHint: 'Si en 1 minuto no se activa, pulsa en el enlace inferior "¿Tienes un código?", copia el ID de soporte y envíalo por mensaje privado para recibir otro código que podrás pegar en esta ventana.',
        donationApplyingCode: 'Aplicando código...',
        donationInvalidCode: 'Código no válido para este equipo.',
        // progreso (traducción de los mensajes del backend)
        pConnecting: 'Conectando con el pedal…',
        pReadingSlot: 'Leyendo slot {n}/{total}…',
        pGenerating: 'Generando datos de subida…',
        pSendingSetup: 'Enviando configuración…',
        pUploadingSlot: 'Subiendo al slot {n}…',
        pReadingUpdated: 'Leyendo el slot actualizado…',
        pLoadingInto: 'Cargando en {pos}…',
        pExporting: 'Exportando slot {n}/{total}…',
        pRestoringSlot: 'Restaurando slot {n}/{total}…',
        pRestoringColors: 'Restaurando colores…',
        pRestoringAssign: 'Restaurando asignaciones…',
        helpTitle: 'Ayuda — Tonex Loader',
    },
    en: {
        subtitle: 'Tonex One & Tonex Pedal',
        btnRefresh: '⟳ Refresh',
        btnOpen: '📂 Open .txp',
        btnBackup: '💾 Backup',
        btnHelp: '❔ Help',
        btnDonate: '☕ Donate',
        donateTitle: 'Support the project on Ko-fi',
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
        reloadProgressTitle: 'Reloading…',
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
        importProgressTitle: 'Importing presets…',
        noAck: 'No ACK uploading {file} (it may still have applied).',
        uploadFileErr: 'Error uploading {file}: {e}',
        uploadDone: 'Upload finished: {ok}/{total}.',
        exporting: 'Exporting slot {n} to .txp...',
        exportProgressTitle: 'Exporting preset…',
        exportMultiProgressTitle: 'Exporting presets…',
        exportingMulti: 'Exporting {total} presets…',
        exportRunning: 'Exporting… {done}/{total}',
        exportMultiDone: '{ok}/{total} .txp exported to {dir}',
        exportMultiDoneFailed: 'Exported {ok}/{total} .txp ({fail} failed).',
        ctxSelCount: '{n} slots selected',
        ctxExportMulti: 'Export {n} .txp',
        ctxExportMultiBcho: 'Export {n} .txp with BCho',
        exportSaved: '.txp exported: {path}',
        exportErr: 'Could not export .txp: {e}',
        btnBackupTitle: 'Full pedal backup to a restorable .zip',
        btnRestore: '♻ Restore',
        btnRestoreTitle: 'Restore a .zip backup to the pedal',
        backupFirst: 'Connect the pedal first.',
        backupRunning: 'Creating backup… {done}/{total} slots',
        backupProgressTitle: 'Creating backup…',
        backupSaved: 'Backup saved: {path}',
        backupErr: 'Error saving backup: {e}',
        restoreRunning: 'Restoring… {done}/{total}',
        restoreProgressTitle: 'Restoring backup…',
        restoreDone: 'Restore finished: {ok}/{total} slots.',
        restoreDoneFailed: 'Restore: {ok}/{total} slots ({fail} failed).',
        restoreErr: 'Error restoring: {e}',
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
        reminderMsg: 'Remember that for a minimum contribution of €2 you can get the full version. ;-)',
        reminderCloseIn: 'Close in {s} s',
        reminderCloseBtn: 'Close',
        reminderCanClose: 'You can now close this window',
        supportProject: '☕ Support the project',
        supportProjectTitle: 'Support the project',
        donateAndActivate: '☕ Donate & Activate',
        donateAndActivateTitle: 'Donate & Activate',
        languageSelectorLabel: 'Language selector',
        fullVersion: 'Full Version',
        restrictedVersion: 'Restricted Version',
        donationTitleText: 'Support the project',
        donationBody: '<p>🇬🇧 The tools used to build this app <b>aren’t free</b>. If you find it useful, please consider donating. Without a donation, each session allows <b>3 imports</b> and <b>3 exports</b>. Donating removes this screen and <b>all limits</b>, forever, on this computer.</p>',
        donationImportant: 'IMPORTANT: Paste this code in your donation message',
        donationDonateButton: '☕ Donate',
        donationCheckButton: "I've donated",
        donationManualToggle: 'Have a code?',
        donationSupportId: 'Support ID (send it if you need a code):',
        donationCodePlaceholder: 'Paste your code here',
        donationApplyButton: 'Apply',
        donationCloseTitle: 'Close',
        donationCopyTitle: 'Copy',
        donationCountdown: 'You can use the app in <span class="countdown-num">{s}</span> s',
        donationVerified: 'Donation verified! Thanks 💚',
        donationChecking: 'Checking...',
        donationNotFound: 'Donation not found yet. Wait a few seconds after donating and try again.',
        donationNotFoundHint: 'If it is not activated in 1 minute, click "Have a code?", copy the Support ID and send it by private message to receive another code to paste here.',
        donationApplyingCode: 'Applying code...',
        donationInvalidCode: 'Code not valid for this computer.',
        pConnecting: 'Connecting to the pedal…',
        pReadingSlot: 'Reading slot {n}/{total}…',
        pGenerating: 'Generating upload data…',
        pSendingSetup: 'Sending setup…',
        pUploadingSlot: 'Uploading to slot {n}…',
        pReadingUpdated: 'Reading the updated slot…',
        pLoadingInto: 'Loading into {pos}…',
        pExporting: 'Exporting slot {n}/{total}…',
        pRestoringSlot: 'Restoring slot {n}/{total}…',
        pRestoringColors: 'Restoring colours…',
        pRestoringAssign: 'Restoring assignments…',
        helpTitle: 'Help — Tonex Loader',
    },
};

Object.assign(I18N, {
    gl: {
        ...I18N.es,
        btnRefresh: '⟳ Actualizar',
        btnOpen: '📂 Abrir .txp',
        btnHelp: '❔ Axuda',
        btnDonate: '☕ Doar',
        donateTitle: 'Apoia o proxecto en Ko-fi',
        portTitle: 'Porto COM do pedal',
        pollTitle: 'Seguir o footswitch en directo',
        thName: 'Nome', thCharacter: 'Carácter', thTone: 'Modelo', thAmp: 'Amplificador', thCab: 'Pantalla', thAssigned: 'Asignado',
        emptyRow: 'Conecta o pedal e preme <b>Actualizar</b>.',
        statusReady: 'Listo. Conecta un pedal Tonex.',
        noPedal: 'Non se detecta ningún pedal Tonex por USB.',
        pedalDetected: 'Pedal detectado en {port}.',
        reading: 'Lendo o pedal…',
        readDone: 'Lidos {n} slots desde {port}.',
        close: 'Pechar', cancel: 'Cancelar',
        offlineWarning: 'Non se pode conectar co servidor de control. Modo sen conexión: sen pantalla de doazón e con límite de 1 importación e 1 exportación por sesión.',
        offlineImportLimit: 'Modo sen conexión: límite de 1 importación por sesión.',
        offlineExportLimit: 'Modo sen conexión: límite de 1 exportación por sesión.',
        reminderMsg: 'Lembra que por unha contribución mínima de 2 euros podes ter a versión completa. ;-)',
        reminderCloseIn: 'Pechar en {s} s',
        reminderCloseBtn: 'Pechar',
        reminderCanClose: 'Xa podes pechar esta xanela',
        supportProject: '☕ Apoia o proxecto',
        supportProjectTitle: 'Apoia o proxecto',
        donateAndActivate: '☕ Doa e Activa',
        donateAndActivateTitle: 'Doa e Activa',
        languageSelectorLabel: 'Selector de idioma',
        fullVersion: 'Versión Completa',
        restrictedVersion: 'Versión Restrinxida',
        donationTitleText: 'Apoia o proxecto',
        donationBody: '<p>As ferramentas usadas para desenvolver esta app <b>non son gratuítas</b>. Se che resulta útil, considera facer unha doazón. Sen doazón, cada sesión permite <b>3 importacións</b> e <b>3 exportacións</b>. Ao doar desaparecen esta pantalla e <b>todos os límites</b>, para sempre, neste equipo.</p>',
        donationImportant: 'IMPORTANTE: Pega este código na mensaxe da túa doazón',
        donationDonateButton: '☕ Doar',
        donationCheckButton: 'Xa doei',
        donationManualToggle: 'Tes un código?',
        donationSupportId: 'ID de soporte (envíao se precisas un código):',
        donationCodePlaceholder: 'Pega aquí o teu código',
        donationApplyButton: 'Aplicar',
        donationCloseTitle: 'Pechar',
        donationCopyTitle: 'Copiar',
        donationCountdown: 'Poderás usar a app en <span class="countdown-num">{s}</span> s',
        donationVerified: 'Doazón verificada! Grazas 💚',
        donationChecking: 'Comprobando...',
        donationNotFound: 'Aínda non consta a túa doazón. Agarda uns segundos despois de doar e téntao de novo.',
        donationNotFoundHint: 'Se en 1 minuto non se activa, preme "Tes un código?", copia o ID de soporte e envíao por mensaxe privada para recibir outro código.',
        donationApplyingCode: 'Aplicando código...',
        donationInvalidCode: 'Código non válido para este equipo.',
        helpTitle: 'Axuda — Tonex Loader',
    },
    pt: {
        ...I18N.es,
        btnRefresh: '⟳ Atualizar',
        btnOpen: '📂 Abrir .txp',
        btnHelp: '❔ Ajuda',
        btnDonate: '☕ Doar',
        donateTitle: 'Apoie o projeto no Ko-fi',
        portTitle: 'Porta COM do pedal',
        pollTitle: 'Seguir o footswitch ao vivo',
        thName: 'Nome', thCharacter: 'Caráter', thTone: 'Modelo', thAmp: 'Amplificador', thCab: 'Caixa', thAssigned: 'Atribuído',
        emptyRow: 'Conecte o pedal e clique em <b>Atualizar</b>.',
        statusReady: 'Pronto. Conecte um pedal Tonex.',
        noPedal: 'Nenhum pedal Tonex detectado por USB.',
        pedalDetected: 'Pedal detectado em {port}.',
        reading: 'Lendo o pedal…',
        readDone: '{n} slots lidos de {port}.',
        close: 'Fechar', cancel: 'Cancelar',
        offlineWarning: 'Não foi possível conectar ao servidor de controle. Modo offline: sem tela de doação e limitado a 1 importação e 1 exportação por sessão.',
        offlineImportLimit: 'Modo offline: limite de 1 importação por sessão.',
        offlineExportLimit: 'Modo offline: limite de 1 exportação por sessão.',
        reminderMsg: 'Lembre-se: com uma contribuição mínima de 2 euros você pode ter a versão completa. ;-)',
        reminderCloseIn: 'Fechar em {s} s',
        reminderCloseBtn: 'Fechar',
        reminderCanClose: 'Você já pode fechar esta janela',
        supportProject: '☕ Apoie o projeto',
        supportProjectTitle: 'Apoie o projeto',
        donateAndActivate: '☕ Doe e Ative',
        donateAndActivateTitle: 'Doe e Ative',
        languageSelectorLabel: 'Seletor de idioma',
        fullVersion: 'Versão Completa',
        restrictedVersion: 'Versão Restrita',
        donationTitleText: 'Apoie o projeto',
        donationBody: '<p>🇵🇹 🇧🇷 As ferramentas usadas para criar este app <b>não são gratuitas</b>. Se ele for útil para você, considere fazer uma doação. Sem doação, cada sessão permite <b>3 importações</b> e <b>3 exportações</b>. Ao doar, esta tela e <b>todos os limites</b> desaparecem para sempre neste computador.</p>',
        donationImportant: 'IMPORTANTE: Cole este código na mensagem da sua doação',
        donationDonateButton: '☕ Doar',
        donationCheckButton: 'Já doei',
        donationManualToggle: 'Tem um código?',
        donationSupportId: 'ID de suporte (envie se precisar de um código):',
        donationCodePlaceholder: 'Cole seu código aqui',
        donationApplyButton: 'Aplicar',
        donationCloseTitle: 'Fechar',
        donationCopyTitle: 'Copiar',
        donationCountdown: 'Você poderá usar o app em <span class="countdown-num">{s}</span> s',
        donationVerified: 'Doação verificada! Obrigado 💚',
        donationChecking: 'Verificando...',
        donationNotFound: 'Sua doação ainda não aparece. Aguarde alguns segundos depois de doar e tente novamente.',
        donationNotFoundHint: 'Se em 1 minuto não for ativado, clique em "Tem um código?", copie o ID de suporte e envie por mensagem privada para receber outro código.',
        donationApplyingCode: 'Aplicando código...',
        donationInvalidCode: 'Código não válido para este computador.',
        helpTitle: 'Ajuda — Tonex Loader',
    },
    it: {
        ...I18N.en,
        btnRefresh: '⟳ Aggiorna',
        btnOpen: '📂 Apri .txp',
        btnHelp: '❔ Aiuto',
        btnDonate: '☕ Dona',
        donateTitle: 'Sostieni il progetto su Ko-fi',
        portTitle: 'Porta COM del pedale',
        pollTitle: 'Segui il footswitch in tempo reale',
        emptyRow: 'Collega il pedale e premi <b>Aggiorna</b>.',
        statusReady: 'Pronto. Collega un pedale Tonex.',
        noPedal: 'Nessun pedale Tonex rilevato via USB.',
        pedalDetected: 'Pedale rilevato su {port}.',
        reading: 'Lettura del pedale…',
        close: 'Chiudi', cancel: 'Annulla',
        offlineWarning: 'Impossibile raggiungere il server di controllo. Modalità offline: nessuna schermata di donazione e limite di 1 importazione e 1 esportazione per sessione.',
        offlineImportLimit: 'Modalità offline: limite di 1 importazione per sessione.',
        offlineExportLimit: 'Modalità offline: limite di 1 esportazione per sessione.',
        reminderMsg: 'Ricorda che con un contributo minimo di 2 euro puoi avere la versione completa. ;-)',
        reminderCloseIn: 'Chiudi tra {s} s',
        reminderCloseBtn: 'Chiudi',
        reminderCanClose: 'Ora puoi chiudere questa finestra',
        supportProject: '☕ Sostieni il progetto',
        supportProjectTitle: 'Sostieni il progetto',
        donateAndActivate: '☕ Dona e Attiva',
        donateAndActivateTitle: 'Dona e Attiva',
        languageSelectorLabel: 'Selettore lingua',
        fullVersion: 'Versione Completa',
        restrictedVersion: 'Versione Limitata',
        donationTitleText: 'Sostieni il progetto',
        donationBody: '<p>🇮🇹 Gli strumenti usati per sviluppare questa app <b>non sono gratuiti</b>. Se ti è utile, valuta una donazione. Senza donazione, ogni sessione permette <b>3 importazioni</b> e <b>3 esportazioni</b>. Con una donazione questa schermata e <b>tutti i limiti</b> spariscono per sempre su questo computer.</p>',
        donationImportant: 'IMPORTANTE: incolla questo codice nel messaggio della tua donazione',
        donationDonateButton: '☕ Dona',
        donationCheckButton: 'Ho donato',
        donationManualToggle: 'Hai un codice?',
        donationSupportId: 'ID di supporto (invialo se ti serve un codice):',
        donationCodePlaceholder: 'Incolla qui il tuo codice',
        donationApplyButton: 'Applica',
        donationCloseTitle: 'Chiudi',
        donationCopyTitle: 'Copia',
        donationCountdown: 'Potrai usare l’app tra <span class="countdown-num">{s}</span> s',
        donationVerified: 'Donazione verificata! Grazie 💚',
        donationChecking: 'Verifica in corso...',
        donationNotFound: 'La tua donazione non risulta ancora. Attendi qualche secondo dopo aver donato e riprova.',
        donationNotFoundHint: 'Se non si attiva entro 1 minuto, fai clic su "Hai un codice?", copia l’ID di supporto e invialo tramite messaggio privato per ricevere un altro codice.',
        donationApplyingCode: 'Applicazione del codice...',
        donationInvalidCode: 'Codice non valido per questo computer.',
        helpTitle: 'Aiuto — Tonex Loader',
    },
    fr: {
        ...I18N.en,
        btnRefresh: '⟳ Actualiser',
        btnOpen: '📂 Ouvrir .txp',
        btnHelp: '❔ Aide',
        btnDonate: '☕ Faire un don',
        donateTitle: 'Soutenir le projet sur Ko-fi',
        portTitle: 'Port COM de la pédale',
        pollTitle: 'Suivre le footswitch en direct',
        emptyRow: 'Connectez la pédale et cliquez sur <b>Actualiser</b>.',
        statusReady: 'Prêt. Connectez une pédale Tonex.',
        noPedal: 'Aucune pédale Tonex détectée par USB.',
        pedalDetected: 'Pédale détectée sur {port}.',
        reading: 'Lecture de la pédale…',
        close: 'Fermer', cancel: 'Annuler',
        offlineWarning: 'Impossible de joindre le serveur de contrôle. Mode hors ligne : pas d’écran de don, limite de 1 importation et 1 exportation par session.',
        offlineImportLimit: 'Mode hors ligne : limite de 1 importation par session.',
        offlineExportLimit: 'Mode hors ligne : limite de 1 exportation par session.',
        reminderMsg: 'Rappel : avec une contribution minimale de 2 euros, vous pouvez obtenir la version complète. ;-)',
        reminderCloseIn: 'Fermer dans {s} s',
        reminderCloseBtn: 'Fermer',
        reminderCanClose: 'Vous pouvez maintenant fermer cette fenêtre',
        supportProject: '☕ Soutenez le projet',
        supportProjectTitle: 'Soutenez le projet',
        donateAndActivate: '☕ Donnez et Activez',
        donateAndActivateTitle: 'Donnez et Activez',
        languageSelectorLabel: 'Sélecteur de langue',
        fullVersion: 'Version Complète',
        restrictedVersion: 'Version Limitée',
        donationTitleText: 'Soutenir le projet',
        donationBody: '<p>🇫🇷 Les outils utilisés pour développer cette app <b>ne sont pas gratuits</b>. Si elle vous est utile, pensez à faire un don. Sans don, chaque session permet <b>3 importations</b> et <b>3 exportations</b>. Un don supprime cet écran et <b>toutes les limites</b>, définitivement, sur cet ordinateur.</p>',
        donationImportant: 'IMPORTANT : collez ce code dans le message de votre don',
        donationDonateButton: '☕ Faire un don',
        donationCheckButton: 'J’ai fait un don',
        donationManualToggle: 'Vous avez un code ?',
        donationSupportId: 'ID de support (envoyez-le si vous avez besoin d’un code) :',
        donationCodePlaceholder: 'Collez votre code ici',
        donationApplyButton: 'Appliquer',
        donationCloseTitle: 'Fermer',
        donationCopyTitle: 'Copier',
        donationCountdown: 'Vous pourrez utiliser l’app dans <span class="countdown-num">{s}</span> s',
        donationVerified: 'Don vérifié ! Merci 💚',
        donationChecking: 'Vérification...',
        donationNotFound: 'Votre don n’apparaît pas encore. Attendez quelques secondes après le don, puis réessayez.',
        donationNotFoundHint: 'Si l’activation ne se fait pas dans 1 minute, cliquez sur "Vous avez un code ?", copiez l’ID de support et envoyez-le par message privé pour recevoir un autre code.',
        donationApplyingCode: 'Application du code...',
        donationInvalidCode: 'Code non valide pour cet ordinateur.',
        helpTitle: 'Aide — Tonex Loader',
    },
    de: {
        ...I18N.en,
        btnRefresh: '⟳ Aktualisieren',
        btnOpen: '📂 .txp öffnen',
        btnHelp: '❔ Hilfe',
        btnDonate: '☕ Spenden',
        donateTitle: 'Das Projekt auf Ko-fi unterstützen',
        portTitle: 'COM-Port des Pedals',
        pollTitle: 'Footswitch live verfolgen',
        emptyRow: 'Pedal anschließen und <b>Aktualisieren</b> klicken.',
        statusReady: 'Bereit. Schließe ein Tonex-Pedal an.',
        noPedal: 'Kein Tonex-Pedal per USB erkannt.',
        pedalDetected: 'Pedal an {port} erkannt.',
        reading: 'Pedal wird gelesen…',
        close: 'Schließen', cancel: 'Abbrechen',
        offlineWarning: 'Der Kontrollserver ist nicht erreichbar. Offline-Modus: kein Spendenfenster, Limit von 1 Import und 1 Export pro Sitzung.',
        offlineImportLimit: 'Offline-Modus: Limit von 1 Import pro Sitzung.',
        offlineExportLimit: 'Offline-Modus: Limit von 1 Export pro Sitzung.',
        reminderMsg: 'Hinweis: Mit einem Mindestbeitrag von 2 Euro erhältst du die Vollversion. ;-)',
        reminderCloseIn: 'Schließen in {s} s',
        reminderCloseBtn: 'Schließen',
        reminderCanClose: 'Du kannst dieses Fenster jetzt schließen',
        supportProject: '☕ Unterstütze das Projekt',
        supportProjectTitle: 'Unterstütze das Projekt',
        donateAndActivate: '☕ Spenden & Aktivieren',
        donateAndActivateTitle: 'Spenden & Aktivieren',
        languageSelectorLabel: 'Sprachauswahl',
        fullVersion: 'Vollversion',
        restrictedVersion: 'Eingeschränkte Version',
        donationTitleText: 'Projekt unterstützen',
        donationBody: '<p>🇩🇪 Die Werkzeuge, mit denen diese App entwickelt wurde, <b>sind nicht kostenlos</b>. Wenn sie dir nützlich ist, denke bitte über eine Spende nach. Ohne Spende erlaubt jede Sitzung <b>3 Importe</b> und <b>3 Exporte</b>. Eine Spende entfernt dieses Fenster und <b>alle Limits</b> dauerhaft auf diesem Computer.</p>',
        donationImportant: 'WICHTIG: Füge diesen Code in die Nachricht deiner Spende ein',
        donationDonateButton: '☕ Spenden',
        donationCheckButton: 'Ich habe gespendet',
        donationManualToggle: 'Hast du einen Code?',
        donationSupportId: 'Support-ID (sende sie, wenn du einen Code brauchst):',
        donationCodePlaceholder: 'Code hier einfügen',
        donationApplyButton: 'Anwenden',
        donationCloseTitle: 'Schließen',
        donationCopyTitle: 'Kopieren',
        donationCountdown: 'Du kannst die App in <span class="countdown-num">{s}</span> s verwenden',
        donationVerified: 'Spende verifiziert! Danke 💚',
        donationChecking: 'Wird geprüft...',
        donationNotFound: 'Deine Spende wurde noch nicht gefunden. Warte nach der Spende ein paar Sekunden und versuche es erneut.',
        donationNotFoundHint: 'Wenn es nicht innerhalb von 1 Minute aktiviert wird, klicke auf "Hast du einen Code?", kopiere die Support-ID und sende sie per privater Nachricht, um einen weiteren Code zu erhalten.',
        donationApplyingCode: 'Code wird angewendet...',
        donationInvalidCode: 'Code ist für diesen Computer nicht gültig.',
        helpTitle: 'Hilfe — Tonex Loader',
    },
});

const COMPLETE_I18N = {
    gl: {
        subtitle: 'Tonex One e Tonex Pedal',
        btnRefresh: '⟳ Actualizar',
        btnOpen: '📂 Abrir .txp',
        btnBackup: '💾 Backup',
        btnHelp: '❔ Axuda',
        btnDonate: '☕ Doar',
        donateTitle: 'Apoia o proxecto en Ko-fi',
        portTitle: 'Porto COM do pedal',
        pollTitle: 'Seguir o footswitch en directo',
        thSlot: 'Slot',
        thName: 'Nome',
        thCharacter: 'Carácter',
        thTone: 'Modelo',
        thStomp: 'Stomp',
        thAmp: 'Amplificador',
        thCab: 'Pantalla',
        thAssigned: 'Asignado',
        emptyRow: 'Conecta o pedal e preme <b>Actualizar</b>.',
        statusReady: 'Listo. Conecta un pedal Tonex.',
        noPedal: 'Non se detecta ningún pedal Tonex por USB.',
        pedalDetected: 'Pedal detectado en {port}.',
        pickPortHint: 'Non se detectou por USB. Escolle o porto COM do pedal e preme Actualizar.',
        errPorts: 'Erro ao listar portos: {e}',
        reading: 'Lendo o pedal…',
        reloadProgressTitle: 'Recargando…',
        readDone: 'Lidos {n} slots desde {port}.',
        readErr: 'Non se puido ler o pedal: {e}',
        genericErr: 'Erro: {e}',
        active: '● ACTIVO',
        ampLabel: 'Amplificador',
        cabLabel: 'Pantalla',
        ctxDetails: '🔍 Ver detalles',
        ctxUpload: '⬆ Subir .txp aquí…',
        ctxExport: 'Exportar .txp',
        ctxExportBcho: 'Exportar .txp con BCho',
        ctxLoadA: '🎚 Cargar en A',
        ctxLoadB: '🎚 Cargar en B',
        ctxLoadStomp: '🎚 Cargar en Stomp',
        ctxColor: '🎨 Cambiar cor…',
        mEffects: 'Efectos',
        mGate: 'Noise Gate',
        mComp: 'Compresor',
        mMod: 'Modulación',
        mDelay: 'Delay',
        mReverb: 'Reverb',
        mAssignedTo: 'Asignado a',
        mColor: 'Cor do LED',
        close: 'Pechar',
        cancel: 'Cancelar',
        slotWord: 'Slot',
        loading: 'Cargando slot {n} en {pos}…',
        loaded: 'Slot {n} cargado en {pos}.',
        selected: 'Preset {n} activo no pedal: {name}',
        selectErr: 'Non se puido cambiar o preset: {e}',
        assignErr: 'Non se puido asignar: {e}',
        colorTitle: 'Cor do slot {n}',
        colorSub: 'Escolle a cor do LED para este preset.',
        colorChanging: 'Cambiando a cor do slot {n}…',
        colorDone: 'Cor do slot {n} actualizada.',
        colorErr: 'Non se puido cambiar a cor: {e}',
        dlgErr: 'Erro ao abrir o diálogo: {e}',
        uploading: 'Subindo {file} ao slot {n}… ({i}/{total})',
        importProgressTitle: 'Importando presets…',
        noAck: 'Sen ACK ao subir {file} (pode que se aplicase igualmente).',
        uploadFileErr: 'Erro ao subir {file}: {e}',
        uploadDone: 'Subida completada: {ok}/{total}.',
        exporting: 'Exportando slot {n} a .txp...',
        exportProgressTitle: 'Exportando preset…',
        exportMultiProgressTitle: 'Exportando presets…',
        exportingMulti: 'Exportando {total} presets…',
        exportRunning: 'Exportando… {done}/{total}',
        exportMultiDone: '{ok}/{total} .txp exportados en {dir}',
        exportMultiDoneFailed: 'Exportados {ok}/{total} .txp ({fail} con erro).',
        ctxSelCount: '{n} slots seleccionados',
        ctxExportMulti: 'Exportar {n} .txp',
        ctxExportMultiBcho: 'Exportar {n} .txp con BCho',
        exportSaved: '.txp exportado: {path}',
        exportErr: 'Non se puido exportar .txp: {e}',
        btnBackupTitle: 'Backup completo do pedal a un .zip restaurable',
        btnRestore: '♻ Restaurar',
        btnRestoreTitle: 'Restaurar un backup .zip no pedal',
        backupFirst: 'Conecta primeiro o pedal.',
        backupRunning: 'Creando backup… {done}/{total} slots',
        backupProgressTitle: 'Creando backup…',
        backupSaved: 'Backup gardado: {path}',
        backupErr: 'Erro ao gardar o backup: {e}',
        restoreRunning: 'Restaurando… {done}/{total}',
        restoreProgressTitle: 'Restaurando backup…',
        restoreDone: 'Restauración completada: {ok}/{total} slots.',
        restoreDoneFailed: 'Restauración: {ok}/{total} slots ({fail} con erro).',
        restoreErr: 'Erro ao restaurar: {e}',
        pollErr: 'Polling: {e}',
        pollStopped: 'Polling detido: {msg}',
        droppedToast: '{n} .txp recibido(s). Escolle o slot de destino.',
        onlyTxp: 'Só se poden subir ficheiros .txp.',
        overflowWarn: '{n} non caben por debaixo e omitíronse.',
        pickTitleMulti: 'Subir {n} presets',
        pickTitleOne: 'Subir preset',
        pickSubMulti: 'Subiranse a slots consecutivos desde o que escollas.',
        pickSubOne: 'Escolle o slot de destino.',
        dropHint: 'Solta os <b>.txp</b> aquí para subilos',
        offlineWarning: 'Non se pode conectar co servidor de control. Modo sen conexión: sen pantalla de doazón e con límite de 1 importación e 1 exportación por sesión.',
        offlineImportLimit: 'Modo sen conexión: límite de 1 importación por sesión.',
        offlineExportLimit: 'Modo sen conexión: límite de 1 exportación por sesión.',
        reminderMsg: 'Lembra que por unha contribución mínima de 2 euros podes ter a versión completa. ;-)',
        reminderCloseIn: 'Pechar en {s} s',
        reminderCloseBtn: 'Pechar',
        reminderCanClose: 'Xa podes pechar esta xanela',
        supportProject: '☕ Apoia o proxecto',
        supportProjectTitle: 'Apoia o proxecto',
        donateAndActivate: '☕ Doa e Activa',
        donateAndActivateTitle: 'Doa e Activa',
        languageSelectorLabel: 'Selector de idioma',
        fullVersion: 'Versión Completa',
        restrictedVersion: 'Versión Restrinxida',
        donationTitleText: 'Apoia o proxecto',
        donationBody: '<p>As ferramentas usadas para desenvolver esta app <b>non son gratuítas</b>. Se che resulta útil, considera facer unha doazón. Sen doazón, cada sesión permite <b>3 importacións</b> e <b>3 exportacións</b>. Ao doar desaparecen esta pantalla e <b>todos os límites</b>, para sempre, neste equipo.</p>',
        donationImportant: 'IMPORTANTE: Pega este código na mensaxe da túa doazón',
        donationDonateButton: '☕ Doar',
        donationCheckButton: 'Xa doei',
        donationManualToggle: 'Tes un código?',
        donationSupportId: 'ID de soporte (envíao se precisas un código):',
        donationCodePlaceholder: 'Pega aquí o teu código',
        donationApplyButton: 'Aplicar',
        donationCloseTitle: 'Pechar',
        donationCopyTitle: 'Copiar',
        donationCountdown: 'Poderás usar a app en <span class="countdown-num">{s}</span> s',
        donationVerified: 'Doazón verificada! Grazas 💚',
        donationChecking: 'Comprobando...',
        donationNotFound: 'Aínda non consta a túa doazón. Agarda uns segundos despois de doar e téntao de novo.',
        donationNotFoundHint: 'Se en 1 minuto non se activa, preme "Tes un código?", copia o ID de soporte e envíao por mensaxe privada para recibir outro código.',
        donationApplyingCode: 'Aplicando código...',
        donationInvalidCode: 'Código non válido para este equipo.',
        pConnecting: 'Conectando co pedal…',
        pReadingSlot: 'Lendo slot {n}/{total}…',
        pGenerating: 'Xerando datos de subida…',
        pSendingSetup: 'Enviando configuración…',
        pUploadingSlot: 'Subindo ao slot {n}…',
        pReadingUpdated: 'Lendo o slot actualizado…',
        pLoadingInto: 'Cargando en {pos}…',
        pExporting: 'Exportando slot {n}/{total}…',
        pRestoringSlot: 'Restaurando slot {n}/{total}…',
        pRestoringColors: 'Restaurando cores…',
        pRestoringAssign: 'Restaurando asignacións…',
        helpTitle: 'Axuda — Tonex Loader',
    },
    pt: {
        subtitle: 'Tonex One e Tonex Pedal',
        btnRefresh: '⟳ Atualizar',
        btnOpen: '📂 Abrir .txp',
        btnBackup: '💾 Backup',
        btnHelp: '❔ Ajuda',
        btnDonate: '☕ Doar',
        donateTitle: 'Apoie o projeto no Ko-fi',
        portTitle: 'Porta COM do pedal',
        pollTitle: 'Seguir o footswitch ao vivo',
        thSlot: 'Slot',
        thName: 'Nome',
        thCharacter: 'Caráter',
        thTone: 'Modelo',
        thStomp: 'Stomp',
        thAmp: 'Amplificador',
        thCab: 'Caixa',
        thAssigned: 'Atribuído',
        emptyRow: 'Conecte o pedal e clique em <b>Atualizar</b>.',
        statusReady: 'Pronto. Conecte um pedal Tonex.',
        noPedal: 'Nenhum pedal Tonex detectado por USB.',
        pedalDetected: 'Pedal detectado em {port}.',
        pickPortHint: 'Não foi detectado por USB. Escolha a porta COM do pedal e clique em Atualizar.',
        errPorts: 'Erro ao listar portas: {e}',
        reading: 'Lendo o pedal…',
        reloadProgressTitle: 'Recarregando…',
        readDone: '{n} slots lidos de {port}.',
        readErr: 'Não foi possível ler o pedal: {e}',
        genericErr: 'Erro: {e}',
        active: '● ATIVO',
        ampLabel: 'Amplificador',
        cabLabel: 'Caixa',
        ctxDetails: '🔍 Ver detalhes',
        ctxUpload: '⬆ Enviar .txp aqui…',
        ctxExport: 'Exportar .txp',
        ctxExportBcho: 'Exportar .txp com BCho',
        ctxLoadA: '🎚 Carregar em A',
        ctxLoadB: '🎚 Carregar em B',
        ctxLoadStomp: '🎚 Carregar em Stomp',
        ctxColor: '🎨 Alterar cor…',
        mEffects: 'Efeitos',
        mGate: 'Noise Gate',
        mComp: 'Compressor',
        mMod: 'Modulação',
        mDelay: 'Delay',
        mReverb: 'Reverb',
        mAssignedTo: 'Atribuído a',
        mColor: 'Cor do LED',
        close: 'Fechar',
        cancel: 'Cancelar',
        slotWord: 'Slot',
        loading: 'Carregando slot {n} em {pos}…',
        loaded: 'Slot {n} carregado em {pos}.',
        selected: 'Preset {n} ativo no pedal: {name}',
        selectErr: 'Não foi possível alterar o preset: {e}',
        assignErr: 'Não foi possível atribuir: {e}',
        colorTitle: 'Cor do slot {n}',
        colorSub: 'Escolha a cor do LED para este preset.',
        colorChanging: 'Alterando a cor do slot {n}…',
        colorDone: 'Cor do slot {n} atualizada.',
        colorErr: 'Não foi possível alterar a cor: {e}',
        dlgErr: 'Erro ao abrir diálogo: {e}',
        uploading: 'Enviando {file} para o slot {n}… ({i}/{total})',
        importProgressTitle: 'Importando presets…',
        noAck: 'Sem ACK ao enviar {file} (pode ter sido aplicado mesmo assim).',
        uploadFileErr: 'Erro ao enviar {file}: {e}',
        uploadDone: 'Envio concluído: {ok}/{total}.',
        exporting: 'Exportando slot {n} para .txp...',
        exportProgressTitle: 'Exportando preset…',
        exportMultiProgressTitle: 'Exportando presets…',
        exportingMulti: 'Exportando {total} presets…',
        exportRunning: 'Exportando… {done}/{total}',
        exportMultiDone: '{ok}/{total} .txp exportados para {dir}',
        exportMultiDoneFailed: 'Exportados {ok}/{total} .txp ({fail} com erro).',
        ctxSelCount: '{n} slots selecionados',
        ctxExportMulti: 'Exportar {n} .txp',
        ctxExportMultiBcho: 'Exportar {n} .txp com BCho',
        exportSaved: '.txp exportado: {path}',
        exportErr: 'Não foi possível exportar .txp: {e}',
        btnBackupTitle: 'Backup completo do pedal para um .zip restaurável',
        btnRestore: '♻ Restaurar',
        btnRestoreTitle: 'Restaurar um backup .zip no pedal',
        backupFirst: 'Conecte o pedal primeiro.',
        backupRunning: 'Criando backup… {done}/{total} slots',
        backupProgressTitle: 'Criando backup…',
        backupSaved: 'Backup salvo: {path}',
        backupErr: 'Erro ao salvar backup: {e}',
        restoreRunning: 'Restaurando… {done}/{total}',
        restoreProgressTitle: 'Restaurando backup…',
        restoreDone: 'Restauração concluída: {ok}/{total} slots.',
        restoreDoneFailed: 'Restauração: {ok}/{total} slots ({fail} com erro).',
        restoreErr: 'Erro ao restaurar: {e}',
        pollErr: 'Polling: {e}',
        pollStopped: 'Polling interrompido: {msg}',
        droppedToast: '{n} .txp recebido(s). Escolha o slot de destino.',
        onlyTxp: 'Só é possível enviar arquivos .txp.',
        overflowWarn: '{n} não cabem abaixo e foram ignorados.',
        pickTitleMulti: 'Enviar {n} presets',
        pickTitleOne: 'Enviar preset',
        pickSubMulti: 'Eles serão enviados para slots consecutivos a partir do escolhido.',
        pickSubOne: 'Escolha o slot de destino.',
        dropHint: 'Solte os <b>.txp</b> aqui para enviar',
        offlineWarning: 'Não foi possível conectar ao servidor de controle. Modo offline: sem tela de doação e limitado a 1 importação e 1 exportação por sessão.',
        offlineImportLimit: 'Modo offline: limite de 1 importação por sessão.',
        offlineExportLimit: 'Modo offline: limite de 1 exportação por sessão.',
        reminderMsg: 'Lembre-se: com uma contribuição mínima de 2 euros você pode ter a versão completa. ;-)',
        reminderCloseIn: 'Fechar em {s} s',
        reminderCloseBtn: 'Fechar',
        reminderCanClose: 'Você já pode fechar esta janela',
        supportProject: '☕ Apoie o projeto',
        supportProjectTitle: 'Apoie o projeto',
        donateAndActivate: '☕ Doe e Ative',
        donateAndActivateTitle: 'Doe e Ative',
        languageSelectorLabel: 'Seletor de idioma',
        fullVersion: 'Versão Completa',
        restrictedVersion: 'Versão Restrita',
        donationTitleText: 'Apoie o projeto',
        donationBody: '<p>🇵🇹 🇧🇷 As ferramentas usadas para criar este app <b>não são gratuitas</b>. Se ele for útil para você, considere fazer uma doação. Sem doação, cada sessão permite <b>3 importações</b> e <b>3 exportações</b>. Ao doar, esta tela e <b>todos os limites</b> desaparecem para sempre neste computador.</p>',
        donationImportant: 'IMPORTANTE: Cole este código na mensagem da sua doação',
        donationDonateButton: '☕ Doar',
        donationCheckButton: 'Já doei',
        donationManualToggle: 'Tem um código?',
        donationSupportId: 'ID de suporte (envie se precisar de um código):',
        donationCodePlaceholder: 'Cole seu código aqui',
        donationApplyButton: 'Aplicar',
        donationCloseTitle: 'Fechar',
        donationCopyTitle: 'Copiar',
        donationCountdown: 'Você poderá usar o app em <span class="countdown-num">{s}</span> s',
        donationVerified: 'Doação verificada! Obrigado 💚',
        donationChecking: 'Verificando...',
        donationNotFound: 'Sua doação ainda não aparece. Aguarde alguns segundos depois de doar e tente novamente.',
        donationNotFoundHint: 'Se em 1 minuto não for ativado, clique em "Tem um código?", copie o ID de suporte e envie por mensagem privada para receber outro código.',
        donationApplyingCode: 'Aplicando código...',
        donationInvalidCode: 'Código não válido para este computador.',
        pConnecting: 'Conectando ao pedal…',
        pReadingSlot: 'Lendo slot {n}/{total}…',
        pGenerating: 'Gerando dados de envio…',
        pSendingSetup: 'Enviando configuração…',
        pUploadingSlot: 'Enviando para o slot {n}…',
        pReadingUpdated: 'Lendo o slot atualizado…',
        pLoadingInto: 'Carregando em {pos}…',
        pExporting: 'Exportando slot {n}/{total}…',
        pRestoringSlot: 'Restaurando slot {n}/{total}…',
        pRestoringColors: 'Restaurando cores…',
        pRestoringAssign: 'Restaurando atribuições…',
        helpTitle: 'Ajuda — Tonex Loader',
    },
    it: {
        subtitle: 'Tonex One e Tonex Pedal',
        btnRefresh: '⟳ Aggiorna',
        btnOpen: '📂 Apri .txp',
        btnBackup: '💾 Backup',
        btnHelp: '❔ Aiuto',
        btnDonate: '☕ Dona',
        donateTitle: 'Sostieni il progetto su Ko-fi',
        portTitle: 'Porta COM del pedale',
        pollTitle: 'Segui il footswitch in tempo reale',
        thSlot: 'Slot',
        thName: 'Nome',
        thCharacter: 'Carattere',
        thTone: 'Modello',
        thStomp: 'Stomp',
        thAmp: 'Amp',
        thCab: 'Cab',
        thAssigned: 'Assegnato',
        emptyRow: 'Collega il pedale e premi <b>Aggiorna</b>.',
        statusReady: 'Pronto. Collega un pedale Tonex.',
        noPedal: 'Nessun pedale Tonex rilevato via USB.',
        pedalDetected: 'Pedale rilevato su {port}.',
        pickPortHint: 'Non rilevato via USB. Scegli la porta COM del pedale e premi Aggiorna.',
        errPorts: 'Errore nell’elenco delle porte: {e}',
        reading: 'Lettura del pedale…',
        reloadProgressTitle: 'Ricaricamento…',
        readDone: 'Letti {n} slot da {port}.',
        readErr: 'Impossibile leggere il pedale: {e}',
        genericErr: 'Errore: {e}',
        active: '● ATTIVO',
        ampLabel: 'Amp',
        cabLabel: 'Cab',
        ctxDetails: '🔍 Vedi dettagli',
        ctxUpload: '⬆ Carica .txp qui…',
        ctxExport: 'Esporta .txp',
        ctxExportBcho: 'Esporta .txp con BCho',
        ctxLoadA: '🎚 Carica in A',
        ctxLoadB: '🎚 Carica in B',
        ctxLoadStomp: '🎚 Carica in Stomp',
        ctxColor: '🎨 Cambia colore…',
        mEffects: 'Effetti',
        mGate: 'Noise Gate',
        mComp: 'Compressor',
        mMod: 'Modulation',
        mDelay: 'Delay',
        mReverb: 'Reverb',
        mAssignedTo: 'Assegnato a',
        mColor: 'Colore LED',
        close: 'Chiudi',
        cancel: 'Annulla',
        slotWord: 'Slot',
        loading: 'Caricamento slot {n} in {pos}…',
        loaded: 'Slot {n} caricato in {pos}.',
        selected: 'Preset {n} attivo sul pedale: {name}',
        selectErr: 'Impossibile cambiare preset: {e}',
        assignErr: 'Impossibile assegnare: {e}',
        colorTitle: 'Colore dello slot {n}',
        colorSub: 'Scegli il colore del LED per questo preset.',
        colorChanging: 'Modifica colore dello slot {n}…',
        colorDone: 'Colore dello slot {n} aggiornato.',
        colorErr: 'Impossibile cambiare il colore: {e}',
        dlgErr: 'Errore nell’apertura della finestra: {e}',
        uploading: 'Caricamento di {file} nello slot {n}… ({i}/{total})',
        importProgressTitle: 'Importazione preset…',
        noAck: 'Nessun ACK durante il caricamento di {file} (potrebbe essere stato applicato).',
        uploadFileErr: 'Errore nel caricamento di {file}: {e}',
        uploadDone: 'Caricamento completato: {ok}/{total}.',
        exporting: 'Esportazione slot {n} in .txp...',
        exportProgressTitle: 'Esportazione preset…',
        exportMultiProgressTitle: 'Esportazione preset…',
        exportingMulti: 'Esportazione di {total} preset…',
        exportRunning: 'Esportazione… {done}/{total}',
        exportMultiDone: '{ok}/{total} .txp esportati in {dir}',
        exportMultiDoneFailed: 'Esportati {ok}/{total} .txp ({fail} con errore).',
        ctxSelCount: '{n} slot selezionati',
        ctxExportMulti: 'Esporta {n} .txp',
        ctxExportMultiBcho: 'Esporta {n} .txp con BCho',
        exportSaved: '.txp esportato: {path}',
        exportErr: 'Impossibile esportare .txp: {e}',
        btnBackupTitle: 'Backup completo del pedale in un .zip ripristinabile',
        btnRestore: '♻ Ripristina',
        btnRestoreTitle: 'Ripristina un backup .zip sul pedale',
        backupFirst: 'Collega prima il pedale.',
        backupRunning: 'Creazione backup… {done}/{total} slot',
        backupProgressTitle: 'Creazione backup…',
        backupSaved: 'Backup salvato: {path}',
        backupErr: 'Errore nel salvataggio del backup: {e}',
        restoreRunning: 'Ripristino… {done}/{total}',
        restoreProgressTitle: 'Ripristino backup…',
        restoreDone: 'Ripristino completato: {ok}/{total} slot.',
        restoreDoneFailed: 'Ripristino: {ok}/{total} slot ({fail} con errore).',
        restoreErr: 'Errore nel ripristino: {e}',
        pollErr: 'Polling: {e}',
        pollStopped: 'Polling interrotto: {msg}',
        droppedToast: '{n} .txp ricevuti. Scegli lo slot di destinazione.',
        onlyTxp: 'Si possono caricare solo file .txp.',
        overflowWarn: '{n} non entrano negli slot successivi e sono stati ignorati.',
        pickTitleMulti: 'Carica {n} preset',
        pickTitleOne: 'Carica preset',
        pickSubMulti: 'Verranno caricati in slot consecutivi a partire da quello scelto.',
        pickSubOne: 'Scegli lo slot di destinazione.',
        dropHint: 'Rilascia qui i file <b>.txp</b> per caricarli',
        offlineWarning: 'Impossibile raggiungere il server di controllo. Modalità offline: nessuna schermata di donazione e limite di 1 importazione e 1 esportazione per sessione.',
        offlineImportLimit: 'Modalità offline: limite di 1 importazione per sessione.',
        offlineExportLimit: 'Modalità offline: limite di 1 esportazione per sessione.',
        reminderMsg: 'Ricorda che con un contributo minimo di 2 euro puoi avere la versione completa. ;-)',
        reminderCloseIn: 'Chiudi tra {s} s',
        reminderCloseBtn: 'Chiudi',
        reminderCanClose: 'Ora puoi chiudere questa finestra',
        supportProject: '☕ Sostieni il progetto',
        supportProjectTitle: 'Sostieni il progetto',
        donateAndActivate: '☕ Dona e Attiva',
        donateAndActivateTitle: 'Dona e Attiva',
        languageSelectorLabel: 'Selettore lingua',
        fullVersion: 'Versione Completa',
        restrictedVersion: 'Versione Limitata',
        donationTitleText: 'Sostieni il progetto',
        donationBody: '<p>🇮🇹 Gli strumenti usati per sviluppare questa app <b>non sono gratuiti</b>. Se ti è utile, valuta una donazione. Senza donazione, ogni sessione permette <b>3 importazioni</b> e <b>3 esportazioni</b>. Con una donazione questa schermata e <b>tutti i limiti</b> spariscono per sempre su questo computer.</p>',
        donationImportant: 'IMPORTANTE: incolla questo codice nel messaggio della tua donazione',
        donationDonateButton: '☕ Dona',
        donationCheckButton: 'Ho donato',
        donationManualToggle: 'Hai un codice?',
        donationSupportId: 'ID di supporto (invialo se ti serve un codice):',
        donationCodePlaceholder: 'Incolla qui il tuo codice',
        donationApplyButton: 'Applica',
        donationCloseTitle: 'Chiudi',
        donationCopyTitle: 'Copia',
        donationCountdown: 'Potrai usare l’app tra <span class="countdown-num">{s}</span> s',
        donationVerified: 'Donazione verificata! Grazie 💚',
        donationChecking: 'Verifica in corso...',
        donationNotFound: 'La tua donazione non risulta ancora. Attendi qualche secondo dopo aver donato e riprova.',
        donationNotFoundHint: 'Se non si attiva entro 1 minuto, fai clic su "Hai un codice?", copia l’ID di supporto e invialo tramite messaggio privato per ricevere un altro codice.',
        donationApplyingCode: 'Applicazione del codice...',
        donationInvalidCode: 'Codice non valido per questo computer.',
        pConnecting: 'Connessione al pedale…',
        pReadingSlot: 'Lettura slot {n}/{total}…',
        pGenerating: 'Generazione dati di caricamento…',
        pSendingSetup: 'Invio configurazione…',
        pUploadingSlot: 'Caricamento nello slot {n}…',
        pReadingUpdated: 'Lettura dello slot aggiornato…',
        pLoadingInto: 'Caricamento in {pos}…',
        pExporting: 'Esportazione slot {n}/{total}…',
        pRestoringSlot: 'Ripristino slot {n}/{total}…',
        pRestoringColors: 'Ripristino colori…',
        pRestoringAssign: 'Ripristino assegnazioni…',
        helpTitle: 'Aiuto — Tonex Loader',
    },
    fr: {
        subtitle: 'Tonex One et Tonex Pedal',
        btnRefresh: '⟳ Actualiser',
        btnOpen: '📂 Ouvrir .txp',
        btnBackup: '💾 Sauvegarde',
        btnHelp: '❔ Aide',
        btnDonate: '☕ Faire un don',
        donateTitle: 'Soutenir le projet sur Ko-fi',
        portTitle: 'Port COM de la pédale',
        pollTitle: 'Suivre le footswitch en direct',
        thSlot: 'Slot',
        thName: 'Nom',
        thCharacter: 'Caractère',
        thTone: 'Modèle',
        thStomp: 'Stomp',
        thAmp: 'Ampli',
        thCab: 'Baffle',
        thAssigned: 'Assigné',
        emptyRow: 'Connectez la pédale et cliquez sur <b>Actualiser</b>.',
        statusReady: 'Prêt. Connectez une pédale Tonex.',
        noPedal: 'Aucune pédale Tonex détectée par USB.',
        pedalDetected: 'Pédale détectée sur {port}.',
        pickPortHint: 'Non détectée par USB. Choisissez le port COM de la pédale et cliquez sur Actualiser.',
        errPorts: 'Erreur lors de la liste des ports : {e}',
        reading: 'Lecture de la pédale…',
        reloadProgressTitle: 'Rechargement…',
        readDone: '{n} slots lus depuis {port}.',
        readErr: 'Impossible de lire la pédale : {e}',
        genericErr: 'Erreur : {e}',
        active: '● ACTIF',
        ampLabel: 'Ampli',
        cabLabel: 'Baffle',
        ctxDetails: '🔍 Voir les détails',
        ctxUpload: '⬆ Charger .txp ici…',
        ctxExport: 'Exporter .txp',
        ctxExportBcho: 'Exporter .txp avec BCho',
        ctxLoadA: '🎚 Charger dans A',
        ctxLoadB: '🎚 Charger dans B',
        ctxLoadStomp: '🎚 Charger dans Stomp',
        ctxColor: '🎨 Changer la couleur…',
        mEffects: 'Effets',
        mGate: 'Noise Gate',
        mComp: 'Compressor',
        mMod: 'Modulation',
        mDelay: 'Delay',
        mReverb: 'Reverb',
        mAssignedTo: 'Assigné à',
        mColor: 'Couleur LED',
        close: 'Fermer',
        cancel: 'Annuler',
        slotWord: 'Slot',
        loading: 'Chargement du slot {n} dans {pos}…',
        loaded: 'Slot {n} chargé dans {pos}.',
        selected: 'Preset {n} actif sur la pédale : {name}',
        selectErr: 'Impossible de changer le preset : {e}',
        assignErr: 'Impossible d’assigner : {e}',
        colorTitle: 'Couleur du slot {n}',
        colorSub: 'Choisissez la couleur de LED pour ce preset.',
        colorChanging: 'Changement de la couleur du slot {n}…',
        colorDone: 'Couleur du slot {n} mise à jour.',
        colorErr: 'Impossible de changer la couleur : {e}',
        dlgErr: 'Erreur lors de l’ouverture de la boîte de dialogue : {e}',
        uploading: 'Chargement de {file} dans le slot {n}… ({i}/{total})',
        importProgressTitle: 'Importation des presets…',
        noAck: 'Pas d’ACK lors du chargement de {file} (il a peut-être été appliqué).',
        uploadFileErr: 'Erreur lors du chargement de {file} : {e}',
        uploadDone: 'Chargement terminé : {ok}/{total}.',
        exporting: 'Export du slot {n} en .txp...',
        exportProgressTitle: 'Export du preset…',
        exportMultiProgressTitle: 'Export des presets…',
        exportingMulti: 'Export de {total} presets…',
        exportRunning: 'Export… {done}/{total}',
        exportMultiDone: '{ok}/{total} .txp exportés vers {dir}',
        exportMultiDoneFailed: '{ok}/{total} .txp exportés ({fail} avec erreur).',
        ctxSelCount: '{n} slots sélectionnés',
        ctxExportMulti: 'Exporter {n} .txp',
        ctxExportMultiBcho: 'Exporter {n} .txp avec BCho',
        exportSaved: '.txp exporté : {path}',
        exportErr: 'Impossible d’exporter .txp : {e}',
        btnBackupTitle: 'Sauvegarde complète de la pédale dans un .zip restaurable',
        btnRestore: '♻ Restaurer',
        btnRestoreTitle: 'Restaurer une sauvegarde .zip sur la pédale',
        backupFirst: 'Connectez d’abord la pédale.',
        backupRunning: 'Création de la sauvegarde… {done}/{total} slots',
        backupProgressTitle: 'Création de la sauvegarde…',
        backupSaved: 'Sauvegarde enregistrée : {path}',
        backupErr: 'Erreur lors de l’enregistrement de la sauvegarde : {e}',
        restoreRunning: 'Restauration… {done}/{total}',
        restoreProgressTitle: 'Restauration de la sauvegarde…',
        restoreDone: 'Restauration terminée : {ok}/{total} slots.',
        restoreDoneFailed: 'Restauration : {ok}/{total} slots ({fail} avec erreur).',
        restoreErr: 'Erreur lors de la restauration : {e}',
        pollErr: 'Polling : {e}',
        pollStopped: 'Polling arrêté : {msg}',
        droppedToast: '{n} .txp reçu(s). Choisissez le slot de destination.',
        onlyTxp: 'Seuls les fichiers .txp peuvent être chargés.',
        overflowWarn: '{n} ne tiennent pas dans les slots suivants et ont été ignorés.',
        pickTitleMulti: 'Charger {n} presets',
        pickTitleOne: 'Charger un preset',
        pickSubMulti: 'Ils seront chargés dans des slots consécutifs à partir de celui choisi.',
        pickSubOne: 'Choisissez le slot de destination.',
        dropHint: 'Déposez les fichiers <b>.txp</b> ici pour les charger',
        offlineWarning: 'Impossible de joindre le serveur de contrôle. Mode hors ligne : pas d’écran de don, limite de 1 importation et 1 exportation par session.',
        offlineImportLimit: 'Mode hors ligne : limite de 1 importation par session.',
        offlineExportLimit: 'Mode hors ligne : limite de 1 exportation par session.',
        reminderMsg: 'Rappel : avec une contribution minimale de 2 euros, vous pouvez obtenir la version complète. ;-)',
        reminderCloseIn: 'Fermer dans {s} s',
        reminderCloseBtn: 'Fermer',
        reminderCanClose: 'Vous pouvez maintenant fermer cette fenêtre',
        supportProject: '☕ Soutenez le projet',
        supportProjectTitle: 'Soutenez le projet',
        donateAndActivate: '☕ Donnez et Activez',
        donateAndActivateTitle: 'Donnez et Activez',
        languageSelectorLabel: 'Sélecteur de langue',
        fullVersion: 'Version Complète',
        restrictedVersion: 'Version Limitée',
        donationTitleText: 'Soutenir le projet',
        donationBody: '<p>🇫🇷 Les outils utilisés pour développer cette app <b>ne sont pas gratuits</b>. Si elle vous est utile, pensez à faire un don. Sans don, chaque session permet <b>3 importations</b> et <b>3 exportations</b>. Un don supprime cet écran et <b>toutes les limites</b>, définitivement, sur cet ordinateur.</p>',
        donationImportant: 'IMPORTANT : collez ce code dans le message de votre don',
        donationDonateButton: '☕ Faire un don',
        donationCheckButton: 'J’ai fait un don',
        donationManualToggle: 'Vous avez un code ?',
        donationSupportId: 'ID de support (envoyez-le si vous avez besoin d’un code) :',
        donationCodePlaceholder: 'Collez votre code ici',
        donationApplyButton: 'Appliquer',
        donationCloseTitle: 'Fermer',
        donationCopyTitle: 'Copier',
        donationCountdown: 'Vous pourrez utiliser l’app dans <span class="countdown-num">{s}</span> s',
        donationVerified: 'Don vérifié ! Merci 💚',
        donationChecking: 'Vérification...',
        donationNotFound: 'Votre don n’apparaît pas encore. Attendez quelques secondes après le don, puis réessayez.',
        donationNotFoundHint: 'Si l’activation ne se fait pas dans 1 minute, cliquez sur "Vous avez un code ?", copiez l’ID de support et envoyez-le par message privé pour recevoir un autre code.',
        donationApplyingCode: 'Application du code...',
        donationInvalidCode: 'Code non valide pour cet ordinateur.',
        pConnecting: 'Connexion à la pédale…',
        pReadingSlot: 'Lecture du slot {n}/{total}…',
        pGenerating: 'Génération des données de chargement…',
        pSendingSetup: 'Envoi de la configuration…',
        pUploadingSlot: 'Chargement dans le slot {n}…',
        pReadingUpdated: 'Lecture du slot mis à jour…',
        pLoadingInto: 'Chargement dans {pos}…',
        pExporting: 'Export du slot {n}/{total}…',
        pRestoringSlot: 'Restauration du slot {n}/{total}…',
        pRestoringColors: 'Restauration des couleurs…',
        pRestoringAssign: 'Restauration des assignations…',
        helpTitle: 'Aide — Tonex Loader',
    },
    de: {
        subtitle: 'Tonex One und Tonex Pedal',
        btnRefresh: '⟳ Aktualisieren',
        btnOpen: '📂 .txp öffnen',
        btnBackup: '💾 Backup',
        btnHelp: '❔ Hilfe',
        btnDonate: '☕ Spenden',
        donateTitle: 'Das Projekt auf Ko-fi unterstützen',
        portTitle: 'COM-Port des Pedals',
        pollTitle: 'Footswitch live verfolgen',
        thSlot: 'Slot',
        thName: 'Name',
        thCharacter: 'Charakter',
        thTone: 'Modell',
        thStomp: 'Stomp',
        thAmp: 'Amp',
        thCab: 'Cab',
        thAssigned: 'Zugewiesen',
        emptyRow: 'Pedal anschließen und <b>Aktualisieren</b> klicken.',
        statusReady: 'Bereit. Schließe ein Tonex-Pedal an.',
        noPedal: 'Kein Tonex-Pedal per USB erkannt.',
        pedalDetected: 'Pedal an {port} erkannt.',
        pickPortHint: 'Nicht per USB erkannt. Wähle den COM-Port des Pedals und klicke auf Aktualisieren.',
        errPorts: 'Fehler beim Auflisten der Ports: {e}',
        reading: 'Pedal wird gelesen…',
        reloadProgressTitle: 'Wird neu geladen…',
        readDone: '{n} Slots von {port} gelesen.',
        readErr: 'Pedal konnte nicht gelesen werden: {e}',
        genericErr: 'Fehler: {e}',
        active: '● AKTIV',
        ampLabel: 'Amp',
        cabLabel: 'Cab',
        ctxDetails: '🔍 Details anzeigen',
        ctxUpload: '⬆ .txp hier laden…',
        ctxExport: '.txp exportieren',
        ctxExportBcho: '.txp mit BCho exportieren',
        ctxLoadA: '🎚 In A laden',
        ctxLoadB: '🎚 In B laden',
        ctxLoadStomp: '🎚 In Stomp laden',
        ctxColor: '🎨 Farbe ändern…',
        mEffects: 'Effekte',
        mGate: 'Noise Gate',
        mComp: 'Compressor',
        mMod: 'Modulation',
        mDelay: 'Delay',
        mReverb: 'Reverb',
        mAssignedTo: 'Zugewiesen an',
        mColor: 'LED-Farbe',
        close: 'Schließen',
        cancel: 'Abbrechen',
        slotWord: 'Slot',
        loading: 'Slot {n} wird in {pos} geladen…',
        loaded: 'Slot {n} in {pos} geladen.',
        selected: 'Preset {n} aktiv am Pedal: {name}',
        selectErr: 'Preset konnte nicht gewechselt werden: {e}',
        assignErr: 'Zuweisung nicht möglich: {e}',
        colorTitle: 'Farbe für Slot {n}',
        colorSub: 'Wähle die LED-Farbe für dieses Preset.',
        colorChanging: 'Farbe von Slot {n} wird geändert…',
        colorDone: 'Farbe von Slot {n} aktualisiert.',
        colorErr: 'Farbe konnte nicht geändert werden: {e}',
        dlgErr: 'Fehler beim Öffnen des Dialogs: {e}',
        uploading: '{file} wird in Slot {n} geladen… ({i}/{total})',
        importProgressTitle: 'Presets werden importiert…',
        noAck: 'Kein ACK beim Laden von {file} (möglicherweise trotzdem angewendet).',
        uploadFileErr: 'Fehler beim Laden von {file}: {e}',
        uploadDone: 'Laden abgeschlossen: {ok}/{total}.',
        exporting: 'Slot {n} wird als .txp exportiert...',
        exportProgressTitle: 'Preset wird exportiert…',
        exportMultiProgressTitle: 'Presets werden exportiert…',
        exportingMulti: '{total} Presets werden exportiert…',
        exportRunning: 'Export… {done}/{total}',
        exportMultiDone: '{ok}/{total} .txp nach {dir} exportiert',
        exportMultiDoneFailed: '{ok}/{total} .txp exportiert ({fail} mit Fehler).',
        ctxSelCount: '{n} Slots ausgewählt',
        ctxExportMulti: '{n} .txp exportieren',
        ctxExportMultiBcho: '{n} .txp mit BCho exportieren',
        exportSaved: '.txp exportiert: {path}',
        exportErr: '.txp konnte nicht exportiert werden: {e}',
        btnBackupTitle: 'Vollständiges Pedal-Backup als wiederherstellbare .zip',
        btnRestore: '♻ Wiederherstellen',
        btnRestoreTitle: '.zip-Backup auf dem Pedal wiederherstellen',
        backupFirst: 'Schließe zuerst das Pedal an.',
        backupRunning: 'Backup wird erstellt… {done}/{total} Slots',
        backupProgressTitle: 'Backup wird erstellt…',
        backupSaved: 'Backup gespeichert: {path}',
        backupErr: 'Fehler beim Speichern des Backups: {e}',
        restoreRunning: 'Wiederherstellung… {done}/{total}',
        restoreProgressTitle: 'Backup wird wiederhergestellt…',
        restoreDone: 'Wiederherstellung abgeschlossen: {ok}/{total} Slots.',
        restoreDoneFailed: 'Wiederherstellung: {ok}/{total} Slots ({fail} mit Fehler).',
        restoreErr: 'Fehler bei der Wiederherstellung: {e}',
        pollErr: 'Polling: {e}',
        pollStopped: 'Polling gestoppt: {msg}',
        droppedToast: '{n} .txp empfangen. Ziel-Slot wählen.',
        onlyTxp: 'Es können nur .txp-Dateien geladen werden.',
        overflowWarn: '{n} passen nicht in die folgenden Slots und wurden übersprungen.',
        pickTitleMulti: '{n} Presets laden',
        pickTitleOne: 'Preset laden',
        pickSubMulti: 'Sie werden ab dem gewählten Slot in aufeinanderfolgende Slots geladen.',
        pickSubOne: 'Ziel-Slot wählen.',
        dropHint: '<b>.txp</b>-Dateien hier ablegen, um sie zu laden',
        offlineWarning: 'Der Kontrollserver ist nicht erreichbar. Offline-Modus: kein Spendenfenster, Limit von 1 Import und 1 Export pro Sitzung.',
        offlineImportLimit: 'Offline-Modus: Limit von 1 Import pro Sitzung.',
        offlineExportLimit: 'Offline-Modus: Limit von 1 Export pro Sitzung.',
        reminderMsg: 'Hinweis: Mit einem Mindestbeitrag von 2 Euro erhältst du die Vollversion. ;-)',
        reminderCloseIn: 'Schließen in {s} s',
        reminderCloseBtn: 'Schließen',
        reminderCanClose: 'Du kannst dieses Fenster jetzt schließen',
        supportProject: '☕ Unterstütze das Projekt',
        supportProjectTitle: 'Unterstütze das Projekt',
        donateAndActivate: '☕ Spenden & Aktivieren',
        donateAndActivateTitle: 'Spenden & Aktivieren',
        languageSelectorLabel: 'Sprachauswahl',
        fullVersion: 'Vollversion',
        restrictedVersion: 'Eingeschränkte Version',
        donationTitleText: 'Projekt unterstützen',
        donationBody: '<p>🇩🇪 Die Werkzeuge, mit denen diese App entwickelt wurde, <b>sind nicht kostenlos</b>. Wenn sie dir nützlich ist, denke bitte über eine Spende nach. Ohne Spende erlaubt jede Sitzung <b>3 Importe</b> und <b>3 Exporte</b>. Eine Spende entfernt dieses Fenster und <b>alle Limits</b> dauerhaft auf diesem Computer.</p>',
        donationImportant: 'WICHTIG: Füge diesen Code in die Nachricht deiner Spende ein',
        donationDonateButton: '☕ Spenden',
        donationCheckButton: 'Ich habe gespendet',
        donationManualToggle: 'Hast du einen Code?',
        donationSupportId: 'Support-ID (sende sie, wenn du einen Code brauchst):',
        donationCodePlaceholder: 'Code hier einfügen',
        donationApplyButton: 'Anwenden',
        donationCloseTitle: 'Schließen',
        donationCopyTitle: 'Kopieren',
        donationCountdown: 'Du kannst die App in <span class="countdown-num">{s}</span> s verwenden',
        donationVerified: 'Spende verifiziert! Danke 💚',
        donationChecking: 'Wird geprüft...',
        donationNotFound: 'Deine Spende wurde noch nicht gefunden. Warte nach der Spende ein paar Sekunden und versuche es erneut.',
        donationNotFoundHint: 'Wenn es nicht innerhalb von 1 Minute aktiviert wird, klicke auf "Hast du einen Code?", kopiere die Support-ID und sende sie per privater Nachricht, um einen weiteren Code zu erhalten.',
        donationApplyingCode: 'Code wird angewendet...',
        donationInvalidCode: 'Code ist für diesen Computer nicht gültig.',
        pConnecting: 'Verbindung zum Pedal…',
        pReadingSlot: 'Slot {n}/{total} wird gelesen…',
        pGenerating: 'Upload-Daten werden erzeugt…',
        pSendingSetup: 'Konfiguration wird gesendet…',
        pUploadingSlot: 'Wird in Slot {n} geladen…',
        pReadingUpdated: 'Aktualisierter Slot wird gelesen…',
        pLoadingInto: 'Wird in {pos} geladen…',
        pExporting: 'Slot {n}/{total} wird exportiert…',
        pRestoringSlot: 'Slot {n}/{total} wird wiederhergestellt…',
        pRestoringColors: 'Farben werden wiederhergestellt…',
        pRestoringAssign: 'Zuweisungen werden wiederhergestellt…',
        helpTitle: 'Hilfe — Tonex Loader',
    },
};

for (const code of Object.keys(COMPLETE_I18N)) {
    Object.assign(I18N[code], COMPLETE_I18N[code]);
}

let lang = normalizeLang(localStorage.getItem(LANGUAGE_STORAGE_KEY));

function t(key, vars) {
    let s = (I18N[lang] && I18N[lang][key]);
    if (s == null) s = I18N.es[key];
    if (s == null) s = key;
    if (vars) {
        for (const k in vars) {
            const value = (k === 'e' || k === 'msg') ? translateBackendText(vars[k]) : vars[k];
            s = s.split('{' + k + '}').join(value);
        }
    }
    return s;
}

const BACKEND_TEXT = {
    gl: [
        ['no se detecta un pedal TONEX por USB', 'Non se detecta ningún pedal TONEX por USB'],
        ['no se pudo abrir', 'Non se puido abrir'],
        ['puerto cerrado', 'porto pechado'],
        ['no se recibio ninguna trama completa (timeout)', 'non se recibiu ningunha trama completa (timeout)'],
        ['no se recibio hello del pedal', 'non se recibiu resposta inicial do pedal'],
        ['no se recibio estado del pedal', 'non se recibiu o estado do pedal'],
        ['trama invalida', 'trama non válida'],
        ['secuencia de escape invalida', 'secuencia de escape non válida'],
        ['trama demasiado corta para contener el CRC', 'trama demasiado curta para conter o CRC'],
        ['CRC no coincide', 'o CRC non coincide'],
        ['slot fuera de rango', 'slot fóra de rango'],
        ['index fuera de rango', 'índice fóra de rango'],
        ['preset_index fuera de rango', 'preset_index fóra de rango'],
        ['slot_name debe ser A, B o C/Stomp', 'slot_name debe ser A, B ou C/Stomp'],
        ['cambiar el preset activo solo está disponible en el Tonex Pedal; en el Tonex One usa A/B/Stomp', 'cambiar o preset activo só está dispoñible no Tonex Pedal; no Tonex One usa A/B/Stomp'],
        ['el backup es de un Tonex', 'o backup é dun Tonex'],
        ['pero el pedal conectado es un Tonex', 'pero o pedal conectado é un Tonex'],
        ['el .txp descifrado es demasiado corto', 'o .txp descifrado é demasiado curto'],
        ['puede estar corrupto o usar un formato no soportado', 'pode estar corrupto ou usar un formato non compatible'],
        ['plantilla', 'modelo'],
        ['solo', 'só'],
        ['marcadores de parametros', 'marcadores de parámetros'],
        ['se necesitan', 'necesítanse'],
        ['no se encontro variante BCho del modelo', 'non se atopou unha variante BCho do modelo'],
        ['estado del pedal demasiado corto', 'estado do pedal demasiado curto'],
        ['no se encontro el bloque de colores en el estado', 'non se atopou o bloque de cores no estado'],
        ['bloque de colores inesperado', 'bloque de cores inesperado'],
    ],
    pt: [
        ['no se detecta un pedal TONEX por USB', 'Nenhum pedal TONEX detectado por USB'],
        ['no se pudo abrir', 'Não foi possível abrir'],
        ['puerto cerrado', 'porta fechada'],
        ['no se recibio ninguna trama completa (timeout)', 'nenhum quadro completo foi recebido (timeout)'],
        ['no se recibio hello del pedal', 'nenhuma resposta inicial do pedal foi recebida'],
        ['no se recibio estado del pedal', 'o estado do pedal não foi recebido'],
        ['trama invalida', 'quadro inválido'],
        ['secuencia de escape invalida', 'sequência de escape inválida'],
        ['trama demasiado corta para contener el CRC', 'quadro curto demais para conter o CRC'],
        ['CRC no coincide', 'CRC não confere'],
        ['slot fuera de rango', 'slot fora do intervalo'],
        ['index fuera de rango', 'índice fora do intervalo'],
        ['preset_index fuera de rango', 'preset_index fora do intervalo'],
        ['slot_name debe ser A, B o C/Stomp', 'slot_name deve ser A, B ou C/Stomp'],
        ['cambiar el preset activo solo está disponible en el Tonex Pedal; en el Tonex One usa A/B/Stomp', 'alterar o preset ativo só está disponível no Tonex Pedal; no Tonex One use A/B/Stomp'],
        ['el backup es de un Tonex', 'o backup é de um Tonex'],
        ['pero el pedal conectado es un Tonex', 'mas o pedal conectado é um Tonex'],
        ['el .txp descifrado es demasiado corto', 'o .txp descriptografado é curto demais'],
        ['puede estar corrupto o usar un formato no soportado', 'pode estar corrompido ou usar um formato não compatível'],
        ['plantilla', 'modelo'],
        ['solo', 'apenas'],
        ['marcadores de parametros', 'marcadores de parâmetros'],
        ['se necesitan', 'são necessários'],
        ['no se encontro variante BCho del modelo', 'nenhuma variante BCho do modelo foi encontrada'],
        ['estado del pedal demasiado corto', 'estado do pedal curto demais'],
        ['no se encontro el bloque de colores en el estado', 'o bloco de cores não foi encontrado no estado'],
        ['bloque de colores inesperado', 'bloco de cores inesperado'],
    ],
    it: [
        ['no se detecta un pedal TONEX por USB', 'Nessun pedale TONEX rilevato via USB'],
        ['no se pudo abrir', 'Impossibile aprire'],
        ['puerto cerrado', 'porta chiusa'],
        ['no se recibio ninguna trama completa (timeout)', 'nessun frame completo ricevuto (timeout)'],
        ['no se recibio hello del pedal', 'nessuna risposta iniziale dal pedale'],
        ['no se recibio estado del pedal', 'stato del pedale non ricevuto'],
        ['trama invalida', 'frame non valido'],
        ['secuencia de escape invalida', 'sequenza di escape non valida'],
        ['trama demasiado corta para contener el CRC', 'frame troppo corto per contenere il CRC'],
        ['CRC no coincide', 'CRC non corrispondente'],
        ['slot fuera de rango', 'slot fuori intervallo'],
        ['index fuera de rango', 'indice fuori intervallo'],
        ['preset_index fuera de rango', 'preset_index fuori intervallo'],
        ['slot_name debe ser A, B o C/Stomp', 'slot_name deve essere A, B o C/Stomp'],
        ['cambiar el preset activo solo está disponible en el Tonex Pedal; en el Tonex One usa A/B/Stomp', 'il cambio del preset attivo è disponibile solo su Tonex Pedal; su Tonex One usa A/B/Stomp'],
        ['el backup es de un Tonex', 'il backup appartiene a un Tonex'],
        ['pero el pedal conectado es un Tonex', 'ma il pedale collegato è un Tonex'],
        ['el .txp descifrado es demasiado corto', 'il .txp decifrato è troppo corto'],
        ['puede estar corrupto o usar un formato no soportado', 'potrebbe essere corrotto o usare un formato non supportato'],
        ['plantilla', 'modello'],
        ['solo', 'solo'],
        ['marcadores de parametros', 'marcatori dei parametri'],
        ['se necesitan', 'sono necessari'],
        ['no se encontro variante BCho del modelo', 'non è stata trovata una variante BCho del modello'],
        ['estado del pedal demasiado corto', 'stato del pedale troppo corto'],
        ['no se encontro el bloque de colores en el estado', 'blocco colori non trovato nello stato'],
        ['bloque de colores inesperado', 'blocco colori inatteso'],
    ],
    fr: [
        ['no se detecta un pedal TONEX por USB', 'Aucune pédale TONEX détectée par USB'],
        ['no se pudo abrir', 'Impossible d’ouvrir'],
        ['puerto cerrado', 'port fermé'],
        ['no se recibio ninguna trama completa (timeout)', 'aucune trame complète reçue (timeout)'],
        ['no se recibio hello del pedal', 'aucune réponse initiale de la pédale'],
        ['no se recibio estado del pedal', 'état de la pédale non reçu'],
        ['trama invalida', 'trame non valide'],
        ['secuencia de escape invalida', 'séquence d’échappement non valide'],
        ['trama demasiado corta para contener el CRC', 'trame trop courte pour contenir le CRC'],
        ['CRC no coincide', 'CRC différent'],
        ['slot fuera de rango', 'slot hors limites'],
        ['index fuera de rango', 'index hors limites'],
        ['preset_index fuera de rango', 'preset_index hors limites'],
        ['slot_name debe ser A, B o C/Stomp', 'slot_name doit être A, B ou C/Stomp'],
        ['cambiar el preset activo solo está disponible en el Tonex Pedal; en el Tonex One usa A/B/Stomp', 'le changement du preset actif est disponible uniquement sur Tonex Pedal ; sur Tonex One, utilisez A/B/Stomp'],
        ['el backup es de un Tonex', 'la sauvegarde provient d’un Tonex'],
        ['pero el pedal conectado es un Tonex', 'mais la pédale connectée est un Tonex'],
        ['el .txp descifrado es demasiado corto', 'le .txp déchiffré est trop court'],
        ['puede estar corrupto o usar un formato no soportado', 'il peut être corrompu ou utiliser un format non pris en charge'],
        ['plantilla', 'modèle'],
        ['solo', 'seulement'],
        ['marcadores de parametros', 'marqueurs de paramètres'],
        ['se necesitan', 'sont nécessaires'],
        ['no se encontro variante BCho del modelo', 'aucune variante BCho du modèle trouvée'],
        ['estado del pedal demasiado corto', 'état de la pédale trop court'],
        ['no se encontro el bloque de colores en el estado', 'bloc de couleurs introuvable dans l’état'],
        ['bloque de colores inesperado', 'bloc de couleurs inattendu'],
    ],
    de: [
        ['no se detecta un pedal TONEX por USB', 'Kein TONEX-Pedal per USB erkannt'],
        ['no se pudo abrir', 'Konnte nicht geöffnet werden'],
        ['puerto cerrado', 'Port geschlossen'],
        ['no se recibio ninguna trama completa (timeout)', 'kein vollständiger Frame empfangen (Timeout)'],
        ['no se recibio hello del pedal', 'keine erste Antwort vom Pedal empfangen'],
        ['no se recibio estado del pedal', 'Pedalstatus nicht empfangen'],
        ['trama invalida', 'ungültiger Frame'],
        ['secuencia de escape invalida', 'ungültige Escape-Sequenz'],
        ['trama demasiado corta para contener el CRC', 'Frame zu kurz für CRC'],
        ['CRC no coincide', 'CRC stimmt nicht überein'],
        ['slot fuera de rango', 'Slot außerhalb des Bereichs'],
        ['index fuera de rango', 'Index außerhalb des Bereichs'],
        ['preset_index fuera de rango', 'preset_index außerhalb des Bereichs'],
        ['slot_name debe ser A, B o C/Stomp', 'slot_name muss A, B oder C/Stomp sein'],
        ['cambiar el preset activo solo está disponible en el Tonex Pedal; en el Tonex One usa A/B/Stomp', 'das Wechseln des aktiven Presets ist nur beim Tonex Pedal verfügbar; beim Tonex One A/B/Stomp verwenden'],
        ['el backup es de un Tonex', 'das Backup stammt von einem Tonex'],
        ['pero el pedal conectado es un Tonex', 'aber das angeschlossene Pedal ist ein Tonex'],
        ['el .txp descifrado es demasiado corto', 'die entschlüsselte .txp ist zu kurz'],
        ['puede estar corrupto o usar un formato no soportado', 'sie ist möglicherweise beschädigt oder verwendet ein nicht unterstütztes Format'],
        ['plantilla', 'Vorlage'],
        ['solo', 'nur'],
        ['marcadores de parametros', 'Parameter-Markierungen'],
        ['se necesitan', 'werden benötigt'],
        ['no se encontro variante BCho del modelo', 'keine BCho-Variante des Modells gefunden'],
        ['estado del pedal demasiado corto', 'Pedalstatus zu kurz'],
        ['no se encontro el bloque de colores en el estado', 'Farbblock im Status nicht gefunden'],
        ['bloque de colores inesperado', 'unerwarteter Farbblock'],
    ],
};

function translateBackendText(value) {
    let text = String(value && (value.message || value) || '');
    const replacements = BACKEND_TEXT[lang] || [];
    for (const [from, to] of replacements) {
        text = text.split(from).join(to);
    }
    return text;
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
const FLAG_GL = `<svg viewBox="0 0 24 16" width="22" height="15" aria-label="Galego">
  <rect width="24" height="16" rx="2.5" fill="#fff"/><path d="M-2,17 26,-1" stroke="#58a9df" stroke-width="4"/></svg>`;
const FLAG_PT = `<span class="flag-pair"><svg viewBox="0 0 24 16" width="16" height="15" aria-label="Português">
  <rect width="10" height="16" rx="2.5" fill="#006600"/><rect x="10" width="14" height="16" fill="#f00"/><circle cx="10" cy="8" r="3.2" fill="#ffcc00"/><circle cx="10" cy="8" r="2.1" fill="#fff"/></svg>
  <svg viewBox="0 0 24 16" width="16" height="15" aria-label="Brasileiro">
  <rect width="24" height="16" rx="2.5" fill="#009b3a"/><path d="M12,2 22,8 12,14 2,8 Z" fill="#ffdf00"/><circle cx="12" cy="8" r="3.4" fill="#002776"/></svg></span>`;
const FLAG_IT = `<svg viewBox="0 0 24 16" width="22" height="15" aria-label="Italiano">
  <rect width="8" height="16" rx="2.5" fill="#009246"/><rect x="8" width="8" height="16" fill="#fff"/><rect x="16" width="8" height="16" fill="#ce2b37"/></svg>`;
const FLAG_FR = `<svg viewBox="0 0 24 16" width="22" height="15" aria-label="Français">
  <rect width="8" height="16" rx="2.5" fill="#0055a4"/><rect x="8" width="8" height="16" fill="#fff"/><rect x="16" width="8" height="16" fill="#ef4135"/></svg>`;
const FLAG_DE = `<svg viewBox="0 0 24 16" width="22" height="15" aria-label="Deutsch">
  <rect width="24" height="5.33" rx="2.5" fill="#000"/><rect y="5.33" width="24" height="5.33" fill="#dd0000"/><rect y="10.66" width="24" height="5.34" fill="#ffce00"/></svg>`;
const FLAGS = { es: FLAG_ES, en: FLAG_EN, gl: FLAG_GL, pt: FLAG_PT, it: FLAG_IT, fr: FLAG_FR, de: FLAG_DE };

/* Contenido de ayuda por idioma (HTML). */
const HELP_HTML = {
    es: `
    <p class="help-lead">Tonex Loader es una utilidad independiente para cargar presets <b>.txp</b> en un
    <b>IK Multimedia TONEX One</b> o <b>TONEX Pedal</b> por USB, sin abrir el editor oficial TONEX.</p>
    <div class="help-warn">⚠️ <b>No sustituye al TONEX Editor.</b> No crea, edita, captura ni entrena
    modelos de amplificador, y no gestiona la librería en la nube. Su único trabajo es <b>pasar al pedal
    cualquier archivo .txp</b> que ya tengas (por ejemplo, uno que te pase un amigo).</div>

    <div class="help-section">✅ Qué SÍ puedes hacer</div>
    <ul class="help-list">
      <li><b>Leer</b> los slots del TONEX One o TONEX Pedal en vivo (nombre, character, amp, cab, efectos).</li>
      <li><b>Subir</b> cualquier <b>.txp</b> a cualquier slot: arrastrándolo a la ventana, con <b>Abrir .txp</b>,
      o con clic derecho en un slot → <i>Subir aquí</i>. Si sueltas varios, se cargan en slots consecutivos.</li>
      <li><b>Asignar</b> un slot al footswitch <b>A</b>, <b>B</b> o <b>Stomp</b> (clic derecho → <i>Cargar</i>,
      o arrastrando una fila sobre una tarjeta).</li>
      <li>Ver en <b>tiempo real</b> qué preset está activo al pisar el footswitch.</li>
      <li><b>Cambiar el color del LED</b> de un slot (clic en el punto de color, solo TONEX One).</li>
      <li><b>Backup y Restore completos</b>: <b>Backup</b> exporta TODOS los slots a un único <b>.zip</b>
      (un <b>.txp</b> por slot + las asignaciones A/B/Stomp y los colores de LED). <b>Restaurar</b> vuelve
      a cargar ese .zip en el pedal, dejándolo igual que cuando lo guardaste.</li>
    </ul>

    <div class="help-section">💾 Backup y Restore</div>
    <ul class="help-list">
      <li><b>Backup</b>: pulsa <b>💾 Backup</b> y elige dónde guardar el <b>.zip</b>. Contiene un <b>.txp</b>
      fiel de cada slot y un <code>manifest.json</code> con el modelo, las asignaciones A/B/Stomp y los colores
      (estos dos últimos solo en el TONEX One).</li>
      <li><b>Restaurar</b>: pulsa <b>♻ Restaurar</b>, elige un <b>.zip</b> hecho con esta app y confirma.
      <b>Sobrescribe</b> el contenido del pedal con el del backup (esta acción no se puede deshacer).</li>
      <li>Sirve para <b>migrar a otro pedal</b>, <b>recuperar</b> tras un reset o <b>clonar</b> una configuración.</li>
    </ul>

    <div class="help-section">🚫 Qué NO puedes hacer</div>
    <ul class="help-list">
      <li>No es un editor: aquí no se ajustan ganancia/EQ/efectos. Eso se hace en TONEX o en el origen del .txp.</li>
      <li>No crea ni captura modelos de amplificador nuevos.</li>
      <li><b>Cierra el software oficial TONEX antes de usar esta app</b>: solo un programa puede usar el puerto USB a la vez.</li>
    </ul>

    <div class="help-section">▶️ Cómo subir un preset</div>
    <ol class="help-list">
      <li>Conecta el TONEX One o TONEX Pedal por USB (aparece solo; si hace falta, elige el puerto COM arriba).</li>
      <li>Arrastra un <b>.txp</b> a la ventana — o pulsa <b>Abrir .txp</b> — y elige el slot de destino.</li>
      <li>Espera el OK. Si quieres oírlo, carga ese slot en <b>A/B/Stomp</b> y písalo.</li>
    </ol>`,
    en: `
    <p class="help-lead">Tonex Loader is an independent utility to load <b>.txp</b> presets onto an
    <b>IK Multimedia TONEX One</b> or <b>TONEX Pedal</b> over USB, without opening the official TONEX editor.</p>
    <div class="help-warn">⚠️ <b>It is not a replacement for the TONEX Editor.</b> It does not create, edit,
    capture or train amp models, and it does not manage the cloud library. Its only job is to <b>push any
    .txp file</b> you already have onto your pedal (for example, one a friend sends you).</div>

    <div class="help-section">✅ What you CAN do</div>
    <ul class="help-list">
      <li><b>Read</b> the slots of your TONEX One or TONEX Pedal live (name, character, amp, cab, effects).</li>
      <li><b>Upload</b> any <b>.txp</b> to any slot: drag it onto the window, use <b>Open .txp</b>,
      or right-click a slot → <i>Upload here</i>. Drop several and they fill consecutive slots.</li>
      <li><b>Assign</b> a slot to footswitch <b>A</b>, <b>B</b> or <b>Stomp</b> (right-click → <i>Load</i>,
      or drag a row onto a card).</li>
      <li>See in <b>real time</b> which preset is active when you press the footswitch.</li>
      <li><b>Change a slot's LED colour</b> (click the colour dot, TONEX One only).</li>
      <li><b>Full Backup &amp; Restore</b>: <b>Backup</b> exports EVERY slot to a single <b>.zip</b>
      (one <b>.txp</b> per slot + the A/B/Stomp assignments and LED colours). <b>Restore</b> loads that .zip
      back onto the pedal, leaving it exactly as it was when you saved it.</li>
    </ul>

    <div class="help-section">💾 Backup &amp; Restore</div>
    <ul class="help-list">
      <li><b>Backup</b>: click <b>💾 Backup</b> and choose where to save the <b>.zip</b>. It holds a faithful
      <b>.txp</b> of every slot plus a <code>manifest.json</code> with the model, the A/B/Stomp assignments
      and the colours (the last two only on the TONEX One).</li>
      <li><b>Restore</b>: click <b>♻ Restore</b>, pick a <b>.zip</b> made with this app and confirm.
      It <b>overwrites</b> the pedal's contents with the backup (this cannot be undone).</li>
      <li>Great for <b>migrating to another pedal</b>, <b>recovering</b> after a reset, or <b>cloning</b> a setup.</li>
    </ul>

    <div class="help-section">🚫 What you CANNOT do</div>
    <ul class="help-list">
      <li>It is not an editor: you can't tweak gain/EQ/effects here. Do that in TONEX or in the .txp's source.</li>
      <li>It can't create or capture new amp models.</li>
      <li><b>Close the official TONEX software before using this app</b>: only one program can use the USB port at a time.</li>
    </ul>

    <div class="help-section">▶️ How to upload a preset</div>
    <ol class="help-list">
      <li>Connect the TONEX One or TONEX Pedal over USB (it shows up automatically; pick the COM port above if needed).</li>
      <li>Drag a <b>.txp</b> onto the window — or click <b>Open .txp</b> — and choose the target slot.</li>
      <li>Wait for the OK. To hear it, load that slot into <b>A/B/Stomp</b> and step on it.</li>
    </ol>`,
};

Object.assign(HELP_HTML, {
    gl: `
    <p class="help-lead">Tonex Loader é unha utilidade independente para cargar presets <b>.txp</b> nun
    <b>IK Multimedia TONEX One</b> ou <b>TONEX Pedal</b> por USB, sen abrir o editor oficial TONEX.</p>
    <div class="help-warn">⚠️ <b>Non substitúe o TONEX Editor.</b> Non crea, edita, captura nin adestra
    modelos de amplificador, e non xestiona a biblioteca na nube. O seu único traballo é <b>pasar ao pedal
    calquera ficheiro .txp</b> que xa teñas.</div>

    <div class="help-section">✅ Que SI podes facer</div>
    <ul class="help-list">
      <li><b>Ler</b> os slots do TONEX One ou TONEX Pedal en directo (nome, carácter, amp, cab e efectos).</li>
      <li><b>Subir</b> calquera <b>.txp</b> a calquera slot: arrastrándoo á xanela, con <b>Abrir .txp</b>,
      ou con clic dereito nun slot → <i>Subir aquí</i>. Se soltas varios, cargaranse en slots consecutivos.</li>
      <li><b>Asignar</b> un slot ao footswitch <b>A</b>, <b>B</b> ou <b>Stomp</b> (clic dereito → <i>Cargar</i>,
      ou arrastrando unha fila sobre unha tarxeta).</li>
      <li>Ver en <b>tempo real</b> que preset está activo ao pisar o footswitch.</li>
      <li><b>Cambiar a cor do LED</b> dun slot (clic no punto de cor, só no TONEX One).</li>
      <li><b>Backup e Restore completos</b>: <b>Backup</b> exporta TODOS os slots a un único <b>.zip</b>
      (un <b>.txp</b> por slot + asignacións A/B/Stomp e cores de LED). <b>Restaurar</b> volve cargar ese .zip no pedal.</li>
    </ul>

    <div class="help-section">💾 Backup e Restore</div>
    <ul class="help-list">
      <li><b>Backup</b>: preme <b>💾 Backup</b> e escolle onde gardar o <b>.zip</b>. Inclúe un <b>.txp</b>
      fiel de cada slot e un <code>manifest.json</code> co modelo, asignacións A/B/Stomp e cores.</li>
      <li><b>Restaurar</b>: preme <b>♻ Restaurar</b>, escolle un <b>.zip</b> feito con esta app e confirma.
      <b>Sobrescribe</b> o contido do pedal co backup; esta acción non se pode desfacer.</li>
      <li>Serve para <b>migrar a outro pedal</b>, <b>recuperar</b> tras un reset ou <b>clonar</b> unha configuración.</li>
    </ul>

    <div class="help-section">🚫 Que NON podes facer</div>
    <ul class="help-list">
      <li>Non é un editor: aquí non se axustan ganancia/EQ/efectos. Iso faise en TONEX ou na orixe do .txp.</li>
      <li>Non crea nin captura modelos de amplificador novos.</li>
      <li><b>Pecha o software oficial TONEX antes de usar esta app</b>: só un programa pode usar o porto USB á vez.</li>
    </ul>

    <div class="help-section">▶️ Como subir un preset</div>
    <ol class="help-list">
      <li>Conecta o TONEX One ou TONEX Pedal por USB; se fai falta, escolle o porto COM de arriba.</li>
      <li>Arrastra un <b>.txp</b> á xanela, ou preme <b>Abrir .txp</b>, e escolle o slot de destino.</li>
      <li>Agarda o OK. Para escoitalo, carga ese slot en <b>A/B/Stomp</b> e pisa o footswitch.</li>
    </ol>`,
    pt: `
    <p class="help-lead">Tonex Loader é uma utilidade independente para carregar presets <b>.txp</b> em um
    <b>IK Multimedia TONEX One</b> ou <b>TONEX Pedal</b> via USB, sem abrir o editor oficial TONEX.</p>
    <div class="help-warn">⚠️ <b>Não substitui o TONEX Editor.</b> Não cria, edita, captura nem treina
    modelos de amplificador, e não gerencia a biblioteca na nuvem. Sua única função é <b>enviar para o pedal
    qualquer arquivo .txp</b> que você já tenha.</div>

    <div class="help-section">✅ O que você PODE fazer</div>
    <ul class="help-list">
      <li><b>Ler</b> os slots do TONEX One ou TONEX Pedal ao vivo (nome, caráter, amp, cab e efeitos).</li>
      <li><b>Enviar</b> qualquer <b>.txp</b> para qualquer slot: arrastando para a janela, usando <b>Abrir .txp</b>,
      ou clicando com o botão direito em um slot → <i>Enviar aqui</i>. Se soltar vários, eles ocupam slots consecutivos.</li>
      <li><b>Atribuir</b> um slot ao footswitch <b>A</b>, <b>B</b> ou <b>Stomp</b> (botão direito → <i>Carregar</i>,
      ou arrastando uma linha para um cartão).</li>
      <li>Ver em <b>tempo real</b> qual preset está ativo ao pisar no footswitch.</li>
      <li><b>Alterar a cor do LED</b> de um slot (clique no ponto de cor, somente TONEX One).</li>
      <li><b>Backup e Restore completos</b>: <b>Backup</b> exporta TODOS os slots para um único <b>.zip</b>
      (um <b>.txp</b> por slot + atribuições A/B/Stomp e cores de LED). <b>Restaurar</b> carrega esse .zip de volta no pedal.</li>
    </ul>

    <div class="help-section">💾 Backup e Restore</div>
    <ul class="help-list">
      <li><b>Backup</b>: clique em <b>💾 Backup</b> e escolha onde salvar o <b>.zip</b>. Ele contém um <b>.txp</b>
      fiel de cada slot e um <code>manifest.json</code> com o modelo, as atribuições A/B/Stomp e as cores.</li>
      <li><b>Restaurar</b>: clique em <b>♻ Restaurar</b>, escolha um <b>.zip</b> feito com este app e confirme.
      Isso <b>sobrescreve</b> o conteúdo do pedal com o backup; a ação não pode ser desfeita.</li>
      <li>Útil para <b>migrar para outro pedal</b>, <b>recuperar</b> após um reset ou <b>clonar</b> uma configuração.</li>
    </ul>

    <div class="help-section">🚫 O que você NÃO PODE fazer</div>
    <ul class="help-list">
      <li>Não é um editor: ganho/EQ/efeitos não são ajustados aqui. Faça isso no TONEX ou na origem do .txp.</li>
      <li>Não cria nem captura novos modelos de amplificador.</li>
      <li><b>Feche o software oficial TONEX antes de usar este app</b>: apenas um programa pode usar a porta USB por vez.</li>
    </ul>

    <div class="help-section">▶️ Como enviar um preset</div>
    <ol class="help-list">
      <li>Conecte o TONEX One ou TONEX Pedal por USB; se necessário, escolha a porta COM acima.</li>
      <li>Arraste um <b>.txp</b> para a janela, ou clique em <b>Abrir .txp</b>, e escolha o slot de destino.</li>
      <li>Aguarde o OK. Para ouvir, carregue esse slot em <b>A/B/Stomp</b> e pise no footswitch.</li>
    </ol>`,
    it: `
    <p class="help-lead">Tonex Loader è un’utilità indipendente per caricare preset <b>.txp</b> su un
    <b>IK Multimedia TONEX One</b> o <b>TONEX Pedal</b> via USB, senza aprire l’editor ufficiale TONEX.</p>
    <div class="help-warn">⚠️ <b>Non sostituisce TONEX Editor.</b> Non crea, modifica, cattura o addestra
    modelli di amplificatore e non gestisce la libreria cloud. Il suo unico compito è <b>inviare al pedale
    qualsiasi file .txp</b> che possiedi già.</div>

    <div class="help-section">✅ Cosa PUOI fare</div>
    <ul class="help-list">
      <li><b>Leggere</b> gli slot del TONEX One o TONEX Pedal in tempo reale (nome, carattere, amp, cab, effetti).</li>
      <li><b>Caricare</b> qualsiasi <b>.txp</b> in qualsiasi slot: trascinandolo nella finestra, usando <b>Apri .txp</b>,
      oppure con clic destro su uno slot → <i>Carica qui</i>. Se ne rilasci diversi, vengono caricati in slot consecutivi.</li>
      <li><b>Assegnare</b> uno slot al footswitch <b>A</b>, <b>B</b> o <b>Stomp</b> (clic destro → <i>Carica</i>,
      oppure trascinando una riga su una scheda).</li>
      <li>Vedere in <b>tempo reale</b> quale preset è attivo quando premi il footswitch.</li>
      <li><b>Cambiare il colore del LED</b> di uno slot (clic sul punto colorato, solo TONEX One).</li>
      <li><b>Backup e Restore completi</b>: <b>Backup</b> esporta TUTTI gli slot in un unico <b>.zip</b>
      (un <b>.txp</b> per slot + assegnazioni A/B/Stomp e colori LED). <b>Ripristina</b> ricarica quel .zip sul pedale.</li>
    </ul>

    <div class="help-section">💾 Backup e Restore</div>
    <ul class="help-list">
      <li><b>Backup</b>: premi <b>💾 Backup</b> e scegli dove salvare il <b>.zip</b>. Contiene un <b>.txp</b>
      fedele di ogni slot e un <code>manifest.json</code> con modello, assegnazioni A/B/Stomp e colori.</li>
      <li><b>Ripristina</b>: premi <b>♻ Ripristina</b>, scegli un <b>.zip</b> creato con questa app e conferma.
      <b>Sovrascrive</b> il contenuto del pedale con il backup; l’azione non può essere annullata.</li>
      <li>Serve per <b>migrare su un altro pedale</b>, <b>recuperare</b> dopo un reset o <b>clonare</b> una configurazione.</li>
    </ul>

    <div class="help-section">🚫 Cosa NON PUOI fare</div>
    <ul class="help-list">
      <li>Non è un editor: gain/EQ/effetti non si regolano qui. Fallo in TONEX o nella sorgente del .txp.</li>
      <li>Non crea né cattura nuovi modelli di amplificatore.</li>
      <li><b>Chiudi il software ufficiale TONEX prima di usare questa app</b>: solo un programma può usare la porta USB alla volta.</li>
    </ul>

    <div class="help-section">▶️ Come caricare un preset</div>
    <ol class="help-list">
      <li>Collega il TONEX One o TONEX Pedal via USB; se necessario, scegli la porta COM in alto.</li>
      <li>Trascina un <b>.txp</b> nella finestra, oppure premi <b>Apri .txp</b>, e scegli lo slot di destinazione.</li>
      <li>Attendi l’OK. Per ascoltarlo, carica quello slot in <b>A/B/Stomp</b> e premi il footswitch.</li>
    </ol>`,
    fr: `
    <p class="help-lead">Tonex Loader est un utilitaire indépendant permettant de charger des presets <b>.txp</b> dans un
    <b>IK Multimedia TONEX One</b> ou <b>TONEX Pedal</b> par USB, sans ouvrir l’éditeur officiel TONEX.</p>
    <div class="help-warn">⚠️ <b>Il ne remplace pas TONEX Editor.</b> Il ne crée, ne modifie, ne capture et
    n’entraîne aucun modèle d’ampli, et ne gère pas la bibliothèque cloud. Son seul rôle est <b>d’envoyer à la pédale
    n’importe quel fichier .txp</b> que vous possédez déjà.</div>

    <div class="help-section">✅ Ce que vous POUVEZ faire</div>
    <ul class="help-list">
      <li><b>Lire</b> les slots du TONEX One ou TONEX Pedal en direct (nom, caractère, amp, cab, effets).</li>
      <li><b>Charger</b> n’importe quel <b>.txp</b> dans n’importe quel slot : en le déposant dans la fenêtre, avec
      <b>Ouvrir .txp</b>, ou par clic droit sur un slot → <i>Charger ici</i>. Plusieurs fichiers se placent dans des slots consécutifs.</li>
      <li><b>Assigner</b> un slot au footswitch <b>A</b>, <b>B</b> ou <b>Stomp</b> (clic droit → <i>Charger</i>,
      ou en faisant glisser une ligne sur une carte).</li>
      <li>Voir en <b>temps réel</b> quel preset est actif lorsque vous appuyez sur le footswitch.</li>
      <li><b>Changer la couleur de LED</b> d’un slot (clic sur le point de couleur, TONEX One seulement).</li>
      <li><b>Backup et Restore complets</b> : <b>Sauvegarde</b> exporte TOUS les slots dans un seul <b>.zip</b>
      (un <b>.txp</b> par slot + assignations A/B/Stomp et couleurs LED). <b>Restaurer</b> recharge ce .zip dans la pédale.</li>
    </ul>

    <div class="help-section">💾 Backup et Restore</div>
    <ul class="help-list">
      <li><b>Sauvegarde</b> : cliquez sur <b>💾 Sauvegarde</b> et choisissez où enregistrer le <b>.zip</b>. Il contient
      un <b>.txp</b> fidèle de chaque slot et un <code>manifest.json</code> avec le modèle, les assignations et les couleurs.</li>
      <li><b>Restaurer</b> : cliquez sur <b>♻ Restaurer</b>, choisissez un <b>.zip</b> créé avec cette app et confirmez.
      Cela <b>écrase</b> le contenu de la pédale avec la sauvegarde ; cette action est irréversible.</li>
      <li>Utile pour <b>migrer vers une autre pédale</b>, <b>récupérer</b> après une réinitialisation ou <b>cloner</b> une configuration.</li>
    </ul>

    <div class="help-section">🚫 Ce que vous NE POUVEZ PAS faire</div>
    <ul class="help-list">
      <li>Ce n’est pas un éditeur : gain/EQ/effets ne se règlent pas ici. Faites-le dans TONEX ou à la source du .txp.</li>
      <li>Il ne crée ni ne capture de nouveaux modèles d’ampli.</li>
      <li><b>Fermez le logiciel officiel TONEX avant d’utiliser cette app</b> : un seul programme peut utiliser le port USB à la fois.</li>
    </ul>

    <div class="help-section">▶️ Comment charger un preset</div>
    <ol class="help-list">
      <li>Connectez le TONEX One ou TONEX Pedal par USB ; si nécessaire, choisissez le port COM en haut.</li>
      <li>Déposez un <b>.txp</b> dans la fenêtre, ou cliquez sur <b>Ouvrir .txp</b>, puis choisissez le slot de destination.</li>
      <li>Attendez le OK. Pour l’écouter, chargez ce slot dans <b>A/B/Stomp</b> et appuyez sur le footswitch.</li>
    </ol>`,
    de: `
    <p class="help-lead">Tonex Loader ist ein unabhängiges Werkzeug, um <b>.txp</b>-Presets per USB auf ein
    <b>IK Multimedia TONEX One</b> oder <b>TONEX Pedal</b> zu laden, ohne den offiziellen TONEX Editor zu öffnen.</p>
    <div class="help-warn">⚠️ <b>Es ersetzt den TONEX Editor nicht.</b> Es erstellt, bearbeitet, erfasst und
    trainiert keine Amp-Modelle und verwaltet keine Cloud-Bibliothek. Seine einzige Aufgabe ist es, <b>beliebige
    .txp-Dateien</b>, die du bereits hast, auf das Pedal zu übertragen.</div>

    <div class="help-section">✅ Was du tun KANNST</div>
    <ul class="help-list">
      <li><b>Slots lesen</b> vom TONEX One oder TONEX Pedal in Echtzeit (Name, Charakter, Amp, Cab, Effekte).</li>
      <li><b>Jede .txp laden</b> in jeden Slot: per Drag & Drop ins Fenster, mit <b>.txp öffnen</b>,
      oder per Rechtsklick auf einen Slot → <i>Hier laden</i>. Mehrere Dateien werden in aufeinanderfolgende Slots geladen.</li>
      <li><b>Einen Slot zuweisen</b> zu Footswitch <b>A</b>, <b>B</b> oder <b>Stomp</b> (Rechtsklick → <i>Laden</i>,
      oder eine Zeile auf eine Karte ziehen).</li>
      <li>In <b>Echtzeit</b> sehen, welches Preset aktiv ist, wenn du den Footswitch drückst.</li>
      <li><b>Die LED-Farbe</b> eines Slots ändern (Klick auf den Farbpunkt, nur TONEX One).</li>
      <li><b>Vollständiges Backup und Restore</b>: <b>Backup</b> exportiert ALLE Slots in eine einzige <b>.zip</b>
      (eine <b>.txp</b> pro Slot + A/B/Stomp-Zuweisungen und LED-Farben). <b>Wiederherstellen</b> lädt diese .zip zurück auf das Pedal.</li>
    </ul>

    <div class="help-section">💾 Backup und Restore</div>
    <ul class="help-list">
      <li><b>Backup</b>: Klicke auf <b>💾 Backup</b> und wähle, wo die <b>.zip</b> gespeichert werden soll. Sie enthält
      eine originalgetreue <b>.txp</b> jedes Slots und eine <code>manifest.json</code> mit Modell, Zuweisungen und Farben.</li>
      <li><b>Wiederherstellen</b>: Klicke auf <b>♻ Wiederherstellen</b>, wähle eine mit dieser App erstellte <b>.zip</b> und bestätige.
      Dadurch wird der Inhalt des Pedals mit dem Backup <b>überschrieben</b>; diese Aktion kann nicht rückgängig gemacht werden.</li>
      <li>Nützlich zum <b>Umziehen auf ein anderes Pedal</b>, <b>Wiederherstellen</b> nach einem Reset oder <b>Klonen</b> einer Konfiguration.</li>
    </ul>

    <div class="help-section">🚫 Was du NICHT tun KANNST</div>
    <ul class="help-list">
      <li>Es ist kein Editor: Gain/EQ/Effekte werden hier nicht eingestellt. Das machst du in TONEX oder an der Quelle der .txp.</li>
      <li>Es erstellt oder erfasst keine neuen Amp-Modelle.</li>
      <li><b>Schließe die offizielle TONEX-Software, bevor du diese App verwendest</b>: Nur ein Programm kann den USB-Port gleichzeitig nutzen.</li>
    </ul>

    <div class="help-section">▶️ So lädst du ein Preset</div>
    <ol class="help-list">
      <li>Schließe TONEX One oder TONEX Pedal per USB an; wähle oben den COM-Port, falls nötig.</li>
      <li>Ziehe eine <b>.txp</b> ins Fenster, oder klicke auf <b>.txp öffnen</b>, und wähle den Ziel-Slot.</li>
      <li>Warte auf OK. Zum Anhören lade diesen Slot in <b>A/B/Stomp</b> und drücke den Footswitch.</li>
    </ol>`,
});

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
[
    { gl: 'Vermello', pt: 'Vermelho', it: 'Rosso', fr: 'Rouge', de: 'Rot' },
    { gl: 'Laranxa', pt: 'Laranja', it: 'Arancione', fr: 'Orange', de: 'Orange' },
    { gl: 'Amarelo', pt: 'Amarelo', it: 'Giallo', fr: 'Jaune', de: 'Gelb' },
    { gl: 'Verde', pt: 'Verde', it: 'Verde', fr: 'Vert', de: 'Grün' },
    { gl: 'Cian', pt: 'Ciano', it: 'Ciano', fr: 'Cyan', de: 'Cyan' },
    { gl: 'Celeste', pt: 'Azul claro', it: 'Azzurro', fr: 'Bleu ciel', de: 'Himmelblau' },
    { gl: 'Azul', pt: 'Azul', it: 'Blu', fr: 'Bleu', de: 'Blau' },
    { gl: 'Violeta', pt: 'Violeta', it: 'Viola', fr: 'Violet', de: 'Violett' },
    { gl: 'Maxenta', pt: 'Magenta', it: 'Magenta', fr: 'Magenta', de: 'Magenta' },
    { gl: 'Rosa', pt: 'Rosa', it: 'Rosa', fr: 'Rose', de: 'Rosa' },
    { gl: 'Granate', pt: 'Vinho', it: 'Bordeaux', fr: 'Bordeaux', de: 'Dunkelrot' },
    { gl: 'Marrón', pt: 'Marrom', it: 'Marrone', fr: 'Marron', de: 'Braun' },
    { gl: 'Oliva', pt: 'Oliva', it: 'Oliva', fr: 'Olive', de: 'Oliv' },
    { gl: 'Verde escuro', pt: 'Verde escuro', it: 'Verde scuro', fr: 'Vert foncé', de: 'Dunkelgrün' },
    { gl: 'Verde azulado', pt: 'Verde azulado', it: 'Verde petrolio', fr: 'Sarcelle', de: 'Blaugrün' },
    { gl: 'Azul aceiro', pt: 'Azul aço', it: 'Blu acciaio', fr: 'Bleu acier', de: 'Stahlblau' },
    { gl: 'Azul mariño', pt: 'Azul marinho', it: 'Blu navy', fr: 'Bleu marine', de: 'Marineblau' },
    { gl: 'Morado', pt: 'Índigo', it: 'Indaco', fr: 'Indigo', de: 'Indigo' },
    { gl: 'Púrpura', pt: 'Púrpura', it: 'Porpora', fr: 'Pourpre', de: 'Purpur' },
    { gl: 'Malva', pt: 'Malva', it: 'Malva', fr: 'Mauve', de: 'Malve' },
    { gl: 'Apagado', pt: 'Desligado', it: 'Spento', fr: 'Éteint', de: 'Aus' },
].forEach((names, i) => Object.assign(LED_PALETTE[i].name, names));
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
    selectedIndex: null,   // ultima fila clicada (ancla "activa" para acciones de 1 slot)
    selected: new Set(),   // multiseleccion de slots (estilo explorador de Windows)
    selAnchor: null,       // ancla para la seleccion por rango con Shift
    polling: false,
    busy: false,
    droppedPaths: [],
    dragRowIndex: null,
    pedalActiveIndex: null, // preset activo seleccionado en el Pedal
    selecting: false,
    reloading: false,       // lectura completa en curso → modal "Recargando…"
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

let licenseInfo = {
    unlocked: true,
    token: '',
    hwid: '',
    donateUrl: '',
    freeLimit: 3,
    activeLimit: 0
};
let countdownTimer = null;
const COUNTDOWN_SECONDS = 45;

function waitWailsReady() {
    return new Promise((resolve) => {
        if (window.go && window.go.main && window.go.main.App) {
            resolve();
        } else {
            const check = setInterval(() => {
                if (window.go && window.go.main && window.go.main.App) {
                    clearInterval(check);
                    resolve();
                }
            }, 30);
        }
    });
}

function monetizationPartEnabled(part) {
    return !!monetizationConfig.monetizationEnabled && monetizationConfig[part] !== false;
}

// ¿Hay restricciones activas para este equipo? (no ha donado y el switch de
// restricciones está activo, o estamos en modo sin conexión). Si el switch maestro
// se apaga, monetizationPartEnabled devuelve false y esto también deja de aplicar.
function restrictionsActive() {
    return !!monetizationConfig.offlineMode
        || (monetizationPartEnabled('restrictions') && !licenseInfo.unlocked);
}

/* ---- recordatorio periódico de donación (no donantes) ----
   Cada 5 min de uso aparece una modal con texto intermitente que no se puede cerrar
   hasta pasados 10 s. Se reprograma tras cada cierre. Deja de mostrarse en cuanto el
   usuario dona o el switch de monetización se apaga (se comprueba al disparar). */
const REMINDER_INTERVAL_MS = 5 * 60 * 1000;
const REMINDER_CLOSE_DELAY = 10; // segundos antes de poder cerrar
let reminderTimer = null;
let reminderCountdown = null;

function scheduleReminder() {
    if (reminderTimer) clearTimeout(reminderTimer);
    reminderTimer = setTimeout(maybeShowReminder, REMINDER_INTERVAL_MS);
}
function maybeShowReminder() {
    // Si ya no hay restricciones (donó / switch off) seguimos comprobando por si
    // cambia el estado, pero sin molestar.
    if (!restrictionsActive()) { scheduleReminder(); return; }
    // No interrumpir una operación en curso ni apilar sobre el overlay de donación.
    const ov = $('donationOverlay');
    if (state.busy || (ov && ov.classList.contains('active'))) { scheduleReminder(); return; }
    showReminder();
}
function showReminder() {
    const ov = $('reminderOverlay');
    const btn = $('reminderClose');
    const countdownText = $('reminderCountdownText');
    const closeHint = $('reminderCloseHint');
    if (!ov || !btn || !countdownText || !closeHint) { scheduleReminder(); return; }
    $('reminderText').textContent = t('reminderMsg');
    countdownText.textContent = '';
    closeHint.textContent = '';
    closeHint.classList.remove('active');
    btn.classList.remove('visible');
    btn.disabled = true;
    ov.classList.add('active');
    let s = REMINDER_CLOSE_DELAY;
    const label = () => { countdownText.textContent = t('reminderCloseIn', { s }); };
    label();
    if (reminderCountdown) clearInterval(reminderCountdown);
    reminderCountdown = setInterval(() => {
        s--;
        if (s <= 0) {
            clearInterval(reminderCountdown); reminderCountdown = null;
            countdownText.textContent = '';
            closeHint.textContent = t('reminderCanClose');
            closeHint.classList.add('active');
            btn.disabled = false;
            btn.title = t('reminderCloseBtn');
            btn.setAttribute('aria-label', t('reminderCloseBtn'));
            btn.classList.add('visible');
        } else {
            label();
        }
    }, 1000);
}
function hideReminder() {
    const ov = $('reminderOverlay');
    if (ov) ov.classList.remove('active');
    const countdownText = $('reminderCountdownText');
    if (countdownText) countdownText.textContent = '';
    const closeHint = $('reminderCloseHint');
    if (closeHint) {
        closeHint.textContent = '';
        closeHint.classList.remove('active');
    }
    const btn = $('reminderClose');
    if (btn) {
        btn.classList.remove('visible');
        btn.disabled = true;
    }
    if (reminderCountdown) { clearInterval(reminderCountdown); reminderCountdown = null; }
    scheduleReminder(); // el siguiente recordatorio, 5 min después de cerrar este
}

function applyMonetizationUI() {
    const donate = $('btnDonate');
    if (donate) {
        donate.style.display = monetizationPartEnabled('donateButton') ? '' : 'none';
        const isFull = !restrictionsActive();
        if (isFull) {
            donate.textContent = t('supportProject');
            donate.title = t('supportProjectTitle');
        } else {
            donate.textContent = t('donateAndActivate');
            donate.title = t('donateAndActivateTitle');
        }
    }
    applyDonationLanguage();
    showOfflineWarning(!!monetizationConfig.offlineMode);
}

function applyDonationLanguage() {
    const title = $('donationTitle');
    const text = document.querySelector('#donationOverlay .donation-text');
    const important = document.querySelector('#donationOverlay .donation-token-label-important');
    const supportLabel = document.querySelector('#donationManual > .donation-token-label');
    if (title) title.textContent = t('donationTitleText');
    if (text) text.innerHTML = t('donationBody');
    if (important) important.textContent = t('donationImportant');
    if ($('donationClose')) $('donationClose').title = t('donationCloseTitle');
    if ($('btnCopyToken')) $('btnCopyToken').title = t('donationCopyTitle');
    if ($('btnCopyHwid')) $('btnCopyHwid').title = t('donationCopyTitle');
    if ($('donationDonate')) $('donationDonate').textContent = t('donationDonateButton');
    if ($('donationCheck')) $('donationCheck').textContent = t('donationCheckButton');
    if ($('donationManualToggle')) $('donationManualToggle').textContent = t('donationManualToggle');
    if (supportLabel) supportLabel.textContent = t('donationSupportId');
    if ($('donationCodeInput')) $('donationCodeInput').placeholder = t('donationCodePlaceholder');
    if ($('donationApply')) $('donationApply').textContent = t('donationApplyButton');
    if ($('donationNotFoundHint') && $('donationNotFoundHint').style.display !== 'none') {
        $('donationNotFoundHint').textContent = t('donationNotFoundHint');
    }
}

async function loadMonetizationConfig() {
    try {
        const b = backend();
        if (!b || typeof b.GetLicenseInfo !== 'function') throw new Error('license info unavailable');
        licenseInfo = await b.GetLicenseInfo();
        Object.assign(monetizationConfig, {
            monetizationEnabled: !!licenseInfo.monetizationEnabled,
            donateButton: licenseInfo.donateButton !== false,
            overlay: licenseInfo.overlay !== false,
            restrictions: licenseInfo.restrictions !== false,
            offlineMode: !!licenseInfo.offlineMode,
            activeLimit: licenseInfo.activeLimit || 0,
            importsDone: licenseInfo.importsDone || 0,
            exportsDone: licenseInfo.exportsDone || 0,
        });

        applyMonetizationUI();

        if (monetizationPartEnabled('overlay') && !licenseInfo.unlocked) {
            showDonationOverlay('startup');
            b.CheckDonation().then((ok) => { if (ok) donationUnlockSuccess(); }).catch(() => {});
        }
        scheduleReminder();
    } catch (e) {
        console.error("Monetization config load error:", e);
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
        applyMonetizationUI();
        scheduleReminder();
    }
}

function showDonationOverlay(mode) {
    if (!monetizationPartEnabled('overlay')) return;
    const ov = $('donationOverlay');
    if (!ov) return;
    $('donationToken').textContent = licenseInfo.token || '—';
    $('donationHwid').textContent = licenseInfo.hwid || '—';
    $('donationStatus').textContent = '';
    const hint = $('donationNotFoundHint');
    if (hint) hint.style.display = 'none';
    $('donationManualToggle').classList.remove('blink-highlight');
    applyDonationLanguage();

    ov.classList.add('active');

    if (mode === 'limit' || mode === 'manual') {
        ov.classList.add('closable');
        $('donationCountdown').textContent = '';
        if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
    } else {
        ov.classList.remove('closable');
        $('donationCountdown').textContent = '';
        if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
        startDonationCountdown(COUNTDOWN_SECONDS);
    }
}

function hideDonationOverlay() {
    const ov = $('donationOverlay');
    if (ov) ov.classList.remove('active');
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
}

function startDonationCountdown(sec) {
    let s = sec;
    const updateLabel = () => {
        $('donationCountdown').innerHTML = t('donationCountdown', { s });
    };
    updateLabel();
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
        s--;
        if (s <= 0) {
            clearInterval(countdownTimer);
            countdownTimer = null;
            $('donationCountdown').innerHTML = '';
            const ov = $('donationOverlay');
            if (ov) ov.classList.add('closable');
        } else {
            updateLabel();
        }
    }, 1000);
}

function donationUnlockSuccess() {
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
    const ov = $('donationOverlay');
    if (ov) {
        ov.classList.add('closable');
        const st = $('donationStatus');
        if (st) {
            st.style.color = 'var(--pos-b)';
            st.textContent = t('donationVerified');
        }
        const hint = $('donationNotFoundHint');
        if (hint) hint.style.display = 'none';
        $('donationManualToggle').classList.remove('blink-highlight');
        setTimeout(hideDonationOverlay, 1800);
    }
    loadMonetizationConfig();
}

async function donationCheck() {
    const b = backend();
    if (!b) return;
    const st = $('donationStatus');
    if (st) {
        st.style.color = '';
        st.textContent = t('donationChecking');
    }
    const hint = $('donationNotFoundHint');
    if (hint) hint.style.display = 'none';
    try {
        const ok = await b.CheckDonation();
        if (ok) {
            donationUnlockSuccess();
        } else {
            if (st) {
                st.style.color = '#ff9a3d';
                st.textContent = t('donationNotFound');
            }
            if (hint) {
                hint.textContent = t('donationNotFoundHint');
                hint.style.display = 'block';
            }
            $('donationManualToggle').classList.add('blink-highlight');
        }
    } catch (e) {
        if (st) st.textContent = translateBackendText(e);
    }
}

async function donationApplyManual() {
    const b = backend();
    if (!b) return;
    const code = $('donationCodeInput').value.trim();
    const st = $('donationStatus');
    if (st) {
        st.style.color = '';
        st.textContent = t('donationApplyingCode');
    }
    try {
        const ok = await b.ApplyCode(code);
        if (ok) {
            donationUnlockSuccess();
        } else {
            if (st) {
                st.style.color = 'var(--pos-c)';
                st.textContent = t('donationInvalidCode');
            }
        }
    } catch (e) {
        if (st) {
            st.style.color = 'var(--pos-c)';
            st.textContent = translateBackendText(e);
        }
    }
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
    ['btnRefresh', 'btnOpen', 'btnBackup', 'btnRestore', 'btnPoll'].forEach((id) => {
        const el = $(id);
        if (el) el.disabled = on;
    });
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
    document.querySelectorAll('.lang-btn[data-lang]').forEach((b) => {
        b.innerHTML = FLAGS[b.dataset.lang] || FLAGS.es;
        b.classList.toggle('active', b.dataset.lang === lang);
    });
    const langSwitch = $('langSwitch');
    if (langSwitch) langSwitch.setAttribute('aria-label', t('languageSelectorLabel'));
    document.querySelectorAll('.donation-lang-switch').forEach((el) => {
        el.setAttribute('aria-label', t('languageSelectorLabel'));
    });
    $('dropHint').querySelector('.drop-inner').innerHTML = t('dropHint');
    // Si el recordatorio está abierto, refrescar su texto (y el botón si ya es cerrable).
    const remOv = $('reminderOverlay');
    if (remOv && remOv.classList.contains('active')) {
        $('reminderText').textContent = t('reminderMsg');
        const rb = $('reminderClose');
        const hint = $('reminderCloseHint');
        if (hint && rb && !rb.disabled) hint.textContent = t('reminderCanClose');
        if (rb && !rb.disabled) {
            rb.title = t('reminderCloseBtn');
            rb.setAttribute('aria-label', t('reminderCloseBtn'));
        }
    }
    applyMonetizationUI();
    setBackendLanguage(lang);
    // re-render dinámico
    renderCards();
    renderTable();
    if (!state.snapshot) {
        setStatus(state.port ? t('pedalDetected', { port: state.port }) : t('statusReady'),
            state.port ? 'ok' : '');
    }
}

function setLang(l) {
    const next = normalizeLang(l);
    if (next === lang) return;
    lang = next;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    applyLang();
}

function setBackendLanguage(nextLang) {
    try {
        const b = backend();
        if (b && typeof b.SetLanguage === 'function') b.SetLanguage(nextLang);
    } catch (_) {}
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
        const name = state.snapshot && state.snapshot.modelName;
        sub.textContent = name ? `IK Multimedia ${name} · USB` : t('subtitle');
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
        if (state.selected.has(p.index)) cls.push('selected');
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
    clearSelection();
    applyModelUI();
    renderCards();
    renderTable();
    // Lectura completa en curso (arranque / Refrescar / tras restore): modal con
    // barra de progreso que avanza a medida que llegan los slots.
    if (state.reloading) ensureProgress(t('reloadProgressTitle'), { total: st.count });
}
// Llega un preset leído: rellenamos SOLO su fila (sin re-pintar toda la tabla).
function fillRow(s) {
    if (!state.snapshot || !state.snapshot.presets[s.index]) return;
    state.snapshot.presets[s.index] = s;
    if (state.reloading) {
        const done = state.snapshot.presets.filter((p) => !p.loading).length;
        updateProgress(done, state.snapshot.count);
    }
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
        const previousPort = state.port;
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
        const previousStillAvailable = ports.find((p) => p.name === previousPort);
        state.port = detected
            ? ports[0].name
            : (previousStillAvailable ? previousStillAvailable.name : ports[0].name);
        state.autoDetected = !!detected;
        sel.value = state.port;
        setStatus(detected ? t('pedalDetected', { port: state.port }) : t('pickPortHint'), detected ? 'ok' : '');
    } catch (e) {
        setStatus(t('errPorts', { e }), 'err');
    }
}

/* ---- refresh ---- */
// reloadModal=true muestra la modal "Recargando…" durante la relectura. Solo se
// usa tras un restore: en el arranque es una carga inicial ("Carga", no "Recarga").
async function refresh(reloadModal = false) {
    const b = backend();
    if (!b) return;
    // El backend pausa/reanuda el poller automáticamente alrededor de la lectura
    // (withPedal). No paramos el polling aquí para no perder el auto-resume.
    busy(true);
    state.reloading = reloadModal;
    setStatus(t('reading'), 'busy');
    try {
        await loadPorts();
        if (!state.port) return;
        setStatus(t('reading'), 'busy');
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
        state.reloading = false;
        hideProgress();
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

/* ---- selección (estilo explorador de Windows) ----
   Clic simple = selecciona solo ese slot. Ctrl+clic = alterna ese slot.
   Shift+clic = rango contiguo desde el ancla hasta el clicado. */
function paintSelection() {
    document.querySelectorAll('#slotBody tr').forEach((tr) => {
        tr.classList.toggle('selected', state.selected.has(parseInt(tr.dataset.index, 10)));
    });
}
function selectedIndices() {
    return Array.from(state.selected).sort((a, b) => a - b);
}
function clearSelection() {
    state.selected.clear();
    state.selectedIndex = null;
    state.selAnchor = null;
}
// Selección simple (un solo slot); reemplaza la anterior. Es el comportamiento
// por defecto y el que usan las acciones de un solo slot (color, menú, Pedal).
function selectRow(idx) {
    state.selected = new Set([idx]);
    state.selectedIndex = idx;
    state.selAnchor = idx;
    paintSelection();
}
function toggleRow(idx) {
    if (state.selected.has(idx)) state.selected.delete(idx);
    else state.selected.add(idx);
    state.selectedIndex = idx;
    state.selAnchor = idx;
    paintSelection();
}
function rangeRow(idx) {
    const anchor = state.selAnchor == null ? idx : state.selAnchor;
    const lo = Math.min(anchor, idx), hi = Math.max(anchor, idx);
    state.selected = new Set();
    for (let i = lo; i <= hi; i++) state.selected.add(i);
    state.selectedIndex = idx; // el ancla se conserva para extender el rango
    paintSelection();
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
    // Estilo explorador: si el slot bajo el cursor NO está en la selección actual,
    // pasa a ser la selección única; si SÍ lo está, se conserva la multiselección.
    if (!state.selected.has(idx)) selectRow(idx);
    const sel = selectedIndices();
    const menu = $('ctxMenu');
    let items;
    if (sel.length > 1) {
        // Menú de multiselección: solo acciones aplicables al conjunto (exportar).
        items = `
    <div class="ctx-sub">${t('ctxSelCount', { n: sel.length })}</div>
    <div class="ctx-item" data-act="export-multi">${t('ctxExportMulti', { n: sel.length })}</div>
    <div class="ctx-item" data-act="export-multi-bcho">${t('ctxExportMultiBcho', { n: sel.length })}</div>`;
    } else {
        const preset = presetByIndex(idx);
        // Ambos: detalles + subir + exportar. La asignación A/B/Stomp y el color de LED
        // son específicos del Tonex One (en el Pedal se ocultan: usa bancos, no asignación
        // libre, y su estado no expone el bloque de colores del One).
        items = `
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
    if (act === 'export-multi') return exportSelected(false);
    if (act === 'export-multi-bcho') return exportSelected(true);
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
const DONATE_URL = 'https://ko-fi.com/bchosoft';
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
function versionStatusHtml() {
    const isFull = !restrictionsActive();
    const text = isFull ? t('fullVersion') : t('restrictedVersion');
    const color = isFull ? '#39ff14' : '#ff4d6a';
    const shadow = isFull ? 'rgba(57,255,20,0.4)' : 'rgba(255,77,106,0.4)';
    return `<div class="version-status" style="color:${color};text-shadow:0 0 10px ${shadow};">[ ${text} ]</div>`;
}

function showHelp() {
    const helpBody = HELP_HTML[lang] || HELP_HTML.es;
    openModal(`
    <h2>${t('helpTitle')}</h2>
    <div class="help-body">${versionStatusHtml()}${helpBody}</div>
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
    } else if (monetizationPartEnabled('restrictions') && !licenseInfo.unlocked) {
        const remaining = Math.max(0, (monetizationConfig.activeLimit || 3) - (monetizationConfig.importsDone || 0));
        if (remaining <= 0) {
            showDonationOverlay('limit');
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
    ensureProgress(t('importProgressTitle'), { total: fit.length });
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
                if (monetizationConfig.offlineMode || (monetizationPartEnabled('restrictions') && !licenseInfo.unlocked)) {
                    monetizationConfig.importsDone++;
                }
                done.push(slot);
                // Si el backend ya devolvió el preset releído, pintamos esa fila ya.
                if (res.preset) fillRow(res.preset);
            } else {
                toast(t('noAck', { file }), '');
            }
        } catch (e) {
            const errorMsg = e.message || e;
            if (String(errorMsg).includes('OFFLINE_LIMIT')) {
                showOfflineWarning(true);
                toast(t('offlineImportLimit'), 'err');
                break;
            }
            if (String(errorMsg).includes('DONATION_LIMIT')) {
                showDonationOverlay('limit');
                break;
            }
            toast(t('uploadFileErr', { file, e }), 'err');
        }
        updateProgress(i + 1, fit.length);
    }
    hideProgress();
    setStatus(t('uploadDone', { ok, total: fit.length }), ok ? 'ok' : 'err');
    toast(t('uploadDone', { ok, total: fit.length }), ok ? 'ok' : 'err');
    busy(false);
    // Releer SOLO los slots subidos (no toda la snapshot).
    for (const slot of done) await refreshSlot(slot);
}

async function exportTXP(idx, bcho = false) {
    const b = backend();
    if (!b) return;
    if (monetizationConfig.offlineMode) {
        if ((monetizationConfig.exportsDone || 0) >= (monetizationConfig.activeLimit || 1)) {
            showOfflineWarning(true);
            toast(t('offlineExportLimit'), 'err');
            return;
        }
    } else if (monetizationPartEnabled('restrictions') && !licenseInfo.unlocked) {
        if ((monetizationConfig.exportsDone || 0) >= (monetizationConfig.activeLimit || 3)) {
            showDonationOverlay('limit');
            return;
        }
    }
    busy(true);
    setStatus(t('exporting', { n: slotNum(idx) }), 'busy');
    ensureProgress(t('exportProgressTitle'), { indeterminate: true });
    try {
        const path = bcho
            ? await b.ExportTXPBCho(idx, state.port)
            : await b.ExportTXP(idx, state.port);
        if (path) {
            if (monetizationConfig.offlineMode || (monetizationPartEnabled('restrictions') && !licenseInfo.unlocked)) {
                monetizationConfig.exportsDone++;
            }
            setStatus(t('exportSaved', { path }), 'ok');
            toast(t('exportSaved', { path }), 'ok');
        } else {
            setStatus(t('statusReady'), '');
        }
    } catch (e) {
        const errorMsg = e.message || e;
        if (String(errorMsg).includes('OFFLINE_LIMIT')) {
            showOfflineWarning(true);
            toast(t('offlineExportLimit'), 'err');
            return;
        }
        if (String(errorMsg).includes('DONATION_LIMIT')) {
            showDonationOverlay('limit');
            return;
        }
        setStatus(t('genericErr', { e }), 'err');
        toast(t('exportErr', { e }), 'err');
    } finally {
        hideProgress();
        busy(false);
    }
}

// Exporta TODOS los slots seleccionados a una carpeta (un solo diálogo). El backend
// pide la carpeta y escribe un .txp por slot. La modal de progreso (determinada) se
// muestra de forma perezosa con los eventos 'export-progress'.
async function exportSelected(bcho = false) {
    const b = backend();
    if (!b) return;
    const slots = selectedIndices();
    if (slots.length <= 1) return exportTXP(slots.length ? slots[0] : state.selectedIndex, bcho);
    // Misma comprobación de límite que la exportación individual.
    if (monetizationConfig.offlineMode) {
        if ((monetizationConfig.exportsDone || 0) >= (monetizationConfig.activeLimit || 1)) {
            showOfflineWarning(true);
            toast(t('offlineExportLimit'), 'err');
            return;
        }
    } else if (monetizationPartEnabled('restrictions') && !licenseInfo.unlocked) {
        if ((monetizationConfig.exportsDone || 0) >= (monetizationConfig.activeLimit || 3)) {
            showDonationOverlay('limit');
            return;
        }
    }
    busy(true);
    setStatus(t('exportingMulti', { total: slots.length }), 'busy');
    try {
        const res = await b.ExportTXPMulti(slots, state.port, bcho);
        if (res && res.dir) {
            if (monetizationConfig.offlineMode || (monetizationPartEnabled('restrictions') && !licenseInfo.unlocked)) {
                monetizationConfig.exportsDone++;
            }
            const fail = (res.failed && res.failed.length) || 0;
            const msg = fail
                ? t('exportMultiDoneFailed', { ok: res.exported, total: res.total, fail })
                : t('exportMultiDone', { ok: res.exported, total: res.total, dir: res.dir });
            setStatus(msg, fail ? 'err' : 'ok');
            toast(msg, fail ? '' : 'ok');
        } else {
            setStatus(t('statusReady'), '');
        }
    } catch (e) {
        const errorMsg = String(e.message || e);
        if (errorMsg.includes('OFFLINE_LIMIT')) { showOfflineWarning(true); toast(t('offlineExportLimit'), 'err'); }
        else if (errorMsg.includes('DONATION_LIMIT')) { showDonationOverlay('limit'); }
        else { setStatus(t('genericErr', { e }), 'err'); toast(t('exportErr', { e }), 'err'); }
    } finally {
        hideProgress();
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

/* ---- backup / restore (.zip con los .txp + manifest) ---- */
async function backup() {
    const b = backend();
    if (!b || !state.port) { toast(t('backupFirst'), ''); return; }
    busy(true);
    try {
        const path = await b.BackupZip(state.port);
        if (path) {
            if (monetizationConfig.offlineMode || (monetizationPartEnabled('restrictions') && !licenseInfo.unlocked)) {
                monetizationConfig.exportsDone = (monetizationConfig.exportsDone || 0) + 1;
            }
            setStatus(t('backupSaved', { path }), 'ok');
            toast(t('backupSaved', { path }), 'ok');
        } else {
            setStatus(t('statusReady'), '');
        }
    } catch (e) {
        const msg = String(e.message || e);
        if (msg.includes('OFFLINE_LIMIT')) { showOfflineWarning(true); toast(t('offlineExportLimit'), 'err'); }
        else if (msg.includes('DONATION_LIMIT')) { showDonationOverlay('limit'); }
        else toast(t('backupErr', { e }), 'err');
    } finally {
        hideProgress();
        busy(false);
    }
}

async function restore() {
    const b = backend();
    if (!b || !state.port) { toast(t('backupFirst'), ''); return; }
    busy(true);
    try {
        const rep = await b.RestoreZip(state.port);
        if (rep) {
            if (rep.uploaded > 0 && (monetizationConfig.offlineMode || (monetizationPartEnabled('restrictions') && !licenseInfo.unlocked))) {
                monetizationConfig.importsDone = (monetizationConfig.importsDone || 0) + 1;
            }
            const fail = (rep.failed && rep.failed.length) || 0;
            const msg = fail
                ? t('restoreDoneFailed', { ok: rep.uploaded, total: rep.total, fail })
                : t('restoreDone', { ok: rep.uploaded, total: rep.total });
            setStatus(msg, fail ? 'err' : 'ok');
            toast(msg, fail ? '' : 'ok');
            // El pedal cambió: releer la snapshot completa (con modal "Recargando…").
            hideProgress();
            await refresh(true);
        } else {
            setStatus(t('statusReady'), '');
        }
    } catch (e) {
        const msg = String(e.message || e);
        if (msg.includes('OFFLINE_LIMIT')) { showOfflineWarning(true); toast(t('offlineImportLimit'), 'err'); }
        else if (msg.includes('DONATION_LIMIT')) { showDonationOverlay('limit'); }
        else toast(t('restoreErr', { e }), 'err');
    } finally {
        hideProgress();
        busy(false);
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
    if ((m = msg.match(/^Exportando slot (\d+)\/(\d+)/))) return t('pExporting', { n: m[1], total: m[2] });
    if ((m = msg.match(/^Restaurando slot (\d+)\/(\d+)/))) return t('pRestoringSlot', { n: m[1], total: m[2] });
    if (/^Restaurando colores/.test(msg)) return t('pRestoringColors');
    if (/^Restaurando asignaciones/.test(msg)) return t('pRestoringAssign');
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
/* ---- modal de progreso (backup / restore / import / export) ----
   ensureProgress muestra la modal solo si está oculta (idempotente), para
   poder llamarla en cada evento de progreso sin re-iniciarla. En modo
   indeterminate oculta el contador y anima la barra (operaciones de un solo
   paso, p.ej. exportar un slot). */
function ensureProgress(title, opts = {}) {
    const el = $('loadProgress');
    if (!el.classList.contains('hidden')) return;
    const indet = !!opts.indeterminate;
    $('loadProgressTitle').textContent = title;
    el.querySelector('.load-progress-count').style.display = indet ? 'none' : '';
    const fill = $('loadProgressFill');
    fill.classList.toggle('indeterminate', indet);
    if (indet) fill.style.width = '';
    else updateProgress(0, opts.total || 0);
    el.classList.remove('hidden');
}
function updateProgress(done, total) {
    $('loadProgressDone').textContent = done;
    $('loadProgressTotal').textContent = total;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    $('loadProgressFill').style.width = pct + '%';
}
function hideProgress() { $('loadProgress').classList.add('hidden'); }
function setupCopyButton(btnId, targetId) {
    const btn = $(btnId);
    if (!btn) return;
    btn.onclick = () => {
        const text = ($(targetId).textContent || '').trim();
        if (!text || text === '—') return;
        navigator.clipboard.writeText(text).then(() => {
            const oldHtml = btn.innerHTML;
            btn.innerHTML = '✓';
            btn.style.color = '#2bf57e';
            setTimeout(() => {
                btn.innerHTML = oldHtml;
                btn.style.color = '';
            }, 1500);
        }).catch(err => {
            console.error("Clipboard copy failed:", err);
        });
    };
}

/* ---- init ---- */
function wireEvents() {
    $('btnRefresh').onclick = () => refresh();
    $('btnOpen').onclick = () => uploadFlowChooseSlot();
    $('btnBackup').onclick = backup;
    $('btnRestore').onclick = restore;
    $('btnPoll').onclick = () => togglePolling();
    $('btnHelp').onclick = showHelp;
    $('btnDonate').onclick = () => {
        if (!restrictionsActive()) {
            openDonate();
        } else {
            showDonationOverlay('manual');
        }
    };
    $('donationDonate').onclick = openDonate;
    $('donationCheck').onclick = donationCheck;
    $('donationClose').onclick = hideDonationOverlay;
    $('donationManualToggle').onclick = () => {
        $('donationManual').classList.toggle('open');
        $('donationManualToggle').classList.remove('blink-highlight');
    };
    $('donationApply').onclick = donationApplyManual;
    $('reminderClose').onclick = () => { if (!$('reminderClose').disabled) hideReminder(); };
    setupCopyButton('btnCopyToken', 'donationToken');
    setupCopyButton('btnCopyHwid', 'donationHwid');
    $('portSelect').onchange = (e) => { state.port = e.target.value; };
    document.querySelectorAll('.lang-btn[data-lang]').forEach((b) => {
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
        if (e.shiftKey) {
            rangeRow(idx);
        } else if (e.ctrlKey || e.metaKey) {
            toggleRow(idx);
        } else {
            selectRow(idx);
            if (isPedal()) selectOnPedal(idx); // Pedal: clic simple = cambiar preset activo
        }
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
    r.EventsOn('backup-progress', (p) => { if (p) { setStatus(t('backupRunning', { done: p.done, total: p.total }), 'busy'); ensureProgress(t('backupProgressTitle')); updateProgress(p.done, p.total); } });
    r.EventsOn('restore-progress', (p) => { if (p) { setStatus(t('restoreRunning', { done: p.done, total: p.total }), 'busy'); ensureProgress(t('restoreProgressTitle')); updateProgress(p.done, p.total); } });
    r.EventsOn('export-progress', (p) => { if (p) { setStatus(t('exportRunning', { done: p.done, total: p.total }), 'busy'); ensureProgress(t('exportMultiProgressTitle')); updateProgress(p.done, p.total); } });
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
    await waitWailsReady();
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
        // Se ejecuta en segundo plano para no bloquear la aparición del overlay de donación.
        refresh().then(() => {
            togglePolling(true);
        });
    } else if (!state.port) {
        setStatus(t('statusReady'), '');
    }
}

window.addEventListener('DOMContentLoaded', init);
