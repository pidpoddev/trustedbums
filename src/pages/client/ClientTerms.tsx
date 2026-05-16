import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Download, Mail, MessageCircle, ScrollText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PartnerTermsContent } from "@/components/PartnerTermsContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { getDefaultPathForRole } from "@/data/authData";
import { getBumTermsAcceptanceStorageKey } from "@/data/partnerTerms";
import { useToast } from "@/hooks/use-toast";
import { useCurrentTermsState } from "@/hooks/use-current-terms";
import { acceptPartnerTerms } from "@/lib/portalApi";
import { downloadPartnerTermsPdf } from "@/lib/pdf";

interface LocationState {
  from?: string;
}

function resolveDashboardPath(role: "ADMIN" | "CLIENT" | "BUM", from?: string) {
  if (from && from !== "/terms" && from !== "/login" && from !== "/client/terms") {
    return from;
  }

  return getDefaultPathForRole(role);
}

export default function ClientTerms() {
  const { user } = useAuth();
  const { terms, acceptance, hasAcceptedCurrentTerms, isLoading, refetch } = useCurrentTermsState();
  const [checked, setChecked] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = location.state as LocationState | null;
  const isBumTerms = user?.role === "BUM";
  const dashboardPath = user ? resolveDashboardPath(user.role, state?.from) : "/";

  const acceptTerms = async () => {
    if (!user || !terms) {
      return;
    }

    setIsAccepting(true);
    try {
      if (isBumTerms) {
        const key = getBumTermsAcceptanceStorageKey(user.id, terms.version);
        window.localStorage.setItem(key, "true");
      } else {
        await acceptPartnerTerms(user, terms, navigator.userAgent ?? null);
      }
      await refetch();
      toast({
        title: isBumTerms ? "Connector agreement accepted" : "Partner terms accepted",
        description: "Your acceptance was recorded for this terms version.",
      });
      navigate(dashboardPath, { replace: true });
    } catch (error) {
      toast({
        title: isBumTerms ? "Unable to accept connector agreement" : "Unable to accept terms",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading || !terms) {
    return <div className="text-sm text-muted-foreground">Loading partner terms...</div>;
  }

  return (
    <div id="top">
      <PageHeader
        title={isBumTerms ? "Trusted Bums Connector Terms" : "Trusted Bums Terms & Legal Agreements"}
        description={
          isBumTerms
            ? "Review and accept the current connector agreement before continuing into the Bum portal."
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
              {hasAcceptedCurrentTerms ? (
                <div className="rounded-md bg-success/10 p-4 text-sm">
                  <p className="font-medium text-success">Current terms accepted</p>
                  <p className="text-muted-foreground mt-1">
                    Accepted {acceptance ? new Date(acceptance.accepted_at).toLocaleString() : "for this version"}.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3 rounded-md border p-4">
                    <Checkbox
                      id="partnerTerms"
                      checked={checked}
                      onCheckedChange={(value) => setChecked(Boolean(value))}
                    />
                    <Label htmlFor="partnerTerms" className="text-sm leading-6">
                      {isBumTerms
                        ? "I have read and agree to the Trusted Bums Connector Agreement, including the confidentiality, conduct, compliance, and payout eligibility terms."
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
                    {isBumTerms ? "View Connector Agreement" : "View Partner Terms"}
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
                {hasAcceptedCurrentTerms && (
                  <Button onClick={() => navigate(dashboardPath, { replace: true })}>
                    Continue to Dashboard
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
