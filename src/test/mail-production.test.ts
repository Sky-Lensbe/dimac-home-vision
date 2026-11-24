import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MAIL_MODE, mayReceiveReportMail, resolveRecipients, reportMailEnvelope } from "../../supabase/functions/_shared/quickscan/mail-policy";
import { sendMail, OWNER_EMAIL, INTERNAL_NOTIFICATION_RECIPIENTS } from "../../supabase/functions/_shared/mail";
afterEach(() => vi.unstubAllGlobals());
beforeEach(() => vi.stubGlobal("AbortSignal", { timeout: () => undefined }));
describe("Explicitly approved automatic delivery", () => {
  it("activates production for new report submissions", () => expect(MAIL_MODE).toBe("production"));
  it("copies every new PDF to Sky-Lens without replacing the customer", () => expect(reportMailEnvelope("visitor@example.com")).toEqual({ to: ["visitor@example.com"], bcc: ["info@sky-lens.be"] }));
  it("copies all Quickscan notifications to Sky-Lens alongside DIMAC", () => expect(resolveRecipients("lead_notification", null)).toEqual(["info@dimac.be", "info@sky-lens.be"]));
  it("copies all contact, renovation and Woningscan requests to Sky-Lens alongside DIMAC", () => expect([...INTERNAL_NOTIFICATION_RECIPIENTS]).toEqual(["info@dimac.be", "info@sky-lens.be"]));
  it("does not send a second PDF when the applicant is already Sky-Lens", () => expect(reportMailEnvelope("INFO@SKY-LENS.BE")).toEqual({ to: ["info@sky-lens.be"] }));
  it("never includes DIMAC or customers in test-mode report copies", () => expect(reportMailEnvelope("visitor@example.com", "test")).toEqual({ to: ["info@sky-lens.be"] }));
  it("accepts normal customer addresses for report delivery", () => expect(mayReceiveReportMail("visitor@example.com")).toBe(true));
  it("rejects invalid recipient addresses", () => expect(mayReceiveReportMail("not-an-email")).toBe(false));
  it("keeps explicit test mode confined to Sky-Lens", () => expect(mayReceiveReportMail("visitor@example.com", "test")).toBe(false));
  it("sends contact notifications to the confirmed owner", () => expect(OWNER_EMAIL).toBe("info@dimac.be"));
  it("provider acceptance remains accepted, not delivered", async () => {
    vi.stubGlobal("Deno", { env: { get: () => "test-only" } });
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "synthetic-provider-id" }), { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    expect((await sendMail({ to: [OWNER_EMAIL] }, "request-owner-123")).status).toBe("accepted");
    expect(fetch.mock.calls[0][1].headers["Idempotency-Key"]).toBe("request-owner-123");
  });
  it("an ambiguous network failure is never retried blindly", async () => {
    vi.stubGlobal("Deno", { env: { get: () => "test-only" } });
    const fetch = vi.fn().mockRejectedValue(new Error("timeout")); vi.stubGlobal("fetch", fetch);
    expect((await sendMail({}, "request-owner-123")).status).toBe("failed");
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});