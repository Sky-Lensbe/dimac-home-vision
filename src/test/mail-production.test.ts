import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MAIL_MODE, mayReceiveReportMail, resolveRecipients, reportMailEnvelope } from "../../supabase/functions/_shared/quickscan/mail-policy";
import { sendMail, OWNER_EMAIL, INTERNAL_NOTIFICATION_RECIPIENTS, MAIL_SENDER } from "../../supabase/functions/_shared/mail";
import { reportEmail } from "../../supabase/functions/_shared/quickscan/delivery";
afterEach(() => vi.unstubAllGlobals());
beforeEach(() => vi.stubGlobal("AbortSignal", { timeout: () => undefined }));
describe("Explicitly approved automatic delivery", () => {
  it("sends all request notifications and confirmations from info@dimac.be", () => expect(MAIL_SENDER).toBe("Dimac <info@dimac.be>"));
  it("sends Quickscan PDFs from info@dimac.be", () => expect(reportEmail("Test", "QS-20261124-ABC12345", "https://www.dimac.be/logo-dimac.png").from).toBe("Dimac <info@dimac.be>"));
  it("routes Quickscan replies to info@dimac.be", () => expect(reportEmail("Test", "QS-20261124-ABC12345", "https://www.dimac.be/logo-dimac.png").reply_to).toBe("info@dimac.be"));
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
    const getEnv = vi.fn((name: string) => name === "RESEND_API_KEY" ? "test-resend-key" : undefined);
    vi.stubGlobal("Deno", { env: { get: getEnv } });
    const mail = { to: [OWNER_EMAIL], subject: "Synthetic test", text: "No mail is sent in this test." };
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "synthetic-provider-id" }), { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    expect(await sendMail(mail, "request-owner-123")).toEqual({ status: "accepted", providerId: "synthetic-provider-id" });
    expect(getEnv).toHaveBeenCalledExactlyOnceWith("RESEND_API_KEY");
    expect(fetch).toHaveBeenCalledExactlyOnceWith("https://api.resend.com/emails", expect.objectContaining({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-resend-key",
        "Idempotency-Key": "request-owner-123",
      },
      body: JSON.stringify(mail),
    }));
  });
  it("fails explicitly when the Resend API key is missing", async () => {
    vi.stubGlobal("Deno", { env: { get: () => undefined } });
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    expect(await sendMail({}, "request-owner-123")).toEqual({ status: "failed", detail: "Resend-configuratie ontbreekt" });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("an ambiguous network failure is never retried blindly", async () => {
    vi.stubGlobal("Deno", { env: { get: (name: string) => name === "RESEND_API_KEY" ? "test-resend-key" : undefined } });
    const fetch = vi.fn().mockRejectedValue(new Error("timeout")); vi.stubGlobal("fetch", fetch);
    expect((await sendMail({}, "request-owner-123")).status).toBe("failed");
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});