import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useIntroClaims } from "@/hooks/use-intro-claims";
import { useToast } from "@/hooks/use-toast";
import {
  buildBumProfileInputFromPrompt,
  getBumProfileCompleteness,
  getPromptDraftValue,
  type BumProfilePromptKey,
} from "@/lib/bumProfileCompleteness";
import {
  getOwnBumProfile,
  listOwnProspectRecommendations,
  listMarketplaceOpportunities,
  upsertOwnBumProfile,
  type BumProfileInput,
} from "@/lib/portalApi";
import { Briefcase, Building2, ClipboardList, Handshake, Sparkles, Wallet, TrendingUp } from "lucide-react";

export default function BumDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [promptAnswers, setPromptAnswers] = useState<Partial<Record<BumProfilePromptKey, string>>>({});
  const opportunitiesQuery = useQuery({
    queryKey: ["bum-marketplace-opportunities"],
    queryFn: listMarketplaceOpportunities,
  });
  const prospectsQuery = useQuery({
    queryKey: ["bum-prospects", user?.id],
    queryFn: () => listOwnProspectRecommendations(user!.id),
    enabled: Boolean(user?.id),
  });
  const profileQuery = useQuery({
    queryKey: ["bum-profile", user?.id],
    queryFn: () => getOwnBumProfile(user!.id),
    enabled: Boolean(user?.id),
  });
  const { introClaims } = useIntroClaims();
  const myClaims = introClaims.filter((claim) => claim.bumAlias === (user?.name ?? "Trusted Bum"));
  const completeness = useMemo(() => getBumProfileCompleteness(profileQuery.data), [profileQuery.data]);

  useEffect(() => {
    if (!completeness.nextPrompts.length) {
      setPromptAnswers({});
      return;
    }

    setPromptAnswers((current) => {
      const nextState: Partial<Record<BumProfilePromptKey, string>> = {};

      for (const prompt of completeness.nextPrompts) {
        nextState[prompt.key] = current[prompt.key] ?? getPromptDraftValue(profileQuery.data, prompt.key);
      }

      return nextState;
    });
  }, [completeness.nextPrompts, profileQuery.data]);

  const savePromptsMutation = useMutation({
    mutationFn: async () => {
      const payload = completeness.nextPrompts.reduce<Partial<BumProfileInput>>((accumulator, prompt) => {
        const answer = promptAnswers[prompt.key] ?? "";
        const patch = buildBumProfileInputFromPrompt(prompt.key, answer);

        if (patch) {
          Object.assign(accumulator, patch);
        }

        return accumulator;
      }, {});

      if (!Object.keys(payload).length) {
        throw new Error("Add at least one answer before saving.");
      }

      return upsertOwnBumProfile(user!, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["bum-profile", user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["admin-bum-profiles"] });
      await queryClient.invalidateQueries({ queryKey: ["client-visible-bum-profiles"] });
      toast({
        title: "Progress saved",
        description: "Nice. We will ask for the next couple of profile details next time.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to save progress",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name ?? "Trusted Bum"} 👋`}
        description="Browse opportunities, track your claims, and watch your earnings grow."
      />

      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-secondary/20">
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="font-display text-xl">Profile completeness</CardTitle>
              <CardDescription>
                Fill this out a little at a time so clients understand your background and network.
              </CardDescription>
            </div>
            <div className="rounded-2xl bg-primary/10 px-4 py-2 text-right">
              <p className="text-2xl font-bold font-display text-primary">{completeness.percent}%</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {completeness.completed} of {completeness.total} complete
              </p>
            </div>
          </div>
          <Progress value={completeness.percent} className="h-3" />
        </CardHeader>
        <CardContent className="space-y-5">
          {completeness.isComplete ? (
            <div className="rounded-xl border bg-card/80 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Your connector profile is in strong shape.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Admins and clients now have a complete picture of your experience, coverage, and relationships.
                  </p>
                  <Button asChild variant="outline" className="mt-4">
                    <Link to="/bum/profile">Review full profile</Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-start gap-3 rounded-xl border bg-card/80 p-5">
                <div className="rounded-full bg-secondary p-2">
                  <ClipboardList className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-medium">Let’s keep this easy.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Answer the next {completeness.nextPrompts.length === 1 ? "question" : "two questions"} now. We will
                    ask for the next ones on future logins until your profile is complete.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {completeness.nextPrompts.map((prompt) => (
                  <div key={prompt.key} className="space-y-2 rounded-xl border bg-card/80 p-4">
                    <Label htmlFor={`dashboard-prompt-${prompt.key}`}>{prompt.label}</Label>
                    <p className="text-sm text-muted-foreground">{prompt.description}</p>
                    {prompt.type === "textarea" ? (
                      <Textarea
                        id={`dashboard-prompt-${prompt.key}`}
                        rows={6}
                        value={promptAnswers[prompt.key] ?? ""}
                        onChange={(event) =>
                          setPromptAnswers((current) => ({ ...current, [prompt.key]: event.target.value }))
                        }
                        placeholder={prompt.placeholder}
                      />
                    ) : (
                      <Input
                        id={`dashboard-prompt-${prompt.key}`}
                        type={prompt.type}
                        value={promptAnswers[prompt.key] ?? ""}
                        onChange={(event) =>
                          setPromptAnswers((current) => ({ ...current, [prompt.key]: event.target.value }))
                        }
                        placeholder={prompt.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Prefer the full editor? You can still manage everything at once from your profile page.
                </p>
                <div className="flex gap-3">
                  <Button asChild variant="outline">
                    <Link to="/bum/profile">Open full profile</Link>
                  </Button>
                  <Button onClick={() => savePromptsMutation.mutate()} disabled={savePromptsMutation.isPending}>
                    {savePromptsMutation.isPending ? "Saving..." : "Save and continue"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Prospected Clients" value={prospectsQuery.data?.length ?? 0} icon={Building2} />
        <StatCard title="Open Opportunities" value={opportunitiesQuery.data?.length ?? 0} icon={Briefcase} />
        <StatCard title="Active Claims" value={myClaims.length} icon={Handshake} />
        <StatCard title="Pending Earnings" value="$0" icon={TrendingUp} />
        <StatCard title="Lifetime Payouts" value="$0" icon={Wallet} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
          <CardHeader>
            <CardTitle className="font-display">Bring in a new client prospect</CardTitle>
            <CardDescription>
              Add a company, attach the key contact, and tell admin whether you want to invite them personally or want Trusted Bums to handle it.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              We will dedupe by business domain and keep overlap visible when multiple Bums know the same company.
            </div>
            <Button asChild>
              <Link to="/bum/prospects">Add Prospected Client</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Prospect activity</CardTitle>
            <CardDescription>Quick snapshot of the sourcing pipeline you are building.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Prospects submitted</span>
              <span className="font-medium">{prospectsQuery.data?.length ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Marketplace opportunities</span>
              <span className="font-medium">{opportunitiesQuery.data?.length ?? 0}</span>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to="/bum/prospects">Open Prospects</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
