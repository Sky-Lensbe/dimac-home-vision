/**
 * Klantbeoordelingen.
 *
 * Deze lijst blijft leeg tot er echte, verifieerbare reviews beschikbaar zijn.
 * Zolang de array leeg is, rendert de reviewsectie niet.
 * Voeg hier nooit fictieve citaten, namen of scores toe.
 */
export interface Review {
  customerName: string;
  municipality?: string;
  projectType?: string;
  quote: string;
  /** Slug uit src/data/projects.ts. */
  relatedProject?: string;
  /** Alleen invullen wanneer de score uit een echte bron komt. */
  rating?: number;
}

export const reviews: Review[] = [];
