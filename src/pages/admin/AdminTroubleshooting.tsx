import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Copy, ExternalLink, FileText, KeyRound, RefreshCw, Save, Search, Wrench } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import {
  createClerkSupportLink,
  forceTeamsTranscriptSync,
  listClerkAdminUsers,
  listCompanies,
  listFeedbackSubmissions,
  syncClerkUsers,
  updateClerkUserAccess,
  updateFeedbackSubmissionStatus,
  type ClerkAdminUserRecord,
  type ClerkPortalRole,
  type CompanyRecord,
  type FeedbackStatus,
  type FeedbackSubmissionRecord,
} from "@/lib/portalApi";
import { formatDateTimeForTimeZone } from "@/lib/timezone";

const ROLE_OPTIONS: Array<{ value: ClerkPortalRole; label: string }> = [
  { value: "CLIENT", label: "Client" },
  { value: "BUM", label: "Bum" },
  { value: "ADMIN", label: "Admin" },
];

const FEEDBACK_STATUS_OPTIONS: Array<{ value: FeedbackStatus; label: string }> = [
  { value: "OPEN", label: "Open" },
  { value: "IN_REVIEW", label: "In review" },
  { value: "COMPLETE", label: "Complete" },
];

function metadataPreview(value: Record<string, unknown>) {
  const text = JSON.stringify(value, null, 2);
  return text === "{}" ? "None" : text;
}

function roleBadge(role?: string | null) {
  if (!role) return <Badge variant="outline">No role</Badge>;
  if (role === "ADMIN") return <Badge>Admin</Badge>;
  if (role === "CLIENT") return <Badge variant="secondary">Client</Badge>;
  return <Badge variant="outline">Bum</Badge>;
}

function feedbackTypeLabel(type: string) {
  if (type === "BUG") return "Bug";
  if (type === "FEATURE") return "Feature";
  if (type === "QUESTION") return "Question";
  return "Other";
}

function feedbackStatusBadge(status: FeedbackStatus) {
  if (status === "COMPLETE") return <Badge>Complete</Badge>;
  if (status === "IN_REVIEW") return <Badge variant="secondary">In review</Badge>;
  return <Badge variant="outline">Open</Badge>;
}

