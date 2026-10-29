import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, Clock, Home, KeyRound, Mail, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/Section";
import { FAQ } from "@/components/site/FAQ";
import { PageHero } from "@/components/site/PageHero";
import { ConsentField, SelectField, TextAreaField, TextField } from "@/components/site/FormFields";
import { PageSEO } from "@/components/seo/PageSEO";
import { AREA_SERVED, breadcrumbSchema, faqSchema, organizationSchema, absoluteUrl } from "@/lib/site";
import {
  DRONE_OPTION,
  ONLINE_PRODUCTS,
  PHYSICAL_PRODUCTS,
  VAT_LABEL,
  WONINGSCAN_MAIL_MODE,
  formatEuro,
  formatPrice,
  getPackage,
  getProduct,
  scanTotal,
  parseScanParams,
  woningscanRecipient,
  type PackageId,
  type ScanProduct,
  type Situation,
} from "@/data/woningscan";
import { buildMailto, openMailto } from "@/lib/mailto";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import inspectie from "@/assets/inspecteur-inkomhal.png.asset.json";

const ws = getProduct("woningscan")!;
const plus = getProduct("woningscan-plus")!;
const budget = getProduct("online-budgetindicator")!;
const P = (p: ScanProduct) => (p.price === 0 ? "gratis" : `${formatEuro(p.price)} ${VAT_LABEL}`);

const SITUATIONS: Record<Situation, { label: string; icon: typeof Home; heading: string; title: string; text: string; questions: string[]; advice: string }> = {
  kopen: {
    label: "Ik wil een woning kopen",
    icon: KeyRound,
    heading: "Woninginspectie vóór aankoop",
    title: "U overweegt een woning te kopen.",
    text: "Een woning kan er verzorgd uitzien en toch bouwtechnische aandachtspunten hebben. Met een Woningscan krijgt u beter inzicht in de toestand van het pand en de mogelijke renovatiebehoeften.",
    questions: [
      "\nWelke aandachtspunten zijn er?",
      "Welke werken verdienen prioriteit?",
      "Welke renovaties moet ik mogelijk voorzien?",
    ],
    advice: `De gratis Quickscan geeft een eerste inzicht op basis van uw antwoorden. Voor een beoordeling van de zichtbare bouwtechnische toestand vóór aankoop is een Woningscan ter plaatse (${P(ws)}) relevant. Woningscan Plus (${P(plus)}) biedt uitgebreidere documentatie en renovatievoorbereiding.`,
  },
  renoveren: {
    label: "Ik wil mijn woning renoveren",
    icon: Home,
    heading: "Renovatieadvies voor uw bestaande woning",
    title: "U wilt uw woning renoveren.",
    text: "Een goede renovatie begint met inzicht in de huidige toestand en de volgorde van de werken. Online of ter plaatse: kies het niveau van inzicht dat u nodig heeft.",
    questions: [
      "Wat moet eerst aangepakt worden?",
      "Welke werken beïnvloeden elkaar?",
      "Wat kan de renovatie ongeveer kosten?",
    ],
    advice: `Start eventueel met de gratis Quickscan. Wilt u renovatiekosten online inschatten, dan is de online budgetraming (${P(budget)}) binnenkort beschikbaar. Voor een beoordeling ter plaatse kiest u Woningscan of Woningscan Plus. Een online analyse biedt niet dezelfde zekerheid als een plaatsbezoek.`,
  },
};

const CHECKS = [
  "Dak en zichtbare dakonderdelen",
  "Gevels en buitenschil",
  "Vochtproblemen",
  "Ramen en buitenschrijnwerk",
  "Isolatie, voor zover visueel beoordeelbaar",
  "Zichtbare elektrische installatieonderdelen",
  "Sanitair en zichtbare leidingen",
  "Verwarming en technische installaties",
  "Vloeren, muren en plafonds",
  "Algemene afwerking",
  "Zichtbare scheurvorming en vervormingen",
  "Etc",
];

