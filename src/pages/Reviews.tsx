import { Star } from "lucide-react";
import { Section } from "@/components/site/Section";
import { CTABlock } from "@/components/site/CTABlock";
import { usePageMeta } from "@/hooks/use-page-meta";

const REVIEWS = [
  { q: "Zeer tevreden over de communicatie en het eindresultaat. Alles verliep volgens afspraak.", place: "Diest" },
  { q: "Correcte planning, duidelijke offerte en mooie afwerking. Aanrader.", place: "Scherpenheuvel" },
  { q: "Goede opvolging en professioneel uitgevoerd werk. Wij zijn zeer tevreden.", place: "Halen" },
  { q: "Vanaf het eerste gesprek voelde het professioneel en betrouwbaar aan.", place: "Tessenderlo" },
  { q: "Duidelijk aanspreekpunt gedurende het volledige traject, zonder losse eindjes.", place: "Diest" },
  { q: "Vakwerk in afwerking en oog voor detail waar het echt telt.", place: "Diest" },
];

const Reviews = () => {
  usePageMeta({
    title: "Reviews | Dimac Diest",
    description: "Wat klanten zeggen over Dimac. Placeholder reviews in afwachting van geverifieerde beoordelingen.",
  });
  return (
    <>
      <section className="group pt-32 md:pt-40 pb-16 bg-surface">
        <div className="container-tight fade-up max-w-3xl">
          <span className="eyebrow mb-6">Reviews</span>
          <h1 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-primary">
            Wat klanten zeggen
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Vertrouwen ontstaat door duidelijkheid. Onderstaande reviews zijn placeholders en worden vervangen
            door effectieve klantbeoordelingen.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <blockquote
              key={i}
              className="card-interactive border border-border p-8 md:p-10 bg-background flex flex-col"
              data-reveal
              data-reveal-delay={String(Math.min(i + 1, 6))}
            >
              <div className="flex gap-1 mb-6 text-accent">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-accent" strokeWidth={0} />
                ))}
              </div>
              <p className="font-display text-lg leading-snug text-primary flex-1">"{r.q}"</p>
              <footer className="mt-8 pt-6 border-t border-border text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Voorbeeldreview · {r.place}
              </footer>
            </blockquote>
          ))}
        </div>
      </Section>

      <CTABlock
        eyebrow="Volgende stap"
        title="Werk aan uw eigen renovatie?"
        text="Vraag een offerte aan of plan een woningscan om eerst inzicht te krijgen."
        primary={{ label: "Vraag een offerte aan", to: "/contact" }}
        secondary={{ label: "Plan uw woningscan", to: "/woningscan" }}
      />
    </>
  );
};

export default Reviews;
