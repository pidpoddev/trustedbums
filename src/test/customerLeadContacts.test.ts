import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const reverseOpportunitiesSource = readFileSync("src/pages/bum/BumReverseOpportunities.tsx", "utf8");

describe("customer lead contact capture", () => {
  it("lets Bums attach existing contacts and save new Customer contacts to My Contacts", () => {
    expect(reverseOpportunitiesSource).toContain("listBumRepresentedContacts");
    expect(reverseOpportunitiesSource).toContain("Pull from My Contacts");
    expect(reverseOpportunitiesSource).toContain("addExistingContact(selectedExistingContactId)");
    expect(reverseOpportunitiesSource).toContain("Known contacts at the Customer");
    expect(reverseOpportunitiesSource).toContain("createBumRepresentedContact({");
    expect(reverseOpportunitiesSource).toContain('companyName: form.customer_company_name');
    expect(reverseOpportunitiesSource).toContain('queryClient.invalidateQueries({ queryKey: ["bum-represented-contacts", user?.id] })');
  });
});
