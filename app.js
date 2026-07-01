let appData = { trainerEintraege: [] };
let saveTimer = null;
let currentEintragId = null;
let listeSearchQuery = "";
let listeFilterZugang = "";
let listeFilterAbgang = "";
let listeSortColumn = "name";
let listeSortDirection = "asc";
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
    itemTexts: {},
    bemerkungen: "",
    nichtAbgeschlossen: false,
    nichtAbgeschlossenGrund: "",
    abgeschlossen: false,
    unterschriftTrainer: "",
    unterschriftFunktionaer: "",
    ort: "",
    datum: "",
    gesperrt: false
  };
}

function ensureChecklistSectionFields(s) {
  const d = emptyChecklistSection();
  Object.keys(d).forEach((k) => {
    if (s[k] === undefined) s[k] = d[k];
  });
  if (typeof s.items !== "object" || s.items === null) s.items = {};
  if (typeof s.itemTexts !== "object" || s.itemTexts === null) s.itemTexts = {};
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
const STATUS_RANK = { offen: 0, arbeit: 1, fertig: 2 };

// ---------- Persistenz ----------

async function init() {
  setupNav();
  setupListe();
  setupDetail();

  // Cloud-Sync über die zentrale Anmeldung (Tools-Übersicht). Das Login-Token
  // liegt in derselben Origin (tecko1985.github.io) und wird wiederverwendet.
  if (getSessionToken()) {
    try {
      const data = await gatewayLoad();
      appData = data && Array.isArray(data.trainerEintraege) ? data : { trainerEintraege: [] };
      migrateData(appData);
      await FileStore.clearWebdavConfig(); // alte, im Klartext gespeicherte Zugangsdaten aufräumen
      startApp();
      return;
    } catch (e) {
      if (!(e instanceof NotLoggedInError)) {
        console.error("Nextcloud-Zugriff über Login fehlgeschlagen", e);
        showGatewayError("Zugriff auf Nextcloud fehlgeschlagen: " + e.message);
      }
      // NotLoggedIn oder Fehler → Anmelde-Hinweis unten
    }
  }
  showConnectScreen();
}

function showGatewayError(text) {
  const el = document.getElementById("cloud-error");
  if (!el) return;
  el.textContent = text;
  el.style.display = text ? "block" : "none";
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
  status.querySelector(".label").textContent = "Verbunden: Nextcloud (über Anmeldung)";
  const settingsFileName = document.getElementById("settings-file-name");
  if (settingsFileName) settingsFileName.textContent = "Nextcloud (über Anmeldung)";
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
      await gatewaySave(appData);
      const time = new Date().toLocaleTimeString("de-DE");
      setSaveStatus(`Zuletzt automatisch gespeichert um ${time}`);
    } catch (e) {
      if (e instanceof NotLoggedInError) {
        setSaveStatus("Sitzung abgelaufen — bitte in der Tools-Übersicht neu anmelden.");
      } else {
        console.error("Speichern fehlgeschlagen", e);
        setSaveStatus("Speichern fehlgeschlagen — siehe Konsole.");
      }
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
  document.getElementById("liste-filter-zugang").addEventListener("change", (e) => {
    listeFilterZugang = e.target.value;
    renderListe();
  });
  document.getElementById("liste-filter-abgang").addEventListener("change", (e) => {
    listeFilterAbgang = e.target.value;
    renderListe();
  });
  document.querySelectorAll(".liste-sort-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const column = btn.dataset.sort;
      if (listeSortColumn === column) {
        listeSortDirection = listeSortDirection === "asc" ? "desc" : "asc";
      } else {
        listeSortColumn = column;
        listeSortDirection = "asc";
      }
      renderListe();
    });
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

function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

function compareEntries(a, b, column) {
  if (column === "geburtsdatum") {
    return (a.geburtsdatum || "").localeCompare(b.geburtsdatum || "");
  }
  if (column === "zugang" || column === "abgang") {
    const sa = sectionStatus(a[column]);
    const sb = sectionStatus(b[column]);
    const rankDiff = STATUS_RANK[sa] - STATUS_RANK[sb];
    if (rankDiff !== 0) return rankDiff;
    const da = a[column].datum || a[column].headerDatum || "";
    const db = b[column].datum || b[column].headerDatum || "";
    return da.localeCompare(db);
  }
  return `${a.name} ${a.vorname}`.localeCompare(`${b.name} ${b.vorname}`, "de");
}

function renderListe() {
  const rows = appData.trainerEintraege
    .filter((e) => {
      if (listeSearchQuery) {
        const haystack = `${e.vorname} ${e.name}`.toLowerCase();
        if (!haystack.includes(listeSearchQuery)) return false;
      }
      if (listeFilterZugang && sectionStatus(e.zugang) !== listeFilterZugang) return false;
      if (listeFilterAbgang && sectionStatus(e.abgang) !== listeFilterAbgang) return false;
      return true;
    })
    .sort((a, b) => compareEntries(a, b, listeSortColumn) * (listeSortDirection === "asc" ? 1 : -1));

  document.querySelectorAll(".liste-sort-btn").forEach((btn) => {
    const isActive = btn.dataset.sort === listeSortColumn;
    btn.classList.toggle("active", isActive);
    btn.querySelector(".sort-arrow").textContent = isActive ? (listeSortDirection === "asc" ? "▲" : "▼") : "";
  });

  const hasEintraege = appData.trainerEintraege.length > 0;
  document.getElementById("liste-empty").style.display = hasEintraege ? "none" : "block";
  document.getElementById("liste-empty-filtered").style.display = hasEintraege && rows.length === 0 ? "block" : "none";
  document.getElementById("liste-header").style.display = rows.length > 0 ? "grid" : "none";

  document.getElementById("liste-rows").innerHTML = rows.map((e) => {
    const zugangStatus = sectionStatus(e.zugang);
    const abgangStatus = sectionStatus(e.abgang);
    const zugangDatum = formatDate(e.zugang.datum || e.zugang.headerDatum);
    const abgangDatum = formatDate(e.abgang.datum || e.abgang.headerDatum);
    return `
      <div class="eintrag-row" data-id="${escapeHtml(e.id)}">
        <span class="eintrag-name">${escapeHtml(`${e.vorname} ${e.name}`.trim()) || "(ohne Namen)"}</span>
        <span>${escapeHtml(formatDate(e.geburtsdatum))}</span>
        <span class="eintrag-status-cell">
          <span class="badge status-${zugangStatus === "fertig" ? "fertig" : zugangStatus === "arbeit" ? "arbeit" : "offen"}">${STATUS_LABEL[zugangStatus]}</span>
          ${zugangDatum ? `<span class="eintrag-status-date">${escapeHtml(zugangDatum)}</span>` : ""}
        </span>
        <span class="eintrag-status-cell">
          <span class="badge status-${abgangStatus === "fertig" ? "fertig" : abgangStatus === "arbeit" ? "arbeit" : "offen"}">${STATUS_LABEL[abgangStatus]}</span>
          ${abgangDatum ? `<span class="eintrag-status-date">${escapeHtml(abgangDatum)}</span>` : ""}
        </span>
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
      // Canvas im gerade sichtbar gewordenen Subtab neu vermessen (war bei display:none 0x0).
      SIGNATURE_FIELDS.filter((f) => f.sectionKey === btn.dataset.subtab).forEach((f) => signaturePads[f.canvasId]?.resize());
    });
  });

  bindHeaderFieldEvents();
  bindSectionFieldEvents("zugang");
  bindSectionFieldEvents("abgang");
  initSignaturePads();

  ["zugang", "abgang"].forEach((sectionKey) => {
    document.getElementById(sectionKey + "-btn-sperren").addEventListener("click", () => {
      const eintrag = getCurrentEintrag();
      if (!eintrag) return;
      eintrag[sectionKey].gesperrt = true;
      persist();
      applyLockedState(sectionKey, true);
    });
    document.getElementById(sectionKey + "-btn-entsperren").addEventListener("click", () => {
      const pw = prompt("Passwort eingeben, um die Sperre aufzuheben:");
      if (pw === null) return;
      if (pw !== "sc1911") { alert("Falsches Passwort."); return; }
      const eintrag = getCurrentEintrag();
      if (!eintrag) return;
      eintrag[sectionKey].gesperrt = false;
      persist();
      applyLockedState(sectionKey, false);
    });
  });
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
    const textInput = cb.closest(".checklist-item-row").querySelector("[data-item-text-id]");
    if (textInput) textInput.classList.toggle("visible", cb.checked);
    persist();
  });
  checklist.addEventListener("input", (e) => {
    const textInput = e.target.closest("[data-item-text-id]");
    if (!textInput) return;
    const eintrag = getCurrentEintrag();
    if (!eintrag) return;
    eintrag[sectionKey].itemTexts[textInput.dataset.itemTextId] = textInput.value;
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
  applyLockedState(sectionKey, !!section.gesperrt);
}

function applyLockedState(sectionKey, gesperrt) {
  const subtab = document.getElementById("subtab-" + sectionKey);
  subtab.querySelectorAll("input, textarea").forEach((el) => { el.disabled = gesperrt; });
  subtab.querySelectorAll("[data-clear-sig]").forEach((btn) => { btn.disabled = gesperrt; });
  SIGNATURE_FIELDS.filter((f) => f.sectionKey === sectionKey).forEach((f) => {
    signaturePads[f.canvasId]?.setLocked(gesperrt);
  });
  subtab.classList.toggle("section-locked", gesperrt);
  document.getElementById(sectionKey + "-locked-banner").style.display = gesperrt ? "flex" : "none";
  document.getElementById(sectionKey + "-lock-row").style.display = gesperrt ? "none" : "flex";
}

function checklistItemRowHtml(item, section, isSubItem) {
  if (!item.label) return "";
  const isChecked = !!section.items[item.id];
  const checked = isChecked ? "checked" : "";
  const verantwortlich = !isSubItem && item.verantwortlich
    ? `<span class="checklist-verantwortlich">${escapeHtml(item.verantwortlich)}</span>` : "";
  const textInput = item.textInput
    ? `<input type="text" class="checklist-item-text${isChecked ? " visible" : ""}" data-item-text-id="${escapeHtml(item.id)}" placeholder="${escapeHtml(item.textInputPlaceholder || "")}" value="${escapeHtml(section.itemTexts[item.id] || "")}" />`
    : "";
  return `
    <div class="checklist-item-row">
      <label>
        <input type="checkbox" data-item-id="${escapeHtml(item.id)}" ${checked} />
        <span>${escapeHtml(item.label)}</span>
      </label>
      ${textInput}
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
