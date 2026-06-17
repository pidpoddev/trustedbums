import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentTermsState } from "@/hooks/use-current-terms";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import {
  listClaimInvoices,
  listClientReverseOpportunities,
  listCustomerPaymentReports,
  listCustomerTargetResponses,
  listOpportunityRegistrations,
} from "@/lib/portalApi";
import { formatDateTimeForTimeZone } from "@/lib/timezone";
import { Target, FileCheck, Clock, PlusCircle, ArrowRight, CreditCard, Download, Handshake } from "lucide-react";

type DashboardAction = {
  title: string;
  description: string;
  to: string;
  primary?: boolean;
};

interface DashboardLocationState {
  deniedFrom?: string;
}

type DeniedAccessRecovery = {
  title: string;
  description: string;
  to: string;
  cta: string;
};

function getDeniedAccessRecovery(deniedFrom: string | undefined, isFinanceUser: boolean): DeniedAccessRecovery {
  if (deniedFrom?.includes("/agreements") || deniedFrom?.includes("/terms")) {
    return {
      title: "Client Agreement needs attention.",
      description: "Open agreement records to review the current Client Agreement and continue the recovery path.",
      to: "/client/agreements",
      cta: "Open Client Agreement",
    };
  }

  if (deniedFrom?.includes("/team")) {
    return {
      title: "Team management is for Client Admins.",
      description: "Ask a Client Admin to update your role if you need to manage seats or invite teammates.",
      to: "/client/agreements",
      cta: "Review access records",
    };
  }

  if (deniedFrom?.includes("/payments") || deniedFrom?.includes("/exports")) {
    return {
      title: isFinanceUser ? "That finance area is not available yet." : "Payment reports require finance access.",
      description: isFinanceUser
        ? "Ask a Client Admin to confirm your finance role before trying that workflow again."
        : "Ask a Client Admin to add finance access if you need payment reports, invoices, or exports.",
      to: "/client/agreements",
      cta: "Review access and agreements",
    };
  }

  return {
    title: "That workspace area is not available for this account.",
    description: isFinanceUser
      ? "Ask a Client Admin to adjust access if your finance role needs that workflow."
      : "Ask a Client Admin to adjust your role if you should have access.",
    to: "/client/agreements",
    cta: "Review access and agreements",
  };
}

