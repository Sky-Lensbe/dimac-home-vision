/** Shared provider transport. Acceptance never claims mailbox delivery. */
declare const Deno: { env: { get(name: string): string | undefined } };
export const OWNER_EMAIL = "info@dimac.be";
export const MAIL_SENDER = "Sky-Lens voor DIMAC <info@sky-lens.be>";
export async function sendMail(mail: Record<string, unknown>, key: string) {
  const lovable = Deno.env.get("LOVABLE_API_KEY");
  const resend = Deno.env.get("RESEND_API_KEY");
  if (!lovable || !resend) return { status: "failed", detail: "Mailconfiguratie ontbreekt" };
  try {
    const response = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
      method: "POST", signal: AbortSignal.timeout(25000),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${lovable}`, "X-Connection-Api-Key": resend, "Idempotency-Key": key },
      body: JSON.stringify(mail),
    });
    if (!response.ok) {
      console.error("Mailprovider weigert verzending", response.status);
      return { status: "failed", detail: `Mailprovider ${response.status}` };
    }
    const data = await response.json();
    if (!data.id) return { status: "failed", detail: "Verzenduitkomst onzeker" };
    return { status: "accepted", providerId: data.id as string };
  } catch { return { status: "failed", detail: "Verzenduitkomst onzeker; controle nodig" }; }
}
