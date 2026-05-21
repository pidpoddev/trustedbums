import { Link } from "react-router-dom";
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
  listCustomerTargets,
  listOpportunityRegistrations,
} from "@/lib/portalApi";
import { formatDateTimeForTimeZone } from "@/lib/timezone";
import { Target, FileCheck, Clock, PlusCircle, ArrowRight, CreditCard, Download } from "lucide-react";

type DashboardAction = {
  title: string;
  description: string;
  to: string;
  primary?: boolean;
};

function NextActionsCard({ actions }: { actions: DashboardAction[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Next Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {actions.map((action) => (
          <Button key={action.title} asChild variant={action.primary ? "default" : "outline"} className="h-auto justify-between gap-3 py-3 text-left">
            <Link to={action.to}>
              <span>
                <span className="block font-medium">{action.title}</span>
                <span className="block text-xs font-normal opacity-80">{action.description}</span>
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
  const timeZone = useUserTimeZone();
  const clientAccessRole = user?.role === "CLIENT" ? user.clientAccessRole ?? "CLIENT_ADMIN" : undefined;
  const isFinanceUser = clientAccessRole === "CLIENT_FINANCE";
  const canManagePayments = clientAccessRole === "CLIENT_ADMIN" || clientAccessRole === "CLIENT_FINANCE";
  const { terms, acceptance, hasAcceptedCurrentTerms } = useCurrentTermsState();
  const opportunitiesQuery = useQuery({
    queryKey: ["client-opportunity-registrations", user?.id],
    queryFn: () => listOpportunityRegistrations(),
    enabled: Boolean(user?.id) && !isFinanceUser,
  });
  const targetsQuery = useQuery({
    queryKey: ["client-targets", user?.clientId],
    queryFn: () => listCustomerTargets(user),
    enabled: Boolean(user?.clientId) && !isFinanceUser,
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
    enabled: Boolean(user?.clientId) && !isFinanceUser,
  });
  const opportunities = opportunitiesQuery.data ?? [];
  const targets = targetsQuery.data ?? [];
  const reverseOpportunities = reverseOpportunitiesQuery.data ?? [];
  const paymentReports = reportsQuery.data ?? [];
  const invoices = invoicesQuery.data ?? [];
  const activeCount = opportunities.filter((opportunity) =>
    ["Submitted", "Accepted", "Needs Clarification"].includes(opportunity.status),
  ).length;
  const acceptedCount = opportunities.filter((opportunity) => opportunity.status === "Accepted").length;
  const targetProspectCount = targets.filter((target) =>
    ["PROSPECT", "QUALIFYING", "INTRO_REQUESTED", "INTRO_IN_PROGRESS"].includes(target.status),
  ).length;
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
      ? { title: "Review partner terms", description: "Terms need acceptance before the workspace is current.", to: "/client/terms", primary: true }
      : null,
    paymentReports.length
      ? { title: "Import next payment file", description: "Add the latest customer payment CSV.", to: "/client/payments", primary: !pendingPaymentReports && !unpaidInvoices }
      : { title: "Import first payment file", description: "Generate Trusted Bums invoices from paid customer deals.", to: "/client/payments", primary: true },
    pendingPaymentReports
      ? { title: "Review pending payment records", description: `${pendingPaymentReports} payment record${pendingPaymentReports === 1 ? "" : "s"} still need invoice review.`, to: "/client/payments" }
      : null,
    unpaidInvoices
      ? { title: "Review outstanding invoices", description: `${unpaidInvoices} Trusted Bums invoice${unpaidInvoices === 1 ? "" : "s"} not marked paid.`, to: "/client/payments" }
      : null,
    { title: "Export finance data", description: "Download payments, meetings, and account CSVs.", to: "/client/exports" },
  ].filter(Boolean) as DashboardAction[];
  const clientNextActions: DashboardAction[] = [
    !hasAcceptedCurrentTerms
      ? { title: "Review partner terms", description: "Accept the current terms before working new activity.", to: "/client/terms", primary: true }
      : null,
    targets.length
      ? { title: "Register an opportunity", description: "Submit a deal for review and commission tracking.", to: "/client/opportunities/new", primary: !activeCount }
      : { title: "Add first target account", description: "Start with the customer company you want to sell into.", to: "/client/targets", primary: true },
    reverseOpportunities.length
      ? { title: "Review inbound requests", description: `${reverseOpportunities.length} Bum-initiated request${reverseOpportunities.length === 1 ? "" : "s"} need review.`, to: "/client/requests" }
      : null,
    activeCount
      ? { title: "Check active opportunities", description: `${activeCount} active opportunit${activeCount === 1 ? "y" : "ies"} need progress tracking.`, to: "/client/opportunities" }
      : null,
    canManagePayments
      ? { title: "Record customer payment", description: "Generate a Trusted Bums invoice from a paid deal.", to: "/client/payments" }
      : null,
  ].filter(Boolean) as DashboardAction[];

  if (isFinanceUser) {
    return (
      <div>
        <PageHeader
          title={`Welcome back, ${user?.name ?? "Finance"}`}
          description={`Review imported payments and generated invoices for ${user?.companyName ?? "your client workspace"}.`}
        >
          <Button asChild>
            <Link to="/client/payments">
              <CreditCard className="mr-2 h-4 w-4" />
              Open Payments
            </Link>
          </Button>
        </PageHeader>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard title="Reported Payments" value={paymentReports.length} icon={CreditCard} to="/client/payments" />
          <StatCard title="Generated Invoices" value={invoices.length} icon={FileCheck} to="/client/payments" />
          <StatCard title="Commissionable Revenue" value={`$${totalCommissionableRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} icon={Target} to="/client/payments" />
          <StatCard title="Invoice Value" value={`$${generatedInvoiceAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} icon={Download} to="/client/payments" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Recent generated invoices</CardTitle>
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
                  <p className="font-medium">No invoices generated yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Import your first customer payment CSV to generate invoices for AP.
                  </p>
                  <Button asChild className="mt-4">
                    <Link to="/client/payments">Go to Payments</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <NextActionsCard actions={financeNextActions} />

            <Card>
              <CardHeader>
                <CardTitle className="font-display">Partner Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={hasAcceptedCurrentTerms ? "rounded-md bg-success/10 p-4 text-sm" : "rounded-md bg-warning/10 p-4 text-sm"}>
                  <p className={hasAcceptedCurrentTerms ? "font-medium text-success" : "font-medium text-warning"}>
                    {hasAcceptedCurrentTerms ? "Current terms accepted" : "New partner terms need review"}
                  </p>
                  <p className="text-muted-foreground mt-1">
                    {acceptance ? formatDateTimeForTimeZone(acceptance.accepted_at, timeZone) : "Acceptance pending"} · Version{" "}
                    {terms?.version ?? "v1"}
                  </p>
                </div>
                <Button asChild variant={hasAcceptedCurrentTerms ? "outline" : "default"} className="w-full">
                  <Link to="/client/terms">
                    {hasAcceptedCurrentTerms ? "Review terms" : "Review and accept terms"}{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display">Finance Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button asChild>
                  <Link to="/client/payments">Import monthly payments</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/client/exports">Open exports</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/client/agreements">View acceptance records</Link>
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
        description={`Manage terms and account registrations for ${user?.companyName ?? "your client workspace"}.`}
      >
        <Button asChild>
          <Link to="/client/targets">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Target Account
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Target Accounts" value={targets.length} icon={Target} to="/client/targets" />
        <StatCard title="Inbound Requests" value={reverseOpportunities.length} icon={Clock} to="/client/requests" />
        <StatCard title="Active Opportunities" value={activeCount} icon={Target} to="/client/opportunities" />
        <StatCard title="Accepted" value={acceptedCount} icon={FileCheck} to="/client/opportunities" />
        <StatCard title="Target Prospects" value={targetProspectCount} icon={Clock} to="/client/targets" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Target Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {targets.length ? (
              <div className="space-y-4">
                {targets.slice(0, 6).map((targetAccount) => (
                  <div key={targetAccount.id} className="flex items-center justify-between gap-4 border-b py-3 last:border-0">
                    <div>
                      <p className="font-medium">{targetAccount.target_companies?.name ?? targetAccount.target_account_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {targetAccount.expected_product_service || "Target account"} · {targetAccount.priority} priority
                      </p>
                    </div>
                    <StatusBadge label={targetAccount.status.replaceAll("_", " ")} variant="info" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-6 text-center">
                <p className="font-medium">No target accounts yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add the customer companies you want to sell into before turning them into formal opportunity registrations.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/client/targets">Add Target Account</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <NextActionsCard actions={clientNextActions} />

          <Card>
            <CardHeader>
              <CardTitle className="font-display">Partner Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={hasAcceptedCurrentTerms ? "rounded-md bg-success/10 p-4 text-sm" : "rounded-md bg-warning/10 p-4 text-sm"}>
                <p className={hasAcceptedCurrentTerms ? "font-medium text-success" : "font-medium text-warning"}>
                  {hasAcceptedCurrentTerms ? "Current terms accepted" : "New partner terms need review"}
                </p>
                <p className="text-muted-foreground mt-1">
                  {acceptance ? formatDateTimeForTimeZone(acceptance.accepted_at, timeZone) : "Acceptance pending"} · Version{" "}
                  {terms?.version ?? "v1"}
                </p>
              </div>
              <Button asChild variant={hasAcceptedCurrentTerms ? "outline" : "default"} className="w-full">
                <Link to="/client/terms">
                  {hasAcceptedCurrentTerms ? "Review terms" : "Review and accept terms"}{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button asChild variant="outline">
                <Link to="/client/requests">Review inbound requests</Link>
              </Button>
              <Button asChild>
                <Link to="/client/targets">Add target account</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/client/opportunities">Register formal opportunity</Link>
              </Button>
              {canManagePayments ? (
                <Button asChild variant="outline">
                  <Link to="/client/payments">Record customer payment</Link>
                </Button>
              ) : null}
              <Button asChild variant="outline">
                <Link to="/client/agreements">View acceptance records</Link>
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
