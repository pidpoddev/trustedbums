import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { listMarketplaceOpportunities } from "@/lib/portalApi";
import { Search, Briefcase, Calendar, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

export default function BumOpportunities() {
  const [query, setQuery] = useState("");
  const opportunitiesQuery = useQuery({
    queryKey: ["bum-marketplace-opportunities"],
    queryFn: listMarketplaceOpportunities,
  });
  const opportunities = opportunitiesQuery.data ?? [];

  const filtered = opportunities.filter((opportunity) => {
    const matchesQuery = `${opportunity.target_account_name} ${opportunity.companies?.name ?? ""} ${opportunity.opportunity_description ?? ""} ${opportunity.expected_product_service ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesQuery;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opportunities"
        description="Browse live client opportunities and recommend customers you know."
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {opportunitiesQuery.isLoading && (
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          Loading live opportunities...
        </div>
      )}

      <div className="grid gap-4">
        {filtered.map((opportunity) => (
          <Card key={opportunity.id} className="transition-shadow hover:shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-accent/10 p-3">
                  <Briefcase className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-bold">{opportunity.target_account_name}</h3>
                    <StatusBadge label="Open" variant="success" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {opportunity.companies?.name ?? "Client pending"} • {opportunity.commission_rate}% commission
                  </p>
                  <p className="mt-2 text-sm">{opportunity.opportunity_description ?? "No description provided yet."}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {opportunity.estimated_deal_value
                        ? `$${Number(opportunity.estimated_deal_value).toLocaleString()} estimated`
                        : "Estimated value pending"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {opportunity.expected_timeline?.trim() || "Timeline to be confirmed"}
                    </span>
                  </div>
                </div>
                <div>
                  <Link to={`/bum/opportunities/${opportunity.id}`}>
                    <Button size="sm">View opportunity</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {!opportunitiesQuery.isLoading && filtered.length === 0 && (
          <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
            {opportunities.length
              ? "No live opportunities match your search."
              : "No live opportunities are available yet."}
          </div>
        )}
      </div>
    </div>
  );
}
