let appData = { trainerEintraege: [] };
let webdavConfig = null;
let saveTimer = null;
let currentEintragId = null;
let listeSearchQuery = "";
let signaturePads = {};

const SIGNATURE_FIELDS = [
  { sectionKey: "zugang", canvasId: "zugang-sig-trainer", dataKey: "unterschriftTrainer" },
  { sectionKey: "zugang", canvasId: "zugang-sig-funktionaer", dataKey: "unterschriftFunktionaer" },
  { sectionKey: "abgang", canvasId: "abgang-sig-trainer", dataKey: "unterschriftTrainer" },
  { sectionKey: "abgang", canvasId: "abgang-sig-funktionaer", dataKey: "unterschriftFunktionaer" }
];

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---------- Datenmodell ----------

function emptyChecklistSection() {
  return {
    headerChecked: false,
    headerDatum: "",
    items: {},
    bemerkungen: "",
    nichtAbgeschlossen: false,
    nichtAbgeschlossenGrund: "",
    abgeschlossen: false,
    unterschriftTrainer: "",
    unterschriftFunktionaer: "",
    ort: "",
    datum: ""
  };
}

function ensureChecklistSectionFields(s) {
  const d = emptyChecklistSection();
  Object.keys(d).forEach((k) => {
    if (s[k] === undefined) s[k] = d[k];
  });
  if (typeof s.items !== "object" || s.items === null) s.items = {};
}

function emptyTrainerEintrag() {
  return {
    id: uuid(),
    name: "",
    vorname: "",
    geburtsdatum: "",
    anschrift: "",
    telefon: "",
    email: "",
    zugang: emptyChecklistSection(),
    abgang: emptyChecklistSection()
  };
}

function migrateData(data) {
  if (!Array.isArray(data.trainerEintraege)) data.trainerEintraege = [];
  data.trainerEintraege.forEach((e) => {
    if (e.id === undefined) e.id = uuid();
    ["name", "vorname", "geburtsdatum", "anschrift", "telefon", "email"].forEach((k) => {
      if (e[k] === undefined) e[k] = "";
    });
    if (!e.zugang) e.zugang = emptyChecklistSection();
    if (!e.abgang) e.abgang = emptyChecklistSection();
    ensureChecklistSectionFields(e.zugang);
    ensureChecklistSectionFields(e.abgang);
  });
  return data;
}

function getCurrentEintrag() {
  return appData.trainerEintraege.find((e) => e.id === currentEintragId) || null;
}

function sectionStatus(section) {
  if (section.abgeschlossen) return "fertig";
  if (section.nichtAbgeschlossen) return "arbeit";
  const hasChecked = section.headerChecked || Object.values(section.items).some(Boolean);
  return hasChecked || section.bemerkungen ? "arbeit" : "offen";
}

const STATUS_LABEL = { offen: "Offen", arbeit: "In Arbeit", fertig: "Abgeschlossen" };

// ---------- Persistenz ----------

async function init() {
  document.getElementById("webdav-connect-form").addEventListener("submit", handleWebdavConnectSubmit);
  document.getElementById("btn-webdav-disconnect").addEventListener("click", disconnectWebdav);
  setupNav();
  setupListe();
  setupDetail();

  const config = await FileStore.getWebdavConfig();
  if (config) {
    try {
      const data = await davReadFile(config);
      webdavConfig = config;
      appData = data && Array.isArray(data.trainerEintraege) ? data : { trainerEintraege: [] };
      migrateData(appData);
      startApp();
      return;
    } catch (e) {
      console.error("WebDAV-Verbindung fehlgeschlagen", e);
      document.getElementById("webdav-url").value = config.url;
      document.getElementById("webdav-username").value = config.username;
      document.getElementById("webdav-proxy-url").value = config.proxyUrl || "";
      showWebdavError("Verbindung zu Nextcloud fehlgeschlagen: " + e.message + ". Bitte Zugangsdaten prüfen und erneut verbinden.");
      showConnectScreen();
      return;
    }
  }
  showConnectScreen();
}

async function handleWebdavConnectSubmit(e) {
  e.preventDefault();
  const url = document.getElementById("webdav-url").value.trim();
  const username = document.getElementById("webdav-username").value.trim();
  const password = document.getElementById("webdav-password").value;
  const proxyUrl = document.getElementById("webdav-proxy-url").value.trim();
  if (!url || !username || !password) return;
  await connectWebdav({ url, username, password, proxyUrl });
}

