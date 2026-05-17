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
import {
  createClaimInvoice,
  createCustomerPaymentReport,
  listClaimInvoices,
  listCustomerPaymentReports,
  listOpportunityClaims,
} from "@/lib/portalApi";
import { parsePaymentImportFile, type PaymentImportRow } from "@/lib/paymentImport";

function money(value: number | null | undefined) {
  return `$${Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default function ClientPayments() {
  const { user } = useAuth();
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

  const claimsQuery = useQuery({ queryKey: ["client-opportunity-claims"], queryFn: () => listOpportunityClaims() });
  const reportsQuery = useQuery({ queryKey: ["customer-payment-reports"], queryFn: listCustomerPaymentReports });
  const invoicesQuery = useQuery({ queryKey: ["claim-invoices"], queryFn: listClaimInvoices });

  const claims = useMemo(
    () => (claimsQuery.data ?? []).filter((claim) => ["APPROVED", "SCHEDULED", "MEETING_HELD", "CLOSED"].includes(claim.status)),
    [claimsQuery.data],
  );
  const reports = reportsQuery.data ?? [];
  const invoices = invoicesQuery.data ?? [];
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
      const report = await createCustomerPaymentReport(user!, {
        claimId,
        customerName,
        grossAmount: Number(grossAmount || 0),
        commissionableAmount: Number(commissionableAmount || grossAmount || 0),
        excludedAmount: Number(excludedAmount || 0),
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

  const selectedClaim = claims.find((claim) => claim.id === claimId);

  async function handleImportFileChange(file: File | null) {
    if (!file) {
      setImportRows([]);
      setImportFileName("");
      setImportInputKey((value) => value + 1);
      return;
    }

    try {
      const parsedRows = await parsePaymentImportFile(file, claims);
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
        title="Customer Payments"
        description="Import monthly customer payments from finance or report them one by one to generate the Trusted Bums invoice(s) tied to approved claims."
      />

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Import monthly payment report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="payment-import-file">Finance CSV</Label>
                <Input
                  key={importInputKey}
                  id="payment-import-file"
                  type="file"
                  accept=".csv,text/csv"
                  disabled={claimsQuery.isLoading}
                  onChange={(event) => handleImportFileChange(event.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended columns: <code>claim_id</code> or <code>account_name</code>, plus <code>payment_date</code>,
                  <code>gross_amount</code>, optional <code>commissionable_amount</code>, and optional <code>invoice_number</code>.
                </p>
                {claimsQuery.isLoading ? (
                  <p className="text-xs text-muted-foreground">Loading approved claims so we can match your CSV rows.</p>
                ) : null}
              </div>

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
                                row.matchKey ||
                                "No account match"}
                              {row.reference ? ` - ref ${row.reference}` : ""}
                            </p>
                          </div>
                          <Badge variant={getImportBadgeVariant(row.matchStatus)}>
                            {row.matchStatus}
                          </Badge>
                        </div>

                        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                          <div><span className="text-muted-foreground">Gross</span><br />{money(row.grossAmount)}</div>
                          <div><span className="text-muted-foreground">Commissionable</span><br />{money(row.commissionableAmount)}</div>
                          <div><span className="text-muted-foreground">Paid on</span><br />{row.customerPaymentReceivedAt || "Missing"}</div>
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
                    {importMutation.isPending ? "Importing payments..." : `Import ${matchedImportRows.length} payment${matchedImportRows.length === 1 ? "" : "s"}`}
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display">Report customer payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Approved claim</Label>
                <Select value={claimId} onValueChange={setClaimId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the claim tied to this payment" />
                  </SelectTrigger>
                  <SelectContent>
                    {claims.map((claim) => (
                      <SelectItem key={claim.id} value={claim.id}>
                        {claim.opportunity_registrations?.target_account_name ?? claim.contact_company} - {claim.contact_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!claims.length ? (
                  <p className="text-xs text-muted-foreground">No approved claims are ready for payment reporting yet.</p>
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
                  <Label>Gross amount received</Label>
                  <Input type="number" value={grossAmount} onChange={(event) => setGrossAmount(event.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Commissionable amount</Label>
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
                  <Label>Excluded amount</Label>
                  <Input type="number" value={excludedAmount} onChange={(event) => setExcludedAmount(event.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Customer paid you on</Label>
                  <Input type="date" value={receivedAt} onChange={(event) => setReceivedAt(event.target.value)} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Notes / exclusions</Label>
                <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
              </div>

              <Button
                className="w-full"
                disabled={!claimId || !grossAmount || reportMutation.isPending}
                onClick={() => reportMutation.mutate()}
              >
                Report payment and generate invoice
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Generated invoices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoices.map((invoice) => (
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
                  <p className="text-xs text-muted-foreground">{invoice.commission_rate}% of reported commissionable revenue</p>
                </div>
              ))}
              {!invoices.length ? <p className="text-sm text-muted-foreground">No invoices generated yet.</p> : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display">Reported customer payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{report.customer_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {report.opportunity_registrations?.target_account_name ?? "Opportunity"} - paid {new Date(report.customer_payment_received_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge label={report.status.replaceAll("_", " ")} variant={report.status === "INVOICE_GENERATED" ? "success" : "info"} />
                  </div>
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                    <div><span className="text-muted-foreground">Gross</span><br />{money(report.gross_amount)}</div>
                    <div><span className="text-muted-foreground">Commissionable</span><br />{money(report.commissionable_amount)}</div>
                    <div><span className="text-muted-foreground">Excluded</span><br />{money(report.excluded_amount)}</div>
                  </div>
                </div>
              ))}
              {!reports.length ? <p className="text-sm text-muted-foreground">No customer payments reported yet.</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
