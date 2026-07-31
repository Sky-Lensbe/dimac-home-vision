/**
 * Centrale siteconfiguratie.
 *
 * De basis-URL is configureerbaar via de environment variable VITE_SITE_URL.
 * Zolang die niet gezet is, gebruiken wij het officiële domein dimac.be.
 * Gebruik hier nooit een preview-URL.
 */

const rawBase =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL) ||
  "https://www.dimac.be";

/** Basis-URL zonder trailing slash. */
export const SITE_URL = String(rawBase).replace(/\/+$/, "");

/** Maakt van een pad een absolute URL zonder trailing slash (behalve de root). */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  const clean = "/" + String(path).replace(/^\/+/, "").replace(/\/+$/, "");
  return clean === "/" ? `${SITE_URL}/` : `${SITE_URL}${clean}`;
}

/**
 * Uitsluitend bevestigde bedrijfsgegevens.
 * Voeg hier pas velden toe wanneer Dimac de gegevens effectief aanlevert
 * (telefoon, adres, btw-nummer, erkenningen, socialemediaprofielen).
 */
export const COMPANY = {
  name: "Dimac",
  legalName: "Dimac",
  email: "info@dimac.be",
  url: SITE_URL,
  /** Stabiele identiteit voor structured data, één entiteit voor de hele site. */
  id: `${SITE_URL}/#organisatie`,
  logo: absoluteUrl("/logo-dimac.png"),
  image: absoluteUrl("/og-dimac.jpg"),
  areaServed: ["Diest", "Scherpenheuvel-Zichem", "Halen", "Tessenderlo", "Ham", "Bekkevoort"],
  openingHours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "17:00" },
  ],
} as const;

export const DEFAULT_OG_IMAGE = COMPANY.image;

/** Structured data voor de onderneming. Wordt op elke pagina hergebruikt via @id. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    "@id": COMPANY.id,
    name: COMPANY.name,
    url: `${SITE_URL}/`,
    logo: COMPANY.logo,
    image: COMPANY.image,
    email: COMPANY.email,
    areaServed: COMPANY.areaServed.map((name) => ({ "@type": "City", name })),
    openingHoursSpecification: COMPANY.openingHours.map((o) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: o.days,
      opens: o.opens,
      closes: o.closes,
    })),
  };
}

export interface Crumb {
  label: string;
  to?: string;
}

/** BreadcrumbList structured data op basis van zichtbare breadcrumbs. */
export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.to ? { item: absoluteUrl(c.to) } : {}),
    })),
  };
}

/** FAQPage schema. Gebruik dit uitsluitend voor vragen die zichtbaar op de pagina staan. */
export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}
