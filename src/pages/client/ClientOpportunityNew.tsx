import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Building2, CheckCircle, Download, Eye, FileUp, MessageSquare, PlusCircle, Search, Send, Sparkles, Trash2, Users, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PaginationControls } from "@/components/PaginationControls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import { trackAnalyticsEvent } from "@/lib/analyticsEvents";
import { cn } from "@/lib/utils";
import { getPageItems } from "@/lib/pagination";
import {
  createOpportunityRegistration,
  deleteOwnOpportunityRegistration,
  formalizeCustomerTargetResponse,
  listCustomerTargetResponses,
  listClientReverseOpportunities,
  listOpportunityClaims,
  listOwnOpportunityRegistrations,
  listSelectableClientPayPrograms,
  updateCustomerTargetResponseStatus,
  updateOpportunityClaimStatus,
  updateOwnOpportunityRegistration,
  type ClientPayProgramApprovalStatus,
  type CustomerTargetResponseRecord,
  type OpportunityClaimDeclineReason,
  type OpportunityClaimRecord,
  type OpportunityRegistration,
  type RegistrationStatus,
  type ReverseOpportunityStatus,
} from "@/lib/portalApi";
import { opportunityOriginLabel, opportunityStageLabel, stageFromRegistrationStatus, stageFromReverseOpportunityStatus, stageFromTargetResponseStatus } from "@/lib/opportunityModel";
import { formatDateForTimeZone } from "@/lib/timezone";
import { buildOpportunityImportTemplateCsv, parseOpportunityImportFile, toOpportunityInput, type OpportunityImportRow } from "@/lib/opportunityImport";
import { claimDeclineReasonLabel, claimDeclineReasons } from "@/lib/claimConfig";

const REGISTERED_OPPORTUNITIES_PAGE_SIZE = 6;

type OpportunityViewFilter = "pipeline" | "bum-originated" | "responses" | "import" | "register";
type OpportunityBulkMode = "create" | "update";

type BumOriginatedTypeFilter = "ALL" | "NEW" | "ACTIVE" | "CONVERTED" | "CLOSED";

const bumOriginatedTypeFilters: { value: BumOriginatedTypeFilter; label: string }[] = [
  { value: "ALL", label: "All Bum-Originated" },
  { value: "NEW", label: "New" },
  { value: "ACTIVE", label: "Active outreach" },
  { value: "CONVERTED", label: "Converted" },
  { value: "CLOSED", label: "Closed lost" },
];

const initialForm = {
  pay_program_id: "",
  target_account_name: "",
  business_unit: "",
  opportunity_description: "",
  client_contact: "",
  trusted_bums_contact: "",
  expected_product_service: "",
  estimated_deal_value: "",
  expected_timeline: "",
  notes: "",
};


const CLIENT_OPPORTUNITY_DRAFT_PREFIX = "trustedbums:client-opportunity-registration-draft:";

interface ClientOpportunityDraft {
  form: typeof initialForm;
  savedAt: string;
}

function clientOpportunityDraftKey(clientId: string) {
  return `${CLIENT_OPPORTUNITY_DRAFT_PREFIX}${clientId}`;
}

function canUseBrowserStorage() {
  try {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  } catch {
    return false;
  }
}

function readClientOpportunityDraft(clientId?: string | null) {
  if (!clientId || !canUseBrowserStorage()) {
    return null;
  }

  try {
    const rawDraft = window.localStorage.getItem(clientOpportunityDraftKey(clientId));
    if (!rawDraft) {
      return null;
    }

    const draft = JSON.parse(rawDraft) as Partial<ClientOpportunityDraft>;
    return draft.form && draft.savedAt ? (draft as ClientOpportunityDraft) : null;
  } catch {
    return null;
  }
}

function writeClientOpportunityDraft(clientId: string, draft: ClientOpportunityDraft) {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(clientOpportunityDraftKey(clientId), JSON.stringify(draft));
}

function clearClientOpportunityDraft(clientId?: string | null) {
  if (!clientId || !canUseBrowserStorage()) {
    return;
  }

  window.localStorage.removeItem(clientOpportunityDraftKey(clientId));
}

function approvalVariant(status: ClientPayProgramApprovalStatus) {
  if (status === "APPROVED") {
    return "success" as const;
  }
  if (status === "DENIED") {
    return "destructive" as const;
  }
  return "warning" as const;
}

function commissionScheduleSummary(plan: {
  year_1_rate: number;
  year_2_rate: number;
  year_3_rate: number;
  year_4_rate: number;
  year_5_rate: number;
  year_6_plus_rate: number;
}) {
  return `Y1 ${plan.year_1_rate}% · Y2 ${plan.year_2_rate}% · Y3 ${plan.year_3_rate}% · Y4 ${plan.year_4_rate}% · Y5 ${plan.year_5_rate}% · Y6+ ${plan.year_6_plus_rate}%`;
}

function registrationVariant(status: string) {
  if (["Accepted", "Closed Won"].includes(status)) {
    return "success" as const;
  }

  if (["Rejected", "Closed Lost"].includes(status)) {
    return "destructive" as const;
  }

  if (["Needs Clarification", "Disputed"].includes(status)) {
    return "warning" as const;
  }

  return "info" as const;
}

function reverseOpportunityVariant(status: ReverseOpportunityStatus) {
  if (status === "CLIENT_INTERESTED" || status === "CONVERTED") {
    return "success" as const;
  }

  if (status === "CLOSED_LOST") {
    return "destructive" as const;
  }

  if (status === "OUTREACH_READY" || status === "CLIENT_CONTACTED") {
    return "info" as const;
  }

  return "warning" as const;
}

function matchesBumOriginatedTypeFilter(status: ReverseOpportunityStatus, typeFilter: BumOriginatedTypeFilter) {
  if (typeFilter === "ALL") {
    return true;
  }

  if (typeFilter === "NEW") {
    return status === "SUBMITTED";
  }

  if (typeFilter === "ACTIVE") {
    return status === "OUTREACH_READY" || status === "CLIENT_CONTACTED" || status === "CLIENT_INTERESTED";
  }

  if (typeFilter === "CONVERTED") {
    return status === "CONVERTED";
  }

  return status === "CLOSED_LOST";
}

function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "TBD";
  }

  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value));
}

function getAssignedClaim(claims: OpportunityClaimRecord[]) {
  return (
    claims.find((claim) => ["APPROVED", "SCHEDULED", "MEETING_HELD", "CLOSED"].includes(claim.status)) ??
    claims.find((claim) => claim.status === "PROPOSED") ??
    null
  );
}

function bumName(claim: OpportunityClaimRecord | null) {
  if (!claim) {
    return "Unassigned";
  }

  return claim.profiles?.full_name ?? claim.profiles?.email ?? "Bum assigned";
}

function claimDecisionSummary(claim: OpportunityClaimRecord | null) {
  if (!claim) return null;
  if (claim.status !== "DECLINED") return null;
  const reason = claimDeclineReasonLabel(claim.decline_reason_code) ?? "Declined";
  return claim.decline_reason_note ? `${reason}: ${claim.decline_reason_note}` : reason;
}

