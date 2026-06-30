# TrainerCheckliste

Digitalisierte Version der Checkliste "Trainerzu-/-abgang" (Word-Vorlage im
Nachwuchsbereich) als eigenständige, clientseitige Web-App ohne Build-Step
(Vanilla HTML/CSS/JS), nach dem Vorbild von [Materialliste](../Materialliste).

Trainer-Einträge inkl. Stammdaten und digitaler Unterschriften werden
ausschließlich über WebDAV in einer Nextcloud gespeichert (kein lokaler
Datei-Picker, kein Offline-Speicher). Beim Verbinden wird ein Nextcloud
**App-Passwort** benötigt (Nextcloud → Einstellungen → Sicherheit → Neues
App-Passwort), nicht das normale Account-Passwort.

## Lokal starten

`fetch()`-Aufrufe von einem `file://`-Origin verhalten sich inkonsistent
(CORS). Die App daher über einen lokalen Static-Server öffnen, z. B.:

```
npx serve .
```

## Bekannte Einschränkung: CORS

Bestätigt am 2026-06-30: Zugangsdaten, Pfad und Schreibrechte funktionieren
(per `curl` verifiziert, Testdatei erfolgreich angelegt), aber der direkte
WebDAV-Aufruf aus dem Browser schlägt mit `TypeError: Failed to fetch` fehl –
der Nextcloud-Server sendet keine `Access-Control-Allow-Origin`-Header.

**Lösung: `cors-proxy-worker.js` deployen.** Dieses Projekt hat einen eigenen
Cloudflare-Worker-Proxy (im Unterschied zu Materialliste mit mehreren
erlaubten Origins gleichzeitig, siehe `ALLOWED_ORIGINS` im Worker-Code):

1. dash.cloudflare.com → Workers & Pages → Create → "Hello World"
2. Code aus `cors-proxy-worker.js` einfügen, Deploy
3. Die resultierende `*.workers.dev`-URL im Feld **CORS-Proxy-URL** des
   Verbindungsformulars eintragen (`index.html` / Settings)
4. Bei neuen Origins (z.B. spätere GitHub-Pages-URL) `ALLOWED_ORIGINS` im
   Worker-Code ergänzen und neu deployen

Ohne deployten Proxy funktioniert die App-Verbindung zur Nextcloud **nicht**,
unabhängig von korrekten Zugangsdaten.

## Datenmodell

Eine JSON-Datei `{ trainerEintraege: [...] }` auf der Nextcloud. Struktur und
Feldnamen siehe `app.js` (`emptyTrainerEintrag`, `emptyChecklistSection`) und
`checklist-schema.js` (`ZUGANG_SCHEMA`, `ABGANG_SCHEMA`).
