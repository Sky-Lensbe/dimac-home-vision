import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/Section";
import { PageHero } from "@/components/site/PageHero";
import { FAQ } from "@/components/site/FAQ";
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
import { breadcrumbSchema, faqSchema, organizationSchema } from "@/lib/site";
import { buildMailto, openMailto } from "@/lib/mailto";
import { track } from "@/lib/analytics";
import renoAsset from "@/assets/total-realisation.jpg.asset.json";

const content = [
  {
    title: "Wat een totaalrenovatie inhoudt",
    text: "Een totaalrenovatie vernieuwt een woning grondig: structuur en schil, technieken zoals elektriciteit, sanitair en verwarming, en de afwerking. Die onderdelen worden samen bekeken in plaats van als losse opdrachten.",
  },
  {
    title: "Waarom de volgorde van werken telt",
    text: "Leidingen vóór vloeren, dichting vóór afwerking, isolatie afgestemd op ventilatie. Een verkeerde volgorde betekent later opnieuw openbreken wat net klaar was.",
  },
  {
    title: "Disciplines die op elkaar aansluiten",
    text: "Elke discipline beïnvloedt de volgende. Wij bewaken die aansluitingen, zodat details en overgangen kloppen.",
  },
  {
    title: "Technische voorbereiding",
    text: "We starten met een analyse van het pand. Wat is de staat, wat zijn de beperkingen, waar liggen de kansen? Dat is dezelfde aanpak als bij onze eigen ontwikkelingen.",
  },
  {
    title: "Heldere afspraken over planning en scope",
    text: "Vóór de uitvoering weet u wat er gebeurt, in welke volgorde en wat binnen of buiten de opdracht valt.",
  },
];

const flow = [
  { title: "Kennismaking", text: "We bespreken uw woning, plannen en verwachtingen." },
  { title: "Analyse", text: "Technische beoordeling van het pand en de mogelijkheden." },
  { title: "Plan en scope", text: "Een samenhangend renovatieplan met duidelijke afspraken." },
  { title: "Planning", text: "De werken krijgen een volgorde die technisch klopt." },
  { title: "Uitvoering", text: "De disciplines worden vanuit één plan op elkaar afgestemd." },
  { title: "Oplevering", text: "Aansluitingen en details worden samen overlopen." },
];

const faq = [
  {
    q: "Voeren jullie ook kleinere renovatiewerken uit?",
    a: "Onze focus ligt op volledige renovaties waarbij meerdere disciplines samenkomen. Voor afzonderlijke kleine werken zijn wij niet de juiste partner.",
  },
  {
    q: "Is een Woningscan nodig vóór een totaalrenovatie?",
    a: "Niet verplicht. Een Woningscan Compleet geeft u wel vooraf een indicatie van de prioriteiten en kosten, wat helpt om uw renovatie realistisch te plannen.",
  },
  {
    q: "Wat gebeurt er na mijn aanvraag?",
    a: "We bekijken uw informatie en nemen contact op voor een eerste gesprek. Daarin bespreken we of en hoe we u het best kunnen helpen.",
  },
];

