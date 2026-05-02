import { describe, expect, it } from "vitest";
import { createPendingBumId, createPendingClientId, getKnownClientForEmail } from "@/data/authData";

describe("auth data helpers", () => {
  it("matches an existing client from a known user email alias", () => {
    expect(getKnownClientForEmail("revops@acmecorp.com")?.company).toBe("AcmeCorp");
  });

  it("matches an existing client from the email domain", () => {
    expect(getKnownClientForEmail("new.person@bluewave.io")?.company).toBe("BlueWave Solutions");
  });

  it("does not match unknown client domains", () => {
    expect(getKnownClientForEmail("founder@freshco.example")).toBeUndefined();
  });

  it("creates stable pending ids for first-time signups", () => {
    expect(createPendingClientId("Fresh Co, Inc.")).toBe("pending-client-fresh-co-inc");
    expect(createPendingBumId("newbum@example.com")).toBe("pending-bum-newbum");
  });
});
