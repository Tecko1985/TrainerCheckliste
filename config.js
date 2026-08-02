const APP_VERSION = "1.0";

const APP_CHANGELOG = [
  {
    version: "1.0",
    groups: [
      {
        title: "Trainer-Liste",
        items: [
          "Übersicht aller Einträge mit Name, Vorname und Geburtsdatum, dazu je ein Kennzeichen für Eintritt und Austritt: offen, in Arbeit oder abgeschlossen.",
          "Das Datum steht direkt unter dem Kennzeichen.",
          "Suche nach Namen, kombinierbar mit den Statusfiltern für Eintritt und Austritt.",
          "Sortierbar nach Name, Geburtsdatum, Eintritt und Austritt — ein Klick auf die Spalte kehrt die Richtung um.",
          "Einträge anlegen und löschen, letzteres mit Rückfrage."
        ]
      },
      {
        title: "Stammdaten",
        items: [
          "Name, Vorname, Geburtsdatum, Anschrift, Telefon und E-Mail-Adresse.",
          "Dazu je ein Häkchen und ein Datum für Trainerzugang und Trainerabgang."
        ]
      },
      {
        title: "Checklisten für Zugang und Abgang",
        items: [
          "Beide Checklisten entsprechen der Papiervorlage, einschließlich aller Unterpunkte.",
          "Jeder Punkt ist einzeln abhakbar. Bei Z-Schlüssel und Schrankschlüssel erscheint zusätzlich ein Feld für die Schlüsselnummer.",
          "Bemerkungsfeld sowie die Angabe „abgeschlossen“ oder „konnte nicht abgeschlossen werden, weil …“ mit Grund.",
          "Ort und Datum der Abschluss-Unterschrift."
        ]
      },
      {
        title: "Einfrieren",
        items: [
          "Ein fertiger Abschnitt lässt sich mit „Speichern & Einfrieren“ sperren. Danach sind alle Felder, Häkchen, Unterschriften und die Kopfzeilenfelder der Stammdaten gesperrt.",
          "Der Sperrzustand bleibt gespeichert und gilt auf jedem Gerät.",
          "Eine Sperre aufheben und einen gesperrten Eintrag löschen verlangt ein Passwort. Es wird auf dem Server geprüft und steht nicht im Quelltext der App."
        ]
      },
      {
        title: "Unterschriften",
        items: [
          "Je Abschnitt eine Unterschrift von Trainer oder Betreuer und eine der Geschäftsstelle — mit Maus, Finger oder Stift.",
          "Eine Unterschrift lässt sich wieder löschen.",
          "Die Unterschriften liegen als eigene Dateien in der Cloud statt in der Datenliste. Dadurch bleibt die Liste klein und das automatische Speichern schnell, gleich wie viele Checklisten unterschrieben sind."
        ]
      },
      {
        title: "Wer darf was",
        items: [
          "Sehen: alle Checklisten vollständig, aber schreibgeschützt — die Felder sind ausgegraut, die Knöpfe zum Anlegen und Löschen fehlen.",
          "Bearbeiten: Einträge anlegen und löschen, Felder und Unterschriften pflegen, Abschnitte sperren und entsperren.",
          "Administrieren: der Reiter „Einstellungen“.",
          "Der Reiter „Info“ ist für alle sichtbar."
        ]
      },
      {
        title: "Bedienung am Handy",
        items: [
          "Die Reiterleiste bricht am Handy um, statt seitlich aus dem Bild zu laufen — auch die hinteren Reiter sind auf schmalen Bildschirmen erreichbar.",
          "Auch die Umschaltung zwischen Zugang und Abgang bricht um, statt rechts aus dem Bild zu laufen.",
          "Eingabefelder sind mindestens 16 Pixel groß, damit der iPhone-Browser beim Antippen nicht ungefragt in die Seite hineinzoomt und verschoben stehen bleibt.",
          "Unterschreiben funktioniert mit dem Finger."
        ]
      },
      {
        title: "Daten & Speicherung",
        items: [
          "Gespeichert wird in der Vereins-Nextcloud über die zentrale Anmeldung der Tools-Übersicht — ein eigenes Passwort braucht es nicht, auch nicht am Handy.",
          "Weil hier Personendaten und Unterschriften stehen, gibt es bewusst keinen lokalen Datei-Modus: die Daten liegen ausschließlich in der Vereins-Cloud.",
          "Gespeichert wird bei jeder Änderung von selbst.",
          "Ändern zwei Geräte gleichzeitig denselben Stand, erkennt die App das, lädt den fremden Stand nach und sagt Bescheid."
        ]
      }
    ]
  }
];
