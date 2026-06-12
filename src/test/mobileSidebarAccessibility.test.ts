import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sidebarSource = readFileSync("src/components/ui/sidebar.tsx", "utf8");
const adminLayoutSource = readFileSync("src/layouts/AdminLayout.tsx", "utf8");
const clientLayoutSource = readFileSync("src/layouts/ClientLayout.tsx", "utf8");
const bumLayoutSource = readFileSync("src/layouts/BumLayout.tsx", "utf8");

describe("mobile portal sidebar accessibility", () => {
  it("keeps the shared mobile sidebar dialog named and dismissible", () => {
    expect(sidebarSource).toContain("SheetHeader");
    expect(sidebarSource).toContain("SheetTitle");
    expect(sidebarSource).toContain("Portal navigation");
    expect(sidebarSource).not.toContain("[&>button]:hidden");
    expect(sidebarSource).toContain("[&>button]:opacity-100");
  });

  it("uses a hamburger trigger with explicit navigation state", () => {
    expect(sidebarSource).toContain('import { Menu } from "lucide-react"');
    expect(sidebarSource).toContain('aria-label="Toggle portal navigation"');
    expect(sidebarSource).toContain('aria-expanded={isMobile ? openMobile : state === "expanded"}');
    expect(sidebarSource).toContain("Toggle portal navigation");
  });

  it("applies to every portal layout through the shared sidebar", () => {
    expect(adminLayoutSource).toContain("SidebarTrigger");
    expect(clientLayoutSource).toContain("SidebarTrigger");
    expect(bumLayoutSource).toContain("SidebarTrigger");
  });
});
