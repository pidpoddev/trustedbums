import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Edit3, Link2, Plus, Power, PowerOff, ScrollText, Search, ShieldQuestion, Users, X } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { DealRegistrationBetaSettings } from "@/components/DealRegistrationBetaSettings";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import {
  approveAdminCompanyAccessRequest,
  approveAdminCompanyAccessRequestWithProof,
  createClientCompany,
  denyAdminCompanyAccessRequest,
  setAdminClientCompanyDisabled,
  updateAdminClientCompany,
  listAdminProspectRecommendations,
  listAdminCompanyAccessRequests,
  listCompanies,
  listOpportunityRegistrations,
  listProfiles,
  listProspectContacts,
  listTermsAcceptances,
  type CompanyRecord,
  type CompanyRelationshipStage,
  type ClientCompanyAccessRequestRecord,
  type TermsAcceptance,
} from "@/lib/portalApi";
import {
  dealRegistrationBetaStatusLabel,
  dealRegistrationMethodLabel,
  dealRegistrationProviderLabel,
  normalizeDealRegistrationConfig,
} from "@/lib/dealRegistration";
import { formatDateForTimeZone, formatDateTimeForTimeZone } from "@/lib/timezone";
import { Textarea } from "@/components/ui/textarea";

function formatList(values?: string[] | null) {
  return (values ?? []).filter(Boolean).join(", ");
}

function stageVariant(stage: CompanyRelationshipStage) {
  if (stage === "CLIENT") {
    return "success" as const;
  }

  if (stage === "INACTIVE") {
    return "warning" as const;
  }

  return "info" as const;
}

type ClientTypeFilter = "ALL" | "ACTIVE_CLIENT" | "HAS_OPPORTUNITIES" | "BUM_CONNECTED" | "INACTIVE";

const clientTypeFilters: { value: ClientTypeFilter; label: string }[] = [
  { value: "ALL", label: "All client types" },
  { value: "ACTIVE_CLIENT", label: "Active clients" },
  { value: "HAS_OPPORTUNITIES", label: "With opportunities" },
  { value: "BUM_CONNECTED", label: "With Bum connections" },
  { value: "INACTIVE", label: "Inactive" },
];

type AdminAccessReviewAction = "approve" | "deny";

const adminProofCategories = [
  { value: "company_identity", label: "Company identity verified" },
  { value: "domain_control", label: "Domain control verified" },
  { value: "authorized_requester", label: "Requester authority verified" },
  { value: "contract_or_customer_record", label: "Contract or customer record verified" },
  { value: "manual_admin_override", label: "Manual admin override" },
];

