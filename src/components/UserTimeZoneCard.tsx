import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getOwnProfileSettings, updateOwnProfileSettings } from "@/lib/portalApi";
import { dateFormatOptions, getBrowserTimeZone, getSupportedTimeZones, normalizeDateFormat, normalizeTimeZone, setStoredDateFormat, type DateFormatPreference } from "@/lib/timezone";

interface UserTimeZoneCardProps {
  title?: string;
  description?: string;
}

export function UserTimeZoneCard({
  title = "Localization",
  description = "Store your preferred time zone and date format so schedules and timestamps render consistently across the portal.",
}: UserTimeZoneCardProps) {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [timeZone, setTimeZone] = useState(user?.timeZone ?? getBrowserTimeZone());
  const [dateFormat, setDateFormat] = useState<DateFormatPreference>(normalizeDateFormat(user?.dateFormat));
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
      setDateFormat(normalizeDateFormat(profileQuery.data.date_format ?? user?.dateFormat));
      return;
    }

    if (user?.timeZone) {
      setTimeZone(user.timeZone);
    }

    setDateFormat(normalizeDateFormat(user?.dateFormat));
  }, [profileQuery.data?.date_format, profileQuery.data?.time_zone, user?.dateFormat, user?.timeZone]);

  const saveMutation = useMutation({
    mutationFn: async () =>
      updateOwnProfileSettings(user!, {
        timeZone: normalizeTimeZone(timeZone, getBrowserTimeZone()),
        dateFormat,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["own-profile-settings", user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      setStoredDateFormat(dateFormat);
      await refreshUser();
      toast({
        title: "Localization saved",
        description: "Future dates and meeting times will render with your preferred locale settings.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to save localization",
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
        <div className="grid gap-4 md:grid-cols-2">
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
          <div className="space-y-2">
            <Label htmlFor="user-date-format">Date format</Label>
            <Select value={dateFormat} onValueChange={(value: DateFormatPreference) => setDateFormat(value)}>
              <SelectTrigger id="user-date-format">
                <SelectValue placeholder="Choose a date format" />
              </SelectTrigger>
              <SelectContent>
                {dateFormatOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label} - {option.example}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => saveMutation.mutate()} disabled={!user || saveMutation.isPending}>
            Save settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
