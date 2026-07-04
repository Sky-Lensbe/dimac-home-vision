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
          <div key={i} className="py-2">
            <button
              className="w-full flex items-start justify-between gap-6 text-left py-5 group"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span className="font-display text-lg md:text-xl text-primary leading-snug group-hover:text-accent transition-colors">
                {item.q}
              </span>
              <ChevronDown
                className={cn(
                  "w-5 h-5 mt-1 shrink-0 text-accent transition-transform duration-300",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-500 ease-out",
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
