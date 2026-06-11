import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const clientDashboardSource = readFileSync("src/pages/client/ClientDashboard.tsx", "utf8");

describe("client dashboard layout", () => {
  it("keeps metrics, pipeline, and actions in a balanced dashboard layout", () => {
    expect(clientDashboardSource).toContain("xl:grid-cols-[minmax(0,1fr)_360px]");
    expect(clientDashboardSource).toContain("lg:grid-cols-5");
    expect(clientDashboardSource).toContain("xl:sticky xl:top-20");
    expect(clientDashboardSource).toContain('title="Active"');
    expect(clientDashboardSource).toContain('title="Published"');
    expect(clientDashboardSource).toContain('title="Drafts"');
    expect(clientDashboardSource).not.toContain('title="Draft Opportunities"');
    expect(clientDashboardSource).not.toContain('title="Published to Bums"');
  });
});
