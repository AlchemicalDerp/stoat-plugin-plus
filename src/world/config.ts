import { contextBridge, ipcRenderer } from "electron";

let config: DesktopConfig;

ipcRenderer.on("config", (_, data) => (config = data));

contextBridge.exposeInMainWorld("desktopConfig", {
  get: () => config,
  set: (config: DesktopConfig) => ipcRenderer.send("config", config),
  getAutostart() {
    return ipcRenderer.invoke("getAutostart") as Promise<boolean>;
  },
  setAutostart(value: boolean) {
    return ipcRenderer.invoke("setAutostart", value) as Promise<boolean>;
  },
  listPlugins() {
    return ipcRenderer.invoke("plugins:list") as Promise<DesktopPlugin[]>;
  },
  installPlugin(bytes: number[] | Uint8Array) {
    return ipcRenderer.invoke("plugins:install", bytes) as Promise<DesktopPlugin>;
  },
  togglePlugin(pluginId: string) {
    return ipcRenderer.invoke("plugins:toggle", pluginId) as Promise<DesktopPlugin[]>;
  },
  deletePlugin(pluginId: string) {
    return ipcRenderer.invoke("plugins:delete", pluginId) as Promise<DesktopPlugin[]>;
  },
});
