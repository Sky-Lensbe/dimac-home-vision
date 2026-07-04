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
}

export const CTABlock = ({ eyebrow, title, text, primary, secondary, variant = "dark" }: Props) => {
  const isDark = variant === "dark";
  return (
    <section className={isDark ? "bg-primary text-primary-foreground" : "bg-surface text-primary"}>
      <div className="container-tight py-24 md:py-32">
        <div className="max-w-3xl">
          {eyebrow && (
            <span className={"eyebrow mb-6 " + (isDark ? "!text-accent" : "")}>{eyebrow}</span>
          )}
          <h2 className="font-display text-3xl md:text-5xl leading-[1.1] mb-6">{title}</h2>
          {text && (
            <p className={"text-lg leading-relaxed max-w-2xl " + (isDark ? "text-primary-foreground/75" : "text-muted-foreground")}>
              {text}
            </p>
          )}
          <div className="mt-10 flex flex-wrap gap-4">
            {primary && (
              <Button asChild variant={isDark ? "accent" : "solid"} size="lg">
                <Link to={primary.to}>
                  {primary.label} <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            )}
            {secondary && (
              <Button asChild variant={isDark ? "outline" : "outline"} size="lg" className={isDark ? "border-primary-foreground/60 text-primary-foreground hover:bg-primary-foreground hover:text-primary" : ""}>
                <Link to={secondary.to}>{secondary.label}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
