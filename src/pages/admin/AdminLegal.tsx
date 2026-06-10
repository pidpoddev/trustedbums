import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ExternalLink, FileSignature, GitCompareArrows, Plus, Save } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { legalDocuments, footerLegalLinks, type LegalSection } from "@/data/legalDocuments";
import { ACTIVE_TERMS_CHANGE_SUMMARY, PARTNER_FAQ_BODY, PARTNER_TERMS_BODY } from "@/data/partnerTerms";
import { useToast } from "@/hooks/use-toast";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import {
  createTermsAssignment,
  createTermsVersion,
  listCompanies,
  listLegalDocuments,
  listProfiles,
  listTermsAssignments,
  listTermsVersions,
  publishLegalDocument,
  saveLegalDocumentDraft,
  type LegalDocumentRecord,
  type TermsVersion,
} from "@/lib/portalApi";
import { formatDateForTimeZone, formatDateTimeForTimeZone } from "@/lib/timezone";

function toDateInput(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

function stringifySections(sections: LegalSection[]) {
  return JSON.stringify(sections, null, 2);
}

function combineLegalText(input: { title: string; description: string; sections: LegalSection[] }) {
  return [input.title, input.description, ...input.sections.flatMap((section) => [section.title, ...section.body])].join("\n\n");
}

function normalizeTokens(value: string) {
  return value.split(/(\s+)/).filter(Boolean);
}

function TrackedText({ before, after }: { before: string; after: string }) {
  const beforeTokens = normalizeTokens(before);
  const afterTokens = normalizeTokens(after);
  const removed = new Set(beforeTokens.filter((token) => token.trim() && !afterTokens.includes(token)));
  const added = new Set(afterTokens.filter((token) => token.trim() && !beforeTokens.includes(token)));

  return (
    <div className="max-h-[360px] overflow-auto rounded-md border bg-muted/20 p-4 text-sm leading-7">
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge variant="outline">Added: {added.size}</Badge>
        <Badge variant="outline">Removed: {removed.size}</Badge>
      </div>
      <div className="whitespace-pre-wrap">
        {afterTokens.map((token, index) => {
          if (!token.trim()) return token;
          return <span key={token + "-" + index} className={added.has(token) ? "rounded bg-success/20 px-1 text-success" : undefined}>{token}</span>;
        })}
      </div>
      {removed.size ? (
        <div className="mt-4 border-t pt-3 text-muted-foreground">
          <p className="mb-2 font-medium text-foreground">Removed text</p>
          <div className="flex flex-wrap gap-2">
            {Array.from(removed).slice(0, 80).map((token) => <span key={token} className="rounded bg-destructive/10 px-1 line-through">{token}</span>)}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getDocumentSeed(slug: string, published: LegalDocumentRecord | undefined) {
  const fallback = legalDocuments.find((document) => document.slug === slug);
  const effectiveDate = published?.draft_effective_date ?? published?.effective_date ?? (fallback ? toDateInput(fallback.effectiveDate) : new Date().toISOString().slice(0, 10));
  return {
    slug,
    title: published?.draft_title ?? published?.title ?? fallback?.title ?? "New Legal Page",
    description: published?.draft_description ?? published?.description ?? fallback?.description ?? "",
    effective_date: effectiveDate,
    sections: published?.draft_sections ?? published?.sections ?? fallback?.sections ?? [],
    change_summary: published?.change_summary ?? "",
  };
}

function PreviewCard({ title, description, sections }: { title: string; description: string; sections: LegalSection[] }) {
  return (
    <div className="max-h-[520px] overflow-auto rounded-md border bg-card p-5">
      <p className="text-xs font-medium uppercase text-primary">Live preview</p>
      <h2 className="mt-2 font-display text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      <div className="mt-6 space-y-5">
        {sections.map((section) => (
          <section key={section.title} className="space-y-2">
            <h3 className="font-display text-lg font-semibold">{section.title}</h3>
            {section.body.map((paragraph) => <p key={paragraph} className="text-sm leading-6 text-muted-foreground">{paragraph}</p>)}
          </section>
        ))}
      </div>
    </div>
  );
}

export default function AdminLegal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const timeZone = useUserTimeZone();
  const queryClient = useQueryClient();
  const termsQuery = useQuery({ queryKey: ["admin-legal-terms"], queryFn: listTermsVersions });
  const assignmentsQuery = useQuery({ queryKey: ["admin-legal-assignments"], queryFn: listTermsAssignments });
  const legalQuery = useQuery({ queryKey: ["admin-legal-documents"], queryFn: listLegalDocuments });
  const companiesQuery = useQuery({ queryKey: ["admin-legal-companies"], queryFn: () => listCompanies({ includeInactive: true }) });
  const profilesQuery = useQuery({ queryKey: ["admin-legal-profiles"], queryFn: listProfiles });

  const termsVersions = termsQuery.data ?? [];
  const assignments = assignmentsQuery.data ?? [];
  const legalRecords = legalQuery.data ?? [];
  const companies = companiesQuery.data ?? [];
  const bumProfiles = (profilesQuery.data ?? []).filter((profile) => profile.role === "BUM");
  const customTerms = termsVersions.filter((terms) => terms.is_custom);

  const [contractForm, setContractForm] = useState({
    audience: "CLIENT" as "CLIENT" | "BUM",
    version: "1.4",
    title: "Trusted Bums Client Agreement",
    change_summary: ACTIVE_TERMS_CHANGE_SUMMARY,
    body: PARTNER_TERMS_BODY,
    faq_body: PARTNER_FAQ_BODY,
    is_custom: false,
    custom_label: "",
    activate: false,
  });
  const [assignmentForm, setAssignmentForm] = useState({ termsVersionId: "", audience: "CLIENT" as "CLIENT" | "BUM", targetId: "", notes: "" });
  const [selectedSlug, setSelectedSlug] = useState(legalDocuments[0]?.slug ?? "terms-of-service");
  const selectedRecord = legalRecords.find((record) => record.slug === selectedSlug);
  const selectedSeed = getDocumentSeed(selectedSlug, selectedRecord);
  const [legalForm, setLegalForm] = useState(selectedSeed);
  const [sectionsText, setSectionsText] = useState(stringifySections(selectedSeed.sections));

  const liveLegalText = useMemo(() => {
    const fallback = legalDocuments.find((document) => document.slug === selectedSlug);
    return combineLegalText({
      title: selectedRecord?.title ?? fallback?.title ?? "",
      description: selectedRecord?.description ?? fallback?.description ?? "",
      sections: selectedRecord?.sections ?? fallback?.sections ?? [],
    });
  }, [selectedRecord, selectedSlug]);

  const draftSections = useMemo(() => {
    try {
      const parsed = JSON.parse(sectionsText) as LegalSection[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [sectionsText]);
  const draftLegalText = combineLegalText({ title: legalForm.title, description: legalForm.description, sections: draftSections });

  const createTermsMutation = useMutation({
    mutationFn: () => createTermsVersion(user!, {
      audience: contractForm.audience,
      version: contractForm.version.trim(),
      title: contractForm.title.trim(),
      change_summary: contractForm.change_summary.trim() || null,
      body: contractForm.body,
      faq_body: contractForm.faq_body,
      is_custom: contractForm.is_custom,
      custom_label: contractForm.custom_label.trim() || null,
      is_active: contractForm.activate,
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-legal-terms"] });
      toast({ title: "Contract version created", description: "The legal contract library was updated." });
    },
    onError: (error) => toast({ title: "Unable to create contract", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" }),
  });

  const assignMutation = useMutation({
    mutationFn: () => createTermsAssignment(user!, {
      terms_version_id: assignmentForm.termsVersionId,
      audience: assignmentForm.audience,
      assigned_company_id: assignmentForm.audience === "CLIENT" ? assignmentForm.targetId : null,
      assigned_user_id: assignmentForm.audience === "BUM" ? assignmentForm.targetId : null,
      is_required: true,
      notes: assignmentForm.notes.trim() || null,
      due_at: null,
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-legal-assignments"] });
      toast({ title: "Contract assigned", description: "The selected party will be required to accept it." });
    },
    onError: (error) => toast({ title: "Unable to assign contract", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" }),
  });

  const saveDraftMutation = useMutation({
    mutationFn: () => saveLegalDocumentDraft(user!, { ...legalForm, sections: draftSections, change_summary: legalForm.change_summary || null }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-legal-documents"] });
      toast({ title: "Draft saved", description: "The website legal page draft was saved." });
    },
    onError: (error) => toast({ title: "Unable to save draft", description: error instanceof Error ? error.message : "Please check the sections JSON.", variant: "destructive" }),
  });

  const publishMutation = useMutation({
    mutationFn: () => publishLegalDocument(user!, { ...legalForm, sections: draftSections, change_summary: legalForm.change_summary || null }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-legal-documents"] });
      toast({ title: "Legal page published", description: "The public website will use this published version." });
    },
    onError: (error) => toast({ title: "Unable to publish", description: error instanceof Error ? error.message : "Please check the sections JSON.", variant: "destructive" }),
  });

  const selectLegalSlug = (slug: string) => {
    const record = legalRecords.find((item) => item.slug === slug);
    const seed = getDocumentSeed(slug, record);
    setSelectedSlug(slug);
    setLegalForm(seed);
    setSectionsText(stringifySections(seed.sections));
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Legal" description="Manage platform contracts, public legal pages, custom agreements, and required acceptances." />

      <Tabs defaultValue="contracts" className="space-y-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="custom">Custom Contracts</TabsTrigger>
          <TabsTrigger value="website">Website Legal Pages</TabsTrigger>
          <TabsTrigger value="preview">Live Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <Card>
            <CardHeader><CardTitle className="font-display">Contract Versions</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Version</TableHead><TableHead>Audience</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Updated</TableHead></TableRow></TableHeader>
                <TableBody>{termsVersions.map((terms) => <TableRow key={terms.id}><TableCell className="font-medium">{terms.version}</TableCell><TableCell>{terms.audience}</TableCell><TableCell>{terms.is_custom ? terms.custom_label || "Custom" : "Standard"}</TableCell><TableCell><StatusBadge label={terms.is_active ? "Active" : "Library"} variant={terms.is_active ? "success" : "outline"} /></TableCell><TableCell>{formatDateForTimeZone(terms.created_at, timeZone)}</TableCell></TableRow>)}</TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display flex items-center gap-2"><FileSignature className="h-5 w-5 text-primary" />Rev Contract</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Audience</Label><Select value={contractForm.audience} onValueChange={(value: "CLIENT" | "BUM") => setContractForm((current) => ({ ...current, audience: value, title: value === "BUM" ? "Trusted Bums Bum Agreement" : "Trusted Bums Client Agreement" }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="CLIENT">Client</SelectItem><SelectItem value="BUM">Bum</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>Version</Label><Input value={contractForm.version} onChange={(event) => setContractForm((current) => ({ ...current, version: event.target.value }))} placeholder="1.4" /></div>
              </div>
              <div className="space-y-2"><Label>Title</Label><Input value={contractForm.title} onChange={(event) => setContractForm((current) => ({ ...current, title: event.target.value }))} /></div>
              <div className="space-y-2"><Label>Custom label</Label><Input value={contractForm.custom_label} onChange={(event) => setContractForm((current) => ({ ...current, custom_label: event.target.value, is_custom: Boolean(event.target.value.trim()) }))} placeholder="Leave blank for standard contract" /></div>
              <div className="space-y-2"><Label>Change summary shown on next login</Label><Textarea rows={3} value={contractForm.change_summary} onChange={(event) => setContractForm((current) => ({ ...current, change_summary: event.target.value }))} /></div>
              <div className="space-y-2"><Label>Contract body</Label><Textarea rows={10} value={contractForm.body} onChange={(event) => setContractForm((current) => ({ ...current, body: event.target.value }))} /></div>
              <div className="space-y-2"><Label>FAQ body</Label><Textarea rows={5} value={contractForm.faq_body} onChange={(event) => setContractForm((current) => ({ ...current, faq_body: event.target.value }))} /></div>
              <Button className="w-full" disabled={!contractForm.version.trim() || createTermsMutation.isPending} onClick={() => createTermsMutation.mutate()}><Plus className="mr-2 h-4 w-4" />Create Contract Version</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <Card>
            <CardHeader><CardTitle className="font-display">Assignments Requiring Acceptance</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Contract</TableHead><TableHead>Assigned To</TableHead><TableHead>Audience</TableHead><TableHead>Assigned</TableHead></TableRow></TableHeader>
                <TableBody>{assignments.map((assignment) => <TableRow key={assignment.id}><TableCell>{assignment.terms_versions?.title ?? "Contract"} <span className="text-muted-foreground">{assignment.terms_versions?.version}</span></TableCell><TableCell>{assignment.companies?.name ?? assignment.profiles?.email ?? "Unknown"}</TableCell><TableCell>{assignment.audience}</TableCell><TableCell>{formatDateTimeForTimeZone(assignment.created_at, timeZone)}</TableCell></TableRow>)}</TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display">Assign Custom Contract</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Contract</Label><Select value={assignmentForm.termsVersionId} onValueChange={(value) => { const terms = customTerms.find((item) => item.id === value) as TermsVersion | undefined; setAssignmentForm((current) => ({ ...current, termsVersionId: value, audience: terms?.audience ?? current.audience, targetId: "" })); }}><SelectTrigger><SelectValue placeholder="Choose custom contract" /></SelectTrigger><SelectContent>{customTerms.map((terms) => <SelectItem key={terms.id} value={terms.id}>{terms.version} · {terms.custom_label || terms.title}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Assign to</Label><Select value={assignmentForm.targetId} onValueChange={(value) => setAssignmentForm((current) => ({ ...current, targetId: value }))}><SelectTrigger><SelectValue placeholder={assignmentForm.audience === "CLIENT" ? "Choose client" : "Choose Bum"} /></SelectTrigger><SelectContent>{assignmentForm.audience === "CLIENT" ? companies.map((company) => <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>) : bumProfiles.map((profile) => <SelectItem key={profile.id} value={profile.id}>{profile.full_name || profile.email || profile.id}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Notes</Label><Textarea rows={3} value={assignmentForm.notes} onChange={(event) => setAssignmentForm((current) => ({ ...current, notes: event.target.value }))} /></div>
              <Button className="w-full" disabled={!assignmentForm.termsVersionId || !assignmentForm.targetId || assignMutation.isPending} onClick={() => assignMutation.mutate()}><Check className="mr-2 h-4 w-4" />Require Acceptance</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="website" className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <Card>
            <CardHeader><CardTitle className="font-display">Website Legal Page</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Page</Label><Select value={selectedSlug} onValueChange={selectLegalSlug}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{footerLegalLinks.map((link) => <SelectItem key={link.to} value={link.to.replace("/legal/", "").replace(/^\//, "")}>{link.label}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Title</Label><Input value={legalForm.title} onChange={(event) => setLegalForm((current) => ({ ...current, title: event.target.value }))} /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea rows={3} value={legalForm.description} onChange={(event) => setLegalForm((current) => ({ ...current, description: event.target.value }))} /></div>
              <div className="space-y-2"><Label>Effective date</Label><Input type="date" value={legalForm.effective_date} onChange={(event) => setLegalForm((current) => ({ ...current, effective_date: event.target.value }))} /></div>
              <div className="space-y-2"><Label>Change summary</Label><Textarea rows={3} value={legalForm.change_summary} onChange={(event) => setLegalForm((current) => ({ ...current, change_summary: event.target.value }))} /></div>
              <div className="space-y-2"><Label>Sections JSON</Label><Textarea rows={12} value={sectionsText} onChange={(event) => setSectionsText(event.target.value)} /></div>
              <div className="grid gap-2 sm:grid-cols-2"><Button variant="outline" onClick={() => saveDraftMutation.mutate()} disabled={!draftSections.length || saveDraftMutation.isPending}><Save className="mr-2 h-4 w-4" />Save Draft</Button><Button onClick={() => publishMutation.mutate()} disabled={!draftSections.length || publishMutation.isPending}><ExternalLink className="mr-2 h-4 w-4" />Publish Live</Button></div>
            </CardContent>
          </Card>
          <div className="space-y-4">
            <Card><CardHeader><CardTitle className="font-display flex items-center gap-2"><GitCompareArrows className="h-5 w-5 text-primary" />Tracked Changes</CardTitle></CardHeader><CardContent><TrackedText before={liveLegalText} after={draftLegalText} /></CardContent></Card>
            <PreviewCard title={legalForm.title} description={legalForm.description} sections={draftSections} />
          </div>
        </TabsContent>

        <TabsContent value="preview" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {footerLegalLinks.map((link) => { const slug = link.to.replace("/legal/", "").replace(/^\//, ""); const record = legalRecords.find((item) => item.slug === slug); return <Card key={link.to}><CardHeader><CardTitle className="font-display text-lg">{link.label}</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><StatusBadge label={record?.is_published ? "Database live" : "Static fallback"} variant={record?.is_published ? "success" : "outline"} /><p className="text-muted-foreground">{record?.description ?? legalDocuments.find((item) => item.slug === slug)?.description ?? "Published outside the legal document table."}</p><Button asChild variant="outline" size="sm"><Link to={link.to}><ExternalLink className="mr-2 h-4 w-4" />Open live page</Link></Button></CardContent></Card>; })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
