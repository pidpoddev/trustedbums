import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, Search, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { listCustomerTargets, listMarketplaceOpportunities } from "@/lib/portalApi";

const MAX_RESULTS = 6;

export function BumOpportunitySearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const opportunitiesQuery = useQuery({
    queryKey: ["bum-header-opportunity-search", "opportunities"],
    queryFn: listMarketplaceOpportunities,
    staleTime: 60_000,
  });
  const targetsQuery = useQuery({
    queryKey: ["bum-header-opportunity-search", "targets"],
    queryFn: () => listCustomerTargets(null),
    staleTime: 60_000,
  });

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.length < 2) return [];

    const opportunities = (opportunitiesQuery.data ?? []).map((opportunity) => ({
      id: opportunity.id,
      type: "opportunity" as const,
      title: opportunity.target_account_name,
      subtitle: [opportunity.companies?.name, opportunity.expected_product_service].filter(Boolean).join(" · "),
      href: "/bum/opportunities/" + opportunity.id,
      searchable: [
        opportunity.target_account_name,
        opportunity.companies?.name,
        opportunity.opportunity_description,
        opportunity.expected_product_service,
        opportunity.client_contact,
        opportunity.trusted_bums_contact,
        opportunity.notes,
      ].filter(Boolean).join(" ").toLowerCase(),
    }));

    const targets = (targetsQuery.data ?? []).map((target) => {
      const title = target.target_companies?.name ?? target.target_account_name;
      return {
        id: target.id,
        type: "target" as const,
        title,
        subtitle: [target.client_companies?.name, target.expected_product_service].filter(Boolean).join(" · "),
        href: "/bum/opportunities?search=" + encodeURIComponent(title),
        searchable: [
          title,
          target.client_companies?.name,
          target.expected_product_service,
          target.notes,
          target.key_contact_name,
          target.key_contact_email,
        ].filter(Boolean).join(" ").toLowerCase(),
      };
    });

    return [...opportunities, ...targets]
      .filter((result) => result.searchable.includes(normalizedQuery))
      .slice(0, MAX_RESULTS);
  }, [opportunitiesQuery.data, query, targetsQuery.data]);

  const showResults = focused && query.trim().length >= 2;

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setFocused(false);
    navigate("/bum/opportunities?search=" + encodeURIComponent(trimmed));
  };

  return (
    <form onSubmit={submitSearch} className="relative ml-4 hidden w-full max-w-md md:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => window.setTimeout(() => setFocused(false), 120)}
        placeholder="Search opportunities"
        className="h-9 pl-9"
        aria-label="Search opportunities"
      />
      {showResults ? (
        <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg">
          {opportunitiesQuery.isLoading || targetsQuery.isLoading ? (
            <div className="p-3 text-sm text-muted-foreground">Searching...</div>
          ) : results.length ? (
            <div className="max-h-80 overflow-auto py-1">
              {results.map((result) => (
                <Link
                  key={result.type + ":" + result.id}
                  to={result.href}
                  className="flex items-start gap-3 px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => setFocused(false)}
                >
                  <span className="mt-0.5 rounded-md bg-primary/10 p-1.5 text-primary">
                    {result.type === "opportunity" ? <Briefcase className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{result.title}</span>
                    {result.subtitle ? <span className="block truncate text-xs text-muted-foreground">{result.subtitle}</span> : null}
                  </span>
                  <Badge variant="outline" className="shrink-0 capitalize">{result.type}</Badge>
                </Link>
              ))}
            </div>
          ) : (
            <button type="submit" className="block w-full px-3 py-3 text-left text-sm text-muted-foreground hover:bg-muted">
              Search all opportunities for “{query.trim()}”
            </button>
          )}
        </div>
      ) : null}
    </form>
  );
}
