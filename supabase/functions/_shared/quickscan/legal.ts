/**
 * Centrale, versioneerbare juridische context voor de Quickscan (geen imports).
 * Informatieve formuleringen, geen individueel juridisch advies. Bij twijfel: verificatiemelding, nooit een conclusie.
 * Gecontroleerd tegen de officiële bronnen op de verificatiedatum hieronder.
 */
export const LEGAL_VERSION = "qs-legal-2026-11-10";
export const LEGAL_VERIFIED_AT = "2026-11-10";

export const LEGAL_SOURCES = {
  renovatieplicht: { label: "Vlaanderen.be — Renovatieverplichting voor residentiële gebouwen", url: "https://www.vlaanderen.be/bouwen-wonen-en-energie/kopen-en-verkopen/een-huis-of-appartement-kopen/renovatieverplichting-voor-residentiele-gebouwen" },
  epcGd: { label: "Vlaanderen.be — EPC van de gemeenschappelijke delen", url: "https://www.vlaanderen.be/bouwen-wonen-en-energie/energieprestatiecertificaten-epcs/epc-van-de-gemeenschappelijke-delen-van-een-appartementsgebouw" },
  asbest: { label: "OVAM — Heb ik een asbestattest nodig?", url: "https://ovam.vlaanderen.be/heb-ik-een-asbestattest-nodig" },
  asbestGd: { label: "OVAM — Asbestattest voor de gemene delen", url: "https://ovam.vlaanderen.be/gemene-delen" },
  overstroming: { label: "Waterinfo — Informatieplicht overstromingsgevoeligheid", url: "https://www.waterinfo.vlaanderen.be/informatieplicht" },
  premiezoeker: { label: "Premiezoeker", url: "https://www.premiezoeker.be/" },
  renovatiepremies: { label: "Vlaanderen.be — Premies voor renovatie", url: "https://www.vlaanderen.be/bouwen-wonen-en-energie/bouwen-en-verbouwen/premies-voor-renovatie" },
  verbouwpremie: { label: "Vlaanderen.be — Mijn VerbouwPremie", url: "https://www.vlaanderen.be/bouwen-wonen-en-energie/bouwen-en-verbouwen/premies-voor-renovatie/mijn-verbouwpremie" },
  verbouwlening: { label: "Vlaanderen.be — Mijn VerbouwLening", url: "https://www.vlaanderen.be/bouwen-wonen-en-energie/lenen-voor-een-woning/mijn-verbouwlening" },
} as const;
export type LegalSourceId = keyof typeof LEGAL_SOURCES;

/** Renovatieverplichting: woningen en appartementen met label E of F, aangekocht vanaf 2023. */
export const RENOVATION_OBLIGATION = {
  labels: ["e", "f"],
  minimumLabel: "D",
  years: 6,
  start: "de datum van het verlijden van de authentieke akte (of het vestigen van erfpacht of opstalrecht)",
} as const;

/** OVAM: asbestattest bij overdracht voor gebouwen van vóór 2001; gemene delen uiterlijk 31/12/2026. */
export const ASBESTOS = { cutoffYear: 2001, commonPartsDeadline: "31 december 2026", commonPartsTransferFrom: "1 januari 2027" } as const;
