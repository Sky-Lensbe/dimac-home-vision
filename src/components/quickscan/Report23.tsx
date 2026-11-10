import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Minus, HelpCircle, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Barometer, SafetyAlerts } from "@/components/quickscan/ReportView";
import { ICONS, ILLUSTRATIONS, svgPath, type Shape } from "@/lib/reportArt";
import { withReportRef, type QuickscanReport23, type DomainStatus, type IconId, type ReportV232, type ReportV233, type ReportV234 } from "@/lib/quickscanReport";
import type { SafetyId } from "@/lib/quickscan";
import { formatEuro, VAT_LABEL } from "@/data/woningscan";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { presentReport234, premiumLink234, recommendationScope234, REPORT_INFORMATION_TITLE } from "../../../supabase/functions/_shared/quickscan/presentation234";
import buildingAsset from "@/assets/dimac-gebouw.png.asset.json";
import houseAsset from "@/assets/dimac-woning.png.asset.json";
import logoAsset from "@/assets/dimac-logo.jpg.asset.json";

const Art = ({ shapes, viewBox, className, strokeScale = 1 }: { shapes: Shape[]; viewBox: string; className?: string; strokeScale?: number }) => (
  <svg viewBox={viewBox} className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {shapes.map((s, i) => {
      const common = {
        strokeWidth: (s.w ?? 1.4) * strokeScale,
        strokeDasharray: s.dash ? "2 2" : undefined,
        className: s.accent ? "text-accent" : undefined,
        stroke: "currentColor",
        fill: s.fill ? "currentColor" : "none",
      };
      return s.k === "c" ? <circle key={i} cx={s.x} cy={s.y} r={s.r} {...common} /> : <path key={i} d={svgPath(s)} {...common} />;
    })}
  </svg>
);
export const Icon = ({ id, className }: { id: IconId; className?: string }) => <Art shapes={ICONS[id]} viewBox="0 0 24 24" className={className} />;

const STATUS_STYLE: Record<DomainStatus, { dot: string; Icon: typeof Check }> = {
  geen: { dot: "border-primary/40 bg-transparent", Icon: Minus },
  beperkt: { dot: "border-primary/60 bg-primary/10", Icon: Minus },
  duidelijk: { dot: "border-accent bg-accent", Icon: ArrowRight },
  ernstig: { dot: "border-destructive bg-destructive", Icon: ArrowRight },
  onvoldoende: { dot: "border-dashed border-muted-foreground bg-transparent", Icon: HelpCircle },
};
const StatusMark = ({ status, label }: { status: DomainStatus; label: string }) => (
  <span className="inline-flex items-center gap-2 text-xs font-medium text-primary whitespace-nowrap">
    <span className={cn("h-2.5 w-2.5 rounded-full border-2", STATUS_STYLE[status].dot)} aria-hidden="true" />
    {label}
  </span>
);
const DOC_ICON: Record<string, typeof Check> = { beschikbaar: Check, verifieren: Clock, "niet-gevraagd": Clock, onbekend: HelpCircle, overgeslagen: HelpCircle, "niet-beschikbaar": Minus, nvt: Minus };

