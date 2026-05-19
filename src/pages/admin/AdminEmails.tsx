import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Mail, MousePointerClick, Save, Send, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import { formatDateTimeForTimeZone } from "@/lib/timezone";
import {
  createAdminEmailTemplate,
  listAdminEmailDeliveries,
  listAdminEmailEngagementSummary,
  listAdminEmailTemplates,
  saveAdminEmailTemplate,
  sendAdminEmail,
  type AdminEmailCategory,
  type AdminEmailPreviewRecipient,
  type AdminEmailRecipientGroup,
  type AdminEmailTemplateRecord,
  type AdminEmailTriggerEvent,
} from "@/lib/portalApi";

const recipientGroups: Array<{ value: AdminEmailRecipientGroup; label: string }> = [
  { value: "CLIENT_COMPANY", label: "Client company users" },
  { value: "ALL_CLIENTS", label: "All clients" },
  { value: "ALL_BUMS", label: "All Bums" },
  { value: "BUM_INDUSTRY_MATCH", label: "Bums by industry match" },
  { value: "ADMINS", label: "Admins" },
  { value: "CUSTOM", label: "Custom recipients" },
];

const categories: Array<{ value: AdminEmailCategory; label: string }> = [
  { value: "transactional", label: "Transactional" },
  { value: "opportunity_updates", label: "Opportunity updates" },
  { value: "client_alerts", label: "Client alerts" },
  { value: "bum_marketplace_alerts", label: "Bum marketplace alerts" },
  { value: "admin_announcements", label: "Admin announcements" },
  { value: "onboarding", label: "Onboarding" },
  { value: "marketing", label: "Marketing" },
];

const triggerEvents: Array<{ value: AdminEmailTriggerEvent; label: string }> = [
  { value: "MANUAL", label: "Manual only" },
  { value: "OPPORTUNITY_CLAIM_CREATED", label: "Opportunity claim created" },
  { value: "OPPORTUNITY_CLAIM_STATUS_CHANGED", label: "Claim status changed" },
  { value: "CLIENT_CREATED", label: "Client created" },
  { value: "CLIENT_TARGET_CREATED", label: "Client target created" },
  { value: "CONTACT_SUBMISSION_CREATED", label: "Contact form submitted" },
];

function parseRecipients(value: string) {
  return Array.from(new Set(value.split(/[\n,;]+/).map((item) => item.trim().toLowerCase()).filter(Boolean)));
}

function cloneTemplate(template: AdminEmailTemplateRecord): AdminEmailTemplateRecord {
  return { ...template, metadata_fields: [...template.metadata_fields] };
}

function createBlankTemplate(): AdminEmailTemplateRecord {
  const now = new Date().toISOString();
  return {
    id: "new-template",
    slug: "",
    name: "New email template",
    description: "",
    recipient_group: "CUSTOM",
    trigger_event: "MANUAL",
    subject: "{{headline}}",
    body: "Hi {{recipient_name}},\n\n{{message}}\n\nTrusted Bums",
    metadata_fields: ["headline", "recipient_name", "message"],
    category: "admin_announcements",
    reply_to: "bums@trustedbums.com",
    rate_limit_per_hour: 120,
    is_active: true,
    created_by: null,
    updated_by: null,
    created_at: now,
    updated_at: now,
  };
}

