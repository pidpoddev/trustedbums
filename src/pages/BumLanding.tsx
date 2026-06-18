import { UserButton } from "@clerk/react";
import { ArrowRight, BadgeCheck, CircleDollarSign, Handshake, ShieldCheck, Sparkles } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { AccessibilityMenu } from "@/components/AccessibilityMenu";
import { BrandLogo } from "@/components/BrandLogo";
import { SignupIntentDialog } from "@/components/SignupIntentDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getDefaultPathForRole } from "@/data/authData";
import { footerLegalLinks } from "@/data/legalDocuments";

const bumProofPoints = [
  { value: "Trusted", label: "relationship access" },
  { value: "Approved", label: "marketplace work" },
  { value: "Tracked", label: "claims and payouts" },
];

const bumSteps = [
  ["Apply with context", "Tell us where you have credible buyer access and what kind of companies you understand."],
  ["Get reviewed", "Trusted Bums reviews fit, professionalism, and whether your relationships match real Client demand."],
  ["Work inside the portal", "Approved Bums see relevant opportunities, contacts, claims, training, and relationship workflows."],
  ["Track the upside", "When approved work leads to commissionable value, the payout path is visible in the Bum portal."],
];

const BumLanding = () => {
  const { user, isLoaded, isSignedIn } = useAuth();
  const portalPath = user ? getDefaultPathForRole(user.role) : "/login";
  const needsRoleSetup = Boolean(isLoaded && isSignedIn && !user);
  const showSignedOutActions = !isLoaded || (!isSignedIn && !user);
  const showSignedInActions = Boolean(isLoaded && user);

  if (isLoaded && user) {
    return <Navigate to={portalPath} replace />;
  }

  if (isSignedIn && !isLoaded) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08111f]/95 backdrop-blur">
          <div className="container mx-auto flex h-20 items-center justify-between px-6">
            <BrandLogo to="/" theme="dark" imageClassName="h-16" />
            <AccessibilityMenu />
          </div>
        </header>
        <main className="container mx-auto flex min-h-[calc(100vh-5rem)] items-center justify-center px-6">
          <div className="rounded-[2rem] border bg-card px-8 py-10 text-center shadow-xl">
            <p className="font-display text-2xl font-bold">Preparing your portal</p>
            <p className="mt-3 text-muted-foreground">We&apos;re setting up your account and checking your agreements.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08111f]/95 text-white backdrop-blur-xl">
        <div className="container mx-auto flex min-h-20 flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2 sm:flex-nowrap sm:px-6">
          <BrandLogo to="/" theme="dark" imageClassName="h-12 sm:h-14 md:h-[4.6rem]" />
          <div className="order-3 flex w-full flex-wrap items-center justify-between gap-2 sm:order-none sm:w-auto sm:justify-end sm:gap-3">
            <Button variant="ghost" size="sm" className="px-2 text-white hover:bg-white/10 hover:text-white sm:px-3" asChild>
              <Link to="/">For Clients</Link>
            </Button>
            <AccessibilityMenu />
            {showSignedOutActions ? (
              <SignupIntentDialog lockedRole="BUM">
                <Button size="sm" className="rounded-full px-3 shadow-[0_0_28px_rgba(255,122,26,0.35)] sm:px-5">
                  Apply as a Bum
                </Button>
              </SignupIntentDialog>
            ) : null}
            {showSignedInActions ? (
              <>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white" asChild>
                  <Link to={portalPath}>Open Portal</Link>
                </Button>
                <UserButton />
              </>
            ) : null}
            {needsRoleSetup ? (
              <>
                <Button size="sm" className="rounded-full px-5" asChild>
                  <Link to="/login">Finish setup</Link>
                </Button>
                <UserButton />
              </>
            ) : null}
          </div>
        </div>
      </header>

      <main>
        <section className="relative bg-[#08111f] text-white">
          <div className="hero-grid absolute inset-0 opacity-70" />
          <div className="container relative mx-auto grid min-h-[720px] gap-12 px-6 py-16 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:py-24">
            <div className="brand-rise max-w-4xl">
              <div className="inline-flex rotate-[-1.5deg] items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] text-orange-100 shadow-[0_0_35px_rgba(255,122,26,0.28)]">
                <Sparkles className="h-4 w-4 text-primary" />
                BUMS = Bring Us More Sales
              </div>
              <h1 className="mt-7 max-w-5xl font-display text-5xl font-black leading-[0.94] tracking-[-0.05em] md:text-7xl xl:text-8xl">
                Turn trusted relationships into approved intro work.
              </h1>
              <p className="mt-7 max-w-2xl text-xl leading-8 text-orange-50/78">
                A Bum is a credible operator who can open real doors. Trusted Bums keeps that work selective, reviewed,
                and tied to structured Client opportunities instead of loose referral chaos.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                {showSignedOutActions ? (
                  <>
                    <SignupIntentDialog lockedRole="BUM">
                      <Button size="lg" className="h-14 rounded-full px-8 text-base font-bold shadow-[0_0_38px_rgba(255,122,26,0.42)]">
                        Apply as a Bum <ArrowRight className="ml-1 h-5 w-5" />
                      </Button>
                    </SignupIntentDialog>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="h-14 rounded-full border-white/25 bg-white/8 px-8 text-base font-bold text-white hover:bg-white hover:text-[#08111f]"
                    >
                      <Link to="/">I need Client intros</Link>
                    </Button>
                  </>
                ) : null}
                {showSignedInActions ? (
                  <Button size="lg" className="h-14 rounded-full px-8 text-base font-bold" asChild>
                    <Link to={portalPath}>
                      Open Portal <ArrowRight className="ml-1 h-5 w-5" />
                    </Link>
                  </Button>
                ) : null}
              </div>
              <div className="mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
                {bumProofPoints.map((point) => (
                  <div key={point.value} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                    <p className="font-display text-2xl font-black text-primary">{point.value}</p>
                    <p className="mt-1 text-sm text-white/68">{point.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="brand-rise-delay-1 relative mx-auto w-full max-w-xl">
              <div className="brand-float rounded-[2.5rem] border border-white/12 bg-white/[0.07] p-5 shadow-2xl backdrop-blur">
                <div className="rounded-[2rem] bg-[#fff8ef] p-4 text-[#08111f] shadow-[0_25px_80px_rgba(0,0,0,0.28)]">
                  <img src="/brand-trust-connector.svg" alt="A trusted Bum bridges a client and decision maker" className="w-full rounded-[1.5rem]" />
                </div>
              </div>
              <div className="absolute -bottom-8 -left-4 max-w-[18rem] rotate-[-4deg] rounded-3xl bg-primary p-5 text-[#08111f] shadow-2xl">
                <p className="font-display text-2xl font-black leading-none">Trust is the asset.</p>
                <p className="mt-2 text-sm font-semibold">The portal gives it a workflow.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em] text-primary">Who fits</p>
                <h2 className="mt-4 font-display text-4xl font-black leading-tight tracking-[-0.04em] md:text-6xl">
                  We are not looking for generic networking.
                </h2>
              </div>
              <p className="text-lg leading-8 text-muted-foreground">
                Trusted Bums works when relationship access is real, relevant, and handled professionally. The right Bum
                can explain who they know, why the access is credible, and how to protect trust while helping a Client.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {[
                [BadgeCheck, "Credible access", "You have real relationships into buyers, operators, advisors, or account networks."],
                [ShieldCheck, "Professional judgment", "You understand when an introduction is appropriate and when trust should be protected."],
                [CircleDollarSign, "Aligned upside", "You are comfortable with reviewed work, accepted claims, and tracked payout paths."],
              ].map(([Icon, title, copy]) => (
                <article key={String(title)} className="rounded-[2rem] border bg-card p-7 shadow-sm">
                  <Icon className="h-8 w-8 text-primary" />
                  <h3 className="mt-5 font-display text-2xl font-black tracking-[-0.03em]">{title as string}</h3>
                  <p className="mt-3 text-muted-foreground">{copy as string}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-10">
          <div className="mx-auto max-w-6xl rounded-[2.5rem] border bg-card p-8 shadow-sm md:p-12">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-primary">How it works</p>
              <h2 className="mt-4 font-display text-4xl font-black leading-tight tracking-[-0.04em] md:text-6xl">
                Selective by design.
              </h2>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {bumSteps.map(([title, copy], index) => (
                <div key={title} className="rounded-[1.75rem] bg-secondary/55 p-6">
                  <p className="font-display text-sm font-black uppercase tracking-[0.2em] text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-5 font-display text-xl font-black">{title}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-20">
          <div className="mx-auto grid max-w-6xl gap-8 overflow-hidden rounded-[2.5rem] bg-[#08111f] p-8 text-white md:p-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-primary">Bum application</p>
              <h2 className="mt-4 font-display text-4xl font-black leading-tight tracking-[-0.04em] md:text-6xl">
                Bring real access, not a list.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
                Apply if you can bring credible relationship paths into meaningful buyers and are willing to work inside
                the Trusted Bums review, claim, and payout process.
              </p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl">
              <Handshake className="h-10 w-10 text-primary" />
              <p className="mt-5 font-display text-3xl font-black">Ready to be reviewed?</p>
              <p className="mt-3 text-sm leading-6 text-white/68">
                Create a Bum account with the email you want tied to Trusted Bums access. Admin review happens before
                marketplace work is approved.
              </p>
              {showSignedOutActions ? (
                <SignupIntentDialog lockedRole="BUM">
                  <Button size="lg" className="mt-7 h-14 w-full rounded-full text-base font-bold">
                    Apply as a Bum <ArrowRight className="ml-1 h-5 w-5" />
                  </Button>
                </SignupIntentDialog>
              ) : (
                <Button size="lg" className="mt-7 h-14 w-full rounded-full text-base font-bold" asChild>
                  <Link to={portalPath}>Open Portal</Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-[#08111f] text-white">
        <div className="container mx-auto grid gap-6 px-6 py-8 text-sm text-white/62 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start lg:justify-between">
          <BrandLogo to="/" theme="dark" imageClassName="h-12" />
          <div className="flex flex-col gap-4 lg:items-end">
            <div className="flex flex-wrap gap-x-4 gap-y-2 lg:justify-end">
              <Link to="/" className="hover:text-white">For Clients</Link>
              {footerLegalLinks.map((link) => (
                <Link key={link.to} to={link.to} className="hover:text-white">{link.label}</Link>
              ))}
            </div>
            <p>© 2026 Trusted Bums. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BumLanding;
