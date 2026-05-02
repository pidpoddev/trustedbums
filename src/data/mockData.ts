// Mock data for Trusted Bums UI

export type ClientStatus = "active" | "pending_agreement";
export type BumStatus = "active" | "pending_nda";
export type ClaimStatus = "PROPOSED" | "APPROVED" | "SCHEDULED" | "MEETING_HELD" | "EXPIRED" | "DISPUTED" | "CLOSED";
export type OpportunityStatus = "DRAFT" | "OPEN" | "PAUSED" | "CLOSED";
export type RelationshipStrength = "STRONG" | "MODERATE" | "WEAK";
export type PaymentSource = "MANUAL" | "UPLOAD";
export type PayoutType = "INTRO_COMMISSION" | "REFERRER_OVERRIDE";
export type PayoutStatus = "PENDING" | "APPROVED" | "PAID";
export type TrainingScope = "CLIENT" | "GLOBAL";
export type StatusVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";

const claimStatuses: ClaimStatus[] = ["PROPOSED", "APPROVED", "SCHEDULED", "MEETING_HELD", "EXPIRED", "DISPUTED", "CLOSED"];
const relationshipStrengths: RelationshipStrength[] = ["STRONG", "MODERATE", "WEAK"];

export function isClaimStatus(value: string): value is ClaimStatus {
  return claimStatuses.includes(value as ClaimStatus);
}

export function isRelationshipStrength(value: string): value is RelationshipStrength {
  return relationshipStrengths.includes(value as RelationshipStrength);
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  website: string;
  status: ClientStatus;
  opportunities: number;
  intros: number;
  joinedAt: string;
  industries: string[];
  regions: string[];
  pitch: string;
  icp: string;
}

export interface Bum {
  id: string;
  alias: string;
  name: string;
  email: string;
  status: BumStatus;
  stripeConnected: boolean;
  intros: number;
  earnings: number;
  sponsor: string | null;
}

export interface Opportunity {
  id: string;
  clientId: string;
  client: string;
  title: string;
  status: OpportunityStatus;
  industries: string[];
  regions: string[];
  claims: number;
  meetings: number;
  createdAt: string;
  description: string;
  commission: string;
}

export interface IntroClaim {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  bumAlias: string;
  status: ClaimStatus;
  contact: string;
  company: string;
  strength: RelationshipStrength;
  createdAt: string;
  expiresAt: string;
  note?: string;
}

export interface LiveConversation {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  durationMins: number;
  rsvps: number;
  status: "upcoming" | "completed";
  hasRecording?: boolean;
}

export interface Payment {
  id: string;
  client: string;
  customerKey: string;
  amount: number;
  paidAt: string;
  source: PaymentSource;
  tbRevenue: number;
}

export interface Payout {
  id: string;
  bum: string;
  type: PayoutType;
  amount: number;
  status: PayoutStatus;
  paidAt: string | null;
}

export interface Training {
  id: string;
  title: string;
  scope: TrainingScope;
  client: string | null;
  description: string;
  updatedAt: string;
}

export const mockClients: Client[] = [
  { id: "c1", name: "Sarah Chen", email: "sarah@acmecorp.com", company: "AcmeCorp", website: "acmecorp.com", status: "active", opportunities: 3, intros: 12, joinedAt: "2025-11-15", industries: ["SaaS", "Enterprise"], regions: ["NA", "EMEA"], pitch: "AI-powered revenue intelligence platform helping enterprise sales teams close 30% faster.", icp: "VPs of Sales at 500+ employee SaaS companies." },
  { id: "c2", name: "Marcus Johnson", email: "marcus@bluewave.io", company: "BlueWave Solutions", website: "bluewave.io", status: "active", opportunities: 1, intros: 4, joinedAt: "2025-12-01", industries: ["Healthcare", "Procurement"], regions: ["NA", "APAC"], pitch: "Procurement automation for hospital networks. Saves an average of $2M/year per system.", icp: "Heads of Procurement at multi-site hospital systems." },
  { id: "c3", name: "Elena Rodriguez", email: "elena@novatech.co", company: "NovaTech", website: "novatech.co", status: "pending_agreement", opportunities: 0, intros: 0, joinedAt: "2026-01-20", industries: ["FinTech"], regions: ["NA"], pitch: "Embedded payments infrastructure for vertical SaaS.", icp: "CTOs and Heads of Product at vertical SaaS companies." },
];

export const mockBums: Bum[] = [
  { id: "b1", alias: "Verified Bum #482", name: "Jake Thompson", email: "jake@email.com", status: "active", stripeConnected: true, intros: 8, earnings: 4200, sponsor: "Verified Bum #101" },
  { id: "b2", alias: "Verified Bum #319", name: "Amy Liu", email: "amy@email.com", status: "active", stripeConnected: true, intros: 15, earnings: 7800, sponsor: "Verified Bum #482" },
  { id: "b3", alias: "Verified Bum #755", name: "Carlos Mendez", email: "carlos@email.com", status: "pending_nda", stripeConnected: false, intros: 0, earnings: 0, sponsor: null },
];

