import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  to?: string;
}

export function StatCard({ title, value, icon: Icon, subtitle, to }: StatCardProps) {
  const card = (
    <Card className={to ? "h-full shadow-none transition-all hover:border-primary/40 hover:shadow-sm" : "h-full shadow-none transition-shadow hover:shadow-sm"}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex min-h-16 items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-1 truncate font-display text-xl font-bold sm:text-2xl">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="rounded-md bg-primary/10 p-2">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!to) {
    return card;
  }

  return (
    <Link
      to={to}
      aria-label={`Open ${title}`}
      className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {card}
    </Link>
  );
}
