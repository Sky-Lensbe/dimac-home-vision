import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { COMPANY } from "@/lib/site";
import logoAsset from "@/assets/dimac-logo.jpg.asset.json";

const linkClass =
  "link-underline text-primary/80 fine:hover:text-accent transition-colors duration-300 focus-ring";

const nav: [string, string][] = [
  ["/", "Home"],
  ["/projecten", "Onze projecten"],
  ["/totaalrenovaties", "Totaalrenovaties"],
  ["/woningscan", "Woningscan"],
  ["/over", "Over Dimac"],
  ["/contact", "Contact"],
];

export const Footer = () => (
  <footer className="group/footer bg-surface border-t border-border text-primary">
    <div className="container-wide py-20 md:py-24">
      <span
        aria-hidden="true"
        className="block h-px w-12 bg-accent mb-12 transition-[width] duration-700 ease-out fine:lg:group-hover/footer:w-24"
      />
      <div className="grid gap-14 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-4 mb-6">
            <img src={logoAsset.url} alt="Logo van Dimac" className="h-14 w-14 rounded-md object-cover" width={56} height={56} loading="lazy" />
            <span className="font-display text-xl text-primary">Dimac</span>
          </div>
          <p className="max-w-sm text-muted-foreground leading-relaxed">
            Vastgoed ontwikkelen. Expertise delen. Waarde creëren.
          </p>
          <Button asChild className="mt-8">
            <Link to="/woningscan#pakketten">Vraag een Woningscan aan</Link>
          </Button>
        </div>

        <div>
          <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-5">Navigatie</h2>
          <ul className="space-y-3 text-sm">
            {nav.map(([to, label]) => (
              <li key={to}>
                <Link to={to} className={linkClass}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-5">Contact</h2>
          <p className="text-sm">
            <a href={`mailto:${COMPANY.email}`} className={linkClass}>
              {COMPANY.email}
            </a>
          </p>
          <p className="mt-3 text-sm text-muted-foreground">Regio {COMPANY.region}</p>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Dimac. Alle rechten voorbehouden.</p>
        <Link to="/privacy" className={linkClass}>
          Privacyverklaring
        </Link>
      </div>
    </div>
  </footer>
);
