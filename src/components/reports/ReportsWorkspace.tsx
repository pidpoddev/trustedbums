import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { BarChart3, Check, Download, FilePlus2, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type ReportRow = Record<string, string | number | null | undefined>;

export interface ReportColumn {
  key: string;
  label: string;
  defaultVisible?: boolean;
  align?: "left" | "right";
}

export interface RecommendedReport {
  id: string;
  title: string;
  description: string;
  category: string;
  dataLabel: string;
  rows: ReportRow[];
  columns: ReportColumn[];
  dateKey?: string;
  groupByKey?: string;
  groupByLabel?: string;
  valueKey?: string;
  valueLabel?: string;
}

interface ReportsWorkspaceProps {
  title: string;
  description: string;
  recommendations: RecommendedReport[];
  isLoading?: boolean;
}

type DateRange = "30" | "90" | "365" | "ytd" | "all";

const dateRangeLabels: Record<DateRange, string> = {
  "30": "Last 30 days",
  "90": "Last 90 days",
  "365": "Last 12 months",
  ytd: "Year to date",
  all: "All time",
};

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadCsv(filename: string, rows: ReportRow[], columns: ReportColumn[]) {
  const headers = columns.map((column) => column.label);
  const csv = [
    headers.join(","),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column.key])).join(",")),
  ].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function formatCellValue(value: ReportRow[string]) {
  if (typeof value === "number") {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  return value ?? "—";
}

function normalizeFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function getStartDate(range: DateRange) {
  const now = new Date();

  if (range === "all") {
    return null;
  }

  if (range === "ytd") {
    return new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  }

  const startDate = new Date(now);
  startDate.setUTCDate(startDate.getUTCDate() - Number(range));
  return startDate;
}

function filterRowsByDate(rows: ReportRow[], dateKey: string | undefined, range: DateRange) {
  const startDate = getStartDate(range);

  if (!dateKey || !startDate) {
    return rows;
  }

  return rows.filter((row) => {
    const rawValue = row[dateKey];
    if (!rawValue) {
      return false;
    }

    const date = new Date(String(rawValue));
    return !Number.isNaN(date.getTime()) && date >= startDate;
  });
}

function buildChartData(report: RecommendedReport, rows: ReportRow[]) {
  if (!report.groupByKey) {
    return [];
  }

  const values = new Map<string, number>();

  for (const row of rows) {
    const label = String(row[report.groupByKey] ?? "Unknown");
    const value = report.valueKey ? Number(row[report.valueKey] ?? 0) : 1;
    values.set(label, (values.get(label) ?? 0) + value);
  }

  return Array.from(values.entries())
    .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

function getDefaultColumns(report: RecommendedReport) {
  const defaultColumns = report.columns.filter((column) => column.defaultVisible !== false).map((column) => column.key);
  return defaultColumns.length ? defaultColumns : report.columns.slice(0, 6).map((column) => column.key);
}

export function ReportsWorkspace({ title, description, recommendations, isLoading }: ReportsWorkspaceProps) {
  const [selectedReportId, setSelectedReportId] = useState(recommendations[0]?.id ?? "");
  const [dateRange, setDateRange] = useState<DateRange>("90");
  const selectedReport = recommendations.find((report) => report.id === selectedReportId) ?? recommendations[0];
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(() =>
    selectedReport ? getDefaultColumns(selectedReport) : [],
  );

  const filteredRows = useMemo(
    () => (selectedReport ? filterRowsByDate(selectedReport.rows, selectedReport.dateKey, dateRange) : []),
    [dateRange, selectedReport],
  );
  const visibleColumns = selectedReport?.columns.filter((column) => visibleColumnKeys.includes(column.key)) ?? [];
  const chartData = selectedReport ? buildChartData(selectedReport, filteredRows) : [];
  const totalValue =
    selectedReport?.valueKey
      ? filteredRows.reduce((sum, row) => sum + Number(row[selectedReport.valueKey!] ?? 0), 0)
      : filteredRows.length;

  function selectReport(report: RecommendedReport) {
    setSelectedReportId(report.id);
    setVisibleColumnKeys(getDefaultColumns(report));
  }

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description}>
        <Button
          onClick={() =>
            selectedReport &&
            downloadCsv(`${normalizeFilename(selectedReport.title)}.csv`, filteredRows, visibleColumns)
          }
          disabled={!selectedReport || !visibleColumns.length}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {recommendations.map((report) => (
          <Card key={report.id} className={selectedReport?.id === report.id ? "border-primary/60 bg-primary/5" : ""}>
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-md bg-secondary p-2">
                  <BarChart3 className="h-4 w-4 text-secondary-foreground" />
                </div>
                <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">{report.category}</span>
              </div>
              <CardTitle className="font-display text-base">{report.title}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {report.rows.length.toLocaleString()} {report.dataLabel}
              </p>
              <Button
                variant={selectedReport?.id === report.id ? "default" : "outline"}
                className="w-full"
                onClick={() => selectReport(report)}
              >
                {selectedReport?.id === report.id ? <Check className="mr-2 h-4 w-4" /> : <FilePlus2 className="mr-2 h-4 w-4" />}
                Create report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Report builder</CardTitle>
            <CardDescription>Choose a recommendation, date window, and the fields to include.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Report</Label>
              <Select value={selectedReport?.id} onValueChange={(value) => selectReport(recommendations.find((item) => item.id === value)!)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {recommendations.map((report) => (
                    <SelectItem key={report.id} value={report.id}>
                      {report.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date range</Label>
              <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(dateRangeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Fields</Label>
              <div className="space-y-2">
                {selectedReport?.columns.map((column) => (
                  <label key={column.key} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                    <Checkbox
                      checked={visibleColumnKeys.includes(column.key)}
                      onCheckedChange={(checked) =>
                        setVisibleColumnKeys((current) =>
                          checked
                            ? Array.from(new Set([...current, column.key]))
                            : current.filter((key) => key !== column.key),
                        )
                      }
                    />
                    {column.label}
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base">Rows</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">{filteredRows.length.toLocaleString()}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base">{selectedReport?.valueLabel ?? "Report value"}</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">{totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base">Source</CardTitle>
              </CardHeader>
              <CardContent className="text-sm font-medium text-muted-foreground">{selectedReport?.dataLabel ?? "Records"}</CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-display">{selectedReport?.title ?? "Report preview"}</CardTitle>
              <CardDescription>
                {selectedReport?.groupByLabel ? `Grouped by ${selectedReport.groupByLabel.toLowerCase()}. ` : ""}
                Previewing the first 25 matching rows.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center rounded-md border border-dashed p-10 text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading report data
                </div>
              ) : null}

              {!isLoading && chartData.length ? (
                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                  <BarChart data={chartData} margin={{ top: 10, right: 16, bottom: 24, left: 8 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                  </BarChart>
                </ChartContainer>
              ) : null}

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {visibleColumns.map((column) => (
                        <TableHead key={column.key} className={column.align === "right" ? "text-right" : undefined}>
                          {column.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.slice(0, 25).map((row, index) => (
                      <TableRow key={`${selectedReport?.id}-${index}`}>
                        {visibleColumns.map((column) => (
                          <TableCell key={column.key} className={column.align === "right" ? "text-right" : undefined}>
                            {formatCellValue(row[column.key])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {!isLoading && !filteredRows.length ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No rows match this report and date range yet.
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
