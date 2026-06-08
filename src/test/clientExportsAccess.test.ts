import { describe, expect, it } from "vitest";
import {
  buildClientExportCards,
  buildMeetingExportRows,
  buildPaymentExportRows,
  buildTargetExportRows,
} from "@/pages/client/clientExportsModel";
import type { CustomerPaymentReportRecord, CustomerTargetRecord, TeamsMeetingRecord } from "@/lib/portalApi";

const targetFixture = {
  id: "target-1",
  client_company_id: "company-1",
  target_company_id: "target-company-1",
  created_by: "client-admin-1",
  status: "NEW",
  priority: "HIGH",
  target_account_name: "Acme",
  business_unit: "Enterprise",
  key_contact_name: "Pat Buyer",
  key_contact_title: "CRO",
  key_contact_email: "pat@example.com",
  expected_product_service: "Platform",
  estimated_deal_value: 50000,
  expected_timeline: "Q3",
  notes: "Operational note",
  created_at: "2026-06-01T00:00:00.000Z",
  updated_at: "2026-06-01T00:00:00.000Z",
} satisfies CustomerTargetRecord;

const meetingFixture = {
  id: "meeting-1",
  customer_target_id: "target-1",
  client_company_id: "company-1",
  target_company_id: "target-company-1",
  opportunity_registration_id: null,
  opportunity_claim_id: null,
  scheduled_by: "client-admin-1",
  subject: "Buyer meeting",
  description: "Operational meeting",
  start_time: "2026-06-02T15:00:00.000Z",
  end_time: "2026-06-02T15:30:00.000Z",
  attendees: [{ email: "buyer@example.com", name: "Buyer", response: "accepted" }],
  teams_join_url: "https://teams.example/join",
  microsoft_event_id: null,
  microsoft_online_meeting_id: null,
  microsoft_event_web_link: null,
  status: "SCHEDULED",
  transcript_sync_status: "AVAILABLE",
  transcript_sync_attempted_at: null,
  transcript_sync_error: null,
  created_at: "2026-06-01T00:00:00.000Z",
  updated_at: "2026-06-01T00:00:00.000Z",
  customer_targets: {
    id: "target-1",
    target_account_name: "Acme",
    key_contact_name: "Pat Buyer",
    key_contact_email: "pat@example.com",
  },
} satisfies TeamsMeetingRecord;

const paymentFixture = {
  id: "payment-1",
  opportunity_claim_id: "claim-1",
  opportunity_registration_id: "opportunity-1",
  company_id: "company-1",
  reported_by: "client-finance-1",
  source: "CLIENT",
  customer_name: "Acme",
  gross_amount: 100000,
  commissionable_amount: 80000,
  excluded_amount: 20000,
  currency: "USD",
  customer_payment_received_at: "2026-06-03T00:00:00.000Z",
  notes: "Finance note",
  status: "REPORTED",
  created_at: "2026-06-03T00:00:00.000Z",
  updated_at: "2026-06-03T00:00:00.000Z",
  opportunity_claims: null,
  opportunity_registrations: {
    id: "opportunity-1",
    target_account_name: "Acme",
    commission_rate: 10,
    commission_schedule_start_at: null,
  },
} satisfies CustomerPaymentReportRecord;

describe("Client export access boundaries", () => {
  it("keeps Client Finance export cards finance-safe", () => {
    const paymentRows = buildPaymentExportRows([paymentFixture], "ALL");
    const cards = buildClientExportCards({
      user: { clientAccessRole: "CLIENT_FINANCE" },
      targetRows: buildTargetExportRows([targetFixture], "ALL"),
      meetingRows: buildMeetingExportRows([meetingFixture], "ALL"),
      paymentRows,
    });

    expect(cards.map((card) => card.title)).toEqual(["Customer payments"]);
    expect(cards[0].filename).toBe("trustedbums-customer-payments.csv");
    expect(Object.keys(cards[0].rows[0])).toEqual([
      "customer_name",
      "opportunity",
      "status",
      "gross_revenue",
      "commissionable_revenue",
      "non_commissionable_amount",
      "customer_payment_received_at",
      "created_at",
    ]);
  });

  it("keeps operational export cards limited to Client Admin", () => {
    const cards = buildClientExportCards({
      user: { clientAccessRole: "CLIENT_ADMIN" },
      targetRows: buildTargetExportRows([targetFixture], "ALL"),
      meetingRows: buildMeetingExportRows([meetingFixture], "ALL"),
      paymentRows: buildPaymentExportRows([paymentFixture], "ALL"),
    });

    expect(cards.map((card) => card.title)).toEqual(["Target accounts", "Meetings and transcripts", "Customer payments"]);
    expect(Object.keys(cards[0].rows[0])).toContain("key_contact_email");
    expect(Object.keys(cards[1].rows[0])).toEqual([
      "subject",
      "status",
      "target_account",
      "start_time",
      "end_time",
      "attendees",
      "teams_join_url",
      "transcript_sync_status",
    ]);
  });
});
