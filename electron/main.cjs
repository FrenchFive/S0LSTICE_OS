const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Auto-updater (only in production)
let autoUpdater = null;
let log = null;

if (app.isPackaged) {
  try {
    const { autoUpdater: updater } = require('electron-updater');
    autoUpdater = updater;
    log = require('electron-log');
  } catch (e) {
    console.error('Failed to load auto-updater:', e);
  }
}

let mainWindow;
let serverConfig = {
  serverIp: '',
  connected: false
};

// Load server config from user data
const configPath = path.join(app.getPath('userData'), 'server-config.json');

function loadServerConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      serverConfig = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading server config:', error);
  }
}

function saveServerConfig() {
  try {
    fs.writeFileSync(configPath, JSON.stringify(serverConfig, null, 2));
  } catch (error) {
    console.error('Error saving server config:', error);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    icon: path.join(__dirname, '../public/icon.png'),
    title: 'S0LSTICE_OS'
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ============================================
// AUTO-UPDATER SETUP
// ============================================

function setupAutoUpdater() {
  if (!autoUpdater) {
    console.log('Auto-updater not available (development mode)');
    return;
  }

  // Configure auto-updater
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  // Set up logging
  if (log) {
    autoUpdater.logger = log;
    autoUpdater.logger.transports.file.level = 'info';
  }

  // Update events
  autoUpdater.on('checking-for-update', () => {
    sendUpdateStatus('checking', 'Checking for updates...');
  });

  autoUpdater.on('update-available', (info) => {
    sendUpdateStatus('available', `Version ${info.version} is available!`, info);
  });

  autoUpdater.on('update-not-available', (info) => {
    sendUpdateStatus('not-available', 'You have the latest version!', info);
  });

  autoUpdater.on('error', (err) => {
    sendUpdateStatus('error', `Update error: ${err.message}`, { error: err.message });
  });

  autoUpdater.on('download-progress', (progress) => {
    sendUpdateStatus('downloading', `Downloading: ${Math.round(progress.percent)}%`, {
      percent: progress.percent,
      transferred: progress.transferred,
      total: progress.total,
      bytesPerSecond: progress.bytesPerSecond
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    sendUpdateStatus('downloaded', `Version ${info.version} is ready to install!`, info);
  });
}

function sendUpdateStatus(status, message, data = {}) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-status', { status, message, ...data });
  }
}

// ============================================
// APP LIFECYCLE
// ============================================

app.whenReady().then(() => {
  loadServerConfig();
  createWindow();
  setupAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ============================================
// IPC HANDLERS - Server Configuration
// ============================================

ipcMain.handle('get-server-config', () => {
  return serverConfig;
});

ipcMain.handle('set-server-config', (event, config) => {
  serverConfig = { ...serverConfig, ...config };
  saveServerConfig();
  return serverConfig;
});

// ============================================
// IPC HANDLERS - File Operations
// ============================================

ipcMain.handle('save-file', async (event, { data, defaultPath }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath,
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePath) {
    try {
      fs.writeFileSync(result.filePath, data, 'utf8');
      return { success: true, path: result.filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false, canceled: true };
});

ipcMain.handle('open-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    try {
      const data = fs.readFileSync(result.filePaths[0], 'utf8');
      return { success: true, data, path: result.filePaths[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false, canceled: true };
});

// ============================================
// IPC HANDLERS - Auto-Updater
// ============================================

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('check-for-updates', async () => {
  if (!autoUpdater) {
    return { 
      success: false, 
      error: 'Auto-updater not available in development mode',
      isDev: true
    };
  }
  
  try {
    const result = await autoUpdater.checkForUpdates();
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('download-update', async () => {
  if (!autoUpdater) {
    return { success: false, error: 'Auto-updater not available' };
  }
  
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('install-update', () => {
  if (!autoUpdater) {
    return { success: false, error: 'Auto-updater not available' };
  }
  
  // This will quit the app and install the update
  autoUpdater.quitAndInstall(false, true);
  return { success: true };
});