export const mockOpportunities: Opportunity[] = [
  { id: "o1", clientId: "c1", client: "AcmeCorp", title: "VP Sales - Enterprise SaaS", status: "OPEN", industries: ["SaaS", "Enterprise"], regions: ["NA", "EMEA"], claims: 5, meetings: 2, createdAt: "2026-01-10", description: "Looking for warm intros to VP Sales / CRO at SaaS companies with 500+ employees actively evaluating revenue intelligence tools.", commission: "20% of Year 1 ACV" },
  { id: "o2", clientId: "c1", client: "AcmeCorp", title: "CTO - FinTech Startups", status: "OPEN", industries: ["FinTech"], regions: ["NA"], claims: 3, meetings: 1, createdAt: "2026-01-15", description: "Seeking technical leaders at Series B+ FinTech startups exploring data infrastructure modernization.", commission: "15% of Year 1 ACV" },
  { id: "o3", clientId: "c2", client: "BlueWave Solutions", title: "Head of Procurement - Healthcare", status: "DRAFT", industries: ["Healthcare"], regions: ["NA", "APAC"], claims: 0, meetings: 0, createdAt: "2026-02-01", description: "Warm intros to procurement leaders at multi-site hospital systems.", commission: "12% of Year 1 ACV" },
];

export const mockIntroClaims: IntroClaim[] = [
  { id: "ic1", opportunityId: "o1", opportunityTitle: "VP Sales - Enterprise SaaS", bumAlias: "Verified Bum #482", status: "MEETING_HELD", contact: "Jennifer Park", company: "CloudScale Inc", strength: "STRONG", createdAt: "2026-01-20", expiresAt: "2026-03-06" },
  { id: "ic2", opportunityId: "o1", opportunityTitle: "VP Sales - Enterprise SaaS", bumAlias: "Verified Bum #319", status: "SCHEDULED", contact: "David Kim", company: "TechForward", strength: "MODERATE", createdAt: "2026-01-25", expiresAt: "2026-03-11" },
  { id: "ic3", opportunityId: "o2", opportunityTitle: "CTO - FinTech Startups", bumAlias: "Verified Bum #482", status: "PROPOSED", contact: "Maria Santos", company: "PayFlow", strength: "STRONG", createdAt: "2026-02-10", expiresAt: "2026-03-27" },
  { id: "ic4", opportunityId: "o1", opportunityTitle: "VP Sales - Enterprise SaaS", bumAlias: "Verified Bum #319", status: "APPROVED", contact: "Robert Chen", company: "DataVault", strength: "MODERATE", createdAt: "2026-02-15", expiresAt: "2026-04-01" },
];

export const mockLiveConversations: LiveConversation[] = [
  { id: "lc1", title: "Q1 Strategy Kickoff", description: "Review new opportunities and client positioning for Q1", startsAt: "2026-02-25T14:00:00Z", durationMins: 45, rsvps: 8, status: "upcoming" },
  { id: "lc2", title: "Intro Best Practices", description: "Share tips for making great introductions", startsAt: "2026-02-20T16:00:00Z", durationMins: 30, rsvps: 12, status: "completed", hasRecording: true },
];

export const mockPayments: Payment[] = [
  { id: "p1", client: "AcmeCorp", customerKey: "CloudScale Inc", amount: 15000, paidAt: "2026-02-01", source: "MANUAL", tbRevenue: 3000 },
  { id: "p2", client: "AcmeCorp", customerKey: "TechForward", amount: 8500, paidAt: "2026-02-10", source: "UPLOAD", tbRevenue: 1700 },
  { id: "p3", client: "BlueWave Solutions", customerKey: "MedCore", amount: 22000, paidAt: "2026-02-15", source: "MANUAL", tbRevenue: 4400 },
];

export const mockPayouts: Payout[] = [
  { id: "po1", bum: "Verified Bum #482", type: "INTRO_COMMISSION", amount: 1500, status: "PAID", paidAt: "2026-02-05" },
  { id: "po2", bum: "Verified Bum #319", type: "INTRO_COMMISSION", amount: 850, status: "APPROVED", paidAt: null },
  { id: "po3", bum: "Verified Bum #482", type: "REFERRER_OVERRIDE", amount: 170, status: "PENDING", paidAt: null },
];

export const mockTrainings: Training[] = [
  { id: "t1", title: "AcmeCorp Product Overview", scope: "CLIENT", client: "AcmeCorp", description: "Complete product walkthrough and key talking points", updatedAt: "2026-01-05" },
  { id: "t2", title: "Introduction Best Practices", scope: "GLOBAL", client: null, description: "How to frame introductions for maximum impact", updatedAt: "2026-01-15" },
  { id: "t3", title: "BlueWave Value Proposition", scope: "CLIENT", client: "BlueWave Solutions", description: "Key differentiators and ICP breakdown", updatedAt: "2026-02-01" },
];

export const mockStats = {
  admin: {
    totalClients: 3,
    totalBums: 3,
    activeOpportunities: 2,
    totalIntros: 12,
    meetingsHeld: 3,
    totalRevenue: 45500,
    tbRevenue: 9100,
    pendingPayouts: 1020,
  },
  client: {
    activeOpportunities: 3,
    totalIntros: 12,
    meetingsScheduled: 2,
    meetingsHeld: 1,
    pendingTerms: 1,
  },
};

export const claimStatusConfig: Record<ClaimStatus, { label: string; variant: StatusVariant }> = {
  PROPOSED: { label: "Proposed", variant: "secondary" },
  APPROVED: { label: "Approved", variant: "info" },
  SCHEDULED: { label: "Scheduled", variant: "warning" },
  MEETING_HELD: { label: "Meeting Held", variant: "success" },
  EXPIRED: { label: "Expired", variant: "destructive" },
  DISPUTED: { label: "Disputed", variant: "destructive" },
  CLOSED: { label: "Closed", variant: "outline" },
};

export const opportunityStatusConfig: Record<OpportunityStatus, { label: string; variant: StatusVariant }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  OPEN: { label: "Open", variant: "success" },
  PAUSED: { label: "Paused", variant: "warning" },
  CLOSED: { label: "Closed", variant: "outline" },
};
