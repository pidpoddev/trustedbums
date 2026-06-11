import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Globe2, ShieldCheck, UserMinus, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getClientAccessLabel, type ClientAccessRole } from "@/data/authData";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  getClientTeam,
  approveClientCompanyAccessRequest,
  denyClientCompanyAccessRequest,
  disableClientTeamMember,
  inviteClientTeamMember,
  requestClientCompanyDomain,
  updateClientTeamMemberRole,
  type ClientCompanyAccessRequestRecord,
  type ClientTeamMemberRecord,
} from "@/lib/portalApi";

const roleOptions: Array<{ value: ClientAccessRole; label: string; detail: string }> = [
  { value: "CLIENT_ADMIN", label: "Client Admin", detail: "Full client portal access and company team management." },
  { value: "CLIENT_FINANCE", label: "Client Finance", detail: "Customer Payment Reports, commission invoices, exports, and reports." },
  { value: "CLIENT_MEMBER", label: "Client Member", detail: "Workspace, opportunities, training, and reports." },
];

function formatDate(value?: string | null) {
  return value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value)) : "Never";
}

function getMemberName(member: ClientTeamMemberRecord) {
  return member.full_name || member.email || member.id;
}

export default function ClientTeam() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<ClientAccessRole>("CLIENT_MEMBER");
  const [domainRequest, setDomainRequest] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<Record<string, ClientAccessRole>>({});

  const teamQuery = useQuery({
    queryKey: ["client-team", user?.clientId],
    queryFn: () => getClientTeam(user!),
    enabled: Boolean(user?.id && user?.role === "CLIENT" && user?.clientAccessRole === "CLIENT_ADMIN"),
  });

  useEffect(() => {
    const next: Record<string, ClientAccessRole> = {};
    for (const member of teamQuery.data?.members ?? []) {
      next[member.id] = member.client_access_role;
    }
    setSelectedRoles(next);
  }, [teamQuery.data?.members]);

  const members = useMemo(() => teamQuery.data?.members ?? [], [teamQuery.data?.members]);
  const invitations = useMemo(() => teamQuery.data?.invitations ?? [], [teamQuery.data?.invitations]);
  const accessRequests = useMemo(() => teamQuery.data?.accessRequests ?? [], [teamQuery.data?.accessRequests]);
  const domains = useMemo(() => teamQuery.data?.domains ?? [], [teamQuery.data?.domains]);
  const adminCount = useMemo(
    () => members.filter((member) => member.client_access_role === "CLIENT_ADMIN").length,
    [members],
  );

  const inviteMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in before inviting team members.");
      return inviteClientTeamMember(user, {
        email: inviteEmail,
        name: inviteName,
        clientAccessRole: inviteRole,
      });
    },
    onSuccess: async () => {
      setInviteName("");
      setInviteEmail("");
      setInviteRole("CLIENT_MEMBER");
      await queryClient.invalidateQueries({ queryKey: ["client-team", user?.clientId] });
      toast({ title: "Invite sent", description: "The team member will receive a Trusted Bums invitation." });
    },
    onError: (error) => {
      toast({
        title: "Unable to invite team member",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async (input: { profileId: string; clientAccessRole: ClientAccessRole }) => {
      if (!user) throw new Error("Sign in before updating team roles.");
      return updateClientTeamMemberRole(user, input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["client-team", user?.clientId] });
      toast({ title: "Role updated", description: "The member's client portal access was updated." });
    },
    onError: (error) => {
      toast({
        title: "Unable to update role",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const disableMutation = useMutation({
    mutationFn: async (profileId: string) => {
      if (!user) throw new Error("Sign in before disabling team members.");
      return disableClientTeamMember(user, { profileId });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["client-team", user?.clientId] });
      toast({ title: "Member disabled", description: "The user no longer has company access." });
    },
    onError: (error) => {
      toast({
        title: "Unable to disable member",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const domainMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in before requesting a domain.");
      return requestClientCompanyDomain(user, { domain: domainRequest });
    },
    onSuccess: async () => {
      setDomainRequest("");
      await queryClient.invalidateQueries({ queryKey: ["client-team", user?.clientId] });
      toast({ title: "Domain sent for Admin review", description: "Users from that domain can be added after approval." });
    },
    onError: (error) => {
      toast({
        title: "Unable to request domain",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const reviewRequestMutation = useMutation({
    mutationFn: async (input: { request: ClientCompanyAccessRequestRecord; status: "approved" | "denied" }) => {
      if (!user) throw new Error("Sign in before reviewing access requests.");
      if (input.status === "approved") {
        return approveClientCompanyAccessRequest(user, {
          requestId: input.request.id,
          clientAccessRole: (input.request.requested_role as ClientAccessRole | null) ?? "CLIENT_MEMBER",
        });
      }
      return denyClientCompanyAccessRequest(user, { requestId: input.request.id });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["client-team", user?.clientId] });
      toast({ title: "Request updated", description: "The access request was reviewed." });
    },
    onError: (error) => {
      toast({
        title: "Unable to review request",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Team Management" description="Invite Client users and assign company-scoped Client roles." />

      <div className="grid max-w-6xl gap-4 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <UserPlus className="h-5 w-5" />
                Invite User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  inviteMutation.mutate();
                }}
              >
              <div className="space-y-2">
                <Label htmlFor="team-invite-name">Name</Label>
                <Input id="team-invite-name" value={inviteName} onChange={(event) => setInviteName(event.target.value)} placeholder="Jane Smith" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-invite-email">Email</Label>
                <Input id="team-invite-email" type="email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="jane@company.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-invite-role">Role</Label>
                <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as ClientAccessRole)}>
                  <SelectTrigger id="team-invite-role"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs leading-5 text-muted-foreground">
                  {roleOptions.find((role) => role.value === inviteRole)?.detail}
                </p>
              </div>
                <Button type="submit" disabled={inviteMutation.isPending || !inviteEmail.trim()}>
                  {inviteMutation.isPending ? "Sending..." : "Send Invite"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <Globe2 className="h-5 w-5" />
                Company Domains
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {domains.length ? domains.map((domain) => (
                  <Badge key={domain.id} variant={domain.is_primary ? "default" : "secondary"}>{domain.domain}</Badge>
                )) : <p className="text-sm text-muted-foreground">No approved company domains yet.</p>}
              </div>
              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  domainMutation.mutate();
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="related-domain">Request related domain</Label>
                  <Input id="related-domain" value={domainRequest} onChange={(event) => setDomainRequest(event.target.value)} placeholder="example.com" />
                </div>
                <Button type="submit" variant="outline" disabled={domainMutation.isPending || !domainRequest.trim()}>
                  {domainMutation.isPending ? "Sending..." : "Send for Admin Review"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <ShieldCheck className="h-5 w-5" />
                Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teamQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading team...</p>
              ) : members.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Last Sign In</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => {
                      const selectedRole = selectedRoles[member.id] ?? member.client_access_role;
                      const isCurrentUser = member.id === user?.id;
                      const isLastAdmin = member.client_access_role === "CLIENT_ADMIN" && adminCount <= 1;
                      const hasChanged = selectedRole !== member.client_access_role;
                      const isDisabled = member.access_status === "DISABLED" || Boolean(member.disabled_at);
                      return (
                        <TableRow key={member.id} className={isDisabled ? "opacity-60" : undefined}>
                          <TableCell>
                            <div className="font-medium">{getMemberName(member)}</div>
                            <div className="text-xs text-muted-foreground">{member.email}</div>
                            {isCurrentUser ? <Badge variant="secondary" className="mt-2">You</Badge> : null}
                            {isDisabled ? <Badge variant="outline" className="mt-2">Disabled</Badge> : null}
                          </TableCell>
                          <TableCell className="min-w-[190px]">
                            <Select
                              value={selectedRole}
                              onValueChange={(value) => setSelectedRoles((current) => ({ ...current, [member.id]: value as ClientAccessRole }))}
                              disabled={isCurrentUser || isLastAdmin || isDisabled || updateRoleMutation.isPending}
                            >
                              <SelectTrigger aria-label={`Role for ${getMemberName(member)}`}><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {roleOptions.map((role) => (
                                  <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="mt-1 text-xs text-muted-foreground">{getClientAccessLabel(member.client_access_role)}</div>
                          </TableCell>
                          <TableCell>{formatDate(member.last_sign_in_at)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={!hasChanged || isCurrentUser || isLastAdmin || isDisabled || updateRoleMutation.isPending}
                              onClick={() => updateRoleMutation.mutate({ profileId: member.id, clientAccessRole: selectedRole })}
                            >
                              Save
                            </Button>
                            {!isCurrentUser && !isDisabled ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="ml-2"
                                disabled={disableMutation.isPending}
                                onClick={() => disableMutation.mutate(member.id)}
                              >
                                <UserMinus className="mr-1 h-4 w-4" />
                                Disable
                              </Button>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No client team members found yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Pending Access Requests</CardTitle></CardHeader>
            <CardContent>
              {accessRequests.length ? (
                <div className="space-y-3">
                  {accessRequests.map((request) => (
                    <div key={request.id} className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-medium">{request.email}</div>
                        <div className="text-xs text-muted-foreground">
                          {request.request_type.replaceAll("_", " ").toLowerCase()} · {request.requested_domain ?? request.email_domain ?? "no domain"} · {formatDate(request.created_at)}
                        </div>
                      </div>
                      {request.request_type === "SAME_DOMAIN_ACCESS" ? (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            disabled={reviewRequestMutation.isPending}
                            onClick={() => reviewRequestMutation.mutate({ request, status: "approved" })}
                          >
                            Approve
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={reviewRequestMutation.isPending}
                            onClick={() => reviewRequestMutation.mutate({ request, status: "denied" })}
                          >
                            Deny
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="secondary">Admin review</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No pending company access requests.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Pending Invites</CardTitle></CardHeader>
            <CardContent>
              {invitations.length ? (
                <div className="space-y-3">
                  {invitations.map((invite) => (
                    <div key={invite.id} className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-medium">{invite.full_name || invite.email}</div>
                        <div className="text-xs text-muted-foreground">{invite.email} · {formatDate(invite.created_at)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{getClientAccessLabel(invite.client_access_role)}</Badge>
                        <Badge variant="secondary">{invite.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No pending client invitations.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
