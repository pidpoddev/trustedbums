import { SignUpButton } from "@clerk/react";
import { Briefcase, Users } from "lucide-react";
import { useEffect, useMemo, useState, type ReactElement } from "react";
import { FieldLabel } from "@/components/FieldHelp";
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
  lockedRole?: SignupRole;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function SignupIntentDialog({ children, initialRole, lockedRole }: SignupIntentDialogProps) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<SignupRole | "">(lockedRole ?? initialRole ?? "");
  const [email, setEmail] = useState("");
  const [manualCompanyName, setManualCompanyName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const knownClient = useMemo(() => getKnownClientForEmail(email), [email]);
  const companyName = role === "CLIENT" ? knownClient?.company ?? manualCompanyName : "";
  const emailIsValid = isValidEmail(email);
  const companyIsRequired = role === "CLIENT";
  const companyIsValid = !companyIsRequired || Boolean(companyName.trim());
  const canContinue = Boolean(role && emailIsValid && companyIsValid);
  const accountTypeError = submitted && !role;
  const emailError = submitted && !emailIsValid;
  const companyError = submitted && !companyIsValid;
  const accountLabelId = "signup-account-type-label";
  const accountHelpId = "signup-account-type-help";
  const accountErrorId = "signup-account-type-error";
  const emailHelpId = "signup-email-help";
  const emailErrorId = "signup-email-error";
  const companyHelpId = "signup-company-help";
  const companyErrorId = "signup-company-error";

  useEffect(() => {
    if (role === "BUM") {
      setManualCompanyName("");
    }
  }, [role]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      setRole(lockedRole ?? initialRole ?? "");
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
          <DialogTitle>
            {lockedRole === "CLIENT" ? "Create your Client account" : lockedRole === "BUM" ? "Apply as a Bum" : "Create your account"}
          </DialogTitle>
          <DialogDescription>
            {lockedRole === "CLIENT"
              ? "Add the work email and company name you want attached to Trusted Bums Client access."
              : lockedRole === "BUM"
                ? "Add the email you want attached to your Trusted Bums application."
                : "Choose whether you are a Prospective Client or Prospective Bum, then add the email you want attached to Trusted Bums access."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {!lockedRole ? (
            <div className="space-y-3">
              <FieldLabel
                id={accountLabelId}
                help="Choose Prospective Client when you are requesting company workspace access. Choose Prospective Bum when you are applying to make warm introductions."
              >
                Account type
              </FieldLabel>
              <p id={accountHelpId} className="text-sm text-muted-foreground">
                This choice routes your request to the right onboarding path.
              </p>
              <RadioGroup
                value={role}
                onValueChange={(value) => setRole(value as SignupRole)}
                className="grid gap-3 sm:grid-cols-2"
                aria-labelledby={accountLabelId}
                aria-describedby={accountTypeError ? `${accountHelpId} ${accountErrorId}` : accountHelpId}
                aria-invalid={accountTypeError}
              >
                <Label
                  htmlFor="signup-client"
                  className="flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors hover:bg-muted/60 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                >
                  <RadioGroupItem id="signup-client" value="CLIENT" className="mt-1" />
                  <span>
                    <span className="flex items-center gap-2 font-medium">
                      <Briefcase className="h-4 w-4" />
                      Prospective Client
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
                      Prospective Bum
                    </span>
                    <span className="mt-1 block text-sm font-normal text-muted-foreground">
                      Bum account
                    </span>
                  </span>
                </Label>
              </RadioGroup>
              {accountTypeError ? <p id={accountErrorId} className="text-sm text-destructive">Select Prospective Client or Prospective Bum.</p> : null}
            </div>
          ) : null}

          <div className="space-y-2">
            <FieldLabel
              htmlFor="signup-email"
              help="Use the email you want tied to Trusted Bums access. Client access is reviewed against company identity and domain rules."
            >
              Email
            </FieldLabel>
            <p id={emailHelpId} className="text-sm text-muted-foreground">
              Use a work email for Client access when possible.
            </p>
            <Input
              id="signup-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              aria-describedby={emailError ? `${emailHelpId} ${emailErrorId}` : emailHelpId}
              aria-invalid={emailError}
            />
            {emailError ? <p id={emailErrorId} className="text-sm text-destructive">Enter a valid email address.</p> : null}
          </div>

          {role === "CLIENT" ? (
            <div className="space-y-2">
              <FieldLabel
                htmlFor="signup-company"
                help="This is the company workspace you are requesting. If the email matches a known client, Trusted Bums fills the company name automatically."
              >
                Company name
              </FieldLabel>
              <Input
                id="signup-company"
                value={companyName}
                onChange={(event) => setManualCompanyName(event.target.value)}
                readOnly={Boolean(knownClient)}
                placeholder="Company name"
                aria-describedby={companyError ? `${companyHelpId} ${companyErrorId}` : companyHelpId}
                aria-invalid={companyError}
              />
              {knownClient ? (
                <p id={companyHelpId} className="text-sm text-muted-foreground">Matched existing Client workspace for {knownClient.company}.</p>
              ) : (
                <p id={companyHelpId} className="text-sm text-muted-foreground">Required for a first-time Client workspace request.</p>
              )}
              {companyError ? <p id={companyErrorId} className="text-sm text-destructive">Enter the company name.</p> : null}
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
