import { describe, expect, it } from "vitest";
import { createPendingBumId, createPendingClientId, getKnownClientForEmail } from "@/data/authData";

describe("auth data helpers", () => {
  it("matches configured client fallback accounts without mock company data", () => {
    expect(getKnownClientForEmail("qa_client_admin@qa.com")?.company).toBe("QA");
  });

  it("does not infer client companies from static demo domains", () => {
    expect(getKnownClientForEmail("new.person@bluewave.io")).toBeUndefined();
  });

  it("does not match unknown client domains", () => {
    expect(getKnownClientForEmail("founder@freshco.example")).toBeUndefined();
  });

  it("creates stable pending ids for first-time signups", () => {
    expect(createPendingClientId("Fresh Co, Inc.")).toBe("pending-client-fresh-co-inc");
    expect(createPendingBumId("newbum@example.com")).toBe("pending-bum-newbum");
  });
});
