import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MAIL_MODE, mayReceiveReportMail, resolveRecipients } from "../../supabase/functions/_shared/quickscan/mail-policy";
import { sendMail, OWNER_EMAIL } from "../../supabase/functions/_shared/mail";
afterEach(() => vi.unstubAllGlobals());
beforeEach(() => vi.stubGlobal("AbortSignal", { timeout: () => undefined }));
describe("Explicitly approved automatic delivery", () => {
  it("activates production for new report submissions", () => expect(MAIL_MODE).toBe("production"));
  it("addresses the PDF only to the requesting customer", () => expect(resolveRecipients("report", "visitor@example.com")).toEqual(["visitor@example.com"]));
  it("notifies DIMAC internally", () => expect(resolveRecipients("lead_notification", null)).toEqual(["info@dimac.be"]));
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