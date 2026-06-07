import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const portalLayouts = [
  "src/layouts/AdminLayout.tsx",
  "src/layouts/BumLayout.tsx",
  "src/layouts/ClientLayout.tsx",
];

describe("conversation dock layout", () => {
  it("reserves bottom scroll space so fixed chat controls do not cover page actions", () => {
    for (const layoutPath of portalLayouts) {
      const source = readFileSync(layoutPath, "utf8");

      expect(source, layoutPath).toContain("p-4 pb-24 sm:p-6 sm:pb-28");
      expect(source, layoutPath).toContain("<ConversationDock />");
    }
  });
});