const STEPS = [
  { t: "Kies uw Woningscan", d: "Selecteer Woningscan of Woningscan Plus en voeg eventueel de drone-dakscreening toe." },
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

type Cell = "ja" | "nee" | "dev" | string;
const COMPARE: { label: string; values: [Cell, Cell, Cell, Cell] }[] = [
  { label: "Prijs", values: ["Gratis", formatEuro(budget.price), formatEuro(ws.price), formatEuro(plus.price)] },
  { label: "Uitvoering", values: ["Online", "Online", "Ter plaatse", "Ter plaatse"] },
  { label: "Renovatiebarometer", values: ["ja", "nee", "nee", "nee"] },
  { label: "Inspectie door DIMAC", values: ["nee", "nee", "ja", "ja"] },
  { label: "Digitaal rapport", values: ["ja", "dev", "Beknopt", "Uitgebreider"] },
  { label: "Budgetindicatie", values: ["nee", "dev", "nee", "Nog te bevestigen"] },
  { label: "Fotodocumentatie", values: ["nee", "nee", "nee", "ja"] },
  { label: "Renovatieaanbevelingen", values: ["ja", "nee", "Prioriteiten", "ja"] },
  { label: "Logische renovatievolgorde", values: ["nee", "nee", "nee", "ja"] },
  { label: "Beschikbaar", values: ["ja", "Binnenkort", "ja", "ja"] },
];
const COMPARE_PRODUCTS = [getProduct("quickscan")!, budget, ws, plus];

const renderCell = (v: Cell) => {
  if (v === "ja") return <><Check className="w-4 h-4 text-accent" aria-hidden="true" /><span className="sr-only">Inbegrepen</span></>;
  if (v === "nee") return <><Minus className="w-4 h-4 text-muted-foreground" aria-hidden="true" /><span className="sr-only">Niet inbegrepen</span></>;
  if (v === "dev") return <span className="text-muted-foreground">In ontwikkeling</span>;
  return <span>{v}</span>;
};

const faq = [
  {
    q: "Wat is het verschil tussen de Quickscan en de online budgetraming?",
    a: "De gratis Quickscan geeft een renovatiebarometer en aandachtspunten op basis van uw antwoorden, zonder bedragen. De online budgetraming wordt een betalende online dienst die een indicatie geeft van het mogelijke renovatiebudget.",
  },
  {
    q: "Wat kost een online budgetraming?",
    a: `${formatEuro(budget.price)} ${VAT_LABEL}, als eenmalige online budgetraming.`,
  },
  {
    q: "Wanneer is de online budgetraming beschikbaar?",
    a: "De online budgetraming is in ontwikkeling en binnenkort beschikbaar. Er is nog geen datum vastgelegd; bestellen is nog niet mogelijk.",
  },
  {
    q: "Wat is het verschil tussen een online analyse en een inspectie ter plaatse?",
    a: "Een online analyse steunt op de informatie die u zelf opgeeft. Bij een Woningscan bekijkt een DIMAC-deskundige de woning ter plaatse. Een online analyse biedt daardoor niet dezelfde zekerheid als een plaatsbezoek.",
  },
  { q: "Wat kost een Woningscan?", a: `Een Woningscan kost ${formatEuro(ws.price)} ${VAT_LABEL}.` },
  { q: "Wat kost Woningscan Plus?", a: `Woningscan Plus kost ${formatEuro(plus.price)} ${VAT_LABEL}.` },
  {
    q: "Wat krijg ik extra bij Woningscan Plus?",
    a: "Een uitgebreidere beoordeling, fotodocumentatie van relevante vaststellingen, gedetailleerdere aandachtspunten, prioriteiten en aanbevelingen, een logische renovatievolgorde en een uitgebreider digitaal rapport.",
  },
  {
    q: "Krijg ik automatisch een renovatiekostenraming?",
    a: "Nee. Woningscan en Woningscan Plus bevatten standaard geen uitgebreide kostenraming. Voor een online indicatie van het renovatiebudget komt de afzonderlijke online budgetraming beschikbaar.",
  },
  {
    q: "Kan ik een Woningscan laten uitvoeren vóór de aankoop?",
    a: "Ja, bij voorkeur voordat u een bindend bod uitbrengt, mits de eigenaar of makelaar toestemming geeft en het pand praktisch toegankelijk is.",
  },
  {
    q: "Kan ik een drone-dakscreening toevoegen?",
    a: `Ja, bij Woningscan en Woningscan Plus voor +${formatEuro(DRONE_OPTION.price)} ${VAT_LABEL}. Niet bij de online producten. ${DRONE_OPTION.condition}`,
  },
  {
    q: "Vervangt de Woningscan een wettelijke keuring?",
    a: "Nee. De Woningscan is een visuele, niet-destructieve screening. Ze vervangt geen wettelijke keuring, EPC, asbestattest, stabiliteitsstudie of architectenonderzoek.",
  },
  {
    q: "Ben ik verplicht DIMAC voor mijn renovatie in te schakelen?",
    a: "Nee. Elke Woningscan is een zelfstandige dienst. U gebruikt het advies, ongeacht wie later de werken uitvoert.",
  },
];

const ProductCard = ({
  p,
  active,
  onChoose,
}: {
  p: ScanProduct;
  active?: boolean;
  onChoose?: (id: PackageId) => void;
}) => {
  const soon = p.availability === "coming_soon";
  return (
    <article
      className={cn(
        "relative flex flex-col bg-background border p-7 md:p-9 transition-[border-color,box-shadow] duration-300",
        active ? "border-accent shadow-card" : "border-border fine:hover:border-primary/30"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-xs uppercase tracking-[0.24em] text-accent">{p.shortTitle}</h4>
        <span className="text-[11px] text-muted-foreground">{p.delivery === "online" ? "Online" : "Ter plaatse"}</span>
      </div>
      <p className="mt-4 font-display text-2xl leading-snug text-primary md:min-h-[4.5rem]">{p.tagline}</p>
      <p className="mt-6 flex flex-wrap items-baseline gap-x-2">
        <span className="font-display text-5xl text-primary tabular-nums">{formatPrice(p)}</span>
        {p.price > 0 && <span className="text-sm text-muted-foreground">{VAT_LABEL}</span>}
      </p>
      <p className="mt-1 text-xs text-muted-foreground min-h-[1rem]">{p.priceNote ?? ""}</p>
      {soon && (
        <p className="mt-3 inline-flex w-fit items-center gap-2 border border-border px-3 py-1 text-xs text-primary">
          <Clock className="w-3.5 h-3.5 text-accent" aria-hidden="true" /> Binnenkort beschikbaar
        </p>
      )}
      <div className="mt-6 pt-6 border-t border-border flex-1">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{p.description}</p>
        {soon && <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Voorzien</p>}
        <ul className="space-y-3">
          {p.items.map((i) => (
            <li key={i} className="flex gap-3 text-sm text-primary/85 leading-relaxed">
              <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
              {i}
            </li>
          ))}
        </ul>
        {p.excludes.length > 0 && (
          <>
            <p className="mt-5 text-xs uppercase tracking-[0.18em] text-muted-foreground">Niet inbegrepen</p>
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
        {p.note && <p className="mt-4 text-xs text-primary/80">{p.note}</p>}
        <p className="mt-6 text-sm text-muted-foreground leading-relaxed">{p.audience}</p>
      </div>
      {soon || !p.ctaTo ? (
        <Button type="button" variant="outline" className="mt-8 w-full" disabled aria-disabled="true">
          Binnenkort beschikbaar
        </Button>
      ) : p.delivery === "online" ? (
        <Button asChild variant="outline" className="mt-8 w-full">
          <Link to={p.ctaTo} onClick={() => track("woningscan_click", { page_type: "woningscan", cta_label: p.cta, item_id: p.id })}>
            {p.cta} <ArrowRight />
          </Link>
        </Button>
      ) : (
        <Button
          type="button"
          variant={active ? "solid" : "outline"}
          className="mt-8 w-full"
          aria-pressed={active}
          onClick={() => onChoose?.(p.id as PackageId)}
        >
          {active ? "Gekozen" : p.cta} {active ? <Check /> : <ArrowRight />}
        </Button>
      )}
    </article>
  );
};

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
    const legacy = params.get("pakket");
    if (initial) {
      requestAnimationFrame(() => formRef.current?.scrollIntoView({ block: "start" }));
    } else if (legacy) {
      // Oude of ongeldige pakketwaarden: toon het overzicht zonder iets te selecteren.
      requestAnimationFrame(() => document.getElementById("pakketten")?.scrollIntoView({ block: "start" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const recipient = woningscanRecipient();
  const testMode = WONINGSCAN_MAIL_MODE === "test";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!pkg) return;
    const total = scanTotal(pkg.id, drone);
    const url = buildMailto(
      `${testMode ? "[TEST] " : ""}Aanvraag ${pkg.name}${drone ? " + drone" : ""}`,
      [
        ["Pakket", `${pkg.name} (${formatEuro(pkg.price)} ${VAT_LABEL})`],
        ["Drone-dakscreening", drone ? `Ja (+${formatEuro(DRONE_OPTION.price)} ${VAT_LABEL})` : "Nee"],
        [`Totaal ${VAT_LABEL}`, formatEuro(total)],
        ["Situatie", situation ? SITUATIONS[situation].label : ""],
        ["Naam", form.name],
        ["E-mail", form.email],
        ["Telefoon", form.phone],
        ["Adres van de woning", form.address],
        ["Gewenste periode", form.timing],
        ["Toelichting", form.message],
      ],
      `Beste Dimac, graag vraag ik een ${pkg.name} aan.`,
      recipient
    );
    track("woningscan_mailto_handoff", { page_type: "woningscan", item_id: pkg.id, value: total });
    openMailto(url);
    setSent(true);
  };

  return (
    <>
      <PageSEO
        path="/woningscan"
        title="Woningscan & Quickscan Limburg en Vlaams-Brabant | DIMAC"
        description={`Gratis online Quickscan, Woningscan ter plaatse (${formatEuro(ws.price)}) of uitgebreide Woningscan Plus (${formatEuro(plus.price)}), ${VAT_LABEL}. Vanuit Diest in Limburg en Vlaams-Brabant.`}
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
            offers: PHYSICAL_PRODUCTS.map((p) => ({
              "@type": "Offer",
              name: p.name,
              price: p.price,
              priceCurrency: "EUR",
              url: absoluteUrl("/woningscan"),
            })),
          },
        ]}
      />

      <PageHero
        crumbs={[{ label: "Home", to: "/" }, { label: "Woningscan" }]}
        eyebrow="DIMAC Woningscan"
        title="Van een eerste online inzicht tot een uitgebreide woninginspectie."
        intro={
          <>
            <p>
              Een woning kopen of renoveren? DIMAC helpt u om de bouwtechnische aandachtspunten en mogelijke
              renovatiebehoeften beter te begrijpen. Begin gratis online of kies voor een professionele inspectie ter plaatse.
            </p>
            <p className="text-base">DIMAC voert vanuit Diest Woningscans uit in Limburg en Vlaams-Brabant.</p>
          </>
        }
      >
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg" variant="accent">
            <a href="#pakketten">
              Vergelijk de vier mogelijkheden <ArrowRight />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/woningscan/quickscan" onClick={() => track("woningscan_click", { page_type: "woningscan", cta_label: "Hero Start de gratis Quickscan", item_id: "quickscan" })}>
              Start de gratis Quickscan
            </Link>
          </Button>
        </div>
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
              <a href="#pakketten" className="text-accent underline underline-offset-2">Vergelijk de mogelijkheden</a>
            </p>
          )}
        </div>
      </Section>

      {/* Wat onderzoeken we */}
      <Section bg="surface" eyebrow="Inhoud" title="Wat bekijken we tijdens een bouwtechnische Woningscan?">
        <p className="-mt-8 mb-10 max-w-2xl text-muted-foreground leading-relaxed">
          Tijdens een visuele inspectie ter plaatse bekijken we onder meer deze onderdelen:
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
          Wat we kunnen beoordelen, hangt ook af van de bereikbaarheid en zichtbaarheid van de verschillende onderdelen. Indien u twijfelt over de staat van het dak kan een drone inspectie nuttig zijn.{"\u00a0"}
        </p>
      </Section>
      {/* Pakketten */}
      <section id="pakketten" className="scroll-mt-24 py-20 md:py-32 bg-surface border-y border-border">
        <div className="container-wide">
          <header className="max-w-3xl mb-12 md:mb-16">
            <span className="eyebrow mb-5">Pakketten</span>
            <h2 className="font-display text-3xl md:text-5xl leading-[1.05] tracking-tight">
              Welke Woningscan past bij uw plannen?
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Vier mogelijkheden, afgestemd op de informatie die u nodig heeft. Alle prijzen {VAT_LABEL}.
            </p>
          </header>

          <div className="space-y-14">
            <div>
              <h3 className="font-display text-2xl text-primary mb-6">Online — zelf inzicht verkrijgen</h3>
              <div className="grid gap-5 md:grid-cols-2">
                {ONLINE_PRODUCTS.map((p) => <ProductCard key={p.id} p={p} />)}
              </div>
            </div>
            <div>
              <h3 className="font-display text-2xl text-primary mb-6">Ter plaatse — professionele inspectie</h3>
              <div className="grid gap-5 md:grid-cols-2">
                {PHYSICAL_PRODUCTS.map((p) => (
                  <ProductCard key={p.id} p={p} active={selected === p.id} onChoose={choose} />
                ))}
              </div>
              <label
                className={cn(
                  "mt-6 flex items-start gap-3 p-4 border bg-background cursor-pointer transition-colors duration-300 max-w-3xl",
                  drone ? "border-accent" : "border-border"
                )}
              >
                <input
                  type="checkbox"
                  checked={drone}
                  onChange={(e) => toggleDrone(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[hsl(var(--accent))]"
                />
                <span className="text-sm">
                  <span className="block text-primary font-medium">
                    Optioneel bij een inspectie ter plaatse: {DRONE_OPTION.name.toLowerCase()}{" "}
                    <span className="text-accent">+{formatEuro(DRONE_OPTION.price)} {VAT_LABEL}</span>
                  </span>
                  <span className="block mt-0.5 text-xs text-muted-foreground leading-relaxed">{DRONE_OPTION.text}</span>
                  <span className="block mt-0.5 text-xs text-muted-foreground">{DRONE_OPTION.condition}</span>
                </span>
              </label>
            </div>
          </div>

          {/* Vergelijking */}
          <div className="mt-16">
            <h3 className="font-display text-2xl text-primary mb-2">De vier mogelijkheden naast elkaar</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              Het verschil tussen Woningscan en Woningscan Plus: Plus biedt een uitgebreidere beoordeling, fotodocumentatie,
              een gedetailleerder rapport en meer aandacht voor renovatieplanning en samenhang.
            </p>
            <div className="relative overflow-x-auto border border-border bg-background">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="p-4 text-left font-normal text-muted-foreground">Kenmerk</th>
                    {COMPARE_PRODUCTS.map((p) => (
                      <th key={p.id} scope="col" className="p-4 text-left font-medium text-primary">{p.shortTitle}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((row) => (
                    <tr key={row.label} className="border-b border-border last:border-0">
                      <th scope="row" className="p-4 text-left font-normal text-muted-foreground">{row.label}</th>
                      {row.values.map((v, i) => (
                        <td key={i} className="p-4 text-primary">{renderCell(v)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Aanvraag */}
      <section id="aanvraag" className="scroll-mt-24 py-20 md:py-32 bg-background">
        <div ref={formRef} className="container-tight scroll-mt-24 grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <span className="eyebrow mb-5">Aanvraag</span>
            <h2 className="font-display text-3xl md:text-4xl leading-tight">Vraag uw Woningscan ter plaatse aan.</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Een aanvraag is nog geen bevestigde afspraak of betaling. Na ontvangst stemmen we met u het bezoek af.
              Betalen gebeurt niet online.
            </p>

            <div className="mt-8 border border-border bg-surface p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-4">Uw keuze</p>
              <div className="grid grid-cols-2 gap-2 mb-5" role="radiogroup" aria-label="Kies uw Woningscan">
                {PHYSICAL_PRODUCTS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={selected === p.id}
                    onClick={() => { setSelected(p.id as PackageId); setSent(false); track("woningscan_package_select", { page_type: "woningscan", item_id: p.id }); }}
                    className={cn(
                      "focus-ring min-h-[44px] px-3 py-2 border text-sm text-left transition-colors",
                      selected === p.id ? "border-accent text-primary bg-background" : "border-border text-primary fine:hover:border-primary/40"
                    )}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              {pkg ? (
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt>{pkg.name}</dt>
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
                    <dd className="tabular-nums">{drone ? `+${formatEuro(DRONE_OPTION.price)}` : "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-4 pt-3 mt-3 border-t border-border font-medium text-primary">
                    <dt>Totaal {VAT_LABEL}</dt>
                    <dd className="tabular-nums text-lg" data-testid="scan-total">{formatEuro(scanTotal(pkg.id, drone))}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">Kies hierboven Woningscan of Woningscan Plus.</p>
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
                {pkg ? `${pkg.name} aanvragen — ${formatEuro(scanTotal(pkg.id, drone))}` : "Kies eerst een Woningscan"}
                <ArrowRight />
              </Button>
              <p className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                <Mail className="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Na het klikken opent uw e-mailprogramma met een ingevuld bericht. Uw aanvraag is pas verstuurd wanneer u
                  dat bericht zelf verzendt.
                  {testMode && ` Testmodus: het bericht is uitsluitend gericht aan ${recipient}.`}
                </span>
              </p>
              {sent && pkg && (
                <div role="status" className="border-l-2 border-accent bg-accent-soft/50 p-5 text-sm text-primary leading-relaxed">
                  <strong className="block mb-1">Uw bericht voor {pkg.name} is voorbereid.</strong>
                  Controleer en verzend het bericht in uw e-mailprogramma om de aanvraag af te ronden. Zonder verzending
                  ontvangen wij niets.
                </div>
              )}
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
            stemmen we af op de ligging van de woning en de gekozen Woningscan. Ook een{" "}
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
