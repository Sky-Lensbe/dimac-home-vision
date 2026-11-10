/** Local Deno probe. No backend access, deployment or provider connection.
 * deno run --no-check --node-modules-dir=auto --allow-read --allow-write=/tmp --allow-env
 * scripts/check-quickscan-server-pdf.ts <snapshot.json> <asset-directory> <output.pdf>
 * Use a SYNTHETIC snapshot only; output remains under /tmp.
 */
import { jsPDF } from "npm:jspdf@4.2.1";
import { renderSnapshotPdf } from "../supabase/functions/_shared/quickscan/pdf/render233.ts";
import { renderSnapshotPdf as render234 } from "../supabase/functions/_shared/quickscan/pdf/render234.ts";
import { renderSnapshotPdf as historical } from "../supabase/functions/_shared/quickscan/pdf/historical-frozen.ts";
const [snapshotPath, assetsPath, output] = Deno.args;
if (!snapshotPath || !assetsPath || !output?.startsWith("/tmp/")) throw new Error("Provide snapshot, assets directory and /tmp PDF output");
const snapshot = JSON.parse(await Deno.readTextFile(snapshotPath));
const dependencies = {
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
const render = snapshot.reportVersion === "qs-report-2.3.4" ? render234 : snapshot.reportVersion === "qs-report-2.3.3" ? renderSnapshotPdf : historical;
const meta = snapshot.meta ?? { reportNumber: "QS-20261109-ABC12345", name: "Synthetisch", municipality: "Diest", date: "2026-11-09" };
const pdf = await render(snapshot, meta, dependencies, { strictAssets: true, load: async (name: string) => {
  const bytes = await Deno.readFile(`${assetsPath}/${name}`);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
} });
await Deno.writeFile(output, new Uint8Array(await pdf.arrayBuffer()));
console.log("Strict local snapshot PDF generated", pdf.size);