async function connectWebdav(config) {
  showWebdavError("");
  setWebdavConnecting(true);
  try {
    let data = await davReadFile(config);
    if (data === null) {
      const empty = { trainerEintraege: [] };
      await davWriteFile(config, empty);
      data = empty;
    }
    appData = Array.isArray(data.trainerEintraege) ? data : { trainerEintraege: [] };
    migrateData(appData);
    webdavConfig = config;
    await FileStore.setWebdavConfig(config);
    startApp();
  } catch (e) {
    console.error(e);
    showWebdavError(
      "Verbindung fehlgeschlagen: " + e.message + ". Prüfe URL, Benutzername, App-Passwort und ob der Nextcloud-Server CORS-Zugriffe von dieser Seite erlaubt."
    );
  } finally {
    setWebdavConnecting(false);
  }
}

function setWebdavConnecting(isConnecting) {
  const btn = document.getElementById("btn-webdav-connect");
  if (!btn) return;
  btn.disabled = isConnecting;
  btn.textContent = isConnecting ? "Verbinde…" : "Mit Nextcloud verbinden";
}

function showWebdavError(text) {
  const el = document.getElementById("webdav-error");
  if (!el) return;
  el.textContent = text;
  el.style.display = text ? "block" : "none";
}

async function disconnectWebdav() {
  if (!confirm("Nextcloud-Verbindung trennen? Danach musst du erneut Zugangsdaten eingeben.")) return;
  await FileStore.clearWebdavConfig();
  location.reload();
}

function showConnectScreen() {
  document.getElementById("connect-screen").style.display = "block";
  document.getElementById("app-shell").style.display = "none";
}

function startApp() {
  document.getElementById("connect-screen").style.display = "none";
  document.getElementById("app-shell").style.display = "block";
  const status = document.getElementById("file-status");
  status.classList.add("connected");
  status.querySelector(".label").textContent = "Verbunden: Nextcloud";
  const settingsFileName = document.getElementById("settings-file-name");
  if (settingsFileName) settingsFileName.textContent = "Nextcloud (WebDAV)";
  setSaveStatus("Autospeichern aktiv");
  renderAll();
}

function setSaveStatus(text) {
  const el = document.getElementById("settings-save-status");
  if (el) el.textContent = text;
}

function persist() {
  setSaveStatus("Speichert…");
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      if (!webdavConfig) return;
      await davWriteFile(webdavConfig, appData);
      const time = new Date().toLocaleTimeString("de-DE");
      setSaveStatus(`Zuletzt automatisch gespeichert um ${time}`);
    } catch (e) {
      console.error("Speichern fehlgeschlagen", e);
      setSaveStatus("Speichern fehlgeschlagen — siehe Konsole.");
    }
  }, 300);
}

// ---------- Navigation ----------

function setupNav() {
  document.querySelectorAll("nav button").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });
}

function switchTab(tab) {
  document.querySelectorAll("nav button").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  document.querySelectorAll(".tab-section").forEach((s) => s.classList.toggle("active", s.id === "tab-" + tab));
  if (tab === "einstellungen") renderVersionInfo();
}

function renderAll() {
  renderVersionInfo();
  renderListe();
}