const Eyebrow = ({ children }: { children: React.ReactNode }) => <p className="text-[11px] uppercase tracking-[0.24em] text-accent font-medium">{children}</p>;
const Page = ({ n, total, reportNumber, children }: { n: number; total: number; reportNumber: string; children: React.ReactNode }) => (
  <section className="border border-border bg-background shadow-[0_20px_60px_-40px_hsl(var(--primary)/0.35)] mb-10 break-inside-avoid">
    <header className="flex items-center justify-between gap-4 px-6 md:px-10 pt-6 pb-4 border-b border-border">
      <div className="flex items-center gap-3">
        <img src={logoAsset.url} onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logo-dimac.png"; }} alt="DIMAC" className="h-10 w-10 object-contain" />
        <span className="hidden sm:block h-px w-8 bg-accent" aria-hidden="true" />
      </div>
      <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        <span>Woningscan / Quickscan</span>
        <span className="tabular-nums">{String(n).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
      </div>
    </header>
    <div className="px-6 md:px-10 py-8 md:py-10">{children}</div>
    <footer className="flex items-center justify-between px-6 md:px-10 py-4 border-t border-border text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
      <span>Bouwkundige expertise voor een zekere woning</span>
      <span className="tabular-nums">{reportNumber}</span>
    </footer>
  </section>
);

export const Report23 = ({ report, reportNumber }: { report: QuickscanReport23; reportNumber: string }) => {
  const modern = report.reportVersion === "qs-report-2.3.4";
  report = presentReport234(report);
  const v = report.v23;
  // 2.3.2-extensie is optioneel: oudere snapshots (2.3, 2.3.1) tonen exact hun opgeslagen v23-inhoud.
  const x = (report as { v232?: ReportV232 }).v232;
  // 2.3.3-extensie is optioneel en additief: snapshots zonder v233 volgen exact het 2.3.2-pad.
  const x3 = (report as { v233?: ReportV233 }).v233;
  // 2.3.4-extensie is optioneel en additief: snapshots zonder v234 tonen geen premiesectie.
  const x4 = (report as { v234?: ReportV234 }).v234;
  const actionList = x ? x.actions.technical : v.actions;
  const docList: { id: string; label: string; status: string; statusLabel: string; contentLabel?: string | null; note: string | null }[] = x3 ? x3.documents : x ? x.documents : v.documents;
  // 2.3.3: persoonlijke conclusie; oudere rapporten tonen hun opgeslagen conclusie ongewijzigd.
  const conclusion = x3?.conclusion ?? v.conclusion;
  const rec = v.recommendation;
  const recRef = useRef<HTMLDivElement>(null);
  const payload = { item_id: rec.productId ?? "none", reason_code: rec.reasonCode };

  useEffect(() => {
    track("quickscan_recommendation_shown", payload);
    const el = recRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { track("quickscan_recommendation_view", payload); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rec.reasonCode]);

  const total = 3;
  const ctaTo = rec.ctaPath ? withReportRef(rec.ctaPath, reportNumber) : null;

  return (
    <div className={modern ? "report234" : undefined}>
      {report.safety.length > 0 && (
        <div className="mb-10">
          <Eyebrow>Veiligheid eerst</Eyebrow>
          <div className="mt-3"><SafetyAlerts ids={report.safety.map((s) => s.id as SafetyId)} items={report.safety} /></div>
        </div>
      )}

      {/* 01 — Cover en samenvatting */}
      <Page n={1} total={total} reportNumber={reportNumber}>
        <div className="grid md:grid-cols-[1.05fr_1fr] gap-8 items-end">
          <div>
            <Eyebrow>Persoonlijk woningrapport</Eyebrow>
            <h2 className="mt-4 font-display text-5xl md:text-6xl leading-[0.98] tracking-tight text-primary">Uw woning<br />in beeld.</h2>
            {v.facts.length > 0 && <p className="mt-5 text-sm text-primary/80">{v.facts.map((f) => f.value).join(" · ")}</p>}
            <p className="mt-5 text-primary/85 leading-relaxed max-w-md">Een heldere eerste analyse van uw {report.apartment ? "appartement" : "woning"}, op basis van uw eigen antwoorden in de DIMAC Quickscan.</p>
          </div>
          <figure className="text-primary/70">
            {modern ? <div className="report234-art"><img src={buildingAsset.url} alt="DIMAC architectuurtekening van een gebouw" /><img src={houseAsset.url} alt="DIMAC architectuurtekening van een woning" /></div> : <>
            <Art shapes={ILLUSTRATIONS[v.illustration]} viewBox="0 0 220 150" className="w-full h-auto" strokeScale={1} />
            <figcaption className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Illustratie, geen weergave van uw woning</figcaption></>}
          </figure>
        </div>

        {modern && <p className="report234-motto">Vastgoed ontwikkelen. Expertise delen. <span className="text-accent">Waarde creëren.</span></p>}
        <div className="mt-10 bg-surface border border-border p-6 md:p-8">
          <Eyebrow>Uw renovatiebarometer</Eyebrow>
          <div className="mt-4"><Barometer level={report.level} label={report.category.label} text={report.category.text} showGeneralNote={!modern} /></div>
        </div>

        {v.highlights.length > 0 && (
          <div className="mt-10">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-display text-2xl text-primary">Dit verdient uw aandacht</h3>
              <span className="hidden sm:block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Op basis van uw antwoorden</span>
            </div>
            <ol className={cn("mt-5 grid gap-4", v.highlights.length === 3 ? "sm:grid-cols-3" : v.highlights.length === 2 ? "sm:grid-cols-2" : "grid-cols-1")}>
              {v.highlights.map((h, i) => (
                <li key={h.id} className={cn("border p-5 flex flex-col", h.safety ? "border-destructive/50" : "border-border")}>
                  <div className="flex items-start gap-3">
                    <Icon id={h.icon} className="h-9 w-9 text-accent shrink-0" />
                    <div>
                      <span className="font-display text-xl text-accent tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                      <p className="font-medium text-primary leading-snug">{h.title}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-primary/80 leading-relaxed flex-1">{h.short}</p>
                  <span className="mt-4 h-0.5 w-8 bg-accent" aria-hidden="true" />
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="mt-10 border-l-2 border-accent pl-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Eerste conclusie</p>
          <p className="mt-2 font-display text-xl md:text-2xl leading-snug text-primary">{conclusion}</p>
        </div>
      </Page>

      {/* 02 — Analyse */}
      <Page n={2} total={total} reportNumber={reportNumber}>
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-6 items-end">
          <div>
            <Eyebrow>Analyse per bouwdeel</Eyebrow>
            <h2 className="mt-3 font-display text-4xl md:text-5xl leading-tight text-primary">De resultaten in detail.</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{modern ? "Per bouwdeel ziet u de gemelde signalen, ontbrekende informatie en aandachtspunten." : "Op basis van uw antwoorden geven we per thema een eerste inschatting. Dit is een indicatie en geen technische diagnose. Een lage score bewijst niet dat een onderdeel in orde is."}</p>
        </div>
        <ul className="mt-8 space-y-3">
          {v.domains.map((d) => (
            <li key={d.code} className="border border-border p-5 grid grid-cols-[2.5rem_1fr] sm:grid-cols-[2.5rem_1fr_auto] gap-x-4 gap-y-2 items-start">
              <Icon id={d.icon} className="h-9 w-9 text-accent" />
              <div>
                <p className="font-medium text-primary">{d.title}</p>
                <p className="mt-1 text-sm text-primary/80 leading-relaxed">{d.analysis}</p>
                {d.missing && <p className="mt-1 text-xs text-muted-foreground">{d.missing}</p>}
                {d.scopeNote && <p className="mt-1 text-xs text-muted-foreground">{d.scopeNote}</p>}
              </div>
              <div className="col-start-2 sm:col-start-3 sm:pt-1"><StatusMark status={d.status} label={d.statusLabel} /></div>
            </li>
          ))}
        </ul>

        {v.connections.length > 0 && (
          <div className="mt-10 bg-surface border border-border p-6 md:p-8">
            <Eyebrow>Wat vertellen uw antwoorden samen?</Eyebrow>
            <h3 className="mt-3 font-display text-3xl text-primary">Verbanden die het verschil maken.</h3>
            <div className="mt-8 space-y-10">
              {v.connections.map((c) => (
                <div key={c.id} className="grid md:grid-cols-[1.1fr_1fr] gap-8 items-center">
                  <LinkDiagram nodes={c.nodes} />
                  <div>
                    <p className="font-medium text-primary">{c.title}</p>
                    <p className="mt-2 text-sm text-primary/85 leading-relaxed">{c.text}</p>
                    {!modern && <p className="mt-3 text-xs text-muted-foreground">Een mogelijk verband, geen bewezen oorzaak.</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {x && (
          <div className="mt-10 border border-border p-6 md:p-8">
            <Eyebrow>Energie en mogelijke verplichtingen</Eyebrow>
            <h3 className="mt-3 font-display text-3xl text-primary">{x.energy.title}</h3>
            <p className="mt-3 text-sm text-primary/85 leading-relaxed">{x.energy.text}</p>
            {x.energy.points.length > 0 && <ul className="mt-4 space-y-2">{x.energy.points.map((t) => <li key={t} className="flex gap-2 text-sm text-primary/80"><Icon id="leaf" className="h-5 w-5 shrink-0 text-accent" />{t}</li>)}</ul>}
            {x.legal.length > 0 && <div className="mt-8 space-y-5">
              {x.legal.map((l) => (
                <div key={l.id} className={cn("border-l-2 pl-4", l.level === "melding" ? "border-accent" : "border-border")}>
                  <p className="font-medium text-primary">{l.title}</p>
                  <p className="mt-1 text-sm text-primary/80 leading-relaxed">{l.text}</p>
                  {l.verify.length > 0 && <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-primary/75">{l.verify.map((t) => <li key={t}>{t}</li>)}</ul>}
                  <p className="mt-2 text-xs text-muted-foreground">Bron: {l.sources.map((src, i) => <span key={src.url}>{i > 0 && " · "}<a href={src.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{src.label}</a></span>)}</p>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">Informatieve context, geen individueel juridisch advies. Gecontroleerd op {new Date(x.legalVerifiedAt).toLocaleDateString("nl-BE")}.</p>
            </div>}
          </div>
        )}

        {x4 && (
          <div className="mt-10 border border-border p-6 md:p-8">
            <Eyebrow>Premies en financiering</Eyebrow>
            <h3 className="mt-3 font-display text-3xl text-primary">{x4.premiums.title}</h3>
            <p className="mt-3 text-sm text-primary/85 leading-relaxed">{x4.premiums.intro}</p>
            {x4.premiums.relevant.length > 0 && (
              <p className="mt-3 text-sm text-primary/80 leading-relaxed">
                Op basis van uw antwoorden kunnen onder meer deze werken in aanmerking komen: {x4.premiums.relevant.join(", ")}.
              </p>
            )}
            <p className="mt-3 text-sm text-primary/80">{x4.premiums.note}</p>
            <ul className="mt-4 space-y-1 text-sm">
              {x4.premiums.sources.map((source) => { const s = premiumLink234(source); return <li key={s.url} className="py-2"><a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary underline decoration-accent underline-offset-4 font-medium">{s.label}<ExternalLink className="h-3.5 w-3.5 shrink-0 text-accent" /></a><p className="mt-1 text-xs text-muted-foreground">{s.caption}</p></li>; })}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">{x4.premiums.closing}</p>
          </div>
        )}

        {(x3?.coverage || v.information?.topics.length || report.unknown.items.length > 0 || report.unknown.skipped?.length > 0) && (
          <div className="mt-10">
            <h3 className="font-display text-2xl text-primary">Wat weten we nog niet?</h3>
            <p className="mt-2 text-sm text-primary/80"><span className="font-medium">{x3?.coverage?.label ?? report.unknown.label}.</span> {v.information?.sentence ?? report.unknown.sentence}</p>
            {report.unknown.skipped?.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Overgeslagen: {report.unknown.skipped.map((s) => s.label).join("; ")}.</p>}
          </div>
        )}
        {(report.notices?.length ?? 0) > 0 && (
          <div className="mt-8 space-y-3">
            {report.notices.map((x) => <div key={x.id} className="border-l-2 border-border pl-4"><p className="text-sm font-medium text-primary">{x.title}</p><p className="mt-1 text-sm text-primary/80 leading-relaxed">{x.text}</p></div>)}
          </div>
        )}
        {report.apartment && (
          <div className="mt-10">
            <Eyebrow>Mede-eigendom</Eyebrow>
            <h3 className="mt-2 font-display text-3xl text-primary">Uw appartement en de VME</h3>
            {v.coOwnership ? <>
              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                {v.coOwnership.cards.map((card) => <div key={card.id} className="border border-border p-5">
                  <div className="flex items-center gap-3"><Icon id={card.icon} className="h-7 w-7 shrink-0 text-accent" /><h4 className="font-medium text-primary">{card.title}</h4></div>
                  <p className="mt-3 text-sm leading-relaxed text-primary/80">{card.text}</p>
                  {card.uncertain && <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><HelpCircle className="h-4 w-4" />Nog te verduidelijken</p>}
                </div>)}
              </div>
              {report.apartment.groups?.filter((g) => g.signals.length && g.title !== "Financiële onzekerheden").map((g) => <div key={g.title} className="mt-5 border-l-2 border-accent pl-4"><h4 className="font-medium text-primary">{g.title}</h4><ul className="mt-2 space-y-2 text-sm text-primary/80">{g.signals.map((t) => <li key={t}>{t}</li>)}</ul></div>)}
              <h4 className="mt-7 font-display text-2xl text-primary">Vragen voor de verkoper of syndicus</h4>
              <ol className="mt-4 list-decimal pl-5 space-y-3 text-sm leading-relaxed text-primary/80">{v.coOwnership.questions.map((q) => <li key={q}>{q}</li>)}</ol>
              <h4 className="mt-7 font-medium text-primary">Aankoopchecklist</h4>
              <ul className="mt-3 grid sm:grid-cols-2 gap-3">{v.coOwnership.checklist.map((item) => <li key={item} className="flex gap-2 text-sm text-primary/80"><Icon id="doc" className="h-5 w-5 shrink-0 text-accent" />{item}</li>)}</ul>
              <p className="mt-5 text-sm text-muted-foreground">Onbekende documenten zijn niet automatisch onbestaand. Gemeenschappelijke problemen tellen niet mee in de privatieve barometer; veiligheidsadvies blijft van toepassing.</p>
            </> : <div className="mt-4 space-y-5">
              {report.apartment.groups?.filter((g) => g.signals.length).map((g) => <div key={g.title}><p className="text-sm font-medium text-primary">{g.title}</p><ul className="mt-2 space-y-1 text-sm text-primary/80">{g.signals.map((t) => <li key={t}>{t}</li>)}</ul></div>)}
              <ul className="list-disc pl-5 space-y-2 text-sm text-primary/80">{report.apartment.syndic.map((q) => <li key={q}>{q}</li>)}</ul>
              <ul className="text-xs text-muted-foreground">{report.apartment.notes.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>}
          </div>
        )}
      </Page>

      {/* 03 — Advies en actieplan */}
      <Page n={3} total={total} reportNumber={reportNumber}>
        <div className="grid md:grid-cols-[1.3fr_1fr] gap-6 items-end">
          <div>
            <Eyebrow>Praktisch advies</Eyebrow>
            <h2 className="mt-3 font-display text-3xl md:text-4xl leading-tight text-primary">{v.adviceTitle}</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">Met deze acties verduidelijkt u de belangrijkste aandachtspunten en onzekerheden.</p>
        </div>
        {actionList.length > 0 ? (
          <ol className="mt-8 space-y-3">
            {actionList.map((x, i) => (
              <li key={x.id} className={cn("border p-5 grid grid-cols-[3rem_2.5rem_1fr] gap-4 items-start", x.id === "ACT-VEILIGHEID" ? "border-destructive/50" : "border-border")}>
                <span className="font-display text-3xl text-accent tabular-nums leading-none">{String(i + 1).padStart(2, "0")}</span>
                <Icon id={x.icon} className="h-9 w-9 text-primary/70" />
                <div>
                  <p className="font-medium text-primary">{x.title}</p>
                  <p className="mt-1 text-sm text-primary/80 leading-relaxed">{x.text}</p>
                  {x.next && <p className="mt-2 text-xs text-muted-foreground">Volgende stap: {x.next}</p>}
                </div>
              </li>
            ))}
          </ol>
        ) : <p className="mt-8 text-primary/80">Op basis van uw antwoorden zijn er geen specifieke acties nodig.</p>}


        {x && x.phases.length > 0 && (
          <div className="mt-10 border border-border p-6 md:p-8">
            <Eyebrow>Voorlopig digitaal advies</Eyebrow>
            <h3 className="mt-2 font-display text-3xl text-primary">Uw voorlopig renovatietraject</h3>
            <ol className="mt-6 space-y-6">
              {x.phases.map((ph) => (
                <li key={ph.id} className="grid grid-cols-[2.5rem_1fr] gap-4">
                  <span className="font-display text-3xl text-accent leading-none">{ph.id}</span>
                  <div>
                    <p className="font-medium text-primary">{ph.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{ph.why}</p>
                    <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-primary/80">{ph.items.map((t) => <li key={t}>{t}</li>)}</ul>
                    {ph.decide && <p className="mt-2 text-xs text-primary/70">Beslissing hangt af van: {ph.decide}</p>}
                  </div>
                </li>
              ))}
            </ol>
            {!modern && <p className="mt-5 text-xs text-muted-foreground">Dit traject is geen uitvoeringsbestek, technische keuring of kostenraming.</p>}
          </div>
        )}

        {x && x.actions.documents.length > 0 && (
          <div className="mt-10">
            <h3 className="font-display text-2xl text-primary">Documenten en verplichtingen nagaan</h3>
            <ul className="mt-4 space-y-3">{x.actions.documents.map((d) => <li key={d.id} className="border border-border p-4 grid grid-cols-[2rem_1fr] gap-3"><Icon id={d.icon} className="h-7 w-7 text-primary/70" /><div><p className="font-medium text-primary text-sm">{d.title}</p><p className="mt-1 text-sm text-primary/80 leading-relaxed">{d.text}</p></div></li>)}</ul>
          </div>
        )}
        {docList.length > 0 && (
          <div className="mt-10 bg-surface border border-border p-6 md:p-8">
            <Eyebrow>Handige documenten</Eyebrow>
            <h3 className="mt-2 font-display text-3xl text-primary">Documenten om op te vragen.</h3>
            <ul className="mt-6 grid sm:grid-cols-2 gap-x-8 gap-y-4">
              {docList.map((d) => {
                const I = DOC_ICON[d.status] ?? HelpCircle;
                return (
                  <li key={d.id} className="grid grid-cols-[1.5rem_1fr] gap-3">
                    <Icon id="doc" className="h-5 w-5 text-primary/60 mt-0.5" />
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm text-primary">{d.label}</span>
                        <span className={cn("inline-flex items-center gap-1 text-[11px] border px-2 py-0.5", d.status === "beschikbaar" ? "border-primary/30 text-primary" : "border-border text-muted-foreground")}><I className="h-3 w-3" aria-hidden="true" />{d.statusLabel}</span>
                        {d.contentLabel && <span className="text-[11px] text-muted-foreground">{d.contentLabel}</span>}
                      </div>
                      {d.note && <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{d.note}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-5 text-xs text-muted-foreground">Een onbekend document is niet automatisch afwezig.</p>
          </div>
        )}

        <div ref={recRef} className="mt-10 border border-border p-6 md:p-8 relative overflow-hidden">
          {!modern && <Art shapes={ILLUSTRATIONS[v.illustration]} viewBox="0 0 220 150" className="hidden md:block absolute -right-6 bottom-0 w-64 text-primary/15" />}
          <div className={cn("relative", !modern && "md:max-w-[68%]")}>
            <Eyebrow>Uw aanbevolen volgende stap</Eyebrow>
            {rec.safetyFirst && <p className="mt-3 text-sm text-destructive font-medium">Volg eerst het veiligheidsadvies bovenaan dit rapport. Een Woningscan vervangt geen onmiddellijke veiligheidsmaatregel.</p>}
            <h3 className="mt-3 font-display text-3xl md:text-4xl leading-tight text-primary">{rec.title}</h3>
            <p className="mt-4 text-primary/85 leading-relaxed">{rec.motivation}</p>
            {rec.gains && <p className="mt-3 text-sm text-primary/80">{rec.gains}</p>}
            {rec.benefits.length > 0 && (
              <ul className="mt-5 space-y-2">{rec.benefits.map((b) => <li key={b} className="flex gap-2 text-sm text-primary"><Check className="h-4 w-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />{b}</li>)}</ul>
            )}
            {rec.price !== null && (
              <p className="mt-6 flex flex-wrap items-baseline gap-x-3">
                <span className="font-display text-3xl text-primary tabular-nums">{formatEuro(rec.price)}</span>
                <span className="text-sm text-muted-foreground">{VAT_LABEL}</span>
                {rec.availability === "coming_soon" && <span className="text-xs uppercase tracking-[0.18em] border border-accent text-accent px-2 py-0.5">Binnenkort beschikbaar</span>}
              </p>
            )}
            {rec.drone && (
              <details className="mt-5 border-t border-border pt-4 group" onToggle={(e) => { if ((e.currentTarget as HTMLDetailsElement).open) track("quickscan_drone_info_view", payload); }}>
                <summary className="cursor-pointer text-sm text-primary font-medium">Optioneel: drone-dakscreening + {formatEuro(rec.drone.price)} {VAT_LABEL}</summary>
                <p className="mt-2 text-sm text-primary/80 leading-relaxed">{rec.drone.text}</p>
                <p className="mt-1 text-xs text-muted-foreground">{rec.drone.condition} De optie staat standaard uit; u kiest ze zelf in het aanvraagformulier.</p>
              </details>
            )}
            <div className="mt-6 flex flex-wrap gap-3 no-print">
              {ctaTo ? (
                <Button asChild size="lg"><Link to={ctaTo} onClick={() => track("quickscan_recommendation_cta_click", payload)}>{rec.ctaLabel} <ArrowRight /></Link></Button>
              ) : rec.productId ? (
                <Button size="lg" disabled aria-disabled="true">{rec.ctaLabel}</Button>
              ) : null}
              <Button asChild variant="outline" size="lg"><Link to={rec.infoPath} onClick={() => track("quickscan_recommendation_compare_click", payload)}>{rec.infoLabel}</Link></Button>
            </div>
            {rec.secondary && (
              <p className="mt-5 text-sm text-muted-foreground">
                {rec.secondary.text}{" "}
                <Link className="underline underline-offset-4 text-primary" to={withReportRef(rec.secondary.path, reportNumber)} onClick={() => track("quickscan_recommendation_secondary_click", { item_id: rec.secondary?.productId, reason_code: rec.reasonCode })}>{rec.secondary.name} ({formatEuro(rec.secondary.price)})</Link>
              </p>
            )}
            {rec.limitation && <p className="mt-4 text-xs text-muted-foreground">{modern ? recommendationScope234(rec.limitation) : rec.limitation}</p>}
            {rec.price !== null && <p className="mt-1 text-xs text-muted-foreground">{rec.priceNote}</p>}
          </div>
        </div>

        <div className="mt-10">
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{modern ? REPORT_INFORMATION_TITLE : "Grenzen van de Quickscan"}</p>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{report.limits}</p>
        </div>
      </Page>
    </div>
  );
};

/** Verbandendiagram: twee knopen naast elkaar, drie in een driehoek, met gestippelde verbindingen. */
const LinkDiagram = ({ nodes }: { nodes: { icon: IconId; label: string; caption: string }[] }) => {
  const pos = nodes.length === 3 ? [[50, 14], [16, 70], [84, 70]] : [[22, 40], [78, 40]];
  return (
    <div className="relative aspect-[5/4] w-full max-w-sm mx-auto text-accent">
      <svg viewBox="0 0 100 80" className="absolute inset-0 w-full h-full" fill="none" aria-hidden="true">
        {pos.map((p, i) => {
          const q = pos[(i + 1) % pos.length];
          if (nodes.length === 2 && i === 1) return null;
          return <line key={i} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke="currentColor" strokeWidth="0.4" strokeDasharray="1.5 1.5" />;
        })}
      </svg>
      {nodes.map((n, i) => (
        <div key={n.label} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center w-28" style={{ left: `${pos[i][0]}%`, top: `${(pos[i][1] / 80) * 100}%` }}>
          <span className="h-14 w-14 rounded-full border border-accent bg-background flex items-center justify-center"><Icon id={n.icon} className="h-7 w-7 text-accent" /></span>
          <span className="mt-2 text-sm font-medium text-primary">{n.label}</span>
          <span className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{n.caption}</span>
        </div>
      ))}
    </div>
  );
};
