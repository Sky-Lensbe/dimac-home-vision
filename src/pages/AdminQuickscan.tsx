import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/site/FormFields";
import { PageSEO } from "@/components/seo/PageSEO";
import { QUESTION_MAP, DOMAINS, type QuickscanReport } from "@/lib/quickscan";
import { buildReportPdf, downloadBlob, type ReportMeta } from "@/lib/quickscanPdf";

const STATUSES = [
  ["nieuw", "Nieuw"], ["te_beoordelen", "Te beoordelen"], ["contact_toegelaten", "Contact toegelaten"],
  ["in_opvolging", "In opvolging"], ["afspraak", "Afspraak gepland"], ["afgehandeld", "Afgehandeld"], ["niet_opvolgen", "Niet verder opvolgen"],
] as const;
const DELIVERY: Record<string, string> = {
  aangemaakt: "Aangemaakt", klaar: "Klaar voor verzending", geaccepteerd: "Door provider geaccepteerd",
  afgeleverd: "Afgeleverd", fout: "Fout", niet_geconfigureerd: "Niet verzonden (testmodus, geen verzenddomein)",
};

interface Report { id: string; report_number: string; barometer_category: string; recommended_package: string | null; drone_recommendation: boolean; delivery_status: string; report_version: string; attention_points: { title: string }[]; report_snapshot: QuickscanReport & { meta: ReportMeta } }
interface Lead { id: string; created_at: string; first_name: string; last_name: string; email: string; phone: string | null; municipality: string; situation: string | null; property_type: string | null; construction_period: string | null; decision_timing: string | null; status: string; marketing_consent: boolean; consent_timestamp: string | null; notes: string | null; quickscan_reports: Report[] }

const label = (qid: string, v: unknown) => {
  const q = QUESTION_MAP[qid];
  if (!q) return String(v);
  return (Array.isArray(v) ? v : [v]).map((id) => q.options.find((o) => o.id === id)?.label ?? String(id)).join(", ");
};

export default function AdminQuickscan() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  return (
    <section className="py-12 md:py-16 bg-background min-h-[70vh]">
      <PageSEO title="Quickscan-dashboard | DIMAC" description="Intern dashboard" path="/admin/quickscan" robots="noindex, nofollow" />
      <div className="container-wide">
        {!session ? <Login /> : isAdmin === null ? <p>Laden…</p> : !isAdmin ? (
          <div className="max-w-md"><p className="text-primary">Dit account heeft geen toegang tot het Quickscan-dashboard.</p><Button className="mt-4" variant="outline" onClick={() => supabase.auth.signOut()}>Afmelden</Button></div>
        ) : <Dashboard />}
      </div>
    </section>
  );
}

const Login = () => {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [err, setErr] = useState<string | null>(null);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) setErr("Aanmelden mislukt. Controleer uw gegevens.");
  };
  return (
    <form onSubmit={submit} className="max-w-sm space-y-5">
      <h1 className="font-display text-3xl text-primary">Quickscan-dashboard</h1>
      <TextField id="email" type="email" label="E-mailadres" required value={email} onChange={setEmail} autoComplete="email" />
      <TextField id="pw" type="password" label="Wachtwoord" required value={pw} onChange={setPw} autoComplete="current-password" />
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      <Button type="submit">Aanmelden</Button>
    </form>
  );
};

