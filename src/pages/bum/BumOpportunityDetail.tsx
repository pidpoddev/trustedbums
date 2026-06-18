import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { openConversationDock } from "@/lib/conversationDock";
import { trackAnalyticsEvent } from "@/lib/analyticsEvents";
import { buildLinkedInFirstConnectionsUrl } from "@/lib/linkedinSearch";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { MeetingTranscriptsSection } from "@/components/MeetingTranscriptsSection";
import { claimDeclineReasonLabel, claimStatusConfig, type ClaimStatus, type RelationshipStrength, isClaimStatus, isRelationshipStrength } from "@/lib/claimConfig";
import { useAuth } from "@/contexts/AuthContext";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import {
  buildTopLineShareSchedule,
  calculateTopLineSharePercent,
  createOpportunityClaim,
  createOpportunityQuestion,
  DEFAULT_BUM_COMMISSION_POOL_PERCENT,
  deriveDefaultBumSharePercent,
  getMarketplaceOpportunity,
  listPotentialDecisionMakerMatchesForOpportunity,
  listOpportunityClaims,
  listOpportunityQuestionsForBum,
  type OpportunityClaimContactBuyingRole,
  type PotentialDecisionMakerMatchRecord,
  updateOpportunityClaimStatus,
} from "@/lib/portalApi";
import { formatDateForTimeZone } from "@/lib/timezone";
import { ArrowLeft, Plus, Activity, MessageSquare, ExternalLink, UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ActivityEntry {
  id: string;
  contact: string;
  status: ClaimStatus;
  note: string;
  at: string;
}

const bumClaimUpdateStatuses: ClaimStatus[] = ["SCHEDULED", "MEETING_HELD", "EXPIRED", "DISPUTED", "CLOSED"];

interface ClaimContactDraft {
  id: string;
  contactName: string;
  contactCompany: string;
  contactTitle: string;
  contactEmail: string;
  linkedinUrl: string;
  buyingRole: OpportunityClaimContactBuyingRole;
  relationshipStrength: RelationshipStrength;
  isInnerCircle: boolean;
  note: string;
}

const buyingRoleOptions: Array<{ value: OpportunityClaimContactBuyingRole; label: string }> = [
  { value: "DECISION_MAKER", label: "Decision Maker" },
  { value: "PURCHASING_LEADER", label: "Purchasing Leader" },
  { value: "TECHNICAL_LEADER", label: "Technical / Development Leader" },
  { value: "CHAMPION", label: "Champion" },
  { value: "BLOCKER", label: "Blocker" },
  { value: "INFLUENCER", label: "Influencer" },
  { value: "OTHER", label: "Other stakeholder" },
];

const relationshipStrengthOptions: Array<{ value: RelationshipStrength; label: string }> = [
  { value: "STRONG", label: "Trusted friend or direct relationship" },
  { value: "MODERATE", label: "Trusted business associate" },
  { value: "WEAK", label: "Acquaintance" },
];

function makeClaimContactDraft(overrides: Partial<ClaimContactDraft> = {}): ClaimContactDraft {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? String(Date.now() + Math.random()),
    contactName: "",
    contactCompany: "",
    contactTitle: "",
    contactEmail: "",
    linkedinUrl: "",
    buyingRole: "DECISION_MAKER",
    relationshipStrength: "MODERATE",
    isInnerCircle: false,
    note: "",
    ...overrides,
  };
}

function buyingRoleLabel(value: OpportunityClaimContactBuyingRole) {
  return buyingRoleOptions.find((option) => option.value === value)?.label ?? value.replaceAll("_", " ");
}

