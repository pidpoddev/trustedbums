import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dialogSource = readFileSync("src/components/ui/dialog.tsx", "utf8");
const feedbackSource = readFileSync("src/components/SubmitFeedbackButton.tsx", "utf8");
const conversationDockSource = readFileSync("src/components/ConversationDock.tsx", "utf8");
const headerActionsSource = readFileSync("src/components/PortalHeaderActions.tsx", "utf8");
const bumOpportunitiesSource = readFileSync("src/pages/bum/BumOpportunities.tsx", "utf8");
const adminCreditsSource = readFileSync("src/pages/admin/AdminCredits.tsx", "utf8");
const contactSubmissionsSource = readFileSync("src/components/admin/ContactSubmissionsPanel.tsx", "utf8");
const clientTargetsSource = readFileSync("src/pages/client/ClientTargets.tsx", "utf8");

describe("UI visual cleanup guardrails", () => {
  it("keeps dialogs above fixed portal widgets with opaque surfaces", () => {
    expect(dialogSource).toContain("z-[70] bg-black/80");
    expect(dialogSource).toContain("z-[80]");
    expect(dialogSource).toContain("bg-background p-6 text-foreground shadow-2xl");
    expect(feedbackSource).toContain("max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] overflow-y-auto bg-background");
  });

  it("keeps the mobile chat launcher from covering form actions", () => {
    expect(conversationDockSource).toContain("bottom-3 right-3 z-40");
    expect(conversationDockSource).toContain("h-11 rounded-full px-3");
    expect(conversationDockSource).toContain("sr-only sm:not-sr-only");
  });

  it("keeps mobile account menus opaque and viewport-bound", () => {
    expect(headerActionsSource).toContain("sideOffset={10}");
    expect(headerActionsSource).toContain("collisionPadding={12}");
    expect(headerActionsSource).toContain("w-[min(16rem,calc(100vw-1rem))] bg-background shadow-xl");
  });

  it("constrains the Bum contact picker on mobile", () => {
    expect(bumOpportunitiesSource).toContain("max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] overflow-y-auto overflow-x-hidden");
    expect(bumOpportunitiesSource).toContain("block break-words text-xs text-muted-foreground");
    expect(bumOpportunitiesSource).toContain('placeholder="Search contacts"');
  });

  it("uses stacked Admin Credits cards on mobile", () => {
    expect(adminCreditsSource).toContain("function ClaimShareMobileCard");
    expect(adminCreditsSource).toContain('className="space-y-3 md:hidden"');
    expect(adminCreditsSource).toContain('className="hidden overflow-x-auto md:block"');
  });

  it("uses short mobile-safe search placeholders", () => {
    expect(contactSubmissionsSource).toContain('placeholder="Search contacts"');
    expect(clientTargetsSource).toContain('placeholder="Search targets"');
  });
});
