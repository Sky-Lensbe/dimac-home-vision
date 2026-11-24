import { createClient } from "@supabase/supabase-js";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import type { Database, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// Capture requests locally: no credentials or hosted data needed.
const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
  new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } }));
const client = createClient<Database>("https://schema-test.supabase.co", "test-key", {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: fetchMock },
});

describe("application Supabase schema contract", () => {
  it("accepts every table queried by the admin dashboard", async () => {
    const tables = [
      "contact_submissions", "user_roles", "quickscan_leads",
      "quickscan_reports", "quickscan_responses", "quickscan_events",
    ] as const;
    for (const table of tables) {
      fetchMock.mockClear();
      const { error } = await client.from(table).select("*");
      expect(error).toBeNull();
      expect(fetchMock).toHaveBeenCalledOnce();
      const [input] = fetchMock.mock.calls[0];
      expect(new URL(String(input)).pathname).toBe(`/rest/v1/${table}`);
    }
  });

  it("types lead updates and event inserts rather than resolving to never", async () => {
    expectTypeOf<{ status: string; notes: string }>().toMatchTypeOf<TablesUpdate<"quickscan_leads">>();
    expectTypeOf<{ lead_id: string; event_type: string; detail: null }>().toMatchTypeOf<TablesInsert<"quickscan_events">>();
    fetchMock.mockClear();
    await client.from("quickscan_leads").update({ status: "nieuw", notes: "test" });
    await client.from("quickscan_events").insert({ lead_id: "test-id", event_type: "test", detail: null });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][1]?.method).toBe("PATCH");
    expect(fetchMock.mock.calls[1][1]?.method).toBe("POST");
  });
});