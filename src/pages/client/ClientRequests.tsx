import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, MessageSquarePlus, Search, Sparkles, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/contexts/AuthContext";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import { listClientReverseOpportunities, type ReverseOpportunityStatus } from "@/lib/portalApi";
import { formatDateForTimeZone } from "@/lib/timezone";

type RequestTypeFilter = "ALL" | "NEW" | "ACTIVE" | "CONVERTED" | "CLOSED";

const requestTypeFilters: { value: RequestTypeFilter; label: string }[] = [
  { value: "ALL", label: "All requests" },
  { value: "NEW", label: "New" },
  { value: "ACTIVE", label: "Active outreach" },
  { value: "CONVERTED", label: "Converted" },
  { value: "CLOSED", label: "Closed lost" },
];

function statusVariant(status: ReverseOpportunityStatus) {
  if (status === "CLIENT_INTERESTED" || status === "CONVERTED") {
    return "success" as const;
  }

  if (status === "CLOSED_LOST") {
    return "destructive" as const;
  }

  if (status === "OUTREACH_READY" || status === "CLIENT_CONTACTED") {
    return "info" as const;
  }

  return "warning" as const;
}

function matchesTypeFilter(status: ReverseOpportunityStatus, typeFilter: RequestTypeFilter) {
  if (typeFilter === "ALL") {
    return true;
  }

  if (typeFilter === "NEW") {
    return status === "SUBMITTED";
  }

  if (typeFilter === "ACTIVE") {
    return status === "OUTREACH_READY" || status === "CLIENT_CONTACTED" || status === "CLIENT_INTERESTED";
  }

  if (typeFilter === "CONVERTED") {
    return status === "CONVERTED";
  }

  return status === "CLOSED_LOST";
}

export default function ClientRequests() {
  const { user } = useAuth();
  const timeZone = useUserTimeZone();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<RequestTypeFilter>("ALL");
  const requestsQuery = useQuery({
    queryKey: ["client-reverse-opportunities", user?.clientId],
    queryFn: () => listClientReverseOpportunities(user!),
    enabled: Boolean(user?.clientId),
  });

  const filteredRequests = useMemo(() => {
    return (requestsQuery.data ?? []).filter((request) => {
      const matchesQuery = [
        request.customer_company_name,
        request.customer_need_summary,
        request.expected_product_service,
        request.vendor_contact_name,
        request.customer_contact_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchesTypeFilter(request.status, typeFilter) && matchesQuery;
    });
  }, [query, requestsQuery.data, typeFilter]);

  return (
    <div>
      <PageHeader
        title="Inbound Requests"
        description="Demand-sourced opportunities that Bums have submitted against your company."
      />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(240px,0.8fr)] md:items-end">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search inbound requests, customers, or needs"
                className="pl-9"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={(value: RequestTypeFilter) => setTypeFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {requestTypeFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 mb-8">
        {filteredRequests.map((request) => (
          <Card key={request.id}>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-lg font-bold">{request.customer_company_name}</p>
                    <StatusBadge label={request.status.replaceAll("_", " ")} variant={statusVariant(request.status)} />
                    <StatusBadge
                      label={request.client_mode === "EXISTING_CLIENT" ? "Existing client" : "Prospect-converted"}
                      variant="secondary"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground max-w-3xl">{request.customer_need_summary}</p>
                  <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                    <p className="inline-flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      {request.expected_product_service ?? "Solution fit pending"}
                    </p>
                    <p className="inline-flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {request.estimated_deal_value ? `$${Number(request.estimated_deal_value).toLocaleString()} expected` : "Value pending"}
                    </p>
                    <p className="inline-flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Decision-maker: {request.vendor_contact_name ?? "Pending"}{request.vendor_contact_title ? ` · ${request.vendor_contact_title}` : ""}
                    </p>
                    <p className="inline-flex items-center gap-2">
                      <MessageSquarePlus className="h-4 w-4" />
                      End customer contact: {request.customer_contact_name ?? "Not provided"}
                    </p>
                  </div>
                  {request.notes ? <p className="text-sm">{request.notes}</p> : null}
                </div>
                <div className="text-sm text-muted-foreground">
                  Submitted {formatDateForTimeZone(request.created_at, timeZone)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {!filteredRequests.length ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              {requestsQuery.data?.length
                ? "No inbound requests match your current filters."
                : "No Bum-submitted reverse opportunities are targeting your company yet."}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
