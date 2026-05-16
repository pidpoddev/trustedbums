import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listMarketplaceTrainingMaterials } from "@/lib/portalApi";
import { GraduationCap, Search, PlayCircle } from "lucide-react";

export default function BumTrainings() {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"ALL" | "CLIENT">("ALL");
  const trainingsQuery = useQuery({
    queryKey: ["bum-marketplace-trainings"],
    queryFn: listMarketplaceTrainingMaterials,
  });

  const filtered = (trainingsQuery.data ?? []).filter((training) => {
    const matchesQuery = `${training.title} ${training.description ?? ""} ${training.companies?.name ?? ""} ${training.technology ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesScope = scope === "ALL" || scope === "CLIENT";
    return matchesQuery && matchesScope;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trainings"
        description="Learn about our partners' technologies before making intros."
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trainings…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(["ALL", "CLIENT"] as const).map((s) => (
            <Button
              key={s}
              variant={scope === s ? "default" : "outline"}
              size="sm"
              onClick={() => setScope(s)}
            >
              {s === "ALL" ? "All" : "Client Trainings"}
            </Button>
          ))}
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
                      Updated {new Date(training.updated_at).toLocaleDateString()}
                    </span>
                    {training.resource_url ? (
                      <a href={training.resource_url} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="ghost">
                          <PlayCircle className="mr-2 h-4 w-4" /> Open
                        </Button>
                      </a>
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
