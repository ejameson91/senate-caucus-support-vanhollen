const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("helper", {
  importExport: () => ipcRenderer.invoke("import-export"),
  openForm: (id) => ipcRenderer.invoke("open-form", id),
  loadTopics: (id) => ipcRenderer.invoke("load-topics", id),
  fillForm: (id, topic) => ipcRenderer.invoke("fill-form", id, topic),
});
