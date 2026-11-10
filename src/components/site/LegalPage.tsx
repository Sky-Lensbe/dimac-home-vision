import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageSEO } from "@/components/seo/PageSEO";
import { LEGAL_POLICY } from "@/data/legal";

export interface LegalArticle { id: string; title: string; body: ReactNode }
export const LegalLink = ({ to, children }: { to: string; children: ReactNode }) => <Link to={to} className="text-accent underline underline-offset-4 focus-ring">{children}</Link>;
export const LegalPage = ({ path, title, description, articles }: { path: string; title: string; description: string; articles: LegalArticle[] }) => (
  <>
    <PageSEO path={path} title={`${title} | DIMAC`} description={description} />
    <header className="bg-background border-b border-border pt-28 md:pt-40 pb-12 md:pb-16">
      <div className="container-tight max-w-4xl">
        <nav aria-label="Broodkruimel" className="mb-8 text-sm text-muted-foreground"><LegalLink to="/">Home</LegalLink> / {title}</nav>
        <p className="eyebrow mb-5">DIMAC · Juridische informatie</p>
        <h1 className="font-display text-4xl md:text-5xl text-primary leading-tight break-words">{title}</h1>
        <p className="mt-5 text-muted-foreground max-w-2xl leading-relaxed">{description}</p>
        <p className="mt-6 text-sm text-muted-foreground">Laatst gewijzigd: <time dateTime={LEGAL_POLICY.updated}>10 november 2026</time></p>
        <p className="mt-4 border-l-2 border-accent pl-4 text-sm text-primary leading-relaxed">Concept in preview. Nog niet definitief juridisch goedgekeurd; openstaande juridische en technische controles moeten vóór publieke lancering worden afgerond.</p>
      </div>
    </header>
    <div className="container-tight max-w-4xl py-12 md:py-16">
      <nav aria-label="Inhoudsopgave" className="border-b border-border pb-8 mb-10">
        <h2 className="font-display text-2xl text-primary mb-4">Inhoud</h2>
        <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          {articles.map((a, i) => <li key={a.id}><a href={`#${a.id}`} className="text-primary underline underline-offset-4 focus-ring">{i + 1}. {a.title}</a></li>)}
        </ol>
      </nav>
      {articles.map((a, i) => <section key={a.id} id={a.id} className="scroll-mt-28 py-8 border-b border-border last:border-0">
        <h2 className="font-display text-2xl md:text-3xl text-primary mb-5 leading-snug">{i + 1}. {a.title}</h2>
        <div className="space-y-4 text-muted-foreground leading-[1.8] break-words [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2 [&_strong]:text-primary">{a.body}</div>
      </section>)}
      <nav aria-label="Juridische pagina’s" className="mt-10 flex flex-wrap gap-x-6 gap-y-4 text-sm">
        <LegalLink to="/algemene-voorwaarden">Algemene voorwaarden</LegalLink><LegalLink to="/privacy">Privacyverklaring</LegalLink><LegalLink to="/cookies">Cookiebeleid</LegalLink><LegalLink to="/wettelijke-vermeldingen">Wettelijke vermeldingen</LegalLink>
      </nav>
    </div>
  </>
);