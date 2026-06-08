import { SignUpButton } from "@clerk/react";
import { Briefcase, Users } from "lucide-react";
import { useEffect, useMemo, useState, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { type UserRole, getKnownClientForEmail } from "@/data/authData";
import { clerkSignUpRedirectProps } from "@/lib/clerkRedirects";

type SignupRole = Extract<UserRole, "CLIENT" | "BUM">;

interface SignupIntentDialogProps {
  children: ReactElement;
  initialRole?: SignupRole;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function SignupIntentDialog({ children, initialRole }: SignupIntentDialogProps) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<SignupRole | "">(initialRole ?? "");
  const [email, setEmail] = useState("");
  const [manualCompanyName, setManualCompanyName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const knownClient = useMemo(() => getKnownClientForEmail(email), [email]);
  const companyName = role === "CLIENT" ? knownClient?.company ?? manualCompanyName : "";
  const emailIsValid = isValidEmail(email);
  const companyIsRequired = role === "CLIENT";
  const companyIsValid = !companyIsRequired || Boolean(companyName.trim());
  const canContinue = Boolean(role && emailIsValid && companyIsValid);

  useEffect(() => {
    if (role === "BUM") {
      setManualCompanyName("");
    }
  }, [role]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      setRole(initialRole ?? "");
      setEmail("");
      setManualCompanyName("");
      setSubmitted(false);
    }
  };

  const unsafeMetadata = {
    signupIntent: role,
    ...(role === "CLIENT"
      ? {
          clientCompanyName: companyName.trim(),
          companyName: companyName.trim(),
        }
      : {}),
  };

  const continueButton = (
    <Button
      type="button"
      className="w-full sm:w-auto"
      onClick={() => {
        setSubmitted(true);
      }}
    >
      Continue
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create your account</DialogTitle>
          <DialogDescription>
            Choose whether you are a Client Prospect or Bum Prospect, then add the email you want attached to Trusted Bums access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-3">
            <Label>Account type</Label>
            <RadioGroup value={role} onValueChange={(value) => setRole(value as SignupRole)} className="grid gap-3 sm:grid-cols-2">
              <Label
                htmlFor="signup-client"
                className="flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors hover:bg-muted/60 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
              >
                <RadioGroupItem id="signup-client" value="CLIENT" className="mt-1" />
                <span>
                  <span className="flex items-center gap-2 font-medium">
                    <Briefcase className="h-4 w-4" />
                    Client Prospect
                  </span>
                  <span className="mt-1 block text-sm font-normal text-muted-foreground">
                    Company workspace
                  </span>
                </span>
              </Label>
              <Label
                htmlFor="signup-bum"
                className="flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors hover:bg-muted/60 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
              >
                <RadioGroupItem id="signup-bum" value="BUM" className="mt-1" />
                <span>
                  <span className="flex items-center gap-2 font-medium">
                    <Users className="h-4 w-4" />
                    Bum Prospect
                  </span>
                  <span className="mt-1 block text-sm font-normal text-muted-foreground">
                    Bum account
                  </span>
                </span>
              </Label>
            </RadioGroup>
            {submitted && !role ? <p className="text-sm text-destructive">Select Client Prospect or Bum Prospect.</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
            />
            {submitted && !emailIsValid ? <p className="text-sm text-destructive">Enter a valid email address.</p> : null}
          </div>

          {role === "CLIENT" ? (
            <div className="space-y-2">
              <Label htmlFor="signup-company">Company name</Label>
              <Input
                id="signup-company"
                value={companyName}
                onChange={(event) => setManualCompanyName(event.target.value)}
                readOnly={Boolean(knownClient)}
                placeholder="Company name"
              />
              {knownClient ? (
                <p className="text-sm text-muted-foreground">Matched existing Client workspace for {knownClient.company}.</p>
              ) : (
                <p className="text-sm text-muted-foreground">Required for a first-time Client workspace request.</p>
              )}
              {submitted && !companyIsValid ? <p className="text-sm text-destructive">Enter the company name.</p> : null}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          {canContinue ? (
            <SignUpButton
              mode="modal"
              {...clerkSignUpRedirectProps}
              initialValues={{ emailAddress: email.trim() }}
              unsafeMetadata={unsafeMetadata}
            >
              {continueButton}
            </SignUpButton>
          ) : (
            continueButton
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
