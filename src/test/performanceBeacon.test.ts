import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const beaconSource = readFileSync("supabase/functions/performance-beacon/index.ts", "utf8");

describe("performance beacon reliability", () => {
  it("keeps telemetry storage failures from surfacing as page-level 500 responses", () => {
    expect(beaconSource).toContain("function sanitizedRawPayload");
    expect(beaconSource).toContain("raw_payload: sanitizedPayload");
    expect(beaconSource).toContain("return json(202, { ok: true, stored: false }, origin);");
    expect(beaconSource).not.toContain('return json(500, { error: "Unable to store performance metric." }, origin);');
  });
});
