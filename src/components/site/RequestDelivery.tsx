import { useRef, useState } from "react";
import { submitRequest, type RequestType } from "@/lib/requestSubmission";
export function useRequestDelivery(type: RequestType) {
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [website, setWebsite] = useState("");
  const startedAt = useRef(Date.now());
  const identity = useRef<string>();
  const previous = useRef("");
  const inFlight = useRef(false);
  const send = async (fields: Record<string, unknown>) => {
    if (inFlight.current) return false;
    inFlight.current = true; setPending(true); setError(""); setStatus("");
    const signature = JSON.stringify(fields);
    if (!identity.current || previous.current !== signature) { identity.current = crypto.randomUUID(); previous.current = signature; }
    try {
      const result = await submitRequest({ ...fields, type, id: identity.current, website, startedAt: startedAt.current });
      setStatus(result.ownerStatus === "failed" ? "Uw aanvraag is veilig opgeslagen. De e-mailmelding aan DIMAC kon nog niet worden verstuurd." : "Uw aanvraag is geregistreerd. Een bevestigingsmail is aangevraagd; controleer ook uw spammap.");
      return true;
    } catch (e) { setError(e instanceof Error ? e.message : "Verzending mislukt."); return false; }
    finally { inFlight.current = false; setPending(false); }
  };
  return { send, pending, status, error, website, setWebsite };
}
export function RequestDelivery({ delivery }: { delivery: ReturnType<typeof useRequestDelivery> }) {
  return <>
    <div className="hidden" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" value={delivery.website} onChange={(e) => delivery.setWebsite(e.target.value)} /></label></div>
    {delivery.status && <p role="status" className="border-l-2 border-accent bg-accent-soft/50 p-5 text-sm text-primary">{delivery.status}</p>}
    {delivery.error && <p role="alert" className="text-destructive text-sm">{delivery.error}</p>}
  </>;
}
