import type {
  CustomerPaymentReportRecord,
  CustomerTargetRecord,
  TeamsMeetingAttendee,
  TeamsMeetingRecord,
} from "@/lib/portalApi";

export type CsvRow = Record<string, string | number | null | undefined>;
export type ExportRange = "ALL" | "LAST_30" | "LAST_90";

type ClientExportUser = { clientAccessRole?: string | null } | null | undefined;

export interface ExportCardDefinition {
  title: string;
  description: string;
  filename: string;
  rows: CsvRow[];
  action: string;
}

function formatMeetingAttendee(attendee: TeamsMeetingAttendee) {
  const label = typeof attendee === "string" ? attendee : attendee.name ? attendee.name + " <" + attendee.email + ">" : attendee.email;
  const response = typeof attendee === "string" ? null : attendee.response;
  return response && response !== "none" ? label + " (" + response + ")" : label;
}

export function isWithinRange(dateValue: string | null | undefined, range: ExportRange) {
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

export function canExportClientOperationalData(user: ClientExportUser) {
  return user?.clientAccessRole === "CLIENT_ADMIN";
}

export function buildTargetExportRows(targets: CustomerTargetRecord[], exportRange: ExportRange) {
  return targets
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
    }));
}

export function buildMeetingExportRows(meetings: TeamsMeetingRecord[], exportRange: ExportRange) {
  return meetings
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
    }));
}

export function buildPaymentExportRows(reports: CustomerPaymentReportRecord[], exportRange: ExportRange) {
  return reports
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
    }));
}

export function buildClientExportCards(input: {
  user: ClientExportUser;
  targetRows: CsvRow[];
  meetingRows: CsvRow[];
  paymentRows: CsvRow[];
}): ExportCardDefinition[] {
  return [
    ...(canExportClientOperationalData(input.user)
      ? [
          {
            title: "Target accounts",
            description: "Customer accounts, priority, status, contacts, product context, and estimated value.",
            filename: "trustedbums-target-accounts.csv",
            rows: input.targetRows,
            action: "Export target accounts",
          },
          {
            title: "Meetings and transcripts",
            description: "Teams meeting subjects, times, attendees, related accounts, and transcript sync status.",
            filename: "trustedbums-meetings.csv",
            rows: input.meetingRows,
            action: "Export meetings",
          },
        ]
      : []),
    {
      title: "Customer payments",
      description: "Recorded payments, commissionable revenue, non-commissionable amounts, and invoice status.",
      filename: "trustedbums-customer-payments.csv",
      rows: input.paymentRows,
      action: "Export payments",
    },
  ];
}
