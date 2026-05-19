import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { UserTimeZoneCard } from "@/components/UserTimeZoneCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getOwnClientCompany, getOwnProfileSettings, updateOwnClientCompanyProfile, updateOwnProfileSettings } from "@/lib/portalApi";

export default function ClientProfile() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
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
  }, [companyQuery.data?.name, companyQuery.data?.website, user?.companyName]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("Sign in before updating your profile.");
      }

      await updateOwnProfileSettings(user, { fullName, invitedToCustomerIntroductions });
      return updateOwnClientCompanyProfile(user, { name: companyName, website });
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
      <PageHeader title="Company Profile" description="Manage the live company and user details tied to your client account." />

      <div className="max-w-2xl">
        <UserTimeZoneCard description="Pick the time zone that should be used for meeting scheduling and timestamp display throughout the client portal." />
      </div>

      <Card className="max-w-2xl">
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
            <Button type="submit" disabled={isLoading || saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
