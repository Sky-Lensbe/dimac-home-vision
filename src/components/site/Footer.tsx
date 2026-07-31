import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { services } from "@/data/services";
import { activeRegions } from "@/data/regions";
import { BLOG_LABEL, publishedArticles } from "@/data/articles";
import { COMPANY } from "@/lib/site";
import logoAsset from "@/assets/dimac-logo.jpg.asset.json";

const linkClass =
  "link-underline text-primary/80 fine:hover:text-accent transition-colors duration-300 focus-ring";

export const Footer = () => {
  const footerArticles = publishedArticles.slice(0, 3);

  return (
    <footer className="group/footer bg-surface border-t border-border text-primary">
      <div className="container-wide py-20 md:py-28">
        <span
          aria-hidden="true"
          className="block h-px w-12 bg-accent mb-12 transition-[width] duration-700 ease-out fine:lg:group-hover/footer:w-24"
        />
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div data-reveal>
            <div className="flex items-center gap-4 mb-6">
              <img
                src={logoAsset.url}
                alt="Logo van Dimac, aannemer in regio Diest"
                className="h-14 w-14 rounded-md object-cover"
                width={56}
                height={56}
              />
              <span className="font-display text-xl text-primary">Dimac</span>
            </div>
            <p className="max-w-sm text-muted-foreground leading-relaxed">
              Uw aannemer in ruime regio Diest voor renovatie en nieuwbouw.
              Eén aanspreekpunt, van eerste analyse tot oplevering.
            </p>
            <Button asChild variant="solid" className="mt-8">
              <Link to="/contact">Vraag een offerte aan</Link>
            </Button>
          </div>

          <div data-reveal data-reveal-delay="1">
            <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-5">Navigatie</h2>
            <ul className="space-y-3 text-sm">
              {[
                ["/", "Home"],
                ["/woningscan", "Woningscan"],
                ["/diensten", "Diensten"],
                ["/werkwijze", "Werkwijze"],
                ["/realisaties", "Realisaties"],
                ["/reviews", "Reviews"],
                ["/over", "Over Dimac"],
                ["/contact", "Contact"],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className={linkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div data-reveal data-reveal-delay="2">
            <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-5">Diensten</h2>
            <ul className="space-y-3 text-sm text-primary/80">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link to={`/diensten/${s.slug}`} className={linkClass}>
                    {s.navLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div data-reveal data-reveal-delay="3">
            <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-5">Werkgebied</h2>
            <ul className="space-y-3 text-sm text-primary/80">
              {activeRegions.map((r) => (
                <li key={r.slug}>
                  <Link to={`/regio/${r.slug}`} className={linkClass}>
                    Aannemer in {r.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/regio" className={linkClass}>
                  Bekijk ons werkgebied
                </Link>
              </li>
            </ul>

            <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground mt-8 mb-5">
              {BLOG_LABEL}
            </h2>
            <ul className="space-y-3 text-sm text-primary/80">
              {footerArticles.map((a) => (
                <li key={a.slug}>
                  <Link to={`/blog/${a.slug}`} className={linkClass}>
                    {a.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/blog" className={linkClass}>
                  Alle adviesartikels
                </Link>
              </li>
            </ul>

            <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground mt-8 mb-3">Contact</h2>
            <p className="text-sm text-primary/80">
              <a href={`mailto:${COMPANY.email}`} className={linkClass}>
                {COMPANY.email}
              </a>
            </p>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Dimac. Alle rechten voorbehouden.</p>
          <p>Renovatie en nieuwbouw in regio Diest</p>
        </div>
      </div>
    </footer>
  );
};
