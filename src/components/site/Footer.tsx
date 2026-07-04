import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { services } from "@/data/services";
import logoAsset from "@/assets/dimac-logo.jpg.asset.json";

export const Footer = () => {
  return (
    <footer className="bg-surface border-t border-border text-primary">
      <div className="container-wide py-20 md:py-28">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <img
                src={logoAsset.url}
                alt="Dimac"
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

          <div>
            <h4 className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-5">Navigatie</h4>
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
                  <Link to={to} className="text-primary/80 hover:text-accent transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-5">Diensten</h4>
            <ul className="space-y-3 text-sm text-primary/80">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link to={`/diensten/${s.slug}`} className="hover:text-accent transition-colors">
                    {s.navLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-5">Regio</h4>
            <ul className="space-y-3 text-sm text-primary/80">
              <li>Diest</li>
              <li>Scherpenheuvel</li>
              <li>Tessenderlo</li>
              <li>Halen</li>
              <li>en ruime omgeving</li>
            </ul>
            <h4 className="text-xs uppercase tracking-[0.22em] text-muted-foreground mt-8 mb-3">Contact</h4>
            <p className="text-sm text-primary/80">info@dimac.be<br />+32 (0)00 00 00 00</p>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Dimac. Alle rechten voorbehouden.</p>
          <p>BTW BE 0000.000.000 · Erkend aannemer</p>
        </div>
      </div>
    </footer>
  );
};
