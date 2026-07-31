interface Step { title: string; text: string }
interface Props { steps: Step[] }

export const WorkflowSteps = ({ steps }: Props) => (
  <ol className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-5 border border-border">
    {steps.map((step, i) => (
      <li
        key={step.title}
        className="card-flush bg-background p-8 flex flex-col gap-4 relative group/step"
        data-reveal
        data-reveal-delay={String(Math.min(i + 1, 6))}
      >
        <div className="flex items-baseline gap-3">
          <span className="font-display text-accent text-3xl transition-transform duration-300 ease-out origin-left motion-safe:lg:group-hover/step:scale-110">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="h-px flex-1 bg-border transition-colors duration-300 lg:group-hover/step:bg-accent/50" />
        </div>
        <h3 className="font-display text-xl text-primary leading-tight">{step.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
      </li>
    ))}
  </ol>
);
