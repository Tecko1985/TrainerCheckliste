const APP_VERSION = "1.1";

const APP_CHANGELOG = [
  {
    version: "1.1",
    groups: [
      {
        title: "Abschnitte einfrieren",
        items: [
          "Neuer Button \"Speichern & Einfrieren\" am Ende jedes Abschnitts (Zugang / Abgang).",
          "Gesperrter Abschnitt: alle Felder und Checkboxen sind deaktiviert, Unterschriften können nicht mehr gezeichnet werden.",
          "Sperre kann mit \"Sperre aufheben\" (mit Bestätigung) wieder gelöst werden.",
          "Sperrstatus wird in der JSON-Datei gespeichert und beim nächsten Öffnen wiederhergestellt."
        ]
      },
      {
        title: "Schlüsselfelder",
        items: [
          "Beim Schrankschlüssel (Zugang & Abgang) erscheint nach Aktivieren der Checkbox jetzt ebenfalls ein Eingabefeld für die Schlüsselnummer."
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
          "Jeder Punkt einzeln abhakbar; bei \"Z-Schlüssel\" erscheint ein Eingabefeld für die Schlüsselnummer.",
          "Bemerkungsfeld, Status \"konnte nicht abgeschlossen werden, weil…\" (mit Grund) oder \"abgeschlossen\".",
          "Ort und Datum der Abschluss-Unterschrift."
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
          "Speicherung ausschließlich über Nextcloud-WebDAV, automatisches Speichern bei jeder Änderung.",
          "Zugangsdaten werden lokal (IndexedDB) gemerkt, sodass beim nächsten Öffnen automatisch verbunden wird.",
          "Optionaler CORS-Proxy für Zugriffe von Hosts, die der Nextcloud-Server nicht direkt erlaubt."
        ]
      }
    ]
  }
];
