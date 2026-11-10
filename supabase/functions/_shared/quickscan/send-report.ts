/** Test-mode report mail: server PDF (strict assets) + Resend via the connector gateway.
 * Only the test allowlist (mail-policy) can receive; any other visitor gets no mail. */
import { jsPDF } from "npm:jspdf@4.2.1";
import { renderSnapshotPdf as render233 } from "./pdf/render233.ts";
import { renderSnapshotPdf as render234 } from "./pdf/render234.ts";
import { MAIL_MODE, TEST_ALLOWLIST } from "./mail-policy.ts";
import { reportEmail } from "./delivery.ts";

const ASSET_BASE = "https://id-preview--9898680e-4724-4e20-8227-2a5082382f19.lovable.app/__l5e/assets-v1";
const ASSETS: Record<string, string> = {
  "dimac-logo.jpg": "eac0e65c-d1d6-415e-8f37-ce51fbc93e7d",
  "PlayfairDisplay-Regular.ttf": "825c3cfc-9327-4ef2-b563-b89261eb309c",
  "PlayfairDisplay-SemiBold.ttf": "4165c84c-1c29-415c-b7ae-79f7a0113a8f",
  "Inter-Regular.ttf": "2788c9b1-ed65-497a-bb5d-fdc86391ff74",
  "Inter-SemiBold.ttf": "a38f5209-6d60-447e-b242-43722b7f6b74",
  "dimac-gebouw.png": "5d196c5f-fe0f-4c92-991d-cee2ea4d2f2d",
  "dimac-woning.png": "6ce414ea-2c41-46da-8f2a-417ba6b568c7",
};
const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

export function mayReceiveTestMail(email: string): boolean {
  return MAIL_MODE === "test" && (TEST_ALLOWLIST as readonly string[]).includes(email.trim().toLowerCase());
}

export async function sendReportMail(snapshot: any, meta: { reportNumber: string; name: string; municipality: string; date: string }, email: string, firstName: string) {
  if (!mayReceiveTestMail(email)) return { status: "niet_geconfigureerd" as const };
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!lovableKey || !resendKey) return { status: "failed" as const, detail: "Mailsleutels ontbreken" };
  const ids = ASSETS;
  const deps = {
    jsPDF,
    categories: ["Beperkte renovatiesignalen", "Enkele aandachtspunten", "Verhoogde renovatiesignalen", "Prioritaire beoordeling aanbevolen"].map((label) => ({ label })),
    assets: { logo: ["dimac-logo.jpg"], fonts: { serif: ["PlayfairDisplay-Regular.ttf", "PlayfairDisplay-SemiBold.ttf"], sans: ["Inter-Regular.ttf", "Inter-SemiBold.ttf"] } },
    absoluteUrl: (path: string) => /^https?:/.test(path) ? path : `https://www.dimac.be${path}`,
    withReportRef: (path: string, number: string) => {
      const [base, hash] = path.split("#");
      return `${base}${base.includes("?") ? "&" : "?"}rapport=${number}${hash ? `#${hash}` : ""}`;
    },
    formatEuro: (n: number) => `€${n.toLocaleString("nl-BE", { maximumFractionDigits: 2, minimumFractionDigits: Number.isInteger(n) ? 0 : 2 })}`,
    vatLabel: "incl. 21% btw",
  };
  const pdf = await renderSnapshotPdf(snapshot, meta, deps as never, { strictAssets: true, load: async (name: string) => {
    const id = ids[name];
    if (!id) throw new Error(`ASSET_UNKNOWN ${name}`);
    const r = await fetch(`${ASSET_BASE}/${id}/${name}`);
    if (!r.ok) throw new Error(`ASSET_FAILED ${name} ${r.status}`);
    return await r.arrayBuffer();
  } });
  const bytes = new Uint8Array(await pdf.arrayBuffer());
  if (String.fromCharCode(...bytes.slice(0, 4)) !== "%PDF") return { status: "failed" as const, detail: "PDF ongeldig" };
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  const mail = reportEmail(firstName, meta.reportNumber, "https://dimac-home-vision.lovable.app/logo-dimac.png");
  let res: Response;
  try {
    res = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": resendKey, "Idempotency-Key": `quickscan-report-${meta.reportNumber}` },
      body: JSON.stringify({ ...mail, to: [email.trim().toLowerCase()], attachments: [{ filename: `DIMAC-Quickscan-${meta.reportNumber}.pdf`, content: btoa(bin) }] }),
    });
  } catch (e) {
    console.error("Resend onbereikbaar", e);
    return { status: "failed" as const, detail: "Afleverdienst onbereikbaar (uitkomst onzeker)" };
  }
  if (!res.ok) {
    const body = await res.text();
    console.error(`Resend [${res.status}]: ${body}`);
    return { status: "failed" as const, detail: `Resend ${res.status}` };
  }
  return { status: "accepted" as const };
}
