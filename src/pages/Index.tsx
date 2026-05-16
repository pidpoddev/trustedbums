import { SignInButton, UserButton } from "@clerk/react";
import { Link, Navigate } from "react-router-dom";
import { SignupIntentDialog } from "@/components/SignupIntentDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getDefaultPathForRole } from "@/data/authData";
import { clerkSignInRedirectProps } from "@/lib/clerkRedirects";
import { Flame, ArrowRight, Users, Briefcase, Handshake } from "lucide-react";

const Index = () => {
  const { user, isLoaded } = useAuth();
  const portalPath = user ? getDefaultPathForRole(user.role) : "/login";
  const showSignedOutActions = !isLoaded || !user;
  const showSignedInActions = Boolean(isLoaded && user);

  if (isLoaded && user) {
    return <Navigate to={portalPath} replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-1.5">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">Trusted Bums</span>
          </div>
          <div className="flex items-center gap-3">
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
      <section className="container mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <Handshake className="h-4 w-4" />
          The marketplace for trusted introductions
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight max-w-4xl mx-auto">
          Turn Warm Intros into{" "}
          <span className="text-primary">Real Revenue</span>
        </h1>
        <p className="text-xl text-muted-foreground mt-6 max-w-2xl mx-auto">
          Trusted Bums connects companies with verified connectors who make warm introductions. Transparent, auditable, and commission-based.
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          {showSignedOutActions ? (
            <>
              <SignupIntentDialog initialRole="CLIENT">
                <Button size="lg" className="text-lg px-8">
                  I'm a Client <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </SignupIntentDialog>
              <SignupIntentDialog initialRole="BUM">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  I'm a Bum <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </SignupIntentDialog>
            </>
          ) : null}
          {showSignedInActions ? (
            <Link to={portalPath}>
              <Button size="lg" className="text-lg px-8">
                Open Portal <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : null}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="bg-card rounded-2xl p-8 border hover:shadow-lg transition-shadow">
            <div className="rounded-xl bg-primary/10 p-3 w-fit mb-4">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-display font-bold text-xl mb-2">For Clients</h3>
            <p className="text-muted-foreground">Post opportunities, set terms, and track warm introductions to your ideal customers. Pay only on results.</p>
          </div>
          <div className="bg-card rounded-2xl p-8 border hover:shadow-lg transition-shadow">
            <div className="rounded-xl bg-accent/10 p-3 w-fit mb-4">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-display font-bold text-xl mb-2">For Bums</h3>
            <p className="text-muted-foreground">Browse opportunities, claim intros, and earn commissions. Your identity stays protected until you choose to reveal.</p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="container mx-auto px-6 py-16">
        <div className="rounded-2xl border bg-card p-8 md:p-10">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold">Contact Us</h2>
            <p className="mt-3 text-muted-foreground">
              Questions about the platform, partnerships, or getting started? Reach out and we can help point you in the right direction.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Button size="lg">Get in Touch</Button>
              <Button size="lg" variant="outline">Learn More</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-6 py-8 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-primary" />
            <span className="font-display font-medium">Trusted Bums</span>
          </div>
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
