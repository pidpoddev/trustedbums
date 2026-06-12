import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { DealRegistrationBetaSettings } from "@/components/DealRegistrationBetaSettings";
import { ArrowRight, Copy, FileCheck, KeyRound, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCurrentTermsState } from "@/hooks/use-current-terms";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import {
  createOwnApiAccessKey,
  getOwnClientCompany,
  listOwnApiAccessKeys,
  refreshOwnApiAccessKey,
  revokeOwnApiAccessKey,
  updateOwnClientCompanyProfile,
  updateOwnClientDealRegistrationConfig,
} from "@/lib/portalApi";
import { defaultDealRegistrationConfig, normalizeDealRegistrationConfig } from "@/lib/dealRegistration";
import { formatDateTimeForTimeZone } from "@/lib/timezone";

function listToText(values?: string[] | null) {
  return (values ?? []).join(", ");
}

const CLIENT_PROFILE_DRAFT_PREFIX = "trustedbums:client-company-profile-draft:";

interface ClientCompanyProfileDraft {
  companyName: string;
  website: string;
  linkedinCompanyUrl: string;
  description: string;
  targetIndustries: string;
  targetRegions: string;
  idealCustomerProfile: string;
  savedAt: string;
}

function clientProfileDraftKey(clientId: string) {
  return `${CLIENT_PROFILE_DRAFT_PREFIX}${clientId}`;
}

function canUseBrowserStorage() {
  try {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  } catch {
    return false;
  }
}

function readClientProfileDraft(clientId?: string | null) {
  if (!clientId || !canUseBrowserStorage()) {
    return null;
  }

  try {
    const rawDraft = window.localStorage.getItem(clientProfileDraftKey(clientId));
    if (!rawDraft) {
      return null;
    }

    const draft = JSON.parse(rawDraft) as Partial<ClientCompanyProfileDraft>;
    return draft.savedAt ? (draft as ClientCompanyProfileDraft) : null;
  } catch {
    return null;
  }
}

function writeClientProfileDraft(clientId: string, draft: ClientCompanyProfileDraft) {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(clientProfileDraftKey(clientId), JSON.stringify(draft));
}

function clearClientProfileDraft(clientId?: string | null) {
  if (!clientId || !canUseBrowserStorage()) {
    return;
  }

  window.localStorage.removeItem(clientProfileDraftKey(clientId));
}

