import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { listClaimInvoices, listCustomerPaymentReports, updateClaimInvoiceStatus, type ClaimInvoiceRecord } from "@/lib/portalApi";

function money(value: number | null | undefined) {
  return `$${Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default function AdminPayments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const reportsQuery = useQuery({ queryKey: ["admin-customer-payment-reports"], queryFn: listCustomerPaymentReports });
  const invoicesQuery = useQuery({ queryKey: ["admin-claim-invoices"], queryFn: listClaimInvoices });
  const reports = reportsQuery.data ?? [];
  const invoices = invoicesQuery.data ?? [];

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
      <PageHeader title="Payments" description="Track client-reported customer payments and Trusted Bums invoices" />

      <Card>
        <CardHeader><CardTitle className="font-display">Trusted Bums Invoices</CardTitle></CardHeader>
        <CardContent>
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
                {invoices.map((invoice) => (
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
            {!invoicesQuery.isLoading && !invoices.length ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No invoices have been generated yet.</div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="font-display">Client-Reported Customer Payments</CardTitle></CardHeader>
        <CardContent>
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
                {reports.map((report) => (
                  <tr key={report.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 font-medium">{report.companies?.name ?? "Client"}</td>
                    <td className="py-3">{report.customer_name}</td>
                    <td className="py-3 font-display font-bold">{money(report.gross_amount)}</td>
                    <td className="py-3 font-display font-bold text-primary">{money(report.commissionable_amount)}</td>
                    <td className="py-3"><StatusBadge label={report.source} variant={report.source === "ADMIN" ? "info" : "secondary"} /></td>
                    <td className="py-3 text-muted-foreground">{new Date(report.customer_payment_received_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!reportsQuery.isLoading && !reports.length ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No customer payments have been reported yet.</div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
