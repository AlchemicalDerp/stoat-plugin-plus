import { existsSync } from "node:fs";
import { join } from "node:path";

import { app, nativeImage } from "electron";

const EMPTY_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

function candidatePaths(relativePath: string) {
  const cwdPath = join(process.cwd(), relativePath);
  const devPath = join(__dirname, "..", "..", relativePath);
  const packagedPath = join(process.resourcesPath, relativePath);

  return app.isPackaged
    ? [packagedPath, devPath, cwdPath]
    : [cwdPath, devPath, packagedPath];
}

export function getOptionalAssetDataUrl(relativePath: string) {
  for (const candidate of candidatePaths(relativePath)) {
    if (existsSync(candidate)) {
      return nativeImage.createFromPath(candidate).toDataURL();
    }
  }

  return EMPTY_PIXEL;
}

export function hasAsset(relativePath: string) {
  return candidatePaths(relativePath).some((candidate) => existsSync(candidate));
}
