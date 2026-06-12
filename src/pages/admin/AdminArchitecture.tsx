import { Fragment } from "react";
import { ArrowRight, Database, GitBranch, KeyRound, Network, Server, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DiagramColumn {
  title: string;
  subtitle: string;
  accent: string;
  nodes: string[];
}

interface Recommendation {
  id: string;
  priority: string;
  title: string;
  summary: string;
}

const currentColumns: DiagramColumn[] = [
  {
    title: "Users And Clients",
    subtitle: "Public, Admin, Client, Bum, Extension",
    accent: "border-t-sky-500",
    nodes: ["Public visitor", "Admin portal", "Client portal", "Bum portal", "Chrome extension"],
  },
  {
    title: "React / Vite App",
    subtitle: "DreamHost-hosted portal",
    accent: "border-t-emerald-500",
    nodes: ["Public routes", "Protected routes", "Route guards", "portalApi.ts", "Telemetry"],
  },
  {
    title: "Clerk Identity",
    subtitle: "Browser session and admin API",
    accent: "border-t-violet-500",
    nodes: ["Clerk session JWT", "Supabase token handoff", "Profile bootstrap", "Clerk Admin API"],
  },
  {
    title: "Supabase",
    subtitle: "Project vaoqvtxqvbptyxddpoju",
    accent: "border-t-amber-500",
    nodes: ["PostgREST Data API", "Postgres 17 public schema", "RLS on 55 public tables", "24 Edge Functions", "pg_cron + pg_net"],
  },
  {
    title: "External Services",
    subtitle: "Operations and delivery dependencies",
    accent: "border-t-rose-500",
    nodes: ["Microsoft Graph", "Google Analytics", "Turnstile", "GitHub Actions", "DreamHost deploy"],
  },
];

const proposedColumns: DiagramColumn[] = [
  {
    title: "Channels",
    subtitle: "One entry model per caller type",
    accent: "border-t-sky-500",
    nodes: ["Public website", "Trusted Bums portal", "Chrome extension", "Future partner APIs", "Internal jobs"],
  },
  {
    title: "Identity And Access",
    subtitle: "Shared caller verification",
    accent: "border-t-violet-500",
    nodes: ["Clerk session JWT", "Internal credentials", "Partner tokens / future OAuth", "Role matrix"],
  },
  {
    title: "Explicit API Boundary",
    subtitle: "Clear lanes before data access",
    accent: "border-t-emerald-500",
    nodes: ["Public Intake API", "Portal domain APIs", "Versioned Partner API", "Internal Operations API", "Shared auth / CORS / audit"],
  },
  {
    title: "Domain Services",
    subtitle: "Supabase Edge Functions as service layer",
    accent: "border-t-amber-500",
    nodes: ["Identity and team", "Marketplace opportunity", "Partner capture / import", "Finance and commission", "Email / Teams / mailbox"],
  },
  {
    title: "Data And Governance",
    subtitle: "Least-privilege access and proof",
    accent: "border-t-rose-500",
    nodes: ["Explicit Data API grants", "Role-scoped views / RPCs", "Postgres tables with RLS", "Private helper schema", "Contract tests and ADRs"],
  },
];

const recommendations: Recommendation[] = [
  {
    id: "TB-0087",
    priority: "P1",
    title: "Narrow Supabase Data API exposure and helper grants",
    summary: "RLS is enabled on all public tables, but object-level grants remain broad for anon and authenticated roles.",
  },
  {
    id: "TB-0088",
    priority: "P1",
    title: "Define the API boundary for portal and partner integrations",
    summary: "New workflows need an explicit lane: direct Data API, portal domain API, internal operations API, or partner API.",
  },
  {
    id: "TB-0089",
    priority: "P1",
    title: "Catalog Edge Functions as domain services with shared auth controls",
    summary: "The 24 active functions are already the service layer, but caller model, owner, auth, tests, and rollback need one catalog.",
  },
  {
    id: "TB-0090",
    priority: "P2",
    title: "Create a partner integration strategy before external APIs expand",
    summary: "Keep future partner APIs versioned, scoped, audited, rate-limited, and separated from raw Supabase table access.",
  },
  {
    id: "TB-0099",
    priority: "P1",
    title: "Prepare Trusted Bums for a mobile app readiness decision",
    summary: "Decide PWA-first, Capacitor, or Expo/React Native only after mobile auth, API lanes, UX blockers, app-store needs, and QA coverage are proven.",
  },
];

function FlowArrow() {
  return (
    <div className="hidden items-center justify-center px-1 text-muted-foreground xl:flex" aria-hidden="true">
      <ArrowRight className="h-5 w-5" />
    </div>
  );
}

function ArchitectureColumn({ column }: { column: DiagramColumn }) {
  return (
    <div className={`min-h-full rounded-md border border-border bg-card p-4 shadow-sm ${column.accent} border-t-4`}>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold leading-5">{column.title}</h3>
        <p className="text-xs leading-5 text-muted-foreground">{column.subtitle}</p>
      </div>
      <div className="mt-4 space-y-2">
        {column.nodes.map((node) => (
          <div key={node} className="rounded-md border bg-background px-3 py-2 text-sm leading-5">
            {node}
          </div>
        ))}
      </div>
    </div>
  );
}

function ArchitectureFlow({ columns }: { columns: DiagramColumn[] }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[1080px] grid-cols-[1fr_32px_1fr_32px_1fr_32px_1fr_32px_1fr] gap-2">
        {columns.map((column, index) => (
          <Fragment key={column.title}>
            <ArchitectureColumn column={column} />
            {index < columns.length - 1 ? <FlowArrow /> : null}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default function AdminArchitecture() {
  return (
    <div>
      <PageHeader
        title="Architecture"
        description="Current platform shape and proposed boundary model from the Technology Architect Agent baseline."
      />

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Database className="h-4 w-4" />
              Supabase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">55</p>
            <p className="text-xs text-muted-foreground">public tables with RLS enabled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Server className="h-4 w-4" />
              Edge Functions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">24</p>
            <p className="text-xs text-muted-foreground">active functions acting as the service layer</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              Main Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Boundary drift</p>
            <p className="text-xs text-muted-foreground">direct Data API, route guards, Edge APIs, and partner contracts need clearer lanes</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="current">
            <Network className="mr-2 h-4 w-4" />
            Current
          </TabsTrigger>
          <TabsTrigger value="proposed">
            <GitBranch className="mr-2 h-4 w-4" />
            Proposed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <div className="rounded-md border bg-muted/30 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Current Drawing</h2>
                <p className="text-sm text-muted-foreground">The platform works, but responsibilities are spread across browser guards, Clerk tokens, Supabase Data API calls, Edge Functions, and external services.</p>
              </div>
              <Badge variant="outline">Baseline 2026-06-12</Badge>
            </div>
            <ArchitectureFlow columns={currentColumns} />
          </div>
        </TabsContent>

        <TabsContent value="proposed" className="space-y-4">
          <div className="rounded-md border bg-muted/30 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Proposed Drawing</h2>
                <p className="text-sm text-muted-foreground">The proposed model makes caller type, API lane, service owner, data access, and proof requirements explicit before workflows touch the database.</p>
              </div>
              <Badge variant="outline">Target Architecture</Badge>
            </div>
            <ArchitectureFlow columns={proposedColumns} />
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {recommendations.map((recommendation) => (
          <Card key={recommendation.id}>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{recommendation.id}</Badge>
                <Badge variant="outline">{recommendation.priority}</Badge>
              </div>
              <CardTitle className="text-base">{recommendation.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">{recommendation.summary}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-5 w-5" />
            Architecture Decision Records Needed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm leading-6 md:grid-cols-2">
            <p>Supabase Data API exposure policy and default grant posture.</p>
            <p>Portal API lanes for direct Data API, RPC/view, domain Edge API, internal operations API, and partner API.</p>
            <p>Clerk plus Supabase token strategy and regression test coverage.</p>
            <p>Edge Function service catalog with shared auth, CORS, rate limit, audit, owner, and rollback fields.</p>
            <p>Partner integration tiers, versioning, credential model, idempotency, rate limits, and legal/trust gates.</p>
            <p>Cron and mailbox/Teams sync ownership, retry behavior, error handling, and alerting.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
