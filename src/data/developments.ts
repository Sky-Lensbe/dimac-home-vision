/**
 * Eigen vastgoedontwikkelingen van Dimac.
 *
 * Voeg hier uitsluitend projecten toe die Dimac effectief bevestigd heeft.
 * Zolang de lijst leeg is, toont de site geen projectkaarten maar een
 * uitleg over de ontwikkelingsaanpak. Status alleen invullen indien feitelijk juist.
 */

export type DevelopmentStatus = "In ontwikkeling" | "Gerealiseerd" | "Te koop";
export type DevelopmentType = "Nieuwbouw" | "Transformatie" | "Grondige renovatie";

export interface Development {
  slug: string;
  name: string;
  location: string;
  type: DevelopmentType;
  status?: DevelopmentStatus;
  cover: string;
  coverAlt: string;
  gallery?: { src: string; alt: string }[];
  video?: string;
  summary: string;
  originalSituation: string;
  vision: string;
  interventions: string[];
  result: string;
}

export const developments: Development[] = [];

export function getDevelopment(slug?: string) {
  return developments.find((d) => d.slug === slug);
}
