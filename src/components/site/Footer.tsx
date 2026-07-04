import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-wide py-20 md:py-28">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="font-display text-3xl">Dimac</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-primary-foreground/60">BV</span>
            </div>
            <p className="max-w-sm text-primary-foreground/70 leading-relaxed">
              Renovatiepartner in Diest, Scherpenheuvel, Tessenderlo, Halen en ruime omgeving.
              Eén aanspreekpunt van voorbereiding tot afwerking.
            </p>
            <Button asChild variant="accent" className="mt-8">
              <Link to="/contact">Vraag een gesprek aan</Link>
            </Button>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.22em] text-primary-foreground/50 mb-5">Navigatie</h4>
            <ul className="space-y-3 text-sm">
              {[
                ["/", "Home"],
                ["/diensten", "Diensten"],
                ["/werkwijze", "Werkwijze"],
                ["/realisaties", "Realisaties"],
                ["/woningscan", "Woningscan"],
                ["/over", "Over Dimac"],
                ["/contact", "Contact"],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-primary-foreground/80 hover:text-accent transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.22em] text-primary-foreground/50 mb-5">Diensten</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li>Totaalrenovatie</li>
              <li>Badkamers</li>
              <li>Keukens</li>
              <li>Dakwerken</li>
              <li>Elektriciteit</li>
              <li>Sanitair & technieken</li>
              <li>Hernieuwbare energie</li>
              <li>Afwerking & maatwerk</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.22em] text-primary-foreground/50 mb-5">Regio</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li>Diest</li>
              <li>Scherpenheuvel</li>
              <li>Tessenderlo</li>
              <li>Halen</li>
              <li>en ruime omgeving</li>
            </ul>
            <h4 className="text-xs uppercase tracking-[0.22em] text-primary-foreground/50 mt-8 mb-3">Contact</h4>
            <p className="text-sm text-primary-foreground/80">info@dimac.be<br />+32 (0)00 00 00 00</p>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-primary-foreground/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-primary-foreground/50">
          <p>© {new Date().getFullYear()} Dimac BV. Alle rechten voorbehouden.</p>
          <p>BTW BE 0000.000.000 · Erkend aannemer</p>
        </div>
      </div>
    </footer>
  );
};
