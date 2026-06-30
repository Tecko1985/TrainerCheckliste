# TrainerCheckliste

Digitalisierte Version der Checkliste „Trainerzu-/-abgang" als eigenständige,
clientseitige Web-App ohne Build-Step (Vanilla HTML/CSS/JS).

**Live:** https://tecko1985.github.io/TrainerCheckliste/

---

## Funktionen

### Trainer-Liste
- Übersicht aller Einträge mit Name, Geburtsdatum und Status-Badges für Eintritt und
  Austritt (Offen / In Arbeit / Abgeschlossen) inkl. Datum unter dem Badge
- Suche nach Name, kombinierbar mit Statusfiltern für Eintritt und Austritt
- Sortierbare Spalten: Name, Geburtsdatum, Eintritt, Austritt (Klick = auf-/absteigend)
- Neuen Eintrag anlegen, Eintrag löschen (mit Sicherheitsabfrage)

### Stammdaten
- Name, Vorname, Geburtsdatum, Anschrift, Telefon, E-Mail
- Kopf-Checkbox und Datum für Trainerzugang/-abgang

### Checklisten Zugang & Abgang
- Beide Checklisten 1:1 aus der Papier-Vorlage digitalisiert, inkl. aller Unterpunkte
- Jeder Punkt einzeln abhakbar; beim Punkt **Z-Schlüssel** erscheint automatisch ein
  Eingabefeld für die Schlüsselnummer
- Bemerkungsfeld, Abschluss-Status („konnte nicht abgeschlossen werden, weil…" oder
  „abgeschlossen"), Ort und Datum

### Unterschriften
- Je eine digitale Unterschrift von Trainer/Betreuer und Geschäftsstelle pro Abschnitt
  (Maus, Touch oder Stift/Pen)
- Löschen-Button pro Unterschriftsfeld

### Speicherung
- Ausschließlich über **Nextcloud-WebDAV** — keine Daten auf fremden Servern
- Automatisches Speichern bei jeder Änderung (300 ms Debounce)
- Zugangsdaten werden im Browser (IndexedDB) gemerkt, sodass beim nächsten Öffnen
  automatisch verbunden wird
- Benötigt ein **App-Passwort** (Nextcloud → Einstellungen → Sicherheit →
  Neues App-Passwort), nicht das normale Account-Passwort

---

## Lokal starten

`fetch()`-Aufrufe von einem `file://`-Origin verhalten sich inkonsistent (CORS).
Die App daher über einen lokalen Static-Server öffnen:

```
npx serve .
```

---

## CORS-Proxy

Nextcloud sendet standardmäßig keine `Access-Control-Allow-Origin`-Header, wodurch
direkte WebDAV-Aufrufe aus dem Browser blockiert werden.

**Lösung:** `cors-proxy-worker.js` als Cloudflare Worker deployen:

1. [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → Create → „Hello World"
2. Code aus `cors-proxy-worker.js` einfügen und deployen
3. Die resultierende `*.workers.dev`-URL im Feld **CORS-Proxy-URL** des
   Verbindungsformulars eintragen
4. Bei neuen Origins (z. B. ein weiterer Dev-Server) `ALLOWED_ORIGINS` im
   Worker-Code ergänzen und neu deployen

Ohne deployten Proxy funktioniert die Verbindung zur Nextcloud **nicht**,
unabhängig von korrekten Zugangsdaten.

---

## Datenmodell

Eine JSON-Datei `{ trainerEintraege: [...] }` auf der Nextcloud.
Struktur und Feldnamen: `app.js` (`emptyTrainerEintrag`, `emptyChecklistSection`)
und `checklist-schema.js` (`ZUGANG_SCHEMA`, `ABGANG_SCHEMA`).
