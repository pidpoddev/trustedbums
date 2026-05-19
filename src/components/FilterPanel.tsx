import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  children: React.ReactNode;
  summary?: string;
  className?: string;
}

export function FilterPanel({ children, summary, className }: FilterPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("rounded-lg border bg-card p-3 md:border-0 md:bg-transparent md:p-0", className)}>
      <div className="flex items-center justify-between gap-3 md:hidden">
        <div className="min-w-0">
          <p className="text-sm font-medium">Filters</p>
          {summary ? <p className="truncate text-xs text-muted-foreground">{summary}</p> : null}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen((current) => !current)}>
          <Filter className="mr-2 h-4 w-4" />
          Adjust
        </Button>
      </div>
      <div className={cn(open ? "mt-3 block" : "hidden", "md:mt-0 md:block")}>{children}</div>
    </div>
  );
}