export default function BumOpportunityDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const timeZone = useUserTimeZone();
  const queryClient = useQueryClient();
  const opportunityQuery = useQuery({
    queryKey: ["bum-marketplace-opportunity", id],
    queryFn: () => getMarketplaceOpportunity(id!),
    enabled: Boolean(id),
  });
  const claimsQuery = useQuery({
    queryKey: ["opportunity-claims", id],
    queryFn: () => listOpportunityClaims(id),
    enabled: Boolean(id),
  });
  const questionsQuery = useQuery({
    queryKey: ["opportunity-questions", id, user?.id],
    queryFn: () => listOpportunityQuestionsForBum(id!),
    enabled: Boolean(id),
  });
  const decisionMakerMatchesQuery = useQuery({
    queryKey: ["potential-decision-maker-matches", id],
    queryFn: () => listPotentialDecisionMakerMatchesForOpportunity(id!),
    enabled: Boolean(id),
  });
  const opp = opportunityQuery.data;
  const claims = claimsQuery.data ?? [];
  const questions = questionsQuery.data ?? [];
  const decisionMakerMatches = decisionMakerMatchesQuery.data ?? [];
  const myClaims = claims.filter((claim) => claim.bum_user_id === user?.id);
  const defaultSoloSchedule = buildTopLineShareSchedule(
    opp?.client_pay_programs,
    DEFAULT_BUM_COMMISSION_POOL_PERCENT,
  );
  const defaultSplitSchedule = buildTopLineShareSchedule(
    opp?.client_pay_programs,
    deriveDefaultBumSharePercent(2),
  );

  const [claimContacts, setClaimContacts] = useState<ClaimContactDraft[]>(() => [makeClaimContactDraft()]);
  const [note, setNote] = useState("");
  const [canSponsorCall, setCanSponsorCall] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [decisionMakerMatchForClaim, setDecisionMakerMatchForClaim] = useState<PotentialDecisionMakerMatchRecord | null>(null);
  const [claimedDecisionMakerMatchIds, setClaimedDecisionMakerMatchIds] = useState<Set<string>>(new Set());
  const claimFormRef = useRef<HTMLDivElement | null>(null);

  const [updateClaimId, setUpdateClaimId] = useState("");
  const [updateStatus, setUpdateStatus] = useState<ClaimStatus>("SCHEDULED");
  const [updateNote, setUpdateNote] = useState("");

  const createClaimMutation = useMutation({
    mutationFn: () => {
      const normalizedContacts = claimContacts
        .map((claimContact) => ({
          ...claimContact,
          contactName: claimContact.contactName.trim(),
          contactCompany: claimContact.contactCompany.trim() || opp!.target_account_name,
          contactTitle: claimContact.contactTitle.trim(),
          contactEmail: claimContact.contactEmail.trim(),
          linkedinUrl: claimContact.linkedinUrl.trim(),
          note: claimContact.note.trim(),
        }))
        .filter((claimContact) => claimContact.contactName);
      const primaryContact = normalizedContacts[0];

      return createOpportunityClaim(user!, {
        opportunityId: opp!.id,
        contactName: primaryContact.contactName,
        contactCompany: primaryContact.contactCompany,
        contactEmail: primaryContact.contactEmail,
        relationshipStrength: primaryContact.relationshipStrength,
        canSponsorCall,
        note,
        contacts: normalizedContacts.map((claimContact, index) => ({
          contactName: claimContact.contactName,
          contactCompany: claimContact.contactCompany,
          contactTitle: claimContact.contactTitle,
          contactEmail: claimContact.contactEmail,
          linkedinUrl: claimContact.linkedinUrl,
          buyingRole: claimContact.buyingRole,
          relationshipStrength: claimContact.relationshipStrength,
          isInnerCircle: claimContact.isInnerCircle,
          note: claimContact.note,
          isPrimary: index === 0,
        })),
      });
    },
    onSuccess: async (claim) => {
      trackAnalyticsEvent("trustedbums_claim_requested", {
        opportunity_origin: "opportunity_detail",
        relationship_strength: claim.relationship_strength,
        claim_contact_count: claim.opportunity_claim_contacts?.length ?? claimContacts.filter((contact) => contact.contactName.trim()).length,
        has_blocker: claim.opportunity_claim_contacts?.some((contact) => contact.buying_role === "BLOCKER") ?? claimContacts.some((contact) => contact.buyingRole === "BLOCKER" && contact.contactName.trim()),
        has_purchasing_leader: claim.opportunity_claim_contacts?.some((contact) => contact.buying_role === "PURCHASING_LEADER") ?? claimContacts.some((contact) => contact.buyingRole === "PURCHASING_LEADER" && contact.contactName.trim()),
        inner_circle_contact_count: claim.opportunity_claim_contacts?.filter((contact) => contact.is_inner_circle).length ?? claimContacts.filter((contact) => contact.isInnerCircle && contact.contactName.trim()).length,
      });
      if (decisionMakerMatchForClaim) {
        queryClient.invalidateQueries({ queryKey: ["opportunity-contact-picker", user?.id] });
        queryClient.invalidateQueries({ queryKey: ["bum-represented-contacts", user?.id] });
        setClaimedDecisionMakerMatchIds((current) => new Set(current).add(decisionMakerMatchForClaim.id));
      }
      queryClient.invalidateQueries({ queryKey: ["opportunity-claims", id] });
      toast.success(
        (claim.opportunity_claim_contacts?.length ?? 0) > 1
          ? `Claim requested with ${claim.opportunity_claim_contacts?.length} stakeholders`
          : `Claim requested for ${claim.contact_name} at ${claim.contact_company}`,
      );
      setClaimContacts([makeClaimContactDraft()]);
      setNote("");
      setCanSponsorCall(false);
      setDecisionMakerMatchForClaim(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to request claim");
    },
  });

  const questionMutation = useMutation({
    mutationFn: () =>
      createOpportunityQuestion(user!, {
        opportunityId: opp!.id,
        question: questionText,
      }),
    onSuccess: (question) => {
      queryClient.invalidateQueries({ queryKey: ["opportunity-questions", id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["conversation-threads"] });
      toast.success("Conversation started with the client team");
      setQuestionText("");
      openConversationDock(question.conversation_thread_id ?? undefined);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to send question");
    },
  });

  const updateClaimMutation = useMutation({
    mutationFn: () => updateOpportunityClaimStatus(user!, updateClaimId, updateStatus, updateNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunity-claims", id] });
      toast.success("Claim update logged");
      setUpdateClaimId("");
      setUpdateNote("");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to update claim");
    },
  });

  if (opportunityQuery.isLoading) {
    return <div className="text-sm text-muted-foreground">Loading live opportunity...</div>;
  }

  if (!opp) {
    return (
      <div className="space-y-6">
        <PageHeader title="Opportunity not found" />
        <Button variant="outline" asChild>
          <Link to="/bum/opportunities">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>
      </div>
    );
  }

  const activity: ActivityEntry[] = claims.map((claim) => ({
    id: claim.id,
    contact: `${claim.contact_name} @ ${claim.contact_company}`,
    status: claim.status,
    note: claim.note || `Claim requested with ${claim.relationship_strength.toLowerCase()} relationship strength.`,
    at: formatDateForTimeZone(claim.updated_at ?? claim.created_at, timeZone),
  }));

  const submitRecommendation = () => {
    if (!claimContacts.some((claimContact) => claimContact.contactName.trim())) {
      toast.error("Add at least one person you can introduce");
      return;
    }
    if (!canSponsorCall) {
      toast.error("Confirm that you can sponsor a customer call before claiming.");
      return;
    }
    createClaimMutation.mutate();
  };

  const startClaimFromDecisionMakerMatch = (match: PotentialDecisionMakerMatchRecord) => {
    setClaimContacts([
      makeClaimContactDraft({
        contactName: match.person_name,
        contactCompany: match.company || opp!.target_account_name,
        contactTitle: match.title ?? "",
        linkedinUrl: match.linkedin_url_candidate ?? "",
        buyingRole: "DECISION_MAKER",
        relationshipStrength: match.rating === "Priority A" ? "STRONG" : "MODERATE",
        note: [
          match.recommended_bum_ask ? `Warm-path ask: ${match.recommended_bum_ask}` : null,
          match.evidence_summary ? `Research context: ${match.evidence_summary}` : null,
        ].filter(Boolean).join("\n\n"),
      }),
    ]);
    setNote([
      match.recommended_bum_ask ? "I know this person and can help with the warm-path ask." : "I know this person and can recommend a path into this opportunity.",
      match.evidence_summary ? `Research context: ${match.evidence_summary}` : null,
    ].filter(Boolean).join("\n\n"));
    setDecisionMakerMatchForClaim(match);
    requestAnimationFrame(() => claimFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const updateClaimContact = (draftId: string, patch: Partial<ClaimContactDraft>) => {
    setClaimContacts((current) =>
      current.map((claimContact) => (claimContact.id === draftId ? { ...claimContact, ...patch } : claimContact)),
    );
  };

  const addClaimContact = () => {
    setClaimContacts((current) => [
      ...current,
      makeClaimContactDraft({
        contactCompany: opp?.target_account_name ?? "",
        buyingRole: current.length === 0 ? "DECISION_MAKER" : "INFLUENCER",
      }),
    ]);
  };

  const removeClaimContact = (draftId: string) => {
    setClaimContacts((current) =>
      current.length === 1 ? current : current.filter((claimContact) => claimContact.id !== draftId),
    );
  };

  const submitQuestion = () => {
    if (!questionText.trim()) {
      toast.error("Add a question before sending it");
      return;
    }

    questionMutation.mutate();
  };

  const submitUpdate = () => {
    if (!updateClaimId || !updateNote.trim()) {
      toast.error("Claim and note are required");
      return;
    }
    updateClaimMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <Link to="/bum/opportunities" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to opportunities
      </Link>

      <PageHeader
        title={opp.target_account_name}
        description={`${opp.companies?.name ?? "Trusted Bums client"} • ${opp.commission_rate}% commission`}
      >
        <Button size="sm" variant="outline" asChild>
          <a href={buildLinkedInFirstConnectionsUrl(opp.target_account_name)} target="_blank" rel="noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Find connections
          </a>
        </Button>
        <StatusBadge label="Open" variant="success" />
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>About this opportunity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>{opp.opportunity_description ?? "No opportunity description has been provided yet."}</p>
          <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <div>
              <p className="font-medium text-foreground">Expected product / service</p>
              <p>{opp.expected_product_service ?? "Not specified"}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Estimated deal value</p>
              <p>{opp.estimated_deal_value ? `$${Number(opp.estimated_deal_value).toLocaleString()}` : "Pending"}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Timeline</p>
              <p>{opp.expected_timeline ?? "Not specified"}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Business unit</p>
              <p>{opp.business_unit ?? "Not specified"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="font-medium text-foreground">Commission duration</p>
              <p>{opp.commission_duration}</p>
            </div>
            {opp.client_pay_programs ? (
              <div className="md:col-span-2 rounded-xl border bg-muted/30 p-3">
                <p className="font-medium text-foreground">{opp.client_pay_programs.name}</p>
                <p className="mt-1">{opp.client_pay_programs.commission_basis}</p>
                <p className="mt-1">{opp.client_pay_programs.payment_terms}</p>
              </div>
            ) : null}
            <div className="md:col-span-2 rounded-xl border bg-primary/5 p-3 text-sm">
              <p className="font-medium text-foreground">Default Bum economics</p>
              <p className="mt-1 text-muted-foreground">
                Solo Bum default: {DEFAULT_BUM_COMMISSION_POOL_PERCENT}% of the Trusted Bums commission.
                If two Bums split the opportunity by default, each starts at {deriveDefaultBumSharePercent(2)}% of the Trusted Bums commission.
                Admin can adjust the Bum share until a meeting is logged against the opportunity.
              </p>
              {defaultSoloSchedule.length ? (
                <p className="mt-2 text-muted-foreground">
                  Top-line equivalent:
                  {" "}
                  solo {defaultSoloSchedule.map((item) => `${item.label} ${item.topLinePercent}%`).join(", ")}
                  {" · "}
                  split {defaultSplitSchedule.map((item) => `${item.label} ${item.topLinePercent}%`).join(", ")}
                </p>
              ) : (
                <p className="mt-2 text-muted-foreground">
                  Top-line equivalent at the current opportunity rate:
                  {" "}
                  solo {calculateTopLineSharePercent(opp.commission_rate, DEFAULT_BUM_COMMISSION_POOL_PERCENT)}%
                  {" · "}
                  split {calculateTopLineSharePercent(opp.commission_rate, deriveDefaultBumSharePercent(2))}% each
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {decisionMakerMatches.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Potential decision-maker matches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {decisionMakerMatches.map((match) => (
              <div key={match.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{match.person_name}</p>
                  <StatusBadge label={match.rating} variant={match.rating === "Priority A" ? "success" : "info"} />
                  <StatusBadge label={`${match.score}/100`} variant="secondary" />
                  <StatusBadge label={`Where this came from: ${match.source_label}`} variant="outline" />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[match.title, match.company, match.primary_function].filter(Boolean).join(" · ")}
                </p>
                {match.evidence_summary ? (
                  <p className="mt-3 text-sm">{match.evidence_summary}</p>
                ) : null}
                {match.recommended_bum_ask ? (
                  <div className="mt-3 rounded-md bg-muted/30 p-3 text-sm">
                    <p className="font-medium">Best warm-path ask</p>
                    <p className="mt-1 text-muted-foreground">{match.recommended_bum_ask}</p>
                  </div>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {match.linkedin_url_candidate ? (
                    <Button size="sm" variant="outline" asChild>
                      <a href={match.linkedin_url_candidate} target="_blank" rel="noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View LinkedIn
                      </a>
                    </Button>
                  ) : null}
                  {match.source_urls.map((sourceUrl) => (
                    <Button key={sourceUrl} size="sm" variant="outline" asChild>
                      <a href={sourceUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Source
                      </a>
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                    disabled={!user || claimedDecisionMakerMatchIds.has(match.id)}
                    onClick={() => startClaimFromDecisionMakerMatch(match)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {claimedDecisionMakerMatchIds.has(match.id) ? "Claim requested" : "I know this person - Claim this Opportunity"}
                  </Button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  LinkedIn check: {match.linkedin_manual_check.replace(/_/g, " ")} · Current company: {match.current_company_verified}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" /> Request more information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="opportunity-question">Question for the client</Label>
            <Textarea
              id="opportunity-question"
              rows={4}
              value={questionText}
              onChange={(event) => setQuestionText(event.target.value)}
              placeholder="Ask what you need to know before deciding whether to pursue or claim this opportunity."
            />
          </div>
          <Button onClick={submitQuestion} disabled={questionMutation.isPending || !questionText.trim()}>
            {questionMutation.isPending ? "Sending..." : "Send question"}
          </Button>

          <div className="space-y-3">
            <p className="text-sm font-medium">Questions and answers</p>
            {questions.map((question) => {
              const isMine = question.bum_user_id === user?.id;
              const isPublic = question.response_visibility === "PUBLIC";

              return (
                <div key={question.id} className="rounded-md border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label={question.status === "ANSWERED" ? "Answered" : "Waiting on client"} variant={question.status === "ANSWERED" ? "success" : "warning"} />
                    {isPublic ? <StatusBadge label="Shared with all Bums" variant="info" /> : null}
                    {!isPublic && isMine && question.response ? <StatusBadge label="Only visible to you" variant="secondary" /> : null}
                  </div>
                  <p className="mt-3 text-sm font-medium">{question.question}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Asked {formatDateForTimeZone(question.created_at, timeZone)}{isMine ? " by you" : " by another Bum"}
                  </p>
                  {question.response ? (
                    <div className="mt-3 rounded-md bg-muted/30 p-3 text-sm">
                      <p className="font-medium">Client response</p>
                      <p className="mt-1 text-muted-foreground">{question.response}</p>
                      {question.responded_at ? (
                        <p className="mt-2 text-xs text-muted-foreground">Answered {formatDateForTimeZone(question.responded_at, timeZone)}</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
            {!questions.length ? (
              <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No one has asked a question about this opportunity yet.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {myClaims.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Your current share</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myClaims.map((claim) => {
              const shareSchedule = buildTopLineShareSchedule(
                claim.opportunity_registrations?.client_pay_programs ?? opp.client_pay_programs,
                claim.bum_share_percent,
              );
              const fallbackTopLine = calculateTopLineSharePercent(
                claim.opportunity_registrations?.commission_rate ?? opp.commission_rate,
                claim.bum_share_percent,
              );

              return (
                <div key={claim.id} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{claim.contact_name} @ {claim.contact_company}</p>
                    <StatusBadge
                      label={`${Number(claim.bum_share_percent ?? 0).toLocaleString()}% of TB commission`}
                      variant="info"
                    />
                    {claim.meeting_locked ? <StatusBadge label="Share locked" variant="secondary" /> : null}
                  </div>
                  {claim.status === "DECLINED" ? (
                    <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                      <p className="font-medium">Why this Claim was declined</p>
                      <p className="mt-1">
                        {claimDeclineReasonLabel(claim.decline_reason_code) ?? "Other"}
                        {claim.decline_reason_note ? `: ${claim.decline_reason_note}` : ""}
                      </p>
                    </div>
                  ) : null}
                  <p className="mt-2 text-sm text-muted-foreground">
                    {shareSchedule.length
                      ? shareSchedule.map((item) => `${item.label}: ${item.topLinePercent}% top line`).join(" · ")
                      : `Current top-line equivalent: ${fallbackTopLine}%`}
                  </p>
                  {claim.opportunity_claim_contacts?.length ? (
                    <div className="mt-4 space-y-2 rounded-lg bg-muted/30 p-3">
                      <p className="text-sm font-medium">Introductions included</p>
                      {claim.opportunity_claim_contacts
                        .slice()
                        .sort((left, right) => left.sort_order - right.sort_order)
                        .map((claimContact) => (
                          <div key={claimContact.id} className="rounded-md border bg-background p-3 text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium">{claimContact.contact_name}</span>
                              {claimContact.is_inner_circle ? <StatusBadge label="Inner Circle" variant="success" /> : null}
                              <StatusBadge label={buyingRoleLabel(claimContact.buying_role)} variant={claimContact.buying_role === "BLOCKER" ? "warning" : "secondary"} />
                            </div>
                            <p className="mt-1 text-muted-foreground">
                              {[claimContact.contact_title, claimContact.contact_company].filter(Boolean).join(" · ")}
                            </p>
                            {claimContact.note ? <p className="mt-2 text-muted-foreground">{claimContact.note}</p> : null}
                          </div>
                        ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card ref={claimFormRef}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Request a claim
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {decisionMakerMatchForClaim ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950">
                <p className="font-medium">Claiming via {decisionMakerMatchForClaim.person_name}</p>
                <p className="mt-1">
                  Add their email if you know it, tighten the relationship context, then submit the claim.
                  This will also save them to your Contacts with this opportunity attached.
                </p>
              </div>
            ) : null}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">People you can introduce</p>
                  <p className="text-xs text-muted-foreground">
                    Add every important stakeholder you know: decision makers, purchasing leaders, champions, and blockers.
                  </p>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={addClaimContact}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add person
                </Button>
              </div>
              {claimContacts.map((claimContact, index) => (
                <div key={claimContact.id} className="space-y-4 rounded-xl border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">Stakeholder {index + 1}</p>
                    {claimContacts.length > 1 ? (
                      <Button type="button" size="icon" variant="ghost" aria-label="Remove stakeholder" onClick={() => removeClaimContact(claimContact.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Name</Label>
                      <Input
                        value={claimContact.contactName}
                        onChange={(event) => updateClaimContact(claimContact.id, { contactName: event.target.value })}
                        placeholder={index === 0 ? "Craig Cotton" : "Chris Palmer"}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Stakeholder role</Label>
                      <Select
                        value={claimContact.buyingRole}
                        onValueChange={(value: OpportunityClaimContactBuyingRole) => updateClaimContact(claimContact.id, { buyingRole: value })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {buyingRoleOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Title</Label>
                      <Input
                        value={claimContact.contactTitle}
                        onChange={(event) => updateClaimContact(claimContact.id, { contactTitle: event.target.value })}
                        placeholder={claimContact.buyingRole === "PURCHASING_LEADER" ? "VP of Purchasing" : "Decision maker, VP, executive sponsor"}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Company</Label>
                      <Input
                        value={claimContact.contactCompany}
                        onChange={(event) => updateClaimContact(claimContact.id, { contactCompany: event.target.value })}
                        placeholder={opp.target_account_name}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Email if known</Label>
                      <Input
                        value={claimContact.contactEmail}
                        onChange={(event) => updateClaimContact(claimContact.id, { contactEmail: event.target.value })}
                        placeholder="name@example.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>LinkedIn if known</Label>
                      <Input
                        value={claimContact.linkedinUrl}
                        onChange={(event) => updateClaimContact(claimContact.id, { linkedinUrl: event.target.value })}
                        placeholder="https://www.linkedin.com/in/..."
                      />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                      <Label>Relationship strength</Label>
                      <Select
                        value={claimContact.relationshipStrength}
                        onValueChange={(value) => {
                          if (isRelationshipStrength(value)) {
                            updateClaimContact(claimContact.id, { relationshipStrength: value });
                          }
                        }}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {relationshipStrengthOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3 md:col-span-2">
                      <Checkbox
                        id={`claim-inner-circle-${claimContact.id}`}
                        checked={claimContact.isInnerCircle}
                        onCheckedChange={(checked) => updateClaimContact(claimContact.id, { isInnerCircle: checked === true })}
                      />
                      <div className="space-y-1">
                        <Label htmlFor={`claim-inner-circle-${claimContact.id}`}>Inner Circle contact</Label>
                        <p className="text-xs text-muted-foreground">
                          Use this only for your strongest trusted direct relationships. Inner Circle is capped at 20 contacts for now.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Why this person matters</Label>
                    <Textarea
                      value={claimContact.note}
                      onChange={(event) => updateClaimContact(claimContact.id, { note: event.target.value })}
                      placeholder={
                        claimContact.buyingRole === "BLOCKER"
                          ? "Example: Neil leads development and may prefer to self-develop instead of buying."
                          : "Example: Chris owns purchasing sign-off and would need to negotiate the agreement."
                      }
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-2">
              <Label>Overall claim context</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="How you would introduce the buying group and what the client should know before engaging them." rows={3} />
            </div>
            <div className="grid gap-2">
              <Label>I can sponsor a call with this customer</Label>
              <p className="text-sm leading-5 text-muted-foreground">
                Claim only when you can personally help move this customer into a real conversation. If you are still researching the path, ask a question or save your notes before submitting.
              </p>
              <Select value={canSponsorCall ? "yes" : "no"} onValueChange={(value) => setCanSponsorCall(value === "yes")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={submitRecommendation} className="w-full" disabled={createClaimMutation.isPending || !claimContacts.some((claimContact) => claimContact.contactName.trim()) || !canSponsorCall}>
              {createClaimMutation.isPending ? "Requesting..." : decisionMakerMatchForClaim ? "Claim this opportunity" : "Request claim"}
            </Button>
            {!canSponsorCall ? (
              <p className="text-center text-xs text-muted-foreground">
                The claim button enables after you confirm you can sponsor the customer call.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" /> Log an update
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Claim</Label>
              <Select value={updateClaimId} onValueChange={setUpdateClaimId}>
                <SelectTrigger><SelectValue placeholder="Which claim is this about?" /></SelectTrigger>
                <SelectContent>
                  {claims.map((claim) => (
                    <SelectItem key={claim.id} value={claim.id}>
                      {claim.contact_name} @ {claim.contact_company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>New status</Label>
              <Select
                value={updateStatus}
                onValueChange={(value) => {
                  if (isClaimStatus(value)) {
                    setUpdateStatus(value);
                  }
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {bumClaimUpdateStatuses.map((key) => (
                    <SelectItem key={key} value={key}>{claimStatusConfig[key].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>What happened</Label>
              <Textarea value={updateNote} onChange={(e) => setUpdateNote(e.target.value)} placeholder="e.g. Initial conversation occurred; they are interested in an intro call." rows={3} />
            </div>
            <Button onClick={submitUpdate} className="w-full" variant="secondary" disabled={updateClaimMutation.isPending || !claims.length}>
              Log update
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activity.map((a) => (
              <div key={a.id} className="flex items-start gap-3 border-b last:border-0 pb-3 last:pb-0">
                <StatusBadge {...claimStatusConfig[a.status]} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{a.contact}</p>
                  <p className="text-sm text-muted-foreground">{a.note}</p>
                  <p className="text-xs text-muted-foreground mt-1">{a.at}</p>
                </div>
              </div>
            ))}
            {!activity.length ? (
              <p className="text-sm text-muted-foreground">No claims have been requested for this opportunity yet.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <MeetingTranscriptsSection
        filters={{ opportunityRegistrationId: opp.id }}
        description="Teams transcripts and meeting notes that Client, Admin, and Bums can reference for this opportunity."
      />
    </div>
  );
}
