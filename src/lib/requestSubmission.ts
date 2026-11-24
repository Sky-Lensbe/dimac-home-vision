import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
export type RequestType = "contact" | "renovation" | "woningscan";
const ClientRequest = z.object({ name: z.string().trim().min(1).max(200), email: z.string().trim().email().max(255) }).passthrough();
export async function submitRequest(body: Record<string, unknown>) {
  const parsed = ClientRequest.safeParse(body);
  if (!parsed.success || Object.values(body).some((v) => typeof v === "string" && v.length > (v === body.message ? 4000 : 255))) throw new Error("Controleer uw gegevens en de lengte van uw bericht.");
  const { data, error } = await supabase.functions.invoke("contact-submit", { body: parsed.data });
  if (error || !data?.ok) throw new Error("Uw aanvraag kon niet worden bevestigd. Probeer later opnieuw of mail info@dimac.be.");
  return data as { ok: true; saved: true; ownerStatus?: string; confirmationStatus?: string; duplicate?: boolean };
}
