const APP_VERSION = "1.3";

const APP_CHANGELOG = [
  {
    version: "1.3",
    groups: [
      {
        title: "Trainer-Liste",
        items: [
          "Mehr Abstand zwischen Suche/Filter und der Eintragsliste."
        ]
      }
    ]
  },
  {
    version: "1.2",
    groups: [
      {
        title: "Checkliste Zugang/Abgang",
        items: [
          "Eingabefeld für die Schlüsselnummer erscheint, sobald \"Z-Schlüssel\" abgehakt wird."
        ]
      }
    ]
  },
  {
    version: "1.1",
    groups: [
      {
        title: "Trainer-Liste",
        items: [
          "Statusfilter für Eintritt und Austritt (Offen/In Arbeit/Abgeschlossen), kombinierbar mit der Suche.",
          "Datum direkt unter dem Status-Badge sichtbar, Spaltenköpfe der Liste korrekt ausgerichtet.",
          "Spalten in \"Eintritt\"/\"Austritt\" umbenannt."
        ]
      }
    ]
  },
  {
    version: "1.0",
    groups: [
      {
        title: "Trainer-Einträge",
        items: [
          "Übersicht aller Trainer-Einträge mit Status-Badges für Zugang und Abgang, Suche nach Name.",
          "Neuen Eintrag anlegen, Stammdaten (Name, Vorname, Geburtsdatum, Anschrift, Telefon, E-Mail) erfassen.",
          "Eintrag komplett löschen (mit Sicherheitsabfrage)."
        ]
      },
      {
        title: "Checklisten Zugang & Abgang",
        items: [
          "Beide Checklisten 1:1 aus der Papier-Vorlage digitalisiert, inkl. aller Unterpunkte.",
          "Jeder Punkt einzeln abhakbar, Bemerkungsfeld, Status \"konnte nicht abgeschlossen werden, weil…\" oder \"abgeschlossen\".",
          "Je eine digitale Sammel-Unterschrift von Trainer/Betreuer und Geschäftsstelle pro Abschnitt (Maus/Touch)."
        ]
      },
      {
        title: "Daten & Speicherung",
        items: [
          "Speicherung ausschließlich über Nextcloud-WebDAV, automatisches Speichern bei jeder Änderung.",
          "Optionaler CORS-Proxy für Zugriffe von Hosts, die der Nextcloud-Server nicht direkt erlaubt."
        ]
      }
    ]
  }
];
