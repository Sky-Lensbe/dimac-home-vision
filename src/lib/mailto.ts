import { COMPANY } from "@/lib/site";

/**
 * Bouwt een mailto-link naar het bevestigde Dimac-adres.
 * Er is nog geen backend: de bezoeker verstuurt het bericht zelf
 * vanuit de eigen e-mailapp. Er wordt niets opgeslagen.
 */
export function buildMailto(subject: string, fields: [string, string][], intro?: string): string {
  const lines = [
    ...(intro ? [intro, ""] : []),
    ...fields.filter(([, v]) => v && v.trim()).map(([k, v]) => `${k}: ${v.trim()}`),
  ];
  return `mailto:${COMPANY.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
}

export function openMailto(url: string) {
  window.location.href = url;
}
