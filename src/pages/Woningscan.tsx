import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/Section";
import { BulletList } from "@/components/site/BulletList";
import { WorkflowSteps } from "@/components/site/WorkflowSteps";
import { FAQ } from "@/components/site/FAQ";
import { CTABlock } from "@/components/site/CTABlock";
import { ImagePlaceholder } from "@/components/site/ImagePlaceholder";
import { usePageMeta } from "@/hooks/use-page-meta";
import prep from "@/assets/preparation.jpg";

const Woningscan = () => {
  usePageMeta({
    title: "Woningscan regio Diest | Inzicht vóór renovatie of aankoop | Dimac",
    description:
      "Laat een woningscan uitvoeren door Dimac in ruime regio Diest. Inclusief 25-punten rapport en advies. Verrekenbaar bij renovatie.",
  });

  return (
    <>
      <section className="pt-32 md:pt-40 pb-16 md:pb-24 bg-surface">
        <div className="container-tight grid gap-12 lg:grid-cols-[1.1fr_1fr] items-center">
          <div className="fade-up">
            <span className="eyebrow mb-6">Woningscan</span>
            <h1 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-primary">
              Woningscan in regio Diest
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Krijg eerst duidelijkheid over uw woning en maak daarna de juiste renovatiekeuzes.
              Zonder verrassingen, met concreet advies.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button asChild variant="solid" size="lg">
                <Link to="/contact">Plan uw woningscan <ArrowRight className="w-4 h-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/contact">Vraag een offerte aan</Link>
              </Button>
            </div>
          </div>
          <div className="fade-up delay-2">
            <ImagePlaceholder label="Detail woningscan analyse" src={prep} aspect="portrait" />
          </div>
        </div>
      </section>

      <Section eyebrow="Introductie" title="Eerst inzicht, daarna beslissen">
        <div className="max-w-3xl space-y-5 text-lg text-muted-foreground leading-relaxed">
          <p>Een renovatie of nieuwbouw begint vaak met vragen. Wat moet er gebeuren? Wat kost het? Waar begint u best?</p>
          <p>
            Met de woningscan van Dimac krijgt u een helder beeld van uw huidige of toekomstige woning, de aandachtspunten en de beste aanpak.
            Zo maakt u doordachte keuzes, zonder verrassingen achteraf.
          </p>
        </div>
      </Section>

      <Section eyebrow="Wat is het" title="Wat is een woningscan?" bg="surface">
        <div className="max-w-3xl space-y-5 text-lg text-muted-foreground leading-relaxed">
          <p>
            Een woningscan is een analyse van uw woning waarbij we de huidige staat, mogelijke problemen en
            renovatiekansen in kaart brengen.
          </p>
          <p>
            We bekijken uw woning ter plaatse en geven u concreet advies over wat nodig is en hoe u het best te werk gaat.
          </p>
          <p>Geen aannames, maar duidelijke inzichten waarop u kan bouwen.</p>
        </div>
      </Section>

      <Section eyebrow="Voor wie" title="Voor wie is een woningscan geschikt?">
        <BulletList
          columns={2}
          items={[
            "U wil uw woning renoveren",
            "U twijfelt over aanpak of budget",
            "U wil verrassingen vermijden",
            "U wil eerst inzicht vóór u beslist",
            "U overweegt een totaalrenovatie",
          ]}
        />
      </Section>

      <Section eyebrow="Aankoopbegeleiding" title="Een woning kopen? Laat u eerst begeleiden" bg="surface">
        <div className="grid gap-14 lg:grid-cols-2">
          <div className="space-y-5 text-muted-foreground leading-relaxed">
            <p>
              Overweegt u de aankoop van een woning die u wil renoveren? Dan is het essentieel om vooraf te weten
              waar u aan begint.
            </p>
            <p>
              Dimac kan u begeleiden tijdens het aankoopproces met een gerichte woningscan, zodat u een onderbouwde
              beslissing neemt.
            </p>
          </div>
          <div className="space-y-10">
            <div>
              <h3 className="font-display text-2xl text-primary mb-4">Inzicht met een duidelijk 25-punten rapport</h3>
              <p className="text-muted-foreground leading-relaxed mb-5">
                Tijdens de woningscan analyseren we de woning op basis van een gestructureerd 25-punten rapport. Hierbij bekijken we onder andere:
              </p>
              <BulletList
                items={[
                  "Structurele staat van de woning",
                  "Mogelijke gebreken en aandachtspunten",
                  "Technische installaties",
                  "Renovatieprioriteiten",
                  "Inschatting van noodzakelijke werken",
                ]}
              />
            </div>
            <div>
              <h3 className="font-display text-2xl text-primary mb-4">Voorkom verrassingen na aankoop</h3>
              <p className="text-muted-foreground leading-relaxed mb-5">
                Een woning kan er op het eerste zicht goed uitzien, maar toch verborgen kosten of problemen bevatten.
                Met een woningscan vóór aankoop:
              </p>
              <BulletList
                items={[
                  "Krijgt u een realistischer beeld van de renovatiekost",
                  "Vermijdt u onverwachte uitgaven",
                  "Kan u sterker onderhandelen",
                  "Maakt u een doordachte beslissing",
                ]}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section eyebrow="Wat krijgt u" title="Wat krijgt u concreet?">
        <BulletList
          columns={2}
          items={[
            "Analyse van de volledige woning ter plaatse",
            "Inzicht in knelpunten en mogelijkheden",
            "Advies op maat van uw situatie",
            "Bespreking van mogelijke aanpak",
            "Duidelijke volgende stappen",
          ]}
        />
      </Section>

      <section className="py-24 md:py-32 bg-surface border-y border-border">
        <div className="container-tight max-w-3xl">
          <span className="eyebrow mb-6">Voordeel</span>
          <h2 className="font-display text-3xl md:text-5xl leading-tight mb-6 text-primary">Slim starten zonder dubbel te betalen</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Beslist u om uw renovatie door Dimac te laten uitvoeren? Dan wordt het bedrag van de woningscan
            verrekend op de eerste factuur van de werken. Zo investeert u enkel in advies dat u effectief verder helpt.
          </p>
        </div>
      </section>

      <Section eyebrow="Verloop" title="Hoe verloopt een woningscan?">
        <WorkflowSteps
          steps={[
            { title: "Afspraak inplannen", text: "We plannen een moment dat voor u past." },
            { title: "Analyse ter plaatse", text: "We bekijken uw woning en brengen alles in kaart." },
            { title: "Advies en bespreking", text: "U krijgt duidelijke inzichten en mogelijke oplossingen." },
            { title: "Volgende stap bepalen", text: "U beslist hoe u verder wil gaan." },
          ]}
        />
      </Section>

      <Section eyebrow="Na de scan" title="Wat na de woningscan?" bg="surface">
        <div className="grid gap-10 lg:grid-cols-2 max-w-4xl">
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>Na de scan heeft u een duidelijk beeld van uw woning en de mogelijke aanpak. U kan:</p>
            <BulletList
              items={[
                "Zelf verder aan de slag",
                "Verschillende offertes vergelijken",
                "Of uw renovatie laten uitvoeren door Dimac",
              ]}
            />
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p><strong className="text-primary">Kiest u voor Dimac?</strong></p>
            <p>Dan begeleiden wij u van A tot Z en wordt de scan verrekend.</p>
          </div>
        </div>
      </Section>

      <Section eyebrow="Lokaal" title="Actief in regio Diest">
        <p className="max-w-3xl text-lg text-muted-foreground leading-relaxed">
          Dimac begeleidt renovatieprojecten in Diest en omliggende gemeenten. Wij kennen de lokale bouwcontext
          en zorgen voor een correcte en efficiënte aanpak.
        </p>
      </Section>

      <Section eyebrow="FAQ" title="Veelgestelde vragen" bg="surface">
        <FAQ
          className="max-w-3xl"
          items={[
            { q: "Wat kost een woningscan?", a: "De prijs hangt af van de grootte en situatie van uw woning. U ontvangt steeds een duidelijke prijs vooraf." },
            { q: "Is de scan verplicht om met Dimac samen te werken?", a: "Nee. De scan is een aparte dienst. U beslist nadien zelf hoe u verder gaat." },
            { q: "Wordt de scan altijd verrekend?", a: "De scan wordt verrekend wanneer u beslist om de renovatie door Dimac te laten uitvoeren." },
            { q: "Hoe lang duurt een woningscan?", a: "Gemiddeld duurt een scan ongeveer 1,5 tot 2 uur, afhankelijk van de woning." },
          ]}
        />
      </Section>

      <CTABlock
        eyebrow="Volgende stap"
        title="Wilt u eerst duidelijkheid over uw woning?"
        text="Plan een woningscan en krijg inzicht in de beste aanpak voor uw renovatie."
        primary={{ label: "Plan uw woningscan", to: "/contact" }}
        secondary={{ label: "Contacteer ons", to: "/contact" }}
      />
    </>
  );
};

export default Woningscan;
