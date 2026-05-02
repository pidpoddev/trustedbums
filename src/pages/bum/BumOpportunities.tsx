import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockOpportunities, opportunityStatusConfig } from "@/data/mockData";
import { Search, Briefcase, Users, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export default function BumOpportunities() {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState<string>("ALL");

  const allIndustries = useMemo(
    () => Array.from(new Set(mockOpportunities.flatMap((o) => o.industries))),
    []
  );

  const filtered = mockOpportunities
    .filter((o) => o.status === "OPEN")
    .filter((o) => {
      const matchesQuery = `${o.title} ${o.client} ${o.description}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesIndustry = industry === "ALL" || o.industries.includes(industry);
      return matchesQuery && matchesIndustry;
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opportunities"
        description="Browse open intros and recommend customers you know."
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities…"
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
            All
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
        {filtered.map((o) => (
          <Card key={o.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-accent/10 p-3">
                  <Briefcase className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-lg">{o.title}</h3>
                    <StatusBadge {...opportunityStatusConfig[o.status as keyof typeof opportunityStatusConfig]} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {o.client} • {o.commission}
                  </p>
                  <p className="text-sm mt-2">{o.description}</p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {o.industries.map((i) => (
                      <Badge key={i} variant="secondary">{i}</Badge>
                    ))}
                    {o.regions.map((r) => (
                      <Badge key={r} variant="outline">{r}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" /> {o.claims} claims
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {o.meetings} meetings held
                    </span>
                  </div>
                </div>
                <div>
                  <Link to={`/bum/opportunities/${o.id}`}>
                    <Button size="sm">View & recommend</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
            No open opportunities match your search.
          </div>
        )}
      </div>
    </div>
  );
}