function textToList(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

export default function ClientProfile() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const timeZone = useUserTimeZone();
  const { terms, acceptance, hasAcceptedCurrentTerms } = useCurrentTermsState();
  const queryClient = useQueryClient();
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedinCompanyUrl, setLinkedinCompanyUrl] = useState("");
  const [description, setDescription] = useState("");
  const [targetIndustries, setTargetIndustries] = useState("");
  const [targetRegions, setTargetRegions] = useState("");
  const [idealCustomerProfile, setIdealCustomerProfile] = useState("");
  const [dealRegistrationConfig, setDealRegistrationConfig] = useState(defaultDealRegistrationConfig);
  const [hasHydratedForm, setHasHydratedForm] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [restoredDraftAt, setRestoredDraftAt] = useState<string | null>(null);
  const [localDraftSavedAt, setLocalDraftSavedAt] = useState<string | null>(null);
  const [newApiSecret, setNewApiSecret] = useState<string | null>(null);
  const previousClientId = useRef<string | null>(null);
  const canManageDealRegistration = user?.clientAccessRole === "CLIENT_ADMIN" || user?.clientAccessRole === "CLIENT_IT";
  const canManageApiAccess = canManageDealRegistration;

  const companyQuery = useQuery({
    queryKey: ["own-client-company", user?.clientId],
    queryFn: () => getOwnClientCompany(user!),
    enabled: Boolean(user?.id && user?.role === "CLIENT" && user?.clientId),
  });

  const apiAccessQuery = useQuery({
    queryKey: ["own-api-access-keys", user?.id],
    queryFn: () => listOwnApiAccessKeys(),
    enabled: Boolean(user?.id && canManageApiAccess),
  });

  useEffect(() => {
    if (!user?.clientId || previousClientId.current === user.clientId) {
      return;
    }

    previousClientId.current = user.clientId;
    setHasHydratedForm(false);
    setIsDirty(false);
    setRestoredDraftAt(null);
    setLocalDraftSavedAt(null);
  }, [user?.clientId]);

  useEffect(() => {
    if (!companyQuery.isSuccess || hasHydratedForm) {
      return;
    }

    if (!isDirty) {
      const draft = readClientProfileDraft(user?.clientId);
      if (draft) {
        setCompanyName(draft.companyName);
        setWebsite(draft.website);
        setLinkedinCompanyUrl(draft.linkedinCompanyUrl);
        setDescription(draft.description);
        setTargetIndustries(draft.targetIndustries);
        setTargetRegions(draft.targetRegions);
        setIdealCustomerProfile(draft.idealCustomerProfile);
        setRestoredDraftAt(draft.savedAt);
        setLocalDraftSavedAt(draft.savedAt);
        setIsDirty(true);
      } else {
        setCompanyName(companyQuery.data?.name ?? user?.companyName ?? "");
        setWebsite(companyQuery.data?.website ?? "");
        setLinkedinCompanyUrl(companyQuery.data?.linkedin_company_url ?? "");
        setDescription(companyQuery.data?.description ?? "");
        setTargetIndustries(listToText(companyQuery.data?.target_industries));
        setTargetRegions(listToText(companyQuery.data?.target_regions));
        setIdealCustomerProfile(companyQuery.data?.ideal_customer_profile ?? "");
      }

      setDealRegistrationConfig(normalizeDealRegistrationConfig(companyQuery.data?.deal_registration_config));
    }

    setHasHydratedForm(true);
  }, [companyQuery.data, companyQuery.isSuccess, hasHydratedForm, isDirty, user?.clientId, user?.companyName]);

  useEffect(() => {
    if (!isDirty || !hasHydratedForm || !user?.clientId) {
      return;
    }

    const savedAt = new Date().toISOString();
    writeClientProfileDraft(user.clientId, {
      companyName,
      website,
      linkedinCompanyUrl,
      description,
      targetIndustries,
      targetRegions,
      idealCustomerProfile,
      savedAt,
    });
    setLocalDraftSavedAt(savedAt);
  }, [companyName, description, hasHydratedForm, idealCustomerProfile, isDirty, linkedinCompanyUrl, targetIndustries, targetRegions, user?.clientId, website]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const markDirty = () => {
    setIsDirty(true);
    setRestoredDraftAt(null);
  };

  const readinessItems = useMemo(
    () => [
      { label: "Company name", complete: Boolean(companyName.trim()) },
      { label: "Website", complete: Boolean(website.trim()) },
      { label: "LinkedIn page", complete: Boolean(linkedinCompanyUrl.trim()) },
      { label: "Company description", complete: Boolean(description.trim()) },
      { label: "Target industries", complete: textToList(targetIndustries).length > 0 },
      { label: "Target regions", complete: textToList(targetRegions).length > 0 },
      { label: "Ideal customer profile", complete: Boolean(idealCustomerProfile.trim()) },
    ],
    [companyName, description, idealCustomerProfile, linkedinCompanyUrl, targetIndustries, targetRegions, website],
  );
  const completedItems = readinessItems.filter((item) => item.complete).length;
  const readinessPercent = Math.round((completedItems / readinessItems.length) * 100);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("Sign in before updating your company profile.");
      }

      return updateOwnClientCompanyProfile(user, {
        name: companyName,
        website,
        linkedin_company_url: linkedinCompanyUrl,
        description,
        target_industries: textToList(targetIndustries),
        target_regions: textToList(targetRegions),
        ideal_customer_profile: idealCustomerProfile,
      });
    },
    onSuccess: async (company) => {
      clearClientProfileDraft(user?.clientId);
      setCompanyName(company.name ?? "");
      setWebsite(company.website ?? "");
      setLinkedinCompanyUrl(company.linkedin_company_url ?? "");
      setDescription(company.description ?? "");
      setTargetIndustries(listToText(company.target_industries));
      setTargetRegions(listToText(company.target_regions));
      setIdealCustomerProfile(company.ideal_customer_profile ?? "");
      setIsDirty(false);
      setRestoredDraftAt(null);
      setLocalDraftSavedAt(null);
      await queryClient.invalidateQueries({ queryKey: ["own-client-company", user?.clientId] });
      await queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      await refreshUser();
      toast({
        title: "Company profile saved",
        description: "Your company matching profile was updated from live database records.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to save company profile",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveDealRegistrationMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("Sign in before updating deal registration setup.");
      }

      return updateOwnClientDealRegistrationConfig(user, dealRegistrationConfig);
    },
    onSuccess: async (company) => {
      setDealRegistrationConfig(normalizeDealRegistrationConfig(company.deal_registration_config));
      await queryClient.invalidateQueries({ queryKey: ["own-client-company", user?.clientId] });
      await queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      toast({
        title: "Deal registration beta saved",
        description: "The client deal registration process was updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to save deal registration setup",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const isLoading = companyQuery.isLoading;
  const activeApiKey = apiAccessQuery.data?.find((key) => key.status === "ACTIVE") ?? null;

  const createApiKeyMutation = useMutation({
    mutationFn: () => createOwnApiAccessKey(),
    onSuccess: async (result) => {
      setNewApiSecret(result.secret);
      await queryClient.invalidateQueries({ queryKey: ["own-api-access-keys", user?.id] });
      toast({ title: "API token created", description: "Copy it now. The full token is only shown once." });
    },
    onError: (error) => {
      toast({ title: "Unable to create API token", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const refreshApiKeyMutation = useMutation({
    mutationFn: () => refreshOwnApiAccessKey(),
    onSuccess: async (result) => {
      setNewApiSecret(result.secret);
      await queryClient.invalidateQueries({ queryKey: ["own-api-access-keys", user?.id] });
      toast({ title: "API token refreshed", description: "The previous token was revoked. Copy the new token now." });
    },
    onError: (error) => {
      toast({ title: "Unable to refresh API token", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const revokeApiKeyMutation = useMutation({
    mutationFn: (keyId: string) => revokeOwnApiAccessKey(keyId),
    onSuccess: async () => {
      setNewApiSecret(null);
      await queryClient.invalidateQueries({ queryKey: ["own-api-access-keys", user?.id] });
      toast({ title: "API token revoked", description: "The token can no longer access the API." });
    },
    onError: (error) => {
      toast({ title: "Unable to revoke API token", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const copyApiSecret = async () => {
    if (!newApiSecret) return;
    await navigator.clipboard?.writeText(newApiSecret).catch(() => undefined);
    toast({ title: "Token copied", description: "The API token was copied when browser permissions allowed it." });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Company Profile" description="Manage the company and matching details Bums use to understand client fit." />

      <div className="grid max-w-5xl gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <Card>
          <CardHeader><CardTitle className="font-display">Company Details</CardTitle></CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                saveMutation.mutate();
              }}
            >
              {restoredDraftAt ? (
                <div className="rounded-md border border-warning/40 bg-warning/10 p-4 text-sm">
                  <p className="font-medium text-warning">Unsaved draft restored</p>
                  <p className="mt-1 text-muted-foreground">
                    We recovered company profile work saved in this browser at {formatDateTimeForTimeZone(restoredDraftAt, timeZone)}. Save the company profile to make it permanent.
                  </p>
                </div>
              ) : null}

              {isDirty ? (
                <div className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">
                  Unsaved changes are being kept in this browser{localDraftSavedAt ? `, last saved at ${formatDateTimeForTimeZone(localDraftSavedAt, timeZone)}` : ""}.
                </div>
              ) : null}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client-company-name">Company Name</Label>
                  <Input id="client-company-name" value={companyName} onChange={(event) => { markDirty(); setCompanyName(event.target.value); }} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-company-website">Website</Label>
                  <Input id="client-company-website" value={website} onChange={(event) => { markDirty(); setWebsite(event.target.value); }} disabled={isLoading} placeholder="https://yourcompany.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-company-linkedin">LinkedIn Page</Label>
                <Input id="client-company-linkedin" value={linkedinCompanyUrl} onChange={(event) => { markDirty(); setLinkedinCompanyUrl(event.target.value); }} disabled={isLoading} placeholder="https://www.linkedin.com/company/your-company" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-company-description">Company Description</Label>
                <Textarea id="client-company-description" rows={4} value={description} onChange={(event) => { markDirty(); setDescription(event.target.value); }} disabled={isLoading} placeholder="How should Trusted Bums describe your company?" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client-target-industries">Target Industries</Label>
                  <Textarea id="client-target-industries" rows={3} value={targetIndustries} onChange={(event) => { markDirty(); setTargetIndustries(event.target.value); }} disabled={isLoading} placeholder="SaaS, Healthcare, FinTech" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-target-regions">Target Regions</Label>
                  <Textarea id="client-target-regions" rows={3} value={targetRegions} onChange={(event) => { markDirty(); setTargetRegions(event.target.value); }} disabled={isLoading} placeholder="North America, EMEA" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-ideal-customer-profile">Ideal Customer Profile</Label>
                <Textarea id="client-ideal-customer-profile" rows={4} value={idealCustomerProfile} onChange={(event) => { markDirty(); setIdealCustomerProfile(event.target.value); }} disabled={isLoading} placeholder="Buyer titles, company size, triggers, technologies, or customer traits that make a strong match." />
              </div>
              <Button type="submit" disabled={isLoading || saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save Company Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-lg">
              <FileCheck className="h-5 w-5 text-primary" />
              Client Agreement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={hasAcceptedCurrentTerms ? "rounded-md bg-success/10 p-4 text-sm" : "rounded-md bg-warning/10 p-4 text-sm"}>
              <p className={hasAcceptedCurrentTerms ? "font-medium text-success" : "font-medium text-warning"}>
                {hasAcceptedCurrentTerms ? "Current agreement accepted" : "Updated Client Agreement needs review"}
              </p>
              <p className="mt-1 text-muted-foreground">
                {acceptance ? formatDateTimeForTimeZone(acceptance.accepted_at, timeZone) : "Acceptance pending"} · Version {terms?.version ?? "current"}
              </p>
            </div>
            <div className="grid gap-2">
              <Button asChild variant={hasAcceptedCurrentTerms ? "outline" : "default"} className="w-full justify-between">
                <Link to="/client/terms">
                  {hasAcceptedCurrentTerms ? "Review Client Agreement" : "Review and accept Client Agreement"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between">
                <Link to="/client/agreements">
                  View agreement records
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="font-display text-lg">Bum Matching Helper</CardTitle>
              <StatusBadge label={readinessPercent === 100 ? "Ready" : completedItems + "/" + readinessItems.length} variant={readinessPercent === 100 ? "success" : "warning"} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={readinessPercent} aria-label="Company profile matching readiness" />
            <div className="space-y-2">
              {readinessItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
                  <span>{item.label}</span>
                  <StatusBadge label={item.complete ? "Done" : "Missing"} variant={item.complete ? "success" : "outline"} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="font-display">Deal Registration Process</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Beta setup for submitting Bum claims and Bum-originated opportunities into an external client registration portal.
                </p>
              </div>
              <StatusBadge label="Beta" variant="warning" />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {!canManageDealRegistration ? (
              <div className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">
                Only Client Admins and Client IT users can edit this setup. Other client roles can review the current beta process.
              </div>
            ) : null}
            <DealRegistrationBetaSettings
              value={dealRegistrationConfig}
              onChange={setDealRegistrationConfig}
              disabled={isLoading || !canManageDealRegistration || saveDealRegistrationMutation.isPending}
            />
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => saveDealRegistrationMutation.mutate()}
                disabled={isLoading || !canManageDealRegistration || saveDealRegistrationMutation.isPending}
              >
                {saveDealRegistrationMutation.isPending ? "Saving..." : "Save Deal Registration Beta"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {canManageApiAccess ? (
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="font-display flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-primary" />
                    API Access
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Client Admin and Client IT users can generate a company API token for approved integrations.
                  </p>
                </div>
                <StatusBadge label={activeApiKey ? "Active" : "No active token"} variant={activeApiKey ? "success" : "outline"} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-md border p-4">
                  <p className="text-sm font-medium">Token owner</p>
                  <p className="mt-1 text-sm text-muted-foreground">{user?.name ?? user?.email}</p>
                </div>
                <div className="rounded-md border p-4">
                  <p className="text-sm font-medium">Visible token</p>
                  <p className="mt-1 text-sm text-muted-foreground">{activeApiKey?.token_prefix ?? "Only shown after generation"}</p>
                </div>
                <div className="rounded-md border p-4">
                  <p className="text-sm font-medium">Expires</p>
                  <p className="mt-1 text-sm text-muted-foreground">{activeApiKey?.expires_at ? formatDateTimeForTimeZone(activeApiKey.expires_at, timeZone) : "No active token"}</p>
                </div>
              </div>

              {newApiSecret ? (
                <div className="rounded-md border border-warning/40 bg-warning/10 p-4">
                  <Label htmlFor="client-api-token">New API token</Label>
                  <div className="mt-2 flex gap-2">
                    <Input id="client-api-token" readOnly value={newApiSecret} className="font-mono text-xs" />
                    <Button type="button" variant="outline" onClick={copyApiSecret}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">This full token will not be shown again after you leave this page.</p>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => (activeApiKey ? refreshApiKeyMutation.mutate() : createApiKeyMutation.mutate())}
                  disabled={createApiKeyMutation.isPending || refreshApiKeyMutation.isPending || apiAccessQuery.isLoading}
                >
                  {activeApiKey ? <RefreshCw className="mr-2 h-4 w-4" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                  {activeApiKey ? "Refresh Token" : "Generate Token"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!activeApiKey || revokeApiKeyMutation.isPending}
                  onClick={() => activeApiKey && revokeApiKeyMutation.mutate(activeApiKey.id)}
                >
                  Revoke Token
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
