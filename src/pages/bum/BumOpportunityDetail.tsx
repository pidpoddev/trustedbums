import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { MeetingTranscriptsSection } from "@/components/MeetingTranscriptsSection";
import {
  claimStatusConfig,
  type ClaimStatus,
  type RelationshipStrength,
  isClaimStatus,
  isRelationshipStrength,
} from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import {
  createOpportunityClaim,
  getMarketplaceOpportunity,
  listOpportunityClaims,
  updateOpportunityClaimStatus,
} from "@/lib/portalApi";
import { ArrowLeft, Plus, Activity } from "lucide-react";
import { toast } from "sonner";

interface ActivityEntry {
  id: string;
  contact: string;
  status: ClaimStatus;
  note: string;
  at: string;
}

export default function BumOpportunityDetail() {
  const { id } = useParams();
  const { user } = useAuth();
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
  const opp = opportunityQuery.data;
  const claims = claimsQuery.data ?? [];

  const [contact, setContact] = useState("");
  const [company, setCompany] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [strength, setStrength] = useState<RelationshipStrength>("MODERATE");
  const [note, setNote] = useState("");

  const [updateClaimId, setUpdateClaimId] = useState("");
  const [updateStatus, setUpdateStatus] = useState<ClaimStatus>("SCHEDULED");
  const [updateNote, setUpdateNote] = useState("");

  const createClaimMutation = useMutation({
    mutationFn: () =>
      createOpportunityClaim(user!, {
        opportunityId: opp!.id,
        contactName: contact,
        contactCompany: company,
        contactEmail,
        relationshipStrength: strength,
        note,
      }),
    onSuccess: (claim) => {
      queryClient.invalidateQueries({ queryKey: ["opportunity-claims", id] });
      toast.success(`Claim requested for ${claim.contact_name} at ${claim.contact_company}`);
      setContact("");
      setCompany("");
      setContactEmail("");
      setNote("");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to request claim");
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
        <Link to="/bum/opportunities">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
      </div>
    );
  }

  const activity: ActivityEntry[] = claims.map((claim) => ({
    id: claim.id,
    contact: `${claim.contact_name} @ ${claim.contact_company}`,
    status: claim.status,
    note: claim.note || `Claim requested with ${claim.relationship_strength.toLowerCase()} relationship strength.`,
    at: new Date(claim.updated_at ?? claim.created_at).toLocaleDateString(),
  }));

  const submitRecommendation = () => {
    if (!contact.trim() || !company.trim()) {
      toast.error("Contact name and company are required");
      return;
    }
    createClaimMutation.mutate();
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
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Request a claim
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Contact name</Label>
              <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className="grid gap-2">
              <Label>Company</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Inc" />
            </div>
            <div className="grid gap-2">
              <Label>Email if known</Label>
              <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="jane@example.com" />
            </div>
            <div className="grid gap-2">
              <Label>Relationship strength</Label>
              <Select
                value={strength}
                onValueChange={(value) => {
                  if (isRelationshipStrength(value)) {
                    setStrength(value);
                  }
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STRONG">Strong</SelectItem>
                  <SelectItem value="MODERATE">Moderate</SelectItem>
                  <SelectItem value="WEAK">Weak</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Why they're a fit</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Context the client should know..." rows={3} />
            </div>
            <Button onClick={submitRecommendation} className="w-full" disabled={createClaimMutation.isPending}>
              Request claim
            </Button>
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
                  {Object.entries(claimStatusConfig).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>What happened</Label>
              <Textarea value={updateNote} onChange={(e) => setUpdateNote(e.target.value)} placeholder="e.g. Initial conversation occurred; they're interested in a demo." rows={3} />
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
