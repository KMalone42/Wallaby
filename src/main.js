// main.js (ESM)
import { app, BrowserWindow, Menu, ipcMain, nativeTheme, dialog} from 'electron';
import path from 'path';
import fs from 'fs';
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
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true, // context bridging
      nodeIntegration: false,
      sandbox: false, // for renderer modules
      partition: 'persist:wallaby',
    },
    icon: path.join(__dirname, 'icon.png')
  });

  mainWindow.loadFile('src/front/pages/index.html'); // entry frontpage

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
  
  Menu.setApplicationMenu(null);
}

// Register IPC handler to open file dialog
ipcMain.on('open-file-dialog', (event) => {

  const options = {
    properties: ['openFile'],
    filters: [{
      name: 'Media Files',
      extensions: ['png', 'jpg', 'gif']
    }]
  };

  dialog.showOpenDialog(mainWindow, options).then(({ canceled, filePaths }) => {
    if (!canceled && filePaths && filePaths.length > 0) {
      console.log('Selected file:', filePaths[0]);
      
      // Send the result back to the renderer process
      event.reply('file-selected', filePaths[0]);
    }
  });
})

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

// ----------------------------------------------------------------------------
// Setters
// ----------------------------------------------------------------------------
ipcMain.handle('settings:setTheme', (_, theme) => logSet('theme', theme) );
ipcMain.handle('settings:setOllamaBaseUrl', (_, ollamaBaseUrl) => logSet('ollamaBaseUrl', ollamaBaseUrl) );
ipcMain.handle('settings:setLanguage', (_, language) => logSet('language', language) );
ipcMain.handle('settings:setModel', (_, model) => logSet('model', model) );
ipcMain.handle('settings:setTemperature', (_, temperature) => logSet('temperature', temperature) );
ipcMain.handle('settings:setSaveHistory', (_, saveHistory) => logSet('saveHistory', saveHistory) );
ipcMain.handle('settings:setAutoSave', (_, autoSave) => logSet('autoSave', autoSave) );
ipcMain.handle('settings:setAnalytics', (_, analytics) => logSet('analytics', analytics) );
ipcMain.handle('settings:setPrependPrompt', (_, prependPrompt) => logSet('prependPrompt', prependPrompt) );
ipcMain.handle('settings:setAppendPrompt', (_, appendPrompt) => logSet('appendPrompt', appendPrompt) );
ipcMain.handle('settings:setMaxTokens', (_, maxTokens) => logSet('maxTokens', maxTokens) );
ipcMain.handle('settings:setTimeout', (_, timeout) => logSet('timeout', timeout) );

// ----------------------------------------------------------------------------
//
// Getters (electron-store)
// ----------------------------------------------------------------------------
ipcMain.handle('settings:getTheme', () => { console.log(store.get('theme')); return store.get('theme'); });
ipcMain.handle('settings:getOllamaBaseUrl', () => { console.log(store.get('ollamaBaseUrl')); return store.get('ollamaBaseUrl'); });
ipcMain.handle('settings:getLanguage', () => { return store.get('language'); });
ipcMain.handle('settings:getModel', () => { return store.get('model'); });
ipcMain.handle('settings:getTemperature', () => { return store.get('temperature'); });
ipcMain.handle('settings:getSaveHistory', () => { return store.get('saveHistory'); });
ipcMain.handle('settings:getAutoSave', () => { return store.get('autoSave'); });
ipcMain.handle('settings:getAnalytics', () => { return store.get('analytics'); });
ipcMain.handle('settings:getPrependPrompt', () => { return store.get('prependPrompt'); });
ipcMain.handle('settings:getAppendPrompt',  () => { return store.get('appendPrompt'); });
ipcMain.handle('settings:getMaxTokens',     () => { return store.get('maxTokens'); });
ipcMain.handle('settings:getTimeout', () => { return store.get('timeout'); });

ipcMain.handle('settings:resetToDefaults', () => {
  store.clear();
  return store.store;
});

// ----------------------------------------------------------------------------
// Temporary File Storage IPC Handlers
// ----------------------------------------------------------------------------
const tempFilesStoreKey = 'tempFiles';

function getTempDir() {
  return path.join(app.getPath('userData'), 'temp-files');
}

function ensureTempDir() {
  const tempDir = getTempDir();
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
}

function getMimeTypeFromExtension(fileExtension) {
  switch (fileExtension) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    case '.bmp':
      return 'image/bmp';
    default:
      return 'application/octet-stream';
  }
}

ipcMain.handle('file-storage:save-from-path', async (_, sourcePath) => {
  try {
    const tempDir = ensureTempDir();
    const fileExtension = path.extname(sourcePath);
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const key = `${uniqueSuffix}${fileExtension}`;
    const destinationPath = path.join(tempDir, key);

    fs.copyFileSync(sourcePath, destinationPath);
    store.set(`${tempFilesStoreKey}.${key}`, destinationPath);

    console.log(`[file-storage] copied ${sourcePath} to ${destinationPath}`);
    return {
      success: true,
      key,
      path: destinationPath,
      mimeType: getMimeTypeFromExtension(fileExtension.toLowerCase())
    };
  } catch (error) {
    console.error('[file-storage] error saving from path:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file-storage:read-base64', async (_, key) => {
  try {
    const tempDir = getTempDir();
    const filePath = path.join(tempDir, key);

    if (!fs.existsSync(filePath)) {
      return { success: false, error: 'File not found' };
    }

    const fileExtension = path.extname(filePath).toLowerCase();
    const base64 = fs.readFileSync(filePath).toString('base64');
    const mimeType = getMimeTypeFromExtension(fileExtension);

    return {
      success: true,
      base64,
      dataUrl: `data:${mimeType};base64,${base64}`,
      mimeType
    };
  } catch (error) {
    console.error('[file-storage] error reading base64:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file-storage:save', async (_, key, content) => {
  try {
    const tempDir = ensureTempDir();
    const filePath = path.join(tempDir, key);

    fs.writeFileSync(filePath, content, 'utf8');
    store.set(`${tempFilesStoreKey}.${key}`, filePath);

    console.log(`[file-storage] saved ${key} to ${filePath}`);
    return { success: true, path: filePath };
  } catch (error) {
    console.error(`[file-storage] error saving ${key}:`, error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file-storage:read', async (_, key) => {
  try {
    const tempDir = getTempDir();
    const filePath = path.join(tempDir, key);

    if (!fs.existsSync(filePath)) {
      return { success: false, error: 'File not found' };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`[file-storage] read ${key} from ${filePath}`);
    return { success: true, content: content };
  } catch (error) {
    console.error(`[file-storage] error reading ${key}:`, error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file-storage:delete', async (_, key) => {
  try {
    const tempDir = getTempDir();
    const filePath = path.join(tempDir, key);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      store.delete(`${tempFilesStoreKey}.${key}`);
      console.log(`[file-storage] deleted ${key} from ${filePath}`);
      return { success: true };
    }

    store.delete(`${tempFilesStoreKey}.${key}`);
    return { success: true, message: 'File did not exist' };
  } catch (error) {
    console.error(`[file-storage] error deleting ${key}:`, error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file-storage:list', async () => {
  try {
    const tempDir = getTempDir();

    if (!fs.existsSync(tempDir)) {
      return { success: true, files: [] };
    }

    const files = fs.readdirSync(tempDir);
    console.log(`[file-storage] listed ${files.length} files`);
    return { success: true, files: files };
  } catch (error) {
    console.error(`[file-storage] error listing files:`, error);
    return { success: false, error: error.message };
  }
});

// ----------------------------------------------------------------------------
