import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, MapPinned } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  FIRST_LOGIN_WALKTHROUGH_AUTOSTART_DISABLED_KEY,
  FIRST_LOGIN_WALKTHROUGH_EVENT,
} from "@/lib/firstLoginWalkthrough";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const WALKTHROUGH_VERSION = "v1";

interface WalkthroughStep {
  title: string;
  body: string;
  route: string;
  routeLabel: string;
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function getStorageKey(userId: string, role: string, clientAccessRole?: string) {
  return `trustedbums:first-login-walkthrough:${WALKTHROUGH_VERSION}:${userId}:${role}:${clientAccessRole ?? "standard"}`;
}

function getRoleLabel(role?: string, clientAccessRole?: string) {
  if (role === "CLIENT") {
    return clientAccessRole === "CLIENT_FINANCE"
      ? "Client Finance"
      : clientAccessRole === "CLIENT_LEGAL"
        ? "Client Legal"
        : clientAccessRole === "CLIENT_IT"
          ? "Client IT"
      : clientAccessRole === "CLIENT_MEMBER"
        ? "Client Member"
        : "Client Admin";
  }

  if (role === "BUM") {
    return "Bum";
  }

  return "Trusted Bums";
}

function getWalkthroughSteps(role?: string, clientAccessRole?: string): WalkthroughStep[] {
  if (role === "CLIENT") {
    if (clientAccessRole === "CLIENT_FINANCE") {
      return [
        {
          title: "Start with your dashboard",
          body: "The dashboard gives you the current Client workspace status and the fastest route back into reports and finance work.",
          route: "/client/dashboard",
          routeLabel: "Open Dashboard",
        },
        {
          title: "Review payment and export history",
          body: "Payment Reports, Exports, and Reports are your finance-safe areas for reviewing Trusted Bums activity and records.",
          route: "/client/payments",
          routeLabel: "Open Payments",
        },
        {
          title: "Keep your profile current",
          body: "Your User Profile controls personal settings, while Company Profile and agreements explain the workspace context.",
          route: "/client/user-profile",
          routeLabel: "Open User Profile",
        },
      ];
    }

    if (clientAccessRole === "CLIENT_LEGAL") {
      return [
        {
          title: "Start with Agreements",
          body: "Review the current agreement, download the PDF, and submit redline or amendment requests from the agreement workspace.",
          route: "/client/agreements",
          routeLabel: "Open Agreement",
        },
        {
          title: "Use Inbox for legal follow-up",
          body: "Legal questions and amendment discussions stay in Inbox so the client team and Trusted Bums can track decisions.",
          route: "/client/live-conversations",
          routeLabel: "Open Inbox",
        },
        {
          title: "Keep your profile current",
          body: "Your User Profile controls personal settings for legal review work.",
          route: "/client/user-profile",
          routeLabel: "Open User Profile",
        },
      ];
    }

    if (clientAccessRole === "CLIENT_IT") {
      return [
        {
          title: "Start with Company Profile",
          body: "Company Profile includes the beta deal registration API setup and future integration coordination fields.",
          route: "/client/profile",
          routeLabel: "Open Company Profile",
        },
        {
          title: "Coordinate through Inbox",
          body: "Use Inbox to track API, portal, and future SSO setup questions with Trusted Bums.",
          route: "/client/live-conversations",
          routeLabel: "Open Inbox",
        },
        {
          title: "Review agreement context",
          body: "Agreement records explain the legal and operational context for integrations.",
          route: "/client/agreements",
          routeLabel: "Open Agreement",
        },
      ];
    }

    return [
      {
        title: "Start with your dashboard",
        body: "Use the Client Dashboard to understand current activity, pending actions, and the next best workflow for your team.",
        route: "/client/dashboard",
        routeLabel: "Open Dashboard",
      },
      {
        title: "Add opportunities",
        body: "Opportunities are where you add customer accounts, keep private drafts, and publish ready deals to Bums for matching.",
        route: "/client/opportunities",
        routeLabel: "Open Opportunities",
      },
      {
        title: "Manage your team and agreement",
        body: "Team Management, Company Profile, User Profile, and Agreements keep access, company details, and contract status current.",
        route: clientAccessRole === "CLIENT_MEMBER" ? "/client/user-profile" : "/client/team",
        routeLabel: clientAccessRole === "CLIENT_MEMBER" ? "Open User Profile" : "Open Team",
      },
    ];
  }

  if (role === "BUM") {
    return [
      {
        title: "Start with open opportunities",
        body: "Browse Opportunities to find companies where you can make credible warm introductions.",
        route: "/bum/opportunities",
        routeLabel: "Open Opportunities",
      },
      {
        title: "Build your relationship map",
        body: "Use Contacts, Prospective Clients, and Customer Leads to keep track of who you know and where Trusted Bums can create demand.",
        route: "/bum/contacts",
        routeLabel: "Open Contacts",
      },
      {
        title: "Complete your Bum profile",
        body: "Your profile helps admins and clients understand your industry focus, regions, relationships, and availability.",
        route: "/bum/profile",
        routeLabel: "Open Profile",
      },
    ];
  }

  return [];
}

export function FirstLoginWalkthrough() {
  const { user, isImpersonating } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [storageKey, setStorageKey] = useState<string | null>(null);
  const roleLabel = getRoleLabel(user?.role, user?.clientAccessRole);
  const steps = useMemo(() => getWalkthroughSteps(user?.role, user?.clientAccessRole), [user?.clientAccessRole, user?.role]);
  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  useEffect(() => {
    if (!user || !steps.length || !canUseLocalStorage()) {
      return;
    }

    const key = getStorageKey(user.id, user.role, user.clientAccessRole);
    setStorageKey(key);

    const autoStartDisabled =
      window.localStorage.getItem(FIRST_LOGIN_WALKTHROUGH_AUTOSTART_DISABLED_KEY) === "true";

    if (!isImpersonating && !autoStartDisabled && window.localStorage.getItem(key) !== "complete") {
      setStepIndex(0);
      setOpen(true);
    }
  }, [isImpersonating, steps.length, user]);

  useEffect(() => {
    const handleOpenWalkthrough = () => {
      setStepIndex(0);
      setOpen(true);
    };

    window.addEventListener(FIRST_LOGIN_WALKTHROUGH_EVENT, handleOpenWalkthrough);
    return () => window.removeEventListener(FIRST_LOGIN_WALKTHROUGH_EVENT, handleOpenWalkthrough);
  }, []);

  const markComplete = () => {
    if (storageKey && canUseLocalStorage()) {
      window.localStorage.setItem(storageKey, "complete");
    }
    setOpen(false);
  };

  if (!user || !currentStep) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          markComplete();
          return;
        }

        setOpen(true);
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <MapPinned className="h-5 w-5" aria-hidden="true" />
          </div>
          <DialogTitle>Welcome to your {roleLabel} workspace</DialogTitle>
          <DialogDescription>
            A quick first-login walkthrough of the places you will use most.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground" aria-label={`Step ${stepIndex + 1} of ${steps.length}`}>
            {steps.map((step, index) => (
              <span
                key={step.title}
                className={`h-2 flex-1 rounded-full ${index <= stepIndex ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>

          <section className="space-y-3" aria-live="polite">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <h2 className="font-display text-xl font-semibold">{currentStep.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{currentStep.body}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                navigate(currentStep.route);
                markComplete();
              }}
            >
              {currentStep.routeLabel}
            </Button>
          </section>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button type="button" variant="ghost" onClick={markComplete}>
            Skip
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
              disabled={stepIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (isLastStep) {
                  markComplete();
                  return;
                }
                setStepIndex((current) => Math.min(steps.length - 1, current + 1));
              }}
            >
              {isLastStep ? "Finish" : "Next"}
              {!isLastStep ? <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /> : null}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
