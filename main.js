// main.js
import { app, BrowserWindow, Menu, ipcMain, nativeTheme } from 'electron';
import path from 'path';
import Store from 'electron-store';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store({
  name: 'settings',
  defaults: { 
        theme: 'system', // 'light' | 'dark' | 'system'
        ollamaBaseUrl: 'http://localhost:11434',
        language: 'en',
        model: 'gpt-4',
        temperature: 0.7,
        saveHistory: true,
        autoSave: true,
        analytics: false,
        maxTokens: 1000,
        timeout: 30,
  },
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      partition: 'persist:wallaby',
    },
    icon: path.join(__dirname, 'icon.png')
  });

  mainWindow.loadFile('index.html');

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
  
  Menu.setApplicationMenu(null);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

console.log('userData:', app.getPath('userData'));
console.log('store path:', store.path);

// ============================================================================
// IPC handlers for settings
function logSet(key, value) {
  console.log(`[settings] set ${key} =`, value);
  store.set(key, value);
  return true;
}

// Setters
// ----------------------------------------------------------------------------
ipcMain.handle('settings:setTheme', (_, theme) =>
  logSet('theme', theme)
);
ipcMain.handle('settings:setOllamaBaseUrl', (_, ollamaBaseUrl) =>
  logSet('ollamaBaseUrl', ollamaBaseUrl)
);
ipcMain.handle('settings:setLanguage', (_, language) =>
  logSet('language', language)
);
ipcMain.handle('settings:setModel', (_, model) =>
  logSet('model', model)
);
ipcMain.handle('settings:setTemperature', (_, temperature) =>
  logSet('temperature', temperature)
);
ipcMain.handle('settings:setSaveHistory', (_, saveHistory) =>
  logSet('saveHistory', saveHistory)
);
ipcMain.handle('settings:setAutoSave', (_, autoSave) =>
  logSet('autoSave', autoSave)
);
ipcMain.handle('settings:setAnalytics', (_, analytics) =>
  logSet('analytics', analytics)
);
ipcMain.handle('settings:setMaxTokens', (_, maxTokens) =>
  logSet('maxTokens', maxTokens)
);
ipcMain.handle('settings:setTimeout', (_, timeout) =>
  logSet('timeout', timeout)
);
// ----------------------------------------------------------------------------
//
// Getters
// ----------------------------------------------------------------------------
ipcMain.handle('settings:getTheme', () => {
  console.log(store.get('theme'));
  return store.get('theme');
});


ipcMain.handle('settings:getOllamaBaseUrl', () => {
  console.log(store.get('ollamaBaseUrl'));
  return store.get('ollamaBaseUrl');
});


ipcMain.handle('settings:getLanguage', () => {
  return store.get('language');
});


ipcMain.handle('settings:getModel', () => {
  return store.get('model');
});


ipcMain.handle('settings:getTemperature', () => {
  return store.get('temperature');
});

ipcMain.handle('settings:getSaveHistory', () => {
  return store.get('saveHistory');
});

ipcMain.handle('settings:getAutoSave', () => {
  return store.get('autoSave');
});

ipcMain.handle('settings:getAnalytics', () => {
  return store.get('analytics');
});

ipcMain.handle('settings:getMaxTokens', () => {
  return store.get('maxTokens');
});

ipcMain.handle('settings:getTimeout', () => {
  return store.get('timeout');
});

ipcMain.handle('settings:resetToDefaults', () => {
  store.clear();
  return store.store;
});
// ----------------------------------------------------------------------------
