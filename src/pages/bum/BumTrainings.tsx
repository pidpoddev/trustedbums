import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockTrainings } from "@/data/mockData";
import { GraduationCap, Search, PlayCircle } from "lucide-react";

export default function BumTrainings() {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"ALL" | "GLOBAL" | "CLIENT">("ALL");

  const filtered = mockTrainings.filter((t) => {
    const matchesQuery = `${t.title} ${t.description} ${t.client ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesScope = scope === "ALL" || t.scope === scope;
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
          {(["ALL", "GLOBAL", "CLIENT"] as const).map((s) => (
            <Button
              key={s}
              variant={scope === s ? "default" : "outline"}
              size="sm"
              onClick={() => setScope(s)}
            >
              {s === "ALL" ? "All" : s === "GLOBAL" ? "Platform" : "Per-Client"}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((t) => (
          <Card key={t.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-primary/10 p-3">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold">{t.title}</h3>
                    <Badge variant={t.scope === "GLOBAL" ? "secondary" : "outline"}>
                      {t.scope === "GLOBAL" ? "Platform" : t.client}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-muted-foreground">
                      Updated {new Date(t.updatedAt).toLocaleDateString()}
                    </span>
                    <Button size="sm" variant="ghost">
                      <PlayCircle className="mr-2 h-4 w-4" /> Open
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border bg-card p-8 text-center text-muted-foreground">
            No trainings match your search.
          </div>
        )}
      </div>
    </div>
  );
}
