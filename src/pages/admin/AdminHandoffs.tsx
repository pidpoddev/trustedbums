import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, Handshake, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { claimContactSubmission, listContactSubmissions, updateContactSubmission, type ContactSubmissionRecord, type ContactSubmissionStatus } from "@/lib/contactApi";
import {
  claimClientBumIntroRequest,
  claimCustomerTargetResponse,
  listClientBumIntroRequests,
  listCustomerTargetResponses,
  updateClientBumIntroRequestStatus,
  updateCustomerTargetResponseStatus,
  type ClientBumIntroRequestRecord,
  type ClientBumIntroRequestStatus,
  type CustomerTargetResponseRecord,
} from "@/lib/portalApi";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import { formatDateTimeForTimeZone } from "@/lib/timezone";

type HandoffFilter = "OPEN" | "UNOWNED" | "ALL";
type TargetResponseStatus = CustomerTargetResponseRecord["status"];

const contactStatuses: ContactSubmissionStatus[] = ["NEW", "REVIEWED", "INVITED", "REPLIED", "ESCALATED", "ARCHIVED"];
const targetResponseStatuses: TargetResponseStatus[] = ["PROPOSED", "CONTACTED", "MEETING_SET", "ACCEPTED", "DECLINED"];
const introRequestStatuses: ClientBumIntroRequestStatus[] = ["SUBMITTED", "IN_REVIEW", "INTRO_REQUESTED", "CLOSED"];
const openContactStatuses = new Set<ContactSubmissionStatus>(["NEW", "REVIEWED"]);
const openTargetResponseStatuses = new Set<TargetResponseStatus>(["PROPOSED", "CONTACTED"]);
const openIntroRequestStatuses = new Set<ClientBumIntroRequestStatus>(["SUBMITTED", "IN_REVIEW", "INTRO_REQUESTED"]);

function ageInDays(createdAt: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000));
}

function ownerLabel(ownerId: string | null, currentUserId?: string) {
  if (!ownerId) return "Unowned";
  return ownerId === currentUserId ? "You" : "Assigned";
}

function matchesSearch(value: string, search: string) {
  return value.toLowerCase().includes(search.trim().toLowerCase());
}

