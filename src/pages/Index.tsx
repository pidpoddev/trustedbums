import { SignInButton, UserButton } from "@clerk/react";
import { Link, Navigate } from "react-router-dom";
import { AccessibilityMenu } from "@/components/AccessibilityMenu";
import { BrandLogo } from "@/components/BrandLogo";
import { SignupIntentDialog } from "@/components/SignupIntentDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getDefaultPathForRole } from "@/data/authData";
import { clerkSignInRedirectProps } from "@/lib/clerkRedirects";
import {
  ArrowRight,
  Briefcase,
  DoorOpen,
  Handshake,
  ShieldCheck,
  TimerReset,
  Users,
  Zap,
} from "lucide-react";

const Index = () => {
  const { user, isLoaded, isSignedIn } = useAuth();
  const portalPath = user ? getDefaultPathForRole(user.role) : "/login";
  const showSignedOutActions = !isLoaded || !user;
  const showSignedInActions = Boolean(isLoaded && user);

  if (isLoaded && user) {
    return <Navigate to={portalPath} replace />;
  }

  if (isSignedIn && !isLoaded) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <BrandLogo to="/" imageClassName="h-12" />
            <div className="flex items-center gap-3">
              <AccessibilityMenu />
            </div>
          </div>
        </header>
        <main className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-6">
          <div className="rounded-2xl border bg-card px-8 py-10 text-center">
            <p className="font-display text-2xl font-bold">Preparing your portal</p>
            <p className="mt-3 text-muted-foreground">
              We&apos;re setting up your account and checking your legal agreements.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <BrandLogo to="/" imageClassName="h-12" />
          <div className="flex items-center gap-3">
            <AccessibilityMenu />
            {showSignedOutActions ? (
              <>
                <SignInButton mode="modal" {...clerkSignInRedirectProps}>
                  <Button variant="ghost" size="sm">Sign in</Button>
                </SignInButton>
                <SignupIntentDialog>
                  <Button size="sm">Sign up</Button>
                </SignupIntentDialog>
              </>
            ) : null}
            {showSignedInActions ? (
              <>
                {user ? (
                  <Link to={portalPath}>
                    <Button variant="ghost" size="sm">Open Portal</Button>
                  </Link>
                ) : null}
                <UserButton />
              </>
            ) : null}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 py-24">
        <div className="mx-auto max-w-6xl rounded-[2rem] border bg-gradient-to-br from-card via-card to-secondary/30 px-8 py-14 shadow-sm md:px-14 md:py-20">
          <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Handshake className="h-4 w-4" />
                BUMS = Bring Us More Sales
              </div>
              <h1 className="mt-6 max-w-4xl font-display text-5xl font-bold leading-tight md:text-7xl">
                We Open Doors
                <span className="block text-primary">Cold Outreach Can’t</span>
              </h1>
              <p className="mt-6 max-w-2xl text-xl text-muted-foreground">
                Trusted Bums helps companies reach overwhelmed decision makers through trusted human introductions. The
                name is playful on purpose. BUMS means Bring Us More Sales, and the model is simple: when cold
                outreach gets ignored, trust still gets through.
              </p>
              <p className="mt-4 max-w-2xl text-base text-muted-foreground">
                Sometimes we create access you would never win on your own. Other times, we compress months of friction
                into one credible conversation and accelerate a door you eventually hoped would open.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                {showSignedOutActions ? (
                  <>
                    <SignupIntentDialog initialRole="CLIENT">
                      <Button size="lg" className="px-8 text-lg">
                        Request an Introduction Strategy <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </SignupIntentDialog>
                    <SignupIntentDialog initialRole="BUM">
                      <Button size="lg" variant="outline" className="px-8 text-lg">
                        Join as a Connector <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </SignupIntentDialog>
                  </>
                ) : null}
                {showSignedInActions ? (
                  <Link to={portalPath}>
                    <Button size="lg" className="px-8 text-lg">
                      Open Portal <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border bg-background/90 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-primary/10 p-3">
                    <DoorOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-xl font-bold">Access to the unreachable</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Reach buyers who are protected by noise, gatekeepers, and relationships you do not yet have.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border bg-background/90 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-accent/10 p-3">
                    <TimerReset className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-display text-xl font-bold">Acceleration through trust</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Even when you could eventually get there, a trusted introduction radically shortens the time to a
                      serious meeting.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border bg-background/90 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-primary/10 p-3">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-xl font-bold">Long-term aligned incentives</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      When a difficult introduction creates durable customer revenue, our model stays aligned with that
                      long-term value.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Value */}
      <section className="container mx-auto px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">Why it works</p>
            <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">
              Decision makers do not need more pitches. They need a reason to listen.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Your ideal buyer may never hear your message because they are already buried under cold emails,
              unsolicited LinkedIn outreach, and generic appointment requests. We replace that noise with trust.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border bg-card p-8 transition-shadow hover:shadow-lg">
              <div className="mb-4 w-fit rounded-xl bg-primary/10 p-3">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold">Hard accounts, not easy volume</h3>
              <p className="mt-2 text-muted-foreground">
                We focus on the buyers who matter most: strategic accounts where access is difficult, valuable, and
                unlikely to come from standard outbound alone.
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-8 transition-shadow hover:shadow-lg">
              <div className="mb-4 w-fit rounded-xl bg-accent/10 p-3">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-display text-xl font-bold">Trusted friend to trusted buyer</h3>
              <p className="mt-2 text-muted-foreground">
                The introduction is not another stranger trying to break through. It is someone the decision maker
                already knows, trusts, and is more willing to hear out.
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-8 transition-shadow hover:shadow-lg">
              <div className="mb-4 w-fit rounded-xl bg-primary/10 p-3">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold">Faster path to meaningful meetings</h3>
              <p className="mt-2 text-muted-foreground">
                We accelerate the first conversation so your team spends less time fighting for attention and more time
                selling from inside the room.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="container mx-auto px-6 py-16">
        <div className="mx-auto max-w-6xl rounded-[2rem] border bg-card p-8 md:p-12">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">How it works</p>
            <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">
              Trust-based introductions, structured like a real revenue channel
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-secondary/45 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">01</p>
              <p className="mt-4 font-display text-xl font-bold">Choose the accounts that matter</p>
              <p className="mt-2 text-sm text-muted-foreground">
                We start with the decision makers and customer targets your team most wants to reach.
              </p>
            </div>
            <div className="rounded-2xl bg-secondary/45 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">02</p>
              <p className="mt-4 font-display text-xl font-bold">Match the right connector</p>
              <p className="mt-2 text-sm text-muted-foreground">
                We identify the trusted connector with the right relationship, context, and credibility to make the
                approach feel natural.
              </p>
            </div>
            <div className="rounded-2xl bg-secondary/45 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">03</p>
              <p className="mt-4 font-display text-xl font-bold">Open the door through trust</p>
              <p className="mt-2 text-sm text-muted-foreground">
                The outreach comes through a trusted friend, not another cold message competing in an exhausted inbox.
              </p>
            </div>
            <div className="rounded-2xl bg-secondary/45 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">04</p>
              <p className="mt-4 font-display text-xl font-bold">Own the revenue from there</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Once the meeting is set, your team runs the sales process. We stay aligned to the value created if the
                account becomes long-term revenue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Economics / Audience */}
      <section className="container mx-auto px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[2rem] border bg-card p-8 md:p-10">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">Commercial model</p>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">
              We are not pricing a meeting. We are aligning to the value of access.
            </h2>
            <p className="mt-4 text-muted-foreground">
              When we help create a relationship your team could not access, or help you reach it much faster through
              trust, the value often extends far beyond a first meeting. That is why our model is built around a
              durable percentage of the customer relationship when the introduction creates long-term revenue.
            </p>
            <p className="mt-4 text-muted-foreground">
              The point is simple: if trust unlocks a valuable account, our incentives should stay aligned with the
              revenue created, not end at the calendar invite.
            </p>
          </div>

          <div className="rounded-[2rem] border bg-card p-8 md:p-10">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">Best fit</p>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">
              Built for high-value, relationship-driven sales
            </h2>
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl bg-secondary/45 p-5">
                <p className="font-display text-lg font-bold">Complex B2B deals</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Especially where executive attention is scarce and account value is high.
                </p>
              </div>
              <div className="rounded-2xl bg-secondary/45 p-5">
                <p className="font-display text-lg font-bold">Difficult target accounts</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  The accounts your team talks about constantly but has not been able to break into.
                </p>
              </div>
              <div className="rounded-2xl bg-secondary/45 p-5">
                <p className="font-display text-lg font-bold">Teams that value speed</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  If you can eventually get there, we help you get there faster. If you cannot, we help make the
                  impossible reachable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audience */}
      <section className="container mx-auto px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
          <div className="rounded-2xl border bg-card p-8 transition-shadow hover:shadow-lg">
            <div className="mb-4 w-fit rounded-xl bg-primary/10 p-3">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 font-display text-xl font-bold">For Clients</h3>
            <p className="text-muted-foreground">
              Target the accounts your team struggles to reach, define the commercial model, and track introductions in
              a structured, auditable workflow.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-8 transition-shadow hover:shadow-lg">
            <div className="mb-4 w-fit rounded-xl bg-accent/10 p-3">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <h3 className="mb-2 font-display text-xl font-bold">For Connectors</h3>
            <p className="text-muted-foreground">
              Turn trusted relationships and hard-earned credibility into a revenue channel. Bring Us More Sales is the
              joke, but it is also the job.
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="container mx-auto px-6 py-16">
        <div className="mx-auto max-w-6xl rounded-[2rem] border bg-gradient-to-br from-card via-card to-primary/10 p-8 md:p-10">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">Start here</p>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">If a buyer matters, trust gets there faster.</h2>
            <p className="mt-3 text-muted-foreground">
              If you have target accounts your team cannot seem to crack, or accounts you want to reach faster through
              trusted introductions, we should talk.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              {showSignedOutActions ? (
                <>
                  <SignupIntentDialog initialRole="CLIENT">
                    <Button size="lg">Talk to Trusted Bums</Button>
                  </SignupIntentDialog>
                  <SignupIntentDialog initialRole="BUM">
                    <Button size="lg" variant="outline">Become a Connector</Button>
                  </SignupIntentDialog>
                </>
              ) : (
                <Link to={portalPath}>
                  <Button size="lg">Open Portal</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-6 py-8 flex items-center justify-between text-sm text-muted-foreground">
          <BrandLogo to="/" imageClassName="h-9" />
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <p>© 2026 Trusted Bums. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
