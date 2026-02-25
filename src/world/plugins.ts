const SETTINGS_BUTTON_ID = "stoat-plugin-settings-button";
const PANEL_ID = "stoat-plugin-panel";
const STYLE_ID = "stoat-plugin-style";
const APPLIED_STYLE_ID = "stoat-plugin-applied-theme";

function ensureUiStyles() {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    #${PANEL_ID}-backdrop { position: fixed; inset: 0; background: rgba(5,7,16,.5); backdrop-filter: blur(3px); z-index: 4000; display: none; }
    #${PANEL_ID} { position: fixed; width: min(760px, 92vw); max-height: 84vh; overflow: auto; top: 8vh; left: 50%; transform: translateX(-50%); background: #121626; border: 1px solid #2f3b68; border-radius: 16px; box-shadow: 0 24px 70px rgba(0,0,0,.5); padding: 18px; z-index: 4001; color: #eef1ff; display: none; }
    #${PANEL_ID} h2 { margin: 0 0 12px; font-size: 20px; }
    .stoat-plugin-toolbar { display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:14px; }
    .stoat-plugin-install { background: linear-gradient(135deg,#7f5af0,#2cb67d); border: 0; color: white; border-radius: 10px; padding: 9px 14px; cursor:pointer; font-weight: 700; }
    .stoat-plugin-list { display: grid; gap: 10px; }
    .stoat-plugin-card { background:#171d33; border:1px solid #2d3558; border-radius:12px; padding:12px; position:relative; }
    .stoat-plugin-head { display:flex; justify-content:space-between; align-items:center; gap:12px; }
    .stoat-plugin-name { font-weight:700; }
    .stoat-plugin-version { opacity:.7; font-size:12px; }
    .stoat-plugin-actions { display:flex; gap:8px; align-items:center; }
    .stoat-toggle { border:1px solid #39446f; border-radius:8px; padding:6px 10px; color:white; background:#212844; cursor:pointer; }
    .stoat-more { width:32px; height:32px; border-radius:50%; border:1px solid #39446f; background:#212844; color:white; cursor:pointer; }
    .stoat-swatches { margin-top:8px; display:flex; gap:6px; }
    .stoat-swatch { width:20px; height:20px; border-radius:6px; border:1px solid rgba(255,255,255,.2); }
    .stoat-context { position:absolute; right:14px; top:50px; width:240px; background:#0f1428; border:1px solid #3b4775; border-radius:12px; padding:10px; display:none; z-index:5; }
    .stoat-context p { font-size:12px; opacity:.85; margin:0 0 8px; line-height:1.35; }
    .stoat-delete { border:1px solid #7f2a2a; background:#391717; color:#ffd3d3; border-radius:8px; padding:6px 10px; cursor:pointer; width:100%; }
    #${SETTINGS_BUTTON_ID} { border: 1px solid #3e4f85; border-radius: 10px; background: #1b2441; color: #eef1ff; padding: 10px 12px; font-weight: 700; cursor: pointer; margin-top: 8px; width: 100%; text-align: left; }
    .stoat-placement-button { border-radius: 8px; border: 1px solid #2d4170; background:#1e2946; color:#e8ecff; cursor:pointer; padding:8px 12px; margin: 4px; }
    #stoat-plugin-floating-launcher { position: fixed; right: 16px; bottom: 16px; z-index: 3999; border: 1px solid #3e4f85; background:#1b2441; color:#eef1ff; border-radius: 999px; padding: 10px 14px; font-weight: 700; box-shadow: 0 12px 36px rgba(0,0,0,.4); cursor: pointer; display:none; }
    #stoat-plugin-startup-alert { position: fixed; left: 50%; top: 18px; transform: translateX(-50%); z-index: 4100; min-width: 320px; max-width: 90vw; background: linear-gradient(135deg,#221a46,#15263f); border: 1px solid #4f6cc7; color:#eef3ff; border-radius: 12px; box-shadow: 0 18px 36px rgba(0,0,0,.45); padding: 12px 14px; display:none; }
    #stoat-plugin-startup-alert strong { display:block; font-size:13px; letter-spacing:.2px; margin-bottom:2px; }
    #stoat-plugin-startup-alert span { font-size:12px; opacity:.9; }
    #stoat-plugin-startup-alert button { position:absolute; right:8px; top:8px; width:24px; height:24px; border-radius:999px; border:1px solid #4762b4; background:#1a2648; color:white; cursor:pointer; }
  `;

  document.head.append(style);
}

function showStartupAlert() {
  const sessionKey = "stoat-plugin-manager-live";

  if (sessionStorage.getItem(sessionKey) === "1") {
    return;
  }

  sessionStorage.setItem(sessionKey, "1");

  const existing = document.getElementById("stoat-plugin-startup-alert");
  if (existing instanceof HTMLElement) {
    existing.style.display = "block";
    return;
  }

  const alert = document.createElement("div");
  alert.id = "stoat-plugin-startup-alert";

  const title = document.createElement("strong");
  title.textContent = "Plugins manager is live";

  const body = document.createElement("span");
  body.textContent =
    "You can open it from the Plugins sidebar item (replacing Source Code).";

  const dismiss = document.createElement("button");
  dismiss.type = "button";
  dismiss.textContent = "×";
  dismiss.title = "Dismiss";
  dismiss.onclick = () => {
    alert.remove();
  };

  alert.append(title, body, dismiss);
  document.body.append(alert);
  alert.style.display = "block";

  window.setTimeout(() => {
    alert.style.opacity = "0";
    alert.style.transition = "opacity .2s ease";
    window.setTimeout(() => alert.remove(), 220);
  }, 4200);
}

function applyEnabledPluginStyles(plugins: DesktopPlugin[]) {
  const styleTag =
    document.getElementById(APPLIED_STYLE_ID) ?? document.createElement("style");
  styleTag.id = APPLIED_STYLE_ID;
  styleTag.textContent = plugins
    .filter((plugin) => plugin.enabled && plugin.css.trim().length > 0)
    .map((plugin) => `/* ${plugin.name} */\n${plugin.css}`)
    .join("\n\n");
  document.head.append(styleTag);
}

function placePluginButtons(plugins: DesktopPlugin[]) {
  for (const existing of document.querySelectorAll(".stoat-placement-button")) {
    existing.remove();
  }

  plugins
    .filter((plugin) => plugin.enabled)
    .forEach((plugin) => {
      plugin.buttonPlacements.forEach((placement) => {
        const target = document.querySelector(placement.targetSelector);
        if (!target) {
          return;
        }

        const button = document.createElement("button");
        button.className = "stoat-placement-button";
        button.textContent = placement.label;
        button.onclick = () => {
          if (placement.href) {
            window.open(placement.href, "_blank", "noopener,noreferrer");
          }
        };

        if (placement.position === "before") {
          target.before(button);
        } else if (placement.position === "after") {
          target.after(button);
        } else if (placement.position === "prepend") {
          target.prepend(button);
        } else {
          target.append(button);
        }
      });
    });
}

async function openPluginsPanel() {
  ensureUiStyles();
  const panel = document.getElementById(PANEL_ID);
  const backdrop = document.getElementById(`${PANEL_ID}-backdrop`);

  if (!(panel instanceof HTMLElement) || !(backdrop instanceof HTMLElement)) {
    return;
  }

  const list = panel.querySelector(".stoat-plugin-list") as HTMLDivElement;
  list.innerHTML = "";

  const plugins = await window.desktopConfig.listPlugins();
  applyEnabledPluginStyles(plugins);
  placePluginButtons(plugins);

  for (const plugin of plugins) {
    const card = document.createElement("article");
    card.className = "stoat-plugin-card";

    const head = document.createElement("div");
    head.className = "stoat-plugin-head";

    const nameWrap = document.createElement("div");
    const name = document.createElement("div");
    name.className = "stoat-plugin-name";
    name.textContent = plugin.name;
    const version = document.createElement("div");
    version.className = "stoat-plugin-version";
    version.textContent = `v${plugin.version}`;
    nameWrap.append(name, version);

    const actions = document.createElement("div");
    actions.className = "stoat-plugin-actions";
    const toggle = document.createElement("button");
    toggle.className = "stoat-toggle";
    toggle.textContent = plugin.enabled ? "Disable" : "Enable";
    const more = document.createElement("button");
    more.className = "stoat-more";
    more.textContent = "...";
    actions.append(toggle, more);
    head.append(nameWrap, actions);

    const swatches = document.createElement("div");
    swatches.className = "stoat-swatches";
    for (const swatch of plugin.swatches) {
      const swatchEl = document.createElement("div");
      swatchEl.className = "stoat-swatch";
      swatchEl.title = `${swatch.key}: ${swatch.value}`;
      swatchEl.style.background = swatch.value;
      swatches.append(swatchEl);
    }

    const context = document.createElement("div");
    context.className = "stoat-context";
    const description = document.createElement("p");
    description.textContent = plugin.description || "No description provided by this plugin.";
    const del = document.createElement("button");
    del.className = "stoat-delete";
    del.textContent = "Delete plugin";
    context.append(description, del);

    card.append(head, swatches, context);

    toggle.onclick = async () => {
      const updated = await window.desktopConfig.togglePlugin(plugin.id);
      applyEnabledPluginStyles(updated);
      placePluginButtons(updated);
      await openPluginsPanel();
    };

    more.onclick = (event) => {
      event.stopPropagation();
      document.querySelectorAll<HTMLElement>(".stoat-context").forEach((menu) => {
        if (menu !== context) menu.style.display = "none";
      });
      context.style.display = context.style.display === "block" ? "none" : "block";
    };

    del.onclick = async () => {
      await window.desktopConfig.deletePlugin(plugin.id);
      await openPluginsPanel();
    };

    list.append(card);
  }

  panel.style.display = "block";
  backdrop.style.display = "block";
}

function bootstrapPluginsPanel() {
  if (document.getElementById(PANEL_ID)) {
    return;
  }

  const backdrop = document.createElement("div");
  backdrop.id = `${PANEL_ID}-backdrop`;
  backdrop.onclick = () => {
    backdrop.style.display = "none";
    const panel = document.getElementById(PANEL_ID);
    if (panel instanceof HTMLElement) {
      panel.style.display = "none";
    }
    document.querySelectorAll<HTMLElement>(".stoat-context").forEach((menu) => {
      menu.style.display = "none";
    });
  };

  const panel = document.createElement("section");
  panel.id = PANEL_ID;
  panel.innerHTML = `
    <h2>Plugins</h2>
    <div class="stoat-plugin-toolbar">
      <span>Install, enable and customize desktop plugins.</span>
      <button class="stoat-plugin-install">Install plugin zip</button>
    </div>
    <input type="file" accept=".zip" hidden />
    <div class="stoat-plugin-list"></div>
  `;

  const fileInput = panel.querySelector("input[type=file]") as HTMLInputElement;
  const installButton = panel.querySelector(".stoat-plugin-install") as HTMLButtonElement;

  installButton.onclick = () => fileInput.click();
  fileInput.onchange = async () => {
    const file = fileInput.files?.[0];
    if (!file) {
      return;
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    await window.desktopConfig.installPlugin(Array.from(bytes));
    fileInput.value = "";
    await openPluginsPanel();
  };

  document.body.append(backdrop, panel);

  document.addEventListener("click", (event) => {
    const target = event.target as Node;
    if (!(target instanceof Node)) {
      return;
    }

    document.querySelectorAll<HTMLElement>(".stoat-context").forEach((menu) => {
      if (!menu.contains(target) && !panel.contains(target)) {
        menu.style.display = "none";
      }
    });
  });
}

function isSettingsContext() {
  return /settings/i.test(window.location.href);
}

function normaliseLabel(text: string) {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

function findSourceCodeEntry() {
  const allCandidates = Array.from(
    document.querySelectorAll<HTMLElement>("button, a, [role='button'], div"),
  );

  return allCandidates.find((element) => {
    const text = normaliseLabel(element.textContent ?? "");
    return text === "source code";
  });
}

function openPanelFromSidebarEntry() {
  bootstrapPluginsPanel();
  openPluginsPanel();
}

function ensureFloatingLauncher() {
  const existing = document.getElementById("stoat-plugin-floating-launcher") as
    | HTMLButtonElement
    | null;

  if (existing) {
    existing.style.display = isSettingsContext() ? "block" : "none";
    return;
  }

  const button = document.createElement("button");
  button.id = "stoat-plugin-floating-launcher";
  button.textContent = "Plugins";
  button.onclick = openPanelFromSidebarEntry;

  button.style.display = isSettingsContext() ? "block" : "none";
  document.body.append(button);
}

function convertSourceCodeEntry() {
  if (!isSettingsContext()) {
    return;
  }

  const sourceCodeEntry = findSourceCodeEntry();

  if (!sourceCodeEntry) {
    return;
  }

  if (sourceCodeEntry.dataset.stoatPluginBound === "1") {
    return;
  }

  sourceCodeEntry.dataset.stoatPluginBound = "1";
  sourceCodeEntry.textContent = "Plugins";
  sourceCodeEntry.setAttribute("title", "Plugins");

  sourceCodeEntry.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openPanelFromSidebarEntry();
    },
    true,
  );
}

function mountSettingsButton() {
  ensureFloatingLauncher();
  convertSourceCodeEntry();
}

function startPluginRuntime() {
  ensureUiStyles();
  bootstrapPluginsPanel();
  ensureFloatingLauncher();
  showStartupAlert();

  window.desktopConfig.listPlugins().then((plugins) => {
    applyEnabledPluginStyles(plugins);
    placePluginButtons(plugins);
  });

  const observer = new MutationObserver(() => {
    mountSettingsButton();
    window.desktopConfig.listPlugins().then((plugins) => placePluginButtons(plugins));
  });

  observer.observe(document.body, { childList: true, subtree: true });
  mountSettingsButton();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startPluginRuntime, { once: true });
} else {
  startPluginRuntime();
}
