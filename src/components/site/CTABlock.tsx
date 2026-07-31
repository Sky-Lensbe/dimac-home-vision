import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Props {
  eyebrow?: string;
  title: string;
  text?: string;
  primary?: { label: string; to: string };
  secondary?: { label: string; to: string };
  variant?: "dark" | "surface";
  microcopy?: string;
}

export const CTABlock = ({ eyebrow, title, text, primary, secondary, variant = "dark", microcopy }: Props) => {
  // Both variants render on a light surface; "dark" kept for API compatibility.
  const bg = variant === "surface" ? "bg-background" : "bg-surface";
  return (
    <section className={bg + " group/cta relative border-y border-border overflow-hidden"}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-px w-0 bg-accent transition-[width] duration-700 ease-out fine:group-hover/cta:w-40 fine:lg:group-hover/cta:w-64"
      />
      <div className="container-tight py-24 md:py-32">
        <div className="max-w-3xl">
          {eyebrow && (
            <span className="eyebrow mb-6" data-reveal>
              {eyebrow}
            </span>
          )}
          <h2
            className="font-display text-3xl md:text-5xl leading-[1.1] mb-6 text-primary"
            data-reveal
            data-reveal-delay="1"
          >
            {title}
          </h2>
          {text && (
            <p
              className="text-lg leading-relaxed max-w-2xl text-muted-foreground"
              data-reveal
              data-reveal-delay="2"
            >
              {text}
            </p>
          )}
          <div className="mt-10 flex flex-wrap gap-4" data-reveal data-reveal-delay="3">
            {primary && (
              <Button asChild variant="solid" size="lg">
                <Link to={primary.to}>
                  {primary.label} <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            )}
            {secondary && (
              <Button asChild variant="outline" size="lg">
                <Link to={secondary.to}>{secondary.label}</Link>
              </Button>
            )}
          </div>
          {microcopy && (
            <p
              className="mt-6 text-sm text-muted-foreground max-w-2xl"
              data-reveal
              data-reveal-delay="4"
            >
              {microcopy}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
