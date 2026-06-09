import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, ClipboardList, ExternalLink, Plus, RefreshCw, Save, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import {
  ADMIN_SCRUM_ITEM_PRIORITIES,
  ADMIN_SCRUM_ITEM_SOURCES,
  ADMIN_SCRUM_ITEM_STATUSES,
  ADMIN_SCRUM_ITEM_TYPES,
  createAdminScrumItem,
  listAdminScrumItems,
  updateAdminScrumItem,
  type AdminScrumItemInput,
  type AdminScrumItemPriority,
  type AdminScrumItemRecord,
  type AdminScrumItemSource,
  type AdminScrumItemStatus,
  type AdminScrumItemType,
} from "@/lib/portalApi";
import { formatDateTimeForTimeZone } from "@/lib/timezone";

type StatusFilter = AdminScrumItemStatus | "ACTIVE" | "ALL";
type PriorityFilter = AdminScrumItemPriority | "ALL";
type TypeFilter = AdminScrumItemType | "ALL";

const statusLabels: Record<AdminScrumItemStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  BLOCKED: "Blocked",
  FIXED: "Fixed",
  CLOSED: "Closed",
  WONT_FIX: "Won't fix",
};

const priorityLabels: Record<AdminScrumItemPriority, string> = {
  P0: "P0",
  P1: "P1",
  P2: "P2",
  P3: "P3",
};

const defaultForm: AdminScrumItemInput = {
  title: "",
  description: "",
  priority: "P1",
  itemType: "TASK",
  source: "Scrum",
  relatedArea: "",
  ownerLabel: "Lead Eng",
  addedByAgent: "Lead Developer",
  evidenceLinks: [],
};

