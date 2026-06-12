import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import {
  getOwnBumProfile,
  listBumPayouts,
  listBumTeamMemberships,
  listManagingBumCommissionAllocations,
  listOpportunityClaims,
  type BumPayoutStatus,
  type BumTeamMembershipRecord,
} from "@/lib/portalApi";
import { formatDateTimeForTimeZone } from "@/lib/timezone";

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
  const timeZone = useUserTimeZone();
  const userId = user?.id;

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

  const activeMemberships = (teamQuery.data ?? []).filter((membership) => membership.status !== "REMOVED");
  const activeMemberIds = new Set(
    activeMemberships
      .filter((membership) => membership.status === "ACTIVE")
      .map((membership) => membership.member_bum_user_id)
      .filter(Boolean) as string[],
  );
  const teamClaims = (claimsQuery.data ?? []).filter((claim) => activeMemberIds.has(claim.bum_user_id));
  const teamPayouts = (payoutsQuery.data ?? []).filter((payout) => activeMemberIds.has(payout.bum_user_id));
  const managerAllocations = allocationsQuery.data ?? [];

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
                    No team members yet. Invite Bums from your dashboard to start building your team.
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
