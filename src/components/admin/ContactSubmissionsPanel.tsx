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
  claimContactSubmission,
  escalateContactToClientTarget,
  escalateContactToProspectiveBum,
  listContactSubmissions,
  markContactBumInvited,
  updateContactSubmission,
  type ContactAdminPriority,
  type ContactQualificationStatus,
  type ContactSubmissionRecord,
  type ContactSubmissionStatus,
} from "@/lib/contactApi";
import type { CompanyRecord } from "@/lib/portalApi";
import { formatDateTimeForTimeZone } from "@/lib/timezone";

interface ContactSubmissionsPanelProps {
  companies: CompanyRecord[];
}

type ContactFilter = ContactSubmissionStatus | "ALL";
type QualificationFilter = ContactQualificationStatus | "ALL";

interface ClientEscalationForm {
  clientCompanyId: string;
  targetAccountName: string;
  expectedProductService: string;
  estimatedDealValue: string;
  notes: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

interface TriageForm {
  qualificationStatus: ContactQualificationStatus;
  adminPriority: ContactAdminPriority;
  nextAction: string;
  followUpDeadline: string;
  disqualificationReason: string;
  adminNotes: string;
}

const statusFilters: ContactFilter[] = ["ALL", "NEW", "REVIEWED", "INVITED", "ESCALATED", "REPLIED", "ARCHIVED"];
const qualificationFilters: QualificationFilter[] = ["ALL", "QUALIFIED", "NEEDS_REVIEW", "LOW_FIT", "WRONG_PATH"];
const adminPriorityOptions: ContactAdminPriority[] = ["LOW", "NORMAL", "HIGH", "URGENT"];

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

function getQualificationVariant(status: ContactQualificationStatus) {
  if (status === "QUALIFIED") return "success" as const;
  if (status === "LOW_FIT" || status === "WRONG_PATH") return "outline" as const;
  return "warning" as const;
}

function ownerLabel(ownerId: string | null, currentUserId?: string) {
  if (!ownerId) return "Unowned";
  return ownerId === currentUserId ? "Mine" : "Owned";
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
  const [qualificationFilter, setQualificationFilter] = useState<QualificationFilter>("ALL");
  const [search, setSearch] = useState("");
  const [forms, setForms] = useState<Record<string, ClientEscalationForm>>({});
  const [triageForms, setTriageForms] = useState<Record<string, TriageForm>>({});
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
      const matchesQualification =
        qualificationFilter === "ALL" || submission.qualification_status === qualificationFilter;
      const matchesSearch =
        !normalizedSearch ||
        [submission.name, submission.email, submission.interest, summarizeSubmission(submission)]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesStatus && matchesQualification && matchesSearch;
    });
  }, [qualificationFilter, search, statusFilter, submissions]);

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

  const triageMutation = useMutation({
    mutationFn: ({ submission, form }: { submission: ContactSubmissionRecord; form: TriageForm }) =>
      updateContactSubmission(user!, submission.id, {
        status: submission.status === "NEW" ? "REVIEWED" : submission.status,
        adminNotes: form.adminNotes,
        adminNextAction: form.nextAction,
        adminPriority: form.adminPriority,
        qualificationStatus: form.qualificationStatus,
        followUpDeadline: form.followUpDeadline ? new Date(form.followUpDeadline).toISOString() : null,
        disqualificationReason: form.disqualificationReason,
      }),
    onSuccess: async () => {
      await refreshAdminData();
      toast({ title: "Qualification saved", description: "Owner handoff and qualification state were updated." });
    },
    onError: (error) => {
      toast({
        title: "Unable to save qualification",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const claimMutation = useMutation({
    mutationFn: (submission: ContactSubmissionRecord) => claimContactSubmission(user!, submission.id),
    onSuccess: async () => {
      await refreshAdminData();
      toast({ title: "Submission claimed", description: "This request is now assigned to you." });
    },
    onError: (error) => {
      toast({
        title: "Unable to claim submission",
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
      toast({ title: "Bum Prospect created", description: "The contact now appears in Admin Bums for review." });
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

  const getTriageForm = (submission: ContactSubmissionRecord): TriageForm =>
    triageForms[submission.id] ?? {
      qualificationStatus: submission.qualification_status,
      adminPriority: submission.admin_priority,
      nextAction: submission.admin_next_action ?? "",
      followUpDeadline: submission.follow_up_deadline ? submission.follow_up_deadline.slice(0, 16) : "",
      disqualificationReason: submission.disqualification_reason ?? "",
      adminNotes: submission.admin_notes ?? "",
    };

  const updateTriageForm = (submission: ContactSubmissionRecord, updates: Partial<TriageForm>) => {
    setTriageForms((current) => ({
      ...current,
      [submission.id]: {
        ...getTriageForm(submission),
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
              Review homepage leads, convert Client Prospect requests into targets, and qualify Bum Prospects.
            </p>
          </div>
          <Badge variant="secondary">{submissions.length} total</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_180px_220px] md:items-end">
          <Input
            placeholder="Search contacts, emails, companies, or notes..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select value={qualificationFilter} onValueChange={(value) => setQualificationFilter(value as QualificationFilter)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {qualificationFilters.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === "ALL" ? "All qualification" : status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          const triageForm = getTriageForm(submission);
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
                    <StatusBadge
                      label={submission.qualification_status.replace("_", " ")}
                      variant={getQualificationVariant(submission.qualification_status)}
                    />
                    <Badge variant={submission.admin_owner_id ? "outline" : "secondary"}>
                      {ownerLabel(submission.admin_owner_id, user?.id)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {submission.email}
                    {submission.company_name ? ` · ${submission.company_name}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Submitted {formatDateTimeForTimeZone(submission.created_at, timeZone)}
                  </p>
                  {submission.admin_next_action || submission.follow_up_deadline ? (
                    <p className="text-xs text-muted-foreground">
                      {submission.admin_next_action ? `Next: ${submission.admin_next_action}` : "Next action missing"}
                      {submission.follow_up_deadline
                        ? ` · Due ${formatDateTimeForTimeZone(submission.follow_up_deadline, timeZone)}`
                        : ""}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-2 lg:w-[190px]">
                  <Select
                    value={submission.status}
                    onValueChange={(status) => updateMutation.mutate({ submission, status: status as ContactSubmissionStatus })}
                  >
                    <SelectTrigger>
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
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={submission.admin_owner_id === user?.id || claimMutation.isPending}
                    onClick={() => claimMutation.mutate(submission)}
                  >
                    Claim
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                <div className="space-y-3">
                  {submission.target_accounts ? (
                    <div>
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">Target accounts or buyer notes</Label>
                      <p className="mt-1 rounded-xl bg-muted/50 p-3 text-sm">{submission.target_accounts}</p>
                    </div>
                  ) : null}
                  {isClientSubmission ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        ["Buyer role", submission.buyer_role],
                        ["Target count", submission.target_account_count],
                        ["Blocker", submission.current_blocker],
                        ["Urgency", submission.urgency],
                        ["Referral source", submission.referral_source],
                      ]
                        .filter(([, value]) => Boolean(value))
                        .map(([label, value]) => (
                          <div key={label}>
                            <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
                            <p className="mt-1 rounded-xl bg-muted/50 p-3 text-sm">{String(value).replaceAll("_", " ")}</p>
                          </div>
                        ))}
                    </div>
                  ) : null}
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Message</Label>
                    <p className="mt-1 whitespace-pre-wrap rounded-xl bg-muted/50 p-3 text-sm leading-6">{submission.message}</p>
                  </div>
                  {submission.disqualification_reason ? (
                    <div>
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">Disqualification reason</Label>
                      <p className="mt-1 rounded-xl bg-muted/50 p-3 text-sm">{submission.disqualification_reason}</p>
                    </div>
                  ) : null}
                  {submission.escalated_to ? (
                    <p className="text-xs text-muted-foreground">
                      Escalated to {submission.escalated_to}
                      {submission.escalated_entity_id ? ` · ${submission.escalated_entity_id}` : ""}
                    </p>
                  ) : null}
                </div>

                <div className="rounded-2xl border bg-muted/20 p-4">
                  <div className="mb-5 space-y-4 rounded-2xl border bg-card p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Qualification</Label>
                        <Select
                          value={triageForm.qualificationStatus}
                          onValueChange={(qualificationStatus) =>
                            updateTriageForm(submission, {
                              qualificationStatus: qualificationStatus as ContactQualificationStatus,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {qualificationFilters
                              .filter((status) => status !== "ALL")
                              .map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status.replace("_", " ")}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select
                          value={triageForm.adminPriority}
                          onValueChange={(adminPriority) =>
                            updateTriageForm(submission, { adminPriority: adminPriority as ContactAdminPriority })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {adminPriorityOptions.map((priority) => (
                              <SelectItem key={priority} value={priority}>
                                {priority}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Next action</Label>
                      <Input
                        value={triageForm.nextAction}
                        onChange={(event) => updateTriageForm(submission, { nextAction: event.target.value })}
                        placeholder="Founder review, schedule strategy call, request details..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Follow-up deadline</Label>
                      <Input
                        type="datetime-local"
                        value={triageForm.followUpDeadline}
                        onChange={(event) => updateTriageForm(submission, { followUpDeadline: event.target.value })}
                      />
                    </div>
                    {triageForm.qualificationStatus === "LOW_FIT" || triageForm.qualificationStatus === "WRONG_PATH" ? (
                      <div className="space-y-2">
                        <Label>Disqualification reason</Label>
                        <Input
                          value={triageForm.disqualificationReason}
                          onChange={(event) =>
                            updateTriageForm(submission, { disqualificationReason: event.target.value })
                          }
                          placeholder="Broad lead volume, wrong path, vendor inquiry..."
                        />
                      </div>
                    ) : null}
                    <div className="space-y-2">
                      <Label>Admin notes</Label>
                      <Textarea
                        value={triageForm.adminNotes}
                        onChange={(event) => updateTriageForm(submission, { adminNotes: event.target.value })}
                        placeholder="Internal qualification notes"
                      />
                    </div>
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled={!triageForm.nextAction.trim() || triageMutation.isPending}
                      onClick={() => triageMutation.mutate({ submission, form: triageForm })}
                    >
                      Save Qualification
                    </Button>
                  </div>

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
                        disabled={
                          submission.qualification_status !== "QUALIFIED" ||
                          !form.clientCompanyId ||
                          !form.targetAccountName.trim() ||
                          clientTargetMutation.isPending
                        }
                        onClick={() => clientTargetMutation.mutate({ submission, form })}
                      >
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        Create Client Target
                      </Button>
                      {submission.qualification_status !== "QUALIFIED" ? (
                        <p className="text-xs text-muted-foreground">
                          Mark this strategy request qualified before creating a Client Target.
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {isBumSubmission ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Create a hidden Bum Prospect profile for admin review, or mark that you invited this person to sign up.
                      </p>
                      <Button
                        className="w-full"
                        disabled={bumProfileMutation.isPending}
                        onClick={() => bumProfileMutation.mutate(submission)}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Bum Prospect
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
