import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Download, Printer, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageSEO } from "@/components/seo/PageSEO";
import { TextField } from "@/components/site/FormFields";
import { Barometer, ReportView, SafetyAlerts } from "@/components/quickscan/ReportView";
import { Report23 } from "@/components/quickscan/Report23";
import type { QuickscanReport23 } from "@/lib/quickscanReport";
import {
  activeAnswers, buildReport, questionText, safetyFlags, stepTitle, visibleQuestions, SKIP, STEP_TITLES,
  type Answers, type Question, type QuickscanReport,
} from "@/lib/quickscan";
import { buildReportPdf, downloadBlob, type ReportMeta } from "@/lib/quickscanPdf";
import { readSaved, SESSION_KEY as KEY, type Saved, type Stage } from "@/lib/quickscanSession";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
/** Antwoorden die niet meer geldig zijn vervallen en worden opnieuw gevraagd. */
const load = (): Saved | null => {
  const s = readSaved(sessionStorage);
  if (!s) return null;
  const answers = activeAnswers(s.answers ?? {});
  const vis = visibleQuestions(answers);
  const firstOpen = vis.findIndex((q) => answers[q.id] === undefined);
  if (firstOpen >= 0 && s.stage !== "intro") return { ...s, answers, stage: "questions", index: firstOpen };
  return { ...s, answers, index: Math.min(s.index ?? 0, Math.max(vis.length - 1, 0)) };
};

const BENEFITS = [
  { t: "Inzicht in uw woning", d: "Een eerste indicatie van mogelijke renovatieaandachtspunten." },
  { t: "Persoonlijke renovatiebarometer", d: "Een helder overzicht van de signalen die u zelf aangeeft." },
  { t: "Praktische aanbevelingen", d: "Welke onderdelen verdienen verdere beoordeling en welke renovaties bekijkt u best samen?" },
];

