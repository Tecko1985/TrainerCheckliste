// WebDAV-Persistenz + IndexedDB-Helfer, um die Nextcloud-Zugangsdaten zwischen
// Sitzungen zu merken. Adaptiert aus E:\Materialliste\db.js, ohne die dortigen
// File-System-Access-API-Teile (diese App ist reines WebDAV).
const FileStore = (() => {
  const DB_NAME = "trainerchecklist-db";
  const STORE = "handles";
  const KEY_WEBDAV_CONFIG = "webdavConfig";

  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function getValue(key) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async function setValue(key, value) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function clearValue(key) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  return {
    clearWebdavConfig: () => clearValue(KEY_WEBDAV_CONFIG)
  };
})();

// ---------- Zentrales Login-Gateway (Tools-Übersicht) ----------
// Statt WebDAV-Zugangsdaten pro Gerät: das Login-Token der Tools-Übersicht
// (gleiche Origin tecko1985.github.io) wird wiederverwendet. Der landingpage-
// Worker prüft das Token + die Tool-Sichtbarkeit und greift serverseitig mit
// den Vereins-Zugangsdaten auf Nextcloud zu — hier liegt kein Passwort mehr.
const GATEWAY_URL = "https://landingpage.michel-brunner.workers.dev";
const TOKEN_STORAGE_KEY = "tu_session_token";
const GATEWAY_APP_ID = "trainercheckliste";

class NotLoggedInError extends Error {
  constructor(message) {
    super(message || "Nicht angemeldet");
    this.name = "NotLoggedInError";
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message || "Daten wurden zwischenzeitlich von einem anderen Gerät geändert");
    this.name = "ConflictError";
  }
}

// ETag des zuletzt geladenen/geschriebenen Stands. Wird bei dav-save mitgeschickt,
// damit der Worker Konflikte (anderes Gerät hat inzwischen gespeichert) erkennt.
// Alte Worker ohne rev-Unterstützung liefern kein rev -> Verhalten wie früher.
let gatewayRev = null;

function getSessionToken() {
  try { return localStorage.getItem(TOKEN_STORAGE_KEY); } catch (_) { return null; }
}

async function gatewayRequest(payload) {
  const token = getSessionToken();
  if (!token) throw new NotLoggedInError();
  const resp = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: JSON.stringify(payload)
  });
  if (resp.status === 401) throw new NotLoggedInError("Sitzung abgelaufen");
  if (resp.status === 403) throw new Error("Kein Zugriff auf dieses Tool.");
  if (resp.status === 409) throw new ConflictError();
  if (!resp.ok) throw new Error(`Gateway-Fehler (HTTP ${resp.status})`);
  return resp.json();
}

async function gatewayLoad() {
  const body = await gatewayRequest({ action: "dav-load", app: GATEWAY_APP_ID });
  gatewayRev = typeof body.rev === "string" ? body.rev : null;
  return body.data; // Objekt oder null (Datei noch nicht vorhanden)
}

async function gatewaySave(dataObj) {
  const payload = { action: "dav-save", app: GATEWAY_APP_ID, data: dataObj };
  if (gatewayRev) payload.rev = gatewayRev;
  const body = await gatewayRequest(payload);
  gatewayRev = typeof body.rev === "string" ? body.rev : null;
}

// Liefert {username, isAdmin, groupIds, vorname, nachname, canEdit} der eingeloggten Person.
async function fetchMe() {
  return gatewayRequest({ action: "me", app: GATEWAY_APP_ID });
}

// ─── Binärdateien (ausgelagerte Unterschriften) über den Gateway-Dateikanal ─────
// Unterschriften liegen seit 1.1 als eigene PNG-Dateien im dateien/-Ordner der App
// (id = crypto.randomUUID) statt als base64-DataURL inline in der JSON — sonst
// wächst die Gesamtdatei mit jeder abgeschlossenen Checkliste um ~60 KB und jedes
// Speichern überträgt alle Unterschriften mit (siehe Trainerdatens Auslagerung).
async function gatewayFilePut(id, name, dataBase64) {
  return gatewayRequest({
    action: "dav-file-put", app: GATEWAY_APP_ID, id, name,
    contentType: "image/png", dataBase64
  });
}

async function gatewayFileDelete(id) {
  return gatewayRequest({ action: "dav-file-delete", app: GATEWAY_APP_ID, id });
}

// Holt eine ausgelagerte Unterschrift und liefert sie als PNG-DataURL ("" bei 404/Fehler).
async function gatewayFileGetDataUrl(id) {
  const token = getSessionToken();
  if (!token) throw new NotLoggedInError();
  let resp;
  try {
    resp = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ action: "dav-file-get", app: GATEWAY_APP_ID, id })
    });
  } catch (_) { return ""; }
  if (!resp.ok) return "";
  const blob = await resp.blob();
  if (!blob.size) return "";
  return new Promise((resolve) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result || ""));
    fr.onerror = () => resolve("");
    fr.readAsDataURL(blob);
  });
}

// Serverseitige Prüfung des Aktions-Passworts (Checkliste entsperren / Eintrag
// mit gesperrter Checkliste löschen). Das Passwort liegt als Worker-Secret im
// landingpage-Worker, nicht mehr im öffentlichen Quellcode. Bewusst ohne
// Login-Token (die Aktion ist im Worker nicht an eine Sitzung gebunden).
// Gibt true/false zurück; wirft, wenn die Prüfung selbst nicht möglich ist.
async function verifyActionPassword(scope, password) {
  let resp;
  try {
    resp = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify-action-password", scope, password })
    });
  } catch (_) {
    throw new Error("Keine Verbindung zum Server — Passwortprüfung nicht möglich.");
  }
  if (resp.status === 403) return false;
  if (resp.ok) return true;
  const body = await resp.json().catch(() => ({}));
  if (resp.status === 400 && body.error === "Unbekannte Aktion") {
    throw new Error("Der Server kennt die Passwortprüfung noch nicht — das Worker-Update (landingpage) muss erst deployed werden.");
  }
  throw new Error(body.error || ("Passwortprüfung fehlgeschlagen (HTTP " + resp.status + ")"));
}
