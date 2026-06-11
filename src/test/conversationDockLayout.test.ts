import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const floatingDockLayouts = [
  "src/layouts/AdminLayout.tsx",
];
const bumLayoutSource = readFileSync("src/layouts/BumLayout.tsx", "utf8");
const clientLayoutSource = readFileSync("src/layouts/ClientLayout.tsx", "utf8");

describe("conversation dock layout", () => {
  it("reserves bottom scroll space where fixed chat controls remain visible", () => {
    for (const layoutPath of floatingDockLayouts) {
      const source = readFileSync(layoutPath, "utf8");

      expect(source, layoutPath).toContain("p-4 pb-32 sm:p-6 sm:pb-28");
      expect(source, layoutPath).toContain("<ConversationDock />");
    }
  });

  it("moves the Bum chat launcher into Inbox while keeping programmatic conversation opens available", () => {
    expect(bumLayoutSource).toContain('{ title: "Inbox", url: "/bum/live-conversations"');
    expect(bumLayoutSource).toContain("<ConversationDock showLauncher={false} />");
    expect(bumLayoutSource).toContain("p-4 sm:p-6");
  });

  it("moves the Client chat launcher into Inbox while keeping programmatic conversation opens available", () => {
    expect(clientLayoutSource).toContain('{ title: "Inbox", url: "/client/live-conversations"');
    expect(clientLayoutSource).toContain("<ConversationDock showLauncher={false} />");
    expect(clientLayoutSource).toContain("p-4 sm:p-6");
  });
});
