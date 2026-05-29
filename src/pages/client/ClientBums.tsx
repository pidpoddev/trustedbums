import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Search, Users } from "lucide-react";
import { BumProfileCard } from "@/components/BumProfileCard";
import { openConversationDock } from "@/lib/conversationDock";
import { PageHeader } from "@/components/PageHeader";
import { PaginationControls } from "@/components/PaginationControls";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getPageItems } from "@/lib/pagination";
import { createClientBumIntroRequest, createConversationThread, listVisibleBumProfiles, type BumProfileRecord } from "@/lib/portalApi";

function searchableText(values: Array<string | null | undefined>) {
  return values.filter(Boolean).join(" ").toLowerCase();
}

const CLIENT_BUMS_PAGE_SIZE = 4;

function bumDisplayName(profile: BumProfileRecord | null) {
  return profile?.profiles?.full_name || profile?.profiles?.email || "selected Bum";
}

type BumDirectoryTypeFilter =
  | "ALL"
  | "VERIFIED"
  | "REVIEWED_OR_BETTER"
  | "HAS_RELATIONSHIPS"
  | "HAS_CLIENT_HISTORY";

const bumDirectoryTypeFilters: { value: BumDirectoryTypeFilter; label: string }[] = [
  { value: "ALL", label: "All profiles" },
  { value: "VERIFIED", label: "Verified only" },
  { value: "REVIEWED_OR_BETTER", label: "Reviewed or verified" },
  { value: "HAS_RELATIONSHIPS", label: "Has relationship companies" },
  { value: "HAS_CLIENT_HISTORY", label: "Has worked-with companies" },
];