function FeedbackSubmissionRow({ feedback, currentUserId }: { feedback: FeedbackSubmissionRecord; currentUserId?: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const timeZone = useUserTimeZone();
  const [status, setStatus] = useState<FeedbackStatus>(feedback.status);
  const [adminNotes, setAdminNotes] = useState(feedback.admin_notes ?? "");
  const submitter = feedback.submitter_name ?? feedback.profiles?.full_name ?? feedback.submitter_email ?? feedback.profiles?.email ?? "Unknown user";

  const updateMutation = useMutation({
    mutationFn: (nextStatus: FeedbackStatus) =>
      updateFeedbackSubmissionStatus({
        id: feedback.id,
        status: nextStatus,
        adminNotes,
        completedBy: currentUserId ?? null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-feedback-submissions"] });
      toast({ title: "Feedback updated", description: "The feedback log was updated." });
    },
    onError: (error) => {
      toast({ title: "Unable to update feedback", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  return (
    <TableRow>
      <TableCell className="min-w-[180px] align-top">
        <p className="font-medium">{formatDateTimeForTimeZone(feedback.created_at, timeZone)}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant="outline">{feedbackTypeLabel(feedback.type)}</Badge>
          {feedbackStatusBadge(feedback.status)}
          {feedback.notification_error ? <Badge variant="destructive">Email warning</Badge> : null}
        </div>
      </TableCell>
      <TableCell className="min-w-[320px] align-top">
        <p className="font-medium">{feedback.title}</p>
        <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{feedback.description}</p>
        {feedback.notification_error ? <p className="mt-2 text-xs text-destructive">Email: {feedback.notification_error}</p> : null}
      </TableCell>
      <TableCell className="min-w-[220px] align-top text-sm">
        <p>{submitter}</p>
        <p className="text-muted-foreground">{feedback.submitter_email ?? feedback.profiles?.email ?? "No email"}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {roleBadge(feedback.role)}
          {feedback.companies?.name ? <Badge variant="outline">{feedback.companies.name}</Badge> : null}
        </div>
      </TableCell>
      <TableCell className="min-w-[260px] align-top">
        <a href={feedback.page_url} target="_blank" rel="noreferrer" className="inline-flex max-w-[260px] items-center gap-1 truncate text-sm font-medium text-primary hover:underline">
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{feedback.page_path}</span>
        </a>
        <p className="mt-2 break-all text-xs text-muted-foreground">{feedback.user_agent ?? "No browser details"}</p>
      </TableCell>
      <TableCell className="min-w-[260px] align-top">
        <div className="space-y-2">
          <Select value={status} onValueChange={(value) => setStatus(value as FeedbackStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FEEDBACK_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea value={adminNotes} onChange={(event) => setAdminNotes(event.target.value)} placeholder="Admin notes" rows={3} />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => updateMutation.mutate(status)} disabled={updateMutation.isPending}>
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
            <Button size="sm" onClick={() => { setStatus("COMPLETE"); updateMutation.mutate("COMPLETE"); }} disabled={updateMutation.isPending || feedback.status === "COMPLETE"}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Complete
            </Button>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

function ClerkUserRow({ user, companies }: { user: ClerkAdminUserRecord; companies: CompanyRecord[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const timeZone = useUserTimeZone();
  const initialRole = user.metadata.role ?? (user.profile?.role as ClerkPortalRole | null) ?? "BUM";
  const initialCompanyId = user.metadata.companyId ?? user.profile?.companyId ?? "none";
  const [role, setRole] = useState<ClerkPortalRole>(initialRole);
  const [companyId, setCompanyId] = useState(initialCompanyId);
  const [companyName, setCompanyName] = useState(user.metadata.companyName ?? "");
  const [supportLink, setSupportLink] = useState("");

  const selectedCompany = companies.find((company) => company.id === companyId);
  const canSave = Boolean(user.id && (role !== "CLIENT" || companyId !== "none" || companyName.trim()));

  const updateAccessMutation = useMutation({
    mutationFn: () =>
      updateClerkUserAccess({
        userId: user.id!,
        role,
        companyId: role === "CLIENT" && companyId !== "none" ? companyId : null,
        companyName: role === "CLIENT" ? selectedCompany?.name ?? companyName : null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-clerk-users"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      toast({ title: "Clerk metadata updated", description: "The portal profile was synced from the new access settings." });
    },
    onError: (error) => {
      toast({ title: "Unable to update Clerk user", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const syncMutation = useMutation({
    mutationFn: () => syncClerkUsers({ userIds: user.id ? [user.id] : [], limit: 1 }),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-clerk-users"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      const skipped = result.skipped[0];
      toast({
        title: skipped ? "Clerk user skipped" : "Clerk user synced",
        description: skipped ? skipped.reason : "The Supabase profile now reflects Clerk metadata.",
        variant: skipped ? "destructive" : "default",
      });
    },
    onError: (error) => {
      toast({ title: "Unable to sync Clerk user", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const supportLinkMutation = useMutation({
    mutationFn: () => createClerkSupportLink({ userId: user.id!, expiresInSeconds: 1800 }),
    onSuccess: async (result) => {
      const link = result.url ?? "";
      setSupportLink(link);
      if (link && navigator.clipboard) {
        await navigator.clipboard.writeText(link).catch(() => undefined);
      }
      toast({ title: "Support link created", description: link ? "The link was copied when browser permissions allowed it." : "Clerk did not return a support link." });
    },
    onError: (error) => {
      toast({ title: "Unable to create support link", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  return (
    <TableRow>
      <TableCell className="min-w-[260px] align-top">
        <div className="space-y-1">
          <p className="font-medium">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email || "No email"}</p>
          <p className="break-all text-xs text-muted-foreground">{user.id}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {roleBadge(user.metadata.role)}
            {user.profile ? roleBadge(user.profile.role) : <Badge variant="outline">No Supabase profile</Badge>}
          </div>
        </div>
      </TableCell>
      <TableCell className="min-w-[220px] align-top text-sm">
        <p>{user.profile?.companyName ?? user.metadata.companyName ?? "No client linked"}</p>
        <p className="mt-1 text-xs text-muted-foreground">Last sign-in: {user.lastSignInAt ? formatDateTimeForTimeZone(user.lastSignInAt, timeZone) : "Never"}</p>
      </TableCell>
      <TableCell className="min-w-[340px] align-top">
        <div className="grid gap-3 md:grid-cols-[130px_minmax(170px,1fr)]">
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as ClerkPortalRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Existing client</Label>
            <Select value={companyId} onValueChange={setCompanyId} disabled={role !== "CLIENT"}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <Label>New client from metadata</Label>
          <Input value={companyName} onChange={(event) => setCompanyName(event.target.value)} disabled={role !== "CLIENT" || companyId !== "none"} placeholder="Company name" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => updateAccessMutation.mutate()} disabled={!canSave || updateAccessMutation.isPending}>
            <Save className="mr-2 h-4 w-4" /> Save access
          </Button>
          <Button size="sm" variant="outline" onClick={() => syncMutation.mutate()} disabled={!user.id || syncMutation.isPending}>
            <RefreshCw className={`mr-2 h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`} /> Sync metadata
          </Button>
          <Button size="sm" variant="outline" onClick={() => supportLinkMutation.mutate()} disabled={!user.id || supportLinkMutation.isPending}>
            <KeyRound className="mr-2 h-4 w-4" /> Support link
          </Button>
        </div>
        {supportLink ? (
          <div className="mt-3 flex gap-2">
            <Input value={supportLink} readOnly className="font-mono text-xs" />
            <Button type="button" size="icon" variant="outline" onClick={() => navigator.clipboard?.writeText(supportLink)} aria-label="Copy support link">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </TableCell>
      <TableCell className="min-w-[280px] align-top">
        <details className="text-xs">
          <summary className="cursor-pointer text-sm font-medium">Metadata</summary>
          <pre className="mt-2 max-h-56 overflow-auto rounded-md bg-muted p-3 text-[11px] leading-relaxed">{metadataPreview(user.publicMetadata)}</pre>
          <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-muted/60 p-3 text-[11px] leading-relaxed">{metadataPreview(user.unsafeMetadata)}</pre>
        </details>
      </TableCell>
    </TableRow>
  );
}

export default function AdminTroubleshooting() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [transcriptSyncSummary, setTranscriptSyncSummary] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const companiesQuery = useQuery({ queryKey: ["admin-companies"], queryFn: () => listCompanies({ includeInactive: true }) });
  const clerkUsersQuery = useQuery({
    queryKey: ["admin-clerk-users", submittedQuery],
    queryFn: () => listClerkAdminUsers({ query: submittedQuery || undefined, limit: 50 }),
  });
  const feedbackQuery = useQuery({ queryKey: ["admin-feedback-submissions"], queryFn: listFeedbackSubmissions });

  const companies = useMemo(() => (companiesQuery.data ?? []).filter((company) => company.relationship_stage !== "INACTIVE"), [companiesQuery.data]);
  const users = clerkUsersQuery.data ?? [];
  const feedbackItems = feedbackQuery.data ?? [];

  const forceTranscriptSyncMutation = useMutation({
    mutationFn: () => forceTeamsTranscriptSync(10),
    onSuccess: async (result) => {
      const summary = `Checked ${result.checked}. Saved ${result.saved}. Pending ${result.pending}. Failed ${result.failed}.`;
      setTranscriptSyncSummary(summary);
      await queryClient.invalidateQueries({ queryKey: ["meeting-transcripts"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-teams-meetings"] });
      toast({
        title: result.failed ? "Transcript sync completed with failures" : "Transcript sync forced",
        description: summary,
        variant: result.failed ? "destructive" : "default",
        duration: 20000,
      });
    },
    onError: (error) => {
      setTranscriptSyncSummary(null);
      toast({ title: "Unable to force transcript sync", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive", duration: 20000 });
    },
  });

  const syncRecentMutation = useMutation({
    mutationFn: () => syncClerkUsers({ query: submittedQuery || undefined, limit: 50 }),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-clerk-users"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      toast({ title: "Clerk users synced", description: `Synced ${result.synced.length}. ${result.skipped.length} skipped.` });
    },
    onError: (error) => {
      toast({ title: "Unable to sync Clerk users", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  return (
    <div>
      <PageHeader title="Troubleshooting Tools" description="Repair Clerk metadata, Supabase profiles, and client account links.">
        <Button variant="outline" onClick={() => { void clerkUsersQuery.refetch(); void feedbackQuery.refetch(); }} disabled={clerkUsersQuery.isFetching || feedbackQuery.isFetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${clerkUsersQuery.isFetching || feedbackQuery.isFetching ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </PageHeader>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2"><Wrench className="h-5 w-5 text-primary" /> Tools</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Teams transcript sync</p>
            <p className="text-sm text-muted-foreground">Run the transcript importer now instead of waiting for the scheduled cron.</p>
            {transcriptSyncSummary ? <p className="mt-1 text-xs text-muted-foreground">Last run: {transcriptSyncSummary}</p> : null}
          </div>
          <Button variant="outline" onClick={() => forceTranscriptSyncMutation.mutate()} disabled={forceTranscriptSyncMutation.isPending}>
            <FileText className={`mr-2 h-4 w-4 ${forceTranscriptSyncMutation.isPending ? "animate-pulse" : ""}`} />
            Force Transcript Sync
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Feedback log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbackItems.map((feedback) => (
                  <FeedbackSubmissionRow key={feedback.id} feedback={feedback} currentUserId={user?.id} />
                ))}
              </TableBody>
            </Table>
          </div>
          {feedbackQuery.isLoading ? <p className="mt-3 text-sm text-muted-foreground">Loading feedback submissions...</p> : null}
          {!feedbackQuery.isLoading && !feedbackItems.length ? <p className="mt-3 text-sm text-muted-foreground">No feedback has been submitted yet.</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2"><Wrench className="h-5 w-5 text-primary" /> Clerk users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
            <div className="relative min-w-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Clerk users" className="pl-9" />
            </div>
            <Button onClick={() => setSubmittedQuery(query.trim())}>Search</Button>
            <Button variant="outline" onClick={() => syncRecentMutation.mutate()} disabled={syncRecentMutation.isPending}>
              <RefreshCw className={`mr-2 h-4 w-4 ${syncRecentMutation.isPending ? "animate-spin" : ""}`} /> Sync Clerk users
            </Button>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Portal match</TableHead>
                  <TableHead>Access tools</TableHead>
                  <TableHead>Clerk metadata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <ClerkUserRow key={user.id ?? user.email} user={user} companies={companies} />
                ))}
              </TableBody>
            </Table>
          </div>

          {clerkUsersQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading Clerk users...</p> : null}
          {!clerkUsersQuery.isLoading && !users.length ? <p className="text-sm text-muted-foreground">No Clerk users found.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
