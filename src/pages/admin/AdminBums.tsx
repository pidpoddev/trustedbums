import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Plus, Power, PowerOff, Search } from "lucide-react";
import { BumProfileCard } from "@/components/BumProfileCard";
import { PaginationControls } from "@/components/PaginationControls";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { BUM_TERMS_VERSION } from "@/data/partnerTerms";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getPageItems } from "@/lib/pagination";
import {
  inviteBum,
  listAdminBumProfiles,
  listProfiles,
  listTermsAcceptances,
  listTermsVersions,
  setAdminBumProfileDisabled,
  updateAdminBumProfile,
  type BumAvailabilityStatus,
  type BumProfileRecord,
  type BumVerificationStatus,
} from "@/lib/portalApi";

type BumTypeFilter = "ALL" | "VISIBLE_TO_CLIENTS" | "AGREEMENT_ACCEPTED" | "PROFILE_READY" | "HIDDEN" | "DISABLED";

const ADMIN_BUMS_PAGE_SIZE = 8;

const bumTypeFilters: { value: BumTypeFilter; label: string }[] = [
  { value: "ALL", label: "All Bum types" },
  { value: "VISIBLE_TO_CLIENTS", label: "Visible to clients" },
  { value: "AGREEMENT_ACCEPTED", label: "Agreement accepted" },
  { value: "PROFILE_READY", label: "Profile ready" },
  { value: "HIDDEN", label: "Hidden from clients" },
  { value: "DISABLED", label: "Disabled" },
];

