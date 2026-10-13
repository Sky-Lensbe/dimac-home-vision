import { Section } from "@/components/site/Section";
import { CTABlock } from "@/components/site/CTABlock";
import { PageHero } from "@/components/site/PageHero";
import { ImagePlaceholder } from "@/components/site/ImagePlaceholder";
import { PageSEO } from "@/components/seo/PageSEO";
import { breadcrumbSchema, organizationSchema } from "@/lib/site";
import prep from "@/assets/preparation.jpg";

const values = [
  ["Doordachtheid", "Eerst begrijpen, dan handelen."],
  ["Transparantie", "Duidelijkheid over mogelijkheden, beperkingen, kosten en verwachtingen."],
  ["Vakmanschap", "Technische expertise gecombineerd met praktische bouwervaring."],
  ["Eigenaarschap", "Verantwoordelijkheid nemen voor beslissingen, uitvoering en resultaten."],
  ["Duurzame waardecreatie", "Verder kijken dan vandaag, met aandacht voor kwaliteit, levensduur en toekomstig vastgoedpotentieel."],
];

const Over = () => (
  <>
    <PageSEO
      path="/over"
      title="Over Dimac | Vastgoedontwikkelaar met bouwexpertise"
      description="Dimac ontwikkelt eigen vastgoed en deelt die praktijkkennis via totaalrenovaties en Woningscans. Ontdek onze visie, missie en waarden."
      schemas={[organizationSchema(), breadcrumbSchema([{ label: "Home", to: "/" }, { label: "Over Dimac" }])]}
    />
    <PageHero
      crumbs={[{ label: "Home", to: "/" }, { label: "Over Dimac" }]}
      eyebrow="Over Dimac"
      title="Vastgoed ontwikkelen. Expertise delen. Waarde creëren."
      intro={
        <p>
          Dimac is in de eerste plaats een vastgoedontwikkelaar. Wat we leren bij onze eigen projecten, maken we
          toegankelijk voor wie belangrijke beslissingen neemt over de eigen woning.
        </p>
      }
    />

    <Section>
      <div className="grid gap-14 lg:grid-cols-2 lg:items-start">
        <div className="space-y-12">
          <div data-reveal>
            <h2 className="eyebrow mb-4">Visie</h2>
            <p className="font-display text-3xl md:text-4xl leading-tight">De juiste keuzes bepalen de waarde van morgen.</p>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Goed vastgoed begint met inzicht: in de mogelijkheden van een pand, de technische uitdagingen en de
              keuzes die op lange termijn het verschil maken. Onze ambitie is om vastgoed met potentieel te
              herkennen, doordacht te ontwikkelen en duurzame meerwaarde te realiseren.
            </p>
          </div>
          <div data-reveal>
            <h2 className="eyebrow mb-4">Missie</h2>
            <p className="text-muted-foreground leading-relaxed">
              Dimac ontwikkelt eigen vastgoedprojecten, van nieuwbouw tot de volledige transformatie van bestaande
              woningen. Met diezelfde praktijkkennis helpen we eigenaars bij totaalrenovaties en ondersteunen we
              kandidaat-kopers en woningeigenaars met deskundige Woningscans.
            </p>
          </div>
        </div>
        <div data-reveal>
          <ImagePlaceholder src={prep} label="Technische voorbereiding van een project" aspect="portrait" showLabelOverlay={false} />
        </div>
      </div>
    </Section>

    <Section bg="surface" eyebrow="Waar we voor staan" title="Vijf principes, zichtbaar in ons werk">
      <dl className="divide-y divide-border border-y border-border">
        {values.map(([t, d]) => (
          <div key={t} className="grid gap-2 md:grid-cols-[1fr_2fr] py-7" data-reveal>
            <dt className="font-display text-2xl text-primary">{t}</dt>
            <dd className="text-muted-foreground leading-relaxed md:pt-1">{d}</dd>
          </div>
        ))}
      </dl>
    </Section>

    <Section eyebrow="In de praktijk" title="Hoe dat zich vertaalt">
      <ul className="grid gap-px bg-border border border-border sm:grid-cols-2 lg:grid-cols-5">
        {[
          "Technische analyse vóór uitvoering",
          "Praktische bouwervaring",
          "Doordachte keuzes",
          "Duidelijke communicatie",
          "Een bouwtechnische partner waar je op kan rekenen, vandaag en in de toekomst ",
        ].map((p, i) => (
          <li key={p} className="bg-background p-6 text-primary" data-reveal data-reveal-delay={String((i % 4) + 1)}>
            <span className="block h-px w-8 bg-accent mb-5" />
            {p}
          </li>
        ))}
      </ul>
    </Section>

    <CTABlock
      title="Benieuwd wat wij voor u kunnen betekenen?"
      text="Wilt u inzicht in een woning, of plant u een volledige renovatie?"
      primary={{ label: "Ontdek de Woningscan", to: "/woningscan" }}
      secondary={{ label: "Bespreek uw renovatieplannen", to: "/totaalrenovaties#intake" }}
    />
  </>
);

export default Over;
