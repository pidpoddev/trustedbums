import { useMemo, useState } from "react";
import { ArrowRight, Flame, LogIn, UserPlus } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { authorizationProfiles, getDefaultPathForRole, type AuthUser, type UserRole } from "@/data/authData";
import { supabase } from "@/lib/supabase";

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

function roleFromParam(value: string | null): UserRole {
  return value === "BUM" || value === "CLIENT" ? value : "CLIENT";
}

export default function Login() {
  const { user, isLoaded, authorizationError, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">(searchParams.get("mode") === "signup" ? "signup" : "signin");
  const [role, setRole] = useState<UserRole>(roleFromParam(searchParams.get("role")));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = location.state as LocationState | null;

  const destination = useMemo(
    () => (user ? getDestination(user, state?.from?.pathname) : "/login"),
    [state?.from?.pathname, user],
  );

  const continueToPortal = () => {
    if (user) {
      navigate(destination, { replace: true });
    }
  };

  const submitEmailAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw error;
        }
        await refreshUser();
        toast({ title: "Signed in", description: "Welcome back to Trusted Bums." });
      } else {
        if (role === "CLIENT" && !companyName.trim()) {
          throw new Error("Company name is required for client accounts.");
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}login`,
            data: {
              role,
              full_name: fullName,
              company_name: role === "CLIENT" ? companyName : null,
            },
          },
        });
        if (error) {
          throw error;
        }
        toast({
          title: "Account created",
          description: "Check your email if Supabase requires confirmation, then sign in.",
        });
        setMode("signin");
      }
    } catch (error) {
      toast({
        title: mode === "signin" ? "Sign in failed" : "Sign up failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}login`,
      },
    });

    if (error) {
      toast({ title: "Google sign in failed", description: error.message, variant: "destructive" });
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
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                {mode === "signin" ? (
                  <LogIn className="h-5 w-5 text-primary" />
                ) : (
                  <UserPlus className="h-5 w-5 text-primary" />
                )}
                {mode === "signin" ? "Account access" : "Create your portal account"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Button className="w-full" onClick={continueToPortal}>
                    Continue to portal <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  {authorizationError && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
                      <p className="font-medium text-destructive">Authorization required</p>
                      <p className="text-muted-foreground mt-1">{authorizationError}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 rounded-md bg-muted p-1">
                    <Button
                      type="button"
                      variant={mode === "signin" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setMode("signin")}
                    >
                      Sign in
                    </Button>
                    <Button
                      type="button"
                      variant={mode === "signup" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setMode("signup")}
                    >
                      Sign up
                    </Button>
                  </div>

                  <form className="space-y-4" onSubmit={submitEmailAuth}>
                    {mode === "signup" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="role">Account type</Label>
                          <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                            <SelectTrigger id="role">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CLIENT">Client</SelectItem>
                              <SelectItem value="BUM">Bum</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full name</Label>
                          <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} />
                        </div>
                        {role === "CLIENT" && (
                          <div className="space-y-2">
                            <Label htmlFor="companyName">Company name</Label>
                            <Input
                              id="companyName"
                              required
                              value={companyName}
                              onChange={(event) => setCompanyName(event.target.value)}
                            />
                          </div>
                        )}
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                      />
                    </div>
                    <Button className="w-full" disabled={isSubmitting}>
                      {mode === "signin" ? "Sign in" : "Create account"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>

                  <Button className="w-full" variant="outline" onClick={signInWithGoogle}>
                    Continue with Google
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <div>
            <div className="mb-4">
              <h1 className="font-display text-3xl font-bold">Portal roles</h1>
              <p className="text-muted-foreground mt-1">
                Client users share a company workspace. Each Trusted Bum account maps to one connector profile.
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
