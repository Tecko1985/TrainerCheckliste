# TrainerCheckliste (v1.0)

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
- Jeder Punkt einzeln abhakbar; bei Z-Schlüssel und Schrankschlüssel erscheint jeweils
  automatisch ein Eingabefeld für die Schlüsselnummer
- Bemerkungsfeld, Abschluss-Status („konnte nicht abgeschlossen werden, weil…" oder
  „abgeschlossen"), Ort und Datum
- Abschnitte lassen sich per „Speichern & Einfrieren" sperren (alle Felder, Checkboxen
  und Unterschriften werden deaktiviert); der Sperrstatus wird gespeichert
- Entsperren gesperrter Checklisten und Löschen gesperrter Einträge verlangen ein
  Passwort, das serverseitig geprüft wird (kein Passwort im Quellcode)

### Unterschriften
- Je eine digitale Unterschrift von Trainer/Betreuer und Geschäftsstelle pro Abschnitt
  (Maus, Touch oder Stift/Pen)
- Löschen-Button pro Unterschriftsfeld

### Daten & Speicherung
- Automatische Nextcloud-Synchronisierung über die zentrale Anmeldung in der
  [Tools-Übersicht](https://tecko1985.github.io/ToolsUebersicht/): einmal dort
  anmelden, danach werden die Checklisten automatisch geladen und gespeichert —
  auch am Handy, ohne WebDAV-Adresse, Benutzername oder App-Passwort auf dem Gerät
- Nur wer das Tool in der Übersicht sehen darf, kann die Checklisten öffnen
  (Gruppen-Rechte werden serverseitig geprüft)
- Automatisches Speichern bei jeder Änderung (300 ms Debounce)

---

## Lokal starten

`fetch()`-Aufrufe von einem `file://`-Origin verhalten sich inkonsistent (CORS).
Die App daher über einen lokalen Static-Server öffnen:

```
npx serve .
```

---

## Datenmodell

Eine JSON-Datei `{ trainerEintraege: [...] }`, zentral über den Login-Gateway der
Tools-Übersicht in der Vereins-Nextcloud gespeichert (siehe `db.js`,
`GATEWAY_URL`/`GATEWAY_APP_ID`). Struktur und Feldnamen: `app.js`
(`emptyTrainerEintrag`, `emptyChecklistSection`) und `checklist-schema.js`
(`ZUGANG_SCHEMA`, `ABGANG_SCHEMA`).
