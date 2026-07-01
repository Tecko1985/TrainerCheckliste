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
    getWebdavConfig: () => getValue(KEY_WEBDAV_CONFIG),
    setWebdavConfig: (config) => setValue(KEY_WEBDAV_CONFIG, config),
    clearWebdavConfig: () => clearValue(KEY_WEBDAV_CONFIG)
  };
})();

function davAuthHeader(config) {
  return "Basic " + btoa(unescape(encodeURIComponent(config.username + ":" + config.password)));
}

function davRequestUrl(config) {
  if (config.proxyUrl) {
    return config.proxyUrl.replace(/\/$/, "") + "/?url=" + encodeURIComponent(config.url);
  }
  return config.url;
}

async function davReadFile(config) {
  const resp = await fetch(davRequestUrl(config), {
    method: "GET",
    headers: { Authorization: davAuthHeader(config) }
  });
  if (resp.status === 404) return null;
  if (!resp.ok) throw new Error(`WebDAV-Lesefehler (HTTP ${resp.status})`);
  const text = await resp.text();
  if (!text.trim()) return null;
  return JSON.parse(text);
}

async function davWriteFile(config, dataObj) {
  const resp = await fetch(davRequestUrl(config), {
    method: "PUT",
    headers: {
      Authorization: davAuthHeader(config),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dataObj, null, 2)
  });
  if (!resp.ok) throw new Error(`WebDAV-Schreibfehler (HTTP ${resp.status})`);
}

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
  if (!resp.ok) throw new Error(`Gateway-Fehler (HTTP ${resp.status})`);
  return resp.json();
}

async function gatewayLoad() {
  const body = await gatewayRequest({ action: "dav-load", app: GATEWAY_APP_ID });
  return body.data; // Objekt oder null (Datei noch nicht vorhanden)
}

async function gatewaySave(dataObj) {
  await gatewayRequest({ action: "dav-save", app: GATEWAY_APP_ID, data: dataObj });
}
