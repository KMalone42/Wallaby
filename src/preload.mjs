import { contextBridge, ipcRenderer } from "electron";
import { marked } from "marked";
import createDOMPurify from "dompurify";

// DOMPurify needs a window
const DOMPurify = createDOMPurify(window);

// marked defaults
marked.setOptions({ gfm: true, breaks: true });

function renderMarkdownToSafeHtml(mdText) {
  const rawHtml = marked.parse(mdText ?? "");
  return DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
}

contextBridge.exposeInMainWorld("markdown", {
  render: renderMarkdownToSafeHtml,
});

contextBridge.exposeInMainWorld("api", {
  send: (channel, data) => ipcRenderer.send(channel, data),
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
});

contextBridge.exposeInMainWorld("settings", {
  getTheme: () => ipcRenderer.invoke("settings:getTheme"),
  setTheme: (theme) => ipcRenderer.invoke("settings:setTheme", theme),
  getOllamaBaseUrl: () => ipcRenderer.invoke("settings:getOllamaBaseUrl"),
  setOllamaBaseUrl: (baseUrl) => ipcRenderer.invoke("settings:setOllamaBaseUrl", baseUrl),
  getLanguage: () => ipcRenderer.invoke("settings:getLanguage"),
  setLanguage: (language) => ipcRenderer.invoke("settings:setLanguage", language),
  getModel: () => ipcRenderer.invoke("settings:getModel"),
  setModel: (model) => ipcRenderer.invoke("settings:setModel", model),
  getTemperature: () => ipcRenderer.invoke("settings:getTemperature"),
  setTemperature: (temperature) => ipcRenderer.invoke("settings:setTemperature", temperature),
  getSaveHistory: () => ipcRenderer.invoke("settings:getSaveHistory"),
  setSaveHistory: (saveHistory) => ipcRenderer.invoke("settings:setSaveHistory", saveHistory),
  getAutoSave: () => ipcRenderer.invoke("settings:getAutoSave"),
  setAutoSave: (autoSave) => ipcRenderer.invoke("settings:setAutoSave", autoSave),
  getAnalytics: () => ipcRenderer.invoke("settings:getAnalytics"),
  setAnalytics: (analytics) => ipcRenderer.invoke("settings:setAnalytics", analytics),
  getMaxTokens: () => ipcRenderer.invoke("settings:getMaxTokens"),
  setMaxTokens: (maxTokens) => ipcRenderer.invoke("settings:setMaxTokens", maxTokens),
  getTimeout: () => ipcRenderer.invoke("settings:getTimeout"),
  setTimeout: (timeout) => ipcRenderer.invoke("settings:setTimeout", timeout),
  resetToDefaults: () => ipcRenderer.invoke("settings:resetToDefaults"),
});

