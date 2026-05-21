import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { UserAppearanceCard } from "@/components/UserAppearanceCard";
import { UserTimeZoneCard } from "@/components/UserTimeZoneCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getOwnProfileSettings, updateOwnProfileSettings } from "@/lib/portalApi";

export default function ClientUserProfile() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [invitedToCustomerIntroductions, setInvitedToCustomerIntroductions] = useState(true);

  const profileQuery = useQuery({
    queryKey: ["own-profile-settings", user?.id],
    queryFn: () => getOwnProfileSettings(user!.id),
    enabled: Boolean(user?.id),
  });

  useEffect(() => {
    setFullName(profileQuery.data?.full_name ?? user?.name ?? "");
    setInvitedToCustomerIntroductions(profileQuery.data?.invited_to_customer_introductions ?? true);
  }, [profileQuery.data?.full_name, profileQuery.data?.invited_to_customer_introductions, user?.name]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("Sign in before updating your user profile.");
      }

      return updateOwnProfileSettings(user, { fullName, invitedToCustomerIntroductions });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["own-profile-settings", user?.id] });
      await refreshUser();
      toast({
        title: "User profile saved",
        description: "Your personal client portal settings were updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to save user profile",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const isLoading = profileQuery.isLoading;

  return (
    <div className="space-y-6">
      <PageHeader title="User Profile" description="Manage your personal client portal settings and preferences." />

      <div className="grid max-w-4xl gap-4 lg:grid-cols-2">
        <UserTimeZoneCard description="Pick the time zone that should be used for meeting scheduling and timestamp display throughout the client portal." />
        <UserAppearanceCard />
      </div>

      <Card className="max-w-2xl">
        <CardHeader><CardTitle className="font-display">User Details</CardTitle></CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              saveMutation.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="client-user-name">Your Name</Label>
              <Input id="client-user-name" value={fullName} onChange={(event) => setFullName(event.target.value)} disabled={isLoading} />
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-4">
              <Checkbox
                id="client-user-invited-to-introductions"
                checked={invitedToCustomerIntroductions}
                onCheckedChange={(checked) => setInvitedToCustomerIntroductions(checked === true)}
                disabled={isLoading}
              />
              <div className="space-y-1">
                <Label htmlFor="client-user-invited-to-introductions">Invited to Customer Introductions</Label>
                <p className="text-sm text-muted-foreground">
                  Keep this on if you should be prefilled on customer introduction meeting invites. Turn it off for finance, operations, or other contacts who should not join intro calls by default.
                </p>
              </div>
            </div>
            <Button type="submit" disabled={isLoading || saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save User Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
