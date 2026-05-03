import { Link } from "react-router-dom";
import { CheckCircle, Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PartnerTermsContent } from "@/components/PartnerTermsContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentTermsState } from "@/hooks/use-current-terms";
import { downloadPartnerTermsPdf } from "@/lib/pdf";

export default function ClientAgreements() {
  const { terms, acceptance, hasAcceptedCurrentTerms, isLoading } = useCurrentTermsState();

  if (isLoading || !terms) {
    return <div className="text-sm text-muted-foreground">Loading agreement records...</div>;
  }

  return (
    <div>
      <PageHeader title="Agreements" description="Review partner terms, FAQ, and your current acceptance status.">
        <Button variant="outline" onClick={() => downloadPartnerTermsPdf(terms)}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card className={hasAcceptedCurrentTerms ? "border-success/40" : "border-warning/50"}>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              {hasAcceptedCurrentTerms ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <FileText className="h-5 w-5 text-warning" />
              )}
              Current Partner Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">{terms.title}</p>
              <p className="text-sm text-muted-foreground">Version {terms.version}</p>
            </div>
            {hasAcceptedCurrentTerms ? (
              <p className="text-sm text-muted-foreground">
                Accepted {acceptance ? new Date(acceptance.accepted_at).toLocaleString() : "for this version"}.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">This terms version still needs acceptance.</p>
            )}
            <Button asChild className="w-full">
              <Link to="/client/terms">Open terms screen</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="max-h-[72vh] overflow-y-auto pt-6">
            <PartnerTermsContent terms={terms} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
