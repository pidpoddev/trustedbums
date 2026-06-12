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
const tooltipSource = readFileSync("src/components/ui/tooltip.tsx", "utf8");
const adminScrumTrackerSource = readFileSync("src/pages/admin/AdminScrumTracker.tsx", "utf8");
const selectSource = readFileSync("src/components/ui/select.tsx", "utf8");
const bumContactsSource = readFileSync("src/pages/bum/BumContacts.tsx", "utf8");
const visualAuditSource = readFileSync("tests/e2e/visual-ui-audit.spec.ts", "utf8");

describe("UI visual cleanup guardrails", () => {
  it("keeps dialogs above fixed portal widgets with opaque surfaces", () => {
    expect(dialogSource).toContain("z-[70] bg-black/80");
    expect(dialogSource).toContain("z-[80]");
    expect(dialogSource).toContain("bg-background p-6 text-foreground shadow-2xl");
    expect(feedbackSource).toContain("max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] overflow-y-auto bg-background");
  });

  it("keeps the mobile chat launcher safe where it remains enabled", () => {
    expect(conversationDockSource).toContain("bottom-3 right-3 z-40");
    expect(conversationDockSource).toContain("h-11 rounded-full px-3");
    expect(conversationDockSource).toContain("sr-only sm:not-sr-only");
    expect(conversationDockSource).toContain("showLauncher = true");
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

  it("keeps researched opportunities discoverable before duplicate target cards", () => {
    expect(bumOpportunitiesSource).toContain("listPotentialDecisionMakerMatchCountsForOpportunities");
    expect(bumOpportunitiesSource).toContain("Research Bot ${researchMatchCount}");
    expect(bumOpportunitiesSource).toContain("listOpportunityQuestionOpportunityIdsForBum");
    expect(bumOpportunitiesSource).toContain("prioritizedFiltered");
    expect(bumOpportunitiesSource).toContain("maybeFiltered");
    expect(bumOpportunitiesSource).toContain("Check LinkedIn");
    expect(bumOpportunitiesSource).toContain("Skip/Hide");
    expect(bumOpportunitiesSource).toContain("Recommend Customer Opportunity");
    expect(bumOpportunitiesSource.match(/Recommend Customer Opportunity/g)).toHaveLength(1);
    expect(bumOpportunitiesSource).not.toContain("Recommend customer");
    expect(bumOpportunitiesSource).toContain("Show More");
    expect(bumOpportunitiesSource).toContain("Open details");
    expect(bumOpportunitiesSource).toContain('Link to={"/bum/opportunities/" + opportunity.id}');
    expect(bumOpportunitiesSource).toContain('setExpandedTargetIds((current) => {');
    expect(bumOpportunitiesSource).toContain("dedupedTargets");
    expect(bumOpportunitiesSource).toContain('...maybeFiltered.map((item) => ({ type: "opportunity" as const, item }))');
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

  it("keeps mobile tooltip overlays from blocking modal controls", () => {
    expect(tooltipSource).toContain("pointer-events-none z-50");
  });

  it("keeps select menus visible above modals with clear relationship options", () => {
    expect(selectSource).toContain("relative z-[90]");
    expect(bumContactsSource).toContain('value: "ACQUAINTANCE", label: "Acquaintance"');
    expect(bumContactsSource).toContain('value: "TRUSTED_BUSINESS_ASSOCIATE", label: "Trusted business associate"');
    expect(bumContactsSource).toContain('value: "TRUSTED_FRIEND", label: "Trusted friend"');
    expect(bumContactsSource).not.toContain('<SelectItem value="STRONG">Strong</SelectItem>');
  });

  it("keeps the long scrum tracker list inside a bounded scroll area", () => {
    expect(adminScrumTrackerSource).toContain("max-h-[620px] overflow-auto overscroll-contain rounded-md border md:max-h-[720px]");
    expect(adminScrumTrackerSource).toContain('TableHeader className="sticky top-0 z-10 bg-background"');
  });

  it("keeps visual error-page detection focused on real route failures", () => {
    expect(visualAuditSource).toContain("404 page not found");
    expect(visualAuditSource).toContain("route not found");
    expect(visualAuditSource).not.toContain("configuration needed|set a production clerk publishable key|404|page not found");
  });
});
