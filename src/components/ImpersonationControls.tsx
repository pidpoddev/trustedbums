import { useAuth as useClerkAuth, useClerk } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, ShieldAlert, UserRoundCog } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { exitUserImpersonation, listProfiles, requestUserImpersonation } from "@/lib/portalApi";

export function ImpersonationControls() {
  const { getToken } = useClerkAuth();
  const { signOut } = useClerk();
  const { toast } = useToast();
  const { isImpersonating, user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [startingUserId, setStartingUserId] = useState<string | null>(null);
  const [isStopping, setIsStopping] = useState(false);

  const canOpenImpersonation = user?.role === "ADMIN" && !isImpersonating;
  const profilesQuery = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: listProfiles,
    enabled: canOpenImpersonation,
  });

  const filteredProfiles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return (profilesQuery.data ?? [])
      .filter((profile) => profile.id !== user?.id)
      .filter((profile) => {
        if (!normalizedSearch) {
          return true;
        }

        const haystack = [
          profile.full_name ?? "",
          profile.email ?? "",
          profile.role ?? "",
          profile.companies?.name ?? "",
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedSearch);
      })
      .sort((left, right) => (left.email ?? left.id).localeCompare(right.email ?? right.id));
  }, [profilesQuery.data, search, user?.id]);

  function buildLocalTicketUrl(ticket: string) {
    const url = new URL(window.location.origin);
    url.pathname = import.meta.env.BASE_URL || "/";
    url.searchParams.set("__clerk_ticket", ticket);
    return url.toString();
  }

  async function requireAccessToken() {
    const accessToken = await getToken();

    if (!accessToken) {
      throw new Error("Your session token is unavailable. Please refresh and try again.");
    }

    return accessToken;
  }

  async function handleStartImpersonation(targetUserId: string) {
    setStartingUserId(targetUserId);

    try {
      const accessToken = await requireAccessToken();
      const response = await requestUserImpersonation(accessToken, targetUserId);
      setDialogOpen(false);

      if (response.url) {
        window.location.href = response.url;
        return;
      }

      window.location.href = buildLocalTicketUrl(response.ticket);
    } catch (error) {
      toast({
        title: "Unable to impersonate user",
        description: error instanceof Error ? error.message : "The impersonation request failed.",
        variant: "destructive",
      });
    } finally {
      setStartingUserId(null);
    }
  }

  async function handleStopImpersonation() {
    setIsStopping(true);

    try {
      const accessToken = await requireAccessToken();
      const response = await exitUserImpersonation(accessToken);
      await signOut({
        redirectUrl: buildLocalTicketUrl(response.ticket),
      });
    } catch (error) {
      toast({
        title: "Unable to exit impersonation",
        description: error instanceof Error ? error.message : "The original admin session could not be restored.",
        variant: "destructive",
      });
    } finally {
      setIsStopping(false);
    }
  }

  if (!canOpenImpersonation && !isImpersonating) {
    return null;
  }

  return (
    <>
      {isImpersonating ? (
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs font-medium text-warning-foreground md:flex">
            <ShieldAlert className="h-4 w-4" />
            Impersonation active
          </div>
          <Button variant="outline" size="sm" onClick={handleStopImpersonation} disabled={isStopping}>
            {isStopping ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
            Exit impersonation
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
          <UserRoundCog className="h-4 w-4" />
          Impersonate
        </Button>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Impersonate a user</DialogTitle>
            <DialogDescription>
              Switch into any synced portal account to debug their live experience. You can exit impersonation from the portal header at any time.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, role, or company"
                className="pl-9"
              />
            </div>

            <div className="max-h-[24rem] space-y-3 overflow-y-auto pr-1">
              {profilesQuery.isLoading ? (
                <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading users...
                </div>
              ) : null}

              {profilesQuery.isError ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  Unable to load the current user directory.
                </div>
              ) : null}

              {!profilesQuery.isLoading && !profilesQuery.isError && !filteredProfiles.length ? (
                <div className="rounded-md border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                  No matching users were found in the synced portal directory yet.
                </div>
              ) : null}

              {filteredProfiles.map((profile) => {
                const isStarting = startingUserId === profile.id;
                const secondaryLine = [profile.role ?? "Unknown role", profile.companies?.name ?? "No company"]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between gap-4 rounded-md border bg-card px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{profile.full_name || profile.email || profile.id}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {profile.email || profile.id}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{secondaryLine}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleStartImpersonation(profile.id)}
                      disabled={Boolean(startingUserId)}
                    >
                      {isStarting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserRoundCog className="h-4 w-4" />}
                      Impersonate
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={Boolean(startingUserId)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
