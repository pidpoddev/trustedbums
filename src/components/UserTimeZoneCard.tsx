import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getOwnProfileSettings, updateOwnProfileSettings } from "@/lib/portalApi";
import { getBrowserTimeZone, getSupportedTimeZones, normalizeTimeZone } from "@/lib/timezone";

interface UserTimeZoneCardProps {
  title?: string;
  description?: string;
}

export function UserTimeZoneCard({
  title = "Time zone",
  description = "Store your preferred time zone so schedules and timestamps render consistently across the portal.",
}: UserTimeZoneCardProps) {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [timeZone, setTimeZone] = useState(user?.timeZone ?? getBrowserTimeZone());
  const supportedTimeZones = useMemo(() => {
    const values = new Set([normalizeTimeZone(user?.timeZone, getBrowserTimeZone()), ...getSupportedTimeZones()]);
    return Array.from(values).sort();
  }, [user?.timeZone]);

  const profileQuery = useQuery({
    queryKey: ["own-profile-settings", user?.id],
    queryFn: () => getOwnProfileSettings(user!.id),
    enabled: Boolean(user?.id),
  });

  useEffect(() => {
    if (profileQuery.data?.time_zone) {
      setTimeZone(profileQuery.data.time_zone);
      return;
    }

    if (user?.timeZone) {
      setTimeZone(user.timeZone);
    }
  }, [profileQuery.data?.time_zone, user?.timeZone]);

  const saveMutation = useMutation({
    mutationFn: async () =>
      updateOwnProfileSettings(user!, {
        timeZone: normalizeTimeZone(timeZone, getBrowserTimeZone()),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["own-profile-settings", user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      await refreshUser();
      toast({
        title: "Time zone saved",
        description: "Future dates and meeting times will render in your preferred time zone.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to save time zone",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="space-y-2">
          <Label htmlFor="user-time-zone">Preferred time zone</Label>
          <Select value={timeZone} onValueChange={setTimeZone}>
            <SelectTrigger id="user-time-zone">
              <SelectValue placeholder="Choose a time zone" />
            </SelectTrigger>
            <SelectContent position="item-aligned" className="max-h-80">
              {supportedTimeZones.map((supportedTimeZone) => (
                <SelectItem key={supportedTimeZone} value={supportedTimeZone}>
                  {supportedTimeZone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Browser detected: {getBrowserTimeZone()}
          </p>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => saveMutation.mutate()} disabled={!user || saveMutation.isPending}>
            Save time zone
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
