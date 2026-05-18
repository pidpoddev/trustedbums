import { SignInButton, UserButton } from "@clerk/react";
import {
  ArrowRight,
  BadgeDollarSign,
  Briefcase,
  CheckCircle2,
  DoorOpen,
  Handshake,
  Mail,
  MailX,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Users,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { AccessibilityMenu } from "@/components/AccessibilityMenu";
import { BrandLogo } from "@/components/BrandLogo";
import { SignupIntentDialog } from "@/components/SignupIntentDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getDefaultPathForRole } from "@/data/authData";
import { clerkSignInRedirectProps } from "@/lib/clerkRedirects";

const storyCards = [
  {
    eyebrow: "01",
    title: "Cold outreach gets buried",
    copy: "Your buyer is already deleting emails, dodging pitches, and protecting their calendar from strangers.",
    image: "/brand-blocked-inbox.svg",
  },
  {
    eyebrow: "02",
    title: "Trust opens the side door",
    copy: "A credible friend can start the conversation in a way no sequence, script, or generic SDR campaign can.",
    image: "/brand-trust-connector.svg",
  },
  {
    eyebrow: "03",
    title: "Revenue stays aligned",
    copy: "When the intro creates durable customer revenue, everyone stays tied to the value of the relationship.",
    image: "/brand-revenue-loop.svg",
  },
];

const proofPoints = [
  { value: "Hard", label: "accounts, not easy volume" },
  { value: "Warm", label: "routes into guarded buyers" },
  { value: "Aligned", label: "commission-based outcomes" },
];

const contactUser = "bums";
const contactDomain = "trustedbums.com";
const contactSubject = "Trusted Bums intro strategy";

function openContactEmail() {
  window.location.href = `mailto:${contactUser}@${contactDomain}?subject=${encodeURIComponent(contactSubject)}`;
}

const Index = () => {
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
            <p className="mt-3 text-muted-foreground">
              We&apos;re setting up your account and checking your legal agreements.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08111f]/95 text-white backdrop-blur-xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <BrandLogo to="/" theme="dark" imageClassName="h-16 md:h-[4.6rem]" />
          <div className="flex items-center gap-3">
            <AccessibilityMenu />
            {showSignedOutActions ? (
              <>
                <SignInButton mode="modal" {...clerkSignInRedirectProps}>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white">
                    Sign in
                  </Button>
                </SignInButton>
                <SignupIntentDialog>
                  <Button size="sm" className="rounded-full px-5 shadow-[0_0_28px_rgba(255,122,26,0.35)]">
                    Sign up
                  </Button>
                </SignupIntentDialog>
              </>
            ) : null}
            {showSignedInActions ? (
              <>
                <Link to={portalPath}>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white">
                    Open Portal
                  </Button>
                </Link>
                <UserButton />
              </>
            ) : null}
            {needsRoleSetup ? (
              <>
                <Link to="/login">
                  <Button size="sm" className="rounded-full px-5">
                    Finish setup
                  </Button>
                </Link>
                <UserButton />
              </>
            ) : null}
          </div>
        </div>
      </header>

      <main>
        <section className="relative bg-[#08111f] text-white">
          <div className="hero-grid absolute inset-0 opacity-70" />
          <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />

          <div className="container relative mx-auto grid min-h-[760px] gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
            <div className="brand-rise max-w-4xl">
              <div className="inline-flex rotate-[-1.5deg] items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] text-orange-100 shadow-[0_0_35px_rgba(255,122,26,0.28)]">
                <Sparkles className="h-4 w-4 text-primary" />
                BUMS = Bring Us More Sales
              </div>

              <h1 className="mt-7 max-w-5xl font-display text-5xl font-black leading-[0.92] tracking-[-0.06em] md:text-7xl xl:text-8xl">
                Your buyer is ignoring strangers.
                <span className="mt-3 block text-primary">Good thing we know a friend.</span>
              </h1>

              <p className="mt-7 max-w-2xl text-xl leading-8 text-orange-50/78">
                Trusted Bums turns hard-to-reach decision makers into warm conversations through credible human
                introductions. The name is playful. The access is not.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                {showSignedOutActions ? (
                  <>
                    <Button asChild size="lg" className="h-14 rounded-full px-8 text-base font-bold shadow-[0_0_38px_rgba(255,122,26,0.42)]">
                      <a href="#contact">
                        Request an intro strategy <ArrowRight className="ml-1 h-5 w-5" />
                      </a>
                    </Button>
                    <SignupIntentDialog initialRole="BUM">
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-14 rounded-full border-white/25 bg-white/8 px-8 text-base font-bold text-white hover:bg-white hover:text-[#08111f]"
                      >
                        Become a Bum <ArrowRight className="ml-1 h-5 w-5" />
                      </Button>
                    </SignupIntentDialog>
                  </>
                ) : null}
                {showSignedInActions ? (
                  <Link to={portalPath}>
                    <Button size="lg" className="h-14 rounded-full px-8 text-base font-bold">
                      Open Portal <ArrowRight className="ml-1 h-5 w-5" />
                    </Button>
                  </Link>
                ) : null}
              </div>

              <div className="mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
                {proofPoints.map((point) => (
                  <div key={point.value} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                    <p className="font-display text-2xl font-black text-primary">{point.value}</p>
                    <p className="mt-1 text-sm text-white/68">{point.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="brand-rise-delay-1 relative mx-auto w-full max-w-xl">
              <div className="brand-float relative rounded-[2.5rem] border border-white/12 bg-white/[0.07] p-5 shadow-2xl backdrop-blur">
                <div className="rounded-[2rem] bg-[#fff8ef] p-4 text-[#08111f] shadow-[0_25px_80px_rgba(0,0,0,0.28)]">
                  <img
                    src="/brand-trust-connector.svg"
                    alt="A trusted connector bridges a client and decision maker"
                    className="w-full rounded-[1.5rem]"
                  />
                </div>
              </div>
              <div className="absolute -bottom-8 -left-4 max-w-[18rem] rotate-[-4deg] rounded-3xl bg-primary p-5 text-[#08111f] shadow-2xl">
                <p className="font-display text-2xl font-black leading-none">Cold is crowded.</p>
                <p className="mt-2 text-sm font-semibold">Trust still gets through.</p>
              </div>
              <div className="absolute -right-3 -top-5 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur">
                No stranger danger sales pitch
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden border-y border-white/10 bg-white/[0.04] py-4 text-sm font-bold uppercase tracking-[0.28em] text-white/64">
            <div className="brand-marquee flex w-[200%] gap-10 whitespace-nowrap">
              {Array.from({ length: 2 }).map((_, groupIndex) => (
                <div key={groupIndex} className="flex w-1/2 shrink-0 items-center gap-10">
                  <span>Warm introductions</span>
                  <span className="text-primary">Bring Us More Sales</span>
                  <span>Trusted connectors</span>
                  <span className="text-primary">Hard accounts</span>
                  <span>Relationship-led revenue</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em] text-primary">Why it works</p>
                <h2 className="mt-4 font-display text-4xl font-black leading-tight tracking-[-0.04em] md:text-6xl">
                  Decision makers do not need more pitches.
                </h2>
              </div>
              <p className="text-lg leading-8 text-muted-foreground">
                Your ideal buyer may never hear your message because their inbox is already an arena. We replace the
                noise with a human reason to listen: a trusted person making a credible introduction.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {storyCards.map((card) => (
                <article
                  key={card.title}
                  className="group overflow-hidden rounded-[2rem] border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="bg-secondary/40 p-3">
                    <img src={card.image} alt="" className="aspect-[1.38] w-full rounded-[1.5rem] object-cover" />
                  </div>
                  <div className="p-7">
                    <p className="font-display text-sm font-black uppercase tracking-[0.22em] text-primary">{card.eyebrow}</p>
                    <h3 className="mt-3 font-display text-2xl font-black tracking-[-0.03em]">{card.title}</h3>
                    <p className="mt-3 text-muted-foreground">{card.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-10">
          <div className="mx-auto grid max-w-6xl gap-8 overflow-hidden rounded-[2.5rem] bg-[#08111f] p-8 text-white md:p-12 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-primary">The model</p>
              <h2 className="mt-4 font-display text-4xl font-black leading-tight tracking-[-0.04em] md:text-6xl">
                Not appointment setting. Access alignment.
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
                We focus on the doors that matter most: strategic accounts where access is difficult, trust is scarce,
                and a credible introduction can accelerate months of friction into one serious conversation.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                  <MailX className="h-7 w-7 text-primary" />
                  <p className="mt-4 font-display text-xl font-black">Less noise</p>
                  <p className="mt-2 text-sm text-white/65">No more hoping a stranger reads email number seven.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                  <Handshake className="h-7 w-7 text-primary" />
                  <p className="mt-4 font-display text-xl font-black">More credibility</p>
                  <p className="mt-2 text-sm text-white/65">The first touch comes from someone the buyer already trusts.</p>
                </div>
              </div>
            </div>

            <div className="relative min-h-[420px]">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/25 to-accent/20" />
              <img
                src="/brand-revenue-loop.svg"
                alt="Revenue alignment loop"
                className="relative z-10 h-full w-full rounded-[2rem] object-cover shadow-2xl"
              />
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-20">
          <div className="mx-auto max-w-6xl rounded-[2.5rem] border bg-card p-8 shadow-sm md:p-12">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-primary">How it works</p>
              <h2 className="mt-4 font-display text-4xl font-black leading-tight tracking-[-0.04em] md:text-6xl">
                A real revenue channel, not a favor spreadsheet.
              </h2>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["Choose the doors", "Clients name the accounts and decision makers that are worth a trusted route."],
                ["Match the Bum", "We find the connector with the right relationship, context, and credibility."],
                ["Make it warm", "The approach feels natural because it comes through trust, not automation."],
                ["Track the value", "If the intro turns into durable revenue, everyone can see the aligned economics."],
              ].map(([title, copy], index) => (
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

        <section className="container mx-auto px-6 py-10">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
            <div className="rounded-[2rem] border bg-card p-8 shadow-sm md:p-10">
              <div className="mb-6 w-fit rounded-2xl bg-primary/10 p-4">
                <Briefcase className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-3xl font-black tracking-[-0.04em]">For Clients</h3>
              <p className="mt-4 text-muted-foreground">
                Target the accounts your team struggles to reach, define commission terms, upload training, and track
                introductions in a structured workflow.
              </p>
              <div className="mt-6 space-y-3">
                {["Hard account targeting", "Commission-aligned strategy", "Bum training and enablement"].map((item) => (
                  <p key={item} className="flex items-center gap-3 text-sm font-semibold">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border bg-card p-8 shadow-sm md:p-10">
              <div className="mb-6 w-fit rounded-2xl bg-accent/10 p-4">
                <Users className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-display text-3xl font-black tracking-[-0.04em]">For Bums</h3>
              <p className="mt-4 text-muted-foreground">
                Turn trusted relationships and hard-earned credibility into a revenue channel. Bring Us More Sales is
                the joke, but it is also the job.
              </p>
              <div className="mt-6 space-y-3">
                {["Connector profile", "Opportunity matching", "Transparent payout tracking"].map((item) => (
                  <p key={item} className="flex items-center gap-3 text-sm font-semibold">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="container mx-auto scroll-mt-28 px-6 py-20">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border bg-gradient-to-br from-primary via-orange-500 to-[#ffb15f] p-1 shadow-2xl">
            <div className="grid gap-8 rounded-[2.35rem] bg-[#08111f] p-8 text-white md:p-12 lg:grid-cols-[1fr_0.8fr] lg:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em] text-primary">Contact us</p>
                <h2 className="mt-4 font-display text-4xl font-black leading-tight tracking-[-0.04em] md:text-6xl">
                  If a buyer matters, trust gets there faster.
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
                  Bring us the accounts your team cannot crack. We will help you figure out whether trust can open the
                  door.
                </p>
                <button
                  type="button"
                  onClick={openContactEmail}
                  className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-left font-display text-xl font-black text-white transition hover:border-primary/50 hover:bg-primary/15"
                >
                  <Mail className="h-6 w-6 text-primary" />
                  Open a contact email
                </button>
                <div className="mt-8 flex flex-wrap gap-4">
                  {showSignedOutActions ? (
                    <>
                      <Button
                        type="button"
                        size="lg"
                        className="h-14 rounded-full px-8 text-base font-bold"
                        onClick={openContactEmail}
                      >
                        Talk to Trusted Bums
                      </Button>
                      <SignupIntentDialog initialRole="BUM">
                        <Button
                          size="lg"
                          variant="outline"
                          className="h-14 rounded-full border-white/25 bg-white/8 px-8 text-base font-bold text-white hover:bg-white hover:text-[#08111f]"
                        >
                          Become a Bum
                        </Button>
                      </SignupIntentDialog>
                    </>
                  ) : (
                    <Link to={portalPath}>
                      <Button size="lg" className="h-14 rounded-full px-8 text-base font-bold">
                        Open Portal
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
              <div className="grid gap-4">
                {[
                  [DoorOpen, "Access the unreachable"],
                  [TimerReset, "Shorten the path to a serious meeting"],
                  [BadgeDollarSign, "Align to long-term customer value"],
                  [ShieldCheck, "Keep the workflow auditable"],
                ].map(([Icon, label]) => (
                  <div key={label as string} className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                    <div className="rounded-2xl bg-primary/15 p-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-display text-xl font-black">{label as string}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-[#08111f] text-white">
        <div className="container mx-auto flex flex-col gap-5 px-6 py-8 text-sm text-white/62 md:flex-row md:items-center md:justify-between">
          <BrandLogo to="/" theme="dark" imageClassName="h-12" />
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-white">
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
