import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES, SAFETY_TEXT, type QuickscanReport, type SafetyId } from "@/lib/quickscan";
import { formatEuro, getPackage, DRONE_OPTION } from "@/data/woningscan";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export const Barometer = ({ level, label, text }: { level: number | null; label: string; text: string }) => (
  <div>
    <div className="grid grid-cols-4 gap-1" role="img" aria-label={`Renovatiebarometer: ${label}`}>
      {CATEGORIES.map((c, i) => (
        <div key={c.id}>
          <div className={cn("h-2", level === i ? "bg-accent" : "bg-border")} />
          <p className={cn("mt-2 text-[11px] leading-tight", level === i ? "text-primary font-medium" : "text-muted-foreground")}>{c.label}</p>
        </div>
      ))}
    </div>
    <p className="mt-6 font-display text-2xl md:text-3xl text-primary">{label}</p>
    <p className="mt-2 text-muted-foreground leading-relaxed">{text}</p>
    <p className="mt-2 text-xs text-muted-foreground">De barometer geeft de signalen weer die u zelf opgeeft, niet een bewezen renovatienoodzaak.</p>
  </div>
);

export const SafetyAlerts = ({ ids }: { ids: SafetyId[] }) =>
  ids.length ? (
    <div className="space-y-3" role="alert">
      {ids.map((id) => (
        <div key={id} className="border border-destructive/40 bg-destructive/5 p-5 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-medium text-primary">{SAFETY_TEXT[id].title}</p>
            <p className="mt-1 text-sm text-primary/85 leading-relaxed">{SAFETY_TEXT[id].text}</p>
          </div>
        </div>
      ))}
    </div>
  ) : null;

const Chapter = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <section className="py-10 border-t border-border break-inside-avoid">
    <p className="text-xs uppercase tracking-[0.24em] text-accent">Hoofdstuk {n}</p>
    <h2 className="mt-2 font-display text-2xl md:text-3xl text-primary">{title}</h2>
    <div className="mt-6">{children}</div>
  </section>
);

export const ReportView = ({ report }: { report: QuickscanReport }) => {
  const pkg = getPackage(report.packageAdvice.pkg)!;
  const other = getPackage(report.packageAdvice.pkg === "basis" ? "compleet" : "basis")!;
  return (
    <div>
      {report.safety.length > 0 && <div className="mb-10"><SafetyAlerts ids={report.safety.map((s) => s.id as SafetyId)} /></div>}
      <Chapter n={1} title="Uw woningprofiel">
        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
          {report.profile.map((p) => (
            <div key={p.label}><dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{p.label}</dt><dd className="mt-1 text-primary">{p.value}</dd></div>
          ))}
        </dl>
      </Chapter>
      <Chapter n={2} title="Uw renovatiebarometer">
        <Barometer level={report.level} label={report.category.label} text={report.category.text} />
      </Chapter>
      <Chapter n={3} title="Uw belangrijkste aandachtspunten">
        {report.points.length ? (
          <ol className="space-y-6">
            {report.points.map((p, i) => (
              <li key={p.id} className="grid grid-cols-[2rem_1fr] gap-3">
                <span className="font-display text-xl text-accent">{i + 1}</span>
                <div>
                  <p className="font-medium text-primary">{p.title}</p>
                  <p className="mt-1 text-primary/85 leading-relaxed">{p.text}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Volgende stap: {p.next}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : <p className="text-primary/85">Er zijn op basis van uw antwoorden geen uitgesproken aandachtspunten gemeld.</p>}
      </Chapter>
      <Chapter n={4} title="Wat weten we nog niet?">
        <p className="font-medium text-primary">{report.unknown.label}</p>
        <p className="mt-1 text-primary/85">{report.unknown.text}</p>
        {report.unknown.sentence && <p className="mt-3 text-primary/85 leading-relaxed">{report.unknown.sentence}</p>}
      </Chapter>
      {report.combinations.length > 0 && (
        <Chapter n={5} title="Renovaties slim combineren">
          <ul className="space-y-4">
            {report.combinations.map((c) => (<li key={c.id}><p className="font-medium text-primary">{c.title}</p><p className="mt-1 text-primary/85">{c.text}</p></li>))}
          </ul>
        </Chapter>
      )}
      <Chapter n={6} title="Samenvatting"><p className="text-primary/85 leading-relaxed">{report.summary}</p></Chapter>
      <Chapter n={7} title="Een mogelijke volgende stap">
        <div className="border border-border bg-surface p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-accent">Vrijblijvend advies</p>
          <p className="mt-2 font-display text-2xl text-primary">Woningscan {pkg.name} · {formatEuro(pkg.price)} <span className="text-sm text-muted-foreground font-sans">incl. btw</span></p>
          <p className="mt-3 text-primary/85 leading-relaxed">{report.packageAdvice.text}</p>
          {report.packageAdvice.doubt && report.packageAdvice.pkg === "basis" && (
            <p className="mt-3 text-sm text-muted-foreground">Compleet ({formatEuro(other.price)}) is relevant wanneer u ook een renovatieplanning en een indicatie van de kosten wenst.</p>
          )}
          {report.droneText && <p className="mt-3 text-sm text-muted-foreground">{report.droneText} Optioneel: + {formatEuro(DRONE_OPTION.price)} incl. btw.</p>}
          <div className="mt-6 flex flex-wrap gap-3 no-print">
            <Button asChild>
              <Link to={`/woningscan?pakket=${pkg.id}#pakketten`} onClick={() => track("quickscan_paid_scan_click", { item_id: pkg.id })}>Bekijk Woningscan {pkg.name} <ArrowRight /></Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/woningscan?pakket=${other.id}#pakketten`} onClick={() => track("quickscan_paid_scan_click", { item_id: other.id })}>Bekijk {other.name}</Link>
            </Button>
          </div>
        </div>
      </Chapter>
      <Chapter n={8} title="Grenzen van de Quickscan"><p className="text-sm text-muted-foreground leading-relaxed">{report.limits}</p></Chapter>
    </div>
  );
};
