import { randomUUID } from "node:crypto";

import { ipcMain } from "electron";
import JSZip from "jszip";

import { config } from "./config";

function safeId(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normaliseHex(value: string) {
  const normalised = value.trim();
  return /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(normalised)
    ? normalised
    : "#7f5af0";
}

function validatePluginManifest(raw: Partial<DesktopPluginManifest>) {
  if (!raw.name || typeof raw.name !== "string") {
    throw new Error("Plugin manifest must include a name.");
  }

  const buttonPlacements = Array.isArray(raw.buttonPlacements)
    ? raw.buttonPlacements
        .filter((placement) => placement && typeof placement === "object")
        .map((placement) => ({
          id:
            typeof placement.id === "string" && placement.id.trim().length > 0
              ? safeId(placement.id)
              : safeId(randomUUID()),
          label:
            typeof placement.label === "string" && placement.label.trim().length > 0
              ? placement.label.trim().slice(0, 40)
              : "Plugin Button",
          targetSelector:
            typeof placement.targetSelector === "string"
              ? placement.targetSelector
              : "body",
          position:
            placement.position === "before" ||
            placement.position === "after" ||
            placement.position === "prepend"
              ? placement.position
              : "append",
          href:
            typeof placement.href === "string" && placement.href.startsWith("http")
              ? placement.href
              : undefined,
        }))
    : [];

  const swatches: DesktopPluginSwatch[] = [];

  if (raw.swatches && typeof raw.swatches === "object") {
    for (const [key, value] of Object.entries(raw.swatches)) {
      if (typeof value !== "string") {
        continue;
      }

      swatches.push({
        key: key.slice(0, 20),
        value: normaliseHex(value),
      });
    }
  }

  return {
    id:
      typeof raw.id === "string" && raw.id.trim().length > 0
        ? safeId(raw.id)
        : safeId(raw.name),
    name: raw.name.trim().slice(0, 60),
    version:
      typeof raw.version === "string" && raw.version.trim().length > 0
        ? raw.version.trim().slice(0, 20)
        : "1.0.0",
    description:
      typeof raw.description === "string" ? raw.description.trim().slice(0, 500) : "",
    css:
      typeof raw.css === "string" ? raw.css : "",
    swatches,
    buttonPlacements,
  } as DesktopPluginManifest;
}

export function initPluginIpc() {
  ipcMain.handle("plugins:list", () => config.plugins);

  ipcMain.handle(
    "plugins:install",
    async (_, bytes: number[] | Uint8Array) => {
      const buffer = Buffer.from(bytes);
      const zip = await JSZip.loadAsync(buffer);
      const manifestFile = zip.file("plugin.json");

      if (!manifestFile) {
        throw new Error("Missing plugin.json in the uploaded archive.");
      }

      const manifestRaw = JSON.parse(
        await manifestFile.async("string"),
      ) as Partial<DesktopPluginManifest>;
      const manifest = validatePluginManifest(manifestRaw);

      if (manifestRaw.cssFile && typeof manifestRaw.cssFile === "string") {
        const cssFile = zip.file(manifestRaw.cssFile);

        if (cssFile) {
          manifest.css = await cssFile.async("string");
        }
      }

      const currentPlugins = config.plugins;
      const dedupedId =
        currentPlugins.find((plugin) => plugin.id === manifest.id) !== undefined
          ? `${manifest.id}-${Date.now()}`
          : manifest.id;

      const nextPlugin: DesktopPlugin = {
        ...manifest,
        id: dedupedId,
        enabled: true,
        installedAt: Date.now(),
      };

      config.plugins = [...currentPlugins, nextPlugin];
      return nextPlugin;
    },
  );

  ipcMain.handle("plugins:toggle", (_, pluginId: string) => {
    const updated = config.plugins.map((plugin) =>
      plugin.id === pluginId ? { ...plugin, enabled: !plugin.enabled } : plugin,
    );

    config.plugins = updated;
    return config.plugins;
  });

  ipcMain.handle("plugins:delete", (_, pluginId: string) => {
    config.plugins = config.plugins.filter((plugin) => plugin.id !== pluginId);
    return config.plugins;
  });
}
