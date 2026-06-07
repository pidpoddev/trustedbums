import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import {
  listPerformanceMetricEvents,
  listPerformanceMetricSummaries,
  type PerformanceMetricEventRecord,
  type PerformanceMetricName,
  type PerformanceMetricRating,
  type PerformanceMetricSummaryRecord,
} from "@/lib/portalApi";
import { formatDateTimeForTimeZone } from "@/lib/timezone";

const metricOptions: Array<PerformanceMetricName | "ALL"> = ["ALL", "LCP", "FCP", "INP", "CLS", "TTFB"];
const ratingOptions: Array<PerformanceMetricRating | "ALL"> = ["ALL", "good", "needs-improvement", "poor"];
const dayOptions = [1, 7, 30, 90];

function metricValue(metric: Pick<PerformanceMetricEventRecord, "metric_name" | "metric_value">) {
  const value = Number(metric.metric_value);
  if (metric.metric_name === "CLS") {
    return value.toFixed(3);
  }
  return `${Math.round(value)} ms`;
}

function ratingBadge(rating: PerformanceMetricRating) {
  if (rating === "poor") return <Badge variant="destructive">Poor</Badge>;
  if (rating === "needs-improvement") return <Badge variant="secondary">Needs improvement</Badge>;
  return <Badge>Good</Badge>;
}

export default function AdminPerformanceMetrics() {
  const timeZone = useUserTimeZone();
  const [days, setDays] = useState(7);
  const [metricName, setMetricName] = useState<PerformanceMetricName | "ALL">("ALL");
  const [rating, setRating] = useState<PerformanceMetricRating | "ALL">("ALL");

  const metricsQuery = useQuery({
    queryKey: ["admin-performance-metrics-recent", days, metricName, rating],
    queryFn: () => listPerformanceMetricEvents({ days, metricName, rating, limit: 100 }),
  });
  const summaryQuery = useQuery({
    queryKey: ["admin-performance-metrics-summary", days, metricName, rating],
    queryFn: () => listPerformanceMetricSummaries({ days, metricName, rating }),
  });

  const rows = useMemo(() => metricsQuery.data ?? [], [metricsQuery.data]);
  const summary = useMemo(() => {
    const summaries = summaryQuery.data ?? [];
    const summaryByMetric = new Map<PerformanceMetricName, PerformanceMetricSummaryRecord>(
      summaries.map((row) => [row.metric_name, row]),
    );
    return {
      total: summaries.reduce((total, row) => total + Number(row.sample_count), 0),
      uniqueRoutes: summaries.reduce((max, row) => Math.max(max, Number(row.route_count)), 0),
      poor: summaries.reduce((total, row) => total + Number(row.poor_count), 0),
      needsImprovement: summaries.reduce((total, row) => total + Number(row.needs_improvement_count), 0),
      metricSummaries: metricOptions.filter((name): name is PerformanceMetricName => name !== "ALL").map((name) => ({
        name,
        count: Number(summaryByMetric.get(name)?.sample_count ?? 0),
        p75: summaryByMetric.get(name)?.p75_value ?? null,
        poor: Number(summaryByMetric.get(name)?.poor_count ?? 0),
      })),
    };
  }, [summaryQuery.data]);

  return (
    <div>
      <PageHeader
        title="Performance Metrics"
        description="Review necessary operational telemetry from Cloudflare and the Trusted Bums performance beacon."
      >
        <Button
          variant="outline"
          onClick={() => {
            metricsQuery.refetch();
            summaryQuery.refetch();
          }}
          disabled={metricsQuery.isFetching || summaryQuery.isFetching}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </PageHeader>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="performance-days">Window</label>
          <Select value={String(days)} onValueChange={(value) => setDays(Number(value))}>
            <SelectTrigger id="performance-days"><SelectValue /></SelectTrigger>
            <SelectContent>
              {dayOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>Last {option} {option === 1 ? "day" : "days"}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="performance-metric">Metric</label>
          <Select value={metricName} onValueChange={(value) => setMetricName(value as PerformanceMetricName | "ALL")}>
            <SelectTrigger id="performance-metric"><SelectValue /></SelectTrigger>
            <SelectContent>
              {metricOptions.map((option) => (
                <SelectItem key={option} value={option}>{option === "ALL" ? "All metrics" : option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="performance-rating">Rating</label>
          <Select value={rating} onValueChange={(value) => setRating(value as PerformanceMetricRating | "ALL")}>
            <SelectTrigger id="performance-rating"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ratingOptions.map((option) => (
                <SelectItem key={option} value={option}>{option === "ALL" ? "All ratings" : option.replace("-", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Samples</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.uniqueRoutes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Needs improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.needsImprovement}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Poor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.poor}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5" />
            P75 by metric
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-5">
            {summary.metricSummaries.map((metric) => (
              <div key={metric.name} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{metric.name}</p>
                  <Badge variant="outline">{metric.count}</Badge>
                </div>
                <p className="mt-3 text-2xl font-bold">
                  {metric.p75 === null ? "No data" : metricValue({ metric_name: metric.name, metric_value: metric.p75 })}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{metric.poor} poor samples</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Recent samples</CardTitle>
        </CardHeader>
        <CardContent>
          {metricsQuery.isLoading || summaryQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading performance metrics...</p>
          ) : rows.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Metric</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Connection</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="min-w-[180px]">{formatDateTimeForTimeZone(row.created_at, timeZone)}</TableCell>
                      <TableCell className="font-medium">{row.metric_name}</TableCell>
                      <TableCell>{metricValue(row)}</TableCell>
                      <TableCell>{ratingBadge(row.metric_rating)}</TableCell>
                      <TableCell className="max-w-[260px] truncate">{row.page_path}</TableCell>
                      <TableCell className="max-w-[260px] truncate">{row.deployment_origin ?? "Unknown"}</TableCell>
                      <TableCell>{row.connection_type ?? "Unknown"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No performance samples match the current filters.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
