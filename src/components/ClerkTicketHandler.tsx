import { useAuth as useClerkAuth, useClerk, useSignIn } from "@clerk/react";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";

export function ClerkTicketHandler() {
  const { isSignedIn } = useClerkAuth();
  const { signOut } = useClerk();
  const { signIn } = useSignIn();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ticket = searchParams.get("__clerk_ticket");
  const isHandlingRef = useRef(false);

  const currentTicketUrl = useMemo(() => {
    if (!ticket) {
      return null;
    }

    const url = new URL(window.location.origin);
    url.pathname = import.meta.env.BASE_URL || "/";
    url.searchParams.set("__clerk_ticket", ticket);
    return url.toString();
  }, [ticket]);

  useEffect(() => {
    if (!ticket || !signIn || isHandlingRef.current) {
      return;
    }

    isHandlingRef.current = true;

    void (async () => {
      try {
        if (isSignedIn) {
          await signOut({
            redirectUrl: currentTicketUrl ?? undefined,
          });
          return;
        }

        const { error } = await signIn.ticket({
          ticket,
        });

        if (error) {
          throw new Error(error.message || "Clerk rejected the pending sign-in ticket.");
        }

        if (signIn.status !== "complete") {
          throw new Error("Clerk did not complete the redirected sign-in flow.");
        }

        await signIn.finalize({
          navigate: async ({ decorateUrl }) => {
            const url = decorateUrl("/dashboard");

            if (url.startsWith("http")) {
              window.location.href = url;
              return;
            }

            navigate(url, { replace: true });
          },
        });
      } catch (error) {
        console.error("Unable to consume Clerk ticket redirect", error);
        navigate("/", { replace: true });
      } finally {
        isHandlingRef.current = false;
      }
    })();
  }, [currentTicketUrl, isSignedIn, navigate, signIn, signOut, ticket]);

  if (!ticket) {
    if (isSignedIn) {
      return <Navigate to="/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="flex items-center gap-3 rounded-md border bg-card px-5 py-4 text-sm text-muted-foreground shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Preparing your portal...
      </div>
    </div>
  );
}
