import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { listCustomerPaymentReports, listCustomerTargets, listTeamsMeetings } from "@/lib/portalApi";
import {
  buildClientExportCards,
  buildMeetingExportRows,
  buildPaymentExportRows,
  buildTargetExportRows,
  canExportClientOperationalData,
  type CsvRow,
  type ExportRange,
} from "./clientExportsModel";

function csvValue(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}

function downloadCsv(filename: string, rows: CsvRow[]) {
  const headers = Object.keys(rows[0] ?? {});
  const csv = [
    headers.map(csvValue).join(","),
    ...rows.map((row) => headers.map((header) => csvValue(row[header])).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

export default function ClientExports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exportRange, setExportRange] = useState<ExportRange>("ALL");
  const canExportOperationalData = canExportClientOperationalData(user);
  const targetsQuery = useQuery({
    queryKey: ["client-export-targets", user?.clientId],
    queryFn: () => listCustomerTargets(user),
    enabled: Boolean(user && canExportOperationalData),
  });
  const meetingsQuery = useQuery({
    queryKey: ["client-export-meetings", user?.clientId],
    queryFn: listTeamsMeetings,
    enabled: Boolean(user && canExportOperationalData),
  });
  const outcomesQuery = useQuery({
    queryKey: ["client-export-outcomes", user?.clientId],
    queryFn: () => listCustomerPaymentReports(user),
    enabled: Boolean(user),
  });

  const targetRows = useMemo(
    () => buildTargetExportRows(targetsQuery.data ?? [], exportRange),
    [exportRange, targetsQuery.data],
  );

  const meetingRows = useMemo(
    () => buildMeetingExportRows(meetingsQuery.data ?? [], exportRange),
    [exportRange, meetingsQuery.data],
  );

  const paymentRows = useMemo(
    () => buildPaymentExportRows(outcomesQuery.data ?? [], exportRange),
    [exportRange, outcomesQuery.data],
  );

  const isLoading = (canExportOperationalData && (targetsQuery.isLoading || meetingsQuery.isLoading)) || outcomesQuery.isLoading;

  const exportFile = (filename: string, rows: CsvRow[]) => {
    if (!rows.length) {
      toast({ title: "No rows to export", description: "No records match this export and date range." });
      return;
    }

    downloadCsv(filename, rows);
  };

  const exportCards = buildClientExportCards({ user, targetRows, meetingRows, paymentRows });

  return (
    <div className="space-y-6">
      <PageHeader title="Exports" description="Download client portal records as CSV files for finance review, reporting, and internal handoff." />

      <Card>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-[1fr_260px] md:items-end">
          <div>
            <p className="font-medium">Export range</p>
            <p className="mt-1 text-sm text-muted-foreground">The selected range applies to all CSV exports on this page.</p>
          </div>
          <div className="space-y-2">
            <Label>Date range</Label>
            <Select value={exportRange} onValueChange={(value: ExportRange) => setExportRange(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All records</SelectItem>
                <SelectItem value="LAST_30">Last 30 days</SelectItem>
                <SelectItem value="LAST_90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {exportCards.map((exportCard) => (
          <Card key={exportCard.title}>
            <CardHeader>
              <CardTitle className="font-display">{exportCard.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="min-h-12 text-sm text-muted-foreground">{exportCard.description}</p>
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-2xl font-bold font-display">{exportCard.rows.length}</p>
                <p className="text-xs text-muted-foreground">rows ready</p>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => exportFile(exportCard.filename, exportCard.rows)}
                disabled={isLoading}
              >
                <Download className="mr-2 h-4 w-4" /> {exportCard.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