const Totaalrenovaties = () => {
  const [f, setF] = useState({
    type: "",
    location: "",
    budget: "",
    start: "",
    scope: "",
    approach: "",
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [consent, setConsent] = useState(false);
  const [sent, setSent] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    track("renovation_view", { page_type: "totaalrenovaties" });
  }, []);

  const set = (k: keyof typeof f) => (v: string) => {
    if (!started.current) {
      started.current = true;
      track("renovation_intake_start", { page_type: "totaalrenovaties" });
    }
    setF((x) => ({ ...x, [k]: v }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const url = buildMailto(
      "Renovatieplannen bespreken",
      [
        ["Type renovatie", f.type],
        ["Locatie", f.location],
        ["Indicatief budget", f.budget],
        ["Gewenste start", f.start],
        ["Omvang", f.scope],
        ["Gewenste aanpak", f.approach],
        ["Naam", f.name],
        ["E-mail", f.email],
        ["Telefoon", f.phone],
        ["Toelichting", f.message],
      ],
      "Beste Dimac, graag bespreek ik mijn renovatieplannen."
    );
    track("renovation_mailto_handoff", { page_type: "totaalrenovaties" });
    openMailto(url);
    setSent(true);
  };

  return (
    <>
      <PageSEO
        path="/totaalrenovaties"
        title="Totaalrenovatie Diest | Doordachte aanpak van analyse tot uitvoering | Dimac"
        description="Totaalrenovaties met een doordachte aanpak. Dimac combineert ervaring in vastgoedontwikkeling met een gestructureerde planning en afstemming van alle werken."
        schemas={[
          organizationSchema(),
          breadcrumbSchema([{ label: "Home", to: "/" }, { label: "Totaalrenovaties" }]),
          faqSchema(faq),
        ]}
      />
      <PageHero
        crumbs={[{ label: "Home", to: "/" }, { label: "Totaalrenovaties" }]}
        eyebrow="Totaalrenovaties"
        title="Totaalrenovaties met een doordachte aanpak."
        intro={
          <>
            <p>
              Een woning volledig renoveren vraagt meer dan vakmanschap alleen. Het vraagt inzicht, een duidelijke
              planning en een goede afstemming tussen de verschillende werken.
            </p>
            <p>
              Bij Dimac combineren we onze ervaring in vastgoedontwikkeling met een gestructureerde aanpak van
              totaalrenovaties.
            </p>
          </>
        }
      >
        <div className="mt-10">
          <Button asChild size="lg">
            <a href="#intake">
              Bespreek uw renovatieplannen <ArrowRight />
            </a>
          </Button>
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr]">
          <div className="lg:sticky lg:top-28 self-start" data-reveal>
            <ImagePlaceholder src={renoAsset.url} label="Totaalrenovatie van een bestaande woning" aspect="portrait" showLabelOverlay={false} />
          </div>
          <div className="divide-y divide-border border-y border-border">
            {content.map((c) => (
              <div key={c.title} className="py-8" data-reveal>
                <h2 className="font-display text-2xl md:text-3xl text-primary">{c.title}</h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section bg="surface" eyebrow="Verloop" title="Van analyse tot uitvoering">
        <ol className="grid gap-px bg-border border border-border sm:grid-cols-2 lg:grid-cols-3">
          {flow.map((s, i) => (
            <li key={s.title} className="bg-background p-7" data-reveal data-reveal-delay={String((i % 3) + 1)}>
              <span className="font-display text-3xl text-accent tabular-nums">0{i + 1}</span>
              <h3 className="mt-4 font-medium text-primary">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-sm text-muted-foreground max-w-2xl" data-reveal>
          Eerst inzicht in de staat en kosten?{" "}
          <Link to="/woningscan?pakket=compleet" className="text-accent underline underline-offset-2">
            Bekijk de Woningscan Compleet
          </Link>
          .
        </p>
      </Section>

      <section id="intake" className="scroll-mt-24 py-20 md:py-32 bg-background">
        <div className="container-tight grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <span className="eyebrow mb-5">Projectintake</span>
            <h2 className="font-display text-3xl md:text-4xl leading-tight">Bespreek uw renovatieplannen</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Vertel ons kort over uw woning en plannen. Hoe concreter, hoe beter we kunnen inschatten hoe we u
              kunnen helpen. Geen enkel veld bindt u ergens aan.
            </p>
          </div>
          <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
            <SelectField
              id="type"
              label="Type renovatie"
              required
              value={f.type}
              onChange={set("type")}
              options={["Volledige renovatie van een woning", "Grondige renovatie na aankoop", "Transformatie of herindeling", "Andere"]}
            />
            <TextField id="location" label="Locatie (gemeente)" required value={f.location} onChange={set("location")} />
            <SelectField
              id="budget"
              label="Indicatief budget"
              value={f.budget}
              onChange={set("budget")}
              options={["Minder dan €50.000", "€50.000 – €100.000", "€100.000 – €150.000", "€150.000 – €250.000", "Meer dan €250.000", "Nog niet bepaald"]}
            />
            <SelectField
              id="start"
              label="Gewenste startperiode"
              value={f.start}
              onChange={set("start")}
              options={["Binnen 3 maanden", "3 tot 6 maanden", "6 tot 12 maanden", "Later dan 12 maanden", "Nog niet bepaald"]}
            />
            <SelectField
              id="scope"
              label="Algemene projectomvang"
              value={f.scope}
              onChange={set("scope")}
              options={["Volledige woning", "Meerdere ruimtes en technieken", "Schil en technieken", "Nog te bepalen"]}
            />
            <SelectField
              id="approach"
              label="Gewenste aanpak"
              value={f.approach}
              onChange={set("approach")}
              options={["Volledige uitvoering en coördinatie door Dimac", "Samen bekijken wat het best past", "Ik heb al een architect"]}
            />
            <TextField id="name" label="Naam" required autoComplete="name" value={f.name} onChange={set("name")} />
            <TextField id="email" type="email" label="E-mail" required autoComplete="email" value={f.email} onChange={set("email")} />
            <TextField id="phone" type="tel" label="Telefoon" autoComplete="tel" className="sm:col-span-2" value={f.phone} onChange={set("phone")} />
            <TextAreaField id="message" label="Toelichting" className="sm:col-span-2" rows={4} value={f.message} onChange={set("message")} />
            <div className="sm:col-span-2 space-y-5">
              <ConsentField checked={consent} onChange={setConsent} />
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                Aanvraag voorbereiden <ArrowRight />
              </Button>
              <MailtoNotice />
              {sent && <HandoffMessage />}
            </div>
          </form>
        </div>
      </section>

      <Section bg="surface" eyebrow="Vragen" title="Veelgestelde vragen">
        <FAQ items={faq} className="max-w-3xl" />
      </Section>
    </>
  );
};

export default Totaalrenovaties;
