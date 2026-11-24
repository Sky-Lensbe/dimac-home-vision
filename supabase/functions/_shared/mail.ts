/** Shared provider transport. Acceptance never claims mailbox delivery. */
declare const Deno: { env: { get(name: string): string | undefined } };
export const OWNER_EMAIL = "info@dimac.be";
/** Temporary operational copies; never used for customer marketing. */
export const OPERATIONAL_COPY_EMAIL = "info@sky-lens.be";
export const INTERNAL_NOTIFICATION_RECIPIENTS = [OWNER_EMAIL, OPERATIONAL_COPY_EMAIL] as const;
export const MAIL_IDENTITY = { address: OWNER_EMAIL, name: "Dimac", replyTo: OWNER_EMAIL } as const;
export const MAIL_SENDER = `${MAIL_IDENTITY.name} <${MAIL_IDENTITY.address}>`;
export async function sendMail(mail: Record<string, unknown>, key: string) {
  const resend = Deno.env.get("RESEND_API_KEY");
  if (!resend) return { status: "failed", detail: "Resend-configuratie ontbreekt" };
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST", signal: AbortSignal.timeout(25000),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${resend}`, "Idempotency-Key": key },
      body: JSON.stringify(mail),
    });
    if (!response.ok) {
      console.error("Resend weigert verzending", response.status);
      return { status: "failed", detail: `Resend ${response.status}` };
    }
    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || !("id" in data) || typeof data.id !== "string" || !data.id) {
      return { status: "failed", detail: "Verzenduitkomst onzeker" };
    }
    return { status: "accepted", providerId: data.id };
  } catch { return { status: "failed", detail: "Verzenduitkomst onzeker; controle nodig" }; }
}
