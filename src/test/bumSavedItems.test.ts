import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const portalApiSource = readFileSync("src/lib/portalApi.ts", "utf8");
const bumClientsSource = readFileSync("src/pages/bum/BumClients.tsx", "utf8");

describe("Bum saved item state", () => {
  it("keeps saved and hidden marketplace item states mutually exclusive", () => {
    expect(portalApiSource).toContain("export async function setBumHiddenItem");
    expect(portalApiSource).toContain(".update({ is_saved: true, is_hidden: false, hidden_reason: null })");
    expect(portalApiSource).toContain('.update({ is_saved: false, is_hidden: true, hidden_reason: reason ?? "skip" })');
  });

  it("only treats explicitly saved client rows as hearted", () => {
    expect(bumClientsSource).toContain('item.item_type === "CLIENT" && item.is_saved');
  });

  it("keeps hidden client rows out of the default Represented Clients list", () => {
    expect(bumClientsSource).toContain('item.item_type === "CLIENT" && item.is_hidden');
    expect(bumClientsSource).toContain('setBumHiddenItem(user!, { itemType: "CLIENT", itemId }, hidden, "skip")');
    expect(bumClientsSource).toContain("const matchesHidden = showHidden || !hiddenClientIds.has(client.id);");
    expect(bumClientsSource).toContain("Hidden{hiddenCount ? ` (${hiddenCount})` : \"\"}");
    expect(bumClientsSource).toContain('{isHidden ? "Unhide" : "Hide"}');
  });
});