export default function AdminEmails() {
  const { user } = useAuth();
  const { toast } = useToast();
  const timeZone = useUserTimeZone();
  const queryClient = useQueryClient();
  const templatesQuery = useQuery({ queryKey: ["admin-email-templates"], queryFn: listAdminEmailTemplates });
  const deliveriesQuery = useQuery({ queryKey: ["admin-email-deliveries"], queryFn: listAdminEmailDeliveries });
  const engagementQuery = useQuery({ queryKey: ["admin-email-engagement"], queryFn: listAdminEmailEngagementSummary });
  const templates = templatesQuery.data ?? [];
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [draft, setDraft] = useState<AdminEmailTemplateRecord | null>(null);
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [customRecipients, setCustomRecipients] = useState("");
  const [testRecipientEmail, setTestRecipientEmail] = useState(user?.email ?? "bums@trustedbums.com");
  const [previewRecipients, setPreviewRecipients] = useState<AdminEmailPreviewRecipient[]>([]);
  const [previewCount, setPreviewCount] = useState(0);
  const [suppressedCount, setSuppressedCount] = useState(0);

  const selectedTemplate = useMemo(
    () => (selectedTemplateId ? templates.find((template) => template.id === selectedTemplateId) : templates[0]),
    [selectedTemplateId, templates],
  );

  useEffect(() => {
    if (!selectedTemplate) return;
    setSelectedTemplateId(selectedTemplate.id);
    setDraft(cloneTemplate(selectedTemplate));
    setMetadata(Object.fromEntries(selectedTemplate.metadata_fields.map((field) => [field, field === "admin_note" ? "Review this in the portal when you have a chance." : ""])));
    setCustomRecipients("");
    setPreviewRecipients([]);
    setPreviewCount(0);
    setSuppressedCount(0);
  }, [selectedTemplate]);

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!user || !draft) throw new Error("Choose a template first.");
      return draft.id === "new-template" ? createAdminEmailTemplate(user, draft) : saveAdminEmailTemplate(user, draft);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-email-templates"] });
      toast({ title: "Template saved", description: "Future manual and triggered sends will use the new copy." });
    },
    onError: (error) => toast({ title: "Unable to save template", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" }),
  });

  const buildSendInput = (mode: "manual" | "preview" | "test") => {
    if (!draft) throw new Error("Choose a template first.");
    return {
      mode,
      templateId: draft.id,
      recipientGroup: draft.recipient_group,
      recipientEmails: draft.recipient_group === "CUSTOM" ? parseRecipients(customRecipients) : undefined,
      testRecipientEmail,
      subject: draft.subject,
      body: draft.body,
      metadata,
      triggeredBy: mode === "test" ? "TEST" : "MANUAL",
    };
  };

  const previewMutation = useMutation({
    mutationFn: () => sendAdminEmail(buildSendInput("preview")),
    onSuccess: (result) => {
      setPreviewRecipients(result.recipients ?? []);
      setPreviewCount(result.count ?? 0);
      setSuppressedCount(result.suppressed ?? 0);
      toast({ title: "Audience preview ready", description: `${result.count ?? 0} sendable recipients${result.suppressed ? `, ${result.suppressed} suppressed` : ""}.` });
    },
    onError: (error) => toast({ title: "Unable to preview audience", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" }),
  });

  const sendMutation = useMutation({
    mutationFn: (mode: "manual" | "test") => sendAdminEmail(buildSendInput(mode)),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-email-deliveries"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-email-engagement"] });
      toast({ title: result.mode === "test" ? "Test email sent" : "Email send complete", description: `${result.sent} sent${result.failed ? `, ${result.failed} failed` : ""}${result.suppressed ? `, ${result.suppressed} suppressed` : ""}.` });
    },
    onError: (error) => toast({ title: "Unable to send email", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" }),
  });

  const updateDraft = <Key extends keyof AdminEmailTemplateRecord>(key: Key, value: AdminEmailTemplateRecord[Key]) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  const engagement = engagementQuery.data ?? [];
  const deliveries = deliveriesQuery.data ?? [];
  const totalOpens = deliveries.filter((delivery) => delivery.opened_at).length;
  const totalClicks = deliveries.filter((delivery) => delivery.clicked_at).length;

  return (
    <div>
      <PageHeader title="Emails" description="Edit templates, preview audiences, send tests, and track engagement.">
        <Button
          variant="outline"
          onClick={() => {
            setSelectedTemplateId("new-template");
            setDraft(createBlankTemplate());
            setMetadata({ headline: "", recipient_name: "", message: "" });
            setCustomRecipients("");
            setPreviewRecipients([]);
            setPreviewCount(0);
            setSuppressedCount(0);
          }}
        >
          New Template
        </Button>
        <Button variant="outline" onClick={() => previewMutation.mutate()} disabled={!draft || previewMutation.isPending}>Preview Audience</Button>
        <Button onClick={() => sendMutation.mutate("manual")} disabled={!draft || sendMutation.isPending}><Send className="mr-2 h-4 w-4" />Send</Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Sendable preview</p><p className="text-2xl font-semibold">{previewCount}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Suppressed</p><p className="text-2xl font-semibold">{suppressedCount}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Tracked opens</p><p className="text-2xl font-semibold">{totalOpens}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Tracked clicks</p><p className="text-2xl font-semibold">{totalClicks}</p></CardContent></Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 font-display"><Mail className="h-5 w-5" />Templates</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {templatesQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading templates...</p> : null}
            {templatesQuery.isError ? <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">Unable to load templates. Refresh your session and confirm this account has Admin access.</p> : null}
            {!templatesQuery.isLoading && !templatesQuery.isError && !templates.length ? <p className="rounded-md border p-3 text-sm text-muted-foreground">No templates are visible yet. Use New Template to create one.</p> : null}
            {draft?.id === "new-template" ? (
              <button type="button" className="w-full rounded-lg border border-primary bg-primary/5 p-3 text-left text-sm">
                <span className="font-medium">New email template</span>
                <p className="mt-1 text-xs text-muted-foreground">Unsaved draft</p>
              </button>
            ) : null}
            {templates.map((template) => (
              <button key={template.id} type="button" onClick={() => setSelectedTemplateId(template.id)} className={`w-full rounded-lg border p-3 text-left text-sm transition hover:border-primary ${template.id === selectedTemplateId ? "border-primary bg-primary/5" : "border-border"}`}>
                <div className="flex items-start justify-between gap-2"><span className="font-medium">{template.name}</span><Badge variant={template.is_active ? "default" : "secondary"}>{template.is_active ? "Active" : "Off"}</Badge></div>
                <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">{categories.find((item) => item.value === template.category)?.label ?? template.category}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="font-display">Composer</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {!draft ? <p className="text-sm text-muted-foreground">Choose a template to start composing.</p> : (
                <>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-2"><Label>Name</Label><Input value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} /></div>
                    <div className="space-y-2"><Label>Recipient group</Label><Select value={draft.recipient_group} onValueChange={(value) => updateDraft("recipient_group", value as AdminEmailRecipientGroup)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{recipientGroups.map((group) => <SelectItem key={group.value} value={group.value}>{group.label}</SelectItem>)}</SelectContent></Select></div>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-3">
                    <div className="space-y-2"><Label>Trigger</Label><Select value={draft.trigger_event ?? "MANUAL"} onValueChange={(value) => updateDraft("trigger_event", value as AdminEmailTriggerEvent)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{triggerEvents.map((trigger) => <SelectItem key={trigger.value} value={trigger.value}>{trigger.label}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Category</Label><Select value={draft.category} onValueChange={(value) => updateDraft("category", value as AdminEmailCategory)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map((category) => <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>)}</SelectContent></Select></div>
                    <div className="flex items-center justify-between rounded-md border px-3 py-2"><Label>Active</Label><Switch checked={draft.is_active} onCheckedChange={(checked) => updateDraft("is_active", checked)} /></div>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-2"><Label>Reply-to</Label><Input value={draft.reply_to ?? ""} onChange={(event) => updateDraft("reply_to", event.target.value)} placeholder="bums@trustedbums.com" /></div>
                    <div className="space-y-2"><Label>Test recipient</Label><Input value={testRecipientEmail} onChange={(event) => setTestRecipientEmail(event.target.value)} /></div>
                  </div>
                  <div className="space-y-2"><Label>Subject</Label><Input value={draft.subject} onChange={(event) => updateDraft("subject", event.target.value)} /></div>
                  <div className="space-y-2"><Label>Body</Label><Textarea rows={11} value={draft.body} onChange={(event) => updateDraft("body", event.target.value)} /></div>
                  <div className="space-y-2"><Label>Metadata fields</Label><Input value={draft.metadata_fields.join(", ")} onChange={(event) => updateDraft("metadata_fields", event.target.value.split(",").map((field) => field.trim()).filter(Boolean))} /></div>
                  {draft.recipient_group === "CUSTOM" ? <div className="space-y-2"><Label>Custom recipients</Label><Textarea rows={3} value={customRecipients} onChange={(event) => setCustomRecipients(event.target.value)} placeholder="one@example.com, two@example.com" /></div> : null}
                  {draft.metadata_fields.length ? <div className="grid gap-3 md:grid-cols-2">{draft.metadata_fields.map((field) => <div key={field} className="space-y-2"><Label>{field}</Label><Input value={metadata[field] ?? ""} onChange={(event) => setMetadata((current) => ({ ...current, [field]: event.target.value }))} /></div>)}</div> : null}
                  <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}><Save className="mr-2 h-4 w-4" />{draft.id === "new-template" ? "Create Template" : "Save Template"}</Button><Button variant="outline" onClick={() => sendMutation.mutate("test")} disabled={sendMutation.isPending}><ShieldAlert className="mr-2 h-4 w-4" />Send Test</Button><Button variant="outline" onClick={() => previewMutation.mutate()} disabled={previewMutation.isPending}><Eye className="mr-2 h-4 w-4" />Preview Audience</Button><Button onClick={() => sendMutation.mutate("manual")} disabled={sendMutation.isPending}><Send className="mr-2 h-4 w-4" />Send Manually</Button></div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="font-display">Audience preview</CardTitle></CardHeader>
              <CardContent><div className="max-h-72 overflow-auto rounded-md border"><Table><TableHeader><TableRow><TableHead>Recipient</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{previewRecipients.map((recipient) => <TableRow key={recipient.email}><TableCell>{recipient.name ? `${recipient.name} · ${recipient.email}` : recipient.email}</TableCell><TableCell><Badge variant={recipient.suppressed ? "destructive" : "default"}>{recipient.suppressed ? recipient.suppressionReason ?? "Suppressed" : "Sendable"}</Badge></TableCell></TableRow>)}{!previewRecipients.length ? <TableRow><TableCell colSpan={2} className="text-sm text-muted-foreground">Preview an audience before sending.</TableCell></TableRow> : null}</TableBody></Table></div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 font-display"><MousePointerClick className="h-5 w-5" />Most engaged</CardTitle></CardHeader>
              <CardContent><div className="max-h-72 overflow-auto rounded-md border"><Table><TableHeader><TableRow><TableHead>Person</TableHead><TableHead>Role</TableHead><TableHead>Score</TableHead><TableHead>Last</TableHead></TableRow></TableHeader><TableBody>{engagement.slice(0, 10).map((row) => <TableRow key={row.recipient_email}><TableCell><p>{row.full_name ?? row.recipient_email}</p><p className="text-xs text-muted-foreground">{row.company_name ?? row.recipient_email}</p></TableCell><TableCell>{row.role ?? "-"}</TableCell><TableCell>{row.engagement_score}</TableCell><TableCell>{row.last_engaged_at ? formatDateTimeForTimeZone(row.last_engaged_at, timeZone) : "-"}</TableCell></TableRow>)}{!engagement.length ? <TableRow><TableCell colSpan={4} className="text-sm text-muted-foreground">No tracked engagement yet.</TableCell></TableRow> : null}</TableBody></Table></div></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="font-display">Recent deliveries</CardTitle></CardHeader>
            <CardContent><Table><TableHeader><TableRow><TableHead>Recipient</TableHead><TableHead>Template</TableHead><TableHead>Status</TableHead><TableHead>Engagement</TableHead><TableHead>Created</TableHead></TableRow></TableHeader><TableBody>{deliveries.map((delivery) => <TableRow key={delivery.id}><TableCell>{delivery.recipient_email}</TableCell><TableCell>{delivery.template_slug ?? "Custom"}{delivery.is_test ? <Badge className="ml-2" variant="secondary">Test</Badge> : null}</TableCell><TableCell><Badge variant={delivery.status === "SENT" ? "default" : delivery.status === "FAILED" ? "destructive" : "secondary"}>{delivery.status}</Badge></TableCell><TableCell><div className="flex gap-2 text-xs"><span className={delivery.opened_at ? "text-foreground" : "text-muted-foreground"}>open</span><span className={delivery.clicked_at ? "text-foreground" : "text-muted-foreground"}>click</span><span>{delivery.engagement_score}</span></div></TableCell><TableCell>{formatDateTimeForTimeZone(delivery.created_at, timeZone)}</TableCell></TableRow>)}{!deliveriesQuery.isLoading && !deliveries.length ? <TableRow><TableCell colSpan={5} className="text-sm text-muted-foreground">No email deliveries have been logged yet.</TableCell></TableRow> : null}</TableBody></Table></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
