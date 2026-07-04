import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Star, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImagePlaceholder } from "@/components/site/ImagePlaceholder";
import { Section } from "@/components/site/Section";
import { BulletList } from "@/components/site/BulletList";
import { CTABlock } from "@/components/site/CTABlock";
import { WorkflowSteps } from "@/components/site/WorkflowSteps";
import { usePageMeta } from "@/hooks/use-page-meta";
import { services } from "@/data/services";
import hero from "@/assets/hero.jpg";
import bathroom from "@/assets/project-bathroom.jpg";
import kitchen from "@/assets/project-kitchen.jpg";
import roof from "@/assets/project-roof.jpg";
import total from "@/assets/project-total.jpg";
import prep from "@/assets/preparation.jpg";

const Index = () => {
  usePageMeta({
    title: "Aannemer in Diest | Totaalrenovatie & Woningscan | Dimac",
    description:
      "Dimac is uw aannemer in regio Diest voor totaalrenovaties en nieuwbouw. Start met een woningscan en krijg duidelijkheid vóór u verbouwt.",
  });

  const homeServices = services.filter((s) =>
    ["totaalrenovatie", "nieuwbouw", "badkamer-renovatie", "keuken-renovatie", "dakwerken", "technieken"].includes(s.slug)
  );

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[100svh] flex items-end pt-32 pb-16 md:pb-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={hero}
            alt=""
            className="h-full w-full object-cover"
            width={1600}
            height={1200}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-primary/35 to-primary/10" />
        </div>
        <div className="container-wide relative">
          <div className="max-w-3xl text-primary-foreground fade-up">
            <span className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-accent mb-8">
              <span className="h-px w-8 bg-accent" />
              Aannemer in regio Diest
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl leading-[1.02] tracking-tight">
              Renoveren zonder giswerk en met één aanspreekpunt.
            </h1>
            <p className="mt-8 text-lg md:text-xl text-primary-foreground/85 max-w-2xl leading-relaxed">
              Dimac begeleidt uw renovatie in ruime regio Diest van eerste analyse tot volledige uitvoering.
              Eerst een beter inzicht krijgen in uw (toekomstige) woning? Bekijk de woningscan.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild variant="solid" size="lg">
                <Link to="/contact">Vraag een offerte aan <ArrowRight className="w-4 h-4" /></Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-primary-foreground/70 text-primary-foreground hover:bg-primary-foreground hover:text-primary hover:border-primary-foreground"
              >
                <Link to="/woningscan">Plan uw woningscan</Link>
              </Button>
            </div>

            {/* Trust bar */}
            <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 text-primary-foreground/85 max-w-2xl">
              <div className="flex items-center gap-3 border-t border-primary-foreground/20 pt-5">
                <Star className="w-4 h-4 text-accent fill-accent" strokeWidth={0} />
                <span className="text-sm">5/5 klanttevredenheid<span className="block text-[11px] text-primary-foreground/50 uppercase tracking-widest mt-1">Placeholder</span></span>
              </div>
              <div className="flex items-center gap-3 border-t border-primary-foreground/20 pt-5">
                <MapPin className="w-4 h-4 text-accent" />
                <span className="text-sm">Actief in regio Diest<span className="block text-[11px] text-primary-foreground/50 uppercase tracking-widest mt-1">& omgeving</span></span>
              </div>
              <div className="flex items-center gap-3 border-t border-primary-foreground/20 pt-5">
                <Hammer className="w-4 h-4 text-accent" />
                <span className="text-sm">20+ jaar ervaring<span className="block text-[11px] text-primary-foreground/50 uppercase tracking-widest mt-1">Placeholder</span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TWEE INSTAPPADEN */}
      <Section eyebrow="Twee instappaden" title="Wat is voor u de juiste eerste stap?">
        <div className="grid gap-px bg-border border border-border">
          <div className="grid md:grid-cols-2 gap-px bg-border">
            <div className="bg-background p-10 md:p-14 group hover:bg-surface transition-colors duration-500">
              <span className="font-display text-accent text-2xl">01</span>
              <h3 className="font-display text-2xl md:text-3xl mt-4 mb-4 text-primary leading-tight">
                Ik wil meteen verbouwen
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-8">
                U weet wat u wil en zoekt een betrouwbare partner voor de uitvoering van uw project.
              </p>
              <Button asChild variant="ghost" className="px-0 h-auto text-accent hover:bg-transparent hover:text-primary">
                <Link to="/diensten">Bekijk onze diensten <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </div>
            <div className="bg-background p-10 md:p-14 group hover:bg-surface transition-colors duration-500">
              <span className="font-display text-accent text-2xl">02</span>
              <h3 className="font-display text-2xl md:text-3xl mt-4 mb-4 text-primary leading-tight">
                Ik wil eerst duidelijkheid
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-8">
                U wil eerst weten wat nodig is, wat het kost en hoe u uw renovatie het best aanpakt.
              </p>
              <Button asChild variant="ghost" className="px-0 h-auto text-accent hover:bg-transparent hover:text-primary">
                <Link to="/woningscan">Ontdek de woningscan <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* WONINGSCAN TEASER */}
      <section className="py-20 md:py-32 bg-surface">
        <div className="container-tight grid gap-14 lg:grid-cols-[1fr_1.1fr] items-center">
          <div>
            <ImagePlaceholder label="Detail voorbereiding & analyse" src={prep} aspect="portrait" />
          </div>
          <div>
            <span className="eyebrow mb-5">Woningscan</span>
            <h2 className="font-display text-3xl md:text-5xl leading-[1.05] text-primary mb-6">
              Begin met een duidelijk plan
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
              Met onze woningscan krijgt u een helder beeld van uw volledige woning, de
              aandachtspunten en de beste aanpak. Geen aannames, maar concreet advies waarop u kan
              bouwen.
            </p>
            <BulletList
              items={[
                "Inzicht vóór u beslist",
                "Minder verrassingen tijdens de werken",
                "Concreet advies op maat",
                "Scanbedrag wordt verrekend bij uitvoering",
              ]}
              className="mb-10"
            />
            <Button asChild variant="solid" size="lg">
              <Link to="/woningscan">Plan uw woningscan <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* DIENSTEN */}
      <Section eyebrow="Diensten" title="Van ruwbouw tot afwerking">
        <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed mb-14">
          Dimac realiseert renovaties en nieuwbouwprojecten van A tot Z, met één aanspreekpunt en duidelijke opvolging.
        </p>
        <div className="grid gap-px bg-border border border-border md:grid-cols-2 lg:grid-cols-3">
          {homeServices.map((s, i) => (
            <Link
              key={s.slug}
              to={`/diensten/${s.slug}`}
              className="group bg-background p-8 md:p-10 flex flex-col hover:bg-surface transition-colors duration-500"
            >
              <span className="font-display text-accent text-sm">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-2xl mt-4 mb-3 text-primary leading-tight">{s.overviewTitle}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{s.overviewText}</p>
              <span className="mt-8 inline-flex items-center gap-2 text-sm text-accent group-hover:gap-3 transition-all">
                Meer over deze dienst <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/diensten">Bekijk alle diensten</Link>
          </Button>
        </div>
      </Section>

      {/* WERKWIJZE */}
      <Section eyebrow="Werkwijze" title="Zo verloopt een traject bij Dimac" bg="surface">
        <WorkflowSteps
          steps={[
            { title: "Kennismaking of woningscan", text: "We bekijken uw woning en situatie, en luisteren naar uw plannen." },
            { title: "Analyse en advies", text: "U krijgt duidelijke inzichten en concrete mogelijkheden." },
            { title: "Offerte", text: "Een transparante prijs en duidelijke planning." },
            { title: "Uitvoering", text: "Wij coördineren en realiseren uw project van A tot Z." },
            { title: "Oplevering", text: "Alles wordt correct afgewerkt en opgeleverd." },
          ]}
        />
        <div className="mt-14">
          <Button asChild variant="link" className="text-accent">
            <Link to="/werkwijze">Volledige werkwijze bekijken <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>
      </Section>

      {/* REALISATIES */}
      <Section eyebrow="Realisaties" title="Realisaties in regio Diest">
        <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed mb-14">
          Bekijk hoe wij woningen omvormen tot duurzame en kwalitatieve leefruimtes,
          met oog voor detail en afwerking.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { src: bathroom, label: "Badkamerrenovatie met zorg voor afwerking" },
            { src: kitchen, label: "Keukenrenovatie waar technieken en maatwerk samenkomen" },
            { src: roof, label: "Dakwerken met aandacht voor details" },
            { src: total, label: "Totaalrenovatie met één duidelijke planning" },
          ].map((p) => (
            <figure key={p.label} className="fade-up">
              <ImagePlaceholder src={p.src} label={p.label} aspect="landscape" />
              <figcaption className="mt-4 text-sm text-primary/80 max-w-md">{p.label}</figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-14">
          <Button asChild variant="outline">
            <Link to="/realisaties">Bekijk realisaties <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>
      </Section>

      {/* REVIEWS */}
      <Section eyebrow="Reviews" title="Wat klanten zeggen" bg="surface">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            "Zeer tevreden over de communicatie en het eindresultaat. Alles verliep volgens afspraak.",
            "Correcte planning, duidelijke offerte en mooie afwerking. Aanrader.",
            "Goede opvolging en professioneel uitgevoerd werk. Wij zijn zeer tevreden.",
          ].map((q, i) => (
            <blockquote key={i} className="bg-background p-8 md:p-10 border border-border">
              <div className="flex gap-1 mb-6 text-accent">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-accent" strokeWidth={0} />
                ))}
              </div>
              <p className="font-display text-lg leading-snug text-primary">"{q}"</p>
              <footer className="mt-8 pt-6 border-t border-border text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Voorbeeldreview · Placeholder
              </footer>
            </blockquote>
          ))}
        </div>
      </Section>

      {/* OVER DIMAC */}
      <Section eyebrow="Over Dimac" title="Uw aannemer in regio Diest">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-5 text-lg text-muted-foreground leading-relaxed max-w-xl">
            <p>
              Dimac is een lokale bouwpartner met meer dan 20 jaar ervaring in renovatie en nieuwbouw.
              Wij combineren vakmanschap met een persoonlijke aanpak en duidelijke communicatie.
            </p>
            <p>
              U heeft één aanspreekpunt voor uw volledige project, van eerste analyse tot oplevering.
            </p>
            <div className="pt-4">
              <Button asChild variant="outline">
                <Link to="/over">Leer Dimac beter kennen</Link>
              </Button>
            </div>
          </div>
          <div>
            <ImagePlaceholder label="Team Dimac" src={total} aspect="landscape" />
          </div>
        </div>
      </Section>

      {/* FINAL CTA */}
      <CTABlock
        eyebrow="Volgende stap"
        title="Klaar om uw renovatie te starten?"
        text="Twijfelt u nog over de aanpak of wil u meteen starten? Wij helpen u graag met de juiste eerste stap."
        primary={{ label: "Vraag een offerte aan", to: "/contact" }}
        secondary={{ label: "Plan uw woningscan", to: "/woningscan" }}
      />
    </>
  );
};

export default Index;
