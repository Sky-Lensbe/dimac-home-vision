import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { CTABlock } from "./CTABlock";
import { Section } from "./Section";
import { BulletList } from "./BulletList";
import { WorkflowSteps } from "./WorkflowSteps";
import { FAQ } from "./FAQ";
import { usePageMeta } from "@/hooks/use-page-meta";
import type { ServiceContent } from "@/data/services";

interface Props { service: ServiceContent }

export const ServicePage = ({ service: s }: Props) => {
  usePageMeta({ title: s.meta.title, description: s.meta.description });

  return (
    <>
      {/* Hero */}
      <section className="pt-32 md:pt-40 pb-16 md:pb-24 bg-surface">
        <div className="container-tight grid gap-12 lg:grid-cols-[1.1fr_1fr] items-center">
          <div className="fade-up">
            {s.hero.eyebrow && <span className="eyebrow mb-6">{s.hero.eyebrow}</span>}
            <h1 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-primary">
              {s.hero.h1}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              {s.hero.sub}
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button asChild variant="solid" size="lg">
                <Link to="/contact">Vraag een offerte aan <ArrowRight className="w-4 h-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/contact">Contacteer ons</Link>
              </Button>
            </div>
          </div>
          <div className="fade-up delay-2">
            <ImagePlaceholder label={s.hero.imageLabel} src={s.hero.image} aspect="portrait" />
          </div>
        </div>
      </section>

      {/* Intro */}
      <Section eyebrow="Introductie" title={s.intro.h2}>
        <div className="max-w-3xl space-y-5 text-lg text-muted-foreground leading-relaxed">
          {s.intro.text.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </Section>

      {/* Problem / Solution split */}
      <section className="py-20 md:py-28 bg-surface">
        <div className="container-tight grid gap-12 lg:grid-cols-2">
          <div>
            <span className="eyebrow mb-5">Herkenning</span>
            <h2 className="font-display text-3xl md:text-4xl leading-tight mb-6 text-primary">{s.problem.h2}</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {s.problem.text.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
          <div className="lg:pl-10 lg:border-l lg:border-border">
            <span className="eyebrow mb-5">Oplossing</span>
            <h2 className="font-display text-3xl md:text-4xl leading-tight mb-6 text-primary">{s.solution.h2}</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {s.solution.text.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
        </div>
      </section>

      {/* Scan bridge (optional) */}
      {s.scanBridge && (
        <CTABlock
          eyebrow="Woningscan"
          title={s.scanBridge.h2}
          text={s.scanBridge.text.join(" ")}
          primary={{ label: s.scanBridge.cta, to: s.scanBridge.to }}
          variant="dark"
        />
      )}

      {/* Scope */}
      <Section eyebrow="Wat omvat het" title={s.scope.h2}>
        {s.scope.intro && (
          <p className="max-w-3xl text-lg text-muted-foreground leading-relaxed mb-10">{s.scope.intro}</p>
        )}
        <BulletList items={s.scope.bullets} columns={2} />
      </Section>

      {/* For who + Benefits */}
      <section className="py-20 md:py-28 bg-surface">
        <div className="container-tight grid gap-14 lg:grid-cols-2">
          <div>
            <span className="eyebrow mb-5">Voor wie</span>
            <h2 className="font-display text-3xl md:text-4xl leading-tight mb-8 text-primary">{s.forWho.h2}</h2>
            <BulletList items={s.forWho.bullets} />
          </div>
          <div>
            <span className="eyebrow mb-5">Voordelen</span>
            <h2 className="font-display text-3xl md:text-4xl leading-tight mb-8 text-primary">{s.benefits.h2}</h2>
            <BulletList items={s.benefits.bullets} />
          </div>
        </div>
      </section>

      {/* Workflow */}
      <Section eyebrow="Werkwijze" title={s.workflow.h2}>
        <WorkflowSteps steps={s.workflow.steps} />
      </Section>

      {/* Outcome */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container-tight max-w-3xl">
          <span className="eyebrow mb-6 !text-accent">Resultaat</span>
          <h2 className="font-display text-3xl md:text-5xl leading-tight mb-6">{s.outcome.h2}</h2>
          <div className="space-y-4 text-primary-foreground/75 text-lg leading-relaxed">
            {s.outcome.text.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </section>

      {/* Local */}
      <Section eyebrow="Lokaal" title={s.local.h2}>
        <div className="max-w-3xl space-y-4 text-muted-foreground leading-relaxed text-lg">
          {s.local.text.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </Section>

      {/* FAQ */}
      <Section eyebrow="FAQ" title={s.faq.h2} bg="surface">
        <FAQ items={s.faq.items} className="max-w-3xl" />
      </Section>

      {/* Final CTA */}
      <CTABlock
        eyebrow="Volgende stap"
        title={s.finalCta.h2}
        text={s.finalCta.text}
        primary={s.finalCta.primary}
        secondary={s.finalCta.secondary}
      />
    </>
  );
};