function parseEvidenceLinks(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function statusBadge(status: AdminScrumItemStatus) {
  if (status === "BLOCKED") return <Badge variant="destructive">Blocked</Badge>;
  if (status === "FIXED") return <Badge variant="secondary">Fixed</Badge>;
  if (status === "CLOSED") return <Badge>Closed</Badge>;
  if (status === "WONT_FIX") return <Badge variant="outline">Won't fix</Badge>;
  if (status === "IN_PROGRESS") return <Badge variant="secondary">In progress</Badge>;
  return <Badge variant="outline">Open</Badge>;
}

function priorityBadge(priority: AdminScrumItemPriority) {
  if (priority === "P0") return <Badge variant="destructive">P0</Badge>;
  if (priority === "P1") return <Badge variant="secondary">P1</Badge>;
  return <Badge variant="outline">{priority}</Badge>;
}

function typeBadge(type: AdminScrumItemType) {
  if (type === "BUG") return <Badge variant="destructive">Bug</Badge>;
  if (type === "SECURITY") return <Badge variant="secondary">Security</Badge>;
  if (type === "RELEASE") return <Badge variant="secondary">Release</Badge>;
  return <Badge variant="outline">{type.charAt(0) + type.slice(1).toLowerCase()}</Badge>;
}

function ScrumItemRow({ item }: { item: AdminScrumItemRecord }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const timeZone = useUserTimeZone();
  const [status, setStatus] = useState<AdminScrumItemStatus>(item.status);
  const [priority, setPriority] = useState<AdminScrumItemPriority>(item.priority);
  const [ownerLabel, setOwnerLabel] = useState(item.owner_label ?? "");
  const [closureNote, setClosureNote] = useState(item.closure_note ?? "");
  const [evidenceText, setEvidenceText] = useState((item.evidence_links ?? []).join("\n"));
  const rowId = item.tracking_id.toLowerCase();
  const parsedEvidenceLinks = parseEvidenceLinks(evidenceText);
  const needsCloseoutProof = status === "CLOSED" || status === "WONT_FIX";
  const hasCloseoutProof = closureNote.trim().length > 0 && parsedEvidenceLinks.length > 0;

  const updateMutation = useMutation({
    mutationFn: (input: Partial<AdminScrumItemInput>) => updateAdminScrumItem(item.id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-scrum-items"] });
      toast({ title: "Scrum item updated", description: `${item.tracking_id} was saved.` });
    },
    onError: (error) => {
      toast({ title: "Unable to update scrum item", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const saveRow = () => {
    if (needsCloseoutProof && !hasCloseoutProof) {
      toast({
        title: "Closeout proof required",
        description: "Add at least one evidence link and a closeout note before closing or waiving this item.",
        variant: "destructive",
      });
      return;
    }
    updateMutation.mutate({
      status,
      priority,
      ownerLabel,
      closureNote,
      evidenceLinks: parsedEvidenceLinks,
    });
  };

  return (
    <TableRow>
      <TableCell className="min-w-[340px] align-top">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{item.tracking_id}</Badge>
          {typeBadge(item.item_type)}
          {priorityBadge(item.priority)}
          {statusBadge(item.status)}
        </div>
        <p className="mt-2 font-medium">{item.title}</p>
        <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{item.description || "No description yet."}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          Opened {formatDateTimeForTimeZone(item.created_at, timeZone)}
          {item.closed_at ? `, closed ${formatDateTimeForTimeZone(item.closed_at, timeZone)}` : ""}
        </p>
      </TableCell>
      <TableCell className="min-w-[220px] align-top">
        <div className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Source:</span> {item.source}</p>
          <p><span className="text-muted-foreground">Added by:</span> {item.added_by_agent}</p>
          <p><span className="text-muted-foreground">Area:</span> {item.related_area || "Unassigned"}</p>
          {item.github_commit ? <p className="break-all"><span className="text-muted-foreground">Commit:</span> {item.github_commit}</p> : null}
          {item.github_run_id ? <p className="break-all"><span className="text-muted-foreground">Run:</span> {item.github_run_id}</p> : null}
        </div>
      </TableCell>
      <TableCell className="min-w-[260px] align-top">
        <div className="space-y-2">
          <Label htmlFor={`${rowId}-status`}>Status</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as AdminScrumItemStatus)}>
            <SelectTrigger id={`${rowId}-status`}><SelectValue /></SelectTrigger>
            <SelectContent>
              {ADMIN_SCRUM_ITEM_STATUSES.map((option) => (
                <SelectItem key={option} value={option}>{statusLabels[option]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Label htmlFor={`${rowId}-priority`}>Priority</Label>
          <Select value={priority} onValueChange={(value) => setPriority(value as AdminScrumItemPriority)}>
            <SelectTrigger id={`${rowId}-priority`}><SelectValue /></SelectTrigger>
            <SelectContent>
              {ADMIN_SCRUM_ITEM_PRIORITIES.map((option) => (
                <SelectItem key={option} value={option}>{priorityLabels[option]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TableCell>
      <TableCell className="min-w-[280px] align-top">
        <div className="space-y-2">
          <Label htmlFor={`${rowId}-owner`}>Owner</Label>
          <Input id={`${rowId}-owner`} value={ownerLabel} onChange={(event) => setOwnerLabel(event.target.value)} placeholder="Lead Eng, QA, Security" />
          <Label htmlFor={`${rowId}-evidence`}>Evidence links</Label>
          <Textarea id={`${rowId}-evidence`} value={evidenceText} onChange={(event) => setEvidenceText(event.target.value)} placeholder="One link per line" rows={3} />
          <div className="flex flex-wrap gap-2">
            {(item.evidence_links ?? []).slice(0, 3).map((link) => (
              <a key={link} href={link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                <ExternalLink className="h-3 w-3" />
                Evidence
              </a>
            ))}
          </div>
        </div>
      </TableCell>
      <TableCell className="min-w-[260px] align-top">
        <div className="space-y-2">
          <Label htmlFor={`${rowId}-closeout`}>Closeout note</Label>
          <Textarea id={`${rowId}-closeout`} value={closureNote} onChange={(event) => setClosureNote(event.target.value)} placeholder="QA proof, decision, or blocker" rows={4} />
          {needsCloseoutProof && !hasCloseoutProof ? (
            <p className="text-xs text-destructive">Closing or waiving requires at least one evidence link and a closeout note.</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={saveRow} disabled={updateMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button size="sm" onClick={() => { setStatus("CLOSED"); updateMutation.mutate({ status: "CLOSED", closureNote, evidenceLinks: parsedEvidenceLinks, ownerLabel, priority }); }} disabled={updateMutation.isPending || item.status === "CLOSED" || !hasCloseoutProof}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Close
            </Button>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function AdminScrumTracker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AdminScrumItemInput>(defaultForm);
  const [evidenceText, setEvidenceText] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ACTIVE");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");

  const scrumQuery = useQuery({
    queryKey: ["admin-scrum-items"],
    queryFn: listAdminScrumItems,
  });

  const createMutation = useMutation({
    mutationFn: () => createAdminScrumItem({ ...form, evidenceLinks: parseEvidenceLinks(evidenceText) }),
    onSuccess: async (item) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-scrum-items"] });
      setForm(defaultForm);
      setEvidenceText("");
      toast({ title: "Scrum item created", description: `${item.tracking_id} is ready to track.` });
    },
    onError: (error) => {
      toast({ title: "Unable to create scrum item", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const items = useMemo(() => scrumQuery.data ?? [], [scrumQuery.data]);
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const isActive = !["CLOSED", "WONT_FIX"].includes(item.status);
      if (statusFilter === "ACTIVE" && !isActive) return false;
      if (statusFilter !== "ACTIVE" && statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (priorityFilter !== "ALL" && item.priority !== priorityFilter) return false;
      if (typeFilter !== "ALL" && item.item_type !== typeFilter) return false;
      if (!query) return true;
      return [
        item.tracking_id,
        item.title,
        item.description,
        item.related_area,
        item.owner_label,
        item.added_by_agent,
        item.item_type,
        item.source,
        item.closure_note,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [items, priorityFilter, search, statusFilter, typeFilter]);

  const summary = useMemo(() => ({
    active: items.filter((item) => !["CLOSED", "WONT_FIX"].includes(item.status)).length,
    bugs: items.filter((item) => !["CLOSED", "WONT_FIX"].includes(item.status) && item.item_type === "BUG").length,
    urgent: items.filter((item) => !["CLOSED", "WONT_FIX"].includes(item.status) && ["P0", "P1"].includes(item.priority)).length,
    blocked: items.filter((item) => item.status === "BLOCKED").length,
    closed: items.filter((item) => item.status === "CLOSED" || item.status === "WONT_FIX").length,
  }), [items]);

  return (
    <div>
      <PageHeader
        title="Scrum Tracker"
        description="Track scrum findings, owners, QA evidence, and closeout status for Trusted Bums."
      >
        <Button variant="outline" onClick={() => scrumQuery.refetch()} disabled={scrumQuery.isFetching}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{summary.active}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Open bugs</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{summary.bugs}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">P0 / P1</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{summary.urgent}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Blocked</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{summary.blocked}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Closed</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{summary.closed}</p></CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5" />
            Add Scrum Item
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-[minmax(260px,1.4fr)_minmax(220px,0.8fr)]">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="scrum-title">Title</Label>
                <Input id="scrum-title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Short issue or follow-up title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scrum-description">Description</Label>
                <Textarea id="scrum-description" value={form.description ?? ""} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="What was found, why it matters, and what proof closes it" rows={5} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scrum-evidence">Evidence links</Label>
                <Textarea id="scrum-evidence" value={evidenceText} onChange={(event) => setEvidenceText(event.target.value)} placeholder="One GitHub, QA run, doc, or Supabase link per line" rows={3} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="space-y-2">
                <Label htmlFor="scrum-priority">Priority</Label>
                <Select value={form.priority} onValueChange={(value) => setForm((current) => ({ ...current, priority: value as AdminScrumItemPriority }))}>
                  <SelectTrigger id="scrum-priority"><SelectValue /></SelectTrigger>
                  <SelectContent>{ADMIN_SCRUM_ITEM_PRIORITIES.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scrum-source">Source</Label>
                <Select value={form.source} onValueChange={(value) => setForm((current) => ({ ...current, source: value as AdminScrumItemSource }))}>
                  <SelectTrigger id="scrum-source"><SelectValue /></SelectTrigger>
                  <SelectContent>{ADMIN_SCRUM_ITEM_SOURCES.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scrum-type">Type</Label>
                <Select value={form.itemType} onValueChange={(value) => setForm((current) => ({ ...current, itemType: value as AdminScrumItemType }))}>
                  <SelectTrigger id="scrum-type"><SelectValue /></SelectTrigger>
                  <SelectContent>{ADMIN_SCRUM_ITEM_TYPES.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scrum-area">Area</Label>
                <Input id="scrum-area" value={form.relatedArea ?? ""} onChange={(event) => setForm((current) => ({ ...current, relatedArea: event.target.value }))} placeholder="Auth, RLS, QA, Client portal" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scrum-owner">Owner</Label>
                <Input id="scrum-owner" value={form.ownerLabel ?? ""} onChange={(event) => setForm((current) => ({ ...current, ownerLabel: event.target.value }))} placeholder="Lead Eng" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scrum-agent">Added by agent</Label>
                <Input id="scrum-agent" value={form.addedByAgent ?? ""} onChange={(event) => setForm((current) => ({ ...current, addedByAgent: event.target.value }))} placeholder="Lead Developer" />
              </div>
              <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.title.trim()} className="mt-1">
                <ClipboardList className="mr-2 h-4 w-4" />
                Create Item
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardList className="h-5 w-5" />
            Tracked Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_160px_160px]">
            <div className="relative">
              <Label htmlFor="scrum-search" className="sr-only">Search scrum items</Label>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="scrum-search" className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tracking ID, title, area, owner" />
            </div>
            <div>
              <Label htmlFor="scrum-status-filter" className="sr-only">Filter scrum items by status</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                <SelectTrigger id="scrum-status-filter"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  {ADMIN_SCRUM_ITEM_STATUSES.map((option) => (
                    <SelectItem key={option} value={option}>{statusLabels[option]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="scrum-priority-filter" className="sr-only">Filter scrum items by priority</Label>
              <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as PriorityFilter)}>
                <SelectTrigger id="scrum-priority-filter"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All priorities</SelectItem>
                  {ADMIN_SCRUM_ITEM_PRIORITIES.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="scrum-type-filter" className="sr-only">Filter scrum items by type</Label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as TypeFilter)}>
                <SelectTrigger id="scrum-type-filter"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All types</SelectItem>
                  {ADMIN_SCRUM_ITEM_TYPES.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {scrumQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading scrum tracker...</p>
          ) : scrumQuery.isError ? (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <p>{scrumQuery.error instanceof Error ? scrumQuery.error.message : "Unable to load scrum tracker."}</p>
            </div>
          ) : filteredItems.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Context</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Owner & Evidence</TableHead>
                    <TableHead>Closeout</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <ScrumItemRow key={item.id} item={item} />
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No scrum items match the current filters.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