const Dashboard = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [q, setQ] = useState(""); const [statusF, setStatusF] = useState(""); const [open, setOpen] = useState<string | null>(null);
  const load = () => supabase.from("quickscan_leads").select("*, quickscan_reports(*)").order("created_at", { ascending: false })
    .then(({ data }) => setLeads((data as unknown as Lead[]) ?? []));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => leads.filter((l) =>
    (!statusF || l.status === statusF) &&
    (!q || `${l.first_name} ${l.last_name} ${l.municipality} ${l.email}`.toLowerCase().includes(q.toLowerCase()))), [leads, q, statusF]);
  const count = (fn: (l: Lead) => boolean) => leads.filter(fn).length;
  const rep = (l: Lead) => l.quickscan_reports?.[0];

  const exportCsv = () => {
    const rows = [["Datum", "Voornaam", "Naam", "E-mail", "Telefoon", "Gemeente", "Situatie", "Categorie", "Pakket", "Marketing", "Status"],
      ...filtered.map((l) => [l.created_at, l.first_name, l.last_name, l.email, l.phone ?? "", l.municipality, l.situation ?? "", rep(l)?.barometer_category ?? "", rep(l)?.recommended_package ?? "", l.marketing_consent ? "ja" : "nee", l.status])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "quickscan-leads.csv");
  };

  const lead = leads.find((l) => l.id === open);
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-primary">Quickscan-leads</h1>
          <p className="mt-2 text-sm text-muted-foreground">Testmodus. Gegevens zijn Quickscan-antwoorden van bezoekers, geen geverifieerde technische inspecties.</p>
        </div>
        <Button variant="outline" onClick={() => supabase.auth.signOut()}>Afmelden</Button>
      </div>
      <div className="mt-8 grid gap-3 grid-cols-2 md:grid-cols-6">
        {[["Leads", leads.length], ["Nieuw", count((l) => l.status === "nieuw")],
          ["Drone-advies", count((l) => !!rep(l)?.drone_recommendation)],
          ["Marketing-toestemming", count((l) => l.marketing_consent)]].map(([t, n]) => (
          <div key={t as string} className="border border-border p-4"><p className="text-xs text-muted-foreground">{t}</p><p className="mt-1 font-display text-3xl text-primary">{n}</p></div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <input placeholder="Zoeken op naam, gemeente, e-mail" value={q} onChange={(e) => setQ(e.target.value)} className="min-h-[44px] border border-border bg-background px-3 flex-1 min-w-[220px]" />
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)} className="min-h-[44px] border border-border bg-background px-3">
          <option value="">Alle statussen</option>{STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <Button variant="outline" onClick={exportCsv}>Exporteren (CSV)</Button>
      </div>
      <div className="mt-6 overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left"><tr>{["Datum", "Naam", "Gemeente", "Situatie", "Belangrijkste punt", "Categorie", "Pakket", "Marketing", "Status"].map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="border-t border-border hover:bg-surface cursor-pointer" onClick={() => setOpen(l.id)}>
                <td className="p-3 whitespace-nowrap">{new Date(l.created_at).toLocaleDateString("nl-BE")}</td>
                <td className="p-3">{l.first_name} {l.last_name}</td>
                <td className="p-3">{l.municipality}</td>
                <td className="p-3">{label("Q01", l.situation)}</td>
                <td className="p-3">{rep(l)?.attention_points?.[0]?.title ?? "—"}</td>
                <td className="p-3">{rep(l)?.report_snapshot?.category?.label ?? rep(l)?.barometer_category}</td>
                <td className="p-3 capitalize">{rep(l)?.recommended_package ?? "—"}</td>
                <td className="p-3">{l.marketing_consent ? "Ja" : "Nee"}</td>
                <td className="p-3">{STATUSES.find(([v]) => v === l.status)?.[1] ?? l.status}</td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={9} className="p-6 text-center text-muted-foreground">Nog geen leads.</td></tr>}
          </tbody>
        </table>
      </div>
      {lead && <LeadDetail lead={lead} onClose={() => setOpen(null)} onChange={load} />}
    </div>
  );
};

