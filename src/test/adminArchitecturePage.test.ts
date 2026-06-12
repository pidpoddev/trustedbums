import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appSource = readFileSync("src/App.tsx", "utf8");
const adminLayoutSource = readFileSync("src/layouts/AdminLayout.tsx", "utf8");
const portalSearchSource = readFileSync("src/components/PortalGlobalSearch.tsx", "utf8");
const architectureSource = readFileSync("src/pages/admin/AdminArchitecture.tsx", "utf8");

describe("Admin architecture page", () => {
  it("is available from the protected Admin portal route and sidebar", () => {
    expect(appSource).toContain('const AdminArchitecture = lazy(() => import("./pages/admin/AdminArchitecture"))');
    expect(appSource).toContain('<Route path="architecture" element={<AdminArchitecture />} />');
    expect(adminLayoutSource).toContain('{ title: "Architecture", url: "/admin/architecture", icon: Network }');
  });

  it("is discoverable from portal search", () => {
    expect(portalSearchSource).toContain('id: "page:admin-architecture"');
    expect(portalSearchSource).toContain('href: "/admin/architecture"');
    expect(portalSearchSource).toContain("architecture platform supabase auth api microservices partners");
  });

  it("shows current and proposed platform drawings with architect recommendations", () => {
    expect(architectureSource).toContain("Current Drawing");
    expect(architectureSource).toContain("Proposed Drawing");
    expect(architectureSource).toContain("Project vaoqvtxqvbptyxddpoju");
    expect(architectureSource).toContain("Explicit API Boundary");
    expect(architectureSource).toContain("TB-0087");
    expect(architectureSource).toContain("TB-0090");
    expect(architectureSource).toContain("TB-0099");
  });
});
