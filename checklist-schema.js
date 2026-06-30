// Statische Beschreibung der beiden Checklisten aus "Checkliste_Trainerzu_abgang.docx".
// Jeder Eintrag: { id, label, verantwortlich, subItems: [{id,label}]|null, infoText? }
// "verantwortlich" ist reine Referenzinfo (wer im Original dafür zuständig war), kein Eingabefeld.
// Zeilen ohne eigene Checkbox (nur Sub-Items) haben label:"". Reine Infozeilen ohne Checkbox
// stehen in infoText statt subItems.

const ZUGANG_SCHEMA = [
  { id: "zugang-1", label: "Checkliste aushändigen", verantwortlich: "Nachwuchsleiter", subItems: null },
  { id: "zugang-2", label: "Einführung: Termin mit der Geschäftsstelle am Dienstag oder Donnerstag zu den Geschäftszeiten 17:00–19:00 Uhr ausmachen und aufsuchen", verantwortlich: "Geschäftsstellenleiter", subItems: null },
  { id: "zugang-3", label: "Vertrag: aushändigen und unterschreiben lassen", verantwortlich: "Geschäftsstellenleiter", subItems: null },
  { id: "zugang-4", label: "Mitgliedsantrag: ausfüllen und abgeben", verantwortlich: "Geschäftsstellenleiter", subItems: null },
  {
    id: "zugang-5", label: "Schlüsselübergabe", verantwortlich: "Geschäftsstellenleiter",
    subItems: [
      { id: "zugang-5-1", label: "Z__ Schlüssel" },
      { id: "zugang-5-2", label: "Schrankschlüssel Trainingsmaterialien" },
      { id: "zugang-5-3", label: "Schlüssel zum Tablet Stadion Schiedsrichterkabine ____" },
      { id: "zugang-5-4", label: "Schlüssel zum Tablet Stelzenberg in Schiedsrichterkabine" },
      { id: "zugang-5-5", label: "100 EUR Pfand hinterlegen" }
    ]
  },
  {
    id: "zugang-6", label: "Mannschaftsfahrten", verantwortlich: "Geschäftsstellenleiter",
    subItems: [
      { id: "zugang-6-1", label: "Fahrten mit den Kleinbussen der Sponsoren und den SCH Bussen inkl. Abwicklungen und Pflichten aufklären" },
      { id: "zugang-6-2", label: "Fahrtkostenabwicklung/-regelung" }
    ]
  },
  { id: "zugang-7", label: "Erweitertes Führungszeugnis: aushändigen", verantwortlich: "Geschäftsstellenleiter", subItems: null },
  {
    id: "zugang-8", label: "Konzeptpapier Nachwuchsförderung", verantwortlich: "Nachwuchsleiter",
    subItems: [
      { id: "zugang-8-1", label: "erläutern und aushändigen" },
      { id: "zugang-8-2", label: "den Verhaltenskodex für Trainer/Funktionäre unterschreiben" }
    ]
  },
  {
    id: "zugang-9", label: "Weitere Informationen über", verantwortlich: "Geschäftsstellenleiter",
    subItems: [
      { id: "zugang-9-1", label: "Platz- und Hallenbelegungsplan" },
      { id: "zugang-9-2", label: "Trainingsgelände, Kabinen und Materialcontainer zeigen/erläutern (alle Trainingsstätten)" }
    ]
  },
  {
    id: "zugang-10", label: "", verantwortlich: "Nachwuchsleiter",
    subItems: [
      { id: "zugang-10-1", label: "Trainergruppe/-chat einladen" },
      { id: "zugang-10-2", label: "Trainerversammlungen" },
      { id: "zugang-10-3", label: "Trainerschulungen" },
      { id: "zugang-10-4", label: "Trainingsphilosophie Deutschland" }
    ]
  },
  {
    id: "zugang-11", label: "Vorstellung", verantwortlich: "Nachwuchsleiter",
    subItems: [
      { id: "zugang-11-1", label: "Nachwuchskoordinatoren" },
      { id: "zugang-11-2", label: "Zeugwart" },
      { id: "zugang-11-3", label: "Torwarttrainer" },
      { id: "zugang-11-4", label: "Athletiktrainer" },
      { id: "zugang-11-5", label: "Platzwart" }
    ]
  },
  { id: "zugang-12", label: "Zugangsdaten DFBnet: Zugang einrichten und erläutern", verantwortlich: "Nachwuchskoordinator", subItems: null },
  {
    id: "zugang-13", label: "SpielerPlus App", verantwortlich: "Nachwuchsleiter",
    subItems: [
      { id: "zugang-13-1", label: "Rolle einrichten und erläutern" },
      { id: "zugang-13-2", label: "in den jeweiligen Bereich einladen" }
    ]
  },
  { id: "zugang-14", label: "Cloud: erläutern/zeigen/Zugang einrichten", verantwortlich: "Nachwuchsförderung", subItems: null },
  { id: "zugang-15", label: "Social Media: Abläufe Spieltagsberichte/-fotos", verantwortlich: "Nachwuchsförderung", subItems: null },
  {
    id: "zugang-16", label: "Zentralen Schrank für Trainingsmaterialien", verantwortlich: "Zeugwart",
    subItems: [
      { id: "zugang-16-1", label: "Materialien zeigen" },
      { id: "zugang-16-2", label: "Umgang mit dem Schrank" }
    ]
  },
  {
    id: "zugang-17", label: "Materialliste für Trainingsmaterialien und Trikots", verantwortlich: "Zeugwart",
    subItems: [
      { id: "zugang-17-1", label: "gemeinsam ausfüllen" },
      { id: "zugang-17-2", label: "Original für den Zeugwart" },
      { id: "zugang-17-3", label: "Kopie für den Trainer" }
    ]
  }
];