function requestTypeLabel(type: ClientCompanyAccessRequestRecord["request_type"]) {
  return type.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function requestNeedsProof(type: ClientCompanyAccessRequestRecord["request_type"]) {
  return type === "PUBLIC_EMAIL_COMPANY" || type === "RELATED_DOMAIN";
}

function requestedRoleLabel(role: ClientCompanyAccessRequestRecord["requested_role"]) {
  return role ? role.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Client Member";
}

function accessReviewPreview(request: ClientCompanyAccessRequestRecord) {
  if (request.request_type === "PUBLIC_EMAIL_COMPANY") {
    return [
      `Create or approve client company: ${request.requested_company_name ?? "Missing company name"}`,
      `Assign requester as ${requestedRoleLabel(request.requested_role)} for that company`,
      "Mark requester access approved and clear disabled state",
    ];
  }

  if (request.request_type === "RELATED_DOMAIN") {
    return [
      `Add related domain: ${request.requested_domain ?? "Missing requested domain"}`,
      `Attach domain to: ${request.companies?.name ?? request.requested_company_name ?? "selected client company"}`,
      "Leave company access authority unchanged unless a separate request updates it",
    ];
  }

  if (request.request_type === "SAME_DOMAIN_ACCESS") {
    return [
      `Assign requester as ${requestedRoleLabel(request.requested_role)}`,
      `Attach requester to: ${request.companies?.name ?? request.requested_company_name ?? "selected client company"}`,
      "Mark requester access approved and clear disabled state",
    ];
  }

  if (request.request_type === "BUM_SIGNUP") {
    return [
      "Approve requester as a Bum",
      "Remove client-company assignment",
      "Mark requester access approved and clear disabled state",
    ];
  }

  return ["Record the admin review decision and audit event."];
}

function TermsAcceptanceDetailButton({ acceptance, acceptedBy }: { acceptance: TermsAcceptance; acceptedBy: string }) {
  const timeZone = useUserTimeZone();
  const terms = acceptance.terms_versions;
  const version = terms?.version ?? "Recorded terms";
  const title = terms?.title ?? "Terms";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-auto min-h-8 justify-start gap-2 whitespace-normal text-left text-xs">
          <ScrollText className="h-3.5 w-3.5 shrink-0" />
          <span>
            <span className="font-medium">{version}</span>
            <span className="text-muted-foreground"> by {acceptedBy} on {formatDateForTimeZone(acceptance.accepted_at, timeZone)}</span>
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
          <DialogDescription>
            {version} accepted by {acceptedBy} on {formatDateTimeForTimeZone(acceptance.accepted_at, timeZone)}.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[65vh] overflow-y-auto rounded-md border bg-muted/20 p-4 text-sm leading-6">
          {terms?.body ? <div className="whitespace-pre-wrap">{terms.body}</div> : <p className="text-muted-foreground">The full terms body is not available for this recorded acceptance.</p>}
          {terms?.faq_body ? (
            <div className="mt-6 border-t pt-4">
              <p className="mb-2 font-medium">FAQ</p>
              <div className="whitespace-pre-wrap text-muted-foreground">{terms.faq_body}</div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AdminClientEditButton({ company }: { company: CompanyRecord }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: company.name ?? "",
    website: company.website ?? "",
    linkedinCompanyUrl: company.linkedin_company_url ?? "",
    relationshipStage: company.relationship_stage as CompanyRelationshipStage,
    dealRegistrationConfig: normalizeDealRegistrationConfig(company.deal_registration_config),
  });

  function openEditor() {
    setForm({
      name: company.name ?? "",
      website: company.website ?? "",
      linkedinCompanyUrl: company.linkedin_company_url ?? "",
      relationshipStage: company.relationship_stage as CompanyRelationshipStage,
      dealRegistrationConfig: normalizeDealRegistrationConfig(company.deal_registration_config),
    });
    setOpen(true);
  }

  const updateMutation = useMutation({
    mutationFn: () =>
      updateAdminClientCompany(user!, company.id, {
        name: form.name,
        website: form.website,
        linkedin_company_url: form.linkedinCompanyUrl,
        relationship_stage: form.relationshipStage,
        deal_registration_config: form.dealRegistrationConfig,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      setOpen(false);
      toast({ title: "Client updated", description: "The company data was saved." });
    },
    onError: (error) => {
      toast({
        title: "Unable to update client",
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
            <DialogTitle className="font-display">Edit client data</DialogTitle>
            <DialogDescription>Update the company profile and lifecycle stage admins use across the portal.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Company name</Label>
                <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input value={form.website} onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))} placeholder="https://company.com" />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn company URL</Label>
                <Input value={form.linkedinCompanyUrl} onChange={(event) => setForm((current) => ({ ...current, linkedinCompanyUrl: event.target.value }))} placeholder="https://linkedin.com/company/..." />
              </div>
              <div className="space-y-2">
                <Label>Relationship stage</Label>
                <Select value={form.relationshipStage} onValueChange={(value) => setForm((current) => ({ ...current, relationshipStage: value as CompanyRelationshipStage }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROSPECT">Prospect</SelectItem>
                    <SelectItem value="INVITED">Invited</SelectItem>
                    <SelectItem value="CLIENT">Client</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DealRegistrationBetaSettings
              value={form.dealRegistrationConfig}
              onChange={(dealRegistrationConfig) => setForm((current) => ({ ...current, dealRegistrationConfig }))}
              disabled={updateMutation.isPending}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={updateMutation.isPending}>Cancel</Button>
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending || !form.name.trim()}>
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AdminClients() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ClientTypeFilter>("ALL");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientWebsite, setNewClientWebsite] = useState("");
  const [reviewDialog, setReviewDialog] = useState<{
    request: ClientCompanyAccessRequestRecord;
    action: AdminAccessReviewAction;
  } | null>(null);
  const [reviewProofCategory, setReviewProofCategory] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const timeZone = useUserTimeZone();
  const companiesQuery = useQuery({ queryKey: ["admin-companies"], queryFn: () => listCompanies({ includeInactive: true }) });
  const profilesQuery = useQuery({ queryKey: ["admin-profiles"], queryFn: listProfiles });
  const opportunitiesQuery = useQuery({
    queryKey: ["admin-opportunities", "All"],
    queryFn: () => listOpportunityRegistrations("All"),
  });
  const recommendationsQuery = useQuery({
    queryKey: ["admin-prospect-recommendations"],
    queryFn: listAdminProspectRecommendations,
  });
  const acceptancesQuery = useQuery({
    queryKey: ["admin-terms-acceptances"],
    queryFn: listTermsAcceptances,
  });
  const contactsQuery = useQuery({
    queryKey: ["admin-prospect-contacts"],
    queryFn: listProspectContacts,
  });
  const accessRequestsQuery = useQuery({
    queryKey: ["admin-company-access-requests"],
    queryFn: () => listAdminCompanyAccessRequests(user!),
    enabled: Boolean(user?.role === "ADMIN"),
  });
  const createClientMutation = useMutation({
    mutationFn: () => createClientCompany(user!, { name: newClientName, website: newClientWebsite }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      setCreateDialogOpen(false);
      setNewClientName("");
      setNewClientWebsite("");
      toast({ title: "Client created", description: "The company was added as a live client record." });
    },
    onError: (error) => {
      toast({
        title: "Unable to create client",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });
  const approveAccessRequestMutation = useMutation({
    mutationFn: (review: { requestId: string; proofCategory?: string; reviewNote?: string }) =>
      review.proofCategory || review.reviewNote
        ? approveAdminCompanyAccessRequestWithProof(user!, review.requestId, review)
        : approveAdminCompanyAccessRequest(user!, review.requestId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-company-access-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-companies"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-profiles"] }),
      ]);
      closeReviewDialog();
      toast({ title: "Access approved", description: "The request was approved and audited." });
    },
    onError: (error) => {
      toast({
        title: "Unable to approve request",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });
  const denyAccessRequestMutation = useMutation({
    mutationFn: (review: { requestId: string; proofCategory?: string; reviewNote?: string }) =>
      denyAdminCompanyAccessRequest(user!, review.requestId, review.reviewNote, review.proofCategory),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-company-access-requests"] });
      closeReviewDialog();
      toast({ title: "Access denied", description: "The request was denied and audited." });
    },
    onError: (error) => {
      toast({
        title: "Unable to deny request",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });
  const clientDisabledMutation = useMutation({
    mutationFn: ({ companyId, disabled }: { companyId: string; disabled: boolean }) =>
      setAdminClientCompanyDisabled(user!, companyId, disabled),
    onSuccess: async (_company, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-companies"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-profiles"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-opportunities"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-reports-companies"] }),
        queryClient.invalidateQueries({ queryKey: ["client-visible-bum-profiles"] }),
      ]);
      toast({
        title: variables.disabled ? "Client disabled" : "Client enabled",
        description: variables.disabled
          ? "The client and its related records are hidden outside Admin."
          : "The client is available again outside Admin.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to update client access",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const companySummaries = useMemo(() => {
    const profiles = profilesQuery.data ?? [];
    const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
    const opportunities = opportunitiesQuery.data ?? [];
    const recommendations = recommendationsQuery.data ?? [];
    const contacts = contactsQuery.data ?? [];
    const acceptances = acceptancesQuery.data ?? [];

    const summaries = (companiesQuery.data ?? []).map((company) => {
      const users = profiles.filter((profile) => profile.company_id === company.id);
      const activeUsers = users.filter((profile) => (profile.access_status ?? "APPROVED") === "APPROVED" && !profile.disabled_at);
      const companyOpportunities = opportunities.filter((opportunity) => opportunity.company_id === company.id);
      const companyRecommendations = recommendations.filter((recommendation) => recommendation.company_id === company.id);
      const companyContacts = contacts.filter((contact) => contact.company_id === company.id);
      const companyAcceptances = acceptances
        .filter((acceptance) => acceptance.company_id === company.id)
        .map((acceptance) => ({
          acceptance,
          acceptedAt: acceptance.accepted_at,
          acceptedBy:
            profilesById.get(acceptance.user_id)?.full_name ??
            profilesById.get(acceptance.user_id)?.email ??
            "Client user",
        }))
        .sort((left, right) => right.acceptedAt.localeCompare(left.acceptedAt));
      const recommenderNames = Array.from(
        new Set(
          companyRecommendations.map(
            (recommendation) => recommendation.profiles?.full_name ?? recommendation.profiles?.email ?? recommendation.bum_user_id,
          ),
        ),
      );
      const uniqueKnownContacts = Array.from(new Set(companyContacts.map((contact) => contact.full_name.trim().toLowerCase()))).length;
      const overlapCount = Math.max(0, recommenderNames.length - 1);

      return {
        ...company,
        userCount: users.length,
        activeUserCount: activeUsers.length,
        primaryEmail: activeUsers[0]?.email ?? users[0]?.email ?? "No users yet",
        latestUserLoginAt: activeUsers
          .map((profile) => profile.last_sign_in_at)
          .filter(Boolean)
          .sort((left, right) => new Date(right!).getTime() - new Date(left!).getTime())[0] ?? null,
        users: users
          .map((profile) => ({
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            role: profile.role,
            access_status: profile.access_status,
            disabled_at: profile.disabled_at,
            last_sign_in_at: profile.last_sign_in_at,
          }))
          .sort((left, right) => {
            const rightTime = right.last_sign_in_at ? new Date(right.last_sign_in_at).getTime() : 0;
            const leftTime = left.last_sign_in_at ? new Date(left.last_sign_in_at).getTime() : 0;
            return rightTime - leftTime || (left.full_name ?? left.email ?? left.id).localeCompare(right.full_name ?? right.email ?? right.id);
          }),
        opportunityCount: companyOpportunities.length,
        introCount: companyOpportunities.filter((opportunity) => opportunity.status === "Accepted").length,
        recommenderNames,
        contactCount: uniqueKnownContacts,
        overlapCount,
        inviteOwners: Array.from(new Set(companyRecommendations.map((recommendation) => recommendation.invite_owner))),
        primaryContacts: companyContacts.filter((contact) => contact.is_primary).slice(0, 3),
        acceptedTerms: companyAcceptances,
      };
    });
    const clientSummaries = summaries.filter((company) =>
      company.relationship_stage === "CLIENT" ||
      company.userCount > 0 ||
      company.opportunityCount > 0 ||
      company.acceptedTerms.length > 0,
    );

    return (clientSummaries.length ? clientSummaries : summaries)
      .sort((left, right) => right.opportunityCount - left.opportunityCount || left.name.localeCompare(right.name));
  }, [acceptancesQuery.data, companiesQuery.data, contactsQuery.data, opportunitiesQuery.data, profilesQuery.data, recommendationsQuery.data]);

  const isLoading =
    companiesQuery.isLoading ||
    profilesQuery.isLoading ||
    opportunitiesQuery.isLoading ||
    recommendationsQuery.isLoading ||
    acceptancesQuery.isLoading ||
    contactsQuery.isLoading;
  const hasError =
    companiesQuery.isError ||
    profilesQuery.isError ||
    opportunitiesQuery.isError ||
    recommendationsQuery.isError ||
    acceptancesQuery.isError ||
    contactsQuery.isError;

  function openReviewDialog(request: ClientCompanyAccessRequestRecord, action: AdminAccessReviewAction) {
    setReviewDialog({ request, action });
    setReviewProofCategory("");
    setReviewNote("");
  }

  function closeReviewDialog() {
    setReviewDialog(null);
    setReviewProofCategory("");
    setReviewNote("");
  }

  const selectedRequest = reviewDialog?.request ?? null;
  const selectedAction = reviewDialog?.action ?? "approve";
  const selectedRequestNeedsProof = selectedRequest ? requestNeedsProof(selectedRequest.request_type) : false;
  const reviewNoteRequired = selectedAction === "deny" || selectedRequestNeedsProof;
  const reviewSubmitDisabled =
    approveAccessRequestMutation.isPending ||
    denyAccessRequestMutation.isPending ||
    !selectedRequest ||
    (selectedRequestNeedsProof && !reviewProofCategory) ||
    (reviewNoteRequired && !reviewNote.trim());

  function submitAccessReview() {
    if (!selectedRequest) return;
    const review = {
      requestId: selectedRequest.id,
      proofCategory: reviewProofCategory || undefined,
      reviewNote: reviewNote.trim() || undefined,
    };

    if (selectedAction === "approve") {
      approveAccessRequestMutation.mutate(review);
      return;
    }

    denyAccessRequestMutation.mutate(review);
  }
  const filteredCompanies = useMemo(() => {
    return companySummaries.filter((company) => {
      const matchesType =
        typeFilter === "ALL" ||
        (typeFilter === "ACTIVE_CLIENT" && company.relationship_stage === "CLIENT") ||
        (typeFilter === "HAS_OPPORTUNITIES" && company.opportunityCount > 0) ||
        (typeFilter === "BUM_CONNECTED" && company.recommenderNames.length > 0) ||
        (typeFilter === "INACTIVE" && company.relationship_stage === "INACTIVE");

      const matchesQuery = [
        company.name,
        company.primaryEmail,
        company.description,
        company.ideal_customer_profile,
        dealRegistrationMethodLabel(normalizeDealRegistrationConfig(company.deal_registration_config).method),
        dealRegistrationProviderLabel(normalizeDealRegistrationConfig(company.deal_registration_config).provider),
        dealRegistrationBetaStatusLabel(normalizeDealRegistrationConfig(company.deal_registration_config).beta_status),
        formatList(company.target_industries),
        formatList(company.target_regions),
        company.recommenderNames.join(" "),
        company.primaryContacts.map((contact) => contact.full_name).join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchesType && matchesQuery;
    });
  }, [companySummaries, query, typeFilter]);

  return (
    <div>
      <PageHeader title="Clients" description="Manage companies, prospect overlap, and who owns the path into each account.">
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Client</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Add client company</DialogTitle>
              <DialogDescription>Create a live client company record in Supabase.</DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                createClientMutation.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="new-client-name">Company Name</Label>
                <Input id="new-client-name" value={newClientName} onChange={(event) => setNewClientName(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-client-website">Website</Label>
                <Input id="new-client-website" value={newClientWebsite} onChange={(event) => setNewClientWebsite(event.target.value)} placeholder="https://company.com" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createClientMutation.isPending || !newClientName.trim()}>
                  {createClientMutation.isPending ? "Creating..." : "Create Client"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(240px,0.8fr)] md:items-end mb-6">
        <div className="relative min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients, emails, Bums, or contacts…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
          />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={typeFilter} onValueChange={(value: ClientTypeFilter) => setTypeFilter(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {clientTypeFilters.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {accessRequestsQuery.data?.length ? (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center gap-2">
              <ShieldQuestion className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Company Access Review</h2>
            </div>
            <div className="grid gap-3">
              {accessRequestsQuery.data.map((request) => (
                <div key={request.id} className="flex flex-col gap-3 rounded-md border p-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <p className="font-medium">{request.email}</p>
                      {requestNeedsProof(request.request_type) ? <Badge variant="secondary">Proof required</Badge> : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {requestTypeLabel(request.request_type)} · {request.requested_company_name ?? request.companies?.name ?? "No company"} · {request.requested_domain ?? request.email_domain ?? "No domain"}
                    </p>
                    <p className="text-xs text-muted-foreground">Requested role: {requestedRoleLabel(request.requested_role)}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTimeForTimeZone(request.created_at, timeZone)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={approveAccessRequestMutation.isPending || denyAccessRequestMutation.isPending}
                      onClick={() => openReviewDialog(request, "approve")}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={approveAccessRequestMutation.isPending || denyAccessRequestMutation.isPending}
                      onClick={() => openReviewDialog(request, "deny")}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Deny
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={Boolean(reviewDialog)} onOpenChange={(open) => { if (!open) closeReviewDialog(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">
              {selectedAction === "approve" ? "Approve access request" : "Deny access request"}
            </DialogTitle>
            <DialogDescription>
              Review the requested authority change before saving the admin decision.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest ? (
            <div className="space-y-5">
              <div className="grid gap-3 rounded-md border bg-muted/20 p-3 text-sm md:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Requester</p>
                  <p className="break-words">{selectedRequest.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Request type</p>
                  <p>{requestTypeLabel(selectedRequest.request_type)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Company</p>
                  <p>{selectedRequest.requested_company_name ?? selectedRequest.companies?.name ?? "No company"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Domain</p>
                  <p>{selectedRequest.requested_domain ?? selectedRequest.email_domain ?? "No domain"}</p>
                </div>
              </div>

              <div className="space-y-2 rounded-md border p-3">
                <p className="text-sm font-medium">Mutation preview</p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {accessReviewPreview(selectedRequest).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              {selectedRequestNeedsProof ? (
                <div className="space-y-2">
                  <Label htmlFor="access-review-proof">Proof category</Label>
                  <Select value={reviewProofCategory} onValueChange={setReviewProofCategory}>
                    <SelectTrigger id="access-review-proof">
                      <SelectValue placeholder="Choose verified proof" />
                    </SelectTrigger>
                    <SelectContent>
                      {adminProofCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Required for public-email company and related-domain reviews.
                  </p>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="access-review-note">
                  Reviewer note{reviewNoteRequired ? "" : " (optional)"}
                </Label>
                <Textarea
                  id="access-review-note"
                  rows={4}
                  value={reviewNote}
                  onChange={(event) => setReviewNote(event.target.value)}
                  placeholder={selectedAction === "approve" ? "Summarize the evidence checked before approval." : "Explain why this request is being denied."}
                />
                {reviewNoteRequired ? (
                  <p className="text-xs text-muted-foreground">A note is required for denials and proof-backed reviews.</p>
                ) : null}
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeReviewDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={selectedAction === "deny" ? "outline" : "default"}
              disabled={reviewSubmitDisabled}
              onClick={submitAccessReview}
            >
              {selectedAction === "approve" ? "Approve and audit" : "Deny and audit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Loading live client companies...
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && hasError ? (
          <Card>
            <CardContent className="pt-6 text-sm text-destructive">
              Unable to load client companies from Supabase.
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !hasError ? filteredCompanies.map((company) => {
          const dealRegistrationConfig = normalizeDealRegistrationConfig(company.deal_registration_config);
          return (
            <Card key={company.id} className={`transition-shadow hover:shadow-md ${company.relationship_stage === "INACTIVE" ? "border-destructive/30 bg-destructive/5" : ""}`}>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-display font-bold text-primary">
                      {company.name[0]}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{company.name}</p>
                          <StatusBadge label={company.relationship_stage} variant={stageVariant(company.relationship_stage)} />
                          {company.relationship_stage === "INACTIVE" ? <Badge variant="destructive">Disabled</Badge> : null}
                          <Badge variant={dealRegistrationConfig.is_beta_enabled ? "secondary" : "outline"}>
                            Deal Reg {dealRegistrationConfig.is_beta_enabled ? "Beta" : dealRegistrationMethodLabel(dealRegistrationConfig.method)}
                          </Badge>
                          {company.linkedin_company_url ? (
                            <Badge variant="outline" className="inline-flex items-center gap-1">
                              <Link2 className="h-3 w-3" /> LinkedIn keyed
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {company.activeUserCount} active user{company.activeUserCount === 1 ? "" : "s"}
                          {company.userCount !== company.activeUserCount ? ` · ${company.userCount - company.activeUserCount} disabled` : ""} · Primary: {company.primaryEmail}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last login: {company.latestUserLoginAt ? formatDateTimeForTimeZone(company.latestUserLoginAt, timeZone) : "Never recorded"}
                        </p>
                      </div>

                      <div className="flex gap-2 flex-wrap text-xs">
                        {company.inviteOwners.includes("BUM") ? <Badge variant="secondary">Bum-led path</Badge> : null}
                        {company.inviteOwners.includes("TRUSTED_BUMS") ? <Badge variant="secondary">Trusted Bums invite</Badge> : null}
                        {!company.inviteOwners.length ? <Badge variant="outline">No prospect recommendations yet</Badge> : null}
                      </div>

                      {company.description ? <p className="max-w-3xl text-sm text-muted-foreground">{company.description}</p> : null}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {(company.target_industries ?? []).map((industry) => <Badge key={industry} variant="secondary">{industry}</Badge>)}
                        {(company.target_regions ?? []).map((region) => <Badge key={region} variant="outline">{region}</Badge>)}
                        {!company.target_industries?.length && !company.target_regions?.length ? <Badge variant="outline">No matching tags yet</Badge> : null}
                      </div>
                      {company.ideal_customer_profile ? <p className="max-w-3xl text-sm text-muted-foreground">ICP: {company.ideal_customer_profile}</p> : null}
                      <p className="max-w-3xl text-sm text-muted-foreground">
                        Deal registration: {dealRegistrationMethodLabel(dealRegistrationConfig.method)}
                        {dealRegistrationConfig.method === "API" ? ` via ${dealRegistrationProviderLabel(dealRegistrationConfig.provider)}` : ""}
                        {" · "}
                        {dealRegistrationBetaStatusLabel(dealRegistrationConfig.beta_status)}
                        {dealRegistrationConfig.approval_mode ? ` · ${dealRegistrationConfig.approval_mode.toLowerCase()} approval tracking` : ""}
                      </p>

                      <div className="grid gap-2 text-sm text-muted-foreground">
                        <p className="inline-flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Recommended by {company.recommenderNames.length ? company.recommenderNames.join(", ") : "nobody yet"}
                        </p>
                        <p>
                          {company.contactCount} known contact{company.contactCount === 1 ? "" : "s"}
                          {company.overlapCount > 0 ? ` · ${company.overlapCount} overlapping Bum connection${company.overlapCount === 1 ? "" : "s"}` : ""}
                        </p>
                        {company.primaryContacts.length ? (
                          <p>
                            Key contacts:{" "}
                            {company.primaryContacts
                              .map((contact) => [contact.full_name, contact.title].filter(Boolean).join(" · "))
                              .join(", ")}
                          </p>
                        ) : null}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {company.users.length ? (
                            company.users.map((profile) => (
                              <Badge key={profile.id} variant={profile.disabled_at || profile.access_status === "DISABLED" ? "destructive" : "outline"}>
                                {(profile.full_name ?? profile.email ?? profile.id)} · {profile.last_sign_in_at ? formatDateForTimeZone(profile.last_sign_in_at, timeZone) : "Never"}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline">No user profiles recorded</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {company.acceptedTerms.length ? (
                            company.acceptedTerms.map((terms) => (
                              <TermsAcceptanceDetailButton key={terms.acceptance.id} acceptance={terms.acceptance} acceptedBy={terms.acceptedBy} />
                            ))
                          ) : (
                            <Badge variant="outline">No accepted terms recorded</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      <AdminClientEditButton company={company} />
                      <Button
                        size="sm"
                        variant={company.relationship_stage === "INACTIVE" ? "default" : "destructive"}
                        disabled={clientDisabledMutation.isPending}
                        onClick={() => clientDisabledMutation.mutate({ companyId: company.id, disabled: company.relationship_stage !== "INACTIVE" })}
                      >
                        {company.relationship_stage === "INACTIVE" ? <Power className="mr-2 h-4 w-4" /> : <PowerOff className="mr-2 h-4 w-4" />}
                        {company.relationship_stage === "INACTIVE" ? "Enable" : "Disable"}
                      </Button>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                      <Link
                        to={`/admin/opportunities?tab=registrations&companyId=${company.id}`}
                        className="font-display text-lg font-bold text-primary underline-offset-4 hover:underline"
                        aria-label={`View ${company.opportunityCount} opportunities for ${company.name}`}
                      >
                        {company.opportunityCount}
                      </Link>
                      <p className="text-xs text-muted-foreground">Opportunities</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold font-display">{company.introCount}</p>
                      <p className="text-xs text-muted-foreground">Accepted</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold font-display">{company.recommenderNames.length}</p>
                      <p className="text-xs text-muted-foreground">Bums Connected</p>
                    </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }) : null}
        {!isLoading && !hasError && !filteredCompanies.length && (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              {companySummaries.length ? "No clients match your current filters." : "No live client companies are available yet."}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