function nextStepForOpportunity(opportunity: OpportunityRegistration, assignedClaim: OpportunityClaimRecord | null) {
  if (opportunity.status === "Submitted") {
    return "Trusted Bums review";
  }

  if (opportunity.status === "Needs Clarification") {
    return "Clarify details";
  }

  if (opportunity.status === "Accepted") {
    if (!assignedClaim) {
      return "Assign Bum";
    }

    if (assignedClaim.status === "SCHEDULED") {
      return "Hold meeting";
    }

    if (assignedClaim.status === "MEETING_HELD") {
      return "Track outcome";
    }

    return "Bum outreach";
  }

  if (opportunity.status === "Disputed") {
    return "Resolve dispute";
  }

  if (opportunity.status === "Closed Won") {
    return "Report payment";
  }

  if (opportunity.status === "Closed Lost" || opportunity.status === "Rejected") {
    return "Closed";
  }

  return opportunity.expected_timeline ?? "Set next step";
}

function csvEscape(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, "\"\"")}"`;
}

function downloadCsvFile(filename: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function normalizePlanLookup(value: string) {
  return value.trim().toLowerCase();
}

function nullableTextChanged(nextValue: string | undefined, currentValue: string | null | undefined) {
  return nextValue !== undefined && nextValue.trim() !== (currentValue ?? "");
}

function nullableNumberChanged(nextValue: number | null | undefined, currentValue: number | null | undefined) {
  return nextValue !== undefined && Number(nextValue ?? 0) !== Number(currentValue ?? 0);
}

export default function ClientOpportunityNew() {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const linkedClaimId = useMemo(() => new URLSearchParams(location.search).get("claimId"), [location.search]);
  const timeZone = useUserTimeZone();
  const queryClient = useQueryClient();
  const startsOnNewRoute = location.pathname.endsWith("/new");
  const shouldStartOnRegister =
    startsOnNewRoute && typeof window !== "undefined" && window.matchMedia?.("(min-width: 768px)").matches;
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [bulkMode, setBulkMode] = useState<OpportunityBulkMode>("create");
  const [importRows, setImportRows] = useState<OpportunityImportRow[]>([]);
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ success: number; failures: string[] } | null>(null);
  const [detailsOpportunityId, setDetailsOpportunityId] = useState<string | null>(null);
  const [editingOpportunityId, setEditingOpportunityId] = useState<string | null>(null);
  const [editEstimatedDealValue, setEditEstimatedDealValue] = useState("");
  const [editPayProgramId, setEditPayProgramId] = useState("");
  const [editExpectedTimeline, setEditExpectedTimeline] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [claimDeclineReasonById, setClaimDeclineReasonById] = useState<Record<string, OpportunityClaimDeclineReason>>({});
  const [claimDeclineNoteById, setClaimDeclineNoteById] = useState<Record<string, string>>({});
  const [responsePayProgramIds, setResponsePayProgramIds] = useState<Record<string, string>>({});
  const [bumOriginatedQuery, setBumOriginatedQuery] = useState("");
  const [bumOriginatedTypeFilter, setBumOriginatedTypeFilter] = useState<BumOriginatedTypeFilter>("ALL");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [registeredPage, setRegisteredPage] = useState(1);
  const [activeView, setActiveView] = useState<OpportunityViewFilter>(shouldStartOnRegister ? "register" : "pipeline");
  const [isRegisterOpen, setIsRegisterOpen] = useState(shouldStartOnRegister);
  const [publishToBums, setPublishToBums] = useState(true);
  const [isRegistrationDraftDirty, setIsRegistrationDraftDirty] = useState(false);
  const [restoredRegistrationDraftAt, setRestoredRegistrationDraftAt] = useState<string | null>(null);
  const [localRegistrationDraftSavedAt, setLocalRegistrationDraftSavedAt] = useState<string | null>(null);

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setIsRegistrationDraftDirty(true);
    setRestoredRegistrationDraftAt(null);
    setForm((current) => ({ ...current, [field]: value }));
  };

  useEffect(() => {
    const draft = readClientOpportunityDraft(user?.clientId);
    if (!draft) {
      return;
    }

    setForm(draft.form);
    setIsRegistrationDraftDirty(true);
    setRestoredRegistrationDraftAt(draft.savedAt);
    setLocalRegistrationDraftSavedAt(draft.savedAt);
    setActiveView("register");
    setIsRegisterOpen(true);
  }, [user?.clientId]);

  useEffect(() => {
    if (!isRegistrationDraftDirty || !user?.clientId) {
      return;
    }

    const savedAt = new Date().toISOString();
    writeClientOpportunityDraft(user.clientId, { form, savedAt });
    setLocalRegistrationDraftSavedAt(savedAt);
  }, [form, isRegistrationDraftDirty, user?.clientId]);

  useEffect(() => {
    if (!isRegistrationDraftDirty) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isRegistrationDraftDirty]);

  useEffect(() => {
    if (location.pathname.endsWith("/new")) {
      if (typeof window !== "undefined" && window.matchMedia?.("(min-width: 768px)").matches) {
        setActiveView("register");
        setIsRegisterOpen(true);
      } else {
        setActiveView("pipeline");
        setIsRegisterOpen(false);
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "questions") {
      navigate("/client/live-conversations", { replace: true });
    } else if (tab === "responses" || tab === "bum-originated") {
      setActiveView(tab);
    } else if (params.get("claimId")) {
      setActiveView("pipeline");
    }
  }, [location.search, navigate]);

  const importPreviewRows = useMemo(() => importRows.slice(0, 5), [importRows]);
  const payProgramsQuery = useQuery({
    queryKey: ["client-pay-programs", user?.clientId],
    queryFn: () => listSelectableClientPayPrograms(user!),
    enabled: Boolean(user?.clientId),
  });
  const opportunitiesQuery = useQuery({
    queryKey: ["client-opportunity-registrations", user?.clientId],
    queryFn: () => listOwnOpportunityRegistrations(user!),
    enabled: Boolean(user?.clientId),
  });
  const claimsQuery = useQuery({
    queryKey: ["client-opportunity-claims", user?.clientId],
    queryFn: () => listOpportunityClaims(undefined, { includeDisabled: true }),
    enabled: Boolean(user?.clientId),
  });
  const targetResponsesQuery = useQuery({
    queryKey: ["client-target-responses", user?.clientId],
    queryFn: () => listCustomerTargetResponses(user!),
    enabled: Boolean(user?.clientId),
  });
  const bumOriginatedQueryResult = useQuery({
    queryKey: ["client-reverse-opportunities", user?.clientId],
    queryFn: () => listClientReverseOpportunities(user!),
    enabled: Boolean(user?.clientId),
  });

  const formalizeResponseMutation = useMutation({
    mutationFn: ({ response, payProgramId }: { response: CustomerTargetResponseRecord; payProgramId: string }) =>
      formalizeCustomerTargetResponse(user!, response.id, { payProgramId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["client-target-responses", user?.clientId] });
      await queryClient.invalidateQueries({ queryKey: ["client-opportunity-registrations", user?.clientId] });
      await queryClient.invalidateQueries({ queryKey: ["client-opportunity-claims", user?.clientId] });
      toast({
        title: "Bum response approved",
        description: "The target response is now a formal accepted opportunity with an approved Bum claim.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to approve response",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectResponseMutation = useMutation({
    mutationFn: (response: CustomerTargetResponseRecord) => updateCustomerTargetResponseStatus(user!, response.id, "DECLINED"),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["client-target-responses", user?.clientId] });
      toast({ title: "Bum response rejected", description: "The response has been closed without creating an opportunity." });
    },
    onError: (error) => {
      toast({
        title: "Unable to reject response",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const claimDecisionMutation = useMutation({
    mutationFn: ({
      claim,
      decision,
      declineReason,
      declineNote,
    }: {
      claim: OpportunityClaimRecord;
      decision: "APPROVED" | "DECLINED";
      declineReason?: OpportunityClaimDeclineReason;
      declineNote?: string;
    }) =>
      updateOpportunityClaimStatus(
        user!,
        claim.id,
        decision,
        declineNote,
        decision === "DECLINED" ? declineReason ?? "OTHER" : null,
        declineNote,
      ),
    onSuccess: async (claim) => {
      await queryClient.invalidateQueries({ queryKey: ["client-opportunity-claims", user?.clientId] });
      toast({
        title: claim.status === "APPROVED" ? "Claim approved" : "Claim declined",
        description: claim.status === "APPROVED" ? "The Bum can now move forward with the introduction path." : "The Bum will see the decline reason.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to update claim",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const publishOpportunityMutation = useMutation({
    mutationFn: (opportunity: OpportunityRegistration) =>
      updateOwnOpportunityRegistration(user!, opportunity.id, { status: "Accepted" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["client-opportunity-registrations", user?.clientId] });
      toast({
        title: "Opportunity published to Bums",
        description: "The opportunity is now available for Bum matching.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to publish opportunity",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteOpportunityMutation = useMutation({
    mutationFn: (opportunity: OpportunityRegistration) => deleteOwnOpportunityRegistration(user!, opportunity.id),
    onSuccess: async (_deleted, opportunity) => {
      queryClient.setQueryData<OpportunityRegistration[]>(
        ["client-opportunity-registrations", user?.clientId],
        (current) => current?.filter((item) => item.id !== opportunity.id) ?? [],
      );
      await queryClient.invalidateQueries({ queryKey: ["client-opportunity-registrations", user?.clientId] });
      await queryClient.invalidateQueries({ queryKey: ["client-opportunity-claims", user?.clientId] });
      toast({
        title: "Opportunity deleted",
        description: "The opportunity was removed from your pipeline.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to delete opportunity",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const loadImportFile = async (file: File | null) => {
    if (!file) {
      setImportRows([]);
      setImportFileName(null);
      setBulkResult(null);
      return;
    }

    try {
      const rows = await parseOpportunityImportFile(file);
      setImportRows(rows);
      setImportFileName(file.name);
      setBulkResult(null);
      toast({
        title: "Import file ready",
        description: `${rows.length} ${rows.length === 1 ? "opportunity" : "opportunities"} parsed for review.`,
      });
    } catch (error) {
      setImportRows([]);
      setImportFileName(null);
      toast({
        title: "Unable to read import file",
        description: error instanceof Error ? error.message : "Please check the CSV and try again.",
        variant: "destructive",
      });
    }
  };

  const importOpportunities = async () => {
    if (!user || !importRows.length) {
      return;
    }

    setIsImporting(true);
    const failures: string[] = [];
    let success = 0;

    try {
      for (const row of importRows) {
        try {
          if (bulkMode === "create") {
            const input = toOpportunityInput(row);
            const payProgramId = resolveImportPayProgramId(row);
            await createOpportunityRegistration(user, { ...input, pay_program_id: payProgramId ?? input.pay_program_id });
          } else {
            await updateOpportunityFromImportRow(row);
          }
          success += 1;
        } catch (error) {
          failures.push(`Row ${row.rowNumber}: ${error instanceof Error ? error.message : "Unable to process row."}`);
        }
      }

      if (success > 0) {
        trackAnalyticsEvent(bulkMode === "create" ? "trustedbums_opportunity_created" : "trustedbums_opportunity_updated", {
          opportunity_origin: "client_import",
          opportunity_status: bulkMode === "create" ? "imported" : "updated",
          opportunity_count: success,
          failure_count: failures.length,
        });
      }

      setBulkResult({ success, failures });
      await queryClient.invalidateQueries({ queryKey: ["client-opportunity-registrations", user?.clientId] });
      await queryClient.invalidateQueries({ queryKey: ["client-opportunity-claims", user?.clientId] });
      toast({
        title: bulkMode === "create" ? "Opportunities imported" : "Opportunities updated",
        description: failures.length
          ? `${success} completed. ${failures[0]}`
          : `${success} ${success === 1 ? "opportunity was" : "opportunities were"} ${bulkMode === "create" ? "created" : "updated"} from ${importFileName ?? "your CSV"}.`,
        variant: failures.length ? "destructive" : undefined,
      });
      if (!failures.length) {
        setImportRows([]);
        setImportFileName(null);
      }
    } catch (error) {
      toast({
        title: bulkMode === "create" ? "Unable to import opportunities" : "Unable to update opportunities",
        description: error instanceof Error ? error.message : "Please fix the CSV and try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const startEditing = (opportunity: OpportunityRegistration) => {
    setEditingOpportunityId(opportunity.id);
    setEditEstimatedDealValue(
      opportunity.estimated_deal_value !== null && opportunity.estimated_deal_value !== undefined
        ? String(opportunity.estimated_deal_value)
        : "",
    );
    setEditPayProgramId(opportunity.pay_program_id ?? "");
    setEditExpectedTimeline(opportunity.expected_timeline ?? "");
    setEditNotes(opportunity.notes ?? "");
  };

  const saveOpportunityEdit = async () => {
    if (!user || !editingOpportunityId) {
      return;
    }

    const editingOpportunity = opportunities.find((opportunity) => opportunity.id === editingOpportunityId);
    if (!editingOpportunity) {
      toast({
        title: "Unable to update opportunity",
        description: "That opportunity is no longer in your pipeline.",
        variant: "destructive",
      });
      setEditingOpportunityId(null);
      return;
    }

    const updates: {
      estimated_deal_value?: number | null;
      expected_timeline?: string;
      notes?: string;
      pay_program_id?: string | null;
    } = {
      estimated_deal_value: editEstimatedDealValue.trim() ? Number(editEstimatedDealValue) : null,
      expected_timeline: editExpectedTimeline,
      notes: editNotes,
    };

    if (editPayProgramId !== (editingOpportunity.pay_program_id ?? "")) {
      updates.pay_program_id = editPayProgramId || null;
    }

    setIsSavingEdit(true);
    try {
      await updateOwnOpportunityRegistration(user, editingOpportunityId, updates);
      await queryClient.invalidateQueries({ queryKey: ["client-opportunity-registrations", user?.clientId] });
      toast({
        title: "Opportunity updated",
        description: "Estimated value and commission plan were saved.",
      });
      setEditingOpportunityId(null);
    } catch (error) {
      toast({
        title: "Unable to update opportunity",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingEdit(false);
    }
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
        pay_program_id: form.pay_program_id || null,
        estimated_deal_value: form.estimated_deal_value ? Number(form.estimated_deal_value) : null,
        status: publishToBums ? "Accepted" : "Draft",
      });
      trackAnalyticsEvent("trustedbums_opportunity_created", {
        opportunity_origin: "client_manual",
        opportunity_status: publishToBums ? "published" : "draft",
        has_estimated_value: Boolean(form.estimated_deal_value),
        has_pay_program: Boolean(form.pay_program_id),
        has_expected_timeline: Boolean(form.expected_timeline.trim()),
      });
      setSubmittedId(opportunity.id);
      clearClientOpportunityDraft(user?.clientId);
      setIsRegistrationDraftDirty(false);
      setRestoredRegistrationDraftAt(null);
      setLocalRegistrationDraftSavedAt(null);
      setForm(initialForm);
      setIsRegisterOpen(false);
      setActiveView("pipeline");
      await queryClient.invalidateQueries({ queryKey: ["client-opportunity-registrations", user?.clientId] });
      toast({
        title: publishToBums ? "Opportunity published to Bums" : "Opportunity saved as draft",
        description: publishToBums
          ? "The opportunity is live for Bum matching."
          : "The opportunity is private until you publish it to Bums.",
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

  const payPrograms = payProgramsQuery.data ?? [];
  const opportunities = opportunitiesQuery.data ?? [];
  const targetResponses = useMemo(() => targetResponsesQuery.data ?? [], [targetResponsesQuery.data]);
  const linkedTargetResponseId = new URLSearchParams(location.search).get("targetResponseId");
  const relationshipTargetResponses = useMemo(() => {
    return targetResponses.filter((response) => !response.contact_name.toLowerCase().startsWith("question about "));
  }, [targetResponses]);
  const pendingTargetResponseCount = relationshipTargetResponses.filter((response) => response.status === "PROPOSED").length;
  const bumOriginatedOpportunities = useMemo(() => {
    return (bumOriginatedQueryResult.data ?? []).filter((opportunity) => {
      const matchesQuery = [
        opportunity.customer_company_name,
        opportunity.customer_need_summary,
        opportunity.expected_product_service,
        opportunity.vendor_contact_name,
        opportunity.customer_contact_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(bumOriginatedQuery.toLowerCase());

      return matchesBumOriginatedTypeFilter(opportunity.status, bumOriginatedTypeFilter) && matchesQuery;
    });
  }, [bumOriginatedQuery, bumOriginatedQueryResult.data, bumOriginatedTypeFilter]);
  const sortedTargetResponses = useMemo(() => {
    return [...relationshipTargetResponses].sort((a, b) => {
      const aLinked = linkedTargetResponseId && a.id === linkedTargetResponseId ? 1 : 0;
      const bLinked = linkedTargetResponseId && b.id === linkedTargetResponseId ? 1 : 0;
      if (aLinked !== bLinked) return bLinked - aLinked;
      const aOpen = a.status === "PROPOSED" ? 1 : 0;
      const bOpen = b.status === "PROPOSED" ? 1 : 0;
      if (aOpen !== bOpen) return bOpen - aOpen;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [linkedTargetResponseId, relationshipTargetResponses]);
  const claimsByOpportunity = useMemo(() => {
    const grouped = new Map<string, OpportunityClaimRecord[]>();

    for (const claim of claimsQuery.data ?? []) {
      const current = grouped.get(claim.opportunity_registration_id) ?? [];
      current.push(claim);
      grouped.set(claim.opportunity_registration_id, current);
    }

    return grouped;
  }, [claimsQuery.data]);
  const resolveImportPayProgramId = (row: OpportunityImportRow) => {
    if (row.pay_program_id) {
      return row.pay_program_id;
    }

    if (!row.commission_plan) {
      return undefined;
    }

    const normalizedPlanName = normalizePlanLookup(row.commission_plan);
    const matchingPlan = payPrograms.find((plan) => normalizePlanLookup(plan.name) === normalizedPlanName);
    if (!matchingPlan) {
      throw new Error(`Commission plan "${row.commission_plan}" is not available for this company.`);
    }

    return matchingPlan.id;
  };
  const updateOpportunityFromImportRow = async (row: OpportunityImportRow) => {
    if (!user) {
      throw new Error("Sign in again before updating opportunities.");
    }

    if (!row.opportunity_id) {
      throw new Error("Bulk update rows must include opportunity_id. Export current opportunities first, then edit that file.");
    }

    const opportunity = opportunities.find((item) => item.id === row.opportunity_id);
    if (!opportunity) {
      throw new Error("Opportunity ID was not found in your company pipeline.");
    }

    const hasClaim = (claimsByOpportunity.get(opportunity.id) ?? []).length > 0;
    const updates: {
      target_account_name?: string;
      business_unit?: string;
      opportunity_description?: string;
      client_contact?: string;
      trusted_bums_contact?: string;
      expected_product_service?: string;
      estimated_deal_value?: number | null;
      expected_timeline?: string;
      notes?: string;
      pay_program_id?: string | null;
      status?: RegistrationStatus;
    } = {};
    const lockedChanges: string[] = [];

    if (row.target_account_name.trim() !== opportunity.target_account_name) {
      updates.target_account_name = row.target_account_name;
      lockedChanges.push("Customer name");
    }
    if (nullableTextChanged(row.business_unit, opportunity.business_unit)) {
      updates.business_unit = row.business_unit;
      lockedChanges.push("Business unit");
    }
    if (nullableTextChanged(row.opportunity_description, opportunity.opportunity_description)) {
      updates.opportunity_description = row.opportunity_description;
      lockedChanges.push("Opportunity description");
    }
    if (nullableTextChanged(row.expected_product_service, opportunity.expected_product_service)) {
      updates.expected_product_service = row.expected_product_service;
      lockedChanges.push("Product/service");
    }
    if (row.status && row.status !== opportunity.status) {
      updates.status = row.status;
      lockedChanges.push("Draft/Published status");
    }

    const payProgramId = resolveImportPayProgramId(row);
    if (payProgramId !== undefined && payProgramId !== opportunity.pay_program_id) {
      updates.pay_program_id = payProgramId;
      lockedChanges.push("Commission plan");
    }

    if (nullableTextChanged(row.client_contact, opportunity.client_contact)) {
      updates.client_contact = row.client_contact;
    }
    if (nullableTextChanged(row.trusted_bums_contact, opportunity.trusted_bums_contact)) {
      updates.trusted_bums_contact = row.trusted_bums_contact;
    }
    if (nullableNumberChanged(row.estimated_deal_value, opportunity.estimated_deal_value)) {
      updates.estimated_deal_value = row.estimated_deal_value ?? null;
    }
    if (nullableTextChanged(row.expected_timeline, opportunity.expected_timeline)) {
      updates.expected_timeline = row.expected_timeline;
    }
    if (nullableTextChanged(row.notes, opportunity.notes)) {
      updates.notes = row.notes;
    }

    if (hasClaim && lockedChanges.length) {
      throw new Error(`Claim exists. Locked fields cannot change: ${lockedChanges.join(", ")}.`);
    }

    if (!Object.keys(updates).length) {
      return;
    }

    await updateOwnOpportunityRegistration(user, opportunity.id, updates);
  };
  const exportOpportunityRows = () => {
    const headers = [
      "opportunity_id",
      "customer_name",
      "status",
      "commission_plan_id",
      "commission_plan",
      "claimed",
      "business_unit",
      "expected_product_service",
      "estimated_deal_value",
      "expected_timeline",
      "client_contact",
      "trusted_bums_contact",
      "opportunity_description",
      "notes",
    ];
    const rows = opportunities.map((opportunity) => {
      const hasClaim = (claimsByOpportunity.get(opportunity.id) ?? []).length > 0;
      return [
        opportunity.id,
        opportunity.target_account_name,
        opportunity.status === "Accepted" ? "Published" : opportunity.status,
        opportunity.pay_program_id ?? "",
        opportunity.client_pay_programs?.name ?? "",
        hasClaim ? "yes" : "no",
        opportunity.business_unit ?? "",
        opportunity.expected_product_service ?? "",
        opportunity.estimated_deal_value ?? "",
        opportunity.expected_timeline ?? "",
        opportunity.client_contact ?? "",
        opportunity.trusted_bums_contact ?? "",
        opportunity.opportunity_description ?? "",
        opportunity.notes ?? "",
      ];
    });

    downloadCsvFile(
      "trustedbums-opportunities-bulk-update.csv",
      [headers.map(csvEscape).join(","), ...rows.map((row) => row.map(csvEscape).join(","))].join("\n"),
    );
  };
  const downloadOpportunityTemplate = () => {
    downloadCsvFile("trustedbums-opportunity-template.csv", buildOpportunityImportTemplateCsv());
  };
  const visibleOpportunities = getPageItems(opportunities, registeredPage, REGISTERED_OPPORTUNITIES_PAGE_SIZE);
  const openPipelineCount = opportunities.filter((opportunity) => !["Closed Won", "Closed Lost", "Rejected"].includes(opportunity.status)).length;
  const totalPipelineValue = opportunities.reduce((sum, opportunity) => sum + Number(opportunity.estimated_deal_value ?? 0), 0);
  const acceptedCount = opportunities.filter((opportunity) => opportunity.status === "Accepted").length;
  const draftCount = opportunities.filter((opportunity) => opportunity.status === "Draft").length;
  const detailsOpportunity = opportunities.find((opportunity) => opportunity.id === detailsOpportunityId);
  const detailsOpportunityClaims = detailsOpportunity ? claimsByOpportunity.get(detailsOpportunity.id) ?? [] : [];
  const detailsAssignedClaim = getAssignedClaim(detailsOpportunityClaims);
  const editingOpportunity = opportunities.find((opportunity) => opportunity.id === editingOpportunityId);
  const editingOpportunityHasClaim = Boolean(
    editingOpportunity && (claimsByOpportunity.get(editingOpportunity.id) ?? []).length > 0,
  );

  return (
    <div>
      <PageHeader
        title="Opportunities"
        description="Add customer accounts as opportunities, keep private drafts, and publish ready opportunities to Bums for matching."
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setActiveView("import");
            setIsRegisterOpen(false);
          }}
        >
          <FileUp className="mr-2 h-4 w-4" />
          Bulk Import
        </Button>
        <Button
          type="button"
          onClick={() => {
            setActiveView("register");
            setIsRegisterOpen(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Opportunity
        </Button>
      </PageHeader>

      {submittedId && (
        <Card className="mb-6 border-success/40 bg-success/5">
          <CardContent className="flex items-center justify-between gap-4 pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="font-medium">{publishToBums ? "Opportunity published to Bums" : "Opportunity saved as draft"}</p>
                <p className="text-sm text-muted-foreground">
                  {publishToBums ? "The opportunity is live and available for Bum matching." : "Publish it from the pipeline when it is ready for Bum matching."}
                </p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link to="/client/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <Card>
          <CardContent className="grid gap-4 pt-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Show opportunities</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Switch between pipeline, Bum-originated opportunities, and Bum responses.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {([
                  { value: "pipeline", label: "Pipeline", count: opportunities.length },
                  { value: "bum-originated", label: "Bum-Originated", count: bumOriginatedOpportunities.length },
                  { value: "responses", label: "Bum Responses", count: pendingTargetResponseCount },
                ] satisfies Array<{ value: OpportunityViewFilter; label: string; count: number }>).map((filter) => (
                  <Button
                    key={filter.value}
                    type="button"
                    variant={activeView === filter.value ? "default" : "outline"}
                    className={cn("justify-start gap-2", activeView === filter.value ? "" : "bg-background")}
                    onClick={() => setActiveView(filter.value)}
                  >
                    <span>{filter.label}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        activeView === filter.value ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {filter.count}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Button type="button" variant={activeView === "import" ? "default" : "outline"} onClick={() => setActiveView("import")}>
                <FileUp className="mr-2 h-4 w-4" />
                Bulk Import
              </Button>
              <Button
                type="button"
                variant={activeView === "register" ? "default" : "outline"}
                onClick={() => {
                  setActiveView("register");
                  setIsRegisterOpen(true);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                New Opportunity
              </Button>
            </div>
          </CardContent>
        </Card>


        {activeView === "bum-originated" ? (
          <>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(240px,0.8fr)] md:items-end">
                <div className="relative min-w-0">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={bumOriginatedQuery}
                    onChange={(event) => setBumOriginatedQuery(event.target.value)}
                    placeholder="Search Bum-Originated opportunities, Customers, or needs"
                    className="pl-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={bumOriginatedTypeFilter} onValueChange={(value: BumOriginatedTypeFilter) => setBumOriginatedTypeFilter(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bumOriginatedTypeFilters.map((filter) => (
                        <SelectItem key={filter.value} value={filter.value}>
                          {filter.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {bumOriginatedOpportunities.map((opportunity) => (
              <Card key={opportunity.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-lg font-bold">{opportunity.customer_company_name}</p>
                        <StatusBadge label={opportunityOriginLabel("BUM_ORIGINATED")} variant="secondary" />
                        <StatusBadge label={opportunityStageLabel(stageFromReverseOpportunityStatus(opportunity.status))} variant="info" />
                        <StatusBadge label={opportunity.status.replaceAll("_", " ")} variant={reverseOpportunityVariant(opportunity.status)} />
                        <StatusBadge
                          label={opportunity.client_mode === "EXISTING_CLIENT" ? "Existing Client" : "Client Prospect"}
                          variant="secondary"
                        />
                      </div>
                      <p className="max-w-3xl text-sm text-muted-foreground">{opportunity.customer_need_summary}</p>
                      <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                        <p className="inline-flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          {opportunity.expected_product_service ?? "Solution fit pending"}
                        </p>
                        <p className="inline-flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {opportunity.estimated_deal_value ? `$${Number(opportunity.estimated_deal_value).toLocaleString()} expected` : "Value pending"}
                        </p>
                        <p className="inline-flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Decision-maker: {opportunity.vendor_contact_name ?? "Pending"}{opportunity.vendor_contact_title ? ` · ${opportunity.vendor_contact_title}` : ""}
                        </p>
                        <p className="inline-flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Customer contact: {opportunity.customer_contact_name ?? "Not provided"}
                        </p>
                      </div>
                      {opportunity.notes ? <p className="text-sm">{opportunity.notes}</p> : null}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Submitted {formatDateForTimeZone(opportunity.created_at, timeZone)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {!bumOriginatedOpportunities.length ? (
              <Card>
                <CardContent className="pt-6 text-sm text-muted-foreground">
                  {bumOriginatedQueryResult.data?.length
                    ? "No Bum-Originated opportunities match your current filters."
                    : "No Bum-Originated opportunities are targeting your company yet."}
                </CardContent>
              </Card>
            ) : null}
          </div>
          </>
        ) : null}

        {activeView === "responses" ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Bum responses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedTargetResponses.map((response) => {
                const isLinked = linkedTargetResponseId === response.id;
                const selectedPlanId = responsePayProgramIds[response.id] ?? "";
                const targetName = response.customer_targets?.target_companies?.name ?? response.customer_targets?.target_account_name ?? "Target account";
                const canAct = response.status === "PROPOSED";

                return (
                  <div key={response.id} className={"rounded-md border p-4 " + (isLinked ? "border-primary/50 bg-primary/5" : "")}>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge label={opportunityOriginLabel("BUM_ORIGINATED")} variant="secondary" />
                          <StatusBadge label={opportunityStageLabel(stageFromTargetResponseStatus(response.status))} variant="info" />
                          <StatusBadge label={response.status === "PROPOSED" ? "Awaiting client approval" : response.status.replaceAll("_", " ")} variant={response.status === "PROPOSED" ? "warning" : response.status === "ACCEPTED" ? "success" : response.status === "DECLINED" ? "destructive" : "info"} />
                          <StatusBadge label={response.relationship_strength.replaceAll("_", " ")} variant="secondary" />
                        </div>
                        <div>
                          <p className="font-medium">{targetName}</p>
                          <p className="text-sm text-muted-foreground">
                            {response.profiles?.full_name ?? response.profiles?.email ?? "A Bum"} knows {response.contact_name}
                            {response.contact_email ? " · " + response.contact_email : ""}
                          </p>
                          <p className="text-xs text-muted-foreground">Submitted {formatDateForTimeZone(response.created_at, timeZone)}</p>
                        </div>
                        {response.note ? <p className="text-sm">{response.note}</p> : null}
                      </div>
                    </div>

                    {canAct ? (
                      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
                        <div className="space-y-2">
                          <Label>Commission plan</Label>
                          <Select value={selectedPlanId} onValueChange={(value) => setResponsePayProgramIds((current) => ({ ...current, [response.id]: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose plan for the formal opportunity" />
                            </SelectTrigger>
                            <SelectContent>
                              {payPrograms.map((plan) => (
                                <SelectItem key={plan.id} value={plan.id}>
                                  {plan.name} · {commissionScheduleSummary(plan)} · {plan.approval_status.toLowerCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          disabled={!selectedPlanId || formalizeResponseMutation.isPending}
                          onClick={() => formalizeResponseMutation.mutate({ response, payProgramId: selectedPlanId })}
                        >
                          Approve and formalize
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={rejectResponseMutation.isPending}
                          onClick={() => rejectResponseMutation.mutate(response)}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : response.opportunity_registration_id ? (
                      <div className="mt-4">
                        <Button asChild variant="outline" size="sm">
                          <Link to="/client/opportunities">View opportunity</Link>
                        </Button>
                      </div>
                    ) : null}
                  </div>
                );
              })}

              {!sortedTargetResponses.length ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No Bums have submitted relationship responses for this company's opportunities yet.
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {activeView === "import" ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <FileUp className="h-5 w-5 text-primary" />
                Bulk opportunity tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">How this works</p>
            <p className="mt-2">
              Use one Customer column: <span className="font-mono text-xs">customer_name</span>. Set <span className="font-mono text-xs">status</span> to <span className="font-mono text-xs">Draft</span> for private rows or <span className="font-mono text-xs">Published</span> for rows Bums can see.
            </p>
            <p className="mt-2 font-mono text-xs break-all">
              customer_name, status, commission_plan, business_unit, expected_product_service, estimated_deal_value, expected_timeline, client_contact, trusted_bums_contact, opportunity_description, notes
            </p>
            <p className="mt-2">
              For bulk updates, export current opportunities first. Claimed opportunities cannot change Customer name, scope, Published/Draft status, or commission plan.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={downloadOpportunityTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
            <Button type="button" variant="outline" onClick={exportOpportunityRows} disabled={!opportunities.length}>
              <Download className="mr-2 h-4 w-4" />
              Export for Bulk Update
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-[240px_minmax(0,1fr)] md:items-end">
            <div className="space-y-2">
              <Label>Bulk action</Label>
              <Select
                value={bulkMode}
                onValueChange={(value: OpportunityBulkMode) => {
                  setBulkMode(value);
                  setBulkResult(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create">Create new opportunities</SelectItem>
                  <SelectItem value="update">Bulk update existing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              {bulkMode === "create"
                ? "Rows without a status default to Published. Use Draft when the opportunity should stay private."
                : "Update rows must include opportunity_id. Export current opportunities, edit allowed fields, then upload that file."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="opportunityImportFile">CSV file</Label>
            <Input
              id="opportunityImportFile"
              type="file"
              accept=".csv"
              onChange={(event) => void loadImportFile(event.target.files?.[0] ?? null)}
            />
          </div>

          {importFileName ? (
            <div className="rounded-xl border p-4">
              <p className="font-medium">{importFileName}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {importRows.length} {importRows.length === 1 ? "row" : "rows"} ready to {bulkMode === "create" ? "create" : "update"}
              </p>
            </div>
          ) : null}

          {importPreviewRows.length ? (
            <div className="rounded-xl border">
              <div className="border-b px-4 py-3">
                <p className="font-medium">Preview</p>
                <p className="text-sm text-muted-foreground">Showing the first {importPreviewRows.length} rows.</p>
              </div>
              <div className="divide-y">
                {importPreviewRows.map((row) => (
                  <div key={`${row.rowNumber}-${row.target_account_name}`} className="grid gap-1 px-4 py-3 md:grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr]">
                    <div>
                      <p className="font-medium">{row.target_account_name}</p>
                      <p className="text-xs text-muted-foreground">CSV row {row.rowNumber}{row.opportunity_id ? ` · ${row.opportunity_id}` : ""}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {row.expected_product_service ?? row.business_unit ?? "No product or business unit provided"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {row.status ?? "Published"}
                    </div>
                    <div className="text-sm text-muted-foreground md:text-right">
                      {row.estimated_deal_value !== null && row.estimated_deal_value !== undefined
                        ? `$${row.estimated_deal_value.toLocaleString()}`
                        : "Deal value TBD"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {bulkResult ? (
            <div className={`rounded-xl border p-4 text-sm ${bulkResult.failures.length ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-success/30 bg-success/10 text-success"}`}>
              <p className="font-medium">{bulkResult.success} completed</p>
              {bulkResult.failures.length ? (
                <div className="mt-2 space-y-1">
                  {bulkResult.failures.slice(0, 5).map((failure) => (
                    <p key={failure}>{failure}</p>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Rows without a Customer name are skipped automatically.
            </p>
            <Button
              type="button"
              variant="outline"
              disabled={!importRows.length || isImporting}
              onClick={() => void importOpportunities()}
            >
              <FileUp className="mr-2 h-4 w-4" />
              {isImporting
                ? bulkMode === "create" ? "Importing..." : "Updating..."
                : `${bulkMode === "create" ? "Import" : "Update"} ${importRows.length} ${importRows.length === 1 ? "opportunity" : "opportunities"}`}
            </Button>
          </div>
        </CardContent>
      </Card>

        ) : null}

        {activeView === "register" ? (
          !isRegisterOpen ? (
            <div className="flex justify-end">
              <Button onClick={() => setIsRegisterOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New opportunity
              </Button>
            </div>
          ) : (
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="font-display">New opportunity</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">Add the customer account and deal context here. Publish when it is ready for Bums to review and match.</p>
                </div>
                <Button type="button" variant="secondary" onClick={() => setIsRegisterOpen(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Close
                </Button>
              </div>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={submitOpportunity}>
            {restoredRegistrationDraftAt ? (
              <div className="rounded-md border border-warning/40 bg-warning/10 p-4 text-sm">
                <p className="font-medium text-warning">Unsaved opportunity draft restored</p>
                <p className="mt-1 text-muted-foreground">
                  We recovered the opportunity registration saved in this browser at {formatDateForTimeZone(restoredRegistrationDraftAt, timeZone)}.
                </p>
              </div>
            ) : null}

            {isRegistrationDraftDirty ? (
              <div className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">
                Unsaved changes are being kept in this browser{localRegistrationDraftSavedAt ? `, last saved at ${formatDateForTimeZone(localRegistrationDraftSavedAt, timeZone)}` : ""}.
              </div>
            ) : null}

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="targetAccount">Customer account name</Label>
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
                <Label htmlFor="clientContact">Your internal contact</Label>
                <Input
                  id="clientContact"
                  value={form.client_contact}
                  onChange={(event) => updateField("client_contact", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tbContact">Trusted Bums owner</Label>
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
                <Label htmlFor="payProgram">Commission structure</Label>
                <Select value={form.pay_program_id} onValueChange={(value) => updateField("pay_program_id", value)}>
                  <SelectTrigger id="payProgram">
                    <SelectValue placeholder="Select a commission plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {payPrograms.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} · {commissionScheduleSummary(plan)} · {plan.approval_status.toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Clients only see commission plans assigned to their own company. Need a new structure? Request it under{" "}
                  <Link to="/client/commission-plans" className="font-medium text-primary hover:underline">
                    Finance &gt; Commission Plans
                  </Link>
                  .
                </p>
                <p className="text-xs text-muted-foreground">
                  The commission schedule starts when the first commission is paid to Trusted Bums. Until then, the system treats payments as Year 1.
                </p>
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
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={4} value={form.notes} onChange={(event) => updateField("notes", event.target.value)} />
            </div>

            <label className="flex items-start gap-3 rounded-lg border bg-muted/20 p-4 text-sm">
              <Checkbox
                checked={publishToBums}
                onCheckedChange={(checked) => setPublishToBums(checked === true)}
                className="mt-0.5"
              />
              <span>
                <span className="block font-medium text-foreground">Publish to Bums now</span>
                <span className="mt-1 block text-muted-foreground">
                  Published opportunities are visible for Bum matching. Leave this unchecked to save a private draft in the pipeline.
                </span>
              </span>
            </label>

            <div className="sticky bottom-3 z-10 flex justify-end rounded-lg border bg-background/95 p-3 shadow-sm backdrop-blur">
              <Button disabled={isSubmitting}>
                <Send className="mr-2 h-4 w-4" />
                {publishToBums ? "Publish Opportunity to Bums" : "Save Draft Opportunity"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
          )

        ) : null}

        {activeView === "pipeline" ? (
          <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Open pipeline</p>
                <p className="font-display mt-1 text-3xl font-bold">{openPipelineCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Estimated value</p>
                <p className="font-display mt-1 text-3xl font-bold">{formatMoney(totalPipelineValue)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Published to Bums</p>
                <p className="font-display mt-1 text-3xl font-bold">{acceptedCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="font-display mt-1 text-3xl font-bold">{draftCount}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="font-display">Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Opportunity</TableHead>
                    <TableHead>Origin / Stage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Next Step</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Assigned Bum</TableHead>
                    <TableHead>Commission Plan</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleOpportunities.map((opportunity) => {
                    const opportunityClaims = claimsByOpportunity.get(opportunity.id) ?? [];
                    const assignedClaim = getAssignedClaim(opportunityClaims);
                    const hasClaim = opportunityClaims.length > 0;
                    const isLinkedClaim = Boolean(linkedClaimId && opportunityClaims.some((claim) => claim.id === linkedClaimId));
                    const plan = opportunity.client_pay_programs;

                    return (
                      <TableRow key={opportunity.id} className={isLinkedClaim ? "bg-primary/5" : ""}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{opportunity.target_account_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {opportunity.expected_product_service ?? opportunity.business_unit ?? "No product or business unit set"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            <StatusBadge label={opportunityOriginLabel("CLIENT_ORIGINATED")} variant="secondary" />
                            <StatusBadge label={opportunityStageLabel(stageFromRegistrationStatus(opportunity.status))} variant="info" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge label={opportunity.status} variant={registrationVariant(opportunity.status)} />
                          {opportunity.status === "Accepted" ? (
                            <p className="mt-1 text-xs text-muted-foreground">Published to Bums</p>
                          ) : opportunity.status === "Draft" ? (
                            <p className="mt-1 text-xs text-muted-foreground">Private draft</p>
                          ) : null}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatDateForTimeZone(opportunity.updated_at ?? opportunity.created_at, timeZone)}
                        </TableCell>
                        <TableCell>{nextStepForOpportunity(opportunity, assignedClaim)}</TableCell>
                        <TableCell className="font-medium">{formatMoney(opportunity.estimated_deal_value)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p>{bumName(assignedClaim)}</p>
                            {assignedClaim ? <p className="text-xs text-muted-foreground">{assignedClaim.status.replaceAll("_", " ").toLowerCase()}</p> : null}
                            {claimDecisionSummary(assignedClaim) ? (
                              <p className="max-w-[18rem] text-xs text-destructive">{claimDecisionSummary(assignedClaim)}</p>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p>{plan?.name ?? "No plan"}</p>
                            {plan ? <StatusBadge label={plan.approval_status.toLowerCase()} variant={approvalVariant(plan.approval_status)} /> : null}
                          </div>
                        </TableCell>
                        <TableCell>{opportunity.client_contact ?? opportunity.trusted_bums_contact ?? "Client team"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setDetailsOpportunityId((current) => (current === opportunity.id ? null : opportunity.id))}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Details
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => startEditing(opportunity)}>
                              Edit
                            </Button>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex" tabIndex={hasClaim ? 0 : undefined}>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive hover:text-destructive disabled:text-muted-foreground"
                                    disabled={hasClaim || deleteOpportunityMutation.isPending}
                                    onClick={() => {
                                      if (window.confirm(`Delete ${opportunity.target_account_name}? This cannot be undone.`)) {
                                        deleteOpportunityMutation.mutate(opportunity);
                                      }
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              {hasClaim ? (
                                <TooltipContent side="left" className="max-w-xs">
                                  Cannot be deleted because Claim exists.
                                </TooltipContent>
                              ) : null}
                            </Tooltip>
                            {opportunity.status === "Draft" ? (
                              <Button
                                type="button"
                                size="sm"
                                disabled={publishOpportunityMutation.isPending}
                                onClick={() => publishOpportunityMutation.mutate(opportunity)}
                              >
                                Publish to Bums
                              </Button>
                            ) : null}
                            {assignedClaim?.status === "PROPOSED" ? (
                              <div className={`grid w-64 gap-2 rounded-md border p-2 text-left ${isLinkedClaim ? "border-primary/50 bg-primary/10" : "bg-muted/20"}`}>
                                <p className="text-xs font-medium">Claim decision</p>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    disabled={claimDecisionMutation.isPending}
                                    onClick={() => claimDecisionMutation.mutate({ claim: assignedClaim, decision: "APPROVED" })}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={claimDecisionMutation.isPending}
                                    onClick={() => {
                                      const reason = claimDeclineReasonById[assignedClaim.id] ?? "ALREADY_CONNECTED";
                                      claimDecisionMutation.mutate({
                                        claim: assignedClaim,
                                        decision: "DECLINED",
                                        declineReason: reason,
                                        declineNote: claimDeclineNoteById[assignedClaim.id],
                                      });
                                    }}
                                  >
                                    Decline
                                  </Button>
                                </div>
                                <Select
                                  value={claimDeclineReasonById[assignedClaim.id] ?? "ALREADY_CONNECTED"}
                                  onValueChange={(value: OpportunityClaimDeclineReason) =>
                                    setClaimDeclineReasonById((current) => ({ ...current, [assignedClaim.id]: value }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {claimDeclineReasons.map((reason) => (
                                      <SelectItem key={reason.value} value={reason.value}>
                                        {reason.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Textarea
                                  rows={2}
                                  value={claimDeclineNoteById[assignedClaim.id] ?? ""}
                                  onChange={(event) =>
                                    setClaimDeclineNoteById((current) => ({ ...current, [assignedClaim.id]: event.target.value }))
                                  }
                                  placeholder="Optional detail for the Bum"
                                />
                              </div>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {detailsOpportunity ? (
                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                    <div>
                      <CardTitle className="font-display text-lg">{detailsOpportunity.target_account_name}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {detailsOpportunity.expected_product_service ?? detailsOpportunity.business_unit ?? "No product or business unit set"}
                      </p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setDetailsOpportunityId(null)} aria-label="Close opportunity details">
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 text-sm md:grid-cols-3">
                      <div className="rounded-md border bg-background/70 p-3">
                        <p className="text-muted-foreground">Status</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          <StatusBadge label={detailsOpportunity.status} variant={registrationVariant(detailsOpportunity.status)} />
                          <StatusBadge label={opportunityStageLabel(stageFromRegistrationStatus(detailsOpportunity.status))} variant="info" />
                        </div>
                      </div>
                      <div className="rounded-md border bg-background/70 p-3">
                        <p className="text-muted-foreground">Estimated value</p>
                        <p className="mt-1 font-medium">{formatMoney(detailsOpportunity.estimated_deal_value)}</p>
                      </div>
                      <div className="rounded-md border bg-background/70 p-3">
                        <p className="text-muted-foreground">Last activity</p>
                        <p className="mt-1 font-medium">{formatDateForTimeZone(detailsOpportunity.updated_at ?? detailsOpportunity.created_at, timeZone)}</p>
                      </div>
                      <div className="rounded-md border bg-background/70 p-3">
                        <p className="text-muted-foreground">Business unit</p>
                        <p className="mt-1 font-medium">{detailsOpportunity.business_unit ?? "Not specified"}</p>
                      </div>
                      <div className="rounded-md border bg-background/70 p-3">
                        <p className="text-muted-foreground">Expected timeline</p>
                        <p className="mt-1 font-medium">{detailsOpportunity.expected_timeline ?? "Not specified"}</p>
                      </div>
                      <div className="rounded-md border bg-background/70 p-3">
                        <p className="text-muted-foreground">Owner</p>
                        <p className="mt-1 font-medium">{detailsOpportunity.client_contact ?? detailsOpportunity.trusted_bums_contact ?? "Client team"}</p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-md border bg-background/70 p-4">
                        <p className="font-medium">Opportunity description</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {detailsOpportunity.opportunity_description ?? "No opportunity description has been provided yet."}
                        </p>
                      </div>
                      <div className="rounded-md border bg-background/70 p-4">
                        <p className="font-medium">Commission plan</p>
                        {detailsOpportunity.client_pay_programs ? (
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <p>{detailsOpportunity.client_pay_programs.name}</p>
                            <p>{commissionScheduleSummary(detailsOpportunity.client_pay_programs)}</p>
                            <StatusBadge label={detailsOpportunity.client_pay_programs.approval_status.toLowerCase()} variant={approvalVariant(detailsOpportunity.client_pay_programs.approval_status)} />
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-muted-foreground">No commission plan selected.</p>
                        )}
                      </div>
                      <div className="rounded-md border bg-background/70 p-4">
                        <p className="font-medium">Notes</p>
                        <p className="mt-2 text-sm text-muted-foreground">{detailsOpportunity.notes ?? "No notes yet."}</p>
                      </div>
                      <div className="rounded-md border bg-background/70 p-4">
                        <p className="font-medium">Claim activity</p>
                        {detailsOpportunityClaims.length ? (
                          <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                            <p>{detailsOpportunityClaims.length} claim{detailsOpportunityClaims.length === 1 ? "" : "s"} connected to this opportunity.</p>
                            <p>Assigned Bum: {bumName(detailsAssignedClaim)}</p>
                            {detailsAssignedClaim ? <StatusBadge label={detailsAssignedClaim.status.replaceAll("_", " ").toLowerCase()} variant="secondary" /> : null}
                            {claimDecisionSummary(detailsAssignedClaim) ? <p className="text-destructive">{claimDecisionSummary(detailsAssignedClaim)}</p> : null}
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-muted-foreground">No Bum claims yet.</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {editingOpportunityId ? (
                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="font-display text-lg">Edit opportunity</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="pipeline-edit-value">Estimated value</Label>
                      <Input
                        id="pipeline-edit-value"
                        type="number"
                        min="0"
                        step="1000"
                        value={editEstimatedDealValue}
                        onChange={(event) => setEditEstimatedDealValue(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pipeline-edit-plan">Commission plan</Label>
                      <Select value={editPayProgramId} onValueChange={setEditPayProgramId} disabled={editingOpportunityHasClaim}>
                        <SelectTrigger id="pipeline-edit-plan">
                          <SelectValue placeholder="Select a plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {payPrograms.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.name} · {commissionScheduleSummary(plan)} · {plan.approval_status.toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {editingOpportunityHasClaim ? (
                        <p className="text-xs text-muted-foreground">
                          Commission plan is locked because this opportunity already has a claim.
                        </p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pipeline-edit-timeline">Expected timeline</Label>
                      <Input id="pipeline-edit-timeline" value={editExpectedTimeline} onChange={(event) => setEditExpectedTimeline(event.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="pipeline-edit-notes">Notes</Label>
                      <Textarea id="pipeline-edit-notes" rows={3} value={editNotes} onChange={(event) => setEditNotes(event.target.value)} />
                    </div>
                    <div className="flex justify-end gap-2 md:col-span-2">
                      <Button type="button" variant="outline" onClick={() => setEditingOpportunityId(null)}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={() => void saveOpportunityEdit()} disabled={isSavingEdit}>
                        {isSavingEdit ? "Saving..." : "Save changes"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              <PaginationControls page={registeredPage} pageSize={REGISTERED_OPPORTUNITIES_PAGE_SIZE} totalItems={opportunities.length} onPageChange={setRegisteredPage} />

              {!opportunities.length ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No opportunities yet. Add a customer account here, then publish it to Bums when it is ready for matching.
                </div>
              ) : null}
            </CardContent>
          </Card>
          </>
        ) : null}

      </div>
    </div>
  );
}
