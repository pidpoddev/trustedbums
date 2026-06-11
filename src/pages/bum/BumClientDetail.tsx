import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Briefcase, Building2, Calendar, DollarSign, Download, ExternalLink, FileText, Heart, Sparkles, Target } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import {
  getTrainingMaterialAttachmentUrl,
  listBumSavedItems,
  listCompanies,
  listCustomerTargets,
  listMarketplaceOpportunities,
  listPublishedClientTrainingMaterials,
  setBumSavedItem,
  type TrainingMaterialAttachment,
} from "@/lib/portalApi";
import { formatDateForTimeZone } from "@/lib/timezone";
import { cn } from "@/lib/utils";

function money(value: number | null | undefined) {
  return value ? `$${Number(value).toLocaleString()}` : "Value pending";
}

export default function BumClientDetail() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const timeZone = useUserTimeZone();

  const companiesQuery = useQuery({
    queryKey: ["bum-client-companies"],
    queryFn: listCompanies,
  });
  const opportunitiesQuery = useQuery({
    queryKey: ["bum-marketplace-opportunities"],
    queryFn: listMarketplaceOpportunities,
  });
  const targetsQuery = useQuery({
    queryKey: ["bum-customer-targets"],
    queryFn: () => listCustomerTargets(null),
  });
  const savedItemsQuery = useQuery({
    queryKey: ["bum-saved-items", user?.id],
    queryFn: () => listBumSavedItems(user!.id),
    enabled: Boolean(user?.id),
  });
  const trainingsQuery = useQuery({
    queryKey: ["bum-client-training-materials", id],
    queryFn: () => listPublishedClientTrainingMaterials(id),
    enabled: Boolean(id),
  });

  const client = useMemo(
    () => (companiesQuery.data ?? []).find((company) => company.id === id && company.relationship_stage === "CLIENT") ?? null,
    [companiesQuery.data, id],
  );
  const opportunities = useMemo(
    () => (opportunitiesQuery.data ?? []).filter((opportunity) => opportunity.company_id === id),
    [id, opportunitiesQuery.data],
  );
  const targets = useMemo(
    () => (targetsQuery.data ?? []).filter((target) => target.client_company_id === id),
    [id, targetsQuery.data],
  );
  const trainings = trainingsQuery.data ?? [];
  const savedClientIds = useMemo(
    () => new Set((savedItemsQuery.data ?? []).filter((item) => item.item_type === "CLIENT" && item.is_saved).map((item) => item.client_company_id).filter(Boolean)),
    [savedItemsQuery.data],
  );
  const isHearted = savedClientIds.has(id);
  const topTraining = trainings.find((training) => /first call|intro|deck|overview/i.test(`${training.title} ${training.description ?? ""}`));
  const totalOpenValue = [...opportunities, ...targets].reduce((sum, item) => sum + Number(item.estimated_deal_value ?? 0), 0);
  const categories = Array.from(new Set([...opportunities.map((item) => item.expected_product_service), ...targets.map((item) => item.expected_product_service)].filter(Boolean)));

  const saveMutation = useMutation({
    mutationFn: (saved: boolean) => setBumSavedItem(user!, { itemType: "CLIENT", itemId: id }, saved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bum-saved-items", user?.id] });
    },
    onError: (error) => {
      toast({
        title: "Unable to update heart",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const downloadAttachment = async (attachment: TrainingMaterialAttachment) => {
    try {
      const url = await getTrainingMaterialAttachmentUrl(attachment);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast({
        title: "Unable to open attachment",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (companiesQuery.isLoading) {
    return <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">Loading client...</div>;
  }

  if (!client) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/bum/clients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Clients
          </Link>
        </Button>
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">Client not found.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/bum/clients">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Clients
        </Link>
      </Button>

      <PageHeader title={client.name} description={client.ideal_customer_profile ?? "Client details, active opportunities, target accounts, and training assets."}>
        <Button
          variant={isHearted ? "default" : "outline"}
          onClick={() => saveMutation.mutate(!isHearted)}
          disabled={!user || saveMutation.isPending}
        >
          <Heart className={cn("mr-2 h-4 w-4", isHearted && "fill-current")} />
          {isHearted ? "Hearted" : "Heart"}
        </Button>
        <Button asChild>
          <Link to={`/bum/reverse-opportunities?clientId=${encodeURIComponent(client.id)}`}>
            <Sparkles className="mr-2 h-4 w-4" />
            Recommend customer
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Open opportunities</p>
          <p className="mt-1 text-2xl font-semibold">{opportunities.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Target accounts</p>
          <p className="mt-1 text-2xl font-semibold">{targets.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pipeline value</p>
          <p className="mt-1 text-2xl font-semibold">{totalOpenValue ? `$${totalOpenValue.toLocaleString()}` : "Pending"}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Training assets</p>
          <p className="mt-1 text-2xl font-semibold">{trainings.length}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Client profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Client</Badge>
                {client.website ? <Badge variant="outline">{client.website}</Badge> : null}
                {categories.slice(0, 5).map((category) => (
                  <Badge key={category} variant="outline">{category}</Badge>
                ))}
              </div>
              {client.description ? <p>{client.description}</p> : null}
              {client.ideal_customer_profile ? (
                <div>
                  <p className="font-medium">Ideal customer profile</p>
                  <p className="mt-1 text-muted-foreground">{client.ideal_customer_profile}</p>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {client.website ? (
                  <Button size="sm" variant="outline" asChild>
                    <a href={`https://${client.website}`} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Website
                    </a>
                  </Button>
                ) : null}
                {client.linkedin_company_url ? (
                  <Button size="sm" variant="outline" asChild>
                    <a href={client.linkedin_company_url} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      LinkedIn
                    </a>
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display">Active opportunities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {opportunities.map((opportunity) => (
                <div key={opportunity.id} className="rounded-md border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium">{opportunity.target_account_name}</p>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{opportunity.opportunity_description ?? "No description provided."}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline">{money(opportunity.estimated_deal_value)}</Badge>
                        <Badge variant="outline">{opportunity.expected_timeline || "Timeline pending"}</Badge>
                        {opportunity.expected_product_service ? <Badge variant="secondary">{opportunity.expected_product_service}</Badge> : null}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/bum/opportunities/${opportunity.id}`}>
                        <Briefcase className="mr-2 h-4 w-4" />
                        Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
              {!opportunities.length ? <p className="text-sm text-muted-foreground">No formal open opportunities for this Client yet.</p> : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display">Target accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {targets.slice(0, 8).map((target) => (
                <div key={target.id} className="rounded-md border p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium">{target.target_companies?.name ?? target.target_account_name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{target.expected_product_service ?? target.notes ?? "Target account"}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline">{target.status.replaceAll("_", " ")}</Badge>
                        <Badge variant="outline">{target.priority} priority</Badge>
                        <Badge variant="outline">{money(target.estimated_deal_value)}</Badge>
                      </div>
                    </div>
                    <Target className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              ))}
              {!targets.length ? <p className="text-sm text-muted-foreground">No target accounts are visible for this Client yet.</p> : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Training assets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topTraining ? (
                <div className="rounded-md border border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{topTraining.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{topTraining.description ?? "Priority client read-ahead asset."}</p>
                      <Badge className="mt-2" variant="secondary">Suggested first-call asset</Badge>
                    </div>
                  </div>
                </div>
              ) : null}

              {trainings.map((training) => (
                <div key={training.id} className="rounded-md border p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-secondary p-2">
                      <FileText className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{training.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{training.description ?? "No description provided."}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {training.technology ?? "General"} · Updated {formatDateForTimeZone(training.updated_at, timeZone)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {training.resource_url ? (
                          <Button size="sm" variant="outline" asChild>
                            <a href={training.resource_url} target="_blank" rel="noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open link
                            </a>
                          </Button>
                        ) : null}
                        {(training.training_material_attachments ?? []).map((attachment) => (
                          <Button key={attachment.id} size="sm" variant="outline" onClick={() => void downloadAttachment(attachment)}>
                            <Download className="mr-2 h-4 w-4" />
                            {attachment.file_name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {trainingsQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading training assets...</p> : null}
              {!trainingsQuery.isLoading && !trainings.length ? <p className="text-sm text-muted-foreground">No published training assets for this Client yet.</p> : null}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/bum/trainings">
                  <FileText className="mr-2 h-4 w-4" />
                  Open full library
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button asChild>
                <Link to={`/bum/reverse-opportunities?clientId=${encodeURIComponent(client.id)}`}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Recommend customer
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/bum/opportunities?search=${encodeURIComponent(client.name)}`}>
                  <Briefcase className="mr-2 h-4 w-4" />
                  View matching opportunities
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
