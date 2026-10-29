/**
 * Woningscan-aanbod: vier producten, één centrale bron.
 * Alle prijzen zijn definitief bevestigd en inclusief 21% btw.
 * De drone-dakscreening is een losse optie, enkel bij fysieke inspecties, en staat standaard uit.
 */

import { DRONE_PRICE, PHYSICAL_PRODUCTS, VAT_RATE, type PackageId, type ScanProduct } from "../../supabase/functions/_shared/quickscan/catalog";
export * from "../../supabase/functions/_shared/quickscan/catalog";


/** Enkel fysieke inspecties zijn aanvraagbare pakketten. */
export function getPackage(id: string | null | undefined): ScanProduct | undefined {
  return PHYSICAL_PRODUCTS.find((p) => p.id === id);
}

/** Totaal incl. btw. Drone telt enkel bij fysieke pakketten; er wordt geen btw bijgeteld. */
export function scanTotal(id: string, drone: boolean): number {
  const pkg = getPackage(id);
  if (!pkg) throw new Error(`Geen fysiek pakket: ${id}`);
  return Math.round((pkg.price + (drone && pkg.droneAllowed ? DRONE_PRICE : 0)) * 100) / 100;
}

/** Btw-component uit een btw-inclusieve prijs. */
export function vatPart(priceIncl: number, rate = VAT_RATE): number {
  return Math.round((priceIncl - priceIncl / (1 + rate)) * 100) / 100;
}

export function formatEuro(value: number): string {
  return `€${value.toLocaleString("nl-BE", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPrice(p: ScanProduct): string {
  return p.price === 0 ? "Gratis" : formatEuro(p.price);
}

export const VAT_LABEL = `incl. ${Math.round(VAT_RATE * 100)}% btw`;

export type Situation = "kopen" | "renoveren";

/** Leest pakket- en situatieparameters; oude (basis/compleet) of ongeldige waarden selecteren niets. */
export function parseScanParams(params: URLSearchParams): { pakket: PackageId | null; situatie: Situation | null } {
  const pakket = (getPackage(params.get("pakket"))?.id as PackageId | undefined) ?? null;
  const s = params.get("situatie");
  return { pakket, situatie: s === "kopen" || s === "renoveren" ? s : null };
}

/**
 * Ontvanger voor de Woningscan-mailto. Testmodus is een codeconstante (niet afhankelijk van
 * import.meta.env.PROD): zolang die op "test" staat gaat een handoff uitsluitend naar info@sky-lens.be.
 * Omschakelen naar productie vereist expliciete toestemming en een codewijziging.
 */
export const WONINGSCAN_MAIL_MODE: "test" | "production" = "test";
export const WONINGSCAN_TEST_RECIPIENT = "info@sky-lens.be";
export function woningscanRecipient(mode: "test" | "production" = WONINGSCAN_MAIL_MODE): string {
  return mode === "production" ? "info@dimac.be" : WONINGSCAN_TEST_RECIPIENT;
}
