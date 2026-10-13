import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/PageHero";
import {
  ConsentField,
  HandoffMessage,
  MailtoNotice,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/site/FormFields";
import { PageSEO } from "@/components/seo/PageSEO";
import { COMPANY, breadcrumbSchema, organizationSchema } from "@/lib/site";
import { buildMailto, openMailto } from "@/lib/mailto";
import { track } from "@/lib/analytics";

const Contact = () => {
  const [f, setF] = useState({ subject: "", name: "", email: "", phone: "", message: "" });
  const [consent, setConsent] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((x) => ({ ...x, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    openMailto(
      buildMailto(`Contact via website${f.subject ? ` — ${f.subject}` : ""}`, [
        ["Onderwerp", f.subject],
        ["Naam", f.name],
        ["E-mail", f.email],
        ["Telefoon", f.phone],
        ["Bericht", f.message],
      ])
    );
    track("contact_mailto_handoff", { page_type: "contact" });
    setSent(true);
  };

  return (
    <>
      <PageSEO
        path="/contact"
        title="Contact | Dimac"
        description="Neem contact op met Dimac over een Woningscan, een totaalrenovatie of onze vastgoedprojecten."
        schemas={[organizationSchema(), breadcrumbSchema([{ label: "Home", to: "/" }, { label: "Contact" }])]}
      />
      <PageHero
        crumbs={[{ label: "Home", to: "/" }, { label: "Contact" }]}
        eyebrow="Contact"
        title="Waarmee kunnen we u helpen?"
        intro={<p>Kies de route die het best bij uw vraag past, of stuur ons een algemeen bericht.</p>}
      />

      <section className="py-16 md:py-24 bg-background">
        <div className="container-tight grid gap-5 md:grid-cols-2">
          <Link to="/woningscan#pakketten" className="focus-ring group/c border border-border p-8 fine:hover:border-accent transition-colors">
            <span className="text-[11px] uppercase tracking-[0.24em] text-accent">Woningscan</span>
            <p className="mt-3 font-display text-2xl">Een pakket kiezen en aanvragen</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm">Naar de pakketten <ArrowRight className="w-4 h-4" /></span>
          </Link>
          <Link to="/totaalrenovaties#intake" className="focus-ring group/c border border-border p-8 fine:hover:border-accent transition-colors">
            <span className="text-[11px] uppercase tracking-[0.24em] text-accent">Totaalrenovatie</span>
            <p className="mt-3 font-display text-2xl">Uw renovatieplannen bespreken</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm">Naar de projectintake <ArrowRight className="w-4 h-4" /></span>
          </Link>
        </div>
      </section>

      <section className="pb-24 md:pb-32 bg-background">
        <div className="container-tight grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <span className="eyebrow mb-5">Algemene vraag</span>
            <h2 className="font-display text-3xl md:text-4xl">Stuur ons een bericht</h2>
            <a
              href={`mailto:${COMPANY.email}`}
              onClick={() => track("email_click", { page_type: "contact" })}
              className="focus-ring mt-8 inline-flex items-center gap-3 text-lg text-primary fine:hover:text-accent"
            >
              <Mail className="w-5 h-5 text-accent" /> {COMPANY.email}
            </a>
          </div>
          <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
            <SelectField
              id="subject"
              label="Onderwerp"
              className="sm:col-span-2"
              value={f.subject}
              onChange={set("subject")}
              options={["Woningscan", "Totaalrenovatie", "Vastgoedprojecten", "Andere vraag"]}
            />
            <TextField id="name" label="Naam" required autoComplete="name" value={f.name} onChange={set("name")} />
            <TextField id="email" type="email" label="E-mail" required autoComplete="email" value={f.email} onChange={set("email")} />
            <TextField id="phone" type="tel" label="Telefoon" autoComplete="tel" className="sm:col-span-2" value={f.phone} onChange={set("phone")} />
            <TextAreaField id="message" label="Bericht" required className="sm:col-span-2" value={f.message} onChange={set("message")} />
            <div className="sm:col-span-2 space-y-5">
              <ConsentField checked={consent} onChange={setConsent} />
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                Bericht voorbereiden <ArrowRight />
              </Button>
              <MailtoNotice />
              {sent && <HandoffMessage />}
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Contact;
