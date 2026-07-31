import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Crumb } from "@/lib/site";

interface Props {
  items: Crumb[];
  className?: string;
}

/**
 * Zichtbare, semantische breadcrumbs. Het laatste item is de huidige pagina
 * en krijgt aria-current. Wrapt netjes op mobiel zonder horizontale overflow.
 */
export const Breadcrumbs = ({ items, className }: Props) => (
  <nav aria-label="Kruimelpad" className={cn("w-full", className)}>
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <li key={`${item.label}-${i}`} className="flex items-center gap-2 min-w-0">
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="focus-ring transition-colors duration-300 fine:hover:text-accent"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current={isLast ? "page" : undefined} className="text-primary/80">
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight aria-hidden="true" className="w-3 h-3 shrink-0 opacity-60" />}
          </li>
        );
      })}
    </ol>
  </nav>
);
