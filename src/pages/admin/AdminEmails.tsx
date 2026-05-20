import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Eye, HelpCircle, Image, Mail, Megaphone, MousePointerClick, Plus, Save, Send, ShieldAlert, Sparkles, Workflow } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import { formatDateTimeForTimeZone } from "@/lib/timezone";
import {
  createAdminEmailSchedule,
  createAdminEmailTemplate,
  createAdminEmailTriggerRule,
  getAdminEmailBrandSettings,
  listAdminEmailCampaigns,
  listAdminEmailDeliveries,
  listAdminEmailEngagementSummary,
  listAdminEmailSchedules,
  listAdminEmailTemplates,
  listAdminEmailTriggerRules,
  listCompanies,
  saveAdminEmailBrandSettings,
  saveAdminEmailTemplate,
  sendAdminEmail,
  updateAdminEmailSchedule,
  updateAdminEmailTriggerRule,
  type AdminEmailBrandSettingsInput,
  type AdminEmailCategory,
  type AdminEmailPreviewRecipient,
  type AdminEmailRecipientGroup,
  type AdminEmailScheduleInput,
  type AdminEmailScheduleRecord,
  type AdminEmailTemplateRecord,
  type AdminEmailTriggerEvent,
  type AdminEmailTriggerRuleInput,
  type AdminEmailTriggerRuleRecord,
} from "@/lib/portalApi";

type TriggerRuleEvent = Exclude<AdminEmailTriggerEvent, "MANUAL">;

const recipientGroups: Array<{ value: AdminEmailRecipientGroup; label: string }> = [
  { value: "CLIENT_COMPANY", label: "Client company users" },
  { value: "ALL_CLIENTS", label: "All clients" },
  { value: "ALL_BUMS", label: "All Bums" },
  { value: "BUM_INDUSTRY_MATCH", label: "Bums by industry" },
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

const triggerEvents: Array<{ value: TriggerRuleEvent; label: string }> = [
  { value: "OPPORTUNITY_CLAIM_CREATED", label: "Opportunity claim created" },
  { value: "OPPORTUNITY_CLAIM_STATUS_CHANGED", label: "Claim status changed" },
  { value: "CLIENT_CREATED", label: "Client created" },
  { value: "CLIENT_TARGET_CREATED", label: "Client target created" },
  { value: "CONTACT_SUBMISSION_CREATED", label: "Contact form submitted" },
];

const defaultBrand: AdminEmailBrandSettingsInput = {
  sender_name: "Trusted Bums",
  logo_url: "https://trustedbums.com/logo-mark.svg",
  accent_color: "#ea580c",
  footer_text: "Trusted Bums connects relationship-led sellers with companies that need warm introductions.",
  physical_address: "",
};

function FieldLabel({ label, help }: { label: string; help: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Label>{label}</Label>
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground" aria-label={label + " help"}>
              <HelpCircle className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs leading-5">{help}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

function parseRecipients(value: string) {
  return Array.from(new Set(value.split(/[\n,;]+/).map((item) => item.trim().toLowerCase()).filter(Boolean)));
}

function parseJsonObject(value: string, fallback: Record<string, unknown> = {}) {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  const parsed = JSON.parse(trimmed) as unknown;
  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new Error("Use a JSON object like client_name: Acme.");
  }
  return parsed as Record<string, unknown>;
}

function cloneTemplate(template: AdminEmailTemplateRecord): AdminEmailTemplateRecord {
  return { ...template, metadata_fields: [...template.metadata_fields] };
}

function renderTemplateText(template: string, values: Record<string, string>) {
  return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_match, key: string) => values[key] ?? "");
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function renderPreviewHtml(body: string, brand: AdminEmailBrandSettingsInput) {
  const lines = body.split("\n").map((line) => {
    const imageMatch = line.trim().match(/^!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)$/);
    if (imageMatch) {
      return '<img src="' + escapeHtml(imageMatch[2]) + '" alt="' + escapeHtml(imageMatch[1] || "Email image") + '" style="display:block;max-width:100%;height:auto;border:0;border-radius:8px;margin:16px 0;" />';
    }
    return escapeHtml(line).replace(/https?:\/\/[^\s<]+/g, (url) => '<a href="' + escapeHtml(url) + '" style="color:' + brand.accent_color + ';text-decoration:underline;">' + escapeHtml(url) + '</a>');
  }).join("<br>");
  const address = brand.physical_address ? '<div style="margin-top:8px;">' + escapeHtml(brand.physical_address) + '</div>' : "";
  return '<div style="background:#f8fafc;padding:18px;"><div style="max-width:680px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;"><div style="padding:22px 26px;border-bottom:1px solid #e2e8f0;"><img src="' + escapeHtml(brand.logo_url || defaultBrand.logo_url) + '" alt="' + escapeHtml(brand.sender_name || "Trusted Bums") + '" style="display:block;max-height:48px;width:auto;border:0;" /><div style="height:4px;width:56px;background:' + brand.accent_color + ';border-radius:999px;margin-top:18px;"></div></div><div style="padding:26px;font-size:15px;line-height:1.65;color:#334155;">' + lines + '</div><div style="padding:16px 26px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;line-height:1.5;color:#64748b;">' + escapeHtml(brand.footer_text || defaultBrand.footer_text) + address + '</div></div></div>';
}