function NextActionsCard({ actions }: { actions: DashboardAction[] }) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="font-display">Next Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-3">
        {actions.map((action) => (
          <Button
            key={action.title}
            asChild
            variant={action.primary ? "default" : "outline"}
            className="h-auto w-full min-w-0 justify-between gap-3 whitespace-normal py-3 text-left"
          >
            <Link to={action.to}>
              <span className="min-w-0">
                <span className="block break-words font-medium">{action.title}</span>
                <span className="block break-words text-xs font-normal leading-snug opacity-80">{action.description}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const deniedFrom = (location.state as DashboardLocationState | null)?.deniedFrom;
  const timeZone = useUserTimeZone();
  const clientAccessRole = user?.role === "CLIENT" ? user.clientAccessRole ?? "CLIENT_ADMIN" : undefined;
  const isFinanceUser = clientAccessRole === "CLIENT_FINANCE";
  const isLegalUser = clientAccessRole === "CLIENT_LEGAL";
  const isItUser = clientAccessRole === "CLIENT_IT";
  const isWorkspaceUser = clientAccessRole === "CLIENT_ADMIN" || clientAccessRole === "CLIENT_MEMBER";
  const deniedAccessRecovery = getDeniedAccessRecovery(deniedFrom, isFinanceUser);
  const canManagePayments = clientAccessRole === "CLIENT_ADMIN" || clientAccessRole === "CLIENT_FINANCE";
  const { hasAcceptedCurrentTerms } = useCurrentTermsState();
  const opportunitiesQuery = useQuery({
    queryKey: ["client-opportunity-registrations", user?.id],
    queryFn: () => listOpportunityRegistrations(),
    enabled: Boolean(user?.id) && isWorkspaceUser,
  });
  const reportsQuery = useQuery({
    queryKey: ["customer-payment-reports", user?.clientId],
    queryFn: () => listCustomerPaymentReports(user!),
    enabled: Boolean(user?.clientId) && isFinanceUser,
  });
  const invoicesQuery = useQuery({
    queryKey: ["claim-invoices", user?.clientId],
    queryFn: () => listClaimInvoices(user!),
    enabled: Boolean(user?.clientId) && isFinanceUser,
  });
  const reverseOpportunitiesQuery = useQuery({
    queryKey: ["client-reverse-opportunities", user?.clientId],
    queryFn: () => listClientReverseOpportunities(user!),
    enabled: Boolean(user?.clientId) && isWorkspaceUser,
  });
  const targetResponsesQuery = useQuery({
    queryKey: ["client-target-responses", user?.clientId],
    queryFn: () => listCustomerTargetResponses(user!),
    enabled: Boolean(user?.clientId) && isWorkspaceUser,
  });
  const opportunities = opportunitiesQuery.data ?? [];
  const reverseOpportunities = reverseOpportunitiesQuery.data ?? [];
  const targetResponses = targetResponsesQuery.data ?? [];
  const pendingTargetResponses = targetResponses.filter((response) => response.status === "PROPOSED");
  const paymentReports = reportsQuery.data ?? [];
  const invoices = invoicesQuery.data ?? [];
  const activeCount = opportunities.filter((opportunity) =>
    ["Submitted", "Accepted", "Needs Clarification"].includes(opportunity.status),
  ).length;
  const acceptedCount = opportunities.filter((opportunity) => opportunity.status === "Accepted").length;
  const draftCount = opportunities.filter((opportunity) => opportunity.status === "Draft").length;
  const totalCommissionableRevenue = paymentReports.reduce(
    (sum, report) => sum + Number(report.commissionable_amount ?? 0),
    0,
  );
  const generatedInvoiceAmount = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.invoice_amount ?? 0),
    0,
  );
  const pendingPaymentReports = paymentReports.filter((report) => report.status !== "INVOICE_GENERATED").length;
  const unpaidInvoices = invoices.filter((invoice) => !["PAID", "VOID"].includes(invoice.status)).length;
  const financeNextActions: DashboardAction[] = [
    !hasAcceptedCurrentTerms
      ? { title: "Review Client Agreement", description: "The current agreement needs acceptance before the workspace is current.", to: "/client/agreements", primary: true }
      : null,
    paymentReports.length
      ? { title: "Import next Customer Payment Report", description: "Add the latest Customer revenue CSV after Customers pay you directly.", to: "/client/payments", primary: !pendingPaymentReports && !unpaidInvoices }
      : { title: "Import first Customer Payment Report", description: "Calculate Trusted Bums commission invoices from Client-reported Customer revenue.", to: "/client/payments", primary: true },
    pendingPaymentReports
      ? { title: "Review pending Customer Payment Reports", description: `${pendingPaymentReports} report${pendingPaymentReports === 1 ? "" : "s"} still need commission invoice review.`, to: "/client/payments" }
      : null,
    unpaidInvoices
      ? { title: "Review outstanding commission invoices", description: `${unpaidInvoices} Trusted Bums commission invoice${unpaidInvoices === 1 ? "" : "s"} not marked paid.`, to: "/client/payments" }
      : null,
    { title: "Export finance data", description: "Download Customer Payment Reports, commission invoices, and account CSVs.", to: "/client/exports" },
  ].filter(Boolean) as DashboardAction[];
  const clientNextActions: DashboardAction[] = [
    !hasAcceptedCurrentTerms
      ? { title: "Review Client Agreement", description: "Open the Client Agreement center to review and accept the current version.", to: "/client/agreements", primary: true }
      : null,
    opportunities.length
      ? { title: "Add another opportunity", description: "Create the next customer account or deal your team wants help with.", to: "/client/opportunities/new", primary: !activeCount }
      : { title: "Create first opportunity", description: "Start with the customer company you want to sell into.", to: "/client/opportunities/new", primary: true },
    draftCount
      ? { title: "Publish draft opportunities", description: `${draftCount} draft opportunit${draftCount === 1 ? "y is" : "ies are"} waiting before Bums can match.`, to: "/client/opportunities" }
      : null,
    pendingTargetResponses.length
      ? { title: "Review Bum responses", description: `${pendingTargetResponses.length} Bum response${pendingTargetResponses.length === 1 ? "" : "s"} awaiting approval.`, to: "/client/opportunities?tab=responses", primary: true }
      : null,
    reverseOpportunities.length
      ? { title: "Review Bum-Originated Opportunities", description: `${reverseOpportunities.length} Bum-originated opportunit${reverseOpportunities.length === 1 ? "y needs" : "ies need"} review.`, to: "/client/opportunities?tab=bum-originated" }
      : null,
    activeCount
      ? { title: "Check active opportunities", description: `${activeCount} active opportunit${activeCount === 1 ? "y" : "ies"} need progress tracking.`, to: "/client/opportunities" }
      : null,
    canManagePayments
      ? { title: "Record Customer Payment Report", description: "Calculate a Trusted Bums commission invoice from Client-reported Customer revenue.", to: "/client/payments" }
      : null,
  ].filter(Boolean) as DashboardAction[];

  if (isLegalUser) {
    const legalActions: DashboardAction[] = [
      { title: "Review Client Agreement", description: "Open the legal workspace to review terms, download the PDF, and submit redline or amendment requests.", to: "/client/agreements", primary: !hasAcceptedCurrentTerms },
      { title: "Open Inbox", description: "Track legal questions, amendments, and Trusted Bums follow-up in one place.", to: "/client/live-conversations" },
      { title: "Review company profile", description: "Check the company details tied to agreement records and legal notices.", to: "/client/profile" },
    ];

    return (
      <div>
        <PageHeader
          title={`Welcome back, ${user?.name ?? "Legal"}`}
          description={`Review agreements, redlines, and amendment requests for ${user?.companyName ?? "your client workspace"}.`}
        >
          <Button asChild>
            <Link to="/client/agreements">
              <FileCheck className="mr-2 h-4 w-4" />
              Open Client Agreement
            </Link>
          </Button>
        </PageHeader>
        {deniedFrom ? (
          <Card className="mb-6 border-warning/40 bg-warning/5">
            <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{deniedAccessRecovery.title}</p>
                <p className="text-sm text-muted-foreground">{deniedAccessRecovery.description}</p>
              </div>
              <Button asChild variant="outline"><Link to={deniedAccessRecovery.to}>{deniedAccessRecovery.cta}</Link></Button>
            </CardContent>
          </Card>
        ) : null}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card>
            <CardContent className="pt-6">
              <p className="font-display text-2xl font-bold">Legal workspace</p>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Client Legal can review current terms, submit redline/amendment requests, and continue discussion through Inbox before the company signs or updates terms over time.
              </p>
            </CardContent>
          </Card>
          <NextActionsCard actions={legalActions} />
        </div>
      </div>
    );
  }

  if (isItUser) {
    const itActions: DashboardAction[] = [
      { title: "Configure Deal Registration Beta Setup", description: "Set API provider, auth method, required fields, approval tracking, and fallback workflow.", to: "/client/profile", primary: true },
      { title: "Open Inbox", description: "Coordinate portal API, security, and future SSO setup questions with Trusted Bums.", to: "/client/live-conversations" },
      { title: "Review Client Agreement", description: "Check integration-related legal context and agreement records.", to: "/client/agreements" },
    ];

    return (
      <div>
        <PageHeader
          title={`Welcome back, ${user?.name ?? "IT"}`}
          description={`Manage integration setup and technical coordination for ${user?.companyName ?? "your client workspace"}.`}
        >
          <Button asChild>
            <Link to="/client/profile">
              <FileCheck className="mr-2 h-4 w-4" />
              Open Company Profile
            </Link>
          </Button>
        </PageHeader>
        {deniedFrom ? (
          <Card className="mb-6 border-warning/40 bg-warning/5">
            <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{deniedAccessRecovery.title}</p>
                <p className="text-sm text-muted-foreground">{deniedAccessRecovery.description}</p>
              </div>
              <Button asChild variant="outline"><Link to={deniedAccessRecovery.to}>{deniedAccessRecovery.cta}</Link></Button>
            </CardContent>
          </Card>
        ) : null}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card>
            <CardContent className="pt-6">
              <p className="font-display text-2xl font-bold">Integration workspace</p>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Client IT can manage beta deal registration API setup now. SSO is not enabled yet, but this role gives us a clean owner for that workflow when we add it.
              </p>
            </CardContent>
          </Card>
          <NextActionsCard actions={itActions} />
        </div>
      </div>
    );
  }

  if (isFinanceUser) {
    return (
      <div>
        <PageHeader
          title={`Welcome back, ${user?.name ?? "Finance"}`}
          description={`Review Customer Payment Reports and generated commission invoices for ${user?.companyName ?? "your client workspace"}.`}
        >
          <Button asChild>
            <Link to="/client/payments">
              <CreditCard className="mr-2 h-4 w-4" />
              Open Payment Reports
            </Link>
          </Button>
        </PageHeader>

        {deniedFrom ? (
          <Card className="mb-6 border-warning/50 bg-warning/10">
            <CardContent className="flex flex-col gap-3 pt-6 text-sm md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-foreground">{deniedAccessRecovery.title}</p>
                <p className="mt-1 text-muted-foreground">{deniedAccessRecovery.description}</p>
              </div>
              <Button asChild variant="outline">
                <Link to={deniedAccessRecovery.to}>{deniedAccessRecovery.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard title="Customer Payment Reports" value={paymentReports.length} icon={CreditCard} to="/client/payments" />
          <StatCard title="Commission Invoices" value={invoices.length} icon={FileCheck} to="/client/payments" />
          <StatCard title="Commissionable Revenue" value={`$${totalCommissionableRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} icon={Target} to="/client/payments" />
          <StatCard title="Commission Invoice Value" value={`$${generatedInvoiceAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} icon={Download} to="/client/payments" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Recent commission invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length ? (
                <div className="space-y-4">
                  {invoices.slice(0, 6).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between gap-4 border-b py-3 last:border-0">
                      <div>
                        <p className="font-medium">{invoice.invoice_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.customer_payment_reports?.customer_name ?? "Customer"} · {invoice.opportunity_registrations?.target_account_name ?? "Opportunity"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${Number(invoice.invoice_amount ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                        <StatusBadge label={invoice.status} variant={invoice.status === "PAID" ? "success" : "info"} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-dashed p-6 text-center">
                  <p className="font-medium">No commission invoices generated yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Import your first Customer Payment Report to calculate commission invoices for AP.
                  </p>
                  <Button asChild className="mt-4">
                    <Link to="/client/payments">Go to Payment Reports</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <NextActionsCard actions={financeNextActions} />

            <Card>
              <CardHeader>
                <CardTitle className="font-display">Finance Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button asChild>
                  <Link to="/client/payments">Import monthly Customer Payment Reports</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/client/exports">Open exports</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/client/agreements">View agreement records</Link>
                </Button>
                <Button asChild variant="outline">
                  <a href="mailto:bums@trustedbums.com?subject=Trusted%20Bums%20Finance%20Question">Email Trusted Bums Finance</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name ?? "Client"}`}
        description={`Manage opportunities, Bum matching, and account activity for ${user?.companyName ?? "your client workspace"}.`}
      >
        <Button asChild>
          <Link to="/client/opportunities/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Opportunity
          </Link>
        </Button>
      </PageHeader>

      {deniedFrom ? (
        <Card className="mb-6 border-warning/50 bg-warning/10">
          <CardContent className="flex flex-col gap-3 pt-6 text-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium text-foreground">{deniedAccessRecovery.title}</p>
              <p className="mt-1 text-muted-foreground">{deniedAccessRecovery.description}</p>
            </div>
            <Button asChild variant="outline">
              <Link to={deniedAccessRecovery.to}>{deniedAccessRecovery.cta}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard title="Active" value={activeCount} icon={Target} subtitle="In progress" to="/client/opportunities" />
            <StatCard title="Published" value={acceptedCount} icon={FileCheck} subtitle="Visible to Bums" to="/client/opportunities" />
            <StatCard title="Drafts" value={draftCount} icon={Clock} subtitle="Private" to="/client/opportunities" />
            <StatCard title="Responses" value={pendingTargetResponses.length} icon={Handshake} subtitle="Awaiting review" to="/client/opportunities?tab=responses" />
            <StatCard title="Bum-Originated" value={reverseOpportunities.length} icon={Clock} subtitle="From Bums" to="/client/opportunities?tab=bum-originated" />
          </div>

          {pendingTargetResponses.length ? (
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Bum responses awaiting approval</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingTargetResponses.slice(0, 4).map((response) => (
                  <div key={response.id} className="flex flex-col gap-3 border-b py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{response.customer_targets?.target_companies?.name ?? response.customer_targets?.target_account_name ?? "Target account"}</p>
                      <p className="text-sm text-muted-foreground">
                        {response.profiles?.full_name ?? response.profiles?.email ?? "A Bum"} knows {response.contact_name} · {response.relationship_strength}
                      </p>
                      <p className="text-xs text-muted-foreground">Submitted {formatDateTimeForTimeZone(response.created_at, timeZone)}</p>
                    </div>
                    <Button asChild size="sm">
                      <Link to={`/client/opportunities?tab=responses&targetResponseId=${response.id}`}>Review</Link>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="font-display">Opportunity Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              {opportunities.length ? (
                <div className="space-y-4">
                  {opportunities.slice(0, 6).map((opportunity) => (
                    <div key={opportunity.id} className="flex items-center justify-between gap-4 border-b py-3 last:border-0">
                      <div>
                        <p className="font-medium">{opportunity.target_account_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {opportunity.expected_product_service || opportunity.business_unit || "Opportunity"} · {opportunity.status === "Accepted" ? "published to Bums" : opportunity.status.toLowerCase()}
                        </p>
                      </div>
                      <StatusBadge label={opportunity.status === "Accepted" ? "Published" : opportunity.status} variant={opportunity.status === "Accepted" ? "success" : "info"} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-dashed p-6 text-center">
                  <p className="font-medium">No opportunities yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add the customer companies you want to sell into, then publish ready opportunities to Bums.
                  </p>
                  <Button asChild className="mt-4">
                    <Link to="/client/opportunities/new">Create Opportunity</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-20">
          <NextActionsCard actions={clientNextActions} />

          <Card>
            <CardHeader>
              <CardTitle className="font-display">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button asChild variant="outline">
                <Link to="/client/opportunities?tab=bum-originated">Review Bum-Originated</Link>
              </Button>
              <Button asChild>
                <Link to="/client/opportunities/new">Create opportunity</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/client/opportunities">Open opportunities</Link>
              </Button>
              {canManagePayments ? (
                <Button asChild variant="outline">
                  <Link to="/client/payments">Record Customer Payment Report</Link>
                </Button>
              ) : null}
              <Button asChild variant="outline">
                <Link to="/client/agreements">View agreement records</Link>
              </Button>
              <Button asChild variant="outline">
                <a href="mailto:bums@trustedbums.com?subject=Trusted%20Bums%20Client%20Portal">Contact Trusted Bums</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
