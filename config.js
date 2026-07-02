const APP_VERSION = "1.1";

const APP_CHANGELOG = [
  {
    version: "1.1",
    groups: [
      {
        title: "Stabilität & Datensicherheit",
        items: [
          "Konfliktschutz beim Speichern: Bearbeiten zwei Geräte gleichzeitig, wird der Konflikt erkannt und der aktuelle Stand neu geladen, statt dass Änderungen stillschweigend verloren gehen (zusammen mit dem Update der Tools-Übersicht-Anmeldung).",
          "Gesperrte (unterschriebene) Checklisten: Auch das Löschen des ganzen Eintrags verlangt jetzt das Passwort, und die Kopfzeilen-Felder (Haken + Datum im Stammdaten-Block) sind mit gesperrt."
        ]
      }
    ]
  },
  {
    version: "1.0",
    groups: [
      {
        title: "Trainer-Liste",
        items: [
          "Übersicht aller Trainer-Einträge mit Name/Vorname/Geburtsdatum und Status-Badges für Eintritt und Austritt (Offen / In Arbeit / Abgeschlossen).",
          "Datum direkt unter dem Status-Badge sichtbar.",
          "Suche nach Name, kombinierbar mit Statusfiltern für Eintritt und Austritt.",
          "Sortierbare Spalten: Name, Geburtsdatum, Eintritt, Austritt (klicken = auf-/absteigend).",
          "Neuen Eintrag anlegen, Eintrag löschen (mit Sicherheitsabfrage)."
        ]
      },
      {
        title: "Stammdaten",
        items: [
          "Name, Vorname, Geburtsdatum, Anschrift, Telefon, E-Mail-Adresse.",
          "Kopf-Checkbox und Datum für Trainerzugang/-abgang."
        ]
      },
      {
        title: "Checklisten Zugang & Abgang",
        items: [
          "Beide Checklisten 1:1 aus der Papier-Vorlage digitalisiert, inkl. aller Unterpunkte.",
          "Jeder Punkt einzeln abhakbar; bei Z-Schlüssel und Schrankschlüssel erscheint jeweils ein Eingabefeld für die Schlüsselnummer.",
          "Bemerkungsfeld, Status \"konnte nicht abgeschlossen werden, weil…\" (mit Grund) oder \"abgeschlossen\".",
          "Ort und Datum der Abschluss-Unterschrift.",
          "Abschnitte lassen sich per \"Speichern & Einfrieren\" sperren (alle Felder, Checkboxen und Unterschriften werden deaktiviert) und bei Bedarf mit Bestätigung wieder entsperren; der Sperrstatus wird gespeichert."
        ]
      },
      {
        title: "Unterschriften",
        items: [
          "Je eine digitale Unterschrift von Trainer/Betreuer und Geschäftsstelle pro Abschnitt (Maus/Touch/Stift).",
          "Unterschrift löschen über Löschen-Button."
        ]
      },
      {
        title: "Daten & Speicherung",
        items: [
          "Automatische Nextcloud-Synchronisierung über die zentrale Anmeldung (Tools-Übersicht): einmal dort anmelden, danach werden Checklisten automatisch geladen und gespeichert – auch am Handy, ohne WebDAV-Passwort auf dem Gerät.",
          "Nur wer das Tool in der Übersicht sehen darf, kann die Checklisten öffnen (Gruppen-Rechte werden serverseitig geprüft).",
          "Automatisches Speichern bei jeder Änderung."
        ]
      }
    ]
  }
];
