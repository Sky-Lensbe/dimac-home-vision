import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  src?: string;
  className?: string;
  aspect?: "square" | "portrait" | "landscape" | "wide";
}

const aspectClass: Record<NonNullable<Props["aspect"]>, string> = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/10]",
};

export const ImagePlaceholder = ({ label, src, className, aspect = "landscape" }: Props) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface-strong group",
        aspectClass[aspect],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={label}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-3">
          <ImageIcon className="w-8 h-8 opacity-40" strokeWidth={1} />
          <span className="text-[11px] uppercase tracking-[0.22em]">{label}</span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-primary/60 to-transparent">
        <span className="text-[11px] uppercase tracking-[0.22em] text-primary-foreground">{label}</span>
      </div>
    </div>
  );
};