function joinList(values?: string[]) {
  return (values ?? []).join(", ");
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isBumDisabled(bum: Pick<BumProfileRecord, "profiles">) {
  return bum.profiles?.access_status === "DISABLED" || Boolean(bum.profiles?.disabled_at);
}

function AdminBumEditButton({ bum }: { bum: BumProfileRecord }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    headline: "",
    bio: "",
    linkedinUrl: "",
    yearsExperience: "",
    availabilityStatus: "open" as BumAvailabilityStatus,
    homeRegion: "",
    industries: "",
    regions: "",
    productsSold: "",
    buyerPersonas: "",
    workedWithCompanies: "",
    relationshipCompanies: "",
    skills: "",
    certifications: "",
    notableWins: "",
    verificationStatus: "self_reported" as BumVerificationStatus,
    isVisibleToClients: false,
  });

  function openEditor() {
    setForm({
      headline: bum.headline ?? "",
      bio: bum.bio ?? "",
      linkedinUrl: bum.linkedin_url ?? "",
      yearsExperience: bum.years_experience === null || bum.years_experience === undefined ? "" : String(bum.years_experience),
      availabilityStatus: bum.availability_status ?? "open",
      homeRegion: bum.home_region ?? "",
      industries: joinList(bum.industries),
      regions: joinList(bum.regions),
      productsSold: joinList(bum.products_sold),
      buyerPersonas: joinList(bum.buyer_personas),
      workedWithCompanies: joinList(bum.worked_with_companies),
      relationshipCompanies: joinList(bum.relationship_companies),
      skills: joinList(bum.skills),
      certifications: joinList(bum.certifications),
      notableWins: bum.notable_wins ?? "",
      verificationStatus: bum.verification_status ?? "self_reported",
      isVisibleToClients: Boolean(bum.is_visible_to_clients),
    });
    setOpen(true);
  }

  const updateMutation = useMutation({
    mutationFn: () =>
      updateAdminBumProfile(user!, bum.user_id, {
        headline: form.headline,
        bio: form.bio,
        linkedin_url: form.linkedinUrl,
        years_experience: form.yearsExperience.trim() ? Number(form.yearsExperience) : null,
        availability_status: form.availabilityStatus,
        home_region: form.homeRegion,
        industries: splitList(form.industries),
        regions: splitList(form.regions),
        products_sold: splitList(form.productsSold),
        buyer_personas: splitList(form.buyerPersonas),
        worked_with_companies: splitList(form.workedWithCompanies),
        relationship_companies: splitList(form.relationshipCompanies),
        skills: splitList(form.skills),
        certifications: splitList(form.certifications),
        notable_wins: form.notableWins,
        verification_status: form.verificationStatus,
        is_visible_to_clients: form.isVisibleToClients,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-bum-profiles"] });
      await queryClient.invalidateQueries({ queryKey: ["client-visible-bum-profiles"] });
      setOpen(false);
      toast({ title: "Bum updated", description: "The Bum profile changes were saved." });
    },
    onError: (error) => {
      toast({
        title: "Unable to update Bum",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <Button size="sm" variant="outline" onClick={openEditor}>
        <Edit3 className="mr-2 h-4 w-4" /> Edit data
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Bum data</DialogTitle>
            <DialogDescription>Update Bum profile data shown to admins and, when visible, clients.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Headline</Label>
                <Input value={form.headline} onChange={(event) => setForm((current) => ({ ...current, headline: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn URL</Label>
                <Input value={form.linkedinUrl} onChange={(event) => setForm((current) => ({ ...current, linkedinUrl: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Years experience</Label>
                <Input type="number" value={form.yearsExperience} onChange={(event) => setForm((current) => ({ ...current, yearsExperience: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Home region</Label>
                <Input value={form.homeRegion} onChange={(event) => setForm((current) => ({ ...current, homeRegion: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Availability</Label>
                <Select value={form.availabilityStatus} onValueChange={(value) => setForm((current) => ({ ...current, availabilityStatus: value as BumAvailabilityStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="selective">Selective</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Verification</Label>
                <Select value={form.verificationStatus} onValueChange={(value) => setForm((current) => ({ ...current, verificationStatus: value as BumVerificationStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self_reported">Self reported</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea rows={4} value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Industries</Label>
                <Input value={form.industries} onChange={(event) => setForm((current) => ({ ...current, industries: event.target.value }))} placeholder="Fintech, Healthcare, SaaS" />
              </div>
              <div className="space-y-2">
                <Label>Regions</Label>
                <Input value={form.regions} onChange={(event) => setForm((current) => ({ ...current, regions: event.target.value }))} placeholder="North America, EMEA" />
              </div>
              <div className="space-y-2">
                <Label>Products / services sold</Label>
                <Input value={form.productsSold} onChange={(event) => setForm((current) => ({ ...current, productsSold: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Buyer personas</Label>
                <Input value={form.buyerPersonas} onChange={(event) => setForm((current) => ({ ...current, buyerPersonas: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Worked with companies</Label>
                <Input value={form.workedWithCompanies} onChange={(event) => setForm((current) => ({ ...current, workedWithCompanies: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Relationships at</Label>
                <Input value={form.relationshipCompanies} onChange={(event) => setForm((current) => ({ ...current, relationshipCompanies: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Skills</Label>
                <Input value={form.skills} onChange={(event) => setForm((current) => ({ ...current, skills: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Certifications</Label>
                <Input value={form.certifications} onChange={(event) => setForm((current) => ({ ...current, certifications: event.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notable wins</Label>
              <Textarea rows={3} value={form.notableWins} onChange={(event) => setForm((current) => ({ ...current, notableWins: event.target.value }))} />
            </div>

            <label className="flex items-center justify-between rounded-md border p-3 text-sm">
              <span>Visible to clients</span>
              <Switch checked={form.isVisibleToClients} onCheckedChange={(checked) => setForm((current) => ({ ...current, isVisibleToClients: checked }))} />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={updateMutation.isPending}>Cancel</Button>
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AdminBums() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<BumTypeFilter>("ALL");
  const [bumPage, setBumPage] = useState(1);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteNote, setInviteNote] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const bumProfilesQuery = useQuery({ queryKey: ["admin-bum-profiles"], queryFn: listAdminBumProfiles });
  const profilesQuery = useQuery({ queryKey: ["admin-profiles"], queryFn: listProfiles });
  const termsVersionsQuery = useQuery({ queryKey: ["admin-terms-versions"], queryFn: listTermsVersions });
  const acceptancesQuery = useQuery({ queryKey: ["admin-terms-acceptances"], queryFn: listTermsAcceptances });

  const inviteMutation = useMutation({
    mutationFn: () => inviteBum({ email: inviteEmail, name: inviteName, note: inviteNote }),
    onSuccess: (result) => {
      setInviteOpen(false);
      setInviteEmail("");
      setInviteName("");
      setInviteNote("");
      toast({ title: "Bum invited", description: `Clerk sent an invitation to ${result.email}.` });
    },
    onError: (error) => {
      toast({
        title: "Unable to invite Bum",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });
  const bumDisabledMutation = useMutation({
    mutationFn: ({ userId, disabled }: { userId: string; disabled: boolean }) =>
      setAdminBumProfileDisabled(user!, userId, disabled),
    onSuccess: async (_profile, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-bum-profiles"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-profiles"] }),
        queryClient.invalidateQueries({ queryKey: ["client-visible-bum-profiles"] }),
      ]);
      toast({
        title: variables.disabled ? "Bum disabled" : "Bum enabled",
        description: variables.disabled
          ? "That Bum and their related records are hidden outside Admin."
          : "That Bum is available again outside Admin.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to update Bum access",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });


  const bumSummaries = useMemo(() => {
    const bumTermsId = (termsVersionsQuery.data ?? []).find((terms) => terms.version === BUM_TERMS_VERSION)?.id;
    const bumProfilesByUserId = new Map((bumProfilesQuery.data ?? []).map((profile) => [profile.user_id, profile]));
    const profilesById = new Map((profilesQuery.data ?? []).map((profile) => [profile.id, profile]));
    const acceptedTermsByUserId = new Map<
      string,
      Array<{
        version: string;
        title: string;
        acceptedAt: string;
      }>
    >();

    for (const acceptance of acceptancesQuery.data ?? []) {
      const current = acceptedTermsByUserId.get(acceptance.user_id) ?? [];
      current.push({
        version: acceptance.terms_versions?.version ?? acceptance.terms_version_id,
        title: acceptance.terms_versions?.title ?? "Terms",
        acceptedAt: acceptance.accepted_at,
      });
      acceptedTermsByUserId.set(acceptance.user_id, current);
    }

    const acceptedUserIds = new Set(
      (acceptancesQuery.data ?? [])
        .filter((acceptance) => acceptance.terms_version_id === bumTermsId)
        .map((acceptance) => acceptance.user_id),
    );

    return (profilesQuery.data ?? [])
      .filter((profile) => profile.role === "BUM")
      .map((profile) => {
        const bumProfile = bumProfilesByUserId.get(profile.id);
        const hasAcceptedAgreement = bumTermsId ? acceptedUserIds.has(profile.id) : false;

        if (bumProfile) {
          return {
            ...bumProfile,
            hasAcceptedAgreement,
            acceptedTerms: acceptedTermsByUserId.get(profile.id) ?? [],
            lastLoggedInAt: profilesById.get(profile.id)?.last_sign_in_at ?? null,
            profiles: bumProfile.profiles ?? {
              full_name: profilesById.get(profile.id)?.full_name ?? profile.full_name,
              email: profilesById.get(profile.id)?.email ?? profile.email,
              created_at: profilesById.get(profile.id)?.created_at ?? profile.created_at,
              access_status: profilesById.get(profile.id)?.access_status ?? profile.access_status,
              disabled_at: profilesById.get(profile.id)?.disabled_at ?? profile.disabled_at,
            },
          };
        }

        return {
          user_id: profile.id,
          profiles: {
            full_name: profile.full_name,
            email: profile.email,
            created_at: profile.created_at,
            access_status: profile.access_status,
            disabled_at: profile.disabled_at,
          },
          hasAcceptedAgreement,
          acceptedTerms: acceptedTermsByUserId.get(profile.id) ?? [],
          lastLoggedInAt: profile.last_sign_in_at,
          is_visible_to_clients: false,
        };
      })
      .sort((left, right) =>
        (left.profiles?.full_name ?? left.profiles?.email ?? left.user_id).localeCompare(
          right.profiles?.full_name ?? right.profiles?.email ?? right.user_id,
        ),
      );
  }, [acceptancesQuery.data, bumProfilesQuery.data, profilesQuery.data, termsVersionsQuery.data]);

  const isLoading =
    bumProfilesQuery.isLoading || profilesQuery.isLoading || termsVersionsQuery.isLoading || acceptancesQuery.isLoading;
  const hasError =
    bumProfilesQuery.isError || profilesQuery.isError || termsVersionsQuery.isError || acceptancesQuery.isError;
  const filteredBums = useMemo(() => {
    return bumSummaries.filter((bum) => {
      const matchesType =
        typeFilter === "ALL" ||
        (typeFilter === "VISIBLE_TO_CLIENTS" && Boolean(bum.is_visible_to_clients)) ||
        (typeFilter === "AGREEMENT_ACCEPTED" && Boolean(bum.hasAcceptedAgreement)) ||
        (typeFilter === "PROFILE_READY" &&
          Boolean(
            bum.headline ||
              bum.bio ||
              bum.industries?.length ||
              bum.relationship_companies?.length ||
              bum.worked_with_companies?.length,
          )) ||
        (typeFilter === "HIDDEN" && !bum.is_visible_to_clients) ||
        (typeFilter === "DISABLED" && isBumDisabled(bum));

      const matchesQuery = [
        bum.profiles?.full_name,
        bum.profiles?.email,
        bum.headline,
        bum.bio,
        ...(bum.industries ?? []),
        ...(bum.relationship_companies ?? []),
        ...(bum.worked_with_companies ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchesType && matchesQuery;
    });
  }, [bumSummaries, query, typeFilter]);

  const visibleBums = getPageItems(filteredBums, bumPage, ADMIN_BUMS_PAGE_SIZE);

  return (
    <div>
      <PageHeader title="Bums" description="Review Bum background, coverage, and agreement status">
        <Button onClick={() => setInviteOpen(true)}><Plus className="h-4 w-4 mr-2" /> Invite Bum</Button>
      </PageHeader>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Bum</DialogTitle>
            <DialogDescription>
              Send a Clerk invitation that tags the new account as a Bum when they sign up.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-bum-email">Email</Label>
              <Input
                id="invite-bum-email"
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="bum@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-bum-name">Name</Label>
              <Input
                id="invite-bum-name"
                value={inviteName}
                onChange={(event) => setInviteName(event.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-bum-note">Internal note</Label>
              <Textarea
                id="invite-bum-note"
                rows={3}
                value={inviteNote}
                onChange={(event) => setInviteNote(event.target.value)}
                placeholder="Optional context for the audit trail"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)} disabled={inviteMutation.isPending}>Cancel</Button>
            <Button onClick={() => inviteMutation.mutate()} disabled={inviteMutation.isPending || !inviteEmail.trim()}>
              {inviteMutation.isPending ? "Sending..." : "Send Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(240px,0.8fr)] md:items-end mb-6">
        <div className="relative min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Bums, emails, industries, or relationship companies…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
          />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={typeFilter} onValueChange={(value: BumTypeFilter) => setTypeFilter(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {bumTypeFilters.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Loading live bum accounts...
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && hasError ? (
          <Card>
            <CardContent className="pt-6 text-sm text-destructive">
              Unable to load live bum accounts from Supabase.
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !hasError && !filteredBums.length ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              {bumSummaries.length ? "No Bum profiles match your current filters." : "No synced bum users exist yet."}
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !hasError ? visibleBums.map((bum) => (
          <div key={bum.user_id} className={`space-y-2 rounded-lg ${isBumDisabled(bum) ? "border border-destructive/30 bg-destructive/5 p-3" : ""}`}>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {isBumDisabled(bum) ? <Badge variant="destructive">Disabled</Badge> : null}
              <AdminBumEditButton bum={bum} />
              <Button
                size="sm"
                variant={isBumDisabled(bum) ? "default" : "destructive"}
                disabled={bumDisabledMutation.isPending}
                onClick={() => bumDisabledMutation.mutate({ userId: bum.user_id, disabled: !isBumDisabled(bum) })}
              >
                {isBumDisabled(bum) ? <Power className="mr-2 h-4 w-4" /> : <PowerOff className="mr-2 h-4 w-4" />}
                {isBumDisabled(bum) ? "Enable" : "Disable"}
              </Button>
            </div>
            <BumProfileCard profile={bum} showAdminMeta />
          </div>
        )) : null}

        {!isLoading && !hasError ? (
          <PaginationControls page={bumPage} pageSize={ADMIN_BUMS_PAGE_SIZE} totalItems={filteredBums.length} onPageChange={setBumPage} />
        ) : null}
      </div>
    </div>
  );
}