const LeadDetail = ({ lead, onClose, onChange }: { lead: Lead; onClose: () => void; onChange: () => void }) => {
  const [responses, setResponses] = useState<{ question_id: string; answer_value: unknown }[]>([]);
  const [events, setEvents] = useState<{ id: string; created_at: string; event_type: string; detail: string | null }[]>([]);
  const [notes, setNotes] = useState(lead.notes ?? "");
  const r = lead.quickscan_reports?.[0];
  useEffect(() => {
    supabase.from("quickscan_responses").select("question_id, answer_value").eq("lead_id", lead.id).then(({ data }) => setResponses(data ?? []));
    supabase.from("quickscan_events").select("*").eq("lead_id", lead.id).order("created_at").then(({ data }) => setEvents(data ?? []));
  }, [lead.id]);

  const update = async (patch: { status?: string; notes?: string }, ev: string) => {
    await supabase.from("quickscan_leads").update(patch).eq("id", lead.id);
    await supabase.from("quickscan_events").insert({ lead_id: lead.id, event_type: ev, detail: patch.status ?? null });
    onChange();
  };
  const remove = async () => {
    if (!confirm("Deze lead en alle gekoppelde gegevens definitief verwijderen?")) return;
    await supabase.from("quickscan_leads").delete().eq("id", lead.id);
    onClose(); onChange();
  };
  const snap = r?.report_snapshot;

  return (
    <div className="fixed inset-0 z-50 bg-primary/40 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-2xl h-full overflow-y-auto bg-background p-6 md:p-10" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between gap-4"><h2 className="font-display text-3xl text-primary">{lead.first_name} {lead.last_name}</h2><Button variant="ghost" onClick={onClose}>Sluiten</Button></div>
        <p className="mt-2 text-sm text-muted-foreground">{lead.email}{lead.phone ? ` · ${lead.phone}` : ""} · {lead.municipality}</p>
        <p className="mt-1 text-sm text-muted-foreground">Marketingtoestemming: {lead.marketing_consent ? `ja (${new Date(lead.consent_timestamp!).toLocaleString("nl-BE")})` : "nee"}</p>

        <div className="mt-6 flex flex-wrap gap-3 items-center">
          <select value={lead.status} onChange={(e) => update({ status: e.target.value }, "status_aangepast")} className="min-h-[44px] border border-border bg-background px-3">
            {STATUSES.map(([v, l]) => <option key={v} value={v} disabled={v === "contact_toegelaten" && !lead.marketing_consent}>{l}</option>)}
          </select>
          {snap && <Button variant="outline" onClick={() => downloadBlob(buildReportPdf(snap, snap.meta), `DIMAC-Quickscan-${snap.meta.reportNumber}.pdf`)}>PDF</Button>}
          <Button variant="outline" onClick={remove}>Verwijderen</Button>
        </div>

        {r && snap && (
          <div className="mt-8 space-y-6 text-sm">
            <p>Rapport {r.report_number} · versie {r.report_version} · verzendstatus: <strong>{DELIVERY[r.delivery_status] ?? r.delivery_status}</strong></p>
            <p>Categorie: <strong>{snap.category.label}</strong> · informatie: {snap.unknown.label}</p>
            <div><p className="font-medium">Domeinscores</p><ul className="mt-1">{DOMAINS.map((d) => <li key={d.code}>{d.name}: {snap.domainScores[d.code] ?? "onbekend"}</li>)}</ul></div>
            {snap.safety.length > 0 && <div><p className="font-medium text-destructive">Veiligheidsflags</p><ul>{snap.safety.map((s) => <li key={s.id}>{s.id} — {s.title}</li>)}</ul></div>}
            <div><p className="font-medium">Aandachtspunten</p><ul>{snap.points.map((p) => <li key={p.id}>{p.title}</li>)}</ul></div>
            <div><p className="font-medium">Onbekend</p><ul>{snap.unknown.items.map((u) => <li key={u.id}>{u.label}</li>)}</ul></div>
            <div><p className="font-medium">Combinaties</p><ul>{snap.combinations.map((c) => <li key={c.id}>{c.title}</li>)}</ul></div>
            <p>{(snap as { packageAdvice?: { pkg: string } }).packageAdvice ? `Advies (oude versie): Woningscan ${(snap as { packageAdvice?: { pkg: string } }).packageAdvice!.pkg} · ` : ""}Drone: {snap.drone ? "ja" : "nee"}</p>
          </div>
        )}

        <div className="mt-8"><p className="font-medium text-sm">Antwoorden</p>
          <dl className="mt-2 text-sm space-y-2">{responses.map((x) => <div key={x.question_id}><dt className="text-muted-foreground">{QUESTION_MAP[x.question_id]?.text ?? x.question_id}</dt><dd>{label(x.question_id, x.answer_value)}</dd></div>)}</dl>
        </div>

        <div className="mt-8"><label htmlFor="notes" className="font-medium text-sm">Interne notities</label>
          <textarea id="notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-2 w-full border border-border bg-background p-3 text-sm" />
          <Button className="mt-2" variant="outline" onClick={() => update({ notes }, "notitie_bijgewerkt")}>Notitie opslaan</Button>
        </div>

        <div className="mt-8"><p className="font-medium text-sm">Historiek</p>
          <ul className="mt-2 text-sm space-y-1">{events.map((e) => <li key={e.id}>{new Date(e.created_at).toLocaleString("nl-BE")} — {e.event_type}{e.detail ? `: ${e.detail}` : ""}</li>)}</ul>
        </div>
      </div>
    </div>
  );
};
