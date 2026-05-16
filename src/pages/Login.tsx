import { SignInButton, UserButton } from "@clerk/react";
import { ArrowRight, Flame, LogIn, UserPlus } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { SignupIntentDialog } from "@/components/SignupIntentDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/contexts/AuthContext";
import { authorizationProfiles, getDefaultPathForRole, type AuthUser } from "@/data/authData";
import { clerkSignInRedirectProps } from "@/lib/clerkRedirects";

interface LocationState {
  from?: {
    pathname?: string;
  };
}

function getDestination(user: AuthUser, fallbackPath?: string) {
  return fallbackPath && fallbackPath !== "/login"
    ? fallbackPath
    : getDefaultPathForRole(user.role);
}

export default function Login() {
  const { user, isLoaded, authorizationError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const showSignedOutActions = !isLoaded || !user;
  const showSignedInActions = Boolean(isLoaded && user);

  if (isLoaded && user) {
    return <Navigate to={getDestination(user, state?.from?.pathname)} replace />;
  }

  const continueToPortal = () => {
    if (user) {
      navigate(getDestination(user, state?.from?.pathname), { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-1.5">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">Trusted Bums</span>
          </Link>
          {showSignedInActions ? (
            <UserButton />
          ) : null}
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <LogIn className="h-5 w-5 text-primary" />
                Account access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {showSignedOutActions ? (
                <>
                  <SignInButton mode="modal" {...clerkSignInRedirectProps}>
                    <Button className="w-full">
                      Sign in <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </SignInButton>
                  <SignupIntentDialog>
                    <Button className="w-full" variant="outline">
                      Create account <UserPlus className="ml-2 h-4 w-4" />
                    </Button>
                  </SignupIntentDialog>
                </>
              ) : null}

              {showSignedInActions ? (
                <>
                  {isLoaded && user ? (
                    <>
                      <div className="rounded-md border bg-muted/40 p-4">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                        <StatusBadge
                          label={user.role}
                          variant={user.role === "ADMIN" ? "warning" : user.role === "CLIENT" ? "info" : "success"}
                          className="mt-3"
                        />
                      </div>
                      {authorizationError ? (
                        <div className="rounded-md border border-warning/30 bg-warning/10 p-4 text-sm text-warning-foreground">
                          {authorizationError}
                        </div>
                      ) : null}
                      <Button className="w-full" onClick={continueToPortal}>
                        Continue to portal <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
                      <p className="font-medium text-destructive">Authorization required</p>
                      <p className="text-muted-foreground mt-1">
                        {authorizationError ?? "This Clerk user does not have a Trusted Bums role yet."}
                      </p>
                    </div>
                  )}
                </>
              ) : null}
            </CardContent>
          </Card>

          <div>
            <div className="mb-4">
              <h1 className="font-display text-3xl font-bold">Authorization Profiles</h1>
              <p className="text-muted-foreground mt-1">
                Client users share a client workspace. Each Trusted Bum account maps to one bum profile.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {authorizationProfiles.map((profile) => (
                <Card key={profile.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{profile.name}</p>
                          <StatusBadge
                            label={profile.role}
                            variant={profile.role === "ADMIN" ? "warning" : profile.role === "CLIENT" ? "info" : "success"}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{profile.email}</p>
                        <p className="text-sm mt-3">{profile.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
