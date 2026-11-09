import { attemptOutcome, deliveryKey, deliveryRecipient, reportEmail, type DeliveryIdentity } from "./delivery.ts";

/** Dependency-injected preparation: production transport and database adapter are intentionally absent. */
export interface DeliveryJob extends DeliveryIdentity { id: string; lease: string; attempt: number; firstName: string; snapshot: unknown }
export interface DeliveryPorts {
  claim(): Promise<DeliveryJob | null>;
  pdf(snapshot: unknown): Promise<Uint8Array>;
  send(message: ReturnType<typeof reportEmail> & { to: string; idempotencyKey: string; attachment: { filename: string; content: Uint8Array } }): Promise<{ status: number; providerId: string | null; retryAfterSeconds?: number }>;
  finish(job: DeliveryJob, outcome: ReturnType<typeof attemptOutcome>, providerId: string | null, errorCode: string | null): Promise<void>;
}

export async function processOneDelivery(ports: DeliveryPorts, logoUrl: string, now: number): Promise<boolean> {
  const job = await ports.claim();
  if (!job) return false;
  let recipient: string;
  let pdf: Uint8Array;
  try {
    recipient = deliveryRecipient(job);
    pdf = await ports.pdf(job.snapshot);
    if (pdf.length < 5 || new TextDecoder().decode(pdf.slice(0, 5)) !== "%PDF-") throw new Error("INVALID_PDF");
  } catch {
    await ports.finish(job, attemptOutcome(422, job.attempt, now), null, "PREPARATION_FAILED");
    return true;
  }
  try {
    const result = await ports.send({ ...reportEmail(job.firstName, job.reportNumber, logoUrl), to: recipient,
      idempotencyKey: deliveryKey(job), attachment: { filename: `DIMAC-Quickscan-${job.reportNumber}.pdf`, content: pdf } });
    const outcome = result.status >= 200 && result.status < 300 && !result.providerId
      ? attemptOutcome(null, job.attempt, now)
      : attemptOutcome(result.status, job.attempt, now, result.retryAfterSeconds);
    await ports.finish(job, outcome, result.providerId, outcome.status === "accepted" ? null : `PROVIDER_${result.status}`);
  } catch {
    // A network break may follow provider acceptance. Never blindly resend.
    await ports.finish(job, attemptOutcome(null, job.attempt, now), null, "AMBIGUOUS_PROVIDER_RESULT");
  }
  return true;
}