import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
type RequestRow = { id: string; created_at: string; form_type: string; name: string; email: string; payload: unknown; owner_status: string; confirmation_status: string };
export function StoredRequests() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [error, setError] = useState(false);
  const load = async () => {
    const { data, error } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }).limit(200);
    setError(!!error); setRows(data ?? []);
  };
  useEffect(() => { void load(); }, []);
  return <section className="mt-12 border-t border-border pt-8">
    <div className="flex flex-wrap justify-between gap-4"><h2 className="font-display text-2xl">Contact- en Woningscan-aanvragen</h2><Button variant="outline" onClick={() => void load()}>Vernieuwen</Button></div>
    {error && <p role="alert" className="text-destructive mt-4">Aanvragen konden niet worden geladen.</p>}
    {!error && !rows.length && <p className="mt-4 text-muted-foreground">Nog geen aanvragen.</p>}
    {rows.map((r) => <details key={r.id} className="border-b border-border py-4">
      <summary className="cursor-pointer">{new Date(r.created_at).toLocaleString("nl-BE")} — {r.name} — {r.form_type}</summary>
      <a className="text-accent underline mt-3 inline-block" href={`mailto:${r.email}`}>{r.email}</a>
      <p className="text-sm mt-2">Melding: {r.owner_status === "accepted" ? "Door maildienst aanvaard" : r.owner_status === "failed" ? "Mislukt — aanvraag blijft bewaard" : "In voorbereiding"}</p>
      <dl className="mt-3 grid gap-2 text-sm">{Object.entries((r.payload ?? {}) as Record<string, unknown>).filter(([k, v]) => !["website", "startedAt", "id", "type"].includes(k) && v !== null && v !== "").map(([k, v]) => <div key={k} className="grid gap-1 sm:grid-cols-[180px_1fr]"><dt className="text-muted-foreground">{k}</dt><dd className="break-words whitespace-pre-wrap">{String(v)}</dd></div>)}</dl>
    </details>)}
  </section>;
}