/** Snapshot PDF delivery; recipients are guarded by the central mail policy. */
import { jsPDF } from "npm:jspdf@4.2.1";
import { renderSnapshotPdf as render233 } from "./pdf/render233.ts";
import { renderSnapshotPdf as render234 } from "./pdf/render234.ts";
import { mayReceiveReportMail, reportMailEnvelope } from "./mail-policy.ts";
import { sendMail } from "../mail.ts";
import { renderSnapshotPdf as historical } from "./pdf/historical-frozen.ts";
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
export async function sendReportMail(snapshot: any, meta: { reportNumber: string; name: string; municipality: string; date: string }, email: string, firstName: string) {
  if (!mayReceiveReportMail(email)) return { status: "niet_geconfigureerd" as const };
  const ids = ASSETS;
  const deps = {
    jsPDF,
    categories: ["Beperkte renovatiesignalen", "Enkele aandachtspunten", "Verhoogde renovatiesignalen", "Prioritaire beoordeling aanbevolen"].map((label) => ({ label })),
    assets: { logo: ["dimac-logo.jpg"], fonts: { serif: ["PlayfairDisplay-Regular.ttf", "PlayfairDisplay-SemiBold.ttf"], sans: ["Inter-Regular.ttf", "Inter-SemiBold.ttf"] }, art: { building: ["dimac-gebouw.png"], house: ["dimac-woning.png"] } },
    absoluteUrl: (path: string) => /^https?:/.test(path) ? path : `https://www.dimac.be${path}`,
    withReportRef: (path: string, number: string) => {
      const [base, hash] = path.split("#");
      return `${base}${base.includes("?") ? "&" : "?"}rapport=${number}${hash ? `#${hash}` : ""}`;
    },
    formatEuro: (n: number) => `€${n.toLocaleString("nl-BE", { maximumFractionDigits: 2, minimumFractionDigits: Number.isInteger(n) ? 0 : 2 })}`,
    vatLabel: "incl. 21% btw",
  };
  // 2.3.4-rapporten krijgen de nieuwe premium renderer; 2.3.3 behoudt haar eigen renderpad.
  const render = snapshot?.reportVersion === "qs-report-2.3.4" ? render234 : snapshot?.reportVersion === "qs-report-2.3.3" ? render233 : historical;
  const pdf = await render(snapshot, meta, deps as never, { strictAssets: true, load: async (name: string) => {
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
  return await sendMail({ ...mail, ...reportMailEnvelope(email), attachments: [{ filename: `DIMAC-Quickscan-${meta.reportNumber}.pdf`, content: btoa(bin) }] }, `quickscan-report-${meta.reportNumber}`);
}
