import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import {
  buildTieredCommissionSummary,
  calculateTrustedBumsCommission,
  createClaimInvoice,
  createCustomerPaymentReport,
  getCommissionPlanInvoiceBlockReason,
  listClaimInvoices,
  listCustomerPaymentReports,
  listOpportunityClaims,
  updateClaimInvoiceStatus,
  type ClaimInvoiceRecord,
  type OpportunityClaimRecord,
} from "@/lib/portalApi";
import { formatDateForTimeZone } from "@/lib/timezone";
import { FilePlus2, Search } from "lucide-react";

function money(value: number | null | undefined) {
  return `$${Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function getClaimCommissionPlan(claim: OpportunityClaimRecord) {
  return claim.opportunity_registrations?.client_pay_programs ?? null;
}

function isInvoiceReadyClaim(claim: OpportunityClaimRecord) {
  return !getCommissionPlanInvoiceBlockReason(getClaimCommissionPlan(claim));
}

function numberFromInput(value: string, fallback = 0) {
  const parsed = Number(value || fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

type InvoiceTypeFilter = "ALL" | "GENERATED" | "SENT" | "PAID";
type PaymentReportTypeFilter = "ALL" | "CLIENT" | "ADMIN" | "INVOICED";

const invoiceTypeFilters: { value: InvoiceTypeFilter; label: string }[] = [
  { value: "ALL", label: "All invoice types" },
  { value: "GENERATED", label: "Generated" },
  { value: "SENT", label: "Sent" },
  { value: "PAID", label: "Paid" },
];

const paymentReportTypeFilters: { value: PaymentReportTypeFilter; label: string }[] = [
  { value: "ALL", label: "All payment report types" },
  { value: "CLIENT", label: "Client reported" },
  { value: "ADMIN", label: "Admin reported" },
  { value: "INVOICED", label: "Invoice generated" },
];

export default function AdminPayments() {
  const { user } = useAuth();
  const timeZone = useUserTimeZone();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [invoiceQuery, setInvoiceQuery] = useState("");
  const [paymentQuery, setPaymentQuery] = useState("");
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState<InvoiceTypeFilter>("ALL");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<PaymentReportTypeFilter>("ALL");
  const [claimId, setClaimId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [grossAmount, setGrossAmount] = useState("");
  const [commissionableAmount, setCommissionableAmount] = useState("");
  const [excludedAmount, setExcludedAmount] = useState("");
  const [receivedAt, setReceivedAt] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const claimsQuery = useQuery({ queryKey: ["admin-opportunity-claims-for-payments"], queryFn: () => listOpportunityClaims(undefined, { includeDisabled: true }) });
  const reportsQuery = useQuery({ queryKey: ["admin-customer-payment-reports"], queryFn: listCustomerPaymentReports });
  const invoicesQuery = useQuery({ queryKey: ["admin-claim-invoices"], queryFn: listClaimInvoices });
  const claims = useMemo(
    () => (claimsQuery.data ?? []).filter((claim) => ["APPROVED", "SCHEDULED", "MEETING_HELD", "CLOSED"].includes(claim.status)),
    [claimsQuery.data],
  );
  const invoiceReadyClaims = useMemo(() => claims.filter(isInvoiceReadyClaim), [claims]);
  const blockedClaimCount = claims.length - invoiceReadyClaims.length;
  const reports = useMemo(() => reportsQuery.data ?? [], [reportsQuery.data]);
  const invoices = useMemo(() => invoicesQuery.data ?? [], [invoicesQuery.data]);
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesType = invoiceTypeFilter === "ALL" || invoice.status === invoiceTypeFilter;
      const matchesQuery = [
        invoice.invoice_number,
        invoice.companies?.name,
        invoice.customer_payment_reports?.customer_name,
        invoice.opportunity_registrations?.target_account_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(invoiceQuery.toLowerCase());
      return matchesType && matchesQuery;
    });
  }, [invoiceQuery, invoiceTypeFilter, invoices]);
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesType =
        paymentTypeFilter === "ALL" ||
        (paymentTypeFilter === "CLIENT" && report.source === "CLIENT") ||
        (paymentTypeFilter === "ADMIN" && report.source === "ADMIN") ||
        (paymentTypeFilter === "INVOICED" && report.status === "INVOICE_GENERATED");
      const matchesQuery = [
        report.companies?.name,
        report.customer_name,
        report.opportunity_registrations?.target_account_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(paymentQuery.toLowerCase());
      return matchesType && matchesQuery;
    });
  }, [paymentQuery, paymentTypeFilter, reports]);

  const selectedClaim = invoiceReadyClaims.find((claim) => claim.id === claimId);
  const selectedProgram = selectedClaim ? getClaimCommissionPlan(selectedClaim) : null;
  const selectedCommissionableAmount = numberFromInput(commissionableAmount || grossAmount, 0);
  const selectedCommissionPreview = selectedProgram
    ? calculateTrustedBumsCommission(
        selectedProgram,
        selectedClaim?.opportunity_registrations?.commission_schedule_start_at,
        receivedAt,
        selectedCommissionableAmount,
      )
    : null;

  const generateInvoiceMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClaim) {
        throw new Error("Choose a claim with an approved active commission plan before generating an invoice.");
      }

      const report = await createCustomerPaymentReport(user!, {
        claimId: selectedClaim.id,
        customerName,
        grossAmount: numberFromInput(grossAmount, 0),
        commissionableAmount: numberFromInput(commissionableAmount || grossAmount, 0),
        excludedAmount: excludedAmount.trim() ? numberFromInput(excludedAmount, 0) : undefined,
        customerPaymentReceivedAt: receivedAt,
        notes,
      });
      return createClaimInvoice(user!, report.id);
    },
    onSuccess: async (invoice) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-customer-payment-reports"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-claim-invoices"] });
      toast({ title: "Invoice generated", description: invoice.invoice_number + " was generated for " + money(invoice.invoice_amount) + "." });
      setClaimId("");
      setCustomerName("");
      setGrossAmount("");
      setCommissionableAmount("");
      setExcludedAmount("");
      setNotes("");
    },
    onError: (error) => {
      toast({
        title: "Unable to generate invoice",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: ({ invoice, status }: { invoice: ClaimInvoiceRecord; status: "SENT" | "PAID" }) =>
      updateClaimInvoiceStatus(user!, invoice, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-claim-invoices"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-bum-payouts"] });
      toast({ title: "Invoice updated", description: "The invoice status was saved." });
    },
    onError: (error) => {
      toast({
        title: "Unable to update invoice",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Track Client-reported Customer Payment Reports and Trusted Bums commission invoices" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <FilePlus2 className="h-5 w-5 text-primary" /> Generate invoice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(260px,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-2 lg:col-span-2">
              <Label>Approved claim</Label>
              <Select value={claimId} onValueChange={setClaimId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select the claim tied to this customer payment" />
                </SelectTrigger>
                <SelectContent>
                  {invoiceReadyClaims.map((claim) => (
                    <SelectItem key={claim.id} value={claim.id}>
                      {claim.opportunity_registrations?.target_account_name ?? claim.contact_company} - {claim.contact_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!claims.length ? (
                <p className="text-xs text-muted-foreground">No approved claims are ready for invoice generation yet.</p>
              ) : !invoiceReadyClaims.length ? (
                <p className="text-xs text-warning">Approved claims exist, but none have an approved active commission plan yet.</p>
              ) : blockedClaimCount ? (
                <p className="text-xs text-muted-foreground">{blockedClaimCount} approved claim{blockedClaimCount === 1 ? "" : "s"} hidden until commission terms are approved.</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Customer name</Label>
              <Input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder={selectedClaim?.contact_company ?? "Customer company"}
              />
            </div>
            <div className="space-y-2">
              <Label>Customer paid on</Label>
              <Input type="date" value={receivedAt} onChange={(event) => setReceivedAt(event.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Gross amount received</Label>
              <Input type="number" value={grossAmount} onChange={(event) => setGrossAmount(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Commissionable amount</Label>
              <Input
                type="number"
                value={commissionableAmount}
                onChange={(event) => setCommissionableAmount(event.target.value)}
                placeholder={grossAmount || "0"}
              />
            </div>
            <div className="space-y-2">
              <Label>Excluded amount</Label>
              <Input type="number" value={excludedAmount} onChange={(event) => setExcludedAmount(event.target.value)} />
            </div>
          </div>
          {selectedProgram && selectedCommissionPreview ? (
            <div className="rounded-xl border bg-muted/30 p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">Trusted Bums commission preview</p>
                  <p className="mt-1 text-muted-foreground">{selectedProgram.name} · {buildTieredCommissionSummary(selectedProgram)}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-bold">{money(selectedCommissionPreview.invoiceAmount)}</p>
                  <p className="text-xs text-muted-foreground">{selectedCommissionPreview.commissionRate}% of {money(selectedCommissionableAmount)}</p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>Notes / exclusions</Label>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
          </div>
          <div className="flex justify-end">
            <Button disabled={!selectedClaim || !grossAmount || generateInvoiceMutation.isPending} onClick={() => generateInvoiceMutation.mutate()}>
              {generateInvoiceMutation.isPending ? "Generating..." : "Generate invoice"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="font-display">Trusted Bums Invoices</CardTitle></CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
            <div className="relative min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices, clients, customers, or opportunities…"
                value={invoiceQuery}
                onChange={(event) => setInvoiceQuery(event.target.value)}
                className="pl-9"
              />
            </div>
            <div>
              <Label className="sr-only">Type</Label>
              <Select value={invoiceTypeFilter} onValueChange={(value: InvoiceTypeFilter) => setInvoiceTypeFilter(value)}>
                <SelectTrigger aria-label="Type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {invoiceTypeFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Invoice</th>
                  <th className="pb-3 font-medium text-muted-foreground">Client</th>
                  <th className="pb-3 font-medium text-muted-foreground">Customer</th>
                  <th className="pb-3 font-medium text-muted-foreground">Amount</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 font-medium">
                      {invoice.invoice_number}
                      <p className="text-xs text-muted-foreground">{invoice.opportunity_registrations?.target_account_name}</p>
                    </td>
                    <td className="py-3">{invoice.companies?.name ?? "Client"}</td>
                    <td className="py-3">{invoice.customer_payment_reports?.customer_name ?? invoice.opportunity_claims?.contact_company}</td>
                    <td className="py-3 font-display font-bold text-primary">{money(invoice.invoice_amount)}</td>
                    <td className="py-3">
                      <StatusBadge label={invoice.status} variant={invoice.status === "PAID" ? "success" : invoice.status === "VOID" ? "destructive" : "info"} />
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        {invoice.status === "GENERATED" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateInvoiceMutation.mutate({ invoice, status: "SENT" })}
                          >
                            Mark sent
                          </Button>
                        ) : null}
                        {invoice.status !== "PAID" && invoice.status !== "VOID" ? (
                          <Button
                            size="sm"
                            onClick={() => updateInvoiceMutation.mutate({ invoice, status: "PAID" })}
                          >
                            Mark paid
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!invoicesQuery.isLoading && !filteredInvoices.length ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {invoices.length ? "No invoices match your current filters." : "No invoices have been generated yet."}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="font-display">Client-Reported Customer Payment Reports</CardTitle></CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
            <div className="relative min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reported payments, clients, or customers…"
                value={paymentQuery}
                onChange={(event) => setPaymentQuery(event.target.value)}
                className="pl-9"
              />
            </div>
            <div>
              <Label className="sr-only">Type</Label>
              <Select value={paymentTypeFilter} onValueChange={(value: PaymentReportTypeFilter) => setPaymentTypeFilter(value)}>
                <SelectTrigger aria-label="Type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentReportTypeFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Client</th>
                  <th className="pb-3 font-medium text-muted-foreground">Customer</th>
                  <th className="pb-3 font-medium text-muted-foreground">Gross</th>
                  <th className="pb-3 font-medium text-muted-foreground">Commissionable</th>
                  <th className="pb-3 font-medium text-muted-foreground">Source</th>
                  <th className="pb-3 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 font-medium">{report.companies?.name ?? "Client"}</td>
                    <td className="py-3">{report.customer_name}</td>
                    <td className="py-3 font-display font-bold">{money(report.gross_amount)}</td>
                    <td className="py-3 font-display font-bold text-primary">{money(report.commissionable_amount)}</td>
                    <td className="py-3"><StatusBadge label={report.source} variant={report.source === "ADMIN" ? "info" : "secondary"} /></td>
                    <td className="py-3 text-muted-foreground">{formatDateForTimeZone(report.customer_payment_received_at, timeZone)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!reportsQuery.isLoading && !filteredReports.length ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {reports.length ? "No customer payments match your current filters." : "No customer payments have been reported yet."}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
