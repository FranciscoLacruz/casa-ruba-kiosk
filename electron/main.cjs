const { app, BrowserWindow, globalShortcut, session } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

const isDev = !app.isPackaged;
let mainWindow = null;

// ─── Creación de ventana ────────────────────────────────────────────────────

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: !isDev,
    kiosk: !isDev,
    frame: isDev,
    autoHideMenuBar: true,
    backgroundColor: '#000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5374');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Watchdog: en producción, relanzar si la ventana se cierra inesperadamente
  mainWindow.on('closed', () => {
    mainWindow = null;
    if (!isDev) {
      setTimeout(createWindow, 1000);
    }
  });
}

// ─── Permisos de micrófono ──────────────────────────────────────────────────

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    // Permitir acceso al micrófono para ElevenLabs
    if (permission === 'media' || permission === 'microphone') {
      callback(true);
    } else {
      callback(false);
    }
  });

  createWindow();
  bloquearTeclasPeligrosas();
  programarAutoUpdate();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// ─── Bloqueo de teclas en producción ───────────────────────────────────────

function bloquearTeclasPeligrosas() {
  if (isDev) return;

  const teclasBloqueadas = [
    'Alt+F4',
    'Ctrl+W',
    'Ctrl+R',
    'Ctrl+Shift+R',
    'F5',
    'F11',
    'Ctrl+Shift+I',
    'Ctrl+Shift+J',
    'Escape',
  ];

  app.on('browser-window-focus', () => {
    teclasBloqueadas.forEach((atajo) => {
      globalShortcut.register(atajo, () => {});
    });
  });

  app.on('browser-window-blur', () => {
    globalShortcut.unregisterAll();
  });
}

// ─── Auto-updater (3:00 AM) ─────────────────────────────────────────────────

function programarAutoUpdate() {
  if (isDev) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on('update-downloaded', () => {
    // Instalar y reiniciar silenciosamente
    autoUpdater.quitAndInstall(true, true);
  });

  autoUpdater.on('error', (err) => {
    console.error('[AutoUpdater] Error:', err.message);
  });

  function calcularMsHasta3AM() {
    const ahora = new Date();
    const proximas3AM = new Date();
    proximas3AM.setHours(3, 0, 0, 0);
    if (proximas3AM <= ahora) {
      proximas3AM.setDate(proximas3AM.getDate() + 1);
    }
    return proximas3AM.getTime() - ahora.getTime();
  }

  function programarSiguienteCheck() {
    const ms = calcularMsHasta3AM();
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch(console.error);
      // Repetir cada 24h
      setInterval(() => {
        autoUpdater.checkForUpdates().catch(console.error);
      }, 24 * 60 * 60 * 1000);
    }, ms);
  }

  // TODO: quitar tras verificar auto-update en el Alurin
  autoUpdater.checkForUpdates().catch(console.error);

  programarSiguienteCheck();
}

// ─── Cierre limpio ──────────────────────────────────────────────────────────

app.on('window-all-closed', () => {
  // En producción el watchdog relanza la ventana; aquí solo salimos si isDev
  if (isDev || process.platform !== 'darwin') {
    globalShortcut.unregisterAll();
    app.quit();
  }
});
