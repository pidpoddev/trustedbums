import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MessageSquarePlus, Search } from "lucide-react";

const mockRequests = [
  { id: "r1", title: "Need intros to Head of IT at hospital systems", status: "submitted", createdAt: "2026-02-10" },
  { id: "r2", title: "Looking for CIO contacts in retail banking", status: "converted", createdAt: "2026-01-28" },
];

type RequestTypeFilter = "ALL" | "SUBMITTED" | "CONVERTED";

const requestTypeFilters: { value: RequestTypeFilter; label: string }[] = [
  { value: "ALL", label: "All requests" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "CONVERTED", label: "Converted" },
];

export default function ClientRequests() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<RequestTypeFilter>("ALL");
  const filteredRequests = useMemo(() => {
    return mockRequests.filter((request) => {
      const matchesType =
        typeFilter === "ALL" ||
        (typeFilter === "SUBMITTED" && request.status === "submitted") ||
        (typeFilter === "CONVERTED" && request.status === "converted");

      const matchesQuery = request.title.toLowerCase().includes(query.toLowerCase());

      return matchesType && matchesQuery;
    });
  }, [query, typeFilter]);

  return (
    <div>
      <PageHeader title="Intro Requests" description="Use requests for one-off help, while keeping your ongoing account list in Target Accounts.">
        <Button><Plus className="h-4 w-4 mr-2" /> New Request</Button>
      </PageHeader>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(240px,0.8fr)]">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search intro requests"
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
        {filteredRequests.map((r) => (
          <Card key={r.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquarePlus className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground">Submitted {r.createdAt}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${r.status === "converted" ? "bg-success/10 text-success" : "bg-secondary text-secondary-foreground"}`}>
                  {r.status === "converted" ? "Converted to Opportunity" : "Submitted"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {!filteredRequests.length ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              No intro requests match your current filters.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
