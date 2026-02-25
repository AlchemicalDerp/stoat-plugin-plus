import { Menu, Tray, nativeImage } from "electron";

import { version } from "../../package.json";

import { getOptionalAssetDataUrl } from "./assets";
import { mainWindow, quitApp } from "./window";

// internal tray state
let tray: Tray = null;

// Create and resize tray icon for macOS
function createTrayIcon() {
  if (process.platform === "darwin") {
    const image = nativeImage.createFromDataURL(
      getOptionalAssetDataUrl("assets/desktop/iconTemplate.png"),
    );
    const resized = image.resize({ width: 20, height: 20 });
    resized.setTemplateImage(true);
    return resized;
  }

  return nativeImage.createFromDataURL(
    getOptionalAssetDataUrl("assets/desktop/icon.png"),
  );
}

export function initTray() {
  const trayIcon = createTrayIcon();
  tray = new Tray(trayIcon);
  updateTrayMenu();
  tray.setToolTip("Stoat for Desktop");
  tray.setImage(trayIcon);
  tray.on("click", () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

export function updateTrayMenu() {
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Stoat for Desktop", type: "normal", enabled: false },
      {
        label: "Version",
        type: "submenu",
        submenu: Menu.buildFromTemplate([
          {
            label: version,
            type: "normal",
            enabled: false,
          },
        ]),
      },
      { type: "separator" },
      {
        label: mainWindow.isVisible() ? "Hide App" : "Show App",
        type: "normal",
        click() {
          if (mainWindow.isVisible()) {
            mainWindow.hide();
          } else {
            mainWindow.show();
          }
        },
      },
      {
        label: "Quit App",
        type: "normal",
        click: quitApp,
      },
    ]),
  );
}
