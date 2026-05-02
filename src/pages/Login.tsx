import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowRight, Flame, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/contexts/AuthContext";
import { demoAccounts, getDefaultPathForRole, type AuthUser } from "@/data/authData";

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
  const [email, setEmail] = useState("admin@trustedbums.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const submitLogin = () => {
    const user = login(email, password);

    if (!user) {
      setError("Use one of the demo emails with password: password.");
      return;
    }

    navigate(getDestination(user, state?.from?.pathname), { replace: true });
  };

  const chooseDemoAccount = (userId: string) => {
    const user = loginAsDemo(userId);

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
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <LogIn className="h-5 w-5 text-primary" />
                Sign in
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      submitLogin();
                    }
                  }}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button className="w-full" onClick={submitLogin}>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <div>
            <div className="mb-4">
              <h1 className="font-display text-3xl font-bold">Demo Accounts</h1>
              <p className="text-muted-foreground mt-1">
                Clients can have multiple users under the same client workspace. Each Trusted Bum account maps to one bum profile.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {demoAccounts.map((account) => (
                <Card key={account.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{account.name}</p>
                          <StatusBadge
                            label={account.role}
                            variant={account.role === "ADMIN" ? "warning" : account.role === "CLIENT" ? "info" : "success"}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{account.email}</p>
                        <p className="text-sm mt-3">{account.description}</p>
                      </div>
                    </div>
                    <Button
                      className="mt-4 w-full"
                      variant="outline"
                      onClick={() => chooseDemoAccount(account.id)}
                    >
                      Use this account
                    </Button>
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
