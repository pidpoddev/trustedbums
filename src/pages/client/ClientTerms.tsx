import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Download, Mail, MessageCircle, ScrollText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PartnerTermsContent } from "@/components/PartnerTermsContent";
import { SubmitFeedbackButton } from "@/components/SubmitFeedbackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { getDefaultPathForRole } from "@/data/authData";
import { useToast } from "@/hooks/use-toast";
import { useCurrentTermsState } from "@/hooks/use-current-terms";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import { acceptPartnerTerms } from "@/lib/portalApi";
import { downloadPartnerTermsPdf } from "@/lib/pdf";
import { formatDateTimeForTimeZone } from "@/lib/timezone";

interface LocationState {
  from?: string;
}

function resolveDashboardPath(role: "ADMIN" | "CLIENT" | "BUM", from?: string) {
  if (from && from !== "/terms" && from !== "/login" && from !== "/client/terms" && from !== "/bum/terms") {
    return from;
  }

  return getDefaultPathForRole(role);
}

export default function ClientTerms() {
  const { user } = useAuth();
  const timeZone = useUserTimeZone();
  const { terms, acceptance, requiredAssignment, hasAcceptedCurrentTerms, isLoading, error, refetch } = useCurrentTermsState();
  const [checked, setChecked] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [shouldAutoContinue, setShouldAutoContinue] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = location.state as LocationState | null;
  const isBumTerms = user?.role === "BUM";
  const dashboardPath = user ? resolveDashboardPath(user.role, state?.from) : "/";

  useEffect(() => {
    if (!user || !hasAcceptedCurrentTerms) {
      return;
    }

    if (!shouldAutoContinue) {
      return;
    }

    navigate(dashboardPath, { replace: true });
  }, [dashboardPath, hasAcceptedCurrentTerms, isBumTerms, navigate, shouldAutoContinue, user]);

  const acceptTerms = async () => {
    if (!user || !terms) {
      return;
    }

    setIsAccepting(true);
    try {
      await acceptPartnerTerms(user, terms, navigator.userAgent ?? null);
      await refetch();
      setShouldAutoContinue(true);
      toast({
        title: isBumTerms ? "Bum agreement accepted" : "Partner terms accepted",
        description: "Your acceptance was recorded for this terms version.",
      });
    } catch (error) {
      toast({
        title: isBumTerms ? "Unable to accept Bum agreement" : "Unable to accept terms",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  if (error) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
        Unable to load partner terms: {error instanceof Error ? error.message : "Please try again."}
      </div>
    );
  }

  if (isLoading || !terms) {
    return <div className="text-sm text-muted-foreground">Loading partner terms...</div>;
  }

  return (
    <div id="top">
      <div className="mb-4 flex justify-end">
        <SubmitFeedbackButton />
      </div>
      <PageHeader
        title={isBumTerms ? "Trusted Bums Bum Terms" : "Trusted Bums Terms & Legal Agreements"}
        description={
          requiredAssignment
            ? "Review and accept this assigned contract before continuing into the platform."
            : isBumTerms
              ? "Review and accept the current Bum agreement before continuing into the Bum portal."
              : "Review and accept the current client legal terms before continuing into the platform."
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardContent className="max-h-[72vh] overflow-y-auto pt-6">
            <PartnerTermsContent terms={terms} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className={hasAcceptedCurrentTerms ? "border-success/40" : "border-warning/50"}>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                {hasAcceptedCurrentTerms ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <ScrollText className="h-5 w-5 text-primary" />
                )}
                Acceptance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {requiredAssignment ? (
                <div className="rounded-md border border-primary/20 bg-primary/5 p-4 text-sm">
                  <p className="font-medium text-foreground">Assigned contract</p>
                  <p className="mt-1 leading-6 text-muted-foreground">This contract was assigned specifically to {requiredAssignment.companies?.name ?? requiredAssignment.profiles?.email ?? "this account"} and must be accepted before access continues.</p>
                </div>
              ) : null}
              {hasAcceptedCurrentTerms ? (
                <div className="rounded-md bg-success/10 p-4 text-sm">
                  <p className="font-medium text-success">Current terms accepted</p>
                  <p className="text-muted-foreground mt-1">
                    Accepted {acceptance ? formatDateTimeForTimeZone(acceptance.accepted_at, timeZone) : "for this version"}.
                  </p>
                </div>
              ) : (
                <>
                  {terms.change_summary ? (
                    <div className="rounded-md border border-primary/20 bg-primary/5 p-4 text-sm">
                      <p className="font-medium text-foreground">What changed in version {terms.version}</p>
                      <p className="mt-1 leading-6 text-muted-foreground">{terms.change_summary}</p>
                    </div>
                  ) : null}
                  <div className="flex items-start gap-3 rounded-md border p-4">
                    <Checkbox
                      id="partnerTerms"
                      checked={checked}
                      onCheckedChange={(value) => setChecked(Boolean(value))}
                    />
                    <Label htmlFor="partnerTerms" className="text-sm leading-6">
                      {isBumTerms
                        ? "I have read and agree to the Trusted Bums Bum Agreement, including the confidentiality, conduct, compliance, and payout eligibility terms."
                        : "I have read and agree to the Trusted Bums Partner Terms, including the commission, non-circumvention, confidentiality, and opportunity registration terms."}
                    </Label>
                  </div>
                  <Button className="w-full" disabled={!checked || isAccepting} onClick={acceptTerms}>
                    Accept & Continue
                  </Button>
                </>
              )}

              <div className="grid gap-2">
                <Button variant="outline" asChild>
                  <a href="#top">
                    <ScrollText className="mr-2 h-4 w-4" />
                    {isBumTerms ? "View Bum Agreement" : "View Partner Terms"}
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="#agreement-faq">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    View FAQ
                  </a>
                </Button>
                <Button variant="outline" onClick={() => downloadPartnerTermsPdf(terms)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF Copy
                </Button>
                <Button variant="outline" asChild>
                  <a href="mailto:bums@trustedbums.com?subject=Trusted%20Bums%20Partner%20Terms">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Trusted Bums
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
