import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { listBumPayouts, updateBumPayout, type BumPayoutRecord } from "@/lib/portalApi";

function money(value: number | null | undefined) {
  return `$${Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function PayoutRow({ payout }: { payout: BumPayoutRecord }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState(String(payout.payout_amount || ""));
  const updateMutation = useMutation({
    mutationFn: (status: "APPROVED" | "PAID") =>
      updateBumPayout(user!, payout, {
        payout_amount: Number(amount || payout.payout_amount || 0),
        status,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-bum-payouts"] });
      toast({ title: "Payout updated", description: "The Bum payout queue was updated." });
    },
    onError: (error) => {
      toast({
        title: "Unable to update payout",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <tr className="border-b last:border-0 hover:bg-muted/50">
      <td className="py-3 font-medium">{payout.profiles?.full_name ?? payout.profiles?.email ?? "Trusted Bum"}</td>
      <td className="py-3">
        {payout.opportunity_claims?.contact_name} @ {payout.opportunity_claims?.contact_company}
        <p className="text-xs text-muted-foreground">{payout.claim_invoices?.invoice_number}</p>
      </td>
      <td className="py-3">{money(payout.claim_invoices?.invoice_amount)}</td>
      <td className="py-3 min-w-[140px]">
        <Input type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Set amount" />
      </td>
      <td className="py-3">
        <StatusBadge
          label={payout.status.replaceAll("_", " ")}
          variant={payout.status === "PAID" ? "success" : payout.status === "APPROVED" ? "info" : "warning"}
        />
      </td>
      <td className="py-3">
        <div className="flex flex-wrap gap-2">
          {payout.status === "PENDING_ALLOCATION" ? (
            <Button size="sm" variant="outline" onClick={() => updateMutation.mutate("APPROVED")}>
              <CheckCircle className="mr-1 h-3 w-3" /> Approve
            </Button>
          ) : null}
          {payout.status === "APPROVED" ? (
            <Button size="sm" onClick={() => updateMutation.mutate("PAID")}>
              <CheckCircle className="mr-1 h-3 w-3" /> Mark paid
            </Button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

export default function AdminPayouts() {
  const payoutsQuery = useQuery({ queryKey: ["admin-bum-payouts"], queryFn: listBumPayouts });
  const payouts = payoutsQuery.data ?? [];

  return (
    <div>
      <PageHeader title="Payouts" description="Allocate, approve, and record Bum payouts after Trusted Bums is paid" />

      <Card>
        <CardHeader><CardTitle className="font-display">Payout Queue</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Bum</th>
                  <th className="pb-3 font-medium text-muted-foreground">Claim</th>
                  <th className="pb-3 font-medium text-muted-foreground">Invoice</th>
                  <th className="pb-3 font-medium text-muted-foreground">Payout</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <PayoutRow key={payout.id} payout={payout} />
                ))}
              </tbody>
            </table>
            {!payoutsQuery.isLoading && !payouts.length ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No payouts yet. Mark a Trusted Bums invoice paid to create a pending allocation.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