function renderVersionInfo() {
  document.querySelectorAll("#version-badge, #version-badge-2").forEach((el) => {
    if (el) el.textContent = "v" + APP_VERSION;
  });
  const list = document.getElementById("changelog-list");
  if (!list) return;
  list.innerHTML = APP_CHANGELOG.map((entry) => `
    <div class="changelog-entry">
      <div class="cv">Version ${escapeHtml(entry.version)}</div>
      ${entry.groups.map((g) => `
        <div class="changelog-group">
          <div class="cg-title">${escapeHtml(g.title)}</div>
          <ul class="cg-items">${g.items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>
        </div>
      `).join("")}
    </div>
  `).join("");
}

// ---------- Liste ----------

function setupListe() {
  document.getElementById("btn-neuer-eintrag").addEventListener("click", createNewEintrag);
  document.getElementById("liste-search-input").addEventListener("input", (e) => {
    listeSearchQuery = e.target.value.trim().toLowerCase();
    renderListe();
  });
}

function createNewEintrag() {
  const eintrag = emptyTrainerEintrag();
  appData.trainerEintraege.push(eintrag);
  persist();
  openEintrag(eintrag.id);
}

function deleteEintrag(id) {
  const eintrag = appData.trainerEintraege.find((e) => e.id === id);
  if (!eintrag) return;
  const label = `${eintrag.vorname} ${eintrag.name}`.trim() || "diesen Eintrag";
  if (!confirm(`${label} wirklich unwiderruflich löschen?`)) return;
  appData.trainerEintraege = appData.trainerEintraege.filter((e) => e.id !== id);
  persist();
  renderListe();
}

function renderListe() {
  const rows = appData.trainerEintraege
    .filter((e) => {
      if (!listeSearchQuery) return true;
      const haystack = `${e.vorname} ${e.name}`.toLowerCase();
      return haystack.includes(listeSearchQuery);
    })
    .sort((a, b) => `${a.name} ${a.vorname}`.localeCompare(`${b.name} ${b.vorname}`, "de"));

  document.getElementById("liste-empty").style.display = appData.trainerEintraege.length === 0 ? "block" : "none";
  document.getElementById("liste-header").style.display = rows.length > 0 ? "grid" : "none";

  document.getElementById("liste-rows").innerHTML = rows.map((e) => {
    const zugangStatus = sectionStatus(e.zugang);
    const abgangStatus = sectionStatus(e.abgang);
    return `
      <div class="eintrag-row" data-id="${escapeHtml(e.id)}">
        <span class="eintrag-name">${escapeHtml(`${e.vorname} ${e.name}`.trim()) || "(ohne Namen)"}</span>
        <span>${escapeHtml(e.geburtsdatum)}</span>
        <span class="badge status-${zugangStatus === "fertig" ? "fertig" : zugangStatus === "arbeit" ? "arbeit" : "offen"}">${STATUS_LABEL[zugangStatus]}</span>
        <span class="badge status-${abgangStatus === "fertig" ? "fertig" : abgangStatus === "arbeit" ? "arbeit" : "offen"}">${STATUS_LABEL[abgangStatus]}</span>
        <button class="btn danger small" type="button" data-delete-id="${escapeHtml(e.id)}">Löschen</button>
      </div>
    `;
  }).join("");

  document.querySelectorAll(".eintrag-row").forEach((row) => {
    row.addEventListener("click", (e) => {
      if (e.target.closest("[data-delete-id]")) return;
      openEintrag(row.dataset.id);
    });
  });
  document.querySelectorAll("[data-delete-id]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteEintrag(btn.dataset.deleteId);
    });
  });
}

// ---------- Detail ----------

function setupDetail() {
  document.getElementById("btn-zurueck-liste").addEventListener("click", () => {
    const eintrag = getCurrentEintrag();
    if (eintrag && (!eintrag.name.trim() || !eintrag.vorname.trim())) {
      alert("Bitte Name und Vorname ausfüllen, bevor du zur Liste zurückkehrst.");
      return;
    }
    closeDetail();
  });
  document.getElementById("btn-eintrag-loeschen").addEventListener("click", () => {
    if (!currentEintragId) return;
    const id = currentEintragId;
    deleteEintrag(id);
    if (!appData.trainerEintraege.some((e) => e.id === id)) closeDetail();
  });

  document.querySelectorAll(".subnav button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".subnav button").forEach((b) => b.classList.toggle("active", b === btn));
      document.querySelectorAll(".subtab-section").forEach((s) => s.classList.toggle("active", s.id === "subtab-" + btn.dataset.subtab));
    });
  });

  bindHeaderFieldEvents();
  bindSectionFieldEvents("zugang");
  bindSectionFieldEvents("abgang");
  initSignaturePads();
}

