const { app, BrowserWindow, Menu, ipcMain, nativeTheme } = require('electron');
const path = require('path');
const Store = require('electron-store');

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
  } 
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'icon.png')
  });

  mainWindow.loadFile('index.html');
  
  // Create menu
  const menuTemplate = [
    {
      label: 'Menu',
      submenu: [
        { label: 'Settings', click: () => mainWindow.loadFile('settings.html') },
        { type: 'separator' },
        { label: 'Quit', click: () => app.quit() }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
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

// IPC handlers for settings
ipcMain.handle('settings:getTheme', () => {
  return store.get('theme');
});

ipcMain.handle('settings:setTheme', (event, theme) => {
  store.set('theme', theme);
});

ipcMain.handle('settings:getOllamaBaseUrl', () => {
  return store.get('ollamaBaseUrl');
});

ipcMain.handle('settings:setOllamaBaseUrl', (event, baseUrl) => {
  store.set('ollamaBaseUrl', baseUrl);
});

ipcMain.handle('settings:getLanguage', () => {
  return store.get('language');
});

ipcMain.handle('settings:setLanguage', (event, language) => {
  store.set('language', language);
});

ipcMain.handle('settings:getModel', () => {
  return store.get('model');
});

ipcMain.handle('settings:setModel', (event, model) => {
  store.set('model', model);
});

ipcMain.handle('settings:getTemperature', () => {
  return store.get('temperature');
});

ipcMain.handle('settings:setTemperature', (event, temperature) => {
  store.set('temperature', temperature);
});

ipcMain.handle('settings:getSaveHistory', () => {
  return store.get('saveHistory');
});

ipcMain.handle('settings:setSaveHistory', (event, saveHistory) => {
  store.set('saveHistory', saveHistory);
});

ipcMain.handle('settings:getAutoSave', () => {
  return store.get('autoSave');
});

ipcMain.handle('settings:setAutoSave', (event, autoSave) => {
  store.set('autoSave', autoSave);
});

ipcMain.handle('settings:getAnalytics', () => {
  return store.get('analytics');
});

ipcMain.handle('settings:setAnalytics', (event, analytics) => {
  store.set('analytics', analytics);
});

ipcMain.handle('settings:getMaxTokens', () => {
  return store.get('maxTokens');
});

ipcMain.handle('settings:setMaxTokens', (event, maxTokens) => {
  store.set('maxTokens', maxTokens);
});

ipcMain.handle('settings:getTimeout', () => {
  return store.get('timeout');
});

ipcMain.handle('settings:setTimeout', (event, timeout) => {
  store.set('timeout', timeout);
});

ipcMain.handle('settings:resetToDefaults', () => {
  store.clear();
  return store.store;
});
