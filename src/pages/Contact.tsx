import { FormEvent, useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/Section";
import { usePageMeta } from "@/hooks/use-page-meta";
import { toast } from "sonner";

const inputCls =
  "w-full bg-transparent border-b border-border py-3 text-primary placeholder:text-muted-foreground/60 transition-[border-color,background-color,box-shadow] duration-300 ease-out fine:hover:border-primary/30 focus:outline-none focus:border-accent focus:bg-accent-soft/40 autofill:bg-transparent";

const Contact = () => {
  usePageMeta({
    title: "Contact | Dimac Diest",
    description: "Contacteer Dimac voor uw renovatie of nieuwbouw in regio Diest. Vraag een offerte of plan een woningscan.",
  });
  const [sending, setSending] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Bedankt, we nemen zo snel mogelijk contact op.");
      (e.target as HTMLFormElement).reset();
    }, 700);
  };

  return (
    <>
      <section className="pt-32 md:pt-40 pb-16 bg-surface">
        <div className="container-tight fade-up max-w-3xl">
          <span className="eyebrow mb-6">Contact</span>
          <h1 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-primary">
            Vertel ons over uw project
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Vertel ons kort wat u wil aanpakken. Dan bekijken we samen welke stappen we best nemen voor uw project.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-16 lg:grid-cols-[1.4fr_1fr]">
          <form onSubmit={onSubmit} className="space-y-8" data-reveal>
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
                placeholder="Vertel ons in enkele zinnen wat u wil aanpakken."
              />
            </label>
            <div className="pt-4">
              <Button type="submit" variant="solid" size="lg" disabled={sending}>
                {sending ? "Versturen…" : "Verstuur bericht"}
              </Button>
              <p className="mt-4 text-xs text-muted-foreground">
                Prototype formulier. Berichten worden nog niet effectief verzonden.
              </p>
            </div>
          </form>

          <aside className="stagger-list space-y-8 lg:sticky lg:top-28 lg:self-start" data-reveal>
            <div className="card-interactive border border-border bg-surface p-8">
              <h3 className="eyebrow mb-4">Contact</h3>
              <ul className="space-y-4 text-primary">
                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 mt-1 text-accent" />
                  <span>info@dimac.be</span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="w-4 h-4 mt-1 text-accent" />
                  <span>+32 (0)00 00 00 00</span>
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
