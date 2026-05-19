import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { calculateTopLineSharePercent, listBumPayouts, updateBumPayout, type BumPayoutRecord } from "@/lib/portalApi";

function money(value: number | null | undefined) {
  return `$${Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

type PayoutTypeFilter = "ALL" | "PENDING_ALLOCATION" | "APPROVED" | "PAID";

const payoutTypeFilters: { value: PayoutTypeFilter; label: string }[] = [
  { value: "ALL", label: "All payout types" },
  { value: "PENDING_ALLOCATION", label: "Pending allocation" },
  { value: "APPROVED", label: "Approved" },
  { value: "PAID", label: "Paid" },
];

function PayoutRow({ payout }: { payout: BumPayoutRecord }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: (status: "APPROVED" | "PAID") =>
      updateBumPayout(user!, payout, {
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
      <td className="py-3 min-w-[220px]">
        <p className="font-medium">{money(payout.payout_amount)}</p>
        <p className="text-xs text-muted-foreground">
          {Number(payout.share_percent ?? 0).toLocaleString()}% of TB commission · {calculateTopLineSharePercent(payout.claim_invoices?.commission_rate, payout.share_percent).toLocaleString()}% top line
        </p>
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
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<PayoutTypeFilter>("ALL");
  const payoutsQuery = useQuery({ queryKey: ["admin-bum-payouts"], queryFn: listBumPayouts });
  const payouts = payoutsQuery.data ?? [];
  const filteredPayouts = useMemo(() => {
    return payouts.filter((payout) => {
      const matchesType = typeFilter === "ALL" || payout.status === typeFilter;
      const matchesQuery = [
        payout.profiles?.full_name,
        payout.profiles?.email,
        payout.opportunity_claims?.contact_name,
        payout.opportunity_claims?.contact_company,
        payout.claim_invoices?.invoice_number,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesType && matchesQuery;
    });
  }, [payouts, query, typeFilter]);

  return (
    <div>
      <PageHeader title="Payouts" description="Allocate, approve, and record Bum payouts after Trusted Bums is paid" />

      <Card>
        <CardHeader><CardTitle className="font-display">Payout Queue</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(260px,0.8fr)] md:items-end mb-4">
            <div className="relative min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Bums, claims, or invoice numbers…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={(value: PayoutTypeFilter) => setTypeFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {payoutTypeFilters.map((filter) => (
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
                  <th className="pb-3 font-medium text-muted-foreground">Bum</th>
                  <th className="pb-3 font-medium text-muted-foreground">Claim</th>
                  <th className="pb-3 font-medium text-muted-foreground">Invoice</th>
                  <th className="pb-3 font-medium text-muted-foreground">Payout</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayouts.map((payout) => (
                  <PayoutRow key={payout.id} payout={payout} />
                ))}
              </tbody>
            </table>
            {!payoutsQuery.isLoading && !filteredPayouts.length ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {payouts.length ? "No payouts match your current filters." : "No payouts yet. Mark a Trusted Bums invoice paid to create a pending allocation."}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
