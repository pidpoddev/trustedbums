import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Download, FilePlus, ShieldCheck, Target } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { ContactSubmissionsPanel } from "@/components/admin/ContactSubmissionsPanel";
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
import { useToast } from "@/hooks/use-toast";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import { ACTIVE_TERMS_CHANGE_SUMMARY, PARTNER_FAQ_BODY, PARTNER_TERMS_BODY } from "@/data/partnerTerms";
import {
  activateTermsVersion,
  createTermsVersion,
  getAdminDashboardSummary,
  listAuditEvents,
  listAdminProspectRecommendations,
  listClerkAdminUsers,
  listCompanies,
  listCustomerTargets,
  listOpportunityRegistrations,
  listProfiles,
  listTermsAcceptances,
  listTermsVersions,
  REGISTRATION_STATUSES,
  updateOpportunityRegistration,
  type OpportunityRegistration,
  type RegistrationStatus,
  type TermsVersion,
  type ClerkAdminUserRecord,
  type ProfileRecord,
} from "@/lib/portalApi";
import { formatDateForTimeZone, formatDateTimeForTimeZone } from "@/lib/timezone";

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  if (!rows.length) {
    return;
  }

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}


interface AdminDashboardUserRow {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  companyName: string | null;
}

function profileToDashboardUser(profile: ProfileRecord): AdminDashboardUserRow {
  return {
    id: profile.id,
    name: profile.full_name,
    email: profile.email,
    role: profile.is_admin ? "ADMIN" : profile.role,
    companyName: profile.companies?.name ?? null,
  };
}

function clerkUserToDashboardUser(user: ClerkAdminUserRecord): AdminDashboardUserRow {
  return {
    id: user.id ?? user.email,
    name: user.name,
    email: user.email,
    role: user.metadata.role ?? (user.profile?.isAdmin ? "ADMIN" : user.profile?.role ?? null),
    companyName: user.metadata.companyName ?? user.profile?.companyName ?? null,
  };
}

function getStatusVariant(status: RegistrationStatus) {
  if (status === "Accepted" || status === "Closed Won") {
    return "success" as const;
  }
  if (status === "Disputed" || status === "Rejected" || status === "Closed Lost") {
    return "destructive" as const;
  }
  if (status === "Needs Clarification" || status === "Draft") {
    return "warning" as const;
  }
  return "info" as const;
}