const ABGANG_SCHEMA = [
  { id: "abgang-1", label: "Geschäftsstelle informieren", verantwortlich: "Nachwuchsleiter", subItems: null },
  { id: "abgang-2", label: "Checkliste aushändigen", verantwortlich: "Geschäftsstelle", subItems: null },
  { id: "abgang-3", label: "Letzter Tag: Termin mit der Geschäftsstelle am Dienstag oder Donnerstag zu den Geschäftszeiten 17:00–19:00 Uhr ausmachen und aufsuchen", verantwortlich: "Geschäftsstellenleiter", subItems: null },
  {
    id: "abgang-4", label: "Schlüsselabgabe", verantwortlich: "Geschäftsstellenleiter",
    subItems: [
      { id: "abgang-4-1", label: "Z__ Schlüssel" },
      { id: "abgang-4-2", label: "Schrankschlüssel Trainingsmaterialien" },
      { id: "abgang-4-3", label: "Schlüssel zum Tablet Stadion Schiedsrichterkabine ____" },
      { id: "abgang-4-4", label: "Schlüssel zum Tablet Stelzenberg in Schiedsrichterkabine" },
      { id: "abgang-4-5", label: "100 EUR Pfand zurückgeben" }
    ]
  },
  {
    id: "abgang-5", label: "Abmeldung", verantwortlich: "Alle aufgeführten Personen",
    subItems: [
      { id: "abgang-5-1", label: "Leitung Nachwuchsförderung" },
      { id: "abgang-5-2", label: "Nachwuchskoordinatoren" },
      { id: "abgang-5-3", label: "Nachwuchsförderung" },
      { id: "abgang-5-4", label: "Zeugwart" },
      { id: "abgang-5-5", label: "Torwarttrainer" },
      { id: "abgang-5-6", label: "Athletiktrainer" }
    ],
    infoText: "Platzwart wird informiert durch die Geschäftsstelle"
  },
  { id: "abgang-6", label: "Zugangsdaten DFBnet: Zugang sperren", verantwortlich: "Nachwuchskoordinator", subItems: null },
  { id: "abgang-7", label: "SpielerPlus: aus dem Bereich löschen", verantwortlich: "Nachwuchsleiter", subItems: null },
  {
    id: "abgang-8", label: "", verantwortlich: "Nachwuchsleiter",
    subItems: [
      { id: "abgang-8-1", label: "Information in Trainergruppe/-chat" },
      { id: "abgang-8-2", label: "Trainer/Betreuer entfernen" }
    ]
  },
  { id: "abgang-9", label: "Cloud: Zugang sperren/löschen", verantwortlich: "Nachwuchsförderung", subItems: null },
  {
    id: "abgang-10", label: "Abgabe von Trainingsmaterialien und Trikots", verantwortlich: "Geschäftsstellenleiter",
    subItems: [
      { id: "abgang-10-1", label: "Materialien/Trikots auf Vollständigkeit prüfen" },
      { id: "abgang-10-2", label: "Materialien/Trikots auf Schäden prüfen" },
      { id: "abgang-10-3", label: "Materialliste ausfüllen" },
      { id: "abgang-10-4", label: "Original für den Zeugwart" },
      { id: "abgang-10-5", label: "Kopie für den Trainer" }
    ]
  }
];

const ABGANG_INFO_TEXT =
  "Ende Mitgliedschaft (schriftliche Kündigung) – Trainer selbst verantwortlich, Termine sind hier " +
  "(spätestens vier Wochen vor dem 30.06. oder vier Wochen vor dem 31.12. eines jeden Jahres.)";
