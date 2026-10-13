import { Link, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageSEO } from "@/components/seo/PageSEO";

const NotFound = () => {
  const location = useLocation();

  return (
    <>
      <PageSEO
        path={location.pathname}
        title="Pagina niet gevonden | Dimac"
        description="Deze pagina bestaat niet of is verplaatst. Bekijk de diensten van Dimac of neem rechtstreeks contact op."
        robots="noindex, follow"
      />
      <section className="pt-32 md:pt-40 pb-24 md:pb-32 bg-surface">
        <div className="container-tight max-w-2xl fade-up">
          <span className="eyebrow mb-6">404</span>
          <h1 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-primary">
            Deze pagina bestaat niet
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            De pagina die u zoekt is verplaatst of heeft nooit bestaan. Via onderstaande links vindt u
            wellicht wat u zocht.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Button asChild variant="solid" size="lg">
              <Link to="/">
                Terug naar de startpagina <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Neem contact op</Link>
            </Button>
          </div>
          <ul className="mt-12 space-y-3 text-muted-foreground">
            <li>
              <Link to="/totaalrenovaties" className="link-underline text-accent focus-ring">
                Totaalrenovaties
              </Link>
            </li>
            <li>
              <Link to="/woningscan" className="link-underline text-accent focus-ring">
                De Woningscan en pakketten
              </Link>
            </li>
            <li>
              <Link to="/projecten" className="link-underline text-accent focus-ring">
                Onze projecten
              </Link>
            </li>
            <li>
              <Link to="/over" className="link-underline text-accent focus-ring">
                Over Dimac
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
};

export default NotFound;
