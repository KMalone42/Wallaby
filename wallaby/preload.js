const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
});

// Expose settings API
contextBridge.exposeInMainWorld('settings', {
  getTheme: () => ipcRenderer.invoke('settings:getTheme'),
  setTheme: (theme) => ipcRenderer.invoke('settings:setTheme', theme),
  getOllamaBaseUrl: () => ipcRenderer.invoke('settings:getOllamaBaseUrl'),
  setOllamaBaseUrl: (baseUrl) => ipcRenderer.invoke('settings:setOllamaBaseUrl', baseUrl),
  getLanguage: () => ipcRenderer.invoke('settings:getLanguage'),
  setLanguage: (language) => ipcRenderer.invoke('settings:setLanguage', language),
  getModel: () => ipcRenderer.invoke('settings:getModel'),
  setModel: (model) => ipcRenderer.invoke('settings:setModel', model),
  getTemperature: () => ipcRenderer.invoke('settings:getTemperature'),
  setTemperature: (temperature) => ipcRenderer.invoke('settings:setTemperature', temperature),
  getSaveHistory: () => ipcRenderer.invoke('settings:getSaveHistory'),
  setSaveHistory: (saveHistory) => ipcRenderer.invoke('settings:setSaveHistory', saveHistory),
  getAutoSave: () => ipcRenderer.invoke('settings:getAutoSave'),
  setAutoSave: (autoSave) => ipcRenderer.invoke('settings:setAutoSave', autoSave),
  getAnalytics: () => ipcRenderer.invoke('settings:getAnalytics'),
  setAnalytics: (analytics) => ipcRenderer.invoke('settings:setAnalytics', analytics),
  getMaxTokens: () => ipcRenderer.invoke('settings:getMaxTokens'),
  setMaxTokens: (maxTokens) => ipcRenderer.invoke('settings:setMaxTokens', maxTokens),
  getTimeout: () => ipcRenderer.invoke('settings:getTimeout'),
  setTimeout: (timeout) => ipcRenderer.invoke('settings:setTimeout', timeout),
  resetToDefaults: () => ipcRenderer.invoke('settings:resetToDefaults'),
});
        //// Ensure we have access to ipcRenderer
        //const { ipcRenderer } = require('electron');
//
        //// Make window.settings exist
        //window.settings = {
          //getTheme: () => ipcRenderer.invoke('settings:getTheme'),
          //setTheme: (v) => ipcRenderer.invoke('settings:setTheme', v),
//
          //getLanguage: () => ipcRenderer.invoke('settings:getLanguage'),
          //setLanguage: (v) => ipcRenderer.invoke('settings:setLanguage', v),
//
          //getModel: () => ipcRenderer.invoke('settings:getModel'),
          //setModel: (v) => ipcRenderer.invoke('settings:setModel', v),
//
          //getTemperature: () => ipcRenderer.invoke('settings:getTemperature'),
          //setTemperature: (v) => ipcRenderer.invoke('settings:setTemperature', v),
//
          //getSaveHistory: () => ipcRenderer.invoke('settings:getSaveHistory'),
          //setSaveHistory: (v) => ipcRenderer.invoke('settings:setSaveHistory', v),
//
          //getAutoSave: () => ipcRenderer.invoke('settings:getAutoSave'),
          //setAutoSave: (v) => ipcRenderer.invoke('settings:setAutoSave', v),
//
          //getAnalytics: () => ipcRenderer.invoke('settings:getAnalytics'),
          //setAnalytics: (v) => ipcRenderer.invoke('settings:setAnalytics', v),
//
          //getOllamaBaseUrl: () => ipcRenderer.invoke('settings:getOllamaBaseUrl'),
          //setOllamaBaseUrl: (v) => ipcRenderer.invoke('settings:setOllamaBaseUrl', v),
//
          //getMaxTokens: () => ipcRenderer.invoke('settings:getMaxTokens'),
          //setMaxTokens: (v) => ipcRenderer.invoke('settings:setMaxTokens', v),
//
          //getTimeout: () => ipcRenderer.invoke('settings:getTimeout'),
          //setTimeout: (v) => ipcRenderer.invoke('settings:setTimeout', v),
//
          //resetToDefaults: () => ipcRenderer.invoke('settings:resetToDefaults'),
        //};
//
