import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import { trackAnalyticsEvent } from "@/lib/analyticsEvents";
import {
  getOwnBumProfile,
  inviteBum,
  listBumPayouts,
  listBumTeamMemberships,
  listManagingBumCommissionAllocations,
  listOpportunityClaims,
  type BumPayoutStatus,
  type BumTeamMembershipRecord,
} from "@/lib/portalApi";
import { formatDateTimeForTimeZone } from "@/lib/timezone";
import { MailPlus } from "lucide-react";

function money(value: number | null | undefined) {
  return `$${Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function payoutStatusVariant(status: BumPayoutStatus) {
  if (status === "PAID") return "success";
  if (status === "APPROVED") return "info";
  if (status === "VOID") return "outline";
  return "warning";
}

function membershipName(membership: BumTeamMembershipRecord) {
  return membership.member_bum_profile?.full_name || membership.invite_email || "Pending Bum";
}

function membershipEmail(membership: BumTeamMembershipRecord) {
  return membership.member_bum_profile?.email || membership.invite_email || "Invite pending";
}

export default function BumTeamManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const timeZone = useUserTimeZone();
  const userId = user?.id;
  const [teamInviteEmail, setTeamInviteEmail] = useState("");
  const [teamInviteName, setTeamInviteName] = useState("");
  const [teamInviteReferralSource, setTeamInviteReferralSource] = useState("");
  const [teamInviteTrustConfirmed, setTeamInviteTrustConfirmed] = useState(false);
  const [teamInviteNote, setTeamInviteNote] = useState("");

  const profileQuery = useQuery({
    queryKey: ["bum-profile", userId],
    queryFn: () => getOwnBumProfile(userId!),
    enabled: Boolean(userId),
  });

  const isManagingBum = Boolean(profileQuery.data?.is_managing_bum);

  const teamQuery = useQuery({
    queryKey: ["bum-team-memberships", userId],
    queryFn: () => listBumTeamMemberships(user!, userId),
    enabled: Boolean(user && userId && isManagingBum),
  });

  const claimsQuery = useQuery({
    queryKey: ["managing-bum-team-claims", userId],
    queryFn: () => listOpportunityClaims(),
    enabled: Boolean(userId && isManagingBum),
  });

  const payoutsQuery = useQuery({
    queryKey: ["managing-bum-team-payouts", userId],
    queryFn: listBumPayouts,
    enabled: Boolean(userId && isManagingBum),
  });

  const allocationsQuery = useQuery({
    queryKey: ["managing-bum-commission-allocations", userId],
    queryFn: () => listManagingBumCommissionAllocations(user!, userId),
    enabled: Boolean(user && userId && isManagingBum),
  });

  const activeMemberships = useMemo(
    () => (teamQuery.data ?? []).filter((membership) => membership.status !== "REMOVED"),
    [teamQuery.data],
  );
  const activeMemberIds = useMemo(
    () =>
      new Set(
        activeMemberships
          .filter((membership) => membership.status === "ACTIVE")
          .map((membership) => membership.member_bum_user_id)
          .filter(Boolean) as string[],
      ),
    [activeMemberships],
  );
  const teamClaims = useMemo(
    () => (claimsQuery.data ?? []).filter((claim) => activeMemberIds.has(claim.bum_user_id)),
    [activeMemberIds, claimsQuery.data],
  );
  const teamPayouts = useMemo(
    () => (payoutsQuery.data ?? []).filter((payout) => activeMemberIds.has(payout.bum_user_id)),
    [activeMemberIds, payoutsQuery.data],
  );
  const managerAllocations = useMemo(() => allocationsQuery.data ?? [], [allocationsQuery.data]);

  const teamRows = useMemo(
    () =>
      activeMemberships.map((membership) => {
        const memberId = membership.member_bum_user_id;
        const claims = memberId ? teamClaims.filter((claim) => claim.bum_user_id === memberId) : [];
        const payouts = memberId ? teamPayouts.filter((payout) => payout.bum_user_id === memberId) : [];
        const allocations = memberId
          ? managerAllocations.filter((allocation) => allocation.member_bum_user_id === memberId)
          : [];
        const paidEarnings = payouts
          .filter((payout) => payout.status === "PAID")
          .reduce((sum, payout) => sum + Number(payout.payout_amount ?? 0), 0);
        const pendingEarnings = payouts
          .filter((payout) => payout.status === "PENDING_ALLOCATION" || payout.status === "APPROVED")
          .reduce((sum, payout) => sum + Number(payout.payout_amount ?? 0), 0);
        const managerShare = allocations
          .filter((allocation) => allocation.status !== "VOID")
          .reduce((sum, allocation) => sum + Number(allocation.allocation_amount ?? 0), 0);
        const latestClaimAt = claims
          .map((claim) => claim.created_at)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

        return {
          membership,
          claims,
          paidEarnings,
          pendingEarnings,
          managerShare,
          latestClaimAt,
        };
      }),
    [activeMemberships, managerAllocations, teamClaims, teamPayouts],
  );

  const activeCount = activeMemberships.filter((membership) => membership.status === "ACTIVE").length;
  const invitedCount = activeMemberships.filter((membership) => membership.status === "INVITED").length;
  const paidTotal = teamPayouts
    .filter((payout) => payout.status === "PAID")
    .reduce((sum, payout) => sum + Number(payout.payout_amount ?? 0), 0);
  const pendingTotal = teamPayouts
    .filter((payout) => payout.status === "PENDING_ALLOCATION" || payout.status === "APPROVED")
    .reduce((sum, payout) => sum + Number(payout.payout_amount ?? 0), 0);
  const managerShareTotal = managerAllocations
    .filter((allocation) => allocation.status !== "VOID")
    .reduce((sum, allocation) => sum + Number(allocation.allocation_amount ?? 0), 0);

  const inviteTeamBumMutation = useMutation({
    mutationFn: () =>
      inviteBum({
        email: teamInviteEmail,
        name: teamInviteName,
        referralSource: teamInviteReferralSource,
        trustConfirmed: teamInviteTrustConfirmed,
        note: teamInviteNote,
      }),
    onSuccess: async (result) => {
      trackAnalyticsEvent("trustedbums_bum_invited", {
        invite_source: "managing_bum_team",
        has_name: Boolean(teamInviteName.trim()),
        has_referral_source: Boolean(teamInviteReferralSource.trim()),
        has_note: Boolean(teamInviteNote.trim()),
      });
      setTeamInviteEmail("");
      setTeamInviteName("");
      setTeamInviteReferralSource("");
      setTeamInviteTrustConfirmed(false);
      setTeamInviteNote("");
      await queryClient.invalidateQueries({ queryKey: ["bum-team-memberships", userId] });
      toast({
        title: "Bum invited",
        description: `${result.email} will be attached to your team when they sign up.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to invite Bum",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!profileQuery.isLoading && !isManagingBum) {
    return (
      <div className="space-y-6">
        <PageHeader title="Team Management" description="Team reporting for Managing Bums." />
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Managing Bum access required</CardTitle>
            <CardDescription>Admin can turn this on from the Bum profile.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Management"
        description="Track invited Bums, claim activity, team earnings, and your manager share."
      />

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <MailPlus className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-display">Invite Bum</CardTitle>
              <CardDescription>
                Invite a Bum only after naming the referral source and confirming you trust them on your team.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-2">
              <Label htmlFor="team-management-invite-email">Email</Label>
              <Input
                id="team-management-invite-email"
                type="email"
                value={teamInviteEmail}
                onChange={(event) => setTeamInviteEmail(event.target.value)}
                placeholder="newbum@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-management-invite-name">Name</Label>
              <Input
                id="team-management-invite-name"
                value={teamInviteName}
                onChange={(event) => setTeamInviteName(event.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="team-management-invite-referral-source">Referral source</Label>
              <Input
                id="team-management-invite-referral-source"
                value={teamInviteReferralSource}
                onChange={(event) => setTeamInviteReferralSource(event.target.value)}
                placeholder="Who referred or vouched for this Bum?"
              />
            </div>
            <div className="rounded-md border bg-muted/30 p-4 md:col-span-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="team-management-invite-trust-confirmed"
                  checked={teamInviteTrustConfirmed}
                  onCheckedChange={(checked) => setTeamInviteTrustConfirmed(checked === true)}
                />
                <div className="space-y-1">
                  <Label htmlFor="team-management-invite-trust-confirmed">Trust confirmation</Label>
                  <p className="text-sm text-muted-foreground">
                    This invite reflects on you as a Bum. Confirm you trust this person before sending.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="team-management-invite-note">Note</Label>
              <Textarea
                id="team-management-invite-note"
                rows={3}
                value={teamInviteNote}
                onChange={(event) => setTeamInviteNote(event.target.value)}
                placeholder="Optional context"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => inviteTeamBumMutation.mutate()}
              disabled={inviteTeamBumMutation.isPending || !teamInviteEmail.trim() || !teamInviteReferralSource.trim() || !teamInviteTrustConfirmed}
            >
              <MailPlus className="mr-2 h-4 w-4" />
              {inviteTeamBumMutation.isPending ? "Sending..." : "Invite Bum"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">Team Bums</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold">{activeCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">{invitedCount} invited</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">Claims requested</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold">{teamClaims.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">Submitted by active team members.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">Team earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold">{money(paidTotal + pendingTotal)}</p>
            <p className="mt-1 text-sm text-muted-foreground">{money(paidTotal)} paid, {money(pendingTotal)} pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">Manager share</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold">{money(managerShareTotal)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Allocated from team performance.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Team members</CardTitle>
          <CardDescription>Active and invited Bums connected to your Managing Bum account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bum</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Claims requested</TableHead>
                <TableHead>Team earnings</TableHead>
                <TableHead>Manager share</TableHead>
                <TableHead>Latest claim</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamRows.map(({ membership, claims, paidEarnings, pendingEarnings, managerShare, latestClaimAt }) => (
                <TableRow key={membership.id}>
                  <TableCell>
                    <div className="font-medium">{membershipName(membership)}</div>
                    <div className="text-xs text-muted-foreground">{membershipEmail(membership)}</div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={statusLabel(membership.status)}
                      variant={membership.status === "ACTIVE" ? "success" : "warning"}
                    />
                  </TableCell>
                  <TableCell>{claims.length}</TableCell>
                  <TableCell>
                    <div>{money(paidEarnings + pendingEarnings)}</div>
                    <div className="text-xs text-muted-foreground">{money(paidEarnings)} paid, {money(pendingEarnings)} pending</div>
                  </TableCell>
                  <TableCell>{money(managerShare)}</TableCell>
                  <TableCell>
                    {latestClaimAt ? formatDateTimeForTimeZone(latestClaimAt, timeZone) : "None yet"}
                  </TableCell>
                </TableRow>
              ))}
              {!teamQuery.isLoading && !teamRows.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No team members yet. Invite Bums above to start building your team.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Manager share history</CardTitle>
          <CardDescription>Allocations created when Trusted Bums records paid customer commissions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {managerAllocations.slice(0, 8).map((allocation) => (
            <div key={allocation.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {allocation.opportunity_claims?.contact_name ?? "Claim"} @ {allocation.opportunity_claims?.contact_company ?? "Customer"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {allocation.member_bum_profile?.full_name ?? allocation.member_bum_profile?.email ?? "Team Bum"}
                    {" - "}
                    Invoice {allocation.claim_invoices?.invoice_number ?? "pending"}
                  </p>
                </div>
                <StatusBadge label={statusLabel(allocation.status)} variant={payoutStatusVariant(allocation.status)} />
              </div>
              <p className="mt-3 font-display text-xl font-bold">{money(allocation.allocation_amount)}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {Number(allocation.manager_commission_percent ?? 0).toLocaleString()}% Managing Bum share
              </p>
            </div>
          ))}
          {!allocationsQuery.isLoading && !managerAllocations.length ? (
            <div className="rounded-lg border bg-muted/20 p-8 text-center text-muted-foreground">
              No manager share allocations yet.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
