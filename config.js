const APP_VERSION = "1.0";

const APP_CHANGELOG = [
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
          "Abschnitte lassen sich per \"Speichern & Einfrieren\" sperren (alle Felder, Checkboxen, Unterschriften und die Kopfzeilen-Felder im Stammdaten-Block werden deaktiviert); der Sperrstatus wird gespeichert.",
          "Entsperren gesperrter Checklisten und Löschen gesperrter Einträge verlangen ein Passwort, das serverseitig geprüft wird und nicht im öffentlichen Quellcode der App steht."
        ]
      },
      {
        title: "Unterschriften",
        items: [
          "Je eine digitale Unterschrift von Trainer/Betreuer und Geschäftsstelle pro Abschnitt (Maus/Touch/Stift).",
          "Unterschrift löschen über Löschen-Button.",
          "Unterschriften werden als eigene Dateien in der Cloud abgelegt statt direkt in der Datenliste – die Liste bleibt dadurch klein und das automatische Speichern schnell, egal wie viele Checklisten unterschrieben sind."
        ]
      },
      {
        title: "Daten & Speicherung",
        items: [
          "Automatische Nextcloud-Synchronisierung über die zentrale Anmeldung (Tools-Übersicht): einmal dort anmelden, danach werden Checklisten automatisch geladen und gespeichert – auch am Handy, ohne WebDAV-Passwort auf dem Gerät.",
          "Nur wer das Tool in der Übersicht sehen darf, kann die Checklisten öffnen (Gruppen-Rechte werden serverseitig geprüft).",
          "Neue Einträge anlegen, Checklisten-Felder und Unterschriften ändern, Einträge löschen sowie Sperren/Entsperren sind an das Bearbeiten-Recht der Gruppen-Verwaltung gekoppelt statt an reinen Tool-Zugriff.",
          "Automatisches Speichern bei jeder Änderung; bearbeiten zwei Geräte gleichzeitig, wird der Konflikt erkannt und der aktuelle Stand neu geladen, statt dass Änderungen stillschweigend verloren gehen."
        ]
      }
    ]
  }
];
