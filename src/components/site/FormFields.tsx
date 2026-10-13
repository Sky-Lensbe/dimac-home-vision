import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { COMPANY } from "@/lib/site";

const control =
  "w-full min-h-[48px] bg-background border border-border px-4 py-3 text-base text-primary placeholder:text-muted-foreground/70 transition-colors duration-200 focus:outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/30";

interface Base {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
}

const Label = ({ id, label, required, hint }: Base) => (
  <label htmlFor={id} className="block text-sm text-primary mb-2">
    {label}
    {required && <span className="text-accent"> *</span>}
    {hint && <span className="block text-xs text-muted-foreground mt-1">{hint}</span>}
  </label>
);

export const TextField = (
  props: Base & { type?: string; value: string; onChange: (v: string) => void; autoComplete?: string }
) => (
  <div className={props.className}>
    <Label {...props} />
    <input
      id={props.id}
      name={props.id}
      type={props.type ?? "text"}
      required={props.required}
      autoComplete={props.autoComplete}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      className={control}
    />
  </div>
);

export const TextAreaField = (props: Base & { value: string; onChange: (v: string) => void; rows?: number }) => (
  <div className={props.className}>
    <Label {...props} />
    <textarea
      id={props.id}
      name={props.id}
      required={props.required}
      rows={props.rows ?? 5}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      className={cn(control, "resize-y")}
    />
  </div>
);

export const SelectField = (
  props: Base & { value: string; onChange: (v: string) => void; options: string[] }
) => (
  <div className={props.className}>
    <Label {...props} />
    <select
      id={props.id}
      name={props.id}
      required={props.required}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      className={cn(control, "appearance-none bg-[length:12px] pr-10")}
    >
      <option value="">Maak een keuze</option>
      {props.options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

export const ConsentField = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed cursor-pointer">
    <input
      type="checkbox"
      required
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-1 h-4 w-4 accent-[hsl(var(--accent))] shrink-0"
    />
    <span>
      Ik ga akkoord dat Dimac mijn gegevens gebruikt om mijn aanvraag te beantwoorden. Lees de{" "}
      <Link to="/privacy" className="text-accent underline underline-offset-2">
        privacyverklaring
      </Link>
      .
    </span>
  </label>
);

/** Eerlijke uitleg over de verzending via de eigen e-mailapp. */
export const MailtoNotice = ({ children }: { children?: ReactNode }) => (
  <p className="text-xs text-muted-foreground leading-relaxed flex gap-2">
    <Mail className="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
    <span>
      {children ??
        "Na het klikken opent uw e-mailprogramma met een ingevuld bericht. Uw aanvraag is pas verstuurd wanneer u dat bericht zelf verzendt."}{" "}
      Lukt dat niet? Mail rechtstreeks naar{" "}
      <a href={`mailto:${COMPANY.email}`} className="text-accent underline underline-offset-2">
        {COMPANY.email}
      </a>
      .
    </span>
  </p>
);

export const HandoffMessage = () => (
  <div role="status" className="border-l-2 border-accent bg-accent-soft/50 p-5 text-sm text-primary leading-relaxed">
    <strong className="block mb-1">Uw e-mailprogramma werd geopend.</strong>
    Verstuur het voorbereide bericht daar om uw aanvraag af te ronden. Zonder verzending ontvangen wij niets.
    Opende er niets? Mail dan naar{" "}
    <a href={`mailto:${COMPANY.email}`} className="text-accent underline underline-offset-2">
      {COMPANY.email}
    </a>
    .
  </div>
);
