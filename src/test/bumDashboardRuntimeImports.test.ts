import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dashboardSource = readFileSync("src/pages/bum/BumDashboard.tsx", "utf8");
const packageSource = readFileSync("package.json", "utf8");

describe("Bum dashboard runtime imports", () => {
  it("imports every field component used by the profile prompt card", () => {
    expect(dashboardSource).toContain("import { Input } from \"@/components/ui/input\";");
    expect(dashboardSource).toContain("import { Label } from \"@/components/ui/label\";");
    expect(dashboardSource).toContain("import { Textarea } from \"@/components/ui/textarea\";");
    expect(dashboardSource).toContain("<Input");
    expect(dashboardSource).toContain("<Label");
    expect(dashboardSource).toContain("<Textarea");
  });

  it("runs lint as part of the production build gate", () => {
    const packageJson = JSON.parse(packageSource) as { scripts?: Record<string, string> };
    expect(packageJson.scripts?.build).toContain("eslint .");
    expect(packageJson.scripts?.build).toContain("vite build");
  });
});
