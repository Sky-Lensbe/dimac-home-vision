import { COMPANY } from "@/lib/site";

/**
 * Bouwt een mailto-link. Standaard naar het bevestigde Dimac-adres; een formulier
 * in testmodus geeft zelf een andere ontvanger mee. De bezoeker verstuurt het bericht
 * zelf vanuit de eigen e-mailapp. Er wordt niets opgeslagen.
 */
export function buildMailto(subject: string, fields: [string, string][], intro?: string, to: string = COMPANY.email): string {
  const lines = [
    ...(intro ? [intro, ""] : []),
    ...fields.filter(([, v]) => v && v.trim()).map(([k, v]) => `${k}: ${v.trim()}`),
  ];
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
}

export function openMailto(url: string) {
  window.location.href = url;
}
