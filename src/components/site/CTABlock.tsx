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
  // Both variants render on a light surface; "dark" kept for API compatibility.
  const bg = variant === "surface" ? "bg-background" : "bg-surface";
  return (
    <section className={bg + " border-y border-border"}>
      <div className="container-tight py-24 md:py-32">
        <div className="max-w-3xl">
          {eyebrow && <span className="eyebrow mb-6">{eyebrow}</span>}
          <h2 className="font-display text-3xl md:text-5xl leading-[1.1] mb-6 text-primary">{title}</h2>
          {text && (
            <p className="text-lg leading-relaxed max-w-2xl text-muted-foreground">{text}</p>
          )}
          <div className="mt-10 flex flex-wrap gap-4">
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
        </div>
      </div>
    </section>
  );
};
