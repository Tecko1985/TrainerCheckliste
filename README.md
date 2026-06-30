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

Direkte WebDAV-Aufrufe vom Browser zur Nextcloud sind serverseitig oft per
CORS blockiert (im Schwesterprojekt `sc-heiligenstadt-budget` mit `curl`
verifiziert, unabhängig vom Share-Typ). Das Feld **CORS-Proxy-URL** im
Verbindungsformular kann eine separat deployte Worker-/Proxy-URL aufnehmen,
die die Anfrage serverseitig weiterleitet (siehe `cors-proxy-worker.js` im
Materialliste-Projekt als Vorlage).

Der dort bereits deployte Proxy ist mit `ALLOWED_ORIGIN` fest auf
`https://tecko1985.github.io` beschränkt und nimmt aktuell **keine**
Anfragen von dieser App entgegen (anderer Origin, solange sie nicht unter
demselben GitHub-Pages-Account gehostet wird). Optionen für später:

- Diese App ebenfalls unter `https://tecko1985.github.io/...` deployen, dann
  funktioniert der bestehende Proxy ohne Änderung.
- Einen zweiten, eigenen Cloudflare-Worker für diese App deployen.
- Prüfen, ob der Nextcloud-Server direkt CORS-Header für den tatsächlich
  genutzten Origin ausliefern kann (dann ist gar kein Proxy nötig).

## Datenmodell

Eine JSON-Datei `{ trainerEintraege: [...] }` auf der Nextcloud. Struktur und
Feldnamen siehe `app.js` (`emptyTrainerEintrag`, `emptyChecklistSection`) und
`checklist-schema.js` (`ZUGANG_SCHEMA`, `ABGANG_SCHEMA`).
