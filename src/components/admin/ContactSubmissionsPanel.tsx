import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, CheckCircle2, MailPlus, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import {
  escalateContactToClientTarget,
  escalateContactToProspectiveBum,
  listContactSubmissions,
  markContactBumInvited,
  updateContactSubmission,
  type ContactSubmissionRecord,
  type ContactSubmissionStatus,
} from "@/lib/contactApi";
import type { CompanyRecord } from "@/lib/portalApi";
import { formatDateTimeForTimeZone } from "@/lib/timezone";

interface ContactSubmissionsPanelProps {
  companies: CompanyRecord[];
}

type ContactFilter = ContactSubmissionStatus | "ALL";

interface ClientEscalationForm {
  clientCompanyId: string;
  targetAccountName: string;
  expectedProductService: string;
  estimatedDealValue: string;
  notes: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

const statusFilters: ContactFilter[] = ["ALL", "NEW", "REVIEWED", "INVITED", "ESCALATED", "REPLIED", "ARCHIVED"];

function getContactStatusVariant(status: ContactSubmissionStatus) {
  if (status === "ESCALATED") {
    return "success" as const;
  }
  if (status === "INVITED" || status === "REPLIED") {
    return "info" as const;
  }
  if (status === "ARCHIVED") {
    return "outline" as const;
  }
  return "warning" as const;
}

function summarizeSubmission(submission: ContactSubmissionRecord) {
  return [submission.company_name, submission.target_accounts, submission.message].filter(Boolean).join(" ");
}

function defaultTargetName(submission: ContactSubmissionRecord) {
  return (
    submission.target_accounts
      ?.split(/[\n,;]+/)
      .map((item) => item.trim())
      .find(Boolean) ||
    submission.company_name ||
    ""
  );
}

export function ContactSubmissionsPanel({ companies }: ContactSubmissionsPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const timeZone = useUserTimeZone();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ContactFilter>("ALL");
  const [search, setSearch] = useState("");
  const [forms, setForms] = useState<Record<string, ClientEscalationForm>>({});
  const [inviteNotes, setInviteNotes] = useState<Record<string, string>>({});

  const submissionsQuery = useQuery({
    queryKey: ["admin-contact-submissions"],
    queryFn: listContactSubmissions,
  });

  const clientCompanies = useMemo(
    () =>
      companies
        .filter((company) => company.relationship_stage === "CLIENT")
        .sort((left, right) => left.name.localeCompare(right.name)),
    [companies],
  );

  const submissions = useMemo(() => submissionsQuery.data ?? [], [submissionsQuery.data]);
  const filteredSubmissions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return submissions.filter((submission) => {
      const matchesStatus = statusFilter === "ALL" || submission.status === statusFilter;
      const matchesSearch =
        !normalizedSearch ||
        [submission.name, submission.email, submission.interest, summarizeSubmission(submission)]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter, submissions]);

  const refreshAdminData = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-contact-submissions"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-customer-targets"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-bum-profiles"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-audit-events"] });
  };

  const updateMutation = useMutation({
    mutationFn: ({ submission, status }: { submission: ContactSubmissionRecord; status: ContactSubmissionStatus }) =>
      updateContactSubmission(user!, submission.id, {
        status,
        adminNotes: submission.admin_notes ?? undefined,
      }),
    onSuccess: async () => {
      await refreshAdminData();
      toast({ title: "Contact updated", description: "The submission status was saved." });
    },
    onError: (error) => {
      toast({
        title: "Unable to update contact",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const clientTargetMutation = useMutation({
    mutationFn: ({ submission, form }: { submission: ContactSubmissionRecord; form: ClientEscalationForm }) =>
      escalateContactToClientTarget(user!, submission, {
        clientCompanyId: form.clientCompanyId,
        targetAccountName: form.targetAccountName,
        priority: form.priority,
        expectedProductService: form.expectedProductService,
        estimatedDealValue: form.estimatedDealValue ? Number(form.estimatedDealValue) : null,
        notes: form.notes,
      }),
    onSuccess: async () => {
      await refreshAdminData();
      toast({ title: "Client target created", description: "The contact submission is now linked to a client target." });
    },
    onError: (error) => {
      toast({
        title: "Unable to create client target",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const bumProfileMutation = useMutation({
    mutationFn: (submission: ContactSubmissionRecord) => escalateContactToProspectiveBum(user!, submission),
    onSuccess: async () => {
      await refreshAdminData();
      toast({ title: "Prospective Bum created", description: "The contact now appears in Admin Bums for review." });
    },
    onError: (error) => {
      toast({
        title: "Unable to create Bum",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (submission: ContactSubmissionRecord) =>
      markContactBumInvited(user!, submission, inviteNotes[submission.id]),
    onSuccess: async () => {
      await refreshAdminData();
      toast({ title: "Invite follow-up marked", description: "The contact submission was marked as invited." });
    },
    onError: (error) => {
      toast({
        title: "Unable to mark invite",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const getForm = (submission: ContactSubmissionRecord): ClientEscalationForm => {
    const fallbackClientCompanyId = clientCompanies[0]?.id ?? companies[0]?.id ?? "";

    return (
      forms[submission.id] ?? {
        clientCompanyId: fallbackClientCompanyId,
        targetAccountName: defaultTargetName(submission),
        expectedProductService: "",
        estimatedDealValue: "",
        notes: "",
        priority: "MEDIUM",
      }
    );
  };

  const updateForm = (submission: ContactSubmissionRecord, updates: Partial<ClientEscalationForm>) => {
    setForms((current) => ({
      ...current,
      [submission.id]: {
        ...getForm(submission),
        ...updates,
      },
    }));
  };

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="font-display">Contact Submissions</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Review homepage leads, convert client requests into targets, and qualify future Bums.
            </p>
          </div>
          <Badge variant="secondary">{submissions.length} total</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_220px] md:items-end">
          <Input
            placeholder="Search contacts, emails, companies, or notes..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ContactFilter)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusFilters.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === "ALL" ? "All statuses" : status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {submissionsQuery.isLoading ? (
          <div className="rounded-xl border p-4 text-sm text-muted-foreground">Loading contact submissions...</div>
        ) : null}

        {submissionsQuery.isError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            Unable to load contact submissions from Supabase.
          </div>
        ) : null}

        {!submissionsQuery.isLoading && !submissionsQuery.isError && !filteredSubmissions.length ? (
          <div className="rounded-xl border p-4 text-sm text-muted-foreground">
            {submissions.length ? "No submissions match your current filters." : "No contact submissions yet."}
          </div>
        ) : null}

        {filteredSubmissions.map((submission) => {
          const form = getForm(submission);
          const isClientSubmission = submission.interest === "CLIENT";
          const isBumSubmission = submission.interest === "BUM";

          return (
            <div key={submission.id} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-xl font-bold">{submission.name}</p>
                    <Badge variant="outline">{submission.interest}</Badge>
                    <StatusBadge label={submission.status} variant={getContactStatusVariant(submission.status)} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {submission.email}
                    {submission.company_name ? ` · ${submission.company_name}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Submitted {formatDateTimeForTimeZone(submission.created_at, timeZone)}
                  </p>
                </div>
                <Select
                  value={submission.status}
                  onValueChange={(status) => updateMutation.mutate({ submission, status: status as ContactSubmissionStatus })}
                >
                  <SelectTrigger className="w-full lg:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusFilters
                      .filter((status) => status !== "ALL")
                      .map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                <div className="space-y-3">
                  {submission.target_accounts ? (
                    <div>
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">Target accounts or buyer notes</Label>
                      <p className="mt-1 rounded-xl bg-muted/50 p-3 text-sm">{submission.target_accounts}</p>
                    </div>
                  ) : null}
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Message</Label>
                    <p className="mt-1 whitespace-pre-wrap rounded-xl bg-muted/50 p-3 text-sm leading-6">{submission.message}</p>
                  </div>
                  {submission.escalated_to ? (
                    <p className="text-xs text-muted-foreground">
                      Escalated to {submission.escalated_to}
                      {submission.escalated_entity_id ? ` · ${submission.escalated_entity_id}` : ""}
                    </p>
                  ) : null}
                </div>

                <div className="rounded-2xl border bg-muted/20 p-4">
                  {isClientSubmission ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Client company</Label>
                        <Select
                          value={form.clientCompanyId}
                          onValueChange={(clientCompanyId) => updateForm(submission, { clientCompanyId })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose client" />
                          </SelectTrigger>
                          <SelectContent>
                            {(clientCompanies.length ? clientCompanies : companies).map((company) => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Target account</Label>
                        <Input
                          value={form.targetAccountName}
                          onChange={(event) => updateForm(submission, { targetAccountName: event.target.value })}
                          placeholder="Company or account to target"
                        />
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Select value={form.priority} onValueChange={(priority) => updateForm(submission, { priority: priority as ClientEscalationForm["priority"] })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LOW">Low</SelectItem>
                              <SelectItem value="MEDIUM">Medium</SelectItem>
                              <SelectItem value="HIGH">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Estimated value</Label>
                          <Input
                            type="number"
                            value={form.estimatedDealValue}
                            onChange={(event) => updateForm(submission, { estimatedDealValue: event.target.value })}
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Product or service</Label>
                        <Input
                          value={form.expectedProductService}
                          onChange={(event) => updateForm(submission, { expectedProductService: event.target.value })}
                          placeholder="Optional context"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Admin notes</Label>
                        <Textarea
                          value={form.notes}
                          onChange={(event) => updateForm(submission, { notes: event.target.value })}
                          placeholder="Internal notes for this escalation"
                        />
                      </div>
                      <Button
                        className="w-full"
                        disabled={!form.clientCompanyId || !form.targetAccountName.trim() || clientTargetMutation.isPending}
                        onClick={() => clientTargetMutation.mutate({ submission, form })}
                      >
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        Create Client Target
                      </Button>
                    </div>
                  ) : null}

                  {isBumSubmission ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Create a hidden prospective Bum profile for admin review, or mark that you invited this person to sign up.
                      </p>
                      <Button
                        className="w-full"
                        disabled={bumProfileMutation.isPending}
                        onClick={() => bumProfileMutation.mutate(submission)}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Prospective Bum
                      </Button>
                      <div className="space-y-2">
                        <Label>Invite notes</Label>
                        <Textarea
                          value={inviteNotes[submission.id] ?? ""}
                          onChange={(event) =>
                            setInviteNotes((current) => ({ ...current, [submission.id]: event.target.value }))
                          }
                          placeholder="Optional note, e.g. invited via Clerk or direct follow-up"
                        />
                      </div>
                      <Button
                        className="w-full"
                        variant="outline"
                        disabled={inviteMutation.isPending}
                        onClick={() => inviteMutation.mutate(submission)}
                      >
                        <MailPlus className="mr-2 h-4 w-4" />
                        Mark Bum Invited
                      </Button>
                    </div>
                  ) : null}

                  {!isClientSubmission && !isBumSubmission ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        General inquiry. Mark it reviewed once someone has followed up.
                      </p>
                      <Button
                        className="w-full"
                        variant="outline"
                        disabled={updateMutation.isPending}
                        onClick={() => updateMutation.mutate({ submission, status: "REVIEWED" })}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark Reviewed
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
