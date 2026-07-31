import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  src?: string;
  className?: string;
  aspect?: "square" | "portrait" | "landscape" | "wide" | "tall";
  fit?: "cover" | "contain";
  /** Toont het label als overlay bij hover. Default true (backwards compatible). */
  showLabelOverlay?: boolean;
}

const aspectClass: Record<NonNullable<Props["aspect"]>, string> = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  tall: "aspect-[2/3]",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/10]",
};

export const ImagePlaceholder = ({
  label,
  src,
  className,
  aspect = "landscape",
  fit = "cover",
  showLabelOverlay = true,
}: Props) => {
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
            // Zoom uitsluitend vanaf lg + precieze pointer (zie .img-zoom in index.css)
            // en nooit bij fit="contain".
            fit === "contain" ? "object-contain" : "object-cover img-zoom"
          )}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-3">
          <ImageIcon className="w-8 h-8 opacity-40" strokeWidth={1} />
          <span className="text-[11px] uppercase tracking-[0.22em]">{label}</span>
        </div>
      )}
      {showLabelOverlay && (
        <div className="img-overlay pointer-events-none absolute inset-x-0 bottom-0 p-4 opacity-0 transition-opacity duration-500 bg-gradient-to-t from-primary/50 to-transparent">
          <span className="text-[11px] uppercase tracking-[0.22em] text-primary-foreground">
            {label}
          </span>
        </div>
      )}
    </div>
  );
};
