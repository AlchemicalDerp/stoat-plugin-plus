# Desktop plugin package format

Plugins are uploaded from the **Settings → Plugins** menu as `.zip` files.

## Required files

- `plugin.json` (required)
- Optional css file referenced by `cssFile` in `plugin.json`

## `plugin.json` fields

```json
{
  "id": "base-look-plugin",
  "name": "Base Look Plugin",
  "version": "1.0.0",
  "description": "Example plugin that changes visual style and places quick action buttons.",
  "cssFile": "theme.css",
  "swatches": {
    "primary": "#7f5af0",
    "secondary": "#2cb67d",
    "surface": "#121626",
    "text": "#eef1ff"
  },
  "buttonPlacements": [
    {
      "id": "stoat-home-link",
      "label": "Stoat Updates",
      "targetSelector": "body",
      "position": "append",
      "href": "https://stoat.chat"
    }
  ]
}
```

## Modifiable plugin parts

- **Metadata**: `id`, `name`, `version`, `description`
- **Theme / appearance**:
  - inline CSS via `css`
  - external CSS via `cssFile`
  - swatches shown in plugin cards via `swatches`
- **Button placement management**:
  - `buttonPlacements[].targetSelector` controls where the button is attached
  - `buttonPlacements[].position` supports `before`, `after`, `append`, `prepend`
  - `buttonPlacements[].label` sets text
  - `buttonPlacements[].href` opens external links on click

## Notes

- Duplicate plugin IDs are auto-renamed to stay unique.
- Enabling/disabling a plugin dynamically applies/removes CSS and placement buttons.
- Deleting a plugin removes it from the installed plugin list.
