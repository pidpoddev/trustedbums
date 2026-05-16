import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listMarketplaceOpportunities } from "@/lib/portalApi";
import { Search, Building2, ExternalLink, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

interface MarketplaceClientSummary {
  company: string;
  website: string | null;
  pitch: string;
  industries: string[];
  openCount: number;
}

export default function BumClients() {
  const [query, setQuery] = useState("");
  const opportunitiesQuery = useQuery({
    queryKey: ["bum-marketplace-opportunities"],
    queryFn: listMarketplaceOpportunities,
  });

  const marketplaceClients = useMemo<MarketplaceClientSummary[]>(() => {
    const opportunities = opportunitiesQuery.data ?? [];
    const summaries = new Map<string, MarketplaceClientSummary>();

    for (const opportunity of opportunities) {
      const company = opportunity.companies?.name ?? "Trusted Bums Client";
      const existing = summaries.get(company);
      const productHint = opportunity.expected_product_service?.trim();

      if (existing) {
        existing.openCount += 1;
        if (productHint && !existing.industries.includes(productHint)) {
          existing.industries.push(productHint);
        }
        continue;
      }

      summaries.set(company, {
        company,
        website: null,
        pitch: opportunity.opportunity_description ?? "Live client opportunity available in the marketplace.",
        industries: productHint ? [productHint] : [],
        openCount: 1,
      });
    }

    return Array.from(summaries.values()).sort((left, right) => left.company.localeCompare(right.company));
  }, [opportunitiesQuery.data]);

  const allIndustries = useMemo(
    () => Array.from(new Set(marketplaceClients.flatMap((client) => client.industries))).filter(Boolean),
    [marketplaceClients],
  );
  const [industry, setIndustry] = useState<string>("ALL");

  const filtered = marketplaceClients.filter((client) => {
    const matchesQuery = `${client.company} ${client.pitch} ${client.industries.join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesIndustry = industry === "ALL" || client.industries.includes(industry);
    return matchesQuery && matchesIndustry;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients We Represent"
        description="Search live client companies that currently have open marketplace opportunities."
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company, pitch, or ICP…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={industry === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setIndustry("ALL")}
          >
            All industries
          </Button>
          {allIndustries.map((i) => (
            <Button
              key={i}
              variant={industry === i ? "default" : "outline"}
              size="sm"
              onClick={() => setIndustry(i)}
            >
              {i}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map((client) => {
          return (
            <Card key={client.company} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-primary/10 p-3">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-bold text-lg">{client.company}</h3>
                      {client.website ? (
                        <a
                          href={`https://${client.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                        >
                          {client.website} <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                    </div>
                    <p className="text-sm mt-2">{client.pitch}</p>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {client.industries.length ? client.industries.map((i) => (
                        <Badge key={i} variant="secondary">{i}</Badge>
                      )) : (
                        <Badge variant="outline">Opportunity live</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className="bg-success text-success-foreground hover:bg-success/90">{client.openCount} open</Badge>
                    <Link to="/bum/opportunities">
                      <Button size="sm" variant="outline">
                        <Briefcase className="mr-2 h-4 w-4" /> View opps
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
            {marketplaceClients.length ? "No live clients match your search." : "No live clients are available yet."}
          </div>
        )}
      </div>
    </div>
  );
}