export default function ClientBums() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<BumDirectoryTypeFilter>("ALL");
  const [profilePage, setProfilePage] = useState(1);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [introProfile, setIntroProfile] = useState<BumProfileRecord | null>(null);
  const [targetCompanyName, setTargetCompanyName] = useState("");
  const [targetContactName, setTargetContactName] = useState("");
  const [targetContactTitle, setTargetContactTitle] = useState("");
  const [introContext, setIntroContext] = useState("");
  const [introNotes, setIntroNotes] = useState("");
  const [messageProfile, setMessageProfile] = useState<BumProfileRecord | null>(null);
  const [messageText, setMessageText] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const bumProfilesQuery = useQuery({
    queryKey: ["client-visible-bum-profiles"],
    queryFn: listVisibleBumProfiles,
  });

  useEffect(() => {
    setProfilePage(1);
  }, [deferredSearch, typeFilter, hiddenIds.length]);

  const filteredProfiles = useMemo(() => {
    const profiles = bumProfilesQuery.data ?? [];

    return profiles.filter((profile) => {
      if (hiddenIds.includes(profile.user_id)) {
        return false;
      }

      const matchesType =
        typeFilter === "ALL" ||
        (typeFilter === "VERIFIED" && profile.verification_status === "verified") ||
        (typeFilter === "REVIEWED_OR_BETTER" &&
          (profile.verification_status === "reviewed" || profile.verification_status === "verified")) ||
        (typeFilter === "HAS_RELATIONSHIPS" && profile.relationship_companies.length > 0) ||
        (typeFilter === "HAS_CLIENT_HISTORY" && profile.worked_with_companies.length > 0);

      const matchesSearch =
        !deferredSearch ||
        searchableText([
          profile.profiles?.full_name,
          profile.profiles?.email,
          profile.headline,
          profile.bio,
          profile.home_region,
          profile.industries.join(" "),
          profile.regions.join(" "),
          profile.products_sold.join(" "),
          profile.buyer_personas.join(" "),
          profile.worked_with_companies.join(" "),
          profile.relationship_companies.join(" "),
          profile.skills.join(" "),
          profile.certifications.join(" "),
        ]).includes(deferredSearch);

      return matchesType && matchesSearch;
    });
  }, [bumProfilesQuery.data, deferredSearch, hiddenIds, typeFilter]);

  const visibleProfiles = getPageItems(filteredProfiles, profilePage, CLIENT_BUMS_PAGE_SIZE);

  const introRequestMutation = useMutation({
    mutationFn: async () => {
      if (!user || !introProfile) {
        throw new Error("Sign in before requesting an intro.");
      }

      return createClientBumIntroRequest(user, {
        bumUserId: introProfile.user_id,
        targetCompanyName,
        targetContactName,
        targetContactTitle,
        introContext,
        notes: introNotes,
      });
    },
    onSuccess: () => {
      setIntroProfile(null);
      setTargetCompanyName("");
      setTargetContactName("");
      setTargetContactTitle("");
      setIntroContext("");
      setIntroNotes("");
      toast({
        title: "Intro request submitted",
        description: "Trusted Bums can now review this request from the portal.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to submit intro request",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });


  const messageMutation = useMutation({
    mutationFn: async () => {
      if (!user || !messageProfile) {
        throw new Error("Sign in before starting a conversation.");
      }

      return createConversationThread(user, {
        contextType: "GENERAL",
        subject: `Question for ${bumDisplayName(messageProfile)}`,
        message: messageText,
        participantUserIds: [messageProfile.user_id],
      });
    },
    onSuccess: async (thread) => {
      const recipientName = bumDisplayName(messageProfile);
      setMessageProfile(null);
      setMessageText("");
      await queryClient.invalidateQueries({ queryKey: ["conversation-threads"] });
      openConversationDock(thread.id);
      toast({
        title: "Conversation started",
        description: `${recipientName} can respond from their Bum portal.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to start conversation",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleShortlist = (profileId: string) => {
    setShortlistedIds((current) =>
      current.includes(profileId) ? current.filter((id) => id !== profileId) : [...current, profileId],
    );
  };

  const hideProfile = (profileId: string) => {
    setHiddenIds((current) => (current.includes(profileId) ? current : [...current, profileId]));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bum Directory"
        description="Review Bum backgrounds, industries, and relationship coverage before you assign outreach."
      />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(240px,0.8fr)] md:items-end">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by industry, company, buyer persona, region, or name"
                className="pl-9"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={(value: BumDirectoryTypeFilter) => setTypeFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bumDirectoryTypeFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm text-muted-foreground">
            <span>
              Showing {filteredProfiles.length ? (profilePage - 1) * CLIENT_BUMS_PAGE_SIZE + 1 : 0}-{Math.min(profilePage * CLIENT_BUMS_PAGE_SIZE, filteredProfiles.length)} of {filteredProfiles.length} matching profiles
              {hiddenIds.length ? `, ${hiddenIds.length} hidden` : ""}.
            </span>
            <div className="flex flex-wrap gap-2">
              {shortlistedIds.length ? <span>{shortlistedIds.length} shortlisted</span> : null}
              {hiddenIds.length ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => setHiddenIds([])}>
                  Restore hidden
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {bumProfilesQuery.isLoading ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Loading visible Bum profiles from Supabase...
          </CardContent>
        </Card>
      ) : null}

      {bumProfilesQuery.isError ? (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">
            Unable to load the Bum directory right now.
          </CardContent>
        </Card>
      ) : null}

      {!bumProfilesQuery.isLoading && !bumProfilesQuery.isError && !filteredProfiles.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="rounded-full bg-secondary p-3">
              <Users className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="font-medium">
                {search.trim() || typeFilter !== "ALL" ? "No Bums matched your current filters" : "No Bum profiles are visible yet"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {search.trim() || typeFilter !== "ALL"
                  ? "Try a broader search or switch to a wider profile type."
                  : "Profiles will appear here once Bums complete their profile and choose to make it client-visible."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {visibleProfiles.map((profile) => (
          <BumProfileCard
            key={profile.user_id}
            profile={profile}
            showClientActions
            isShortlisted={shortlistedIds.includes(profile.user_id)}
            onShortlist={() => toggleShortlist(profile.user_id)}
            onRequestIntro={() => setIntroProfile(profile)}
            onMessage={() => setMessageProfile(profile)}
            onHide={() => hideProfile(profile.user_id)}
          />
        ))}

        <PaginationControls
          page={profilePage}
          pageSize={CLIENT_BUMS_PAGE_SIZE}
          totalItems={filteredProfiles.length}
          onPageChange={setProfilePage}
        />
      </div>

      <Dialog open={Boolean(messageProfile)} onOpenChange={(open) => { if (!open) { setMessageProfile(null); setMessageText(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message Bum</DialogTitle>
            <DialogDescription>
              Start a conversation with {bumDisplayName(messageProfile)}. Additional Bums, client users, or admins can be added from chat.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              messageMutation.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="bum-message-text">Question</Label>
              <Textarea
                id="bum-message-text"
                rows={4}
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                placeholder="What would you like to ask?"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setMessageProfile(null); setMessageText(""); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={!messageText.trim() || messageMutation.isPending}>
                <MessageSquare className="mr-2 h-4 w-4" />
                {messageMutation.isPending ? "Starting..." : "Start Conversation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(introProfile)} onOpenChange={(open) => !open && setIntroProfile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Intro</DialogTitle>
            <DialogDescription>
              Send Trusted Bums the account and context for this Bum introduction request.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              introRequestMutation.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="intro-bum">Bum</Label>
              <Input
                id="intro-bum"
                value={introProfile?.profiles?.full_name || introProfile?.profiles?.email || "Selected Bum"}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="intro-target-company">Target Company</Label>
              <Input
                id="intro-target-company"
                value={targetCompanyName}
                onChange={(event) => setTargetCompanyName(event.target.value)}
                placeholder="Acme Corp"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="intro-target-contact">Target Contact</Label>
                <Input
                  id="intro-target-contact"
                  value={targetContactName}
                  onChange={(event) => setTargetContactName(event.target.value)}
                  placeholder="Jane Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="intro-target-title">Title</Label>
                <Input
                  id="intro-target-title"
                  value={targetContactTitle}
                  onChange={(event) => setTargetContactTitle(event.target.value)}
                  placeholder="CIO"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="intro-context">Intro Context</Label>
              <Textarea
                id="intro-context"
                rows={4}
                value={introContext}
                onChange={(event) => setIntroContext(event.target.value)}
                placeholder="What relationship or account context should Trusted Bums evaluate?"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="intro-notes">Notes</Label>
              <Textarea
                id="intro-notes"
                rows={3}
                value={introNotes}
                onChange={(event) => setIntroNotes(event.target.value)}
                placeholder="Timing, product fit, or any constraints."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIntroProfile(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={introRequestMutation.isPending}>
                {introRequestMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
