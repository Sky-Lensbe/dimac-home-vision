/**
 * Centrale e-mailconfiguratie voor de Quickscan.
 *
 * TESTMODUS: alle mails gaan uitsluitend naar het toegestane testadres.
 * Er gaat nooit iets naar klanten of naar DIMAC zolang MAIL_MODE "test" is.
 * Omschakelen naar productie gebeurt alleen door deze constante bewust
 * in code te wijzigen na uitdrukkelijke toestemming; nooit automatisch.
 */

export const MAIL_MODE: "test" | "production" = "test";

export const TEST_ALLOWLIST = ["info@sky-lens.be"] as const;

/** Productie-ontvangers voor later. Worden genegeerd in testmodus. */
export const PRODUCTION_CONFIG = {
  sendReportToCustomer: true,
  internalNotify: ["info@dimac.be"],
};

export type MailKind = "report" | "lead_notification";

/** Bepaalt de ontvangers. In testmodus altijd en alleen de allowlist. */
export function resolveRecipients(kind: MailKind, customerEmail: string | null, mode: "test" | "production" = MAIL_MODE): string[] {
  if (mode !== "production") return [...TEST_ALLOWLIST];
  if (kind === "report") return PRODUCTION_CONFIG.sendReportToCustomer && customerEmail ? [customerEmail] : [];
  return [...PRODUCTION_CONFIG.internalNotify];
}

/** Harde controle vlak voor verzending: weigert elk adres buiten de allowlist in testmodus. */
export function assertAllowedRecipient(address: string, mode: "test" | "production" = MAIL_MODE): void {
  if (mode !== "production" && !TEST_ALLOWLIST.includes(address.trim().toLowerCase() as (typeof TEST_ALLOWLIST)[number])) {
    throw new Error("Ontvanger niet toegestaan in testmodus");
  }
}
