import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { UserAppearanceCard } from "@/components/UserAppearanceCard";
import { UserTimeZoneCard } from "@/components/UserTimeZoneCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getOwnClientCompany, getOwnProfileSettings, updateOwnClientCompanyProfile, updateOwnProfileSettings } from "@/lib/portalApi";

function listToText(values?: string[] | null) {
  return (values ?? []).join(", ");
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
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedinCompanyUrl, setLinkedinCompanyUrl] = useState("");
  const [description, setDescription] = useState("");
  const [targetIndustries, setTargetIndustries] = useState("");
  const [targetRegions, setTargetRegions] = useState("");
  const [idealCustomerProfile, setIdealCustomerProfile] = useState("");
  const [invitedToCustomerIntroductions, setInvitedToCustomerIntroductions] = useState(true);

  const profileQuery = useQuery({
    queryKey: ["own-profile-settings", user?.id],
    queryFn: () => getOwnProfileSettings(user!.id),
    enabled: Boolean(user?.id),
  });
  const companyQuery = useQuery({
    queryKey: ["own-client-company", user?.clientId],
    queryFn: () => getOwnClientCompany(user!),
    enabled: Boolean(user?.id && user?.role === "CLIENT" && user?.clientId),
  });

  useEffect(() => {
    setFullName(profileQuery.data?.full_name ?? user?.name ?? "");
    setInvitedToCustomerIntroductions(profileQuery.data?.invited_to_customer_introductions ?? true);
  }, [profileQuery.data?.full_name, profileQuery.data?.invited_to_customer_introductions, user?.name]);

  useEffect(() => {
    setCompanyName(companyQuery.data?.name ?? user?.companyName ?? "");
    setWebsite(companyQuery.data?.website ?? "");
    setLinkedinCompanyUrl(companyQuery.data?.linkedin_company_url ?? "");
    setDescription(companyQuery.data?.description ?? "");
    setTargetIndustries(listToText(companyQuery.data?.target_industries));
    setTargetRegions(listToText(companyQuery.data?.target_regions));
    setIdealCustomerProfile(companyQuery.data?.ideal_customer_profile ?? "");
  }, [
    companyQuery.data?.description,
    companyQuery.data?.ideal_customer_profile,
    companyQuery.data?.linkedin_company_url,
    companyQuery.data?.name,
    companyQuery.data?.target_industries,
    companyQuery.data?.target_regions,
    companyQuery.data?.website,
    user?.companyName,
  ]);

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
        throw new Error("Sign in before updating your profile.");
      }

      await updateOwnProfileSettings(user, { fullName, invitedToCustomerIntroductions });
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["own-profile-settings", user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["own-client-company", user?.clientId] });
      await queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      await refreshUser();
      toast({
        title: "Profile saved",
        description: "Your company profile was updated from live database records.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to save profile",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const isLoading = profileQuery.isLoading || companyQuery.isLoading;

  return (
    <div className="space-y-6">
      <PageHeader title="Company Profile" description="Manage the live company and matching details tied to your client account." />

      <div className="grid max-w-4xl gap-4 lg:grid-cols-2">
        <UserTimeZoneCard description="Pick the time zone that should be used for meeting scheduling and timestamp display throughout the client portal." />
        <UserAppearanceCard />
      </div>

      <div className="grid max-w-5xl gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <Card>
          <CardHeader><CardTitle className="font-display">Profile Details</CardTitle></CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                saveMutation.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="client-profile-name">Your Name</Label>
                <Input id="client-profile-name" value={fullName} onChange={(event) => setFullName(event.target.value)} disabled={isLoading} />
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-4">
                <Checkbox
                  id="client-invited-to-introductions"
                  checked={invitedToCustomerIntroductions}
                  onCheckedChange={(checked) => setInvitedToCustomerIntroductions(checked === true)}
                  disabled={isLoading}
                />
                <div className="space-y-1">
                  <Label htmlFor="client-invited-to-introductions">Invited to Customer Introductions</Label>
                  <p className="text-sm text-muted-foreground">
                    Keep this on if this person should be prefilled on customer introduction meeting invites. Turn it off for finance, operations, or other contacts who should not join intro calls by default.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client-company-name">Company Name</Label>
                  <Input id="client-company-name" value={companyName} onChange={(event) => setCompanyName(event.target.value)} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-company-website">Website</Label>
                  <Input id="client-company-website" value={website} onChange={(event) => setWebsite(event.target.value)} disabled={isLoading} placeholder="https://yourcompany.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-company-linkedin">LinkedIn Page</Label>
                <Input id="client-company-linkedin" value={linkedinCompanyUrl} onChange={(event) => setLinkedinCompanyUrl(event.target.value)} disabled={isLoading} placeholder="https://www.linkedin.com/company/your-company" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-company-description">Company Description</Label>
                <Textarea id="client-company-description" rows={4} value={description} onChange={(event) => setDescription(event.target.value)} disabled={isLoading} placeholder="How should Trusted Bums describe your company?" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client-target-industries">Target Industries</Label>
                  <Textarea id="client-target-industries" rows={3} value={targetIndustries} onChange={(event) => setTargetIndustries(event.target.value)} disabled={isLoading} placeholder="SaaS, Healthcare, FinTech" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-target-regions">Target Regions</Label>
                  <Textarea id="client-target-regions" rows={3} value={targetRegions} onChange={(event) => setTargetRegions(event.target.value)} disabled={isLoading} placeholder="North America, EMEA" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-ideal-customer-profile">Ideal Customer Profile</Label>
                <Textarea id="client-ideal-customer-profile" rows={4} value={idealCustomerProfile} onChange={(event) => setIdealCustomerProfile(event.target.value)} disabled={isLoading} placeholder="Buyer titles, company size, triggers, technologies, or customer traits that make a strong match." />
              </div>
              <Button type="submit" disabled={isLoading || saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </form>
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
      </div>
    </div>
  );
}