function ContactRow({
  submission,
  onClaim,
  onStatus,
}: {
  submission: ContactSubmissionRecord;
  onClaim: (submission: ContactSubmissionRecord) => void;
  onStatus: (submission: ContactSubmissionRecord, status: ContactSubmissionStatus) => void;
}) {
  const timeZone = useUserTimeZone();
  const { user } = useAuth();

  return (
    <TableRow>
      <TableCell>
        <p className="font-medium">{submission.name}</p>
        <p className="text-xs text-muted-foreground">{submission.email}</p>
      </TableCell>
      <TableCell>
        <p>{submission.company_name ?? "No company"}</p>
        <p className="text-xs text-muted-foreground">{submission.interest}</p>
      </TableCell>
      <TableCell>
        <StatusBadge label={submission.status} variant={openContactStatuses.has(submission.status) ? "warning" : "outline"} />
      </TableCell>
      <TableCell>
        <Badge variant={submission.admin_owner_id ? "outline" : "secondary"}>{ownerLabel(submission.admin_owner_id, user?.id)}</Badge>
      </TableCell>
      <TableCell className="min-w-[160px] text-xs text-muted-foreground">
        {formatDateTimeForTimeZone(submission.created_at, timeZone)}
      </TableCell>
      <TableCell className="min-w-[170px]">
        <Select value={submission.status} onValueChange={(status) => onStatus(submission, status as ContactSubmissionStatus)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {contactStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-right">
        <Button size="sm" variant="outline" onClick={() => onClaim(submission)} disabled={submission.admin_owner_id === user?.id}>
          <UserCheck className="mr-2 h-4 w-4" />
          Claim
        </Button>
      </TableCell>
    </TableRow>
  );
}

function TargetResponseRow({
  response,
  onClaim,
  onStatus,
}: {
  response: CustomerTargetResponseRecord;
  onClaim: (response: CustomerTargetResponseRecord) => void;
  onStatus: (response: CustomerTargetResponseRecord, status: TargetResponseStatus) => void;
}) {
  const timeZone = useUserTimeZone();
  const { user } = useAuth();
  const targetName = response.customer_targets?.target_companies?.name ?? response.customer_targets?.target_account_name ?? "Target account";

  return (
    <TableRow>
      <TableCell>
        <p className="font-medium">{targetName}</p>
        <p className="text-xs text-muted-foreground">{response.customer_targets?.client_companies?.name ?? "Client pending"}</p>
      </TableCell>
      <TableCell>
        <p>{response.contact_name}</p>
        <p className="text-xs text-muted-foreground">{response.profiles?.full_name ?? response.profiles?.email ?? "Bum pending"}</p>
      </TableCell>
      <TableCell>
        <StatusBadge label={response.status} variant={openTargetResponseStatuses.has(response.status) ? "warning" : "outline"} />
      </TableCell>
      <TableCell>
        <Badge variant={response.admin_owner_id ? "outline" : "secondary"}>{ownerLabel(response.admin_owner_id, user?.id)}</Badge>
      </TableCell>
      <TableCell className="min-w-[160px] text-xs text-muted-foreground">
        {formatDateTimeForTimeZone(response.created_at, timeZone)}
      </TableCell>
      <TableCell className="min-w-[170px]">
        <Select value={response.status} onValueChange={(status) => onStatus(response, status as TargetResponseStatus)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {targetResponseStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => onClaim(response)} disabled={response.admin_owner_id === user?.id}>
            <UserCheck className="mr-2 h-4 w-4" />
            Claim
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link to={`/admin/opportunities`}>
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Open
            </Link>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function IntroRequestRow({
  request,
  onClaim,
  onStatus,
}: {
  request: ClientBumIntroRequestRecord;
  onClaim: (request: ClientBumIntroRequestRecord) => void;
  onStatus: (request: ClientBumIntroRequestRecord, status: ClientBumIntroRequestStatus) => void;
}) {
  const timeZone = useUserTimeZone();
  const { user } = useAuth();

  return (
    <TableRow>
      <TableCell>
        <p className="font-medium">{request.target_company_name}</p>
        <p className="text-xs text-muted-foreground">{request.client_companies?.name ?? "Client pending"}</p>
      </TableCell>
      <TableCell>
        <p>{request.bum_profiles?.full_name ?? request.bum_profiles?.email ?? "Bum pending"}</p>
        <p className="text-xs text-muted-foreground">{request.target_contact_name ?? "No contact named"}</p>
      </TableCell>
      <TableCell>
        <StatusBadge label={request.status} variant={openIntroRequestStatuses.has(request.status) ? "warning" : "outline"} />
      </TableCell>
      <TableCell>
        <Badge variant={request.admin_owner_id ? "outline" : "secondary"}>{ownerLabel(request.admin_owner_id, user?.id)}</Badge>
      </TableCell>
      <TableCell className="min-w-[160px] text-xs text-muted-foreground">
        {formatDateTimeForTimeZone(request.created_at, timeZone)}
      </TableCell>
      <TableCell className="min-w-[170px]">
        <Select value={request.status} onValueChange={(status) => onStatus(request, status as ClientBumIntroRequestStatus)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {introRequestStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-right">
        <Button size="sm" variant="outline" onClick={() => onClaim(request)} disabled={request.admin_owner_id === user?.id}>
          <UserCheck className="mr-2 h-4 w-4" />
          Claim
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function AdminHandoffs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<HandoffFilter>("OPEN");
  const [search, setSearch] = useState("");

  const contactQuery = useQuery({ queryKey: ["admin-contact-submissions"], queryFn: listContactSubmissions });
  const targetResponseQuery = useQuery({
    queryKey: ["admin-customer-target-responses"],
    queryFn: () => listCustomerTargetResponses(user!),
    enabled: user?.role === "ADMIN",
  });
  const introRequestQuery = useQuery({
    queryKey: ["admin-client-bum-intro-requests"],
    queryFn: () => listClientBumIntroRequests(user!),
    enabled: user?.role === "ADMIN",
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-contact-submissions"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-customer-target-responses"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-client-bum-intro-requests"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-audit-events"] });
  };

  const contactClaimMutation = useMutation({ mutationFn: (submission: ContactSubmissionRecord) => claimContactSubmission(user!, submission.id), onSuccess: invalidate });
  const targetClaimMutation = useMutation({ mutationFn: (response: CustomerTargetResponseRecord) => claimCustomerTargetResponse(user!, response.id), onSuccess: invalidate });
  const introClaimMutation = useMutation({ mutationFn: (request: ClientBumIntroRequestRecord) => claimClientBumIntroRequest(user!, request.id), onSuccess: invalidate });

  const contactStatusMutation = useMutation({
    mutationFn: ({ submission, status }: { submission: ContactSubmissionRecord; status: ContactSubmissionStatus }) =>
      updateContactSubmission(user!, submission.id, { status, adminNotes: submission.admin_notes ?? undefined }),
    onSuccess: invalidate,
  });
  const targetStatusMutation = useMutation({
    mutationFn: ({ response, status }: { response: CustomerTargetResponseRecord; status: TargetResponseStatus }) =>
      updateCustomerTargetResponseStatus(user!, response.id, status),
    onSuccess: invalidate,
  });
  const introStatusMutation = useMutation({
    mutationFn: ({ request, status }: { request: ClientBumIntroRequestRecord; status: ClientBumIntroRequestStatus }) =>
      updateClientBumIntroRequestStatus(user!, request.id, status),
    onSuccess: invalidate,
  });

  const contacts = useMemo(() => {
    return (contactQuery.data ?? [])
      .filter((submission) => filter !== "OPEN" || openContactStatuses.has(submission.status))
      .filter((submission) => filter !== "UNOWNED" || !submission.admin_owner_id)
      .filter((submission) => matchesSearch([submission.name, submission.email, submission.company_name, submission.message].filter(Boolean).join(" "), search))
      .sort((left, right) => ageInDays(right.created_at) - ageInDays(left.created_at));
  }, [contactQuery.data, filter, search]);

  const targetResponses = useMemo(() => {
    return (targetResponseQuery.data ?? [])
      .filter((response) => filter !== "OPEN" || openTargetResponseStatuses.has(response.status))
      .filter((response) => filter !== "UNOWNED" || !response.admin_owner_id)
      .filter((response) => matchesSearch([
        response.contact_name,
        response.profiles?.full_name,
        response.customer_targets?.target_account_name,
        response.customer_targets?.target_companies?.name,
        response.customer_targets?.client_companies?.name,
      ].filter(Boolean).join(" "), search))
      .sort((left, right) => ageInDays(right.created_at) - ageInDays(left.created_at));
  }, [targetResponseQuery.data, filter, search]);

  const introRequests = useMemo(() => {
    return (introRequestQuery.data ?? [])
      .filter((request) => filter !== "OPEN" || openIntroRequestStatuses.has(request.status))
      .filter((request) => filter !== "UNOWNED" || !request.admin_owner_id)
      .filter((request) => matchesSearch([
        request.target_company_name,
        request.target_contact_name,
        request.client_companies?.name,
        request.bum_profiles?.full_name,
      ].filter(Boolean).join(" "), search))
      .sort((left, right) => ageInDays(right.created_at) - ageInDays(left.created_at));
  }, [introRequestQuery.data, filter, search]);

  const openCount =
    (contactQuery.data ?? []).filter((submission) => openContactStatuses.has(submission.status)).length +
    (targetResponseQuery.data ?? []).filter((response) => openTargetResponseStatuses.has(response.status)).length +
    (introRequestQuery.data ?? []).filter((request) => openIntroRequestStatuses.has(request.status)).length;

  const unownedCount =
    (contactQuery.data ?? []).filter((submission) => !submission.admin_owner_id).length +
    (targetResponseQuery.data ?? []).filter((response) => !response.admin_owner_id).length +
    (introRequestQuery.data ?? []).filter((request) => !request.admin_owner_id).length;

  const isLoading = contactQuery.isLoading || targetResponseQuery.isLoading || introRequestQuery.isLoading;
  const isError = contactQuery.isError || targetResponseQuery.isError || introRequestQuery.isError;

  const showError = (error: unknown) => {
    toast({
      title: "Unable to update handoff",
      description: error instanceof Error ? error.message : "Please try again.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Handoffs"
        description="Own and rescue Bum-to-client relationship work before it stalls."
      >
        <Button asChild variant="outline">
          <Link to="/admin/opportunities">
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Opportunities
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Open handoffs</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{openCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Unowned items</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{unownedCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Visible queues</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">3</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_180px]">
        <Input placeholder="Search target, contact, client, Bum, or message..." value={search} onChange={(event) => setSearch(event.target.value)} />
        <Select value={filter} onValueChange={(value) => setFilter(value as HandoffFilter)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="OPEN">Open only</SelectItem>
            <SelectItem value="UNOWNED">Unowned</SelectItem>
            <SelectItem value="ALL">All items</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <div className="rounded-md border p-4 text-sm text-muted-foreground">Loading handoff queues...</div> : null}
      {isError ? <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">Unable to load one or more handoff queues.</div> : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Handshake className="h-5 w-5" /> Target responses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Target</TableHead>
                <TableHead>Response</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Update</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {targetResponses.map((response) => (
                <TargetResponseRow
                  key={response.id}
                  response={response}
                  onClaim={(item) => targetClaimMutation.mutate(item, { onError: showError })}
                  onStatus={(item, status) => targetStatusMutation.mutate({ response: item, status }, { onError: showError })}
                />
              ))}
            </TableBody>
          </Table>
          {!targetResponses.length ? <p className="py-6 text-sm text-muted-foreground">No target responses match this view.</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Intro requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Target</TableHead>
                <TableHead>Bum</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Update</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {introRequests.map((request) => (
                <IntroRequestRow
                  key={request.id}
                  request={request}
                  onClaim={(item) => introClaimMutation.mutate(item, { onError: showError })}
                  onStatus={(item, status) => introStatusMutation.mutate({ request: item, status }, { onError: showError })}
                />
              ))}
            </TableBody>
          </Table>
          {!introRequests.length ? <p className="py-6 text-sm text-muted-foreground">No intro requests match this view.</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Public contact conversions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Update</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((submission) => (
                <ContactRow
                  key={submission.id}
                  submission={submission}
                  onClaim={(item) => contactClaimMutation.mutate(item, { onError: showError })}
                  onStatus={(item, status) => contactStatusMutation.mutate({ submission: item, status }, { onError: showError })}
                />
              ))}
            </TableBody>
          </Table>
          {!contacts.length ? <p className="py-6 text-sm text-muted-foreground">No contact conversions match this view.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
