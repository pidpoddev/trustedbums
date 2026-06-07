import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import {
  createClaimInvoice,
  createCustomerPaymentReport,
  listClaimInvoices,
  listCustomerPaymentReports,
  listOpportunityClaims,
  type OpportunityClaimRecord,
} from "@/lib/portalApi";
import { parsePaymentImportFile, type PaymentImportRow } from "@/lib/paymentImport";
import { formatDateForTimeZone } from "@/lib/timezone";

type ClientInvoiceTypeFilter = "ALL" | "OUTSTANDING" | "PAID" | "HIGH_VALUE";
type ClientReportTypeFilter = "ALL" | "INVOICED" | "PENDING_INVOICE" | "HAS_EXCLUSIONS";
type PaymentEntryMode = "import" | "manual";

type CommissionProgram = NonNullable<NonNullable<OpportunityClaimRecord["opportunity_registrations"]>["client_pay_programs"]>;

function buildTieredCommissionSummary(
  program: Pick<CommissionProgram, "year_1_rate" | "year_2_rate" | "year_3_rate" | "year_4_rate" | "year_5_rate" | "year_6_plus_rate">,
) {
  return `Y1 ${program.year_1_rate}% / Y2 ${program.year_2_rate}% / Y3 ${program.year_3_rate}% / Y4 ${program.year_4_rate}% / Y5 ${program.year_5_rate}% / Y6+ ${program.year_6_plus_rate}%`;
}

function getScheduleStartAt(claim: OpportunityClaimRecord | null | undefined) {
  return (claim?.opportunity_registrations as { commission_schedule_start_at?: string | null } | null | undefined)
    ?.commission_schedule_start_at;
}

