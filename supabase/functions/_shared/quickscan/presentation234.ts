/** Presentation only: clone stored 2.3.4 content, never recompute or alter routing. */
import type { QuickscanReport23 } from "./report.ts";

export const REPORT_INFORMATION_TITLE = "Belangrijke informatie over dit rapport";
export const REPORT_INFORMATION = "De DIMAC Quickscan biedt een eerste, richtinggevende analyse van uw woning op basis van de antwoorden die u zelf heeft ingevuld. Er heeft geen inspectie ter plaatse plaatsgevonden. Het rapport vormt geen technische diagnose, officiële keuring, attest of garantie en vervangt geen beoordeling door een bevoegde vakpersoon. Technische vaststellingen en eventuele renovatieverplichtingen moeten waar nodig afzonderlijk worden geverifieerd.";
export const PREMIUM_INFORMATION = "Premies en voorwaarden kunnen wijzigen. Controleer uw persoonlijke mogelijkheden bij de bevoegde instantie.";

/** Only known generic repetitions are removed; contextual uncertainty is retained. */
export function reportText234(text: string): string {
  return text
    .replace("U meldt hier geen problemen. Dat betekent niet dat dit onderdeel gecontroleerd of in orde is.", "Op basis van uw antwoorden zijn voor dit onderdeel geen concrete problemen gemeld.")
    .replace(/\s*De Quickscan kan niet bepalen of leidingen vervangen moeten worden\./g, "")
    .replace(/\s*De Quickscan voorspelt geen toekomstig label en belooft geen besparing\./g, "")
    .replace(/\s*Dit traject is geen uitvoeringsbestek, technische keuring of kostenraming\./g, "")
    .trim();
}

const PREMIUM_LINKS = [
  ["Premies voor uw renovatie zoeken", "Premiezoeker.be"],
  ["Officiële premievoorwaarden bekijken", "Vlaanderen.be"],
  ["Mijn VerbouwPremie bekijken", "Vlaamse overheid"],
  ["Financieringsmogelijkheden bekijken", "Mijn VerbouwLening"],
];
export function premiumLink234(source: { label: string; url: string }) {
  const i = source.url.includes("premiezoeker") ? 0 : source.url.includes("mijn-verbouwpremie") ? 2 : source.url.includes("mijn-verbouwlening") ? 3 : 1;
  return { ...source, label: PREMIUM_LINKS[i][0], caption: PREMIUM_LINKS[i][1] };
}

export function presentReport234(report: QuickscanReport23): QuickscanReport23 {
  if (report.reportVersion !== "qs-report-2.3.4") return report;
  const result = structuredClone(report);
  // Transform only displayed prose, not safety, facts, answer labels or recommendations.
  for (const domain of result.v23.domains) domain.analysis = reportText234(domain.analysis);
  for (const connection of result.v23.connections) connection.text = reportText234(connection.text);
  if (result.v232) result.v232.energy.text = reportText234(result.v232.energy.text);
  if (result.v234) {
    result.v234.premiums.title = "Mogelijke premies en financiële ondersteuning";
    result.v234.premiums.intro = "Bij renovatiewerken kunnen premies of financieringsmogelijkheden relevant zijn. Bekijk de officiële informatie voor uw persoonlijke situatie.";
    result.v234.premiums.closing = PREMIUM_INFORMATION;
  }
  result.limits = REPORT_INFORMATION;
  return result;
}