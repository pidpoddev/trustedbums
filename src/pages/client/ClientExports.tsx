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
import { listCustomerPaymentReports, listCustomerTargets, listTeamsMeetings, type TeamsMeetingAttendee } from "@/lib/portalApi";

type CsvRow = Record<string, string | number | null | undefined>;
type ExportRange = "ALL" | "LAST_30" | "LAST_90";

function csvValue(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}

function formatMeetingAttendee(attendee: TeamsMeetingAttendee) {
  const label = attendee.name ? attendee.name + " <" + attendee.email + ">" : attendee.email;
  return attendee.response && attendee.response !== "none" ? label + " (" + attendee.response + ")" : label;
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

function isWithinRange(dateValue: string | null | undefined, range: ExportRange) {
  if (range === "ALL" || !dateValue) {
    return true;
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return true;
  }

  const days = range === "LAST_30" ? 30 : 90;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}

export default function ClientExports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exportRange, setExportRange] = useState<ExportRange>("ALL");
  const targetsQuery = useQuery({
    queryKey: ["client-export-targets", user?.clientId],
    queryFn: () => listCustomerTargets(user),
    enabled: Boolean(user),
  });
  const meetingsQuery = useQuery({
    queryKey: ["client-export-meetings", user?.clientId],
    queryFn: listTeamsMeetings,
    enabled: Boolean(user),
  });
  const outcomesQuery = useQuery({
    queryKey: ["client-export-outcomes", user?.clientId],
    queryFn: () => listCustomerPaymentReports(user),
    enabled: Boolean(user),
  });

  const targetRows = useMemo(
    () =>
      (targetsQuery.data ?? [])
        .filter((target) => isWithinRange(target.created_at, exportRange))
        .map((target) => ({
          target_account: target.target_account_name,
          status: target.status,
          priority: target.priority,
          key_contact: target.key_contact_name,
          key_contact_email: target.key_contact_email,
          expected_product_service: target.expected_product_service,
          estimated_deal_value: target.estimated_deal_value,
          created_at: target.created_at,
        })),
    [exportRange, targetsQuery.data],
  );

  const meetingRows = useMemo(
    () =>
      (meetingsQuery.data ?? [])
        .filter((meeting) => isWithinRange(meeting.start_time, exportRange))
        .map((meeting) => ({
          subject: meeting.subject,
          status: meeting.status,
          target_account: meeting.customer_targets?.target_account_name,
          start_time: meeting.start_time,
          end_time: meeting.end_time,
          attendees: meeting.attendees.map(formatMeetingAttendee).join("; "),
          teams_join_url: meeting.teams_join_url,
          transcript_sync_status: meeting.transcript_sync_status,
        })),
    [exportRange, meetingsQuery.data],
  );

  const paymentRows = useMemo(
    () =>
      (outcomesQuery.data ?? [])
        .filter((report) => isWithinRange(report.customer_payment_received_at ?? report.created_at, exportRange))
        .map((report) => ({
          customer_name: report.customer_name,
          opportunity: report.opportunity_registrations?.target_account_name,
          status: report.status,
          gross_revenue: report.gross_amount,
          commissionable_revenue: report.commissionable_amount,
          non_commissionable_amount: report.excluded_amount,
          customer_payment_received_at: report.customer_payment_received_at,
          created_at: report.created_at,
        })),
    [exportRange, outcomesQuery.data],
  );

  const isLoading = targetsQuery.isLoading || meetingsQuery.isLoading || outcomesQuery.isLoading;

  const exportFile = (filename: string, rows: CsvRow[]) => {
    if (!rows.length) {
      toast({ title: "No rows to export", description: "No records match this export and date range." });
      return;
    }

    downloadCsv(filename, rows);
  };

  const exportCards = [
    {
      title: "Target accounts",
      description: "Customer accounts, priority, status, contacts, product context, and estimated value.",
      filename: "trustedbums-target-accounts.csv",
      rows: targetRows,
      action: "Export target accounts",
    },
    {
      title: "Meetings and transcripts",
      description: "Teams meeting subjects, times, attendees, related accounts, and transcript sync status.",
      filename: "trustedbums-meetings.csv",
      rows: meetingRows,
      action: "Export meetings",
    },
    {
      title: "Customer payments",
      description: "Recorded payments, commissionable revenue, non-commissionable amounts, and invoice status.",
      filename: "trustedbums-customer-payments.csv",
      rows: paymentRows,
      action: "Export payments",
    },
  ];

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
