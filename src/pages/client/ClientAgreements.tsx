import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PartnerTermsContent } from "@/components/PartnerTermsContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentTermsState } from "@/hooks/use-current-terms";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import { downloadPartnerTermsPdf } from "@/lib/pdf";
import { listCompanyAgreements } from "@/lib/portalApi";
import { formatDateForTimeZone, formatDateTimeForTimeZone } from "@/lib/timezone";

export default function ClientAgreements() {
  const { user } = useAuth();
  const timeZone = useUserTimeZone();
  const { terms, acceptance, hasAcceptedCurrentTerms, isLoading } = useCurrentTermsState();
  const customAgreementsQuery = useQuery({
    queryKey: ["company-agreements", user?.clientId],
    queryFn: () => listCompanyAgreements(user!.clientId!),
    enabled: Boolean(user?.clientId),
  });
  const customAgreements = customAgreementsQuery.data ?? [];

  if (isLoading || !terms) {
    return <div className="text-sm text-muted-foreground">Loading agreement records...</div>;
  }

  return (
    <div>
      <PageHeader title="Client Agreement" description="Review the current Client Agreement, FAQ, and agreement records.">
        <Button variant="outline" onClick={() => downloadPartnerTermsPdf(terms)}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <Card className={hasAcceptedCurrentTerms ? "border-success/40" : "border-warning/50"}>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                {hasAcceptedCurrentTerms ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <FileText className="h-5 w-5 text-warning" />
                )}
                Current Client Agreement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">{terms.title}</p>
                <p className="text-sm text-muted-foreground">Version {terms.version}</p>
              </div>
              {hasAcceptedCurrentTerms ? (
                <p className="text-sm text-muted-foreground">
                  Accepted {acceptance ? formatDateTimeForTimeZone(acceptance.accepted_at, timeZone) : "for this version"}.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">This Client Agreement version still needs acceptance.</p>
              )}
              <Button asChild className="w-full">
                <Link to="/client/terms">Review Client Agreement</Link>
              </Button>
            </CardContent>
          </Card>

          {customAgreements.length ? (
            <Card>
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Agreement records
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {customAgreements.map((agreement) => (
                  <div key={agreement.id} className="rounded-xl border p-3">
                    <p className="font-medium">{agreement.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {agreement.status} {agreement.effective_date ? `• Effective ${formatDateForTimeZone(agreement.effective_date, timeZone)}` : ""}
                    </p>
                    {agreement.summary ? <p className="mt-2 text-sm text-muted-foreground">{agreement.summary}</p> : null}
                    {agreement.document_url ? (
                      <Button asChild size="sm" variant="outline" className="mt-3 w-full">
                        <a href={agreement.document_url} target="_blank" rel="noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          Open DOCX
                        </a>
                      </Button>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <Card>
          <CardContent className="max-h-[72vh] overflow-y-auto pt-6">
            <PartnerTermsContent terms={terms} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
