import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { listCustomerPaymentReports, listCustomerTargets, listTeamsMeetings, type TeamsMeetingAttendee } from "@/lib/portalApi";
import { Download } from "lucide-react";

type CsvRow = Record<string, string | number | null | undefined>;

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

export default function ClientExports() {
  const { user } = useAuth();
  const { toast } = useToast();
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

  const exportFile = (filename: string, rows: CsvRow[]) => {
    if (!rows.length) {
      toast({ title: "No rows to export", description: "The live database query returned no records for this export." });
      return;
    }

    downloadCsv(filename, rows);
  };

  const exportTargets = () => {
    exportFile(
      "trustedbums-intros.csv",
      (targetsQuery.data ?? []).map((target) => ({
        target_account: target.target_account_name,
        status: target.status,
        priority: target.priority,
        key_contact: target.key_contact_name,
        key_contact_email: target.key_contact_email,
        expected_product_service: target.expected_product_service,
        estimated_deal_value: target.estimated_deal_value,
        created_at: target.created_at,
      })),
    );
  };

  const exportMeetings = () => {
    exportFile(
      "trustedbums-meetings.csv",
      (meetingsQuery.data ?? []).map((meeting) => ({
        subject: meeting.subject,
        status: meeting.status,
        target_account: meeting.customer_targets?.target_account_name,
        start_time: meeting.start_time,
        end_time: meeting.end_time,
        attendees: meeting.attendees.map(formatMeetingAttendee).join("; "),
        teams_join_url: meeting.teams_join_url,
        transcript_sync_status: meeting.transcript_sync_status,
      })),
    );
  };

  const exportOutcomes = () => {
    exportFile(
      "trustedbums-outcomes.csv",
      (outcomesQuery.data ?? []).map((report) => ({
        customer_name: report.customer_name,
        opportunity: report.opportunity_registrations?.target_account_name,
        status: report.status,
        gross_amount: report.gross_amount,
        commissionable_amount: report.commissionable_amount,
        excluded_amount: report.excluded_amount,
        customer_payment_received_at: report.customer_payment_received_at,
        created_at: report.created_at,
      })),
    );
  };

  const isLoading = targetsQuery.isLoading || meetingsQuery.isLoading || outcomesQuery.isLoading;

  return (
    <div>
      <PageHeader title="Exports" description="Export live client portal records from Supabase." />

      <div className="max-w-xl">
        <Card>
          <CardHeader><CardTitle className="font-display">Export Data</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" onClick={exportTargets} disabled={isLoading}>
              <Download className="h-4 w-4 mr-2" /> Export Intros (CSV)
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={exportMeetings} disabled={isLoading}>
              <Download className="h-4 w-4 mr-2" /> Export Meetings (CSV)
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={exportOutcomes} disabled={isLoading}>
              <Download className="h-4 w-4 mr-2" /> Export Outcomes (CSV)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