function bindHeaderFieldEvents() {
  const fieldMap = {
    "d-name": "name", "d-vorname": "vorname", "d-geburtsdatum": "geburtsdatum",
    "d-anschrift": "anschrift", "d-telefon": "telefon", "d-email": "email"
  };
  Object.entries(fieldMap).forEach(([elId, key]) => {
    document.getElementById(elId).addEventListener("input", (e) => {
      const eintrag = getCurrentEintrag();
      if (!eintrag) return;
      eintrag[key] = e.target.value;
      if (key === "name" || key === "vorname") {
        document.getElementById("detail-title").textContent = `${eintrag.vorname} ${eintrag.name}`.trim() || "Neuer Trainer-Eintrag";
      }
      persist();
    });
  });
  document.getElementById("d-header-zugang-checked").addEventListener("change", (e) => {
    const eintrag = getCurrentEintrag();
    if (!eintrag) return;
    eintrag.zugang.headerChecked = e.target.checked;
    persist();
  });
  document.getElementById("d-header-zugang-datum").addEventListener("change", (e) => {
    const eintrag = getCurrentEintrag();
    if (!eintrag) return;
    eintrag.zugang.headerDatum = e.target.value;
    persist();
  });
  document.getElementById("d-header-abgang-checked").addEventListener("change", (e) => {
    const eintrag = getCurrentEintrag();
    if (!eintrag) return;
    eintrag.abgang.headerChecked = e.target.checked;
    persist();
  });
  document.getElementById("d-header-abgang-datum").addEventListener("change", (e) => {
    const eintrag = getCurrentEintrag();
    if (!eintrag) return;
    eintrag.abgang.headerDatum = e.target.value;
    persist();
  });
}

function bindSectionFieldEvents(sectionKey) {
  const checklist = document.getElementById(sectionKey + "-checklist");
  checklist.addEventListener("change", (e) => {
    const cb = e.target.closest('input[type="checkbox"][data-item-id]');
    if (!cb) return;
    const eintrag = getCurrentEintrag();
    if (!eintrag) return;
    eintrag[sectionKey].items[cb.dataset.itemId] = cb.checked;
    persist();
  });

  document.getElementById(sectionKey + "-bemerkungen").addEventListener("input", (e) => {
    const eintrag = getCurrentEintrag();
    if (!eintrag) return;
    eintrag[sectionKey].bemerkungen = e.target.value;
    persist();
  });

  const nichtAbgeschlossenCb = document.getElementById(sectionKey + "-nicht-abgeschlossen");
  const grundWrap = document.getElementById(sectionKey + "-grund-wrap");
  nichtAbgeschlossenCb.addEventListener("change", (e) => {
    const eintrag = getCurrentEintrag();
    if (!eintrag) return;
    eintrag[sectionKey].nichtAbgeschlossen = e.target.checked;
    grundWrap.classList.toggle("visible", e.target.checked);
    persist();
  });
  document.getElementById(sectionKey + "-grund").addEventListener("input", (e) => {
    const eintrag = getCurrentEintrag();
    if (!eintrag) return;
    eintrag[sectionKey].nichtAbgeschlossenGrund = e.target.value;
    persist();
  });

  document.getElementById(sectionKey + "-abgeschlossen").addEventListener("change", (e) => {
    const eintrag = getCurrentEintrag();
    if (!eintrag) return;
    eintrag[sectionKey].abgeschlossen = e.target.checked;
    persist();
  });

  document.getElementById(sectionKey + "-ort").addEventListener("input", (e) => {
    const eintrag = getCurrentEintrag();
    if (!eintrag) return;
    eintrag[sectionKey].ort = e.target.value;
    persist();
  });
  document.getElementById(sectionKey + "-datum").addEventListener("change", (e) => {
    const eintrag = getCurrentEintrag();
    if (!eintrag) return;
    eintrag[sectionKey].datum = e.target.value;
    persist();
  });
}

function initSignaturePads() {
  SIGNATURE_FIELDS.forEach((f) => {
    const canvas = document.getElementById(f.canvasId);
    signaturePads[f.canvasId] = createSignaturePad(canvas, (dataUrl) => {
      const eintrag = getCurrentEintrag();
      if (!eintrag) return;
      eintrag[f.sectionKey][f.dataKey] = dataUrl;
      persist();
    });
  });
  document.querySelectorAll("[data-clear-sig]").forEach((btn) => {
    btn.addEventListener("click", () => signaturePads[btn.dataset.clearSig]?.clear());
  });
}

