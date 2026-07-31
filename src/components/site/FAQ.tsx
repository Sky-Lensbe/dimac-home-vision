import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Item { q: string; a: string }
interface Props { items: Item[]; className?: string }

export const FAQ = ({ items, className }: Props) => {
  const [open, setOpen] = React.useState<number | null>(0);
  return (
    <div className={cn("divide-y divide-border", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className={cn(
              "py-2 px-3 -mx-3 border-l-2 transition-colors duration-300 ease-out",
              isOpen ? "border-accent bg-accent-soft/40" : "border-transparent fine:hover:bg-surface"
            )}
          >
            <button
              className="focus-ring w-full flex items-start justify-between gap-6 text-left py-5 min-h-[44px] group/faq"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span
                className={cn(
                  "font-display text-lg md:text-xl leading-snug transition-colors duration-300",
                  isOpen ? "text-accent" : "text-primary fine:lg:group-hover/faq:text-accent"
                )}
              >
                {item.q}
              </span>
              <ChevronDown
                className={cn(
                  "w-5 h-5 mt-1 shrink-0 text-accent transition-transform duration-300 ease-out motion-reduce:transition-none",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <p className="text-muted-foreground leading-relaxed max-w-2xl">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
