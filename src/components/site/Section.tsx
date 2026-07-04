import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

interface Props {
  eyebrow?: string;
  title?: string;
  className?: string;
  bg?: "background" | "surface" | "primary";
  align?: "left" | "center";
}

export const Section = ({
  eyebrow,
  title,
  children,
  className,
  bg = "background",
  align = "left",
}: PropsWithChildren<Props>) => {
  const bgClass =
    bg === "surface"
      ? "bg-surface"
      : bg === "primary"
      ? "bg-primary text-primary-foreground"
      : "bg-background";
  return (
    <section className={cn("py-20 md:py-28", bgClass, className)}>
      <div className="container-tight">
        {(eyebrow || title) && (
          <header className={cn("mb-14 max-w-3xl", align === "center" && "mx-auto text-center")}>
            {eyebrow && <span className="eyebrow mb-5">{eyebrow}</span>}
            {title && (
              <h2 className="font-display text-3xl md:text-5xl leading-[1.05] tracking-tight">
                {title}
              </h2>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
};
