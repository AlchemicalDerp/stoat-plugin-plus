interface DesktopConfigBridge {
  get(): DesktopConfig;
  set(config: DesktopConfig): void;
  getAutostart(): Promise<boolean>;
  setAutostart(value: boolean): Promise<boolean>;
  listPlugins(): Promise<DesktopPlugin[]>;
  installPlugin(bytes: number[] | Uint8Array): Promise<DesktopPlugin>;
  togglePlugin(pluginId: string): Promise<DesktopPlugin[]>;
  deletePlugin(pluginId: string): Promise<DesktopPlugin[]>;
}

declare interface Window {
  desktopConfig: DesktopConfigBridge;
}
