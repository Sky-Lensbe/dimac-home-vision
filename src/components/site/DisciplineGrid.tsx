import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

export interface Discipline {
  label: string;
  to: string;
  slug?: string;
  text?: string;
}

interface Props {
  items: Discipline[];
  className?: string;
  /** Compacte variant: enkel labels binnen één gedeeld raster. */
  compact?: boolean;
  pageType?: string;
}

/**
 * Toont disciplines als onderdelen van één systeem: één gedeeld raster,
 * hairlines als scheiding, geen losse zwevende kaarten.
 */
export const DisciplineGrid = ({ items, className, compact = false, pageType = "home" }: Props) => (
  <div
    className={cn(
      "stagger-list grid gap-px bg-border border border-border",
      compact ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-4",
      className
    )}
    data-reveal
  >
    {items.map((item) => (
      <Link
        key={item.to}
        to={item.to}
        onClick={() =>
          track("view_service", { page_type: pageType, item_id: item.slug, cta_label: item.label })
        }
        className={cn(
          "focus-ring-inset card-flush group/disc bg-background flex flex-col",
          compact ? "p-6" : "p-7 md:p-8"
        )}
      >
        <span className="h-px w-8 bg-accent mb-5" aria-hidden="true" />
        <h3 className="font-display text-lg text-primary leading-snug">{item.label}</h3>
        {item.text && (
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">{item.text}</p>
        )}
        <span className="mt-6 inline-flex items-center gap-2 text-[13px] text-accent">
          Ontdek deze dienst
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 ease-out motion-safe:fine:lg:group-hover/disc:translate-x-1" />
        </span>
      </Link>
    ))}
  </div>
);
