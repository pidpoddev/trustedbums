import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Send } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_COMMISSION_DURATION } from "@/data/partnerTerms";
import { createOpportunityRegistration } from "@/lib/portalApi";

const initialForm = {
  target_account_name: "",
  business_unit: "",
  opportunity_description: "",
  client_contact: "",
  trusted_bums_contact: "",
  expected_product_service: "",
  estimated_deal_value: "",
  expected_timeline: "",
  commission_rate: "10",
  commission_duration: DEFAULT_COMMISSION_DURATION,
  notes: "",
};

export default function ClientOpportunityNew() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitOpportunity = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      return;
    }

    setIsSubmitting(true);
    try {
      const opportunity = await createOpportunityRegistration(user, {
        ...form,
        estimated_deal_value: form.estimated_deal_value ? Number(form.estimated_deal_value) : null,
        commission_rate: Number(form.commission_rate || 10),
        status: "Submitted",
      });
      setSubmittedId(opportunity.id);
      setForm(initialForm);
      toast({
        title: "Opportunity submitted",
        description: "Trusted Bums admin has been notified for review.",
      });
    } catch (error) {
      toast({
        title: "Unable to register opportunity",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Register Opportunity"
        description="Document account access, deal context, and commission terms before the work begins."
      />

      {submittedId && (
        <Card className="mb-6 border-success/40 bg-success/5">
          <CardContent className="flex items-center justify-between gap-4 pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="font-medium">Registration submitted</p>
                <p className="text-sm text-muted-foreground">Audit record created. Admin review is now pending.</p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link to="/client/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Opportunity details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={submitOpportunity}>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="targetAccount">Target account name</Label>
                <Input
                  id="targetAccount"
                  required
                  value={form.target_account_name}
                  onChange={(event) => updateField("target_account_name", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessUnit">Business unit / department</Label>
                <Input
                  id="businessUnit"
                  value={form.business_unit}
                  onChange={(event) => updateField("business_unit", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientContact">Client contact</Label>
                <Input
                  id="clientContact"
                  value={form.client_contact}
                  onChange={(event) => updateField("client_contact", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tbContact">Trusted Bums contact</Label>
                <Input
                  id="tbContact"
                  value={form.trusted_bums_contact}
                  onChange={(event) => updateField("trusted_bums_contact", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product">Expected product/service</Label>
                <Input
                  id="product"
                  value={form.expected_product_service}
                  onChange={(event) => updateField("expected_product_service", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dealValue">Estimated deal value</Label>
                <Input
                  id="dealValue"
                  type="number"
                  min="0"
                  step="1000"
                  value={form.estimated_deal_value}
                  onChange={(event) => updateField("estimated_deal_value", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline">Expected timeline</Label>
                <Input
                  id="timeline"
                  value={form.expected_timeline}
                  onChange={(event) => updateField("expected_timeline", event.target.value)}
                  placeholder="Example: Q3 pilot, Q4 close"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commissionRate">Commission rate</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.commission_rate}
                  onChange={(event) => updateField("commission_rate", event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Opportunity description</Label>
              <Textarea
                id="description"
                rows={4}
                value={form.opportunity_description}
                onChange={(event) => updateField("opportunity_description", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Commission duration</Label>
              <Textarea
                id="duration"
                rows={3}
                value={form.commission_duration}
                onChange={(event) => updateField("commission_duration", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={4} value={form.notes} onChange={(event) => updateField("notes", event.target.value)} />
            </div>

            <div className="flex justify-end">
              <Button disabled={isSubmitting}>
                <Send className="mr-2 h-4 w-4" />
                Submit Registration
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