function openEintrag(id) {
  currentEintragId = id;
  document.getElementById("view-liste").style.display = "none";
  document.getElementById("view-detail").style.display = "block";
  document.querySelectorAll(".subnav button").forEach((b) => b.classList.toggle("active", b.dataset.subtab === "zugang"));
  document.querySelectorAll(".subtab-section").forEach((s) => s.classList.toggle("active", s.id === "subtab-zugang"));
  // Canvas erst jetzt sichtbar (display:block) -> Backing-Bitmap muss neu vermessen werden,
  // sonst bleibt es bei der 0x0-Größe vom unsichtbaren Erstellungszeitpunkt.
  SIGNATURE_FIELDS.forEach((f) => signaturePads[f.canvasId]?.resize());
  renderDetail();
}

function closeDetail() {
  currentEintragId = null;
  document.getElementById("view-detail").style.display = "none";
  document.getElementById("view-liste").style.display = "block";
  renderListe();
}

function renderDetail() {
  const eintrag = getCurrentEintrag();
  if (!eintrag) return;

  document.getElementById("detail-title").textContent = `${eintrag.vorname} ${eintrag.name}`.trim() || "Neuer Trainer-Eintrag";
  document.getElementById("d-name").value = eintrag.name;
  document.getElementById("d-vorname").value = eintrag.vorname;
  document.getElementById("d-geburtsdatum").value = eintrag.geburtsdatum;
  document.getElementById("d-anschrift").value = eintrag.anschrift;
  document.getElementById("d-telefon").value = eintrag.telefon;
  document.getElementById("d-email").value = eintrag.email;
  document.getElementById("d-header-zugang-checked").checked = eintrag.zugang.headerChecked;
  document.getElementById("d-header-zugang-datum").value = eintrag.zugang.headerDatum;
  document.getElementById("d-header-abgang-checked").checked = eintrag.abgang.headerChecked;
  document.getElementById("d-header-abgang-datum").value = eintrag.abgang.headerDatum;

  document.getElementById("abgang-info-text").textContent = ABGANG_INFO_TEXT;

  renderChecklistSection("zugang", ZUGANG_SCHEMA, eintrag.zugang);
  renderChecklistSection("abgang", ABGANG_SCHEMA, eintrag.abgang);

  fillSection("zugang", eintrag.zugang);
  fillSection("abgang", eintrag.abgang);

  SIGNATURE_FIELDS.forEach((f) => {
    const pad = signaturePads[f.canvasId];
    if (!pad) return;
    pad.resetSilent();
    pad.loadDataURL(eintrag[f.sectionKey][f.dataKey]);
  });
}

function fillSection(sectionKey, section) {
  document.getElementById(sectionKey + "-bemerkungen").value = section.bemerkungen;
  document.getElementById(sectionKey + "-nicht-abgeschlossen").checked = section.nichtAbgeschlossen;
  document.getElementById(sectionKey + "-grund-wrap").classList.toggle("visible", section.nichtAbgeschlossen);
  document.getElementById(sectionKey + "-grund").value = section.nichtAbgeschlossenGrund;
  document.getElementById(sectionKey + "-abgeschlossen").checked = section.abgeschlossen;
  document.getElementById(sectionKey + "-ort").value = section.ort;
  document.getElementById(sectionKey + "-datum").value = section.datum;
}

function checklistItemRowHtml(item, section, isSubItem) {
  if (!item.label) return "";
  const checked = section.items[item.id] ? "checked" : "";
  const verantwortlich = !isSubItem && item.verantwortlich
    ? `<span class="checklist-verantwortlich">${escapeHtml(item.verantwortlich)}</span>` : "";
  return `
    <div class="checklist-item-row">
      <label>
        <input type="checkbox" data-item-id="${escapeHtml(item.id)}" ${checked} />
        <span>${escapeHtml(item.label)}</span>
      </label>
      ${verantwortlich}
    </div>
  `;
}

function renderChecklistSection(sectionKey, schema, section) {
  const container = document.getElementById(sectionKey + "-checklist");
  container.innerHTML = schema.map((item) => {
    const mainRow = checklistItemRowHtml(item, section, false);
    const subItems = item.subItems
      ? `<div class="checklist-subitems">${item.subItems.map((si) => checklistItemRowHtml(si, section, true)).join("")}</div>`
      : "";
    const infoText = item.infoText ? `<div class="checklist-info-text">${escapeHtml(item.infoText)}</div>` : "";
    return `<div class="checklist-item">${mainRow}${subItems}${infoText}</div>`;
  }).join("");
}

// ---------- Start ----------

window.addEventListener("DOMContentLoaded", () => {
  init();
});
