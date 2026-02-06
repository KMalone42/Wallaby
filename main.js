const { app, BrowserWindow, Menu, ipcMain, nativeTheme } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store({
  name: 'settings',
  defaults: { 
        theme: 'system', // 'light' | 'dark' | 'system'
        ollamaBaseUrl: 'http://localhost:11434',
  } 
});


const store = new Store({
  name: 'settings',
  defaults: { theme: 'system' } // 'light' | 'dark' | 'system'
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
