"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("gitApi", {
  execute: (repoPath, args) => electron.ipcRenderer.invoke("git:execute", repoPath, args),
  openFolderDialog: () => electron.ipcRenderer.invoke("dialog:openFolder"),
  isRepo: (path) => electron.ipcRenderer.invoke("git:isRepo", path)
});
