import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { claimStatusConfig } from "@/lib/claimConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  buildTopLineShareSchedule,
  calculateTopLineSharePercent,
  listOpportunityClaims,
  updateAdminOpportunityClaim,
  type OpportunityClaimRecord,
  type OpportunityClaimStatus,
  type OpportunityClaimStrength,
} from "@/lib/portalApi";

const claimStatuses: OpportunityClaimStatus[] = ["PROPOSED", "APPROVED", "DECLINED", "SCHEDULED", "MEETING_HELD", "EXPIRED", "DISPUTED", "CLOSED"];
const relationshipStrengths: OpportunityClaimStrength[] = ["STRONG", "MODERATE", "WEAK"];

function ClaimShareRow({ claim }: { claim: OpportunityClaimRecord }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    contact_name: claim.contact_name ?? "",
    contact_company: claim.contact_company ?? "",
    contact_email: claim.contact_email ?? "",
    relationship_strength: claim.relationship_strength ?? "MODERATE" as OpportunityClaimStrength,
    status: claim.status,
    note: claim.note ?? "",
    bum_share_percent: String(claim.bum_share_percent ?? 0),
  });

  useEffect(() => {
    if (!isEditing) {
      setForm({
        contact_name: claim.contact_name ?? "",
        contact_company: claim.contact_company ?? "",
        contact_email: claim.contact_email ?? "",
        relationship_strength: claim.relationship_strength ?? "MODERATE",
        status: claim.status,
        note: claim.note ?? "",
        bum_share_percent: String(claim.bum_share_percent ?? 0),
      });
    }
  }, [claim, isEditing]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateAdminOpportunityClaim(user!, claim.id, {
        contact_name: form.contact_name,
        contact_company: form.contact_company,
        contact_email: form.contact_email,
        relationship_strength: form.relationship_strength,
        status: form.status,
        note: form.note,
        bum_share_percent: Number(form.bum_share_percent || 0),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-opportunity-claims"] });
      await queryClient.invalidateQueries({ queryKey: ["opportunity-claims"] });
      await queryClient.invalidateQueries({ queryKey: ["bum-payouts"] });
      setIsEditing(false);
      toast({
        title: "Claim updated",
        description: "The claim and dispute details were saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to update claim",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const schedule = buildTopLineShareSchedule(
    claim.opportunity_registrations?.client_pay_programs,
    claim.bum_share_percent,
  );
  const yearOneTopLine =
    schedule[0]?.topLinePercent ??
    calculateTopLineSharePercent(claim.opportunity_registrations?.commission_rate, claim.bum_share_percent);

  return (
    <>
      <tr key={claim.id} className="border-b last:border-0 hover:bg-muted/50">
        <td className="py-3 font-medium">
          {claim.contact_name} <span className="text-muted-foreground">@ {claim.contact_company}</span>
          {claim.contact_email ? <p className="text-xs text-muted-foreground">{claim.contact_email}</p> : null}
        </td>
        <td className="py-3">{claim.opportunity_registrations?.target_account_name ?? "Opportunity pending"}</td>
        <td className="py-3">{claim.profiles?.full_name ?? claim.profiles?.email ?? "Trusted Bum"}</td>
        <td className="py-3">
          <StatusBadge label={claimStatusConfig[claim.status].label} variant={claimStatusConfig[claim.status].variant} />
        </td>
        <td className="py-3">
          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">{claim.relationship_strength}</span>
        </td>
        <td className="py-3">
          <div className="space-y-1">
            <p className="font-display font-bold">{Number(claim.bum_share_percent ?? 0).toLocaleString()}%</p>
            <p className="text-xs text-muted-foreground">of Trusted Bums commission</p>
          </div>
        </td>
        <td className="py-3">
          <div className="space-y-1">
            <p className="font-display font-bold">{yearOneTopLine.toLocaleString()}%</p>
            <p className="text-xs text-muted-foreground">
              top-line equivalent
              {schedule.length ? ` · ${schedule.map((item) => `${item.label} ${item.topLinePercent}%`).join(", ")}` : ""}
            </p>
          </div>
        </td>
        <td className="min-w-[180px] py-3">
          {claim.meeting_locked ? (
            <div className="text-sm text-muted-foreground">Locked after completed meeting</div>
          ) : (
            <Button size="sm" variant={isEditing ? "secondary" : "outline"} onClick={() => setIsEditing((current) => !current)}>
              {isEditing ? "Close" : "Edit"}
            </Button>
          )}
        </td>
      </tr>
      {isEditing && !claim.meeting_locked ? (
        <tr className="border-b bg-muted/20">
          <td colSpan={8} className="p-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Contact name</Label>
                <Input value={form.contact_name} onChange={(event) => setForm((current) => ({ ...current, contact_name: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Contact company</Label>
                <Input value={form.contact_company} onChange={(event) => setForm((current) => ({ ...current, contact_company: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Contact email</Label>
                <Input value={form.contact_email} onChange={(event) => setForm((current) => ({ ...current, contact_email: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(value: OpportunityClaimStatus) => setForm((current) => ({ ...current, status: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {claimStatuses.map((status) => (
                      <SelectItem key={status} value={status}>{claimStatusConfig[status].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Relationship strength</Label>
                <Select value={form.relationship_strength} onValueChange={(value: OpportunityClaimStrength) => setForm((current) => ({ ...current, relationship_strength: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {relationshipStrengths.map((strength) => (
                      <SelectItem key={strength} value={strength}>{strength}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Share of TB commission</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={form.bum_share_percent}
                  onChange={(event) => setForm((current) => ({ ...current, bum_share_percent: event.target.value }))}
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label>Claim / dispute note</Label>
              <Textarea rows={3} value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={updateMutation.isPending}>Cancel</Button>
              <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending || !form.contact_name || !form.contact_company}>
                {updateMutation.isPending ? "Saving..." : "Save claim"}
              </Button>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function ClaimShareMobileCard({ claim }: { claim: OpportunityClaimRecord }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    contact_name: claim.contact_name ?? "",
    contact_company: claim.contact_company ?? "",
    contact_email: claim.contact_email ?? "",
    relationship_strength: claim.relationship_strength ?? "MODERATE" as OpportunityClaimStrength,
    status: claim.status,
    note: claim.note ?? "",
    bum_share_percent: String(claim.bum_share_percent ?? 0),
  });

  useEffect(() => {
    if (!isEditing) {
      setForm({
        contact_name: claim.contact_name ?? "",
        contact_company: claim.contact_company ?? "",
        contact_email: claim.contact_email ?? "",
        relationship_strength: claim.relationship_strength ?? "MODERATE",
        status: claim.status,
        note: claim.note ?? "",
        bum_share_percent: String(claim.bum_share_percent ?? 0),
      });
    }
  }, [claim, isEditing]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateAdminOpportunityClaim(user!, claim.id, {
        contact_name: form.contact_name,
        contact_company: form.contact_company,
        contact_email: form.contact_email,
        relationship_strength: form.relationship_strength,
        status: form.status,
        note: form.note,
        bum_share_percent: Number(form.bum_share_percent || 0),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-opportunity-claims"] });
      await queryClient.invalidateQueries({ queryKey: ["opportunity-claims"] });
      await queryClient.invalidateQueries({ queryKey: ["bum-payouts"] });
      setIsEditing(false);
      toast({ title: "Claim updated", description: "The claim and dispute details were saved." });
    },
    onError: (error) => {
      toast({
        title: "Unable to update claim",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const schedule = buildTopLineShareSchedule(
    claim.opportunity_registrations?.client_pay_programs,
    claim.bum_share_percent,
  );
  const yearOneTopLine =
    schedule[0]?.topLinePercent ??
    calculateTopLineSharePercent(claim.opportunity_registrations?.commission_rate, claim.bum_share_percent);

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-base font-semibold leading-tight">{claim.contact_name}</p>
          <p className="break-words text-sm text-muted-foreground">@ {claim.contact_company}</p>
          {claim.contact_email ? <p className="break-all text-xs text-muted-foreground">{claim.contact_email}</p> : null}
        </div>
        <StatusBadge label={claimStatusConfig[claim.status].label} variant={claimStatusConfig[claim.status].variant} />
      </div>

      <div className="mt-4 grid gap-3 text-sm">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Opportunity</p>
          <p className="break-words font-medium">{claim.opportunity_registrations?.target_account_name ?? "Opportunity pending"}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-muted-foreground">Bum</p>
          <p className="break-words">{claim.profiles?.full_name ?? claim.profiles?.email ?? "Trusted Bum"}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Relationship</p>
            <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">{claim.relationship_strength}</span>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Share</p>
            <p className="font-display font-bold">{Number(claim.bum_share_percent ?? 0).toLocaleString()}%</p>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase text-muted-foreground">Top-line equivalent</p>
          <p className="font-display font-bold">{yearOneTopLine.toLocaleString()}%</p>
          {schedule.length ? <p className="text-xs text-muted-foreground">{schedule.map((item) => `${item.label} ${item.topLinePercent}%`).join(", ")}</p> : null}
        </div>
      </div>

      {isEditing && !claim.meeting_locked ? (
        <div className="mt-4 space-y-3 rounded-md border bg-muted/20 p-3">
          <div className="space-y-2">
            <Label>Contact name</Label>
            <Input value={form.contact_name} onChange={(event) => setForm((current) => ({ ...current, contact_name: event.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Contact company</Label>
            <Input value={form.contact_company} onChange={(event) => setForm((current) => ({ ...current, contact_company: event.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Contact email</Label>
            <Input value={form.contact_email} onChange={(event) => setForm((current) => ({ ...current, contact_email: event.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(value: OpportunityClaimStatus) => setForm((current) => ({ ...current, status: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {claimStatuses.map((status) => (
                  <SelectItem key={status} value={status}>{claimStatusConfig[status].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Relationship strength</Label>
            <Select value={form.relationship_strength} onValueChange={(value: OpportunityClaimStrength) => setForm((current) => ({ ...current, relationship_strength: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {relationshipStrengths.map((strength) => (
                  <SelectItem key={strength} value={strength}>{strength}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Share of TB commission</Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={form.bum_share_percent}
              onChange={(event) => setForm((current) => ({ ...current, bum_share_percent: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Claim / dispute note</Label>
            <Textarea rows={3} value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending || !form.contact_name || !form.contact_company}>
              {updateMutation.isPending ? "Saving..." : "Save claim"}
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={updateMutation.isPending}>Cancel</Button>
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        {claim.meeting_locked ? (
          <p className="text-sm text-muted-foreground">Locked after completed meeting</p>
        ) : (
          <Button size="sm" variant={isEditing ? "secondary" : "outline"} className="w-full" onClick={() => setIsEditing((current) => !current)}>
            {isEditing ? "Close edit controls" : "Edit claim"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function AdminCredits() {
  const claimsQuery = useQuery({
    queryKey: ["admin-opportunity-claims"],
    queryFn: () => listOpportunityClaims(undefined, { includeDisabled: true }),
  });
  const claims = claimsQuery.data ?? [];

  return (
    <div>
      <PageHeader title="Credits & Disputes" description="Manage claim details, disputes, and team splits until a completed meeting is logged against the claim." />

      <Card>
        <CardHeader><CardTitle className="font-display">Intro Claims with Credit Assignments</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3 md:hidden">
            {claims.map((claim) => (
              <ClaimShareMobileCard key={claim.id} claim={claim} />
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Contact</th>
                  <th className="pb-3 font-medium text-muted-foreground">Opportunity</th>
                  <th className="pb-3 font-medium text-muted-foreground">Bum</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 font-medium text-muted-foreground">Relationship</th>
                  <th className="pb-3 font-medium text-muted-foreground">Share of TB commission</th>
                  <th className="pb-3 font-medium text-muted-foreground">Top-line equivalent</th>
                  <th className="pb-3 font-medium text-muted-foreground">Admin control</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <ClaimShareRow key={claim.id} claim={claim} />
                ))}
              </tbody>
            </table>
          </div>
          {!claimsQuery.isLoading && !claims.length ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No opportunity claims have been requested yet.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
