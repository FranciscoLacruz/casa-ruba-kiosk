const { app, BrowserWindow, globalShortcut, session, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

const isDev = !app.isPackaged;
let mainWindow = null;

// ─── Logging a fichero ─────────────────────────────────────────────────────

const logDir = path.join(app.getPath('userData'), 'logs');
const logFile = path.join(logDir, 'kiosk.log');

function log(tag, ...args) {
  const line = `[${new Date().toISOString()}] [${tag}] ${args.join(' ')}`;
  console.log(line);
  try {
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(logFile, line + '\n');
  } catch (_) {}
}

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

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (!isDev) {
      setTimeout(createWindow, 1000);
    }
  });
}

// ─── Permisos de micrófono ──────────────────────────────────────────────────

app.whenReady().then(() => {
  log('App', 'Inicio', isDev ? '(dev)' : '(prod)', `v${app.getVersion()}`);
  log('App', 'Logs en:', logFile);

  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
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

// ─── IPC: logging desde renderer ────────────────────────────────────────────

ipcMain.handle('get-version', () => app.getVersion());
ipcMain.handle('get-log-path', () => logFile);
ipcMain.on('log', (_, tag, message) => log(tag, message));

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

  autoUpdater.on('checking-for-update', () => {
    log('AutoUpdater', 'Comprobando actualizaciones...');
  });

  autoUpdater.on('update-available', (info) => {
    log('AutoUpdater', `Update disponible: v${info.version}`);
  });

  autoUpdater.on('update-not-available', () => {
    log('AutoUpdater', 'No hay actualizaciones nuevas');
  });

  autoUpdater.on('download-progress', (progress) => {
    log('AutoUpdater', `Descargando: ${Math.round(progress.percent)}%`);
  });

  autoUpdater.on('update-downloaded', (info) => {
    log('AutoUpdater', `Descargada v${info.version}, instalando...`);
    autoUpdater.quitAndInstall(true, true);
  });

  autoUpdater.on('error', (err) => {
    log('AutoUpdater', `Error: ${err.message}`);
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
    log('AutoUpdater', `Próximo check en ${Math.round(ms / 60000)} min (3:00 AM)`);
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch((e) => log('AutoUpdater', `Error check: ${e.message}`));
      setInterval(() => {
        autoUpdater.checkForUpdates().catch((e) => log('AutoUpdater', `Error check: ${e.message}`));
      }, 24 * 60 * 60 * 1000);
    }, ms);
  }

  // Check inmediato al arrancar (con pequeño delay para que la ventana cargue)
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((e) => log('AutoUpdater', `Error check inicial: ${e.message}`));
  }, 5000);

  programarSiguienteCheck();
}

// ─── Cierre limpio ──────────────────────────────────────────────────────────

app.on('window-all-closed', () => {
  if (isDev || process.platform !== 'darwin') {
    globalShortcut.unregisterAll();
    app.quit();
  }
});
