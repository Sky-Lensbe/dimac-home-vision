import { FormEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowRight, Check, Home, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/Section";
import { FAQ } from "@/components/site/FAQ";
import { PageHero } from "@/components/site/PageHero";
import { ImagePlaceholder } from "@/components/site/ImagePlaceholder";
import {
  ConsentField,
  HandoffMessage,
  MailtoNotice,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/site/FormFields";
import { PageSEO } from "@/components/seo/PageSEO";
import { breadcrumbSchema, faqSchema, organizationSchema, absoluteUrl } from "@/lib/site";
import {
  DRONE_OPTION,
  SCAN_PACKAGES,
  formatEuro,
  getPackage,
  scanTotal,
  type PackageId,
} from "@/data/woningscan";
import { buildMailto, openMailto } from "@/lib/mailto";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import prep from "@/assets/preparation.jpg";

type Situation = "kopen" | "renoveren";

const SITUATIONS: Record<Situation, { label: string; icon: typeof Home; title: string; questions: string[]; advice: string }> = {
  kopen: {
    label: "Ik wil een woning kopen",
    icon: KeyRound,
    title: "U overweegt een aankoop.",
    questions: [
      "Wat is de technische staat?",
      "Welke renovaties zijn mogelijk nodig?",
      "Welke extra investering moet ik voorzien?",
    ],
    advice:
      "Wilt u vooral weten hoe het pand ervoor staat, dan volstaat Basis vaak. Wilt u vóór uw bod ook een idee van het renovatiebudget, dan past Compleet beter.",
  },
  renoveren: {
    label: "Ik wil mijn huidige woning renoveren",
    icon: Home,
    title: "U plant een renovatie.",
    questions: [
      "Welke werken hebben prioriteit?",
      "Wat is de juiste volgorde?",
      "Hoe bereid ik mijn renovatie voor?",
    ],
    advice:
      "Plus geeft u een renovatievolgorde en stappenplan. Wilt u daarnaast een indicatie van de kosten per onderdeel, kies dan Compleet.",
  },
};

const faq = [
  {
    q: "Wanneer laat ik een Woningscan uitvoeren?",
    a: "Wanneer u een woning wilt kopen of een renovatie voorbereidt en eerst wilt weten hoe het pand er bouwtechnisch voor staat, welke werken voorrang verdienen en (in Compleet) wat die ongeveer kosten.",
  },
  {
    q: "Kan ik de scan vóór de aankoop van een woning laten uitvoeren?",
    a: "Ja, mits toestemming van de eigenaar of makelaar om het pand te bezoeken. Plan de scan het best vóór u een bindend bod uitbrengt.",
  },
  {
    q: "Wat is het verschil tussen Basis, Plus en Compleet?",
    a: "Basis geeft een overzicht van de zichtbare staat en de prioriteiten. Plus voegt een uitgebreidere inspectie, fotodocumentatie, renovatievolgorde en stappenplan toe. Compleet voegt daar een indicatieve kostenraming en budgetverdeling aan toe.",
  },
  {
    q: "Krijg ik een kostenraming?",
    a: "Alleen in het pakket Compleet. Die raming is indicatief: ze is geen bindende aannemersofferte en geen vastgoedtaxatie.",
  },
  {
    q: "Kan ik een drone-inspectie toevoegen?",
    a: `Ja, bij elk pakket kunt u de drone-dakscreening toevoegen voor ${formatEuro(DRONE_OPTION.price)} incl. btw. ${DRONE_OPTION.condition}`,
  },
  {
    q: "Moet Dimac mijn renovatie uitvoeren?",
    a: "Nee. De Woningscan is een zelfstandige dienst. Het rapport is van u en blijft bruikbaar, ongeacht wie de werken uitvoert.",
  },
  {
    q: "Welke zaken vallen buiten de Woningscan?",
    a: "De Woningscan is een visuele, niet-destructieve beoordeling. Verborgen gebreken kunnen niet uitgesloten worden. De scan vervangt geen wettelijke keuring, EPC, asbestattest, gespecialiseerde stabiliteitsstudie of architectenadvies.",
  },
  {
    q: "Hoe ontvang ik het rapport?",
    a: "U ontvangt het rapport digitaal. Het tijdstip van oplevering spreken we af bij het inplannen van de scan.",
  },
];

const Woningscan = () => {
  const [params] = useSearchParams();
  const initial = getPackage(params.get("pakket"))?.id ?? null;
  const [situation, setSituation] = useState<Situation | null>(null);
  const [selected, setSelected] = useState<PackageId | null>(initial);
  const [drone, setDrone] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", timing: "", message: "" });
  const [consent, setConsent] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    track("woningscan_view", { page_type: "woningscan" });
  }, []);

  const set = (k: keyof typeof form) => (v: string) => {
    if (!started.current) {
      started.current = true;
      track("woningscan_request_start", { page_type: "woningscan", item_id: selected ?? undefined });
    }
    setForm((f) => ({ ...f, [k]: v }));
  };

  const choose = (id: PackageId) => {
    setSelected(id);
    setSent(false);
    track("woningscan_package_select", { page_type: "woningscan", item_id: id });
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const toggleDrone = (v: boolean) => {
    setDrone(v);
    track("woningscan_drone_toggle", { page_type: "woningscan", enabled: v });
  };

  const pkg = selected ? getPackage(selected) : undefined;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!pkg) return;
    const url = buildMailto(`Aanvraag Woningscan ${pkg.name}${drone ? " + drone" : ""}`, [
      ["Pakket", `${pkg.name} (${formatEuro(pkg.price)})`],
      ["Drone-dakscreening", drone ? `Ja (+${formatEuro(DRONE_OPTION.price)})` : "Nee"],
      ["Totaal incl. btw", formatEuro(scanTotal(pkg.id, drone))],
      ["Situatie", situation ? SITUATIONS[situation].label : ""],
      ["Naam", form.name],
      ["E-mail", form.email],
      ["Telefoon", form.phone],
      ["Adres van de woning", form.address],
      ["Gewenste periode", form.timing],
      ["Toelichting", form.message],
    ], "Beste Dimac, graag vraag ik een Woningscan aan.");
    track("woningscan_mailto_handoff", { page_type: "woningscan", item_id: pkg.id, value: scanTotal(pkg.id, drone) });
    openMailto(url);
    setSent(true);
  };

  return (
    <>
      <PageSEO
        path="/woningscan"
        title="Woningscan Diest | Inspectie vóór aankoop of renovatie | Dimac"
        description="Een woning kopen of renoveren? De Dimac Woningscan geeft professioneel inzicht in de staat, prioriteiten en (indicatieve) kosten. Basis €299, Plus €449, Compleet €649 incl. btw."
        schemas={[
          organizationSchema(),
          breadcrumbSchema([{ label: "Home", to: "/" }, { label: "Woningscan" }]),
          faqSchema(faq),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Dimac Woningscan",
            provider: { "@id": organizationSchema()["@id"] },
            url: absoluteUrl("/woningscan"),
            areaServed: "Diest",
            offers: SCAN_PACKAGES.map((p) => ({
              "@type": "Offer",
              name: `Woningscan ${p.name}`,
              price: p.price,
              priceCurrency: "EUR",
            })),
          },
        ]}
      />

      <PageHero
        crumbs={[{ label: "Home", to: "/" }, { label: "Woningscan" }]}
        eyebrow="Dimac Woningscan"
        title="Een woning kopen of renoveren? Weet waar u aan begint."
        intro={
          <>
            <p>
              Hoe staat het pand er technisch voor? Welke werken verdienen aandacht? Wat pakt u best eerst aan?
              En welk renovatiebudget moet u ongeveer voorzien?
            </p>
            <p>Met de Dimac Woningscan krijgt u professioneel inzicht om onderbouwde vastgoedbeslissingen te nemen.</p>
          </>
        }
      >
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg">
            <a href="#pakketten">
              Bekijk de pakketten <ArrowRight />
            </a>
          </Button>
          <p className="text-sm text-muted-foreground sm:self-center sm:ml-4">Vanaf {formatEuro(299)} incl. btw</p>
        </div>
      </PageHero>

      {/* Keuzehulp */}
      <Section eyebrow="Keuzehulp" title="Wat is uw situatie?">
        <div className="grid gap-4 md:grid-cols-2" role="radiogroup" aria-label="Uw situatie">
          {(Object.keys(SITUATIONS) as Situation[]).map((key) => {
            const s = SITUATIONS[key];
            const Icon = s.icon;
            const active = situation === key;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  setSituation(key);
                  track("woningscan_situation_select", { page_type: "woningscan", item_id: key });
                }}
                className={cn(
                  "focus-ring text-left p-6 md:p-8 border transition-colors duration-300 min-h-[44px]",
                  active ? "border-accent bg-accent-soft/50" : "border-border bg-background fine:hover:border-primary/40"
                )}
              >
                <Icon className={cn("w-6 h-6 mb-5", active ? "text-accent" : "text-primary/60")} strokeWidth={1.5} />
                <span className="block font-display text-2xl text-primary">{s.label}.</span>
                <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  {s.questions.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
        <div aria-live="polite">
          {situation && (
            <p className="mt-8 max-w-3xl border-l-2 border-accent pl-5 text-primary leading-relaxed">
              <strong className="font-medium">{SITUATIONS[situation].title}</strong> {SITUATIONS[situation].advice} U
              kiest uiteraard zelf.
            </p>
          )}
        </div>
      </Section>

      {/* Pakketten */}
      <section id="pakketten" className="scroll-mt-24 py-20 md:py-32 bg-surface border-y border-border">
        <div className="container-wide">
          <header className="max-w-3xl mb-12 md:mb-16">
            <span className="eyebrow mb-5">Pakketten</span>
            <h2 className="font-display text-3xl md:text-5xl leading-[1.05] tracking-tight">
              Drie pakketten. Eén heldere keuze.
            </h2>
            <p className="mt-5 text-muted-foreground">Alle prijzen inclusief btw.</p>
          </header>

          <label
            className={cn(
              "mb-10 flex items-start gap-4 p-5 md:p-6 border bg-background cursor-pointer transition-colors duration-300 max-w-3xl",
              drone ? "border-accent" : "border-border"
            )}
          >
            <input
              type="checkbox"
              checked={drone}
              onChange={(e) => toggleDrone(e.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 accent-[hsl(var(--accent))]"
            />
            <span>
              <span className="block text-primary font-medium">
                Voeg {DRONE_OPTION.name.toLowerCase()} toe{" "}
                <span className="text-accent">+ {formatEuro(DRONE_OPTION.price)} incl. btw</span>
              </span>
              <span className="block mt-1 text-sm text-muted-foreground leading-relaxed">{DRONE_OPTION.text}</span>
              <span className="block mt-1 text-xs text-muted-foreground">{DRONE_OPTION.condition}</span>
            </span>
          </label>

          <div className="grid gap-5 lg:grid-cols-3">
            {SCAN_PACKAGES.map((p) => {
              const active = selected === p.id;
              const featured = p.id === "plus";
              return (
                <article
                  key={p.id}
                  className={cn(
                    "relative flex flex-col bg-background border p-7 md:p-9 transition-[border-color,box-shadow] duration-300",
                    active ? "border-accent shadow-card" : featured ? "border-primary/40" : "border-border"
                  )}
                >
                  {featured && (
                    <span className="absolute -top-3 left-7 bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.2em] px-3 py-1">
                      Meest gekozen voor renovatieplanning
                    </span>
                  )}
                  <h3 className="text-xs uppercase tracking-[0.24em] text-accent">{p.name}</h3>
                  <p className="mt-4 font-display text-2xl leading-snug text-primary min-h-[4rem]">{p.tagline}</p>
                  <p className="mt-6 flex items-baseline gap-2">
                    <span className="font-display text-5xl text-primary tabular-nums" aria-live="polite">
                      {formatEuro(scanTotal(p.id, drone))}
                    </span>
                    <span className="text-sm text-muted-foreground">incl. btw</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground min-h-[1rem]">
                    {drone ? `${formatEuro(p.price)} + drone ${formatEuro(DRONE_OPTION.price)}` : ""}
                  </p>
                  <div className="mt-6 pt-6 border-t border-border flex-1">
                    {p.includesFrom && <p className="text-sm text-primary mb-3">{p.includesFrom}</p>}
                    <ul className="space-y-3">
                      {p.items.map((i) => (
                        <li key={i} className="flex gap-3 text-sm text-primary/85 leading-relaxed">
                          <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          {i}
                        </li>
                      ))}
                    </ul>
                    {p.note && <p className="mt-4 text-xs text-muted-foreground">{p.note}</p>}
                    <p className="mt-6 text-sm text-muted-foreground leading-relaxed">{p.audience}</p>
                  </div>
                  <Button
                    type="button"
                    variant={active || featured ? "solid" : "outline"}
                    className="mt-8 w-full"
                    aria-pressed={active}
                    onClick={() => choose(p.id)}
                  >
                    {active ? "Gekozen" : p.cta} {active ? <Check /> : <ArrowRight />}
                  </Button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Aanvraag */}
      <section className="py-20 md:py-32 bg-background">
        <div ref={formRef} className="container-tight scroll-mt-24 grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <span className="eyebrow mb-5">Aanvraag</span>
            <h2 className="font-display text-3xl md:text-4xl leading-tight">Vraag uw Woningscan aan</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Wij nemen contact op om een moment voor het bezoek af te spreken. Betalen gebeurt niet online.
            </p>

            <div className="mt-8 border border-border bg-surface p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-4">Uw keuze</p>
              {pkg ? (
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt>Woningscan {pkg.name}</dt>
                    <dd className="tabular-nums">{formatEuro(pkg.price)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={drone}
                          onChange={(e) => toggleDrone(e.target.checked)}
                          className="h-4 w-4 accent-[hsl(var(--accent))]"
                        />
                        Drone-dakscreening
                      </label>
                    </dt>
                    <dd className="tabular-nums">{drone ? formatEuro(DRONE_OPTION.price) : "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-4 pt-3 mt-3 border-t border-border font-medium text-primary">
                    <dt>Totaal incl. btw</dt>
                    <dd className="tabular-nums text-lg">{formatEuro(scanTotal(pkg.id, drone))}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nog geen pakket gekozen.{" "}
                  <a href="#pakketten" className="text-accent underline underline-offset-2">
                    Kies een pakket
                  </a>
                  .
                </p>
              )}
            </div>
            <div className="mt-8 hidden lg:block">
              <ImagePlaceholder src={prep} label="Technische inspectie van een woning" aspect="landscape" />
            </div>
          </div>

          <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2 content-start">
            <TextField id="name" label="Naam" required autoComplete="name" value={form.name} onChange={set("name")} />
            <TextField id="email" type="email" label="E-mail" required autoComplete="email" value={form.email} onChange={set("email")} />
            <TextField id="phone" type="tel" label="Telefoon" autoComplete="tel" value={form.phone} onChange={set("phone")} />
            <SelectField
              id="timing"
              label="Gewenste periode"
              value={form.timing}
              onChange={set("timing")}
              options={["Zo snel mogelijk", "Binnen 2 weken", "Binnen de maand", "Nog niet bepaald"]}
            />
            <TextField
              id="address"
              label="Adres of gemeente van de woning"
              required
              className="sm:col-span-2"
              value={form.address}
              onChange={set("address")}
            />
            <TextAreaField
              id="message"
              label="Toelichting"
              hint="Bijvoorbeeld: type woning, bouwjaar, uw plannen."
              className="sm:col-span-2"
              rows={4}
              value={form.message}
              onChange={set("message")}
            />
            <div className="sm:col-span-2 space-y-5">
              <ConsentField checked={consent} onChange={setConsent} />
              <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={!pkg}>
                {pkg ? `Aanvraag voorbereiden — ${formatEuro(scanTotal(pkg.id, drone))}` : "Kies eerst een pakket"}
                <ArrowRight />
              </Button>
              <MailtoNotice />
              {sent && <HandoffMessage />}
            </div>
          </form>
        </div>
      </section>

      {/* Wat de scan niet is */}
      <Section bg="surface" eyebrow="Goed om te weten" title="Wat u van een Woningscan mag verwachten">
        <div className="grid gap-10 md:grid-cols-2 max-w-5xl">
          <p className="text-muted-foreground leading-relaxed">
            De Woningscan is een visuele, niet-destructieve beoordeling door mensen met praktische bouwervaring. U
            krijgt een helder beeld van zichtbare vaststellingen, aandachtspunten en prioriteiten. Het rapport blijft
            waardevol, ook als u later met een andere partij werkt.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Verborgen gebreken kunnen niet uitgesloten worden. De scan vervangt geen wettelijke keuring, EPC,
            asbestattest, gespecialiseerde stabiliteitsstudie of architectenadvies.
          </p>
        </div>
      </Section>

      <Section eyebrow="Veelgestelde vragen" title="Vragen over de Woningscan">
        <FAQ items={faq} className="max-w-3xl" />
      </Section>
    </>
  );
};

export default Woningscan;
