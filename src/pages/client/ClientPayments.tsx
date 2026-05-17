import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
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

function money(value: number | null | undefined) {
  return `$${Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default function ClientPayments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
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

  const selectedClaim = claims.find((claim) => claim.id === claimId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Payments"
        description="Report customer payments you received directly and generate the Trusted Bums invoice against the approved claim."
      />

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
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
