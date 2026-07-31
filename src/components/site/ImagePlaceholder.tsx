import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  src?: string;
  className?: string;
  aspect?: "square" | "portrait" | "landscape" | "wide" | "tall";
  fit?: "cover" | "contain";
}

const aspectClass: Record<NonNullable<Props["aspect"]>, string> = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  tall: "aspect-[2/3]",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/10]",
};

export const ImagePlaceholder = ({ label, src, className, aspect = "landscape", fit = "cover" }: Props) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface-strong group/img",
        aspectClass[aspect],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={label}
          loading="lazy"
          className={cn(
            "absolute inset-0 h-full w-full transition-transform duration-[800ms] ease-out",
            fit === "contain"
              ? "object-contain"
              : "object-cover motion-safe:md:group-hover/img:scale-[1.02] motion-safe:lg:group-hover/img:scale-[1.04] motion-safe:lg:group-hover:scale-[1.04]"
          )}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-3">
          <ImageIcon className="w-8 h-8 opacity-40" strokeWidth={1} />
          <span className="text-[11px] uppercase tracking-[0.22em]">{label}</span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 opacity-0 lg:group-hover/img:opacity-100 lg:group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-primary/50 to-transparent">
        <span className="text-[11px] uppercase tracking-[0.22em] text-primary-foreground">{label}</span>
      </div>
    </div>
  );
};
