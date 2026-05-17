import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import { listBumPayouts } from "@/lib/portalApi";
import { formatDateTimeForTimeZone } from "@/lib/timezone";

function money(value: number | null | undefined) {
  return `$${Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default function BumEarnings() {
  const timeZone = useUserTimeZone();
  const payoutsQuery = useQuery({ queryKey: ["bum-payouts"], queryFn: listBumPayouts });
  const payouts = payoutsQuery.data ?? [];
  const approvedOrPaid = payouts.filter((payout) => payout.status === "APPROVED" || payout.status === "PAID");
  const paid = payouts.filter((payout) => payout.status === "PAID");
  const pendingTotal = approvedOrPaid.reduce((sum, payout) => sum + Number(payout.status === "PAID" ? 0 : payout.payout_amount), 0);
  const paidTotal = paid.reduce((sum, payout) => sum + Number(payout.payout_amount), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Earnings" description="Your commissions and payout history." />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Pending payout</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold">{money(pendingTotal)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Approved but not yet marked paid.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Paid to date</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold">{money(paidTotal)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Recorded paid payouts.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Payout history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {payouts.map((payout) => (
            <div key={payout.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {payout.opportunity_claims?.contact_name} @ {payout.opportunity_claims?.contact_company}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Invoice {payout.claim_invoices?.invoice_number ?? "pending"}
                  </p>
                </div>
                <StatusBadge
                  label={payout.status.replaceAll("_", " ")}
                  variant={payout.status === "PAID" ? "success" : payout.status === "APPROVED" ? "info" : "warning"}
                />
              </div>
              <p className="mt-3 font-display text-xl font-bold">{money(payout.payout_amount)}</p>
              {payout.paid_at ? <p className="text-xs text-muted-foreground">Paid {formatDateTimeForTimeZone(payout.paid_at, timeZone)}</p> : null}
            </div>
          ))}
          {!payoutsQuery.isLoading && !payouts.length ? (
            <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
              No payout records yet. Payouts appear here after Trusted Bums is paid and Admin allocates your share.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