function OpportunityAdminRow({ opportunity }: { opportunity: OpportunityRegistration }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RegistrationStatus>(opportunity.status);
  const [commissionRate, setCommissionRate] = useState(String(opportunity.commission_rate));
  const [commissionDuration, setCommissionDuration] = useState(opportunity.commission_duration);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateOpportunityRegistration(user!, opportunity, {
        status,
        commission_rate: Number(commissionRate || opportunity.commission_rate),
        commission_duration: commissionDuration,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-opportunities"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-audit-events"] });
      toast({ title: "Opportunity updated", description: "Status and commission terms were saved." });
    },
    onError: (error) => {
      toast({
        title: "Unable to update opportunity",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <TableRow>
      <TableCell>
        <p className="font-medium">{opportunity.target_account_name}</p>
        <p className="text-xs text-muted-foreground">{opportunity.companies?.name ?? "Company pending"}</p>
      </TableCell>
      <TableCell>
        <StatusBadge label={opportunity.status} variant={getStatusVariant(opportunity.status)} />
      </TableCell>
      <TableCell className="min-w-[170px]">
        <Select value={status} onValueChange={(value) => setStatus(value as RegistrationStatus)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REGISTRATION_STATUSES.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="min-w-[120px]">
        <Input value={commissionRate} onChange={(event) => setCommissionRate(event.target.value)} type="number" />
      </TableCell>
      <TableCell className="min-w-[260px]">
        <Textarea rows={2} value={commissionDuration} onChange={(event) => setCommissionDuration(event.target.value)} />
      </TableCell>
      <TableCell>
        <Button size="sm" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
          Save
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function AdminDashboard() {
  const timeZone = useUserTimeZone();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("All");
  const [newTerms, setNewTerms] = useState({
    version: "",
    title: "Trusted Bums Client Agreement",
    body: PARTNER_TERMS_BODY,
    faq_body: PARTNER_FAQ_BODY,
    change_summary: ACTIVE_TERMS_CHANGE_SUMMARY,
    is_active: "false",
  });

  const summaryQuery = useQuery({ queryKey: ["admin-dashboard-summary"], queryFn: getAdminDashboardSummary, enabled: user?.role === "ADMIN", retry: 1 });
  const companiesQuery = useQuery({ queryKey: ["admin-companies"], queryFn: () => listCompanies({ includeInactive: true }) });
  const profilesQuery = useQuery({ queryKey: ["admin-profiles"], queryFn: listProfiles });
  const clerkUsersQuery = useQuery({
    queryKey: ["admin-clerk-users-summary"],
    queryFn: () => listClerkAdminUsers({ limit: 100 }),
    enabled: user?.role === "ADMIN",
    staleTime: 60_000,
    retry: 1,
  });
  const acceptancesQuery = useQuery({ queryKey: ["admin-terms-acceptances"], queryFn: listTermsAcceptances });
  const termsQuery = useQuery({ queryKey: ["admin-terms-versions"], queryFn: listTermsVersions });
  const auditQuery = useQuery({ queryKey: ["admin-audit-events"], queryFn: listAuditEvents });
  const clientProspectsQuery = useQuery({
    queryKey: ["admin-prospect-recommendations"],
    queryFn: listAdminProspectRecommendations,
  });
  const customerTargetsQuery = useQuery({
    queryKey: ["admin-customer-targets"],
    queryFn: () => listCustomerTargets(null, { includeDisabled: true }),
  });
  const opportunitiesQuery = useQuery({
    queryKey: ["admin-opportunities", statusFilter],
    queryFn: () => listOpportunityRegistrations(statusFilter),
  });


  const createTermsMutation = useMutation({
    mutationFn: () =>
      createTermsVersion(user!, {
        version: newTerms.version,
        title: newTerms.title,
        body: newTerms.body,
        faq_body: newTerms.faq_body,
        change_summary: newTerms.change_summary,
        is_active: newTerms.is_active === "true",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-terms-versions"] });
      await queryClient.invalidateQueries({ queryKey: ["active-terms-version"] });
      toast({ title: "Agreement version created", description: "The Client Agreement library was updated." });
      setNewTerms((current) => ({ ...current, version: "" }));
    },
    onError: (error) => {
      toast({
        title: "Unable to create terms version",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const activateMutation = useMutation({
    mutationFn: (terms: TermsVersion) => activateTermsVersion(user!, terms),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-terms-versions"] });
      await queryClient.invalidateQueries({ queryKey: ["active-terms-version"] });
      toast({ title: "Terms activated", description: "Clients will accept this version before portal access." });
    },
  });

  const companies = companiesQuery.data ?? [];
  const profiles = profilesQuery.data ?? [];
  const clerkUsers = clerkUsersQuery.data ?? [];
  const useClerkUsers = clerkUsersQuery.isSuccess;
  const dashboardUsers = useClerkUsers ? clerkUsers.map(clerkUserToDashboardUser) : profiles.map(profileToDashboardUser);
  const userCount = useClerkUsers && clerkUsers.length >= 100 ? "100+" : dashboardUsers.length;
  const userCountSubtitle = useClerkUsers ? "From Clerk" : "Synced profiles";
  const acceptances = acceptancesQuery.data ?? [];
  const clientProspects = clientProspectsQuery.data ?? [];
  const customerTargets = customerTargetsQuery.data ?? [];
  const summary = summaryQuery.data;
  const clientProspectsCount = summary ? Number(summary.prospect_recommendations_count) : clientProspects.length;
  const customerTargetsCount = summary ? Number(summary.customer_targets_count) : customerTargets.length;
  const companiesCount = summary ? Number(summary.companies_count) : companies.length;
  const opportunities = opportunitiesQuery.data ?? [];
  const termsVersions = termsQuery.data ?? [];
  const auditEvents = auditQuery.data ?? [];

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Scan priority queues and jump into the focused admin workspaces." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Companies" value={companiesCount} icon={ShieldCheck} to="/admin/clients" />
        <StatCard title="Users" value={userCount} subtitle={userCountSubtitle} icon={ShieldCheck} to="/admin/troubleshooting" />
        <StatCard title="Client Prospects" value={clientProspectsCount} icon={Building2} to="/admin/clients" />
        <StatCard title="Target Accounts" value={customerTargetsCount} icon={Target} to="/admin/opportunities" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr] mb-8">
        <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
          <CardHeader>
            <CardTitle className="font-display">Priority queues</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <div>
              Use the dashboard for triage. Make detailed edits in the dedicated workspaces so this page stays fast to scan.
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/admin/clients">Client pipeline</Link>
              </Button>
              <Button asChild>
                <Link to="/admin/opportunities">Opportunities</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Operational pulse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Terms Acceptances</span>
              <span className="font-medium">{acceptances.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Registrations</span>
              <span className="font-medium">{opportunities.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="contacts" className="space-y-6">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="terms">Terms Versions</TabsTrigger>
          <TabsTrigger value="acceptances">Acceptances</TabsTrigger>
          <TabsTrigger value="companies">Companies & Users</TabsTrigger>
          <TabsTrigger value="audit">Audit Events</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle className="font-display">Opportunity registrations</CardTitle>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All statuses</SelectItem>
                    {REGISTRATION_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() =>
                    downloadCsv(
                      "trusted-bums-opportunities.csv",
                      opportunities.map((item) => ({
                        id: item.id,
                        company: item.companies?.name,
                        target_account_name: item.target_account_name,
                        status: item.status,
                        commission_rate: item.commission_rate,
                        commission_duration: item.commission_duration,
                        created_at: item.created_at,
                      })),
                    )
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rate %</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opportunities.map((opportunity) => (
                    <OpportunityAdminRow key={opportunity.id} opportunity={opportunity} />
                  ))}
                </TableBody>
              </Table>
              {!opportunities.length ? <EmptyState title="No opportunity registrations" description="New registrations will appear here for quick triage." /> : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <ContactSubmissionsPanel companies={companies} />
        </TabsContent>

        <TabsContent value="terms">
          <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Terms Versions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Version</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {termsVersions.map((terms) => (
                      <TableRow key={terms.id}>
                        <TableCell className="font-medium">{terms.version}</TableCell>
                        <TableCell>{terms.title}</TableCell>
                        <TableCell>
                          <StatusBadge label={terms.is_active ? "Active" : "Inactive"} variant={terms.is_active ? "success" : "outline"} />
                        </TableCell>
                        <TableCell>{formatDateForTimeZone(terms.created_at, timeZone)}</TableCell>
                        <TableCell>
                          {!terms.is_active && (
                            <Button size="sm" variant="outline" onClick={() => activateMutation.mutate(terms)}>
                              Activate
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <FilePlus className="h-5 w-5 text-primary" />
                  New Terms Version
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="termsVersion">Version</Label>
                  <Input
                    id="termsVersion"
                    value={newTerms.version}
                    onChange={(event) => setNewTerms((current) => ({ ...current, version: event.target.value }))}
                    placeholder="1.4"
                  />
                  <p className="text-xs text-muted-foreground">Use 1.1, 1.2, 1.3 style versions for amendments. Reserve a new major version for a full replacement.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="termsTitle">Title</Label>
                  <Input
                    id="termsTitle"
                    value={newTerms.title}
                    onChange={(event) => setNewTerms((current) => ({ ...current, title: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="changeSummary">Change summary</Label>
                  <Textarea
                    id="changeSummary"
                    rows={3}
                    value={newTerms.change_summary}
                    onChange={(event) => setNewTerms((current) => ({ ...current, change_summary: event.target.value }))}
                    placeholder="Summarize what existing users need to know before accepting this version."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="termsBody">Terms body</Label>
                  <Textarea
                    id="termsBody"
                    rows={8}
                    value={newTerms.body}
                    onChange={(event) => setNewTerms((current) => ({ ...current, body: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faqBody">FAQ body</Label>
                  <Textarea
                    id="faqBody"
                    rows={6}
                    value={newTerms.faq_body}
                    onChange={(event) => setNewTerms((current) => ({ ...current, faq_body: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activateNow">Activation</Label>
                  <Select
                    value={newTerms.is_active}
                    onValueChange={(value) => setNewTerms((current) => ({ ...current, is_active: value }))}
                  >
                    <SelectTrigger id="activateNow">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Save inactive</SelectItem>
                      <SelectItem value="true">Activate now</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" disabled={!newTerms.version || createTermsMutation.isPending} onClick={() => createTermsMutation.mutate()}>
                  Create Version
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="acceptances">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display">Terms Acceptance Logs</CardTitle>
              <Button
                variant="outline"
                onClick={() =>
                  downloadCsv(
                    "trusted-bums-terms-acceptances.csv",
                    acceptances.map((item) => ({
                      id: item.id,
                      company: item.companies?.name,
                      user: item.profiles?.email,
                      version: item.terms_versions?.version,
                      accepted_at: item.accepted_at,
                      user_agent: item.user_agent,
                    })),
                  )
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Terms</TableHead>
                    <TableHead>Accepted</TableHead>
                    <TableHead>User Agent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {acceptances.map((acceptance) => (
                    <TableRow key={acceptance.id}>
                      <TableCell>{acceptance.companies?.name ?? "No company"}</TableCell>
                      <TableCell>{acceptance.profiles?.email ?? acceptance.user_id}</TableCell>
                      <TableCell>{acceptance.terms_versions?.version ?? acceptance.terms_version_id}</TableCell>
                      <TableCell>{formatDateTimeForTimeZone(acceptance.accepted_at, timeZone)}</TableCell>
                      <TableCell className="max-w-[320px] truncate">{acceptance.user_agent}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies">
          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.website}</TableCell>
                        <TableCell>{formatDateForTimeZone(company.created_at, timeZone)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display">Users</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Company</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardUsers.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>{profile.name}</TableCell>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell>{profile.role}</TableCell>
                        <TableCell>{profile.companyName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Audit Events</CardTitle>
            </CardHeader>
            <CardContent>
              {auditEvents.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Entity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>{formatDateTimeForTimeZone(event.created_at, timeZone)}</TableCell>
                      <TableCell className="font-medium">{event.event_type}</TableCell>
                      <TableCell>{event.companies?.name}</TableCell>
                      <TableCell>{event.profiles?.email ?? event.user_id}</TableCell>
                      <TableCell>{event.entity_type}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              ) : (
                <EmptyState title="No audit events yet" description="User and system activity will appear here." />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
