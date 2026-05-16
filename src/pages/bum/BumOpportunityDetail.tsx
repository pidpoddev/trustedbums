import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import {
  claimStatusConfig,
  type ClaimStatus,
  type RelationshipStrength,
  isClaimStatus,
  isRelationshipStrength,
} from "@/data/mockData";
import { useIntroClaims } from "@/hooks/use-intro-claims";
import { useAuth } from "@/contexts/AuthContext";
import { getMarketplaceOpportunity } from "@/lib/portalApi";
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
  const opportunityQuery = useQuery({
    queryKey: ["bum-marketplace-opportunity", id],
    queryFn: () => getMarketplaceOpportunity(id!),
    enabled: Boolean(id),
  });
  const { introClaims, addIntroClaim, updateIntroClaimStatus } = useIntroClaims();
  const opp = opportunityQuery.data;

  // Recommendation form
  const [contact, setContact] = useState("");
  const [company, setCompany] = useState("");
  const [strength, setStrength] = useState<RelationshipStrength>("MODERATE");
  const [note, setNote] = useState("");

  // Status update form
  const [updateContact, setUpdateContact] = useState("");
  const [updateStatus, setUpdateStatus] = useState<ClaimStatus>("SCHEDULED");
  const [updateNote, setUpdateNote] = useState("");

  const [activity, setActivity] = useState<ActivityEntry[]>([]);

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

  const claims = introClaims.filter((claim) => claim.opportunityId === opp.id);

  const submitRecommendation = () => {
    if (!contact || !company) {
      toast.error("Contact name and company are required");
      return;
    }
    const claim = addIntroClaim({
      opportunityId: opp.id,
      opportunityTitle: opp.target_account_name,
      bumAlias: user?.name ?? "Trusted Bum",
      contact,
      company,
      strength,
      note,
    });
    setActivity((a) => [
      {
        id: `a-${claim.id}`,
        contact: claim.contact,
        status: claim.status,
        note: `Recommended (${claim.strength}): ${claim.note || "No additional context"}`,
        at: claim.createdAt,
      },
      ...a,
    ]);
    toast.success(`Recommended ${contact} at ${company}`);
    setContact("");
    setCompany("");
    setNote("");
  };

  const submitUpdate = () => {
    if (!updateContact || !updateNote) {
      toast.error("Contact and note are required");
      return;
    }
    updateIntroClaimStatus(updateContact, updateStatus);
    setActivity((a) => [
      {
        id: `a${Date.now()}`,
        contact: updateContact,
        status: updateStatus,
        note: updateNote,
        at: new Date().toISOString().slice(0, 10),
      },
      ...a,
    ]);
    toast.success("Update logged");
    setUpdateContact("");
    setUpdateNote("");
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
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Recommend a customer
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
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Context the client should know…" rows={3} />
            </div>
            <Button onClick={submitRecommendation} className="w-full">
              Submit recommendation
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
              <Label>Contact</Label>
              <Input value={updateContact} onChange={(e) => setUpdateContact(e.target.value)} placeholder="Which intro is this about?" />
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
              <Textarea value={updateNote} onChange={(e) => setUpdateNote(e.target.value)} placeholder="e.g. Initial conversation occurred — they're interested in a demo." rows={3} />
            </div>
            <Button onClick={submitUpdate} className="w-full" variant="secondary">
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
          </div>

          {claims.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-3 text-sm">Existing claims on this opportunity</h4>
              <div className="space-y-2">
                {claims.map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{c.contact}</span>
                      <span className="text-muted-foreground"> @ {c.company} — {c.bumAlias}</span>
                    </div>
                    <StatusBadge {...claimStatusConfig[c.status]} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