function resolvePreviewRecipient(previewRecipients: AdminEmailPreviewRecipient[], testRecipientEmail: string) {
  const recipient = previewRecipients.find((item) => !item.suppressed) ?? previewRecipients[0];
  const fallbackEmail = testRecipientEmail.trim() || "recipient@example.com";
  const email = recipient?.email ?? fallbackEmail;
  const name = recipient?.name ?? email;
  return { email, name };
}

function createBlankTemplate(): AdminEmailTemplateRecord {
  const now = new Date().toISOString();
  return {
    id: "new-template",
    slug: "",
    name: "New campaign email",
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

function summarizeCron(value: string) {
  const known: Record<string, string> = {
    "0 9 * * 1": "Mondays at 9:00",
    "0 9 * * *": "Daily at 9:00",
    "0 9 1 * *": "Monthly on the 1st at 9:00",
  };
  return known[value.trim()] ?? value;
}

export default function AdminEmails() {
  const { user } = useAuth();
  const { toast } = useToast();
  const timeZone = useUserTimeZone();
  const queryClient = useQueryClient();
  const canLoadAdminEmailData = user?.role === "ADMIN";

  const templatesQuery = useQuery({ queryKey: ["admin-email-templates", user?.id], queryFn: listAdminEmailTemplates, enabled: canLoadAdminEmailData });
  const deliveriesQuery = useQuery({ queryKey: ["admin-email-deliveries", user?.id], queryFn: listAdminEmailDeliveries, enabled: canLoadAdminEmailData });
  const engagementQuery = useQuery({ queryKey: ["admin-email-engagement", user?.id], queryFn: listAdminEmailEngagementSummary, enabled: canLoadAdminEmailData });
  const campaignsQuery = useQuery({ queryKey: ["admin-email-campaigns", user?.id], queryFn: listAdminEmailCampaigns, enabled: canLoadAdminEmailData });
  const triggerRulesQuery = useQuery({ queryKey: ["admin-email-trigger-rules", user?.id], queryFn: listAdminEmailTriggerRules, enabled: canLoadAdminEmailData });
  const schedulesQuery = useQuery({ queryKey: ["admin-email-schedules", user?.id], queryFn: listAdminEmailSchedules, enabled: canLoadAdminEmailData });
  const brandQuery = useQuery({ queryKey: ["admin-email-brand", user?.id], queryFn: getAdminEmailBrandSettings, enabled: canLoadAdminEmailData });
  const companiesQuery = useQuery({ queryKey: ["admin-email-companies", user?.id], queryFn: listCompanies, enabled: canLoadAdminEmailData });

  const templates = useMemo(() => templatesQuery.data ?? [], [templatesQuery.data]);
  const deliveries = deliveriesQuery.data ?? [];
  const engagement = engagementQuery.data ?? [];
  const campaigns = campaignsQuery.data ?? [];
  const schedules = schedulesQuery.data ?? [];
  const triggerRules = triggerRulesQuery.data ?? [];
  const companies = companiesQuery.data ?? [];

  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [draft, setDraft] = useState<AdminEmailTemplateRecord | null>(null);
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [customRecipients, setCustomRecipients] = useState("");
  const [testRecipientEmail, setTestRecipientEmail] = useState(user?.email ?? "bums@trustedbums.com");
  const [previewRecipients, setPreviewRecipients] = useState<AdminEmailPreviewRecipient[]>([]);
  const [previewCount, setPreviewCount] = useState(0);
  const [suppressedCount, setSuppressedCount] = useState(0);
  const [brandDraft, setBrandDraft] = useState<AdminEmailBrandSettingsInput>(defaultBrand);
  const [imageUrl, setImageUrl] = useState("");
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState({ name: "", template_id: "", cron_expression: "0 9 * * 1", recipient_group: "ALL_BUMS" as AdminEmailRecipientGroup, recipient_emails: "", metadata: "{}", category: "admin_announcements" as AdminEmailCategory, next_run_at: "", is_active: true });
  const [triggerRuleId, setTriggerRuleId] = useState<string | null>(null);
  const [triggerForm, setTriggerForm] = useState({ name: "", trigger_event: "CLIENT_CREATED" as TriggerRuleEvent, template_id: "", delay_minutes: 0, conditions: "{}", is_active: true });

  const selectedTemplate = useMemo(() => {
    if (selectedTemplateId === "new-template") return undefined;
    return selectedTemplateId ? templates.find((template) => template.id === selectedTemplateId) : templates[0];
  }, [selectedTemplateId, templates]);

  const startNewTemplate = () => {
    setSelectedTemplateId("new-template");
    setDraft(createBlankTemplate());
    setMetadata({ headline: "", recipient_name: "", message: "" });
    setCustomRecipients("");
    setPreviewRecipients([]);
    setPreviewCount(0);
    setSuppressedCount(0);
  };

  useEffect(() => {
    if (!selectedTemplate) return;
    setSelectedTemplateId(selectedTemplate.id);
    setDraft(cloneTemplate(selectedTemplate));
    setMetadata(Object.fromEntries(selectedTemplate.metadata_fields.map((field) => [field, field === "message" ? "Add your message here." : ""])));
    setCustomRecipients("");
    setPreviewRecipients([]);
    setPreviewCount(0);
    setSuppressedCount(0);
  }, [selectedTemplate]);

  useEffect(() => {
    if (templatesQuery.isSuccess && templates.length === 0 && !draft) startNewTemplate();
  }, [draft, templates.length, templatesQuery.isSuccess]);

  useEffect(() => {
    if (brandQuery.data) {
      setBrandDraft({
        sender_name: brandQuery.data.sender_name,
        logo_url: brandQuery.data.logo_url,
        accent_color: brandQuery.data.accent_color,
        footer_text: brandQuery.data.footer_text,
        physical_address: brandQuery.data.physical_address ?? "",
      });
    }
  }, [brandQuery.data]);

  const updateDraft = <Key extends keyof AdminEmailTemplateRecord>(key: Key, value: AdminEmailTemplateRecord[Key]) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  const insertBodySnippet = (snippet: string) => {
    setDraft((current) => current ? { ...current, body: current.body.trimEnd() + "\n\n" + snippet } : current);
  };

  const livePreview = useMemo(() => {
    if (!draft) return null;
    const customPreviewEmail = draft.recipient_group === "CUSTOM" ? parseRecipients(customRecipients)[0] : "";
    const recipient = resolvePreviewRecipient(previewRecipients, customPreviewEmail || testRecipientEmail);
    const previewMetadata = {
      ...metadata,
      recipient_email: recipient.email,
      recipient_name: metadata.recipient_name || recipient.name,
      client_name: metadata.client_name || recipient.name,
      bum_name: metadata.bum_name || recipient.name,
    };
    return { body: renderTemplateText(draft.body, previewMetadata), subject: renderTemplateText(draft.subject, previewMetadata), to: recipient.email };
  }, [customRecipients, draft, metadata, previewRecipients, testRecipientEmail]);

  const saveTemplateMutation = useMutation({
    mutationFn: () => {
      if (!user || !draft) throw new Error("Choose a template first.");
      return draft.id === "new-template" ? createAdminEmailTemplate(user, draft) : saveAdminEmailTemplate(user, draft);
    },
    onSuccess: async (savedTemplate) => {
      setSelectedTemplateId(savedTemplate.id);
      setDraft(cloneTemplate(savedTemplate));
      await queryClient.invalidateQueries({ queryKey: ["admin-email-templates", user?.id] });
      toast({ title: "Email saved", description: "Template, audience defaults, and trigger setup were saved." });
    },
    onError: (error) => toast({ title: "Unable to save email", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" }),
  });

  const validateSavedTemplate = () => {
    if (!draft) return "Choose an email first.";
    if (draft.id === "new-template") return "Save this email before previewing, testing, or sending it.";
    return null;
  };

  const validateAudience = () => {
    const saved = validateSavedTemplate();
    if (saved) return saved;
    if (!draft) return "Choose an email first.";
    if (draft.recipient_group === "CUSTOM" && parseRecipients(customRecipients).length === 0) return "Add at least one custom recipient.";
    if (draft.recipient_group === "CLIENT_COMPANY" && !metadata.company_id?.trim()) return "Choose a client company.";
    if (draft.recipient_group === "BUM_INDUSTRY_MATCH" && !metadata.industry?.trim()) return "Enter an industry.";
    return null;
  };

  const buildSendInput = (mode: "manual" | "preview" | "test") => {
    if (!draft) throw new Error("Choose an email first.");
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
      toast({ title: "Audience ready", description: (result.count ?? 0) + " sendable recipients" + (result.suppressed ? ", " + result.suppressed + " suppressed" : "") + "." });
    },
    onError: (error) => toast({ title: "Unable to preview audience", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" }),
  });

  const sendMutation = useMutation({
    mutationFn: (mode: "manual" | "test") => sendAdminEmail(buildSendInput(mode)),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-email-deliveries", user?.id] }),
        queryClient.invalidateQueries({ queryKey: ["admin-email-campaigns", user?.id] }),
        queryClient.invalidateQueries({ queryKey: ["admin-email-engagement", user?.id] }),
      ]);
      toast({ title: result.mode === "test" ? "Test email sent" : "Campaign sent", description: result.sent + " sent" + (result.failed ? ", " + result.failed + " failed" : "") + (result.suppressed ? ", " + result.suppressed + " suppressed" : "") + "." });
    },
    onError: (error) => toast({ title: "Unable to send email", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" }),
  });

  const saveBrandMutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error("Sign in first.");
      return saveAdminEmailBrandSettings(user, brandDraft);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-email-brand", user?.id] });
      toast({ title: "Branding saved", description: "Future sends will use the updated email wrapper." });
    },
    onError: (error) => toast({ title: "Unable to save branding", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" }),
  });

  const saveScheduleMutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error("Sign in first.");
      const input: AdminEmailScheduleInput = {
        name: scheduleForm.name.trim(),
        template_id: scheduleForm.template_id,
        is_active: scheduleForm.is_active,
        cron_expression: scheduleForm.cron_expression.trim(),
        recipient_group: scheduleForm.recipient_group,
        recipient_emails: parseRecipients(scheduleForm.recipient_emails),
        metadata: parseJsonObject(scheduleForm.metadata),
        category: scheduleForm.category,
        next_run_at: scheduleForm.next_run_at ? new Date(scheduleForm.next_run_at).toISOString() : null,
      };
      if (!input.name || !input.template_id) throw new Error("Add a schedule name and choose an email.");
      return scheduleId ? updateAdminEmailSchedule(user, scheduleId, input) : createAdminEmailSchedule(user, input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-email-schedules", user?.id] });
      setScheduleId(null);
      setScheduleForm((current) => ({ ...current, name: "", recipient_emails: "", metadata: "{}", next_run_at: "" }));
      toast({ title: "Recurring email saved", description: "The cron definition is now in Admin Emails." });
    },
    onError: (error) => toast({ title: "Unable to save recurring email", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" }),
  });

  const saveTriggerMutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error("Sign in first.");
      const input: AdminEmailTriggerRuleInput = {
        name: triggerForm.name.trim(),
        trigger_event: triggerForm.trigger_event,
        template_id: triggerForm.template_id,
        is_active: triggerForm.is_active,
        delay_minutes: Number(triggerForm.delay_minutes) || 0,
        conditions: parseJsonObject(triggerForm.conditions),
      };
      if (!input.name || !input.template_id) throw new Error("Add a trigger name and choose an email.");
      return triggerRuleId ? updateAdminEmailTriggerRule(user, triggerRuleId, input) : createAdminEmailTriggerRule(user, input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-email-trigger-rules", user?.id] });
      setTriggerRuleId(null);
      setTriggerForm((current) => ({ ...current, name: "", conditions: "{}", delay_minutes: 0 }));
      toast({ title: "Trigger saved", description: "The event-driven email rule is now configured." });
    },
    onError: (error) => toast({ title: "Unable to save trigger", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" }),
  });

  const handlePreviewAudience = () => {
    const validation = validateAudience();
    if (validation) {
      toast({ title: "Audience needs details", description: validation, variant: "destructive" });
      return;
    }
    previewMutation.mutate();
  };

  const handleSendTest = () => {
    const validation = validateSavedTemplate();
    if (validation) {
      toast({ title: "Save first", description: validation, variant: "destructive" });
      return;
    }
    sendMutation.mutate("test");
  };

  const handleSendManual = () => {
    const validation = validateAudience();
    if (validation) {
      toast({ title: "Audience needs details", description: validation, variant: "destructive" });
      return;
    }
    sendMutation.mutate("manual");
  };

  const editSchedule = (schedule: AdminEmailScheduleRecord) => {
    setScheduleId(schedule.id);
    setScheduleForm({
      name: schedule.name,
      template_id: schedule.template_id,
      cron_expression: schedule.cron_expression,
      recipient_group: schedule.recipient_group,
      recipient_emails: schedule.recipient_emails.join(", "),
      metadata: JSON.stringify(schedule.metadata, null, 2),
      category: schedule.category,
      next_run_at: schedule.next_run_at ? schedule.next_run_at.slice(0, 16) : "",
      is_active: schedule.is_active,
    });
  };

  const editTriggerRule = (rule: AdminEmailTriggerRuleRecord) => {
    setTriggerRuleId(rule.id);
    setTriggerForm({
      name: rule.name,
      trigger_event: rule.trigger_event,
      template_id: rule.template_id,
      delay_minutes: rule.delay_minutes,
      conditions: JSON.stringify(rule.conditions, null, 2),
      is_active: rule.is_active,
    });
  };

  const totalOpens = deliveries.filter((delivery) => delivery.opened_at).length;
  const totalClicks = deliveries.filter((delivery) => delivery.clicked_at).length;
  const sentCampaigns = campaigns.filter((campaign) => campaign.status === "SENT").length;
  const activeAutomations = schedules.filter((schedule) => schedule.is_active).length + triggerRules.filter((rule) => rule.is_active).length;

  return (
    <div>
      <PageHeader title="Emails" description="Send campaigns, manage recurring emails, configure triggers, and control email branding.">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={startNewTemplate}><Plus className="mr-2 h-4 w-4" />New Email</Button>
          <Button onClick={handleSendManual} disabled={sendMutation.isPending || !draft}><Send className="mr-2 h-4 w-4" />Send</Button>
        </div>
      </PageHeader>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Campaigns sent</p><p className="text-2xl font-semibold">{sentCampaigns}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Sendable preview</p><p className="text-2xl font-semibold">{previewCount}</p><p className="text-xs text-muted-foreground">{suppressedCount} suppressed</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Automations active</p><p className="text-2xl font-semibold">{activeAutomations}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Tracked engagement</p><p className="text-2xl font-semibold">{totalOpens}/{totalClicks}</p><p className="text-xs text-muted-foreground">opens / clicks</p></CardContent></Card>
      </div>

      <Tabs defaultValue="send" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="send"><Megaphone className="mr-2 h-4 w-4" />Send</TabsTrigger>
          <TabsTrigger value="automations"><Workflow className="mr-2 h-4 w-4" />Automations</TabsTrigger>
          <TabsTrigger value="brand"><Sparkles className="mr-2 h-4 w-4" />Brand & Assets</TabsTrigger>
          <TabsTrigger value="results"><MousePointerClick className="mr-2 h-4 w-4" />Results</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 font-display"><Mail className="h-5 w-5" />Emails</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {templatesQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading emails...</p> : null}
                {draft?.id === "new-template" ? <button type="button" className="w-full rounded-md border border-primary bg-primary/5 p-3 text-left text-sm"><span className="font-medium">New email</span><p className="mt-1 text-xs text-muted-foreground">Unsaved draft</p></button> : null}
                {templates.map((template) => (
                  <button key={template.id} type="button" onClick={() => setSelectedTemplateId(template.id)} className={"w-full rounded-md border p-3 text-left text-sm transition hover:border-primary " + (template.id === selectedTemplateId ? "border-primary bg-primary/5" : "border-border")}>
                    <div className="flex items-start justify-between gap-2"><span className="font-medium">{template.name}</span><Badge variant={template.is_active ? "default" : "secondary"}>{template.is_active ? "Active" : "Off"}</Badge></div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{template.description || "No description"}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{categories.find((item) => item.value === template.category)?.label ?? template.category}</p>
                  </button>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="font-display">Campaign setup</CardTitle></CardHeader>
                <CardContent className="space-y-5">
                  {!draft ? <p className="text-sm text-muted-foreground">Choose or create an email to start.</p> : (
                    <>
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="space-y-2"><FieldLabel label="Name" help="Internal name for this email. Use something you can recognize in campaign history, schedules, and trigger rules." /><Input value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} /></div>
                        <div className="space-y-2"><FieldLabel label="Audience" help="Who should receive this send. Custom recipients uses the email list below; client company and industry audiences use metadata to resolve recipients." /><Select value={draft.recipient_group} onValueChange={(value) => updateDraft("recipient_group", value as AdminEmailRecipientGroup)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{recipientGroups.map((group) => <SelectItem key={group.value} value={group.value}>{group.label}</SelectItem>)}</SelectContent></Select></div>
                      </div>
                      <div className="grid gap-4 lg:grid-cols-3">
                        <div className="space-y-2"><FieldLabel label="Category" help="Used for reporting, preference checks, and suppression rules. Transactional emails bypass marketing opt-outs." /><Select value={draft.category} onValueChange={(value) => updateDraft("category", value as AdminEmailCategory)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map((category) => <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>)}</SelectContent></Select></div>
                        <div className="space-y-2"><FieldLabel label="Trigger default" help="The event this email is designed for. Manual-only emails are sent by an admin from this page." /><Select value={draft.trigger_event ?? "MANUAL"} onValueChange={(value) => updateDraft("trigger_event", value as AdminEmailTriggerEvent)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="MANUAL">Manual only</SelectItem>{triggerEvents.map((trigger) => <SelectItem key={trigger.value} value={trigger.value}>{trigger.label}</SelectItem>)}</SelectContent></Select></div>
                        <div className="flex items-center justify-between rounded-md border px-3 py-2"><Label>Active</Label><Switch checked={draft.is_active} onCheckedChange={(checked) => updateDraft("is_active", checked)} /></div>
                      </div>
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="space-y-2"><FieldLabel label="Reply-to" help="Replies from recipients should go here. Use bums@trustedbums.com unless a specific owner should receive responses." /><Input value={draft.reply_to ?? ""} onChange={(event) => updateDraft("reply_to", event.target.value)} placeholder="bums@trustedbums.com" /></div>
                        <div className="space-y-2"><FieldLabel label="Test recipient" help="Where Send Test goes. This does not change the real audience for Send Now." /><Input value={testRecipientEmail} onChange={(event) => setTestRecipientEmail(event.target.value)} /></div>
                      </div>
                      {draft.recipient_group === "CLIENT_COMPANY" ? <div className="space-y-2"><FieldLabel label="Client company" help="Required for Client company audiences. The send function finds client users attached to this company." /><Select value={metadata.company_id ?? ""} onValueChange={(value) => { const company = companies.find((item) => item.id === value); setMetadata((current) => ({ ...current, company_id: value, client_name: current.client_name || company?.name || "" })); }}><SelectTrigger><SelectValue placeholder="Choose a client company" /></SelectTrigger><SelectContent>{companies.map((company) => <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>)}</SelectContent></Select></div> : null}
                      {draft.recipient_group === "CUSTOM" ? <div className="space-y-2"><FieldLabel label="Custom recipients" help="Paste email addresses separated by commas, semicolons, or new lines." /><Textarea rows={3} value={customRecipients} onChange={(event) => setCustomRecipients(event.target.value)} placeholder="one@example.com, two@example.com" /></div> : null}
                      <div className="space-y-2"><FieldLabel label="Subject" help="Subject line. You can use merge fields like {{recipient_name}} or {{client_name}}." /><Input value={draft.subject} onChange={(event) => updateDraft("subject", event.target.value)} /></div>
                      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2"><FieldLabel label="Body" help="Plain text body with merge fields. Put image markdown on its own line, for example ![Alt text](https://example.com/image.png)." /><div className="flex gap-2"><Button type="button" variant="outline" size="sm" onClick={() => insertBodySnippet("![Trusted Bums logo](" + brandDraft.logo_url + ")")}><Image className="mr-2 h-4 w-4" />Logo</Button><Button type="button" variant="outline" size="sm" onClick={() => imageUrl ? insertBodySnippet("![Email image](" + imageUrl + ")") : toast({ title: "Add image URL", description: "Paste an image URL in Brand & Assets first.", variant: "destructive" })}><Image className="mr-2 h-4 w-4" />Image</Button></div></div>
                          <Textarea rows={16} value={draft.body} onChange={(event) => updateDraft("body", event.target.value)} />
                        </div>
                        <div className="space-y-2"><div className="flex items-center justify-between gap-2"><Label>Preview</Label><Badge variant="secondary" className="max-w-[220px] truncate">To {livePreview?.to}</Badge></div><div className="overflow-hidden rounded-md border bg-white"><div className="border-b bg-muted/40 px-4 py-3"><p className="truncate text-xs text-muted-foreground">{livePreview?.to}</p><p className="mt-1 truncate font-medium text-slate-950">{livePreview?.subject || "(No subject)"}</p></div><div className="max-h-[520px] overflow-auto" dangerouslySetInnerHTML={{ __html: renderPreviewHtml(livePreview?.body || "", brandDraft) }} /></div></div>
                      </div>
                      <div className="space-y-2"><FieldLabel label="Merge fields" help="Comma-separated placeholders this email expects. These become editable fields below and can be used as {{field_name}} in subject/body." /><Input value={draft.metadata_fields.join(", ")} onChange={(event) => updateDraft("metadata_fields", event.target.value.split(",").map((field) => field.trim()).filter(Boolean))} /></div>
                      {draft.metadata_fields.length ? <div className="grid gap-3 md:grid-cols-2">{draft.metadata_fields.map((field) => <div key={field} className="space-y-2"><Label>{field}</Label><Input value={metadata[field] ?? ""} onChange={(event) => setMetadata((current) => ({ ...current, [field]: event.target.value }))} /></div>)}</div> : null}
                      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => saveTemplateMutation.mutate()} disabled={saveTemplateMutation.isPending}><Save className="mr-2 h-4 w-4" />Save Email</Button><Button variant="outline" onClick={handleSendTest} disabled={sendMutation.isPending}><ShieldAlert className="mr-2 h-4 w-4" />Send Test</Button></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={handlePreviewAudience} disabled={previewMutation.isPending}><Eye className="mr-2 h-4 w-4" />Preview Audience</Button><Button onClick={handleSendManual} disabled={sendMutation.isPending}><Send className="mr-2 h-4 w-4" />Send Now</Button></div></div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="font-display">Audience preview</CardTitle></CardHeader>
                <CardContent><div className="max-h-72 overflow-auto rounded-md border"><Table><TableHeader><TableRow><TableHead>Recipient</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{previewRecipients.map((recipient) => <TableRow key={recipient.email}><TableCell>{recipient.name ? recipient.name + " · " + recipient.email : recipient.email}</TableCell><TableCell><Badge variant={recipient.suppressed ? "destructive" : "default"}>{recipient.suppressed ? recipient.suppressionReason ?? "Suppressed" : "Sendable"}</Badge></TableCell></TableRow>)}{!previewRecipients.length ? <TableRow><TableCell colSpan={2} className="text-sm text-muted-foreground">Preview an audience before sending.</TableCell></TableRow> : null}</TableBody></Table></div></CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="automations" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 font-display"><CalendarClock className="h-5 w-5" />Recurring emails</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><FieldLabel label="Name" help="Internal name for this recurring email, such as Weekly Bum digest or Monthly client summary." /><Input value={scheduleForm.name} onChange={(event) => setScheduleForm((current) => ({ ...current, name: event.target.value }))} placeholder="Weekly Bum digest" /></div><div className="space-y-2"><FieldLabel label="Email" help="The saved email template this recurring schedule will send." /><Select value={scheduleForm.template_id} onValueChange={(value) => setScheduleForm((current) => ({ ...current, template_id: value }))}><SelectTrigger><SelectValue placeholder="Choose email" /></SelectTrigger><SelectContent>{templates.map((template) => <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>)}</SelectContent></Select></div></div>
                <div className="grid gap-4 md:grid-cols-3"><div className="space-y-2"><FieldLabel label="Cron" help="Five-field schedule: minute hour day-of-month month day-of-week. Examples: 0 9 * * 1 is Mondays at 9:00; 0 9 * * * is daily at 9:00; 0 9 1 * * is monthly on the 1st." /><Input value={scheduleForm.cron_expression} onChange={(event) => setScheduleForm((current) => ({ ...current, cron_expression: event.target.value }))} /><p className="text-xs leading-5 text-muted-foreground">Format is minute hour day month weekday. Use <span className="font-mono">0 9 * * 1</span> for Mondays at 9:00, <span className="font-mono">0 9 * * *</span> for daily at 9:00.</p></div><div className="space-y-2"><FieldLabel label="Audience" help="Who this recurring email goes to each time it runs. Custom uses the recipient list; client/industry audiences need matching metadata JSON." /><Select value={scheduleForm.recipient_group} onValueChange={(value) => setScheduleForm((current) => ({ ...current, recipient_group: value as AdminEmailRecipientGroup }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{recipientGroups.map((group) => <SelectItem key={group.value} value={group.value}>{group.label}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><FieldLabel label="Next run" help="Optional planning date/time for the next expected send. Cron still controls the actual cadence." /><Input type="datetime-local" value={scheduleForm.next_run_at} onChange={(event) => setScheduleForm((current) => ({ ...current, next_run_at: event.target.value }))} /></div></div>
                {scheduleForm.recipient_group === "CUSTOM" ? <div className="space-y-2"><FieldLabel label="Custom recipients" help="Only used when the schedule audience is Custom recipients. Separate emails with commas, semicolons, or new lines." /><Textarea rows={2} value={scheduleForm.recipient_emails} onChange={(event) => setScheduleForm((current) => ({ ...current, recipient_emails: event.target.value }))} /></div> : null}
                <div className="space-y-2"><FieldLabel label="Metadata JSON" help="Values passed into merge fields and audience filters. Example keys include industry, client_name, and headline." /><Textarea rows={4} value={scheduleForm.metadata} onChange={(event) => setScheduleForm((current) => ({ ...current, metadata: event.target.value }))} /><p className="text-xs leading-5 text-muted-foreground">Use JSON keys that match merge fields or audience filters, such as <span className="font-mono">{'{"industry":"Healthcare"}'}</span>.</p></div>
                <div className="flex items-center justify-between rounded-md border px-3 py-2"><Label>Active</Label><Switch checked={scheduleForm.is_active} onCheckedChange={(checked) => setScheduleForm((current) => ({ ...current, is_active: checked }))} /></div>
                <Button onClick={() => saveScheduleMutation.mutate()} disabled={saveScheduleMutation.isPending}><Save className="mr-2 h-4 w-4" />{scheduleId ? "Update Recurring Email" : "Create Recurring Email"}</Button>
                <div className="rounded-md border"><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Schedule</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{schedules.map((schedule) => <TableRow key={schedule.id} className="cursor-pointer" onClick={() => editSchedule(schedule)}><TableCell><p className="font-medium">{schedule.name}</p><p className="text-xs text-muted-foreground">{schedule.admin_email_templates?.name}</p></TableCell><TableCell>{summarizeCron(schedule.cron_expression)}</TableCell><TableCell><Badge variant={schedule.is_active ? "default" : "secondary"}>{schedule.is_active ? "Active" : "Off"}</Badge></TableCell></TableRow>)}{!schedules.length ? <TableRow><TableCell colSpan={3} className="text-sm text-muted-foreground">No recurring emails yet.</TableCell></TableRow> : null}</TableBody></Table></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 font-display"><Workflow className="h-5 w-5" />Triggered emails</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><FieldLabel label="Name" help="Internal name for this trigger rule, such as New claim client alert." /><Input value={triggerForm.name} onChange={(event) => setTriggerForm((current) => ({ ...current, name: event.target.value }))} placeholder="New claim client alert" /></div><div className="space-y-2"><FieldLabel label="Event" help="The portal event that should cause this email rule to run, such as a new claim or client target." /><Select value={triggerForm.trigger_event} onValueChange={(value) => setTriggerForm((current) => ({ ...current, trigger_event: value as TriggerRuleEvent }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{triggerEvents.map((event) => <SelectItem key={event.value} value={event.value}>{event.label}</SelectItem>)}</SelectContent></Select></div></div>
                <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><FieldLabel label="Email" help="The saved email template sent when this trigger fires." /><Select value={triggerForm.template_id} onValueChange={(value) => setTriggerForm((current) => ({ ...current, template_id: value }))}><SelectTrigger><SelectValue placeholder="Choose email" /></SelectTrigger><SelectContent>{templates.map((template) => <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><FieldLabel label="Delay minutes" help="Wait this many minutes after the event before sending. Use 0 for immediate sends." /><Input type="number" min={0} value={triggerForm.delay_minutes} onChange={(event) => setTriggerForm((current) => ({ ...current, delay_minutes: Number(event.target.value) }))} /></div></div>
                <div className="space-y-2"><FieldLabel label="Conditions JSON" help="Optional filters for this trigger, stored as JSON for future automation logic. Use an empty JSON object when no extra conditions are needed." /><Textarea rows={4} value={triggerForm.conditions} onChange={(event) => setTriggerForm((current) => ({ ...current, conditions: event.target.value }))} /><p className="text-xs leading-5 text-muted-foreground">Use <span className="font-mono">{'{}'}</span> unless this trigger needs a future filter, such as company type or claim status.</p></div>
                <div className="flex items-center justify-between rounded-md border px-3 py-2"><Label>Active</Label><Switch checked={triggerForm.is_active} onCheckedChange={(checked) => setTriggerForm((current) => ({ ...current, is_active: checked }))} /></div>
                <Button onClick={() => saveTriggerMutation.mutate()} disabled={saveTriggerMutation.isPending}><Save className="mr-2 h-4 w-4" />{triggerRuleId ? "Update Trigger" : "Create Trigger"}</Button>
                <div className="rounded-md border"><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Event</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{triggerRules.map((rule) => <TableRow key={rule.id} className="cursor-pointer" onClick={() => editTriggerRule(rule)}><TableCell><p className="font-medium">{rule.name}</p><p className="text-xs text-muted-foreground">{rule.admin_email_templates?.name}</p></TableCell><TableCell>{triggerEvents.find((event) => event.value === rule.trigger_event)?.label ?? rule.trigger_event}</TableCell><TableCell><Badge variant={rule.is_active ? "default" : "secondary"}>{rule.is_active ? "Active" : "Off"}</Badge></TableCell></TableRow>)}{!triggerRules.length ? <TableRow><TableCell colSpan={3} className="text-sm text-muted-foreground">No trigger rules yet.</TableCell></TableRow> : null}</TableBody></Table></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="brand" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
            <Card><CardHeader><CardTitle className="font-display">Brand settings</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><FieldLabel label="Sender name" help="Brand name shown in the email wrapper and alt text. The actual mailbox still sends through the configured Microsoft sender." /><Input value={brandDraft.sender_name} onChange={(event) => setBrandDraft((current) => ({ ...current, sender_name: event.target.value }))} /></div><div className="space-y-2"><FieldLabel label="Accent color" help="The color used for the email wrapper accent bar and preview links." /><Input type="color" value={brandDraft.accent_color} onChange={(event) => setBrandDraft((current) => ({ ...current, accent_color: event.target.value }))} /></div></div><div className="space-y-2"><FieldLabel label="Logo URL" help="Public image URL for the logo in the email header. SVG/PNG/JPG URLs are fine if email clients can load them." /><Input value={brandDraft.logo_url} onChange={(event) => setBrandDraft((current) => ({ ...current, logo_url: event.target.value }))} /></div><div className="space-y-2"><FieldLabel label="Reusable image URL" help="Paste a public image URL, then use Insert Image to place it into the email body." /><Input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." /></div><div className="space-y-2"><FieldLabel label="Footer text" help="Small print shown at the bottom of every branded email." /><Textarea rows={3} value={brandDraft.footer_text} onChange={(event) => setBrandDraft((current) => ({ ...current, footer_text: event.target.value }))} /></div><div className="space-y-2"><FieldLabel label="Physical address" help="Optional compliance footer address for marketing or announcement emails." /><Input value={brandDraft.physical_address ?? ""} onChange={(event) => setBrandDraft((current) => ({ ...current, physical_address: event.target.value }))} /></div><div className="flex flex-wrap gap-2"><Button onClick={() => saveBrandMutation.mutate()} disabled={saveBrandMutation.isPending}><Save className="mr-2 h-4 w-4" />Save Branding</Button><Button variant="outline" onClick={() => insertBodySnippet("![Trusted Bums logo](" + brandDraft.logo_url + ")")} disabled={!draft}><Image className="mr-2 h-4 w-4" />Insert Logo</Button><Button variant="outline" onClick={() => imageUrl && insertBodySnippet("![Email image](" + imageUrl + ")")} disabled={!draft || !imageUrl}><Image className="mr-2 h-4 w-4" />Insert Image</Button></div></CardContent></Card>
            <Card><CardHeader><CardTitle className="font-display">Email wrapper preview</CardTitle></CardHeader><CardContent><div className="overflow-hidden rounded-md border bg-white" dangerouslySetInnerHTML={{ __html: renderPreviewHtml(livePreview?.body || "Hi {{recipient_name}},\n\nYour branded email preview will appear here.", brandDraft) }} /></CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-2">
            <Card><CardHeader><CardTitle className="font-display">Campaigns</CardTitle></CardHeader><CardContent><div className="max-h-80 overflow-auto rounded-md border"><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead>Recipients</TableHead><TableHead>Sent</TableHead></TableRow></TableHeader><TableBody>{campaigns.map((campaign) => <TableRow key={campaign.id}><TableCell><p className="font-medium">{campaign.name}</p><p className="text-xs text-muted-foreground">{campaign.template_slug}</p></TableCell><TableCell><Badge variant={campaign.status === "SENT" ? "default" : campaign.status === "FAILED" ? "destructive" : "secondary"}>{campaign.status}</Badge></TableCell><TableCell>{campaign.recipient_count}</TableCell><TableCell>{campaign.sent_at ? formatDateTimeForTimeZone(campaign.sent_at, timeZone) : "-"}</TableCell></TableRow>)}{!campaigns.length ? <TableRow><TableCell colSpan={4} className="text-sm text-muted-foreground">No campaigns yet.</TableCell></TableRow> : null}</TableBody></Table></div></CardContent></Card>
            <Card><CardHeader><CardTitle className="flex items-center gap-2 font-display"><MousePointerClick className="h-5 w-5" />Most engaged</CardTitle></CardHeader><CardContent><div className="max-h-80 overflow-auto rounded-md border"><Table><TableHeader><TableRow><TableHead>Person</TableHead><TableHead>Role</TableHead><TableHead>Score</TableHead><TableHead>Last</TableHead></TableRow></TableHeader><TableBody>{engagement.slice(0, 10).map((row) => <TableRow key={row.recipient_email}><TableCell><p>{row.full_name ?? row.recipient_email}</p><p className="text-xs text-muted-foreground">{row.company_name ?? row.recipient_email}</p></TableCell><TableCell>{row.role ?? "-"}</TableCell><TableCell>{row.engagement_score}</TableCell><TableCell>{row.last_engaged_at ? formatDateTimeForTimeZone(row.last_engaged_at, timeZone) : "-"}</TableCell></TableRow>)}{!engagement.length ? <TableRow><TableCell colSpan={4} className="text-sm text-muted-foreground">No tracked engagement yet.</TableCell></TableRow> : null}</TableBody></Table></div></CardContent></Card>
          </div>
          <Card><CardHeader><CardTitle className="font-display">Recent deliveries</CardTitle></CardHeader><CardContent><div className="overflow-auto rounded-md border"><Table><TableHeader><TableRow><TableHead>Recipient</TableHead><TableHead>Email</TableHead><TableHead>Status</TableHead><TableHead>Engagement</TableHead><TableHead>Created</TableHead></TableRow></TableHeader><TableBody>{deliveries.map((delivery) => <TableRow key={delivery.id}><TableCell>{delivery.recipient_email}</TableCell><TableCell>{delivery.template_slug ?? "Custom"}{delivery.is_test ? <Badge className="ml-2" variant="secondary">Test</Badge> : null}</TableCell><TableCell><Badge variant={delivery.status === "SENT" ? "default" : delivery.status === "FAILED" ? "destructive" : "secondary"}>{delivery.status}</Badge></TableCell><TableCell><div className="flex gap-2 text-xs"><span className={delivery.opened_at ? "text-foreground" : "text-muted-foreground"}>open</span><span className={delivery.clicked_at ? "text-foreground" : "text-muted-foreground"}>click</span><span>{delivery.engagement_score}</span></div></TableCell><TableCell>{formatDateTimeForTimeZone(delivery.created_at, timeZone)}</TableCell></TableRow>)}{!deliveriesQuery.isLoading && !deliveries.length ? <TableRow><TableCell colSpan={5} className="text-sm text-muted-foreground">No email deliveries have been logged yet.</TableCell></TableRow> : null}</TableBody></Table></div></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
