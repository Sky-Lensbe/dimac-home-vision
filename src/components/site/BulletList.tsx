import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  items: string[];
  className?: string;
  columns?: 1 | 2;
}

export const BulletList = ({ items, className, columns = 1 }: Props) => (
  <ul
    className={cn(
      "stagger-list grid gap-x-10 gap-y-4",
      columns === 2 ? "sm:grid-cols-2" : "grid-cols-1",
      className
    )}
    data-reveal
  >
    {items.map((it) => (
      <li key={it} className="group/item flex items-start gap-3 text-[15px] leading-relaxed">
        <span className="mt-1.5 shrink-0 inline-flex h-5 w-5 items-center justify-center border border-accent/40 bg-accent/10 transition-colors duration-300 fine:lg:group-hover/item:border-accent fine:lg:group-hover/item:bg-accent/20">
          <Check className="w-3 h-3 text-accent" strokeWidth={2.5} />
        </span>
        <span className="text-primary/90">{it}</span>
      </li>
    ))}
  </ul>
);
