declare type DesktopPluginButtonPlacement = {
  id: string;
  label: string;
  targetSelector: string;
  position: "before" | "after" | "append" | "prepend";
  href?: string;
};

declare type DesktopPluginSwatch = {
  key: string;
  value: string;
};

declare type DesktopPluginManifest = {
  id: string;
  name: string;
  version: string;
  description: string;
  css: string;
  swatches: DesktopPluginSwatch[];
  buttonPlacements: DesktopPluginButtonPlacement[];
};

declare type DesktopPlugin = DesktopPluginManifest & {
  enabled: boolean;
  installedAt: number;
};

declare type DesktopConfig = {
  firstLaunch: boolean;
  customFrame: boolean;
  minimiseToTray: boolean;
  startMinimisedToTray: boolean;
  spellchecker: boolean;
  hardwareAcceleration: boolean;
  discordRpc: boolean;
  plugins: DesktopPlugin[];
  windowState: {
    x: number;
    y: number;
    width: number;
    height: number;
    isMaximised: boolean;
  };
};
