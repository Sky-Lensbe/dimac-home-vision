import { PageHero } from "@/components/site/PageHero";
import { PageSEO } from "@/components/seo/PageSEO";
import { COMPANY } from "@/lib/site";

const Privacy = () => (
  <>
    <PageSEO path="/privacy" title="Privacyverklaring | Dimac" description="Hoe Dimac omgaat met de gegevens die u via de website deelt." />
    <PageHero eyebrow="Privacy" title="Privacyverklaring" crumbs={[{ label: "Home", to: "/" }, { label: "Privacy" }]} />
    <section className="py-16 md:py-24">
      <div className="container-tight max-w-3xl space-y-8 text-muted-foreground leading-relaxed">
        <div>
          <h2 className="font-display text-2xl text-primary mb-3">Welke gegevens</h2>
          <p>
            De formulieren op deze website slaan zelf geen gegevens op. Ze bereiden een e-mail voor in uw eigen
            e-mailprogramma. Pas wanneer u die e-mail verstuurt, ontvangt {COMPANY.name} de gegevens die u invulde.
          </p>
        </div>
        <div>
          <h2 className="font-display text-2xl text-primary mb-3">Waarvoor</h2>
          <p>
            Wij gebruiken uw gegevens uitsluitend om uw vraag te beantwoorden, een Woningscan in te plannen of uw
            renovatieplannen met u te bespreken. Wij verkopen of delen ze niet met derden voor marketing.
          </p>
        </div>
        <div>
          <h2 className="font-display text-2xl text-primary mb-3">Uw rechten</h2>
          <p>
            U kunt uw gegevens altijd opvragen, laten verbeteren of laten verwijderen via{" "}
            <a href={`mailto:${COMPANY.email}`} className="text-accent underline underline-offset-2">
              {COMPANY.email}
            </a>
            .
          </p>
        </div>
        <p className="text-sm border-l-2 border-accent pl-4">
          De volledige wettelijke bedrijfsgegevens (maatschappelijke zetel, ondernemingsnummer) worden vóór de
          livegang aangevuld.
        </p>
      </div>
    </section>
  </>
);

export default Privacy;
