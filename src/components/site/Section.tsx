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
      ? "bg-surface-strong"
      : "bg-background";
  return (
    <section className={cn("py-24 md:py-36", bgClass, className)}>
      <div className="container-tight">
        {(eyebrow || title) && (
          <header className={cn("mb-16 max-w-3xl", align === "center" && "mx-auto text-center")}>
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
