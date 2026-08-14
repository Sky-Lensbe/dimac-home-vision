import { FormEvent, useState } from "react";
import { Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/Section";
import { PageSEO } from "@/components/seo/PageSEO";
import { organizationSchema } from "@/lib/site";
import { toast } from "sonner";
import { track } from "@/lib/analytics";

/** Wat er na het versturen gebeurt: verwachtingen expliciet maken. */
const nextSteps = [
  "We nemen contact op om je vraag te overlopen.",
  "We bekijken samen welke werken bij elkaar horen.",
  "Je krijgt een voorstel voor de aanpak en de volgorde.",
];

const inputCls =
  "w-full bg-transparent border-b border-border py-3 text-primary placeholder:text-muted-foreground/60 transition-[border-color,background-color,box-shadow] duration-300 ease-out fine:hover:border-primary/30 focus:outline-none focus:border-accent focus:bg-accent-soft/40 autofill:bg-transparent";

const Contact = () => {
  const [sending, setSending] = useState(false);
  const [started, setStarted] = useState(false);

  // Eén keer registreren zodra iemand effectief begint in te vullen.
  const onStart = () => {
    if (started) return;
    setStarted(true);
    track("project_contact_start", { page_type: "contact", cta_label: "Contactformulier" });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    track("project_contact_submit", { page_type: "contact", cta_label: "Verstuur bericht" });
    setTimeout(() => {
      setSending(false);
      toast.success("Bedankt, we nemen zo snel mogelijk contact op.");
      (e.target as HTMLFormElement).reset();
    }, 700);
  };

  return (
    <>
      <PageSEO
        path="/contact"
        title="Contact | Dimac, aannemer in regio Diest"
        description="Contacteer Dimac voor uw renovatie of nieuwbouw in regio Diest. Vraag een offerte aan of plan een woningscan."
        schemas={[organizationSchema()]}
      />
      <section className="pt-32 md:pt-40 pb-16 bg-surface">
        <div className="container-tight fade-up max-w-3xl">
          <span className="eyebrow mb-6">Contact</span>
          <h1 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-primary">
            Vertel ons over je project
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Vertel ons kort wat je wilt aanpakken. Dan bekijken we samen welke stappen logisch zijn en
            hoe de werken op elkaar aansluiten.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-16 lg:grid-cols-[1.4fr_1fr]">
          <form onSubmit={onSubmit} onFocusCapture={onStart} className="space-y-8" data-reveal>
            <div className="grid gap-8 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Naam</span>
                <input required type="text" name="naam" className={inputCls} placeholder="Uw naam" />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">E-mail</span>
                <input required type="email" name="email" className={inputCls} placeholder="naam@voorbeeld.be" />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Telefoon</span>
                <input type="tel" name="telefoon" className={inputCls} placeholder="+32 ..." />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Postcode / regio</span>
                <input type="text" name="regio" className={inputCls} placeholder="bv. 3290 Diest" />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Type project</span>
                <select name="type" className={inputCls} defaultValue="">
                  <option value="" disabled>Kies een project</option>
                  <option>Totaalrenovatie</option>
                  <option>Nieuwbouw</option>
                  <option>Badkamer renovatie</option>
                  <option>Keuken renovatie</option>
                  <option>Dakwerken</option>
                  <option>Hernieuwbare energie</option>
                  <option>Afwerking</option>
                  <option>Technieken</option>
                  <option>Woningscan</option>
                  <option>Andere</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Gewenste timing</span>
                <select name="timing" className={inputCls} defaultValue="">
                  <option value="" disabled>Kies timing</option>
                  <option>Zo snel mogelijk</option>
                  <option>Binnen 3 maanden</option>
                  <option>Binnen 6 maanden</option>
                  <option>Later dit jaar</option>
                  <option>Nog te bepalen</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Korte omschrijving</span>
              <textarea
                name="bericht"
                rows={5}
                className={inputCls + " resize-none"}
                placeholder="Vertel ons in enkele zinnen wat je wilt aanpakken."
              />
            </label>
            <div className="pt-4">
              <Button type="submit" variant="solid" size="lg" disabled={sending}>
                {sending ? "Versturen…" : "Verstuur bericht"}
              </Button>
              <p className="mt-4 text-xs text-muted-foreground">
                Prototype formulier. Berichten worden nog niet effectief verzonden.
              </p>
              <div className="mt-8 border-t border-border pt-6">
                <span className="eyebrow mb-4">Wat gebeurt er daarna?</span>
                <ol className="space-y-3">
                  {nextSteps.map((step, i) => (
                    <li key={step} className="flex gap-4 text-sm text-muted-foreground leading-relaxed">
                      <span className="font-display text-accent">{String(i + 1).padStart(2, "0")}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </form>

          <aside className="stagger-list space-y-8 lg:sticky lg:top-28 lg:self-start" data-reveal>
            <div className="card-interactive border border-border bg-surface p-8">
              <h3 className="eyebrow mb-4">Contact</h3>
              <ul className="space-y-4 text-primary">
                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 mt-1 text-accent" />
                  <a
                    href="mailto:info@dimac.be"
                    className="link-underline focus-ring"
                    onClick={() => track("email_click", { page_type: "contact", cta_label: "info@dimac.be" })}
                  >
                    info@dimac.be
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-1 text-accent" />
                  <span>Regio Diest, België</span>
                </li>
              </ul>
            </div>
            <div className="card-interactive border border-border p-8">
              <h3 className="eyebrow mb-4">Regio</h3>
              <p className="text-muted-foreground leading-relaxed">
                Actief in Diest, Scherpenheuvel, Tessenderlo, Halen en ruime omgeving.
              </p>
            </div>
            <div className="card-interactive border border-border p-8 bg-surface">
              <h3 className="eyebrow mb-4">Openingsuren</h3>
              <dl className="space-y-2 text-sm text-primary/80">
                <div className="flex justify-between"><dt>Ma – Vr</dt><dd>08:00 – 17:00</dd></div>
                <div className="flex justify-between"><dt>Za</dt><dd>Op afspraak</dd></div>
                <div className="flex justify-between"><dt>Zo</dt><dd>Gesloten</dd></div>
              </dl>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
};

export default Contact;
