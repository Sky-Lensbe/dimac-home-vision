import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, Home, KeyRound, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/Section";
import { FAQ } from "@/components/site/FAQ";
import { PageHero } from "@/components/site/PageHero";
import {
  ConsentField,
  HandoffMessage,
  MailtoNotice,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/site/FormFields";
import { PageSEO } from "@/components/seo/PageSEO";
import { AREA_SERVED, breadcrumbSchema, faqSchema, organizationSchema, absoluteUrl } from "@/lib/site";
import {
  DRONE_OPTION,
  SCAN_PACKAGES,
  formatEuro,
  getPackage,
  scanTotal,
  parseScanParams,
  type PackageId,
  type Situation,
} from "@/data/woningscan";
import { buildMailto, openMailto } from "@/lib/mailto";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import inspectie from "@/assets/inspecteur-inkomhal.png.asset.json";

const SITUATIONS: Record<Situation, { label: string; icon: typeof Home; heading: string; title: string; text: string; questions: string[]; advice: string }> = {
  kopen: {
    label: "Ik wil een woning kopen",
    icon: KeyRound,
    heading: "Woninginspectie vóór aankoop",
    title: "U overweegt een woning te kopen.",
    text: "Een woning kan er verzorgd uitzien en toch bouwtechnische aandachtspunten hebben. Met een Woningscan krijgt u beter inzicht in de zichtbare toestand van het pand en de mogelijke renovatiebehoeften. Zo bereidt u de aankoop en een eventuele renovatie realistischer voor.",
    questions: [
      "Welke zichtbare aandachtspunten zijn er?",
      "Welke werken verdienen prioriteit?",
      "Welke renovaties moet ik mogelijk voorzien?",
      "Wat kan dit ongeveer kosten, wanneer ik Compleet kies?",
    ],
    advice:
      "Wilt u vooral weten hoe het pand ervoor staat, dan geeft Basis een eerste overzicht. Wilt u vóór uw beslissing ook een indicatie van het renovatiebudget, dan is Compleet relevant.",
  },
  renoveren: {
    label: "Ik wil mijn woning renoveren",
    icon: Home,
    heading: "Renovatieadvies voor uw bestaande woning",
    title: "U wilt uw woning renoveren.",
    text: "Een goede renovatie begint met inzicht in de huidige toestand en de volgorde van de werken. De Woningscan helpt om prioriteiten en de samenhang tussen bouwdisciplines beter te begrijpen.",
    questions: [
      "Wat moet eerst aangepakt worden?",
      "Welke werken beïnvloeden elkaar?",
      "Welke ingrepen zijn prioritair?",
      "Welk pakket helpt bij mijn renovatieplanning?",
    ],
    advice:
      "Zoekt u vooral een renovatievolgorde en stappenplan, dan is Plus relevant. Wilt u daarnaast een indicatie van de kosten, kies dan Compleet.",
  },
};

const CHECKS = [
  "Dak en zichtbare dakonderdelen",
  "Gevels en buitenschil",
  "Zichtbare vochtproblemen",
  "Ramen en buitenschrijnwerk",
  "Isolatie, voor zover visueel beoordeelbaar",
  "Zichtbare elektrische installatieonderdelen",
  "Sanitair en zichtbare leidingen",
  "Verwarming en technische installaties",
  "Vloeren, muren en plafonds",
  "Algemene afwerking",
  "Zichtbare scheurvorming en vervormingen",
  "Mogelijke renovatieprioriteiten",
];

const STEPS = [
  { t: "Kies uw Woningscan", d: "Selecteer Basis, Plus of Compleet en voeg eventueel de drone-dakscreening toe." },
  { t: "Plan het woningbezoek", d: "Na uw aanvraag stemmen we de locatie en een geschikt bezoekmoment af." },
  { t: "Visuele inspectie ter plaatse", d: "We bekijken de woning en brengen de zichtbare aandachtspunten volgens het gekozen pakket in kaart." },
  { t: "Ontvang uw digitaal rapport", d: "U ontvangt de afgesproken rapportage en gebruikt de bevindingen om uw volgende stappen te bepalen." },
];

const LIMITS = [
  "Geen destructief onderzoek",
  "Geen garantie dat verborgen gebreken ontdekt worden",
  "Geen vervanging van wettelijke keuringen of het EPC",
  "Geen vervanging van een verplicht asbestattest",
  "Geen gespecialiseerde stabiliteitsstudie of architectenonderzoek",
  "Geen bindende renovatieofferte of vastgoedwaardebepaling",
];

const [basis, plus, compleet] = SCAN_PACKAGES;

const faq = [
  {
    q: "Wat is een Woningscan?",
    a: "Een visuele bouwtechnische beoordeling van een woning door DIMAC, met een digitaal rapport waarvan de inhoud afhangt van het gekozen pakket: Basis, Plus of Compleet.",
  },
  {
    q: "Wanneer laat ik een woning inspecteren vóór aankoop?",
    a: "Bij voorkeur voordat u een bindend bod uitbrengt. Zo kent u de zichtbare aandachtspunten en mogelijke renovatiebehoeften wanneer u uw beslissing neemt.",
  },
  {
    q: "Wat kost een Woningscan in Limburg of Vlaams-Brabant?",
    a: `Basis kost ${formatEuro(basis.price)}, Plus ${formatEuro(plus.price)} en Compleet ${formatEuro(compleet.price)}, telkens incl. btw. De drone-dakscreening kunt u bij elk pakket toevoegen voor ${formatEuro(DRONE_OPTION.price)} incl. btw.`,
  },
  {
    q: "Wat is het verschil tussen Basis, Plus en Compleet?",
    a: "Basis geeft inzicht in de zichtbare toestand en de prioriteiten. Plus voegt een uitgebreidere inspectie, fotodocumentatie en een renovatievolgorde met stappenplan toe. Compleet voegt daar een indicatieve kostenraming en budgetverdeling aan toe.",
  },
  {
    q: "Krijg ik een renovatiekostenraming?",
    a: "Uitsluitend bij Compleet. Die raming is indicatief: ze is geen bindende aannemersofferte en geen vastgoedtaxatie.",
  },
  {
    q: "Kan ik een Woningscan laten uitvoeren in een woning die nog niet van mij is?",
    a: "Ja, mits de eigenaar of makelaar toestemming geeft en het pand praktisch toegankelijk is.",
  },
  {
    q: "Kan ik een drone-inspectie laten toevoegen?",
    a: `Ja, voor ${formatEuro(DRONE_OPTION.price)} incl. btw bij elk pakket. ${DRONE_OPTION.condition}`,
  },
  {
    q: "Moet ik DIMAC inschakelen voor mijn renovatie?",
    a: "Nee. De Woningscan is een zelfstandige dienst. U gebruikt het advies, ongeacht wie later de werken uitvoert.",
  },
  {
    q: "Vervangt een Woningscan een officiële keuring?",
    a: "Nee. De Woningscan is een visuele, niet-destructieve screening. Ze vervangt geen wettelijke keuring, EPC, asbestattest, stabiliteitsstudie of architectenonderzoek.",
  },
  {
    q: "Hoe en wanneer ontvang ik mijn rapport?",
    a: "U ontvangt het rapport digitaal. Het tijdstip van oplevering spreken we af bij het inplannen van de scan.",
  },
];

const Woningscan = () => {
  const [params] = useSearchParams();
  const { pakket: initial, situatie: initialSituation } = parseScanParams(params);
  const [situation, setSituation] = useState<Situation | null>(initialSituation);
  const [selected, setSelected] = useState<PackageId | null>(initial);
  const [drone, setDrone] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", timing: "", message: "" });
  const [consent, setConsent] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    track("woningscan_view", { page_type: "woningscan" });
    if (initial) {
      requestAnimationFrame(() => document.getElementById("pakketten")?.scrollIntoView({ block: "start" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Navigatie tussen queryvarianten werkt de keuze bij zonder het formulier te wissen.
  const paramKey = params.toString();
  const firstParams = useRef(true);
  useEffect(() => {
    if (firstParams.current) {
      firstParams.current = false;
      return;
    }
    const { pakket, situatie } = parseScanParams(params);
    if (pakket) setSelected(pakket);
    if (situatie) setSituation(situatie);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramKey]);

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
        title="Woningscan Limburg & Vlaams-Brabant | DIMAC"
        description="Een woning kopen of renoveren? DIMAC voert vanuit Diest Woningscans uit in Limburg en Vlaams-Brabant. Vergelijk pakketten vanaf €299 incl. btw."
        schemas={[
          organizationSchema(),
          breadcrumbSchema([{ label: "Home", to: "/" }, { label: "Woningscan" }]),
          faqSchema(faq),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "DIMAC Woningscan",
            serviceType: "Bouwtechnische woninginspectie",
            provider: { "@id": organizationSchema()["@id"] },
            url: absoluteUrl("/woningscan"),
            areaServed: AREA_SERVED,
            offers: SCAN_PACKAGES.map((p) => ({
              "@type": "Offer",
              name: `Woningscan ${p.name}`,
              price: p.price,
              priceCurrency: "EUR",
              url: absoluteUrl("/woningscan"),
            })),
          },
        ]}
      />

      <PageHero
        crumbs={[{ label: "Home", to: "/" }, { label: "Woningscan" }]}
        eyebrow="Vanuit Diest · Limburg & Vlaams-Brabant"
        title="Woningscan vóór aankoop of renovatie."
        intro={
          <>
            <p className="font-display text-2xl md:text-3xl text-primary leading-snug">Weet waar u aan begint.</p>
            <p>
              Een woning kopen of renoveren? Met de DIMAC Woningscan krijgt u professioneel inzicht in de bouwtechnische staat van een pand, de belangrijkste aandachtspunten en de renovatieprioriteiten. Kiest u
              voor Woningscan Compleet, dan ontvangt u ook een indicatieve inschatting van de renovatiekosten.
            </p>
            <p className="text-base">DIMAC voert vanuit Diest Woningscans uit in Limburg en Vlaams-Brabant.</p>
          </>
        }
      >
        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
          <Button asChild size="lg" variant="accent">
            <a href="#pakketten">
              Vergelijk de Woningscans <ArrowRight />
            </a>
          </Button>
          <p className="text-sm text-primary sm:ml-4">Vanaf {formatEuro(basis.price)} incl. btw</p>
        </div>
        <ul className="mt-10 grid gap-3 sm:grid-cols-3 border-t border-border pt-6 text-sm text-primary/85">
          {[
            "Visuele controle van 25 bouwtechnische aandachtspunten",
            "Een duidelijk digitaal rapport",
            "Praktische bouwexpertise vanuit vastgoedontwikkeling",
          ].map((t) => (
            <li key={t} className="flex gap-2.5">
              <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
              {t}
            </li>
          ))}
        </ul>
      </PageHero>

      {/* Voor wie */}
      <Section eyebrow="Voor wie" title="Een woning kopen of renoveren? Eerst inzicht, dan beslissen.">
        <div className="grid gap-4 md:grid-cols-2" role="radiogroup" aria-label="Uw situatie">
          {(Object.keys(SITUATIONS) as Situation[]).map((key) => {
            const s = SITUATIONS[key];
            const Icon = s.icon;
            const active = situation === key;
            return (
              <div
                key={key}
                className={cn(
                  "flex flex-col p-6 md:p-8 border transition-colors duration-300",
                  active ? "border-accent bg-accent-soft/50" : "border-border bg-background"
                )}
              >
                <Icon className={cn("w-6 h-6 mb-5", active ? "text-accent" : "text-primary/60")} strokeWidth={1.5} aria-hidden="true" />
                <h3 className="text-xs uppercase tracking-[0.22em] text-accent">{s.heading}</h3>
                <p className="mt-3 font-display text-2xl text-primary">{s.title}</p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.text}</p>
                <ul className="mt-4 space-y-1.5 text-sm text-primary/85 flex-1">
                  {s.questions.map((q) => (
                    <li key={q} className="flex gap-2">
                      <span className="text-accent" aria-hidden="true">—</span>
                      {q}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    setSituation(key);
                    track("woningscan_situation_select", { page_type: "woningscan", item_id: key });
                  }}
                  className={cn(
                    "focus-ring mt-6 min-h-[44px] px-4 py-2.5 border text-sm text-left flex items-center gap-2 transition-colors",
                    active ? "border-accent text-primary" : "border-border text-primary fine:hover:border-primary/40"
                  )}
                >
                  {active && <Check className="w-4 h-4 text-accent" aria-hidden="true" />}
                  {s.label}.
                </button>
              </div>
            );
          })}
        </div>
        <div aria-live="polite">
          {situation && (
            <p className="mt-8 max-w-3xl border-l-2 border-accent pl-5 text-primary leading-relaxed">
              {SITUATIONS[situation].advice} U kiest uiteraard zelf.{" "}
              <a href="#pakketten" className="text-accent underline underline-offset-2">Bekijk de pakketten</a>
            </p>
          )}
        </div>
      </Section>

      {/* Wat onderzoeken we */}
      <Section bg="surface" eyebrow="Inhoud" title="Wat bekijken we tijdens een bouwtechnische Woningscan?">
        <p className="-mt-8 mb-10 max-w-2xl text-muted-foreground leading-relaxed">
          Tijdens een visuele inspectie beoordelen we ongeveer 25 bouwtechnische aandachtspunten, verdeeld over onder
          meer deze onderdelen:
        </p>
        <ul className="grid gap-px bg-border border border-border sm:grid-cols-2 lg:grid-cols-3">
          {CHECKS.map((c, i) => (
            <li key={c} className="bg-background p-5 flex gap-4 text-sm text-primary">
              <span className="font-display text-accent tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              {c}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted-foreground max-w-2xl">
          Wat we kunnen beoordelen, hangt ook af van de bereikbaarheid en zichtbaarheid van de verschillende onderdelen.
        </p>
      </Section>

      {/* Pakketten */}
      <section id="pakketten" className="scroll-mt-24 py-20 md:py-32 bg-surface border-y border-border">
        <div className="container-wide">
          <header className="max-w-3xl mb-12 md:mb-16">
            <span className="eyebrow mb-5">Pakketten</span>
            <h2 className="font-display text-3xl md:text-5xl leading-[1.05] tracking-tight">
              Welke Woningscan past bij uw woning?
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Van een eerste bouwtechnisch overzicht tot een indicatieve renovatiebegroting. Kies het niveau van inzicht
              dat bij uw plannen past. Alle prijzen inclusief btw.
            </p>
          </header>

          <h3 className="sr-only">Optionele drone-dakscreening</h3>
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
                      Aanbevolen bij renovatieplanning
                    </span>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xs uppercase tracking-[0.24em] text-accent">Woningscan {p.name}</h3>
                    <span className="text-[11px] text-muted-foreground">{p.result}</span>
                  </div>
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
                    {p.excludes && (
                      <>
                        <p className="mt-5 text-xs uppercase tracking-[0.18em] text-muted-foreground">Niet standaard inbegrepen</p>
                        <ul className="mt-2 space-y-2">
                          {p.excludes.map((i) => (
                            <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                              <Minus className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                              {i}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    {p.note && <p className="mt-4 text-xs text-primary/80 font-medium">{p.note}</p>}
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
            <h2 className="font-display text-3xl md:text-4xl leading-tight">Vraag uw Woningscan aan.</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Een aanvraag is nog geen bevestigde afspraak of betaling. Na ontvangst stemmen we met u het bezoek af.
              Betalen gebeurt niet online.
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
              <div className="relative overflow-hidden">
                <img
                  src={inspectie.url}
                  alt="Inspecteur met tablet tijdens een Woningscan in een moderne inkomhal"
                  loading="lazy"
                  className="w-full aspect-[4/5] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/25 to-transparent" aria-hidden="true" />
                <p className="absolute inset-x-0 bottom-0 p-6 font-display text-xl md:text-2xl leading-snug text-primary-foreground">
                  Duidelijkheid in uw project, meerwaarde garanderen in uw toekomst.
                </p>
              </div>
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

      {/* Verloop */}
      <Section eyebrow="Verloop" title="Hoe verloopt een Woningscan?">
        <ol className="grid gap-8 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.t} className="border-t border-border pt-6">
              <span className="font-display text-accent text-lg tabular-nums">{i + 1}.</span>
              <h3 className="mt-2 font-display text-xl text-primary">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Regio */}
      <Section bg="surface" eyebrow="Werkgebied" title="Woningscan in Limburg en Vlaams-Brabant">
        <div className="grid gap-8 md:grid-cols-2 max-w-5xl text-muted-foreground leading-relaxed">
          <p>
            DIMAC voert vanuit Diest bouwtechnische Woningscans uit bij kandidaat-kopers en eigenaars in Limburg en
            Vlaams-Brabant. Of u nu een woning overweegt te kopen of renovatieplannen heeft voor uw huidige woning: met
            een Woningscan krijgt u meer inzicht in de zichtbare bouwtechnische aandachtspunten en de stappen die
            mogelijk volgen.
          </p>
          <p>
            Een Woningscan kan ook vóór aankoop, mits toestemming voor toegang tot het pand. De praktische planning
            stemmen we af op de ligging van de woning en het gekozen pakket. Ook een{" "}
            <Link to="/totaalrenovaties" className="text-accent underline underline-offset-2">totaalrenovatie</Link>{" "}
            kan DIMAC achteraf beoordelen, zonder verplichting.
          </p>
        </div>
      </Section>

      {/* Verwachtingen */}
      <Section eyebrow="Goed om te weten" title="Wat mag u van een Woningscan verwachten?">
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] max-w-5xl">
          <p className="text-muted-foreground leading-relaxed">
            De Woningscan is een visuele, niet-destructieve screening van de woning, uitgevoerd vanuit praktische
            bouwervaring. U krijgt een helder beeld van zichtbare vaststellingen en prioriteiten. Gebreken kunnen
            daarmee niet uitgesloten worden.
          </p>
          <ul className="grid gap-2.5 text-sm text-muted-foreground">
            {LIMITS.map((l) => (
              <li key={l} className="flex gap-3">
                <Minus className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                {l}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section bg="surface" eyebrow="Veelgestelde vragen" title="Veelgestelde vragen over een Woningscan">
        <FAQ items={faq} className="max-w-3xl" />
      </Section>
    </>
  );
};

export default Woningscan;