export default function Quickscan() {
  const saved = useRef(load()).current;
  const [stage, setStage] = useState<Stage>(saved?.stage === "report" ? "intro" : saved?.stage ?? "intro");
  const [answers, setAnswers] = useState<Answers>(saved?.answers ?? {});
  const [index, setIndex] = useState(saved?.index ?? 0);
  const [startedAt, setStartedAt] = useState(saved?.startedAt ?? 0);
  const [catchUp, setCatchUp] = useState(false);
  const [curId, setCurId] = useState<string | null>(null);
  const [final, setFinal] = useState<{ report: QuickscanReport; meta: ReportMeta } | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Een niet-convergerende vragenlogica faalt expliciet; er wordt dan nooit een rapport opgemaakt.
  const resolved = useMemo(() => {
    try { const act = activeAnswers(answers); return { active: act, visible: visibleQuestions(act), error: false }; }
    catch { return { active: {} as Answers, visible: [] as Question[], error: true }; }
  }, [answers]);
  const active = resolved.active;
  const visible = resolved.visible;
  const flags = useMemo(() => safetyFlags(active), [active]);
  // De huidige vraag volgt haar ID: als een antwoord eerdere vragen activeert, verspringt het scherm niet.
  const byId = curId ? visible.findIndex((x) => x.id === curId) : -1;
  const qPos = byId >= 0 ? byId : Math.min(index, visible.length - 1);
  const q: Question | undefined = visible[qPos];
  const go = (list: Question[], i: number) => { setIndex(i); setCurId(list[i]?.id ?? null); };

  useEffect(() => { track("quickscan_view", { page_type: "quickscan" }); }, []);
  useEffect(() => {
    if (stage === "report") { sessionStorage.removeItem(KEY); return; }
    sessionStorage.setItem(KEY, JSON.stringify({ stage, answers: active, index, startedAt }));
  }, [stage, active, index, startedAt]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [stage, index, curId]);

  const start = () => { setStage("questions"); setIndex(0); setCurId(null); setStartedAt(Date.now()); track("quickscan_start"); };
  const restart = () => { sessionStorage.removeItem(KEY); setAnswers({}); setIndex(0); setCurId(null); setCatchUp(false); setFinal(null); setStage("intro"); };

  const select = (opt: string) => {
    if (!q) return;
    if (!q.multi) { setAnswers({ ...active, [q.id]: opt }); return; }
    const cur = Array.isArray(active[q.id]) ? (active[q.id] as string[]) : [];
    const isExcl = q.options.find((o) => o.id === opt)?.exclusive;
    let next: string[];
    if (cur.includes(opt)) next = cur.filter((x) => x !== opt);
    else if (isExcl) next = [opt];
    else next = [...cur.filter((x) => !q.options.find((o) => o.id === x)?.exclusive), opt];
    const copy = { ...active };
    if (next.length) copy[q.id] = next; else delete copy[q.id];
    setAnswers(copy);
  };

  const skip = () => {
    if (!q || !q.optional || q.safety) return;
    const withSkip = { ...active, [q.id]: SKIP };
    setAnswers(withSkip);
    advance(withSkip);
  };

  const next = () => advance(active);
  const advance = (cur: Answers) => {
    if (!q) return;
    const after = visibleQuestions(activeAnswers(cur));
    const pos = after.findIndex((x) => x.id === q.id);
    const open = (from: number) => after.findIndex((x, i) => i >= from && cur[x.id] === undefined);
    // Eerst de huidige stroom afmaken; daarna pas eerder in de lijst nieuw geactiveerde vragen tonen.
    if (catchUp) {
      const n = open(0);
      if (n >= 0) { go(after, n); return; }
      setCatchUp(false); setStage("preview"); track("quickscan_result_preview"); return;
    }
    if (after[pos + 1] && after[pos + 1].step !== q.step) track("quickscan_step_complete", { item_id: String(q.step) });
    if (pos + 1 < after.length) { go(after, pos + 1); return; }
    const missing = open(0);
    if (missing >= 0) { setCatchUp(true); go(after, missing); return; }
    setStage("preview"); track("quickscan_result_preview");
  };

  const preview = useMemo(() => (stage === "preview" || stage === "form" ? buildReport(active) : null), [stage, active]);

  return (
    <div ref={topRef} className="scroll-mt-24">
      <PageSEO
        title="Gratis Renovatiecheck & Quickscan | DIMAC"
        description="Hoe staat uw woning ervoor? Ontdek met de gratis DIMAC Quickscan mogelijke renovatieaandachtspunten en ontvang uw persoonlijk woningrapport."
        path="/woningscan/quickscan"
        robots={stage === "intro" ? undefined : "noindex, nofollow"}
      />
      {stage === "intro" && <Intro onStart={start} resume={saved && saved.stage !== "intro" && Object.keys(saved.answers).length ? () => setStage(saved.stage) : undefined} />}

      {resolved.error && stage !== "intro" && (
        <section className="py-16 bg-background"><div className="container-tight max-w-3xl"><p role="alert" className="text-destructive">Uw antwoorden konden niet consistent verwerkt worden. Start de Quickscan opnieuw.</p><Button className="mt-6" onClick={() => restart()}>Opnieuw beginnen</Button></div></section>
      )}
      {stage === "questions" && q && (
        <section className="py-12 md:py-20 bg-background min-h-[70vh]">
          <div className="container-tight max-w-3xl">
            <StepBar step={q.step} />
            {catchUp && <p role="status" className="mt-6 border-l-2 border-accent pl-4 text-sm text-primary/85">Door uw latere antwoorden zijn enkele eerdere vragen nu relevant. Beantwoord ze nog, daarna ziet u uw resultaat.</p>}
            <p className="mt-10 text-xs uppercase tracking-[0.24em] text-accent">Stap {q.step} van 4 — {stepTitle(q.step, active)}</p>
            <h1 className="mt-3 font-display text-3xl md:text-4xl leading-tight text-primary">{questionText(q, active)}</h1>
            {q.help && <p className="mt-3 text-sm text-muted-foreground">{q.help}</p>}
            <div className="mt-8 grid gap-3 sm:grid-cols-2" role={q.multi ? "group" : "radiogroup"} aria-label={questionText(q, active)}>
              {q.options.map((o) => {
                const v = active[q.id];
                const on = Array.isArray(v) ? v.includes(o.id) : v === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    role={q.multi ? "checkbox" : "radio"}
                    aria-checked={on}
                    onClick={() => select(o.id)}
                    className={cn(
                      "min-h-[56px] text-left px-5 py-4 border transition-colors duration-200 flex items-center justify-between gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                      on ? "border-accent bg-accent-soft/40 text-primary" : "border-border bg-background hover:border-primary/40 text-primary/90",
                    )}
                  >
                    <span>{o.label}</span>
                    {on && <Check className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
            {flags.length > 0 && <div className="mt-8"><SafetyAlerts ids={flags} /></div>}
            <div className="mt-10 flex items-center justify-between gap-2">
              <Button type="button" variant="ghost" className="px-2 sm:px-4" onClick={() => { setCatchUp(false); if (qPos <= 0) setStage("intro"); else go(visible, qPos - 1); }}>
                <ArrowLeft /> Vorige
              </Button>
              <div className="flex items-center gap-2">
                {q.optional && !q.safety && (
                  <Button type="button" variant="outline" className="px-3 sm:px-4" onClick={skip}>Overslaan</Button>
                )}
                <Button type="button" className="px-3 sm:px-4" onClick={next} disabled={active[q.id] === undefined || active[q.id] === SKIP}>
                  Volgende <ArrowRight />
                </Button>
              </div>
            </div>
            {q.optional && !q.safety && <p className="mt-3 text-xs text-muted-foreground text-right">Optionele vraag. Overslaan telt als ontbrekende informatie.</p>}
            <p className="mt-8 text-xs text-muted-foreground">Het aantal vragen past zich aan uw antwoorden aan.</p>
          </div>
        </section>
      )}

      {stage === "preview" && preview && (
        <section className="py-16 md:py-24 bg-background">
          <div className="container-tight max-w-3xl">
            <span className="eyebrow mb-5">Gratis DIMAC Quickscan</span>
            <h1 className="font-display text-4xl md:text-5xl leading-tight text-primary">Uw eerste resultaten zijn klaar.</h1>
            {flags.length > 0 && <div className="mt-8"><SafetyAlerts ids={flags} /></div>}
            <div className="mt-10 border border-border p-6 md:p-8">
              <Barometer level={preview.level} label={preview.category.label} text={preview.category.text} />
            </div>
            <div className="mt-6 border-l-2 border-accent pl-5">
              <p className="font-medium text-primary">{preview.preview.headline}</p>
              <p className="mt-1 text-sm text-muted-foreground">{preview.preview.nuance}</p>
            </div>
            <p className="mt-8 text-primary/85 leading-relaxed">
              Uw volledige woninganalyse bevat een overzicht van de relevante aandachtspunten, ontbrekende informatie en praktische renovatieaanbevelingen.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => { setStage("form"); track("quickscan_lead_form_view"); }}>Ontvang mijn volledige gratis rapport <ArrowRight /></Button>
              <Button variant="ghost" onClick={() => { setStage("questions"); go(visible, visible.length - 1); }}><ArrowLeft /> Antwoorden aanpassen</Button>
            </div>
          </div>
        </section>
      )}

      {stage === "form" && (
        <LeadForm answers={active} startedAt={startedAt} onBack={() => setStage("preview")}
          onDone={(report, meta) => { setFinal({ report, meta }); setStage("report"); track("quickscan_report_view"); }} />
      )}

      {stage === "report" && final && <FinalReport {...final} onRestart={restart} />}
    </div>
  );
}

const StepBar = ({ step }: { step: number }) => (
  <ol className="grid grid-cols-4 gap-2" aria-label="Voortgang">
    {STEP_TITLES.map((t, i) => (
      <li key={t} aria-current={step === i + 1 ? "step" : undefined}>
        <div className={cn("h-1", i + 1 <= step ? "bg-accent" : "bg-border")} />
        <p className={cn("mt-2 text-[11px] hidden sm:block", i + 1 === step ? "text-primary" : "text-muted-foreground")}>{t}</p>
      </li>
    ))}
  </ol>
);

const Intro = ({ onStart, resume }: { onStart: () => void; resume?: () => void }) => (
  <>
    <section className="pt-16 pb-16 md:pt-28 md:pb-24 bg-background">
      <div className="container-tight max-w-4xl">
        <span className="eyebrow mb-6">Gratis DIMAC Quickscan</span>
        <h1 className="font-display text-5xl md:text-7xl leading-[1.02] tracking-tight text-primary">Hoe staat uw woning ervoor?</h1>
        <p className="mt-6 font-display text-2xl md:text-3xl text-primary/80">Ontdek welke onderdelen van uw woning extra aandacht verdienen.</p>
        <div className="mt-8 space-y-4 text-lg text-muted-foreground leading-relaxed max-w-2xl">
          <p>Een woning kopen of renoveren? Niet elk aandachtspunt is meteen zichtbaar en niet elke veroudering betekent dat iets vervangen moet worden.</p>
          <p>Beantwoord enkele gerichte vragen over uw woning en ontdek waar mogelijke renovatieprioriteiten liggen.</p>
          <p>U ontvangt een persoonlijke renovatiebarometer en praktische aanbevelingen, afgestemd op uw antwoorden.</p>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button size="lg" onClick={onStart}>Start mijn gratis Quickscan <ArrowRight /></Button>
          {resume && <Button size="lg" variant="outline" onClick={resume}>Verder waar ik was</Button>}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Gratis · Circa 5 minuten · Persoonlijk rapport</p>
        <p className="mt-2 text-xs text-muted-foreground">Voor het volledige rapport vragen we na de vragenlijst uw naam, e-mailadres en gemeente. De invultijd is indicatief.</p>
      </div>
    </section>
    <section className="py-16 md:py-24 bg-surface border-y border-border">
      <div className="container-tight grid gap-8 md:grid-cols-3">
        {BENEFITS.map((b) => (
          <div key={b.t} className="border-t border-accent pt-6">
            <h2 className="font-display text-2xl text-primary">{b.t}</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">{b.d}</p>
          </div>
        ))}
      </div>
    </section>
    <section className="py-16 md:py-20 bg-background">
      <div className="container-tight max-w-3xl space-y-4 text-muted-foreground leading-relaxed">
        <p className="text-primary">De Quickscan is een eerste analyse op basis van uw antwoorden en vervangt geen inspectie ter plaatse.</p>
        <p>Vanuit Diest actief in Limburg en Vlaams-Brabant. Wilt u meteen een inspectie ter plaatse? <Link to="/woningscan#pakketten" className="text-accent underline underline-offset-2">Bekijk Woningscan en Woningscan Plus</Link>.</p>
      </div>
    </section>
  </>
);

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quickscan-submit`;

const LeadForm = ({ answers, startedAt, onBack, onDone }: { answers: Answers; startedAt: number; onBack: () => void; onDone: (r: QuickscanReport, m: ReportMeta) => void }) => {
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", municipality: "", phone: "", website: "" });
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setErr(null); track("quickscan_lead_submit_attempt");
    try {
      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ ...f, answers, marketingConsent: consent, startedAt }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) { setErr(data.error ?? "Er ging iets mis. Probeer het later opnieuw."); return; }
      track("quickscan_lead_saved"); track("quickscan_report_generated");
      onDone(data.report, data.report.meta);
    } catch {
      setErr("Er kon geen verbinding gemaakt worden. Controleer uw internetverbinding en probeer opnieuw.");
    } finally { setBusy(false); }
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container-tight max-w-2xl">
        <span className="eyebrow mb-5">Uw persoonlijke woninganalyse is klaar.</span>
        <h1 className="font-display text-4xl md:text-5xl leading-tight text-primary">Ontvang uw persoonlijk woningrapport</h1>
        <p className="mt-5 text-muted-foreground leading-relaxed">Vul uw gegevens in en bekijk meteen uw volledige gratis DIMAC Quickscan-rapport online. U kunt het rapport ook als PDF downloaden.</p>
        <form onSubmit={submit} className="mt-10 grid gap-5 sm:grid-cols-2" noValidate={false}>
          <TextField id="firstName" label="Voornaam" required autoComplete="given-name" value={f.firstName} onChange={set("firstName")} />
          <TextField id="lastName" label="Achternaam" required autoComplete="family-name" value={f.lastName} onChange={set("lastName")} />
          <TextField id="email" type="email" label="E-mailadres" required autoComplete="email" value={f.email} onChange={set("email")} className="sm:col-span-2" />
          <TextField id="municipality" label="Gemeente of postcode van de woning" required value={f.municipality} onChange={set("municipality")} />
          <TextField id="phone" type="tel" label="Telefoonnummer" hint="Optioneel" autoComplete="tel" value={f.phone} onChange={set("phone")} />
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set("website")(e.target.value)} />
          </div>
          <p className="sm:col-span-2 text-sm text-muted-foreground leading-relaxed">
            We gebruiken uw gegevens om uw persoonlijke rapport op te maken, te bezorgen en uw aanvraag administratief te verwerken. Meer informatie vindt u in ons{" "}
            <Link to="/privacy" className="text-accent underline underline-offset-2">privacybeleid</Link>.
          </p>
          <label className="sm:col-span-2 flex items-start gap-3 text-sm text-muted-foreground leading-relaxed cursor-pointer">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-[hsl(var(--accent))] shrink-0" />
            <span>Ja, DIMAC mag mij vrijblijvend contacteren per e-mail of telefoon over mijn renovatieplannen en passende dienstverlening. Dit is niet nodig om uw rapport te ontvangen.</span>
          </label>
          {err && <p role="alert" className="sm:col-span-2 text-sm text-destructive">{err}</p>}
          <div className="sm:col-span-2 flex flex-wrap gap-3">
            <Button type="submit" size="lg" disabled={busy}>{busy ? "Rapport wordt opgemaakt…" : "Toon mijn volledige rapport"} {!busy && <ArrowRight />}</Button>
            <Button type="button" variant="ghost" onClick={onBack}><ArrowLeft /> Terug</Button>
          </div>
        </form>
      </div>
    </section>
  );
};

const FinalReport = ({ report, meta, onRestart }: { report: QuickscanReport; meta: ReportMeta; onRestart: () => void }) => {
  const download = () => {
    void buildReportPdf(report, meta).then((b) => downloadBlob(b, `DIMAC-Quickscan-${meta.reportNumber}.pdf`));
    track("quickscan_report_download");
  };
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className={cn("container-tight", "v23" in report ? "max-w-5xl" : "max-w-3xl")}>
        <p className="mb-5 text-xs uppercase tracking-[0.24em] text-accent">DIMAC Quickscan · Rapport {meta.reportNumber}</p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight text-primary">Uw persoonlijke woninganalyse</h1>
        <p className="mt-4 text-muted-foreground">{meta.name} · {meta.municipality} · {new Date(meta.date).toLocaleDateString("nl-BE")}</p>
        <div className="mt-8 flex flex-wrap gap-3 no-print">
          <Button onClick={download}><Download /> Rapport downloaden</Button>
          <Button variant="outline" onClick={() => window.print()}><Printer /> Rapport printen</Button>
          <Button variant="ghost" onClick={onRestart}><RotateCcw /> Nieuwe Quickscan</Button>
        </div>
        <div className="mt-10">
          {"v23" in report && (report as QuickscanReport23).v23 ? <Report23 report={report as QuickscanReport23} reportNumber={meta.reportNumber} /> : <ReportView report={report} />}
        </div>
      </div>
    </section>
  );
};
