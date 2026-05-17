import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { listClaimInvoices, listCustomerPaymentReports, updateClaimInvoiceStatus, type ClaimInvoiceRecord } from "@/lib/portalApi";
import { Search } from "lucide-react";

function money(value: number | null | undefined) {
  return `$${Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [invoiceQuery, setInvoiceQuery] = useState("");
  const [paymentQuery, setPaymentQuery] = useState("");
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState<InvoiceTypeFilter>("ALL");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<PaymentReportTypeFilter>("ALL");
  const reportsQuery = useQuery({ queryKey: ["admin-customer-payment-reports"], queryFn: listCustomerPaymentReports });
  const invoicesQuery = useQuery({ queryKey: ["admin-claim-invoices"], queryFn: listClaimInvoices });
  const reports = reportsQuery.data ?? [];
  const invoices = invoicesQuery.data ?? [];
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
          <div className="grid gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(260px,0.8fr)] mb-4">
            <div className="relative min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices, clients, customers, or opportunities…"
                value={invoiceQuery}
                onChange={(event) => setInvoiceQuery(event.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={invoiceTypeFilter} onValueChange={(value: InvoiceTypeFilter) => setInvoiceTypeFilter(value)}>
                <SelectTrigger>
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
        <CardHeader><CardTitle className="font-display">Client-Reported Customer Payments</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(260px,0.8fr)] mb-4">
            <div className="relative min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reported payments, clients, or customers…"
                value={paymentQuery}
                onChange={(event) => setPaymentQuery(event.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={paymentTypeFilter} onValueChange={(value: PaymentReportTypeFilter) => setPaymentTypeFilter(value)}>
                <SelectTrigger>
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
                    <td className="py-3 text-muted-foreground">{new Date(report.customer_payment_received_at).toLocaleDateString()}</td>
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
