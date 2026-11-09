/** Local delivery preparation only: no provider call, scheduling or live activation. */
export const DELIVERY_MODE: "test" | "live" = "test";
export const DELIVERY_ENABLED = false;
export const MAX_DELIVERY_ATTEMPTS = 5;
export const SENDER = { address: "info@sky-lens.be", name: "Sky-Lens voor DIMAC", replyTo: "info@sky-lens.be" } as const;
export type DeliveryStatus = "pending" | "sending" | "accepted" | "delivered" | "failed" | "retry_scheduled";
export interface DeliveryIdentity { reportId: string; reportNumber: string; recipient: string; synthetic: boolean; generation: number }

export function deliveryRecipient(identity: DeliveryIdentity, mode: "test" | "live" = DELIVERY_MODE): string {
  const email = identity.recipient.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("INVALID_EMAIL");
  // Never forward an arbitrary visitor's personal report to a test mailbox.
  if (mode === "test" && (!identity.synthetic || email !== "info@sky-lens.be")) throw new Error("TEST_RECIPIENT_DENIED");
  return email;
}

export function deliveryKey(identity: DeliveryIdentity): string {
  if (!/^[a-zA-Z0-9-]+$/.test(identity.reportId) || !Number.isInteger(identity.generation) || identity.generation < 0) throw new Error("INVALID_DELIVERY_ID");
  return `quickscan-report-${identity.reportId}-${identity.generation}`;
}

/** API success only means accepted, never delivered. Unknown outcomes require reconciliation. */
export function attemptOutcome(status: number | null, attempt: number, now: number, retryAfterSeconds = 0) {
  if (status !== null && status >= 200 && status < 300) return { status: "accepted" as const, nextAt: null, review: false };
  if (status === null) return { status: "failed" as const, nextAt: null, review: true };
  const temporary = status === 429 || status >= 500;
  if (!temporary || attempt >= MAX_DELIVERY_ATTEMPTS) return { status: "failed" as const, nextAt: null, review: false };
  return { status: "retry_scheduled" as const, nextAt: now + Math.max(30 * 2 ** Math.max(0, attempt - 1), retryAfterSeconds) * 1000, review: false };
}

export function mayTransition(from: DeliveryStatus, to: DeliveryStatus): boolean {
  const allowed: Record<DeliveryStatus, DeliveryStatus[]> = {
    pending: ["sending"], sending: ["accepted", "failed", "retry_scheduled"],
    retry_scheduled: ["sending", "failed"], accepted: ["delivered", "failed"], delivered: [], failed: [],
  };
  return allowed[from].includes(to);
}

export function deliveryMessage(status: DeliveryStatus | "niet_geconfigureerd"): string {
  if (status === "delivered") return "De afleverdienst heeft de aflevering bevestigd.";
  if (status === "accepted") return "De afleverdienst heeft uw e-mail aanvaard. Aflevering is nog niet bevestigd.";
  if (status === "failed") return "Uw rapport is klaar, maar de e-mail kon voorlopig niet worden verstuurd. U kunt het rapport hieronder wel bekijken en downloaden.";
  if (status === "niet_geconfigureerd") return "Uw rapport is klaar. E-maillevering is nog niet actief; u kunt het rapport bekijken en downloaden.";
  return "Uw rapport is klaar. De e-maillevering is in voorbereiding.";
}

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c));
export function reportEmail(firstName: string, reportNumber: string, logoUrl: string) {
  if (!/^QS-\d{8}-[A-Z0-9]{8}$/.test(reportNumber)) throw new Error("INVALID_REPORT_NUMBER");
  if (!/^https:\/\//.test(logoUrl)) throw new Error("INVALID_LOGO_URL");
  const paragraphs = [
    `Beste ${firstName.trim() || "bezoeker"},`,
    "Bedankt voor het invullen van de DIMAC Quickscan.",
    "Uw persoonlijke woningrapport is klaar. U vindt het volledige rapport als PDF in de bijlage.",
    "Het rapport bevat een eerste analyse van uw woning op basis van de antwoorden die u zelf heeft ingevuld.",
    "U ontdekt welke onderdelen aandacht verdienen, welke technische en energetische onderwerpen mogelijk samenhangen, welke informatie of documenten u best controleert en hoe u renovatiewerken kunt voorbereiden.",
    "De DIMAC Quickscan is een eerste indicatie en vervangt geen technische inspectie ter plaatse.",
    "Heeft u vragen over het rapport? U kunt op deze e-mail antwoorden.",
    "Met vriendelijke groeten, Team DIMAC",
    "Verzonden voor DIMAC via Sky-Lens — info@sky-lens.be",
  ];
  return {
    from: `${SENDER.name} <${SENDER.address}>`, reply_to: SENDER.replyTo,
    subject: `Uw persoonlijk DIMAC-woningrapport | ${reportNumber}`,
    text: `${reportNumber}\n\n${paragraphs.join("\n\n")}`,
    html: `<html lang="nl"><body style="margin:0;background:#ffffff;color:#1a1c20;font-family:Arial,sans-serif"><main style="max-width:600px;margin:auto;padding:32px 24px"><img src="${escape(logoUrl)}" alt="DIMAC" width="80"><h1 style="font-family:Georgia,serif;font-size:28px">Uw woningrapport</h1><p>${escape(reportNumber)}</p>${paragraphs.map((p) => `<p style="line-height:1.6">${escape(p)}</p>`).join("")}</main></body></html>`,
  };
}