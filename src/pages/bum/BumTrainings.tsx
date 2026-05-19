import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import { listMarketplaceTrainingMaterials } from "@/lib/portalApi";
import { formatDateForTimeZone } from "@/lib/timezone";
import { GraduationCap, Search, PlayCircle } from "lucide-react";

type TrainingTypeFilter = "ALL" | "LINKED_RESOURCE" | "REFERENCE_ONLY";

const trainingTypeFilters: { value: TrainingTypeFilter; label: string }[] = [
  { value: "ALL", label: "All training types" },
  { value: "LINKED_RESOURCE", label: "Linked resources" },
  { value: "REFERENCE_ONLY", label: "Reference notes only" },
];

export default function BumTrainings() {
  const timeZone = useUserTimeZone();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TrainingTypeFilter>("ALL");
  const trainingsQuery = useQuery({
    queryKey: ["bum-marketplace-trainings"],
    queryFn: listMarketplaceTrainingMaterials,
  });

  const filtered = (trainingsQuery.data ?? []).filter((training) => {
    const matchesType =
      typeFilter === "ALL" ||
      (typeFilter === "LINKED_RESOURCE" && Boolean(training.resource_url)) ||
      (typeFilter === "REFERENCE_ONLY" && !training.resource_url);
    const matchesQuery = `${training.title} ${training.description ?? ""} ${training.companies?.name ?? ""} ${training.technology ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesType && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trainings"
        description="Learn about our partners' technologies before making intros."
      />

      <div className="grid gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(220px,0.8fr)]">
        <div className="relative min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trainings…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={typeFilter} onValueChange={(value: TrainingTypeFilter) => setTypeFilter(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {trainingTypeFilters.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((training) => (
          <Card key={training.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-primary/10 p-3">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold">{training.title}</h3>
                    <Badge variant="outline">
                      {training.companies?.name ?? "Client"}
                    </Badge>
                    {training.technology ? <Badge variant="secondary">{training.technology}</Badge> : null}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{training.description ?? "No description provided."}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-muted-foreground">
                      Updated {formatDateForTimeZone(training.updated_at, timeZone)}
                    </span>
                    {training.resource_url ? (
                      <Button size="sm" variant="ghost" asChild>
                        <a href={training.resource_url} target="_blank" rel="noreferrer">
                          <PlayCircle className="mr-2 h-4 w-4" /> Open
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border bg-card p-8 text-center text-muted-foreground">
            {trainingsQuery.data?.length ? "No trainings match your search." : "No published client trainings are available yet."}
          </div>
        )}
      </div>
    </div>
  );
}
