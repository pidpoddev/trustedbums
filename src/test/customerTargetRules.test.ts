import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUser } from "@/data/authData";

const customerTargetPolicySource = readFileSync(
  "supabase/migrations/20260607194500_remove_saved_target_read_entitlement.sql",
  "utf8",
);

const fromMock = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getSupabaseAccessToken: vi.fn(),
  supabase: {
    from: fromMock,
  },
  supabasePublishableKey: "test-publishable-key",
  supabaseUrl: "https://example.supabase.co",
}));

const { createCustomerTarget } = await import("@/lib/portalApi");

function createQueryResult<T>(data: T, error: unknown = null) {
  return { data, error };
}

function createCompaniesTableMock(calls: {
  companyInsertPayloads: unknown[];
}) {
  return {
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        limit: vi.fn(() => ({
          maybeSingle: vi.fn(async () => createQueryResult(null)),
        })),
      })),
      ilike: vi.fn(() => ({
        returns: vi.fn(async () => createQueryResult([])),
      })),
    })),
    insert: vi.fn((payload) => {
      calls.companyInsertPayloads.push(payload);
      return {
        select: vi.fn(() => ({
          single: vi.fn(async () =>
            createQueryResult({
              id: "target-company-1",
              name: payload.name,
              website: payload.website,
              relationship_stage: payload.relationship_stage,
              linkedin_company_url: payload.linkedin_company_url,
              created_at: "2026-06-08T00:00:00.000Z",
            }),
          ),
        })),
      };
    }),
  };
}

function createAuditEventsTableMock(calls: {
  auditInsertPayloads: unknown[];
}) {
  return {
    insert: vi.fn(async (payload) => {
      calls.auditInsertPayloads.push(payload);
      return { error: null };
    }),
  };
}

function createCompanyDomainsTableMock() {
  return {
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        limit: vi.fn(() => ({
          maybeSingle: vi.fn(async () => createQueryResult(null)),
        })),
      })),
    })),
  };
}

describe("customer target company rules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates client target companies as prospects with company-scoped target and audit rows", async () => {
    const calls = {
      auditInsertPayloads: [] as unknown[],
      companyInsertPayloads: [] as unknown[],
      targetUpsertPayloads: [] as unknown[],
    };

    vi.stubGlobal("fetch", vi.fn(async (_url, init) => {
      calls.targetUpsertPayloads.push(JSON.parse(String((init as RequestInit).body)));
      return new Response(null, { status: 204 });
    }));

    fromMock.mockImplementation((table: string) => {
      if (table === "companies") {
        return createCompaniesTableMock(calls);
      }
      if (table === "audit_events") {
        return createAuditEventsTableMock(calls);
      }
      if (table === "company_domains") {
        return createCompanyDomainsTableMock();
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    const user = {
      id: "client-admin-1",
      email: "client.admin@example.com",
      name: "Client Admin",
      role: "CLIENT",
      clientAccessRole: "CLIENT_ADMIN",
      clientId: "client-company-1",
    } satisfies AuthUser;

    await createCustomerTarget(user, {
      target_account_name: " Acme ",
      key_contact_name: "Pat Buyer",
      key_contact_title: "CRO",
      key_contact_email: "pat@example.com",
      expected_product_service: "Platform",
      estimated_deal_value: 50000,
      expected_timeline: "Q3",
      notes: "Warm account",
      priority: "HIGH",
    });

    expect(calls.companyInsertPayloads).toEqual([
      {
        name: "Acme",
        website: null,
        linkedin_company_url: null,
        relationship_stage: "PROSPECT",
      },
    ]);
    expect(calls.targetUpsertPayloads).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        client_company_id: "client-company-1",
        target_company_id: "target-company-1",
        created_by: "client-admin-1",
        priority: "HIGH",
        status: "PROSPECT",
        target_account_name: "Acme",
      }),
    ]);
    expect(calls.auditInsertPayloads).toEqual([
      expect.objectContaining({
        company_id: "client-company-1",
        user_id: "client-admin-1",
        event_type: "customer_target_created",
        entity_type: "customer_targets",
        entity_id: calls.targetUpsertPayloads[0]?.id,
        event_data: expect.objectContaining({
          target_company_id: "target-company-1",
          target_account_name: "Acme",
          status: "PROSPECT",
        }),
      }),
    ]);
  });

  it("does not grant Bum customer target reads from saved items alone", () => {
    expect(customerTargetPolicySource).toContain('"Bums can read explicitly assigned customer targets"');
    expect(customerTargetPolicySource).toContain("public.customer_target_responses");
    expect(customerTargetPolicySource).toContain("response.status in ('ACCEPTED', 'CONTACTED', 'MEETING_SET')");
    expect(customerTargetPolicySource).toContain("public.teams_meetings");
    expect(customerTargetPolicySource).not.toContain("public.bum_saved_items");
  });
});