function resolveTieredCommissionRate(program: CommissionProgram, scheduleStartAt: string | null | undefined, paidAt: string | null | undefined) {
  if (!scheduleStartAt || !paidAt) {
    return Number(program.year_1_rate);
  }

  const start = new Date(scheduleStartAt);
  const paid = new Date(paidAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(paid.getTime()) || paid < start) {
    return Number(program.year_1_rate);
  }

  const elapsedYears = Math.floor((paid.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  if (elapsedYears < 1) return Number(program.year_1_rate);
  if (elapsedYears < 2) return Number(program.year_2_rate);
  if (elapsedYears < 3) return Number(program.year_3_rate);
  if (elapsedYears < 4) return Number(program.year_4_rate);
  if (elapsedYears < 5) return Number(program.year_5_rate);
  return Number(program.year_6_plus_rate);
}

function calculateTrustedBumsCommission(
  program: CommissionProgram,
  scheduleStartAt: string | null | undefined,
  customerPaymentReceivedAt: string | null | undefined,
  commissionableAmount: number,
) {
  const commissionRate = resolveTieredCommissionRate(program, scheduleStartAt, customerPaymentReceivedAt);
  return {
    commissionRate,
    invoiceAmount: Number(((Number(commissionableAmount || 0) * commissionRate) / 100).toFixed(2)),
  };
}

function getCommissionPlanInvoiceBlockReason(program: CommissionProgram | null | undefined) {
  if (!program) {
    return "This deal does not have a commission structure assigned.";
  }

  if (program.approval_status !== "APPROVED") {
    return "This deal's commission structure is not approved yet.";
  }

  if (program.status !== "ACTIVE") {
    return "This deal's commission structure is not active.";
  }

  return null;
}

const clientInvoiceTypeFilters: { value: ClientInvoiceTypeFilter; label: string }[] = [
  { value: "ALL", label: "All invoices" },
  { value: "OUTSTANDING", label: "Outstanding" },
  { value: "PAID", label: "Paid" },
  { value: "HIGH_VALUE", label: "High value" },
];

const clientReportTypeFilters: { value: ClientReportTypeFilter; label: string }[] = [
  { value: "ALL", label: "All Customer Payment Reports" },
  { value: "INVOICED", label: "Commission invoice generated" },
  { value: "PENDING_INVOICE", label: "Pending commission invoice" },
  { value: "HAS_EXCLUSIONS", label: "Has exclusions" },
];

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

export default function ClientPayments() {
  const { user } = useAuth();
  const timeZone = useUserTimeZone();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [importInputKey, setImportInputKey] = useState(0);
  const [importRows, setImportRows] = useState<PaymentImportRow[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [claimId, setClaimId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [grossAmount, setGrossAmount] = useState("");
  const [commissionableAmount, setCommissionableAmount] = useState("");
  const [excludedAmount, setExcludedAmount] = useState("");
  const [receivedAt, setReceivedAt] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [invoiceQuery, setInvoiceQuery] = useState("");
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState<ClientInvoiceTypeFilter>("ALL");
  const [reportQuery, setReportQuery] = useState("");
  const [reportTypeFilter, setReportTypeFilter] = useState<ClientReportTypeFilter>("ALL");
  const [paymentEntryMode, setPaymentEntryMode] = useState<PaymentEntryMode>("import");

  const claimsQuery = useQuery({ queryKey: ["client-opportunity-claims"], queryFn: () => listOpportunityClaims() });
  const reportsQuery = useQuery({
    queryKey: ["customer-payment-reports", user?.id],
    queryFn: () => listCustomerPaymentReports(user!),
    enabled: Boolean(user?.id),
  });
  const invoicesQuery = useQuery({
    queryKey: ["claim-invoices", user?.id],
    queryFn: () => listClaimInvoices(user!),
    enabled: Boolean(user?.id),
  });

  const claims = useMemo(
    () => (claimsQuery.data ?? []).filter((claim) => ["APPROVED", "SCHEDULED", "MEETING_HELD", "CLOSED"].includes(claim.status)),
    [claimsQuery.data],
  );
  const invoiceReadyClaims = useMemo(() => claims.filter(isInvoiceReadyClaim), [claims]);
  const blockedClaimCount = claims.length - invoiceReadyClaims.length;
  const selectedClaim = invoiceReadyClaims.find((claim) => claim.id === claimId);
  const selectedProgram = selectedClaim ? getClaimCommissionPlan(selectedClaim) : null;
  const selectedCommissionableAmount = numberFromInput(commissionableAmount || grossAmount, 0);
  const selectedCommissionPreview = selectedProgram
    ? calculateTrustedBumsCommission(
        selectedProgram,
        getScheduleStartAt(selectedClaim),
        receivedAt,
        selectedCommissionableAmount,
      )
    : null;
  const reports = reportsQuery.data ?? [];
  const invoices = invoicesQuery.data ?? [];
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesType =
        invoiceTypeFilter === "ALL" ||
        (invoiceTypeFilter === "OUTSTANDING" && invoice.status !== "PAID") ||
        (invoiceTypeFilter === "PAID" && invoice.status === "PAID") ||
        (invoiceTypeFilter === "HIGH_VALUE" && Number(invoice.invoice_amount ?? 0) >= 5000);

      const matchesQuery = [
        invoice.invoice_number,
        invoice.opportunity_registrations?.target_account_name,
        invoice.customer_payment_reports?.customer_name,
        invoice.status,
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
        reportTypeFilter === "ALL" ||
        (reportTypeFilter === "INVOICED" && report.status === "INVOICE_GENERATED") ||
        (reportTypeFilter === "PENDING_INVOICE" && report.status !== "INVOICE_GENERATED") ||
        (reportTypeFilter === "HAS_EXCLUSIONS" && Number(report.excluded_amount ?? 0) > 0);

      const matchesQuery = [
        report.customer_name,
        report.opportunity_registrations?.target_account_name,
        report.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(reportQuery.toLowerCase());

      return matchesType && matchesQuery;
    });
  }, [reportQuery, reportTypeFilter, reports]);
  const matchedImportRows = useMemo(
    () => importRows.filter((row) => row.matchStatus === "matched"),
    [importRows],
  );
  const unmatchedImportCount = useMemo(
    () => importRows.filter((row) => row.matchStatus !== "matched").length,
    [importRows],
  );

  const reportMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClaim) {
        throw new Error("Choose a claim with an approved active commission structure before generating an invoice.");
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
      await queryClient.invalidateQueries({ queryKey: ["customer-payment-reports"] });
      await queryClient.invalidateQueries({ queryKey: ["claim-invoices"] });
      toast({
        title: "Invoice generated",
        description: `${invoice.invoice_number} was generated for ${money(invoice.invoice_amount)}.`,
      });
      setClaimId("");
      setCustomerName("");
      setGrossAmount("");
      setCommissionableAmount("");
      setExcludedAmount("");
      setNotes("");
    },
    onError: (error) => {
      toast({
        title: "Unable to report payment",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      const failures: string[] = [];
      let importedCount = 0;

      for (const row of matchedImportRows) {
        try {
          const report = await createCustomerPaymentReport(user!, {
            claimId: row.claimId,
            customerName: row.customerName,
            grossAmount: row.grossAmount,
            commissionableAmount: row.commissionableAmount,
            excludedAmount: row.excludedAmount,
            customerPaymentReceivedAt: row.customerPaymentReceivedAt,
            notes: row.notes,
          });

          await createClaimInvoice(user!, report.id);
          importedCount += 1;
        } catch (error) {
          failures.push(
            `Row ${row.rowNumber}: ${error instanceof Error ? error.message : "Unable to import payment."}`,
          );
        }
      }

      return { importedCount, failures };
    },
    onSuccess: async ({ importedCount, failures }) => {
      if (importedCount) {
        await queryClient.invalidateQueries({ queryKey: ["customer-payment-reports"] });
        await queryClient.invalidateQueries({ queryKey: ["claim-invoices"] });
      }

      if (importedCount && !failures.length) {
        toast({
          title: "Payments imported",
          description: `${importedCount} payment${importedCount === 1 ? "" : "s"} imported and invoiced.`,
        });
        setImportRows([]);
        setImportFileName("");
        setImportInputKey((value) => value + 1);
        return;
      }

      if (importedCount && failures.length) {
        toast({
          title: "Import completed with issues",
          description: `${importedCount} payment${importedCount === 1 ? "" : "s"} imported. ${failures[0]}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Unable to import payments",
        description: failures[0] ?? "Please review the CSV and try again.",
        variant: "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to import payments",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  async function handleImportFileChange(file: File | null) {
    if (!file) {
      setImportRows([]);
      setImportFileName("");
      setImportInputKey((value) => value + 1);
      return;
    }

    try {
      const parsedRows = await parsePaymentImportFile(file, invoiceReadyClaims);
      setImportRows(parsedRows);
      setImportFileName(file.name);

      if (!parsedRows.length) {
        toast({
          title: "No payment rows found",
          description: "Include at least an account or claim_id column plus the payment amount.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setImportRows([]);
      setImportFileName("");
      toast({
        title: "Unable to read CSV",
        description: error instanceof Error ? error.message : "Please try another file.",
        variant: "destructive",
      });
    }
  }

  function getImportBadgeVariant(status: PaymentImportRow["matchStatus"]) {
    switch (status) {
      case "matched":
        return "default";
      case "ambiguous":
        return "secondary";
      case "unmatched":
      case "invalid":
        return "destructive";
      default:
        return "secondary";
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Payment Reports"
        description="Record Customer payments made directly to your company and calculate Trusted Bums commission invoices from approved deals."
      />

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardContent className="grid gap-2 pt-6 sm:grid-cols-2">
              <Button
                type="button"
                variant={paymentEntryMode === "import" ? "default" : "outline"}
                onClick={() => setPaymentEntryMode("import")}
              >
                Import report CSV
              </Button>
              <Button
                type="button"
                variant={paymentEntryMode === "manual" ? "default" : "outline"}
                onClick={() => setPaymentEntryMode("manual")}
              >
                Record one report
              </Button>
            </CardContent>
          </Card>

          {paymentEntryMode === "import" ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Import Customer Payment Report CSV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="payment-import-file">Customer Payment Report CSV</Label>
                <Input
                  key={importInputKey}
                  id="payment-import-file"
                  type="file"
                  accept=".csv,text/csv"
                  disabled={claimsQuery.isLoading || !invoiceReadyClaims.length}
                  onChange={(event) => handleImportFileChange(event.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended columns: <code>claim_id</code> or <code>account_name</code>, plus <code>payment_date</code>,
                  <code>gross_amount</code>, optional <code>commissionable_amount</code>, and optional <code>invoice_number</code>. Rows only match approved deals with active commission structures.
                </p>
                {claimsQuery.isLoading ? (
                  <p className="text-xs text-muted-foreground">Loading approved deals and commission structures so we can match your CSV rows.</p>
                ) : null}
              </div>

              {!claimsQuery.isLoading && blockedClaimCount ? (
                <p className="text-xs text-warning">
                  {blockedClaimCount} approved deal{blockedClaimCount === 1 ? "" : "s"} cannot be invoiced until an approved active commission structure is assigned.
                </p>
              ) : null}

              {importFileName ? (
                <div className="rounded-xl border bg-muted/30 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{importFileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {matchedImportRows.length} ready to import
                        {unmatchedImportCount ? `, ${unmatchedImportCount} need attention` : ""}.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleImportFileChange(null)}>
                      Clear
                    </Button>
                  </div>
                </div>
              ) : null}

              {importRows.length ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">{matchedImportRows.length} matched</Badge>
                    {importRows.some((row) => row.matchStatus === "ambiguous") ? (
                      <Badge variant="secondary">
                        {importRows.filter((row) => row.matchStatus === "ambiguous").length} ambiguous
                      </Badge>
                    ) : null}
                    {importRows.some((row) => row.matchStatus === "unmatched") ? (
                      <Badge variant="destructive">
                        {importRows.filter((row) => row.matchStatus === "unmatched").length} unmatched
                      </Badge>
                    ) : null}
                    {importRows.some((row) => row.matchStatus === "invalid") ? (
                      <Badge variant="destructive">
                        {importRows.filter((row) => row.matchStatus === "invalid").length} invalid
                      </Badge>
                    ) : null}
                  </div>

                  <div className="max-h-[440px] space-y-3 overflow-y-auto pr-1">
                    {importRows.map((row) => (
                      <div key={`${row.rowNumber}-${row.matchKey}`} className="rounded-xl border p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">
                              Row {row.rowNumber}: {row.customerName || "Unknown customer"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {row.matchedClaim?.opportunity_registrations?.target_account_name ??
                                (row.matchKey || "No account match")}
                              {row.reference ? ` - ref ${row.reference}` : ""}
                            </p>
                          </div>
                          <Badge variant={getImportBadgeVariant(row.matchStatus)}>
                            {row.matchStatus}
                          </Badge>
                        </div>

                        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-4">
                          <div><span className="text-muted-foreground">Gross revenue</span><br />{money(row.grossAmount)}</div>
                          <div><span className="text-muted-foreground">Commissionable revenue</span><br />{money(row.commissionableAmount)}</div>
                          <div><span className="text-muted-foreground">Paid on</span><br />{row.customerPaymentReceivedAt || "Missing"}</div>
                          {row.matchedClaim?.opportunity_registrations?.client_pay_programs ? (
                            <div>
                              <span className="text-muted-foreground">Trusted Bums commission</span><br />
                              {money(calculateTrustedBumsCommission(
                                row.matchedClaim.opportunity_registrations.client_pay_programs,
                                getScheduleStartAt(row.matchedClaim),
                                row.customerPaymentReceivedAt,
                                row.commissionableAmount,
                              ).invoiceAmount)}
                            </div>
                          ) : null}
                        </div>

                        <p className="mt-3 text-xs text-muted-foreground">{row.matchMessage}</p>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full"
                    disabled={!matchedImportRows.length || importMutation.isPending}
                    onClick={() => importMutation.mutate()}
                  >
                    {importMutation.isPending ? "Importing reports..." : `Import ${matchedImportRows.length} report${matchedImportRows.length === 1 ? "" : "s"} and generate commission invoices`}
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
          ) : null}

          {paymentEntryMode === "manual" ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Record one Customer Payment Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Approved deal / intro claim</Label>
                <Select value={claimId} onValueChange={setClaimId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the claim tied to this payment" />
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
                  <p className="text-xs text-muted-foreground">No approved deals are ready for payment reporting yet.</p>
                ) : !invoiceReadyClaims.length ? (
                  <p className="text-xs text-warning">Approved deal / intro claims exist, but none have an approved active commission structure yet.</p>
                ) : blockedClaimCount ? (
                  <p className="text-xs text-muted-foreground">{blockedClaimCount} approved deal{blockedClaimCount === 1 ? "" : "s"} hidden until commission terms are approved.</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label>Customer name</Label>
                <Input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder={selectedClaim?.contact_company ?? "Customer company"}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Gross revenue received</Label>
                  <Input type="number" value={grossAmount} onChange={(event) => setGrossAmount(event.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Commissionable revenue</Label>
                  <Input
                    type="number"
                    value={commissionableAmount}
                    onChange={(event) => setCommissionableAmount(event.target.value)}
                    placeholder={grossAmount || "0"}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Non-commissionable amount</Label>
                  <Input type="number" value={excludedAmount} onChange={(event) => setExcludedAmount(event.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Customer payment date</Label>
                  <Input type="date" value={receivedAt} onChange={(event) => setReceivedAt(event.target.value)} />
                </div>
              </div>

              {selectedProgram && selectedCommissionPreview ? (
                <div className="rounded-xl border bg-muted/30 p-4 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">Commission invoice preview</p>
                      <p className="mt-1 text-muted-foreground">{selectedProgram.name} · {buildTieredCommissionSummary(selectedProgram)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xl font-bold">{money(selectedCommissionPreview.invoiceAmount)}</p>
                      <p className="text-xs text-muted-foreground">{selectedCommissionPreview.commissionRate}% of {money(selectedCommissionableAmount)}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-2">
                <Label>Notes / non-commissionable details</Label>
                <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
              </div>

              <Button
                className="w-full"
                disabled={!selectedClaim || !grossAmount || reportMutation.isPending}
                onClick={() => reportMutation.mutate()}
              >
                Record Customer Payment Report and generate commission invoice
              </Button>
            </CardContent>
          </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Commission invoices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(220px,0.8fr)] md:items-end">
                <div className="relative min-w-0">
                  <Input
                    placeholder="Search invoices, customers, or accounts..."
                    value={invoiceQuery}
                    onChange={(event) => setInvoiceQuery(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={invoiceTypeFilter} onValueChange={(value: ClientInvoiceTypeFilter) => setInvoiceTypeFilter(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {clientInvoiceTypeFilters.map((filter) => (
                        <SelectItem key={filter.value} value={filter.value}>
                          {filter.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{invoice.invoice_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.opportunity_registrations?.target_account_name ?? "Opportunity"} - {invoice.customer_payment_reports?.customer_name ?? "Customer"}
                      </p>
                    </div>
                    <StatusBadge label={invoice.status} variant={invoice.status === "PAID" ? "success" : "info"} />
                  </div>
                  <p className="mt-3 font-display text-xl font-bold">{money(invoice.invoice_amount)}</p>
                  <p className="text-xs text-muted-foreground">{invoice.commission_rate}% of commissionable revenue</p>
                </div>
              ))}
              {!invoices.length ? <p className="text-sm text-muted-foreground">No commission invoices generated yet.</p> : null}
              {invoices.length > 0 && !filteredInvoices.length ? (
                <p className="text-sm text-muted-foreground">No commission invoices match your current filters.</p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display">Payment report history</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(220px,0.8fr)] md:items-end">
                <div className="relative min-w-0">
                  <Input
                    placeholder="Search customers, accounts, or payment status..."
                    value={reportQuery}
                    onChange={(event) => setReportQuery(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={reportTypeFilter} onValueChange={(value: ClientReportTypeFilter) => setReportTypeFilter(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {clientReportTypeFilters.map((filter) => (
                        <SelectItem key={filter.value} value={filter.value}>
                          {filter.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filteredReports.map((report) => (
                <div key={report.id} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{report.customer_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {report.opportunity_registrations?.target_account_name ?? "Opportunity"} - paid {formatDateForTimeZone(report.customer_payment_received_at, timeZone)}
                      </p>
                    </div>
                    <StatusBadge label={report.status.replaceAll("_", " ")} variant={report.status === "INVOICE_GENERATED" ? "success" : "info"} />
                  </div>
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                    <div><span className="text-muted-foreground">Gross revenue</span><br />{money(report.gross_amount)}</div>
                    <div><span className="text-muted-foreground">Commissionable revenue</span><br />{money(report.commissionable_amount)}</div>
                    <div><span className="text-muted-foreground">Non-commissionable</span><br />{money(report.excluded_amount)}</div>
                  </div>
                </div>
              ))}
              {!reports.length ? <p className="text-sm text-muted-foreground">No Customer Payment Reports recorded yet.</p> : null}
              {reports.length > 0 && !filteredReports.length ? (
                <p className="text-sm text-muted-foreground">No Customer Payment Reports match your current filters.</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
