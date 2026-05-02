import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockClients, mockOpportunities } from "@/data/mockData";
import { Search, Building2, ExternalLink, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

export default function BumClients() {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState<string>("ALL");

  const allIndustries = useMemo(
    () => Array.from(new Set(mockClients.flatMap((c) => c.industries))),
    []
  );

  const filtered = mockClients
    .filter((c) => c.status === "active")
    .filter((c) => {
      const matchesQuery = `${c.company} ${c.pitch} ${c.icp} ${c.industries.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesIndustry = industry === "ALL" || c.industries.includes(industry);
      return matchesQuery && matchesIndustry;
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients We Represent"
        description="Search the partners you can introduce people to."
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
        {filtered.map((c) => {
          const openCount = mockOpportunities.filter(
            (o) => o.clientId === c.id && o.status === "OPEN"
          ).length;
          return (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-primary/10 p-3">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-bold text-lg">{c.company}</h3>
                      <a
                        href={`https://${c.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                      >
                        {c.website} <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <p className="text-sm mt-2">{c.pitch}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium text-foreground">ICP:</span> {c.icp}
                    </p>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {c.industries.map((i) => (
                        <Badge key={i} variant="secondary">{i}</Badge>
                      ))}
                      {c.regions.map((r) => (
                        <Badge key={r} variant="outline">{r}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className="bg-success text-success-foreground hover:bg-success/90">{openCount} open</Badge>
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
            No clients match your search.
          </div>
        )}
      </div>
    </div>
  );
}
