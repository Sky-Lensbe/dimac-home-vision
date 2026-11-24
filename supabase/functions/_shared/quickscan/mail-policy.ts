/**
 * Centrale e-mailconfiguratie voor de Quickscan.
 *
 * Productie expliciet geactiveerd op verzoek: rapport naar aanvrager, melding naar DIMAC.
 * In testmodus gaan mails uitsluitend naar het toegestane testadres.
 * Er gaat nooit iets naar klanten of naar DIMAC zolang MAIL_MODE "test" is.
 * Omschakelen naar productie gebeurt alleen door deze constante bewust
 * in code te wijzigen na uitdrukkelijke toestemming; nooit automatisch.
 */

import { INTERNAL_NOTIFICATION_RECIPIENTS, OPERATIONAL_COPY_EMAIL } from "../mail.ts";

export const MAIL_MODE: "test" | "production" = "production";

export const TEST_ALLOWLIST = ["info@sky-lens.be"] as const;

/** Productie-ontvangers. Worden genegeerd in testmodus. */
export const PRODUCTION_CONFIG = {
  sendReportToCustomer: true,
  internalNotify: INTERNAL_NOTIFICATION_RECIPIENTS,
};

export type MailKind = "report" | "lead_notification";

/** Bepaalt de ontvangers. In testmodus altijd en alleen de allowlist. */
export function resolveRecipients(kind: MailKind, customerEmail: string | null, mode: "test" | "production" = MAIL_MODE): string[] {
  if (mode !== "production") return [...TEST_ALLOWLIST];
  if (kind === "report") return PRODUCTION_CONFIG.sendReportToCustomer && customerEmail ? [...new Set([customerEmail.trim().toLowerCase(), OPERATIONAL_COPY_EMAIL])] : [];
  return [...PRODUCTION_CONFIG.internalNotify];
}

/** Operational PDF copy is hidden from the customer and shares the original attachment. */
export function reportMailEnvelope(customerEmail: string, mode: "test" | "production" = MAIL_MODE): { to: string[]; bcc?: string[] } {
  const [recipient, ...copies] = resolveRecipients("report", customerEmail, mode);
  if (!recipient) return { to: [] };
  return copies.length ? { to: [recipient], bcc: copies } : { to: [recipient] };
}

/** Harde controle vlak voor verzending: weigert elk adres buiten de allowlist in testmodus. */
export function assertAllowedRecipient(address: string, mode: "test" | "production" = MAIL_MODE): void {
  if (mode !== "production" && !TEST_ALLOWLIST.includes(address.trim().toLowerCase() as (typeof TEST_ALLOWLIST)[number])) {
    throw new Error("Ontvanger niet toegestaan in testmodus");
  }
}

export function mayReceiveReportMail(email: string, mode: "test" | "production" = MAIL_MODE): boolean {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return false;
  return mode === "production" || (TEST_ALLOWLIST as readonly string[]).includes(email.trim().toLowerCase());
}
