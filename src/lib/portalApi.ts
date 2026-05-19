import { FALLBACK_TERMS_VERSION, DEFAULT_COMMISSION_DURATION, type TermsFallbackVersion } from "@/data/partnerTerms";
import { getSupabaseAccessToken, supabase, supabasePublishableKey, supabaseUrl } from "@/lib/supabase";
import type { AuthUser } from "@/data/authData";
import { normalizeDateFormat, normalizeTimeZone } from "@/lib/timezone";

export type RegistrationStatus =
  | "Draft"
  | "Submitted"
  | "Accepted"
  | "Disputed"
  | "Closed Won"
  | "Closed Lost"
  | "Rejected"
  | "Needs Clarification";

export const REGISTRATION_STATUSES: RegistrationStatus[] = [
  "Draft",
  "Submitted",
  "Accepted",
  "Disputed",
  "Closed Won",
  "Closed Lost",
  "Rejected",
  "Needs Clarification",
];

export type CompanyRelationshipStage = "PROSPECT" | "INVITED" | "CLIENT" | "INACTIVE";
export type ProspectInviteOwner = "BUM" | "TRUSTED_BUMS";
export type ProspectRecommendationStatus = "PROSPECT" | "INVITED" | "CLIENT" | "CLOSED_LOST";
export type CustomerTargetStatus =
  | "PROSPECT"
  | "QUALIFYING"
  | "INTRO_REQUESTED"
  | "INTRO_IN_PROGRESS"
  | "MEETING_SET"
  | "OPEN_OPPORTUNITY"
  | "CLOSED_WON"
  | "CLOSED_LOST";
export type CustomerTargetPriority = "LOW" | "MEDIUM" | "HIGH";

export interface CompanyRecord {
  id: string;
  name: string;
  website: string | null;
  relationship_stage: CompanyRelationshipStage;
  linkedin_company_url: string | null;
  created_at: string;
}

export interface CompanyDomainRecord {
  id: string;
  company_id: string;
  domain: string;
  is_primary: boolean;
  created_at: string;
}

export interface ProfileRecord {
  id: string;
  company_id: string | null;
  full_name: string | null;
  email: string | null;
  role: string | null;
  is_admin: boolean;
  last_sign_in_at: string | null;
  time_zone: string | null;
  date_format: string | null;
  invited_to_customer_introductions: boolean;
  created_at: string;
  companies?: Pick<CompanyRecord, "id" | "name"> | null;
}

export interface SyncClerkUsersResult {
  synced: Array<{ id: string; email: string; role: "CLIENT" | "BUM"; companyName?: string | null }>;
  skipped: Array<{ id?: string; email?: string; reason: string }>;
}

export type AdminEmailRecipientGroup = "CLIENT_COMPANY" | "ALL_CLIENTS" | "ALL_BUMS" | "BUM_INDUSTRY_MATCH" | "ADMINS" | "CUSTOM";
export type AdminEmailTriggerEvent =
  | "MANUAL"
  | "OPPORTUNITY_CLAIM_CREATED"
  | "OPPORTUNITY_CLAIM_STATUS_CHANGED"
  | "CLIENT_CREATED"
  | "CLIENT_TARGET_CREATED"
  | "CONTACT_SUBMISSION_CREATED";
export type AdminEmailDeliveryStatus = "QUEUED" | "SENT" | "FAILED";
export type AdminEmailCategory =
  | "transactional"
  | "opportunity_updates"
  | "client_alerts"
  | "bum_marketplace_alerts"
  | "admin_announcements"
  | "onboarding"
  | "marketing";

export interface AdminEmailTemplateRecord {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  recipient_group: AdminEmailRecipientGroup;
  trigger_event: AdminEmailTriggerEvent | null;
  subject: string;
  body: string;
  metadata_fields: string[];
  category: AdminEmailCategory;
  reply_to: string | null;
  rate_limit_per_hour: number;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminEmailDeliveryRecord {
  id: string;
  campaign_id: string | null;
  template_id: string | null;
  template_slug: string | null;
  recipient_group: AdminEmailRecipientGroup;
  recipient_profile_id: string | null;
  recipient_email: string;
  subject: string;
  body: string;
  metadata: Record<string, unknown>;
  status: AdminEmailDeliveryStatus;
  category: AdminEmailCategory;
  error: string | null;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  last_engaged_at: string | null;
  engagement_score: number;
  is_test: boolean;
  triggered_by: string;
  created_by: string | null;
  created_at: string;
}

export interface AdminEmailSendInput {
  mode?: "manual" | "action" | "preview" | "test";
  templateId?: string;
  templateSlug?: string;
  recipientGroup?: AdminEmailRecipientGroup;
  recipientEmails?: string[];
  testRecipientEmail?: string;
  subject?: string;
  body?: string;
  metadata?: Record<string, unknown>;
  triggeredBy?: AdminEmailTriggerEvent | "MANUAL" | string;
}

export interface AdminEmailPreviewRecipient {
  email: string;
  name?: string | null;
  suppressed?: boolean;
  suppressionReason?: string;
}

export interface AdminEmailSendResult {
  mode?: "manual" | "action" | "preview" | "test";
  campaignId?: string;
  count?: number;
  suppressed?: number;
  recipients?: AdminEmailPreviewRecipient[];
  sent: number;
  failed: number;
  results: Array<{ email: string; status: "SENT" | "FAILED"; error?: string }>;
}


export interface AdminEmailEngagementSummaryRecord {
  recipient_email: string;
  recipient_profile_id: string | null;
  full_name: string | null;
  role: string | null;
  company_id: string | null;
  company_name: string | null;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  engagement_score: number;
  last_engaged_at: string | null;
}

export interface ProspectRecommendationRecord {
  id: string;
  company_id: string;
  bum_user_id: string;
  invite_owner: ProspectInviteOwner;
  status: ProspectRecommendationStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  companies?: Pick<CompanyRecord, "id" | "name" | "website" | "relationship_stage" | "linkedin_company_url"> | null;
  profiles?: Pick<ProfileRecord, "id" | "full_name" | "email"> | null;
}

export interface ProspectContactRecord {
  id: string;
  company_id: string;
  recommendation_id: string | null;
  full_name: string;
  title: string | null;
  email: string | null;
  linkedin_url: string | null;
  is_primary: boolean;
  created_at: string;
  prospect_recommendations?: Pick<ProspectRecommendationRecord, "id" | "bum_user_id"> | null;
}

export interface ProspectInput {
  company_name: string;
  company_website?: string;
  linkedin_company_url?: string;
  key_contact_name: string;
  key_contact_title?: string;
  key_contact_email?: string;
  key_contact_linkedin_url?: string;
  invite_owner: ProspectInviteOwner;
  notes?: string;
}

export type ReverseOpportunityClientMode = "EXISTING_CLIENT" | "PROSPECT_CLIENT";
export type ReverseOpportunityStatus =
  | "SUBMITTED"
  | "OUTREACH_READY"
  | "CLIENT_CONTACTED"
  | "CLIENT_INTERESTED"
  | "CONVERTED"
  | "CLOSED_LOST";

export interface ReverseOpportunityRecord {
  id: string;
  bum_user_id: string;
  vendor_company_id: string;
  client_mode: ReverseOpportunityClientMode;
  status: ReverseOpportunityStatus;
  vendor_contact_name: string | null;
  vendor_contact_title: string | null;
  vendor_contact_email: string | null;
  vendor_contact_linkedin_url: string | null;
  customer_company_name: string;
  customer_company_website: string | null;
  customer_contact_name: string | null;
  customer_contact_title: string | null;
  customer_contact_email: string | null;
  customer_need_summary: string;
  expected_product_service: string | null;
  estimated_deal_value: number | null;
  expected_timeline: string | null;
  notes: string | null;
  converted_opportunity_registration_id: string | null;
  created_at: string;
  updated_at: string;
  companies?: Pick<CompanyRecord, "id" | "name" | "website" | "relationship_stage" | "linkedin_company_url"> | null;
  profiles?: Pick<ProfileRecord, "id" | "full_name" | "email"> | null;
}

export interface ReverseOpportunityInput {
  client_mode: ReverseOpportunityClientMode;
  vendor_company_id?: string;
  prospect_client_name?: string;
  prospect_client_website?: string;
  prospect_client_linkedin_url?: string;
  vendor_contact_name?: string;
  vendor_contact_title?: string;
  vendor_contact_email?: string;
  vendor_contact_linkedin_url?: string;
  customer_company_name: string;
  customer_company_website?: string;
  customer_contact_name?: string;
  customer_contact_title?: string;
  customer_contact_email?: string;
  customer_need_summary: string;
  expected_product_service?: string;
  estimated_deal_value?: number | null;
  expected_timeline?: string;
  notes?: string;
}

export interface CustomerTargetRecord {
  id: string;
  client_company_id: string;
  target_company_id: string;
  created_by: string;
  status: CustomerTargetStatus;
  priority: CustomerTargetPriority;
  target_account_name: string;
  business_unit: string | null;
  key_contact_name: string | null;
  key_contact_title: string | null;
  key_contact_email: string | null;
  expected_product_service: string | null;
  estimated_deal_value: number | null;
  expected_timeline: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client_companies?: Pick<CompanyRecord, "id" | "name"> | null;
  target_companies?: Pick<CompanyRecord, "id" | "name" | "website" | "linkedin_company_url"> | null;
  profiles?: Pick<ProfileRecord, "id" | "full_name" | "email"> | null;
}

export interface TeamsMeetingAttendeeStatus {
  response?: string | null;
  time?: string | null;
}

export type TeamsMeetingAttendee =
  | string
  | {
      email?: string | null;
      address?: string | null;
      name?: string | null;
      type?: string | null;
      response?: string | null;
      responseTime?: string | null;
      status?: TeamsMeetingAttendeeStatus | null;
    };

export interface TeamsMeetingRecord {
  id: string;
  customer_target_id: string;
  client_company_id: string;
  target_company_id: string;
  opportunity_registration_id: string | null;
  opportunity_claim_id: string | null;
  scheduled_by: string;
  subject: string;
  description: string | null;
  start_time: string;
  end_time: string;
  attendees: TeamsMeetingAttendee[];
  teams_join_url: string | null;
  microsoft_event_id: string | null;
  microsoft_online_meeting_id: string | null;
  microsoft_event_web_link: string | null;
  status: "SCHEDULED" | "CANCELLED" | "COMPLETED";
  transcript_sync_status: "PENDING" | "AVAILABLE" | "FAILED" | "SKIPPED";
  transcript_sync_attempted_at: string | null;
  transcript_sync_error: string | null;
  created_at: string;
  updated_at: string;
  customer_targets?: Pick<CustomerTargetRecord, "id" | "target_account_name" | "key_contact_name" | "key_contact_email"> & {
    client_companies?: Pick<CompanyRecord, "id" | "name"> | null;
    target_companies?: Pick<CompanyRecord, "id" | "name" | "website"> | null;
  };
  profiles?: Pick<ProfileRecord, "id" | "full_name" | "email"> | null;
}

export type MeetingTranscriptSource = "GRAPH" | "MANUAL" | "UPLOAD";
export type MeetingTranscriptStatus = "PENDING" | "AVAILABLE" | "FAILED";

export interface MeetingTranscriptRecord {
  id: string;
  teams_meeting_id: string | null;
  customer_target_id: string | null;
  opportunity_registration_id: string | null;
  opportunity_claim_id: string | null;
  company_id: string | null;
  created_by: string | null;
  source: MeetingTranscriptSource;
  status: MeetingTranscriptStatus;
  title: string;
  transcript_text: string | null;
  transcript_url: string | null;
  content_type: string;
  graph_transcript_id: string | null;
  captured_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  teams_meetings?: Pick<TeamsMeetingRecord, "id" | "subject" | "start_time" | "teams_join_url"> | null;
  opportunity_registrations?: Pick<OpportunityRegistration, "id" | "target_account_name"> | null;
  customer_targets?: Pick<CustomerTargetRecord, "id" | "target_account_name"> | null;
}

export interface MeetingTranscriptInput {
  opportunityRegistrationId?: string | null;
  customerTargetId?: string | null;
  teamsMeetingId?: string | null;
  opportunityClaimId?: string | null;
  companyId?: string | null;
  title?: string;
  transcriptText?: string;
  transcriptUrl?: string;
  source?: MeetingTranscriptSource;
  status?: MeetingTranscriptStatus;
  contentType?: string;
  graphTranscriptId?: string;
  capturedAt?: string;
}

export interface MeetingTranscriptFilters {
  opportunityRegistrationId?: string;
  customerTargetId?: string;
  teamsMeetingId?: string;
}

export interface ScheduleTeamsMeetingInput {
  customerTargetId: string;
  subject?: string;
  description?: string;
  startTime: string;
  durationMinutes: number;
  attendeeEmails: string[];
}

export interface ScheduleTeamsMeetingResponse {
  meeting: TeamsMeetingRecord;
  teamsJoinUrl: string | null;
  eventWebLink: string | null;
  meetingOptionsConfigured?: boolean;
  meetingOptionsWarning?: string | null;
}

export interface SyncTeamsMeetingAttendanceResult {
  updated: Array<{ id: string; attendees: TeamsMeetingAttendee[]; status?: string }>;
  failed: Array<{ id: string; error: string }>;
}

export type CustomerTargetResponseStrength = "warm" | "strong" | "advisor" | "unknown";

export interface CustomerTargetResponseRecord {
  id: string;
  customer_target_id: string;
  client_company_id: string;
  bum_user_id: string;
  contact_name: string;
  contact_email: string | null;
  relationship_strength: CustomerTargetResponseStrength;
  note: string | null;
  status: "PROPOSED" | "ACCEPTED" | "DECLINED" | "CONTACTED" | "MEETING_SET";
  created_at: string;
  updated_at: string;
}

export interface CustomerTargetResponseInput {
  customerTargetId: string;
  contactName: string;
  contactEmail?: string;
  relationshipStrength: CustomerTargetResponseStrength;
  note?: string;
}

export type BumSavedItemType = "CLIENT" | "OPPORTUNITY" | "CUSTOMER_TARGET";

export interface BumSavedItemRecord {
  id: string;
  bum_user_id: string;
  item_type: BumSavedItemType;
  client_company_id: string | null;
  opportunity_registration_id: string | null;
  customer_target_id: string | null;
  created_at: string;
}

export interface BumSavedItemInput {
  itemType: BumSavedItemType;
  itemId: string;
}

export interface CustomerTargetInput {
  target_account_name: string;
  company_website?: string;
  linkedin_company_url?: string;
  business_unit?: string;
  key_contact_name?: string;
  key_contact_title?: string;
  key_contact_email?: string;
  expected_product_service?: string;
  estimated_deal_value?: number | null;
  expected_timeline?: string;
  notes?: string;
  priority?: CustomerTargetPriority;
  status?: CustomerTargetStatus;
}

export interface TermsVersion {
  id: string;
  version: string;
  title: string;
  body: string;
  faq_body: string | null;
  is_active: boolean;
  created_at: string;
}

export interface TermsAcceptance {
  id: string;
  user_id: string;
  company_id: string | null;
  terms_version_id: string;
  accepted_at: string;
  ip_address: string | null;
  user_agent: string | null;
  companies?: Pick<CompanyRecord, "id" | "name"> | null;
  profiles?: Pick<ProfileRecord, "full_name" | "email"> | null;
  terms_versions?: Pick<TermsVersion, "version" | "title"> | null;
}

export interface OpportunityRegistration {
  id: string;
  company_id: string | null;
  created_by: string;
  pay_program_id: string | null;
  commission_schedule_start_at: string | null;
  target_account_name: string;
  business_unit: string | null;
  opportunity_description: string | null;
  client_contact: string | null;
  trusted_bums_contact: string | null;
  expected_product_service: string | null;
  estimated_deal_value: number | null;
  expected_timeline: string | null;
  commission_rate: number;
  commission_duration: string;
  notes: string | null;
  status: RegistrationStatus;
  created_at: string;
  updated_at: string;
  companies?: Pick<CompanyRecord, "name"> | null;
  client_pay_programs?: ClientPayProgramRecord | null;
  profiles?: Pick<ProfileRecord, "full_name" | "email"> | null;
}

export interface OpportunityInput {
  company_id?: string | null;
  pay_program_id?: string | null;
  target_account_name: string;
  business_unit?: string;
  opportunity_description?: string;
  client_contact?: string;
  trusted_bums_contact?: string;
  expected_product_service?: string;
  estimated_deal_value?: number | null;
  expected_timeline?: string;
  commission_rate?: number;
  commission_duration?: string;
  notes?: string;
  status?: RegistrationStatus;
}

export type CompanyAgreementType = "MASTER_SERVICES_AGREEMENT" | "SERVICE_ADDENDUM" | "OTHER";
export type CompanyAgreementStatus = "DRAFT" | "ACTIVE" | "SUPERSEDED" | "TERMINATED";
export type ClientPayProgramApprovalStatus = "APPROVED" | "PENDING" | "DENIED";
export const DEFAULT_BUM_COMMISSION_POOL_PERCENT = 50;

export interface CompanyAgreementRecord {
  id: string;
  company_id: string;
  title: string;
  agreement_type: CompanyAgreementType;
  status: CompanyAgreementStatus;
  effective_date: string | null;
  document_url: string | null;
  summary: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ClientPayProgramRecord {
  id: string;
  company_id: string;
  agreement_id: string | null;
  name: string;
  status: "ACTIVE" | "PAUSED" | "SUPERSEDED";
  approval_status: ClientPayProgramApprovalStatus;
  commission_rate: number;
  year_1_rate: number;
  year_2_rate: number;
  year_3_rate: number;
  year_4_rate: number;
  year_5_rate: number;
  year_6_plus_rate: number;
  commission_period_months: number | null;
  payment_terms: string | null;
  commission_basis: string | null;
  exclusions: string | null;
  notes: string | null;
  requested_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  request_reason: string | null;
  created_at: string;
  updated_at: string;
  companies?: Pick<CompanyRecord, "id" | "name"> | null;
  requested_by_profile?: Pick<ProfileRecord, "id" | "full_name" | "email"> | null;
  reviewed_by_profile?: Pick<ProfileRecord, "id" | "full_name" | "email"> | null;
}

export interface ClientPayProgramRequestInput {
  company_id?: string;
  approval_status?: ClientPayProgramApprovalStatus;
  name: string;
  commission_rate: number;
  year_1_rate: number;
  year_2_rate: number;
  year_3_rate: number;
  year_4_rate: number;
  year_5_rate: number;
  year_6_plus_rate: number;
  commission_period_months?: number | null;
  payment_terms?: string;
  commission_basis?: string;
  exclusions?: string;
  notes?: string;
  request_reason?: string;
}

export type OpportunityClaimStatus = "PROPOSED" | "APPROVED" | "SCHEDULED" | "MEETING_HELD" | "EXPIRED" | "DISPUTED" | "CLOSED";
export type OpportunityClaimStrength = "STRONG" | "MODERATE" | "WEAK";

export interface OpportunityClaimRecord {
  id: string;
  opportunity_registration_id: string;
  company_id: string | null;
  bum_user_id: string;
  bum_share_percent: number;
  share_manually_set: boolean;
  contact_name: string;
  contact_company: string;
  contact_email: string | null;
  relationship_strength: OpportunityClaimStrength;
  note: string | null;
  status: OpportunityClaimStatus;
  expires_at: string;
  created_at: string;
  updated_at: string;
  meeting_locked?: boolean;
  opportunity_registrations?: Pick<
    OpportunityRegistration,
    "id" | "target_account_name" | "commission_rate" | "company_id"
  > & {
    client_pay_programs?: ClientPayProgramRecord | null;
  } | null;
  profiles?: Pick<ProfileRecord, "id" | "full_name" | "email"> | null;
}

export interface OpportunityClaimInput {
  opportunityId: string;
  contactName: string;
  contactCompany: string;
  contactEmail?: string;
  relationshipStrength: OpportunityClaimStrength;
  note?: string;
}

export type CustomerPaymentReportStatus = "REPORTED" | "INVOICE_GENERATED" | "DISPUTED" | "VOID";
export type CustomerPaymentReportSource = "CLIENT" | "ADMIN";

export interface CustomerPaymentReportRecord {
  id: string;
  opportunity_claim_id: string;
  opportunity_registration_id: string;
  company_id: string;
  reported_by: string;
  source: CustomerPaymentReportSource;
  customer_name: string;
  gross_amount: number;
  commissionable_amount: number;
  excluded_amount: number;
  currency: string;
  customer_payment_received_at: string;
  notes: string | null;
  status: CustomerPaymentReportStatus;
  created_at: string;
  updated_at: string;
  opportunity_claims?: Pick<OpportunityClaimRecord, "id" | "contact_name" | "contact_company" | "bum_user_id"> | null;
  opportunity_registrations?: Pick<
    OpportunityRegistration,
    "id" | "target_account_name" | "commission_rate" | "commission_schedule_start_at"
  > & {
    client_pay_programs?: ClientPayProgramRecord | null;
  } | null;
  companies?: Pick<CompanyRecord, "id" | "name"> | null;
  profiles?: Pick<ProfileRecord, "id" | "full_name" | "email"> | null;
}

export interface CustomerPaymentReportInput {
  claimId: string;
  customerName: string;
  grossAmount: number;
  commissionableAmount: number;
  excludedAmount?: number;
  customerPaymentReceivedAt: string;
  notes?: string;
}

export type ClaimInvoiceStatus = "GENERATED" | "SENT" | "PAID" | "VOID";

export interface ClaimInvoiceRecord {
  id: string;
  customer_payment_report_id: string;
  opportunity_claim_id: string;
  opportunity_registration_id: string;
  company_id: string;
  generated_by: string;
  invoice_number: string;
  invoice_amount: number;
  commission_rate: number;
  currency: string;
  status: ClaimInvoiceStatus;
  generated_at: string;
  sent_at: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer_payment_reports?: Pick<CustomerPaymentReportRecord, "id" | "customer_name" | "commissionable_amount" | "customer_payment_received_at"> | null;
  opportunity_claims?: Pick<OpportunityClaimRecord, "id" | "contact_name" | "contact_company" | "bum_user_id"> | null;
  opportunity_registrations?: Pick<OpportunityRegistration, "id" | "target_account_name"> | null;
  companies?: Pick<CompanyRecord, "id" | "name"> | null;
}

export type BumPayoutStatus = "PENDING_ALLOCATION" | "APPROVED" | "PAID" | "VOID";

export interface BumPayoutRecord {
  id: string;
  claim_invoice_id: string;
  opportunity_claim_id: string;
  bum_user_id: string;
  payout_amount: number;
  share_percent: number;
  currency: string;
  status: BumPayoutStatus;
  approved_by: string | null;
  approved_at: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  claim_invoices?: Pick<ClaimInvoiceRecord, "id" | "invoice_number" | "invoice_amount" | "status" | "commission_rate"> | null;
  opportunity_claims?: Pick<OpportunityClaimRecord, "id" | "contact_name" | "contact_company" | "bum_share_percent"> | null;
  profiles?: Pick<ProfileRecord, "id" | "full_name" | "email"> | null;
}

export interface AuditEvent {
  id: string;
  company_id: string | null;
  user_id: string | null;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  event_data: Record<string, unknown> | null;
  created_at: string;
  companies?: Pick<CompanyRecord, "name"> | null;
  profiles?: Pick<ProfileRecord, "full_name" | "email"> | null;
}

export interface TrainingMaterialAttachment {
  id: string;
  training_material_id: string;
  company_id: string | null;
  uploaded_by: string;
  file_name: string;
  file_type: string | null;
  file_size: number;
  storage_bucket: string;
  storage_path: string;
  created_at: string;
}

export interface TrainingMaterial {
  id: string;
  company_id: string | null;
  created_by: string;
  title: string;
  description: string | null;
  technology: string | null;
  resource_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  companies?: Pick<CompanyRecord, "name"> | null;
  profiles?: Pick<ProfileRecord, "full_name" | "email"> | null;
  training_material_attachments?: TrainingMaterialAttachment[];
}

export interface TrainingMaterialInput {
  title: string;
  description?: string;
  technology?: string;
  resource_url?: string;
  is_published?: boolean;
  company_id?: string | null;
  attachments?: File[];
}

export type BumAvailabilityStatus = "open" | "selective" | "unavailable";
export type BumVerificationStatus = "self_reported" | "reviewed" | "verified";

export interface BumProfileRecord {
  user_id: string;
  headline: string | null;
  bio: string | null;
  linkedin_url: string | null;
  years_experience: number | null;
  availability_status: BumAvailabilityStatus;
  home_region: string | null;
  industries: string[];
  regions: string[];
  products_sold: string[];
  buyer_personas: string[];
  worked_with_companies: string[];
  relationship_companies: string[];
  certifications: string[];
  skills: string[];
  notable_wins: string | null;
  verification_status: BumVerificationStatus;
  is_visible_to_clients: boolean;
  last_linkedin_imported_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Pick<ProfileRecord, "full_name" | "email" | "created_at"> | null;
}

export interface BumProfileInput {
  headline?: string;
  bio?: string;
  linkedin_url?: string;
  years_experience?: number | null;
  availability_status?: BumAvailabilityStatus;
  home_region?: string;
  industries?: string[];
  regions?: string[];
  products_sold?: string[];
  buyer_personas?: string[];
  worked_with_companies?: string[];
  relationship_companies?: string[];
  certifications?: string[];
  skills?: string[];
  notable_wins?: string;
  verification_status?: BumVerificationStatus;
  is_visible_to_clients?: boolean;
  last_linkedin_imported_at?: string | null;
}

export interface BumInviteInput {
  email: string;
  name?: string;
  note?: string;
}

export interface BumInviteResult {
  invited: boolean;
  invitationId: string | null;
  status: string | null;
  email: string;
}

interface ImpersonationFunctionProfile {
  id: string;
  email: string | null;
  role: string | null;
}

export interface ImpersonationTicketResponse {
  action: "start" | "stop";
  ticket: string;
  url?: string;
  target?: ImpersonationFunctionProfile;
  actorUserId?: string;
}

const SHARED_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "yahoo.com",
  "ymail.com",
  "rocketmail.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "pm.me",
  "gmx.com",
  "mail.com",
  "zoho.com",
]);

function toNullableString(value?: string) {
  return value?.trim() ? value.trim() : null;
}

function toUniqueTrimmedArray(values?: string[]) {
  return Array.from(
    new Set(
      (values ?? [])
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

function normalizeCompanyName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function normalizeDomain(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().toLowerCase();

  if (!trimmed) {
    return null;
  }

  const withoutProtocol = trimmed.replace(/^https?:\/\//, "");
  const withoutPath = withoutProtocol.split("/")[0] ?? "";
  const withoutWww = withoutPath.replace(/^www\./, "");
  const withoutPort = withoutWww.split(":")[0] ?? "";
  const normalized = withoutPort.replace(/\.$/, "");

  return normalized || null;
}

function getEmailDomain(email?: string | null) {
  if (!email) {
    return null;
  }

  const [, domain = ""] = email.trim().toLowerCase().split("@");
  return normalizeDomain(domain);
}

export function isSharedEmailDomain(domain?: string | null) {
  return Boolean(domain && SHARED_EMAIL_DOMAINS.has(domain));
}

function getBusinessDomainFromEmail(email?: string | null) {
  const domain = getEmailDomain(email);
  return domain && !isSharedEmailDomain(domain) ? domain : null;
}

function normalizeLinkedInCompanyUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const withoutProtocol = trimmed.replace(/^https?:\/\//i, "");
  const withoutQuery = withoutProtocol.split(/[?#]/)[0] ?? "";
  const withoutTrailingSlash = withoutQuery.replace(/\/+$/, "");

  if (!withoutTrailingSlash) {
    return null;
  }

  return `https://${withoutTrailingSlash.toLowerCase()}`;
}

function createInvoiceNumber() {
  const compactDate = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const randomSuffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TB-${compactDate}-${randomSuffix}`;
}

async function getProfileRecord(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*, companies(id, name)")
    .eq("id", userId)
    .maybeSingle<ProfileRecord>();

  if (error) {
    throw error;
  }

  return data;
}

async function getCompanyByDomain(domain: string) {
  const { data, error } = await supabase
    .from("company_domains")
    .select("company_id, companies(*)")
    .eq("domain", domain)
    .limit(1)
    .maybeSingle<{ company_id: string; companies?: CompanyRecord | null }>();

  if (error) {
    throw error;
  }

  if (data?.companies) {
    return data.companies;
  }

  const { data: websiteMatch, error: websiteError } = await supabase
    .from("companies")
    .select("*")
    .eq("website", domain)
    .limit(1)
    .maybeSingle<CompanyRecord>();

  if (websiteError) {
    throw websiteError;
  }

  return websiteMatch;
}

async function getCompanyByLinkedInUrl(linkedinUrl: string) {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("linkedin_company_url", linkedinUrl)
    .limit(1)
    .maybeSingle<CompanyRecord>();

  if (error) {
    throw error;
  }

  return data;
}

async function getCompanyById(companyId: string) {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .limit(1)
    .maybeSingle<CompanyRecord>();

  if (error) {
    throw error;
  }

  return data;
}

async function getCompanyByName(companyName: string) {
  const normalizedName = normalizeCompanyName(companyName);
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .ilike("name", companyName.trim())
    .returns<CompanyRecord[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).find((company) => normalizeCompanyName(company.name) === normalizedName) ?? null;
}

async function upsertCompanyDomain(companyId: string, domain: string, isPrimary = false) {
  const { error } = await supabase.from("company_domains").upsert(
    {
      company_id: companyId,
      domain,
      is_primary: isPrimary,
    },
    { onConflict: "domain" },
  );

  if (error) {
    throw error;
  }
}

async function upsertCompanyDomainBestEffort(companyId: string, domain: string, isPrimary = false) {
  try {
    await upsertCompanyDomain(companyId, domain, isPrimary);
  } catch (error) {
    console.warn("Unable to sync company domain during profile/company bootstrap.", error);
  }
}

async function findExistingCompanyMatch(input: {
  companyName: string;
  companyWebsite?: string | null;
  linkedinCompanyUrl?: string | null;
  email?: string | null;
}) {
  const businessEmailDomain = getBusinessDomainFromEmail(input.email);
  const websiteDomain = normalizeDomain(input.companyWebsite);
  const linkedinUrl = normalizeLinkedInCompanyUrl(input.linkedinCompanyUrl);

  if (websiteDomain) {
    const company = await getCompanyByDomain(websiteDomain);
    if (company) {
      return company;
    }
  }

  if (businessEmailDomain) {
    const company = await getCompanyByDomain(businessEmailDomain);
    if (company) {
      return company;
    }
  }

  if (linkedinUrl) {
    const company = await getCompanyByLinkedInUrl(linkedinUrl);
    if (company) {
      return company;
    }
  }

  return getCompanyByName(input.companyName);
}

async function ensureCompany(input: {
  companyName: string;
  companyWebsite?: string | null;
  linkedinCompanyUrl?: string | null;
  email?: string | null;
  relationshipStage?: CompanyRelationshipStage;
}) {
  const existing = await findExistingCompanyMatch(input);
  const websiteDomain = normalizeDomain(input.companyWebsite);
  const linkedinUrl = normalizeLinkedInCompanyUrl(input.linkedinCompanyUrl);
  const requestedStage = input.relationshipStage ?? "CLIENT";

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("companies")
    .insert({
      name: input.companyName.trim(),
      website: websiteDomain,
      linkedin_company_url: linkedinUrl,
      relationship_stage: requestedStage,
    })
    .select("*")
    .single<CompanyRecord>();

  if (error) {
    throw error;
  }

  if (websiteDomain) {
    await upsertCompanyDomainBestEffort(data.id, websiteDomain, true);
  }

  return data;
}

export async function ensureSupabaseProfileForAuthUser(user: AuthUser) {
  const existing = await getProfileRecord(user.id);
  const company =
    existing?.company_id
      ? await getCompanyById(existing.company_id)
      : user.role === "CLIENT" && user.companyName
        ? await ensureCompany({
            companyName: user.companyName,
            email: user.email,
            relationshipStage: "CLIENT",
          })
        : null;
  const companyId = existing?.company_id ?? company?.id ?? null;

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        company_id: companyId,
        full_name: user.name,
        email: user.email,
        role: user.role,
        is_admin: user.role === "ADMIN",
        last_sign_in_at: new Date().toISOString(),
        time_zone: normalizeTimeZone(user.timeZone),
        date_format: existing?.date_format ?? normalizeDateFormat(user.dateFormat),
      },
      { onConflict: "id" },
    )
    .select("*, companies(id, name)")
    .single<ProfileRecord>();

  if (error) {
    throw error;
  }

  if (user.role === "CLIENT" && data.company_id) {
    const { error: companyUpdateError } = await supabase
      .from("companies")
      .update({ relationship_stage: "CLIENT" })
      .eq("id", data.company_id);

    if (companyUpdateError) {
      throw companyUpdateError;
    }

    const businessDomain = getBusinessDomainFromEmail(user.email);
    if (businessDomain) {
      await upsertCompanyDomainBestEffort(data.company_id, businessDomain, true);
    }
  }

  return data;
}

export async function getOwnProfileSettings(userId: string) {
  return getProfileRecord(userId);
}

export async function listClientIntroductionAttendees(companyId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, invited_to_customer_introductions")
    .eq("company_id", companyId)
    .eq("role", "CLIENT")
    .eq("invited_to_customer_introductions", true)
    .not("email", "is", null)
    .order("full_name", { ascending: true })
    .returns<Array<Pick<ProfileRecord, "id" | "full_name" | "email" | "invited_to_customer_introductions">>>();

  if (error) {
    throw error;
  }

  return data ?? [];
}


export async function updateOwnProfileSettings(
  user: AuthUser,
  input: {
    timeZone?: string;
    dateFormat?: string;
    fullName?: string;
    invitedToCustomerIntroductions?: boolean;
  },
) {
  const payload: Record<string, string | boolean | null> = {};

  if (input.timeZone !== undefined) {
    payload.time_zone = normalizeTimeZone(input.timeZone);
  }

  if (input.dateFormat !== undefined) {
    payload.date_format = normalizeDateFormat(input.dateFormat);
  }

  if (input.fullName !== undefined) {
    payload.full_name = toNullableString(input.fullName);
  }

  if (input.invitedToCustomerIntroductions !== undefined) {
    payload.invited_to_customer_introductions = input.invitedToCustomerIntroductions;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id)
    .select("*, companies(id, name)")
    .single<ProfileRecord>();

  if (error) {
    throw error;
  }

  return data;
}

export async function getActiveTermsVersion() {
  const { data, error } = await supabase
    .from("terms_versions")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<TermsVersion>();

  if (error || !data) {
    return FALLBACK_TERMS_VERSION;
  }

  return data;
}

export async function getTermsVersionByVersion(version: string, fallbackTerms: TermsFallbackVersion) {
  const { data, error } = await supabase
    .from("terms_versions")
    .select("*")
    .eq("version", version)
    .limit(1)
    .maybeSingle<TermsVersion>();

  if (error || !data) {
    return fallbackTerms;
  }

  return data;
}

export async function getCurrentTermsAcceptance(userId: string, companyId: string | undefined, termsVersionId: string) {
  let query = supabase
    .from("terms_acceptances")
    .select("*")
    .eq("user_id", userId)
    .eq("terms_version_id", termsVersionId);

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  const { data, error } = await query.order("accepted_at", { ascending: false }).limit(1).maybeSingle<TermsAcceptance>();

  if (error) {
    throw error;
  }

  return data;
}

function isUuid(value: string | undefined) {
  return Boolean(value?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i));
}

export async function createAuditEvent(
  user: Pick<AuthUser, "id" | "clientId">,
  eventType: string,
  entityType?: string,
  entityId?: string,
  eventData?: Record<string, unknown>,
) {
  const hasUuidEntityId = isUuid(entityId);
  const normalizedEventData = hasUuidEntityId || !entityId ? eventData : { ...(eventData ?? {}), entity_id: entityId };

  const { error } = await supabase.from("audit_events").insert({
    company_id: user.clientId ?? null,
    user_id: user.id,
    event_type: eventType,
    entity_type: entityType ?? null,
    entity_id: hasUuidEntityId ? entityId : null,
    event_data: normalizedEventData ?? {},
  });

  if (error) {
    throw error;
  }
}

export async function acceptPartnerTerms(user: AuthUser, terms: TermsVersion, userAgent: string | null) {
  const existingAcceptance = await getCurrentTermsAcceptance(user.id, user.clientId, terms.id);
  if (existingAcceptance) {
    return existingAcceptance;
  }

  const { data, error } = await supabase
    .from("terms_acceptances")
    .insert({
      user_id: user.id,
      company_id: user.clientId ?? null,
      terms_version_id: terms.id,
      ip_address: null,
      user_agent: userAgent,
    })
    .select("*")
    .single<TermsAcceptance>();

  if (error) {
    const isDuplicateAcceptance =
      error.code === "23505" ||
      error.code === "409" ||
      /duplicate key|already exists|unique/i.test(error.message);

    if (isDuplicateAcceptance) {
      const duplicateAcceptance = await getCurrentTermsAcceptance(user.id, user.clientId, terms.id);
      if (duplicateAcceptance) {
        return duplicateAcceptance;
      }
    }

    throw error;
  }

  try {
    await createAuditEvent(user, "terms_accepted", "terms_versions", terms.id, {
      version: terms.version,
      user_agent: userAgent,
    });
  } catch (auditError) {
    console.error("Unable to record terms acceptance audit event", auditError);
  }

  return data;
}

export async function createOpportunityRegistration(user: AuthUser, input: OpportunityInput) {
  const status = input.status ?? "Submitted";
  let commissionRate = input.commission_rate ?? 10;
  let commissionDuration = input.commission_duration?.trim() || DEFAULT_COMMISSION_DURATION;

  const targetCompanyId = user.role === "ADMIN" ? input.company_id ?? user.clientId ?? null : user.clientId ?? null;

  if (input.pay_program_id) {
    const { data: payProgram, error: payProgramError } = await supabase
      .from("client_pay_programs")
      .select("*")
      .eq("id", input.pay_program_id)
      .maybeSingle<ClientPayProgramRecord>();

    if (payProgramError) {
      throw payProgramError;
    }

    if (!payProgram) {
      throw new Error("The selected commission plan is no longer available.");
    }

    if (targetCompanyId && payProgram.company_id !== targetCompanyId) {
      throw new Error("That commission plan is not assigned to the selected company.");
    }

    if (!targetCompanyId && user.role !== "ADMIN") {
      throw new Error("That commission plan is not assigned to your company.");
    }

    commissionRate = Number(payProgram.year_1_rate ?? payProgram.commission_rate ?? commissionRate);
    commissionDuration = buildProgramDisplayTerms(payProgram);
  }

  const { data, error } = await supabase
    .from("opportunity_registrations")
    .insert({
      company_id: targetCompanyId,
      created_by: user.id,
      pay_program_id: input.pay_program_id ?? null,
      target_account_name: input.target_account_name.trim(),
      business_unit: toNullableString(input.business_unit),
      opportunity_description: toNullableString(input.opportunity_description),
      client_contact: toNullableString(input.client_contact),
      trusted_bums_contact: toNullableString(input.trusted_bums_contact),
      expected_product_service: toNullableString(input.expected_product_service),
      estimated_deal_value: input.estimated_deal_value ?? null,
      expected_timeline: toNullableString(input.expected_timeline),
      commission_rate: commissionRate,
      commission_duration: commissionDuration,
      notes: toNullableString(input.notes),
      status,
    })
    .select("*")
    .single<OpportunityRegistration>();

  if (error) {
    throw error;
  }

  await supabase.from("opportunity_status_history").insert({
    opportunity_id: data.id,
    old_status: null,
    new_status: status,
    changed_by: user.id,
  });
  await createAuditEvent(user, "opportunity_created", "opportunity_registrations", data.id, {
    target_account_name: data.target_account_name,
    status,
  });
  await createAuditEvent(user, "admin_notification_queued", "opportunity_registrations", data.id, {
    message: "New opportunity registration submitted for admin review.",
  });

  return data;
}

export async function updateOwnOpportunityRegistration(
  user: AuthUser,
  opportunityId: string,
  updates: {
    estimated_deal_value?: number | null;
    expected_timeline?: string;
    notes?: string;
    pay_program_id?: string | null;
  },
) {
  if (user.role !== "CLIENT" || !user.clientId) {
    throw new Error("Only client users can update their opportunities.");
  }

  const { data: opportunity, error: opportunityError } = await supabase
    .from("opportunity_registrations")
    .select("*")
    .eq("id", opportunityId)
    .eq("company_id", user.clientId)
    .maybeSingle<OpportunityRegistration>();

  if (opportunityError) {
    throw opportunityError;
  }

  if (!opportunity) {
    throw new Error("That opportunity could not be found.");
  }

  let commissionRate = opportunity.commission_rate;
  let commissionDuration = opportunity.commission_duration;

  if (updates.pay_program_id) {
    const { data: payProgram, error: payProgramError } = await supabase
      .from("client_pay_programs")
      .select("*")
      .eq("id", updates.pay_program_id)
      .eq("company_id", user.clientId)
      .maybeSingle<ClientPayProgramRecord>();

    if (payProgramError) {
      throw payProgramError;
    }

    if (!payProgram) {
      throw new Error("The selected commission plan is no longer available.");
    }

    commissionRate = Number(payProgram.year_1_rate ?? payProgram.commission_rate ?? commissionRate);
    commissionDuration = buildProgramDisplayTerms(payProgram);
  }

  const { data, error } = await supabase
    .from("opportunity_registrations")
    .update({
      estimated_deal_value:
        updates.estimated_deal_value !== undefined ? updates.estimated_deal_value : opportunity.estimated_deal_value,
      expected_timeline:
        updates.expected_timeline !== undefined
          ? toNullableString(updates.expected_timeline)
          : opportunity.expected_timeline,
      notes: updates.notes !== undefined ? toNullableString(updates.notes) : opportunity.notes,
      pay_program_id: updates.pay_program_id !== undefined ? updates.pay_program_id : opportunity.pay_program_id,
      commission_rate: commissionRate,
      commission_duration: commissionDuration,
      updated_at: new Date().toISOString(),
    })
    .eq("id", opportunityId)
    .select("*, companies(name), client_pay_programs(*)")
    .single<OpportunityRegistration>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "client_opportunity_updated", "opportunity_registrations", data.id, {
    estimated_deal_value: data.estimated_deal_value,
    pay_program_id: data.pay_program_id,
  });

  return data;
}

export async function listOpportunityRegistrations(status?: string) {
  let query = supabase
    .from("opportunity_registrations")
    .select("*, companies(name), client_pay_programs(*)")
    .order("created_at", { ascending: false });

  if (status && status !== "All") {
    query = query.eq("status", status);
  }

  const { data, error } = await query.returns<OpportunityRegistration[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listMarketplaceOpportunities() {
  const { data, error } = await supabase
    .from("opportunity_registrations")
    .select("*, companies(name), client_pay_programs(*)")
    .eq("status", "Accepted")
    .order("created_at", { ascending: false })
    .returns<OpportunityRegistration[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listBumSavedItems(userId: string) {
  const { data, error } = await supabase
    .from("bum_saved_items")
    .select("*")
    .eq("bum_user_id", userId)
    .order("created_at", { ascending: false })
    .returns<BumSavedItemRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function setBumSavedItem(user: AuthUser, input: BumSavedItemInput, saved: boolean) {
  if (user.role !== "BUM") {
    throw new Error("Only Bums can save marketplace items.");
  }

  const columnByType: Record<BumSavedItemType, keyof Pick<BumSavedItemRecord, "client_company_id" | "opportunity_registration_id" | "customer_target_id">> = {
    CLIENT: "client_company_id",
    OPPORTUNITY: "opportunity_registration_id",
    CUSTOMER_TARGET: "customer_target_id",
  };
  const itemColumn = columnByType[input.itemType];

  if (!saved) {
    const { error } = await supabase
      .from("bum_saved_items")
      .delete()
      .eq("bum_user_id", user.id)
      .eq("item_type", input.itemType)
      .eq(itemColumn, input.itemId);

    if (error) {
      throw error;
    }

    return null;
  }

  const payload: Partial<BumSavedItemRecord> & Pick<BumSavedItemRecord, "bum_user_id" | "item_type"> = {
    bum_user_id: user.id,
    item_type: input.itemType,
    client_company_id: null,
    opportunity_registration_id: null,
    customer_target_id: null,
    [itemColumn]: input.itemId,
  };

  const { data, error } = await supabase
    .from("bum_saved_items")
    .insert(payload)
    .select("*")
    .single<BumSavedItemRecord>();

  if (error) {
    if (error.code === "23505") {
      return null;
    }
    throw error;
  }

  return data;
}

export async function getMarketplaceOpportunity(id: string) {
  const { data, error } = await supabase
    .from("opportunity_registrations")
    .select("*, companies(name), client_pay_programs(*)")
    .eq("id", id)
    .eq("status", "Accepted")
    .maybeSingle<OpportunityRegistration>();

  if (error) {
    throw error;
  }

  return data;
}

export async function listCompanyAgreements(companyId: string) {
  const { data, error } = await supabase
    .from("company_agreements")
    .select("*")
    .eq("company_id", companyId)
    .order("effective_date", { ascending: false })
    .returns<CompanyAgreementRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

function buildProgramDurationText(program: Pick<ClientPayProgramRecord, "commission_period_months" | "payment_terms" | "commission_basis">) {
  const parts: string[] = [];

  if (program.commission_period_months) {
    parts.push(`For ${program.commission_period_months} months from introduced revenue recognition`);
  }
  if (program.commission_basis?.trim()) {
    parts.push(program.commission_basis.trim());
  }
  if (program.payment_terms?.trim()) {
    parts.push(program.payment_terms.trim());
  }

  return parts.length ? parts.join(". ") : DEFAULT_COMMISSION_DURATION;
}

export function calculateTopLineSharePercent(commissionRate: number | null | undefined, bumSharePercent: number | null | undefined) {
  return Number((((Number(commissionRate ?? 0) * Number(bumSharePercent ?? 0)) / 100)).toFixed(4));
}

export function buildTopLineShareSchedule(
  program: Pick<
    ClientPayProgramRecord,
    "year_1_rate" | "year_2_rate" | "year_3_rate" | "year_4_rate" | "year_5_rate" | "year_6_plus_rate"
  > | null | undefined,
  bumSharePercent: number | null | undefined,
) {
  if (!program) {
    return [] as Array<{ label: string; topLinePercent: number }>;
  }

  return [
    { label: "Year 1", topLinePercent: calculateTopLineSharePercent(program.year_1_rate, bumSharePercent) },
    { label: "Year 2", topLinePercent: calculateTopLineSharePercent(program.year_2_rate, bumSharePercent) },
    { label: "Year 3", topLinePercent: calculateTopLineSharePercent(program.year_3_rate, bumSharePercent) },
    { label: "Year 4", topLinePercent: calculateTopLineSharePercent(program.year_4_rate, bumSharePercent) },
    { label: "Year 5", topLinePercent: calculateTopLineSharePercent(program.year_5_rate, bumSharePercent) },
    { label: "Year 6+", topLinePercent: calculateTopLineSharePercent(program.year_6_plus_rate, bumSharePercent) },
  ];
}

export function deriveDefaultBumSharePercent(activeClaimCount: number) {
  if (activeClaimCount <= 1) {
    return DEFAULT_BUM_COMMISSION_POOL_PERCENT;
  }

  return Number((DEFAULT_BUM_COMMISSION_POOL_PERCENT / activeClaimCount).toFixed(4));
}

function buildTieredCommissionSummary(
  program: Pick<
    ClientPayProgramRecord,
    "year_1_rate" | "year_2_rate" | "year_3_rate" | "year_4_rate" | "year_5_rate" | "year_6_plus_rate"
  >,
) {
  return [
    `Year 1: ${Number(program.year_1_rate).toLocaleString()}%`,
    `Year 2: ${Number(program.year_2_rate).toLocaleString()}%`,
    `Year 3: ${Number(program.year_3_rate).toLocaleString()}%`,
    `Year 4: ${Number(program.year_4_rate).toLocaleString()}%`,
    `Year 5: ${Number(program.year_5_rate).toLocaleString()}%`,
    `Year 6+: ${Number(program.year_6_plus_rate).toLocaleString()}%`,
  ].join(" · ");
}

function buildProgramDisplayTerms(
  program: Pick<
    ClientPayProgramRecord,
    | "commission_period_months"
    | "payment_terms"
    | "commission_basis"
    | "year_1_rate"
    | "year_2_rate"
    | "year_3_rate"
    | "year_4_rate"
    | "year_5_rate"
    | "year_6_plus_rate"
  >,
) {
  const parts = [
    buildTieredCommissionSummary(program),
    "Commission schedule starts when the first commission is paid to Trusted Bums.",
    buildProgramDurationText(program),
  ].filter(Boolean);

  return parts.join(". ");
}

function resolveTieredCommissionRate(
  program: Pick<
    ClientPayProgramRecord,
    "year_1_rate" | "year_2_rate" | "year_3_rate" | "year_4_rate" | "year_5_rate" | "year_6_plus_rate"
  >,
  scheduleStartAt: string | null | undefined,
  customerPaymentReceivedAt: string | null | undefined,
) {
  if (!scheduleStartAt || !customerPaymentReceivedAt) {
    return Number(program.year_1_rate);
  }

  const start = new Date(scheduleStartAt);
  const payment = new Date(customerPaymentReceivedAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(payment.getTime()) || payment < start) {
    return Number(program.year_1_rate);
  }

  const elapsedMonths =
    (payment.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (payment.getUTCMonth() - start.getUTCMonth()) -
    (payment.getUTCDate() < start.getUTCDate() ? 1 : 0);

  if (elapsedMonths < 12) {
    return Number(program.year_1_rate);
  }
  if (elapsedMonths < 24) {
    return Number(program.year_2_rate);
  }
  if (elapsedMonths < 36) {
    return Number(program.year_3_rate);
  }
  if (elapsedMonths < 48) {
    return Number(program.year_4_rate);
  }
  if (elapsedMonths < 60) {
    return Number(program.year_5_rate);
  }

  return Number(program.year_6_plus_rate);
}

export async function listClientPayPrograms(companyId?: string | null) {
  let query = supabase
    .from("client_pay_programs")
    .select("*, companies(id, name), requested_by_profile:profiles!client_pay_programs_requested_by_fkey(id, full_name, email), reviewed_by_profile:profiles!client_pay_programs_reviewed_by_fkey(id, full_name, email)")
    .order("created_at", { ascending: false });

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  const { data, error } = await query.returns<ClientPayProgramRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listSelectableClientPayPrograms(user: AuthUser) {
  if (user.role !== "CLIENT" || !user.clientId) {
    throw new Error("Only client users can load selectable commission plans.");
  }

  const programs = await listClientPayPrograms(user.clientId);
  return programs.filter((program) => program.status === "ACTIVE" && program.approval_status !== "DENIED");
}

export async function listOwnOpportunityRegistrations(user: AuthUser) {
  if (user.role !== "CLIENT" || !user.clientId) {
    throw new Error("Only client users can load their opportunity registrations.");
  }

  const { data, error } = await supabase
    .from("opportunity_registrations")
    .select("*, companies(name), client_pay_programs(*)")
    .eq("company_id", user.clientId)
    .order("created_at", { ascending: false })
    .returns<OpportunityRegistration[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createClientPayProgramRequest(user: AuthUser, input: ClientPayProgramRequestInput) {
  if (user.role !== "CLIENT" && user.role !== "ADMIN") {
    throw new Error("Only Clients and Admins can create commission plans.");
  }

  const companyId = user.role === "ADMIN" ? input.company_id : user.clientId;

  if (!companyId) {
    throw new Error("Choose a client company for this commission plan.");
  }

  const { data, error } = await supabase
    .from("client_pay_programs")
    .insert({
      company_id: companyId,
      name: input.name.trim(),
      status: "ACTIVE",
      approval_status: user.role === "ADMIN" ? input.approval_status ?? "APPROVED" : "PENDING",
      commission_rate: input.commission_rate,
      year_1_rate: input.year_1_rate,
      year_2_rate: input.year_2_rate,
      year_3_rate: input.year_3_rate,
      year_4_rate: input.year_4_rate,
      year_5_rate: input.year_5_rate,
      year_6_plus_rate: input.year_6_plus_rate,
      commission_period_months: input.commission_period_months ?? null,
      payment_terms: toNullableString(input.payment_terms),
      commission_basis: toNullableString(input.commission_basis),
      exclusions: toNullableString(input.exclusions),
      notes: toNullableString(input.notes),
      requested_by: user.role === "ADMIN" ? null : user.id,
      reviewed_by: user.role === "ADMIN" ? user.id : null,
      reviewed_at: user.role === "ADMIN" ? new Date().toISOString() : null,
      request_reason: toNullableString(input.request_reason),
    })
    .select("*, companies(id, name), requested_by_profile:profiles!client_pay_programs_requested_by_fkey(id, full_name, email), reviewed_by_profile:profiles!client_pay_programs_reviewed_by_fkey(id, full_name, email)")
    .single<ClientPayProgramRecord>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "commission_plan_requested", "client_pay_programs", data.id, {
    name: data.name,
    company_id: data.company_id,
    approval_status: data.approval_status,
    commission_rate: data.commission_rate,
    commission_schedule: buildTieredCommissionSummary(data),
  });

  return data;
}

export async function reviewClientPayProgram(
  user: AuthUser,
  planId: string,
  approvalStatus: ClientPayProgramApprovalStatus,
  notes?: string,
) {
  if (user.role !== "ADMIN") {
    throw new Error("Only Admins can review commission plan requests.");
  }

  const payload: Partial<ClientPayProgramRecord> = {
    approval_status: approvalStatus,
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
  };

  if (notes !== undefined) {
    payload.notes = toNullableString(notes);
  }

  const { data, error } = await supabase
    .from("client_pay_programs")
    .update(payload)
    .eq("id", planId)
    .select("*, companies(id, name), requested_by_profile:profiles!client_pay_programs_requested_by_fkey(id, full_name, email), reviewed_by_profile:profiles!client_pay_programs_reviewed_by_fkey(id, full_name, email)")
    .single<ClientPayProgramRecord>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "commission_plan_reviewed", "client_pay_programs", data.id, {
    approval_status: approvalStatus,
  });

  return data;
}

export async function listOpportunityClaims(opportunityId?: string) {
  let query = supabase
    .from("opportunity_claims")
    .select("*, opportunity_registrations(id, target_account_name, commission_rate, company_id, client_pay_programs(*)), profiles(id, full_name, email)")
    .order("created_at", { ascending: false });

  if (opportunityId) {
    query = query.eq("opportunity_registration_id", opportunityId);
  }

  const { data, error } = await query.returns<OpportunityClaimRecord[]>();

  if (error) {
    throw error;
  }

  const claims = data ?? [];

  const lockedClaimIds = new Set<string>();
  const claimIds = claims.map((claim) => claim.id).filter(Boolean);

  if (claimIds.length) {
    const [{ data: transcriptRows, error: transcriptError }, { data: meetingRows, error: meetingError }] =
      await Promise.all([
        supabase
          .from("meeting_transcripts")
          .select("opportunity_claim_id")
          .in("opportunity_claim_id", claimIds)
          .eq("status", "AVAILABLE")
          .limit(claimIds.length),
        supabase
          .from("teams_meetings")
          .select("opportunity_claim_id")
          .in("opportunity_claim_id", claimIds)
          .eq("status", "COMPLETED")
          .limit(claimIds.length),
      ]);

    if (transcriptError) {
      throw transcriptError;
    }
    if (meetingError) {
      throw meetingError;
    }

    for (const row of transcriptRows ?? []) {
      if (row.opportunity_claim_id) {
        lockedClaimIds.add(row.opportunity_claim_id);
      }
    }
    for (const row of meetingRows ?? []) {
      if (row.opportunity_claim_id) {
        lockedClaimIds.add(row.opportunity_claim_id);
      }
    }
  }

  return claims.map((claim) => ({
    ...claim,
    meeting_locked: lockedClaimIds.has(claim.id),
  }));
}

function assertClientFinanceAccess(user: AuthUser, action: string) {
  if (user.role === "ADMIN") {
    return;
  }

  if (
    user.role !== "CLIENT" ||
    (user.clientAccessRole !== "CLIENT_ADMIN" && user.clientAccessRole !== "CLIENT_FINANCE")
  ) {
    throw new Error(action);
  }
}

export async function listCustomerPaymentReports(user?: AuthUser) {
  if (user) {
    assertClientFinanceAccess(user, "You do not have access to customer payment reporting.");
  }

  const { data, error } = await supabase
    .from("customer_payment_reports")
    .select("*, opportunity_claims(id, contact_name, contact_company, bum_user_id), opportunity_registrations(id, target_account_name, commission_rate), companies(id, name), profiles(id, full_name, email)")
    .order("created_at", { ascending: false })
    .returns<CustomerPaymentReportRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createCustomerPaymentReport(user: AuthUser, input: CustomerPaymentReportInput) {
  if (user.role !== "CLIENT" && user.role !== "ADMIN") {
    throw new Error("Only Clients and Admins can report customer payments.");
  }

  assertClientFinanceAccess(user, "You do not have permission to report customer payments.");

  const { data: claim, error: claimError } = await supabase
    .from("opportunity_claims")
    .select("id, opportunity_registration_id, company_id, contact_company")
    .eq("id", input.claimId)
    .maybeSingle<Pick<OpportunityClaimRecord, "id" | "opportunity_registration_id" | "company_id" | "contact_company">>();

  if (claimError) {
    throw claimError;
  }

  if (!claim?.company_id) {
    throw new Error("That claim is not available for payment reporting.");
  }

  const { data, error } = await supabase
    .from("customer_payment_reports")
    .insert({
      opportunity_claim_id: claim.id,
      opportunity_registration_id: claim.opportunity_registration_id,
      company_id: claim.company_id,
      reported_by: user.id,
      source: user.role === "ADMIN" ? "ADMIN" : "CLIENT",
      customer_name: input.customerName.trim() || claim.contact_company,
      gross_amount: input.grossAmount,
      commissionable_amount: input.commissionableAmount,
      excluded_amount: input.excludedAmount ?? Math.max(0, input.grossAmount - input.commissionableAmount),
      customer_payment_received_at: input.customerPaymentReceivedAt,
      notes: toNullableString(input.notes),
      status: "REPORTED",
    })
    .select("*")
    .single<CustomerPaymentReportRecord>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "customer_payment_reported", "customer_payment_reports", data.id, {
    opportunity_claim_id: claim.id,
    gross_amount: data.gross_amount,
    commissionable_amount: data.commissionable_amount,
  });

  return data;
}

export async function listClaimInvoices(user?: AuthUser) {
  if (user) {
    assertClientFinanceAccess(user, "You do not have access to generated claim invoices.");
  }

  const { data, error } = await supabase
    .from("claim_invoices")
    .select("*, customer_payment_reports(id, customer_name, commissionable_amount, customer_payment_received_at), opportunity_claims(id, contact_name, contact_company, bum_user_id), opportunity_registrations(id, target_account_name), companies(id, name)")
    .order("created_at", { ascending: false })
    .returns<ClaimInvoiceRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createClaimInvoice(user: AuthUser, paymentReportId: string) {
  if (user.role !== "CLIENT" && user.role !== "ADMIN") {
    throw new Error("Only Clients and Admins can generate claim invoices.");
  }

  assertClientFinanceAccess(user, "You do not have permission to generate claim invoices.");

  const { data: report, error: reportError } = await supabase
    .from("customer_payment_reports")
    .select("*, opportunity_registrations(id, target_account_name, commission_rate, commission_schedule_start_at, client_pay_programs(*))")
    .eq("id", paymentReportId)
    .maybeSingle<CustomerPaymentReportRecord>();

  if (reportError) {
    throw reportError;
  }

  if (!report?.opportunity_registrations) {
    throw new Error("That payment report is not available for invoicing.");
  }

  const program = report.opportunity_registrations.client_pay_programs;
  const commissionRate = program
    ? resolveTieredCommissionRate(
        program,
        report.opportunity_registrations.commission_schedule_start_at,
        report.customer_payment_received_at,
      )
    : Number(report.opportunity_registrations.commission_rate ?? 0);
  const invoiceAmount = Number(((Number(report.commissionable_amount) * commissionRate) / 100).toFixed(2));

  const { data, error } = await supabase
    .from("claim_invoices")
    .insert({
      customer_payment_report_id: report.id,
      opportunity_claim_id: report.opportunity_claim_id,
      opportunity_registration_id: report.opportunity_registration_id,
      company_id: report.company_id,
      generated_by: user.id,
      invoice_number: createInvoiceNumber(),
      invoice_amount: invoiceAmount,
      commission_rate: commissionRate,
      currency: report.currency,
      status: "GENERATED",
      notes: "Generated from client-reported customer payment.",
    })
    .select("*")
    .single<ClaimInvoiceRecord>();

  if (error) {
    throw error;
  }

  await supabase
    .from("customer_payment_reports")
    .update({ status: "INVOICE_GENERATED" })
    .eq("id", report.id);

  await createAuditEvent(user, "claim_invoice_generated", "claim_invoices", data.id, {
    customer_payment_report_id: report.id,
    invoice_amount: data.invoice_amount,
    commission_rate: data.commission_rate,
  });

  return data;
}

export async function updateClaimInvoiceStatus(user: AuthUser, invoice: ClaimInvoiceRecord, status: ClaimInvoiceStatus) {
  const timestamp = new Date().toISOString();
  const updates: Partial<Pick<ClaimInvoiceRecord, "status" | "sent_at" | "paid_at">> = { status };

  if (status === "SENT" && !invoice.sent_at) {
    updates.sent_at = timestamp;
  }
  if (status === "PAID") {
    updates.paid_at = timestamp;
  }

  const { data, error } = await supabase
    .from("claim_invoices")
    .update(updates)
    .eq("id", invoice.id)
    .select("*")
    .single<ClaimInvoiceRecord>();

  if (error) {
    throw error;
  }

  if (status === "PAID" && data.paid_at) {
    await supabase
      .from("opportunity_registrations")
      .update({ commission_schedule_start_at: data.paid_at })
      .eq("id", invoice.opportunity_registration_id)
      .is("commission_schedule_start_at", null);
  }

  if (status === "PAID" && user.role === "ADMIN" && invoice.opportunity_claims?.bum_user_id) {
    const { data: claimShare, error: claimShareError } = await supabase
      .from("opportunity_claims")
      .select("bum_share_percent")
      .eq("id", invoice.opportunity_claim_id)
      .maybeSingle<Pick<OpportunityClaimRecord, "bum_share_percent">>();

    if (claimShareError) {
      throw claimShareError;
    }

    const sharePercent = Number(claimShare?.bum_share_percent ?? DEFAULT_BUM_COMMISSION_POOL_PERCENT);
    const payoutAmount = Number(((Number(invoice.invoice_amount ?? 0) * sharePercent) / 100).toFixed(2));
    await supabase.from("bum_payouts").upsert(
      {
        claim_invoice_id: invoice.id,
        opportunity_claim_id: invoice.opportunity_claim_id,
        bum_user_id: invoice.opportunity_claims.bum_user_id,
        payout_amount: payoutAmount,
        share_percent: sharePercent,
        currency: invoice.currency,
        status: "PENDING_ALLOCATION",
        notes: "Invoice paid. Payout amount was derived from the claim's Bum share percentage.",
      },
      { onConflict: "claim_invoice_id,opportunity_claim_id" },
    );
  }

  await createAuditEvent(user, "claim_invoice_status_changed", "claim_invoices", data.id, { status });

  return data;
}

export async function listBumPayouts() {
  const { data, error } = await supabase
    .from("bum_payouts")
    .select("*, claim_invoices(id, invoice_number, invoice_amount, commission_rate, status), opportunity_claims(id, contact_name, contact_company, bum_share_percent), profiles(id, full_name, email)")
    .order("created_at", { ascending: false })
    .returns<BumPayoutRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function updateBumPayout(user: AuthUser, payout: BumPayoutRecord, updates: Partial<Pick<BumPayoutRecord, "payout_amount" | "status" | "notes">>) {
  if (user.role !== "ADMIN") {
    throw new Error("Only Admins can update Bum payouts.");
  }

  const timestamp = new Date().toISOString();
  const payload: Partial<BumPayoutRecord> = { ...updates };

  if (updates.status === "APPROVED") {
    payload.approved_by = user.id;
    payload.approved_at = timestamp;
  }
  if (updates.status === "PAID") {
    payload.paid_at = timestamp;
  }

  const { data, error } = await supabase
    .from("bum_payouts")
    .update(payload)
    .eq("id", payout.id)
    .select("*")
    .single<BumPayoutRecord>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "bum_payout_updated", "bum_payouts", data.id, {
    payout_amount: data.payout_amount,
    status: data.status,
  });

  return data;
}

const ACTIVE_CLAIM_STATUSES: OpportunityClaimStatus[] = [
  "PROPOSED",
  "APPROVED",
  "SCHEDULED",
  "MEETING_HELD",
];

async function hasCompletedMeetingForClaim(claimId: string) {
  const [{ data: transcript }, { data: meeting }] = await Promise.all([
    supabase
      .from("meeting_transcripts")
      .select("id")
      .eq("opportunity_claim_id", claimId)
      .eq("status", "AVAILABLE")
      .limit(1)
      .maybeSingle<{ id: string }>(),
    supabase
      .from("teams_meetings")
      .select("id")
      .eq("opportunity_claim_id", claimId)
      .eq("status", "COMPLETED")
      .limit(1)
      .maybeSingle<{ id: string }>(),
  ]);

  return Boolean(transcript?.id || meeting?.id);
}

async function hasLoggedMeetingForOpportunity(opportunityId: string) {
  const [{ data: transcript }, { data: meeting }] = await Promise.all([
    supabase
      .from("meeting_transcripts")
      .select("id")
      .eq("opportunity_registration_id", opportunityId)
      .eq("status", "AVAILABLE")
      .limit(1)
      .maybeSingle<{ id: string }>(),
    supabase
      .from("teams_meetings")
      .select("id")
      .eq("opportunity_registration_id", opportunityId)
      .eq("status", "COMPLETED")
      .limit(1)
      .maybeSingle<{ id: string }>(),
  ]);

  return Boolean(transcript?.id || meeting?.id);
}

async function rebalanceOpportunityClaimShares(opportunityId: string) {
  const isLocked = await hasLoggedMeetingForOpportunity(opportunityId);
  if (isLocked) {
    return;
  }

  const { data: claims, error } = await supabase
    .from("opportunity_claims")
    .select("id, status, bum_share_percent, share_manually_set")
    .eq("opportunity_registration_id", opportunityId)
    .returns<Array<Pick<OpportunityClaimRecord, "id" | "status" | "bum_share_percent" | "share_manually_set">>>();

  if (error) {
    throw error;
  }

  const activeClaims = (claims ?? []).filter((claim) => ACTIVE_CLAIM_STATUSES.includes(claim.status));
  const manualClaims = activeClaims.filter((claim) => claim.share_manually_set);
  const autoClaims = activeClaims.filter((claim) => !claim.share_manually_set);
  const manualTotal = manualClaims.reduce((sum, claim) => sum + Number(claim.bum_share_percent ?? 0), 0);
  const remainingPool = Math.max(0, DEFAULT_BUM_COMMISSION_POOL_PERCENT - manualTotal);
  const autoShare = autoClaims.length ? Number((remainingPool / autoClaims.length).toFixed(4)) : 0;

  const updates = await Promise.all(
    autoClaims.map((claim) =>
      supabase
        .from("opportunity_claims")
        .update({ bum_share_percent: autoShare })
        .eq("id", claim.id),
    ),
  );

  for (const result of updates) {
    if (result.error) {
      throw result.error;
    }
  }
}

export async function updateOpportunityClaimShare(user: AuthUser, claimId: string, bumSharePercent: number) {
  if (user.role !== "ADMIN") {
    throw new Error("Only Admins can change Bum share percentages.");
  }

  if (bumSharePercent < 0 || bumSharePercent > 100) {
    throw new Error("Bum share percent must be between 0 and 100.");
  }

  const { data: claim, error: claimError } = await supabase
    .from("opportunity_claims")
    .select("id, opportunity_registration_id, status, bum_share_percent, share_manually_set")
    .eq("id", claimId)
    .maybeSingle<Pick<OpportunityClaimRecord, "id" | "opportunity_registration_id" | "status" | "bum_share_percent" | "share_manually_set">>();

  if (claimError) {
    throw claimError;
  }

  if (!claim) {
    throw new Error("That opportunity claim could not be found.");
  }

  const isLocked = await hasCompletedMeetingForClaim(claim.id);
  if (isLocked) {
    throw new Error("This claim can no longer be changed after a completed meeting is logged against it.");
  }

  const { data: siblingClaims, error: siblingError } = await supabase
    .from("opportunity_claims")
    .select("id, status, bum_share_percent, share_manually_set")
    .eq("opportunity_registration_id", claim.opportunity_registration_id)
    .returns<Array<Pick<OpportunityClaimRecord, "id" | "status" | "bum_share_percent" | "share_manually_set">>>();

  if (siblingError) {
    throw siblingError;
  }

  const activeSiblingClaims = (siblingClaims ?? []).filter(
    (item) => item.id !== claim.id && ACTIVE_CLAIM_STATUSES.includes(item.status),
  );
  const manualSiblingTotal = activeSiblingClaims
    .filter((item) => item.share_manually_set)
    .reduce((sum, item) => sum + Number(item.bum_share_percent ?? 0), 0);

  if (manualSiblingTotal + bumSharePercent > DEFAULT_BUM_COMMISSION_POOL_PERCENT) {
    throw new Error("The total Bum share for active claims cannot exceed 50% of the Trusted Bums commission.");
  }

  const { data, error } = await supabase
    .from("opportunity_claims")
    .update({ bum_share_percent: bumSharePercent, share_manually_set: true })
    .eq("id", claimId)
    .select("*")
    .single<OpportunityClaimRecord>();

  if (error) {
    throw error;
  }

  await rebalanceOpportunityClaimShares(claim.opportunity_registration_id);
  await createAuditEvent(user, "opportunity_claim_share_updated", "opportunity_claims", data.id, {
    bum_share_percent: bumSharePercent,
  });

  return data;
}

export async function updateAdminOpportunityClaim(
  user: AuthUser,
  claimId: string,
  updates: Partial<Pick<OpportunityClaimRecord, "contact_name" | "contact_company" | "contact_email" | "relationship_strength" | "note" | "status" | "bum_share_percent">>,
) {
  if (user.role !== "ADMIN") {
    throw new Error("Only Admins can edit opportunity claims.");
  }

  const { data: claim, error: claimError } = await supabase
    .from("opportunity_claims")
    .select("id, opportunity_registration_id, status, bum_share_percent, share_manually_set")
    .eq("id", claimId)
    .maybeSingle<Pick<OpportunityClaimRecord, "id" | "opportunity_registration_id" | "status" | "bum_share_percent" | "share_manually_set">>();

  if (claimError) {
    throw claimError;
  }

  if (!claim) {
    throw new Error("That opportunity claim could not be found.");
  }

  const isLocked = await hasCompletedMeetingForClaim(claim.id);
  if (isLocked) {
    throw new Error("This claim can no longer be edited after a completed meeting is logged against it.");
  }

  const payload: Partial<OpportunityClaimRecord> = {};

  if (updates.contact_name !== undefined) payload.contact_name = updates.contact_name.trim();
  if (updates.contact_company !== undefined) payload.contact_company = updates.contact_company.trim();
  if (updates.contact_email !== undefined) payload.contact_email = toNullableString(updates.contact_email);
  if (updates.relationship_strength !== undefined) payload.relationship_strength = updates.relationship_strength;
  if (updates.note !== undefined) payload.note = toNullableString(updates.note);
  if (updates.status !== undefined) payload.status = updates.status;

  if (updates.bum_share_percent !== undefined) {
    const bumSharePercent = Number(updates.bum_share_percent);
    if (bumSharePercent < 0 || bumSharePercent > 100) {
      throw new Error("Bum share percent must be between 0 and 100.");
    }

    const { data: siblingClaims, error: siblingError } = await supabase
      .from("opportunity_claims")
      .select("id, status, bum_share_percent, share_manually_set")
      .eq("opportunity_registration_id", claim.opportunity_registration_id)
      .returns<Array<Pick<OpportunityClaimRecord, "id" | "status" | "bum_share_percent" | "share_manually_set">>>();

    if (siblingError) {
      throw siblingError;
    }

    const activeSiblingClaims = (siblingClaims ?? []).filter(
      (item) => item.id !== claim.id && ACTIVE_CLAIM_STATUSES.includes(item.status),
    );
    const manualSiblingTotal = activeSiblingClaims
      .filter((item) => item.share_manually_set)
      .reduce((sum, item) => sum + Number(item.bum_share_percent ?? 0), 0);

    if (manualSiblingTotal + bumSharePercent > DEFAULT_BUM_COMMISSION_POOL_PERCENT) {
      throw new Error("The total Bum share for active claims cannot exceed 50% of the Trusted Bums commission.");
    }

    payload.bum_share_percent = bumSharePercent;
    payload.share_manually_set = true;
  }

  const { data, error } = await supabase
    .from("opportunity_claims")
    .update(payload)
    .eq("id", claimId)
    .select("*, opportunity_registrations(id, target_account_name, commission_rate, company_id, client_pay_programs(*)), profiles(id, full_name, email)")
    .single<OpportunityClaimRecord>();

  if (error) {
    throw error;
  }

  await rebalanceOpportunityClaimShares(data.opportunity_registration_id);
  await createAuditEvent(user, "opportunity_claim_updated", "opportunity_claims", data.id, {
    fields: Object.keys(payload),
  });

  return data;
}

export async function createOpportunityClaim(user: AuthUser, input: OpportunityClaimInput) {
  if (user.role !== "BUM") {
    throw new Error("Only Bums can request opportunity claims.");
  }

  const { data: opportunity, error: opportunityError } = await supabase
    .from("opportunity_registrations")
    .select("id, company_id, target_account_name")
    .eq("id", input.opportunityId)
    .eq("status", "Accepted")
    .maybeSingle<Pick<OpportunityRegistration, "id" | "company_id" | "target_account_name">>();

  if (opportunityError) {
    throw opportunityError;
  }

  if (!opportunity) {
    throw new Error("That opportunity is no longer available.");
  }

  const { data, error } = await supabase
    .from("opportunity_claims")
    .insert({
      opportunity_registration_id: opportunity.id,
      company_id: opportunity.company_id,
      bum_user_id: user.id,
      bum_share_percent: DEFAULT_BUM_COMMISSION_POOL_PERCENT,
      share_manually_set: false,
      contact_name: input.contactName.trim(),
      contact_company: input.contactCompany.trim(),
      contact_email: toNullableString(input.contactEmail),
      relationship_strength: input.relationshipStrength,
      note: toNullableString(input.note),
      status: "PROPOSED",
    })
    .select("*")
    .single<OpportunityClaimRecord>();

  if (error) {
    throw error;
  }

  await rebalanceOpportunityClaimShares(opportunity.id);

  await createAuditEvent(user, "opportunity_claim_created", "opportunity_claims", data.id, {
    opportunity_registration_id: opportunity.id,
    contact_name: data.contact_name,
    contact_company: data.contact_company,
    relationship_strength: data.relationship_strength,
  });

  await sendAdminEmail({
    mode: "action",
    templateSlug: "opportunity_claim_created_client",
    metadata: {
      company_id: opportunity.company_id,
      target_account_name: opportunity.target_account_name,
      contact_name: data.contact_name,
      contact_company: data.contact_company,
      relationship_strength: data.relationship_strength,
      bum_name: user.name || user.email,
      admin_note: data.note ?? "",
    },
    triggeredBy: "OPPORTUNITY_CLAIM_CREATED",
  }).catch((error) => {
    console.error("Unable to send opportunity claim notification", error);
  });

  return data;
}

export async function updateOpportunityClaimStatus(user: AuthUser, claimId: string, status: OpportunityClaimStatus, note?: string) {
  const payload: Partial<Pick<OpportunityClaimRecord, "status" | "note">> = { status };
  if (note?.trim()) {
    payload.note = note.trim();
  }

  const { data, error } = await supabase
    .from("opportunity_claims")
    .update(payload)
    .eq("id", claimId)
    .select("*")
    .single<OpportunityClaimRecord>();

  if (error) {
    throw error;
  }

  await rebalanceOpportunityClaimShares(data.opportunity_registration_id);

  await createAuditEvent(user, "opportunity_claim_status_changed", "opportunity_claims", data.id, {
    status,
  });

  return data;
}

export async function updateOpportunityRegistration(
  user: AuthUser,
  opportunity: OpportunityRegistration,
  updates: Partial<Pick<OpportunityRegistration, "status" | "commission_rate" | "commission_duration" | "notes">>,
) {
  const { data, error } = await supabase
    .from("opportunity_registrations")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", opportunity.id)
    .select("*")
    .single<OpportunityRegistration>();

  if (error) {
    throw error;
  }

  if (updates.status && updates.status !== opportunity.status) {
    await supabase.from("opportunity_status_history").insert({
      opportunity_id: opportunity.id,
      old_status: opportunity.status,
      new_status: updates.status,
      changed_by: user.id,
    });
    await createAuditEvent(user, "opportunity_status_changed", "opportunity_registrations", opportunity.id, {
      old_status: opportunity.status,
      new_status: updates.status,
    });
  }

  if (
    updates.commission_rate !== undefined ||
    updates.commission_duration !== undefined ||
    updates.notes !== undefined
  ) {
    await createAuditEvent(user, "admin_override", "opportunity_registrations", opportunity.id, {
      commission_rate: updates.commission_rate,
      commission_duration: updates.commission_duration,
      notes: updates.notes,
    });
  }

  return data;
}

export async function listTermsVersions() {
  const { data, error } = await supabase
    .from("terms_versions")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<TermsVersion[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createTermsVersion(user: AuthUser, input: Pick<TermsVersion, "version" | "title" | "body" | "faq_body" | "is_active">) {
  if (input.is_active) {
    await supabase.from("terms_versions").update({ is_active: false }).eq("is_active", true);
  }

  const { data, error } = await supabase.from("terms_versions").insert(input).select("*").single<TermsVersion>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "terms_version_created", "terms_versions", data.id, { version: data.version });
  return data;
}

export async function activateTermsVersion(user: AuthUser, terms: TermsVersion) {
  await supabase.from("terms_versions").update({ is_active: false }).eq("is_active", true);
  const { data, error } = await supabase
    .from("terms_versions")
    .update({ is_active: true })
    .eq("id", terms.id)
    .select("*")
    .single<TermsVersion>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "terms_version_activated", "terms_versions", terms.id, { version: terms.version });
  return data;
}

export async function listTermsAcceptances() {
  const { data, error } = await supabase
    .from("terms_acceptances")
    .select("*, companies(name), terms_versions(version, title)")
    .order("accepted_at", { ascending: false })
    .returns<TermsAcceptance[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listAdminEmailTemplates() {
  const { data, error } = await supabase
    .from("admin_email_templates")
    .select("*")
    .order("name", { ascending: true })
    .returns<AdminEmailTemplateRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

function slugifyEmailTemplateName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `template-${Date.now()}`;
}

export async function createAdminEmailTemplate(
  user: AuthUser,
  input: Pick<
    AdminEmailTemplateRecord,
    "name" | "description" | "recipient_group" | "trigger_event" | "subject" | "body" | "metadata_fields" | "category" | "reply_to" | "rate_limit_per_hour" | "is_active"
  > & { slug?: string },
) {
  if (user.role !== "ADMIN") {
    throw new Error("Only admins can create email templates.");
  }

  const { data, error } = await supabase
    .from("admin_email_templates")
    .insert({
      slug: input.slug?.trim() || slugifyEmailTemplateName(input.name),
      name: input.name.trim(),
      description: toNullableString(input.description),
      recipient_group: input.recipient_group,
      trigger_event: input.trigger_event,
      subject: input.subject.trim(),
      body: input.body.trim(),
      metadata_fields: input.metadata_fields,
      category: input.category,
      reply_to: toNullableString(input.reply_to),
      rate_limit_per_hour: input.rate_limit_per_hour,
      is_active: input.is_active,
      created_by: user.id,
      updated_by: user.id,
    })
    .select("*")
    .single<AdminEmailTemplateRecord>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "admin_email_template_created", "admin_email_templates", data.id, {
    slug: data.slug,
    recipient_group: data.recipient_group,
    trigger_event: data.trigger_event,
  });

  return data;
}

export async function saveAdminEmailTemplate(user: AuthUser, template: AdminEmailTemplateRecord) {
  if (user.role !== "ADMIN") {
    throw new Error("Only admins can edit email templates.");
  }

  const { data, error } = await supabase
    .from("admin_email_templates")
    .update({
      name: template.name.trim(),
      description: toNullableString(template.description),
      recipient_group: template.recipient_group,
      trigger_event: template.trigger_event,
      subject: template.subject.trim(),
      body: template.body.trim(),
      metadata_fields: template.metadata_fields,
      category: template.category,
      reply_to: toNullableString(template.reply_to),
      rate_limit_per_hour: template.rate_limit_per_hour,
      is_active: template.is_active,
      updated_by: user.id,
    })
    .eq("id", template.id)
    .select("*")
    .single<AdminEmailTemplateRecord>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "admin_email_template_updated", "admin_email_templates", data.id, {
    slug: data.slug,
    recipient_group: data.recipient_group,
    trigger_event: data.trigger_event,
  });

  return data;
}

export async function listAdminEmailDeliveries() {
  const { data, error } = await supabase
    .from("admin_email_deliveries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<AdminEmailDeliveryRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listAdminEmailEngagementSummary() {
  const { data, error } = await supabase
    .from("admin_email_engagement_summary")
    .select("*")
    .order("engagement_score", { ascending: false })
    .limit(50)
    .returns<AdminEmailEngagementSummaryRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function sendAdminEmail(input: AdminEmailSendInput) {
  const { data, error } = await supabase.functions.invoke<AdminEmailSendResult>("send-admin-email", {
    body: input,
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Email function returned no response.");
  }

  return data;
}

export async function listCompanies() {
  const { data, error } = await supabase.from("companies").select("*").order("created_at", { ascending: false }).returns<CompanyRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getOwnClientCompany(user: AuthUser) {
  if (user.role !== "CLIENT" || !user.clientId) {
    throw new Error("Only client users linked to a company can read company profile details.");
  }

  const company = await getCompanyById(user.clientId);

  if (!company) {
    throw new Error("Your client company profile could not be found.");
  }

  return company;
}

export async function updateOwnClientCompanyProfile(
  user: AuthUser,
  input: { name: string; website?: string },
) {
  if (user.role !== "CLIENT" || !user.clientId) {
    throw new Error("Only client users linked to a company can update company profile details.");
  }

  if (!input.name.trim()) {
    throw new Error("Company name is required.");
  }

  const { data, error } = await supabase
    .from("companies")
    .update({
      name: input.name.trim(),
      website: toNullableString(input.website),
    })
    .eq("id", user.clientId)
    .select("*")
    .single<CompanyRecord>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "client_company_profile_updated", "companies", data.id, {
    name: data.name,
    website: data.website,
  });

  return data;
}

export async function createClientCompany(
  user: AuthUser,
  input: { name: string; website?: string },
) {
  if (user.role !== "ADMIN") {
    throw new Error("Only admins can create client companies.");
  }

  if (!input.name.trim()) {
    throw new Error("Company name is required.");
  }

  const { data, error } = await supabase
    .from("companies")
    .insert({
      name: input.name.trim(),
      website: toNullableString(input.website),
      relationship_stage: "CLIENT",
    })
    .select("*")
    .single<CompanyRecord>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "client_company_created", "companies", data.id, {
    name: data.name,
    website: data.website,
  });

  return data;
}

export async function updateAdminClientCompany(
  user: AuthUser,
  companyId: string,
  input: {
    name: string;
    website?: string | null;
    linkedin_company_url?: string | null;
    relationship_stage: CompanyRelationshipStage;
  },
) {
  if (user.role !== "ADMIN") {
    throw new Error("Only admins can update client companies.");
  }

  if (!input.name.trim()) {
    throw new Error("Company name is required.");
  }

  const { data, error } = await supabase
    .from("companies")
    .update({
      name: input.name.trim(),
      website: toNullableString(input.website ?? undefined),
      linkedin_company_url: normalizeLinkedInCompanyUrl(input.linkedin_company_url),
      relationship_stage: input.relationship_stage,
    })
    .eq("id", companyId)
    .select("*")
    .single<CompanyRecord>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "admin_client_company_updated", "companies", data.id, {
    name: data.name,
    website: data.website,
    linkedin_company_url: data.linkedin_company_url,
    relationship_stage: data.relationship_stage,
  });

  return data;
}

export async function listProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*, companies(id, name)")
    .order("created_at", { ascending: false })
    .returns<ProfileRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function syncClerkUsers(input: { emails?: string[]; limit?: number } = {}) {
  const token = await getSupabaseAccessToken();

  if (!token) {
    throw new Error("Sign in before syncing Clerk users.");
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/sync-clerk-users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json().catch(() => ({}))) as SyncClerkUsersResult & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error || "Unable to sync Clerk users.");
  }

  return payload;
}

export async function createProspectRecommendation(user: AuthUser, input: ProspectInput) {
  if (user.role !== "BUM") {
    throw new Error("Only Bums can recommend prospects.");
  }

  const company = await ensureCompany({
    companyName: input.company_name,
    companyWebsite: input.company_website,
    linkedinCompanyUrl: input.linkedin_company_url,
    email: input.key_contact_email,
    relationshipStage: "PROSPECT",
  });

  const companyStage: CompanyRelationshipStage =
    company.relationship_stage === "CLIENT" ? "CLIENT" : "PROSPECT";

  if (company.relationship_stage !== companyStage) {
    const { error: companyStageError } = await supabase
      .from("companies")
      .update({ relationship_stage: companyStage })
      .eq("id", company.id);

    if (companyStageError) {
      throw companyStageError;
    }
  }

  const { data: recommendation, error: recommendationError } = await supabase
    .from("prospect_recommendations")
    .upsert(
      {
        company_id: company.id,
        bum_user_id: user.id,
        invite_owner: input.invite_owner,
        status: companyStage === "CLIENT" ? "CLIENT" : "PROSPECT",
        notes: toNullableString(input.notes),
      },
      { onConflict: "company_id,bum_user_id" },
    )
    .select("*, companies(id, name, website, relationship_stage, linkedin_company_url), profiles(id, full_name, email)")
    .single<ProspectRecommendationRecord>();

  if (recommendationError) {
    throw recommendationError;
  }

  const existingPrimaryContactQuery = await supabase
    .from("prospect_contacts")
    .select("*")
    .eq("recommendation_id", recommendation.id)
    .eq("is_primary", true)
    .limit(1)
    .maybeSingle<ProspectContactRecord>();

  if (existingPrimaryContactQuery.error) {
    throw existingPrimaryContactQuery.error;
  }

  if (existingPrimaryContactQuery.data) {
    const { error } = await supabase
      .from("prospect_contacts")
      .update({
        full_name: input.key_contact_name.trim(),
        title: toNullableString(input.key_contact_title),
        email: toNullableString(input.key_contact_email),
        linkedin_url: normalizeLinkedInCompanyUrl(input.key_contact_linkedin_url),
      })
      .eq("id", existingPrimaryContactQuery.data.id);

    if (error) {
      throw error;
    }
  } else {
    const { error } = await supabase.from("prospect_contacts").insert({
      company_id: company.id,
      recommendation_id: recommendation.id,
      full_name: input.key_contact_name.trim(),
      title: toNullableString(input.key_contact_title),
      email: toNullableString(input.key_contact_email),
      linkedin_url: normalizeLinkedInCompanyUrl(input.key_contact_linkedin_url),
      is_primary: true,
    });

    if (error) {
      throw error;
    }
  }

  const { error: auditError } = await supabase.from("audit_events").insert({
    company_id: company.id,
    user_id: user.id,
    event_type: "prospect_recommended",
    entity_type: "prospect_recommendations",
    entity_id: recommendation.id,
    event_data: {
      invite_owner: input.invite_owner,
      company_name: company.name,
    },
  });

  if (auditError) {
    throw auditError;
  }

  return recommendation;
}

export async function listOwnProspectRecommendations(userId: string) {
  const { data, error } = await supabase
    .from("prospect_recommendations")
    .select("*, companies(id, name, website, relationship_stage, linkedin_company_url), profiles(id, full_name, email)")
    .eq("bum_user_id", userId)
    .order("created_at", { ascending: false })
    .returns<ProspectRecommendationRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listAdminProspectRecommendations() {
  const { data, error } = await supabase
    .from("prospect_recommendations")
    .select("*, companies(id, name, website, relationship_stage, linkedin_company_url), profiles(id, full_name, email)")
    .order("created_at", { ascending: false })
    .returns<ProspectRecommendationRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listProspectContacts() {
  const { data, error } = await supabase
    .from("prospect_contacts")
    .select("*, prospect_recommendations(id, bum_user_id)")
    .order("created_at", { ascending: false })
    .returns<ProspectContactRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createReverseOpportunity(user: AuthUser, input: ReverseOpportunityInput) {
  if (user.role !== "BUM") {
    throw new Error("Only Bums can submit reverse opportunities.");
  }

  let vendorCompany: CompanyRecord | null = null;
  let clientMode = input.client_mode;

  if (input.client_mode === "EXISTING_CLIENT") {
    if (!input.vendor_company_id) {
      throw new Error("Choose an existing client company.");
    }

    vendorCompany = await getCompanyById(input.vendor_company_id);

    if (!vendorCompany) {
      throw new Error("We could not find that client company.");
    }
  } else {
    if (!input.prospect_client_name?.trim()) {
      throw new Error("Add the prospect client company name.");
    }

    vendorCompany = await ensureCompany({
      companyName: input.prospect_client_name,
      companyWebsite: input.prospect_client_website,
      linkedinCompanyUrl: input.prospect_client_linkedin_url,
      email: input.vendor_contact_email,
      relationshipStage: "PROSPECT",
    });
  }

  if (vendorCompany.relationship_stage === "CLIENT") {
    clientMode = "EXISTING_CLIENT";
  }

  const { data, error } = await supabase
    .from("reverse_opportunities")
    .insert({
      bum_user_id: user.id,
      vendor_company_id: vendorCompany.id,
      client_mode: clientMode,
      status: "SUBMITTED",
      vendor_contact_name: toNullableString(input.vendor_contact_name),
      vendor_contact_title: toNullableString(input.vendor_contact_title),
      vendor_contact_email: toNullableString(input.vendor_contact_email),
      vendor_contact_linkedin_url: toNullableString(input.vendor_contact_linkedin_url),
      customer_company_name: input.customer_company_name.trim(),
      customer_company_website: toNullableString(input.customer_company_website),
      customer_contact_name: toNullableString(input.customer_contact_name),
      customer_contact_title: toNullableString(input.customer_contact_title),
      customer_contact_email: toNullableString(input.customer_contact_email),
      customer_need_summary: input.customer_need_summary.trim(),
      expected_product_service: toNullableString(input.expected_product_service),
      estimated_deal_value: input.estimated_deal_value ?? null,
      expected_timeline: toNullableString(input.expected_timeline),
      notes: toNullableString(input.notes),
    })
    .select("*, companies(id, name, website, relationship_stage, linkedin_company_url), profiles(id, full_name, email)")
    .single<ReverseOpportunityRecord>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "reverse_opportunity_created", "reverse_opportunities", data.id, {
    vendor_company_id: data.vendor_company_id,
    customer_company_name: data.customer_company_name,
    status: data.status,
  });
  await createAuditEvent(user, "admin_notification_queued", "reverse_opportunities", data.id, {
    message: "New reverse opportunity submitted for admin review.",
  });

  return data;
}

export async function listOwnReverseOpportunities(userId: string) {
  const { data, error } = await supabase
    .from("reverse_opportunities")
    .select("*, companies(id, name, website, relationship_stage, linkedin_company_url), profiles(id, full_name, email)")
    .eq("bum_user_id", userId)
    .order("created_at", { ascending: false })
    .returns<ReverseOpportunityRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listAdminReverseOpportunities() {
  const { data, error } = await supabase
    .from("reverse_opportunities")
    .select("*, companies(id, name, website, relationship_stage, linkedin_company_url), profiles(id, full_name, email)")
    .order("created_at", { ascending: false })
    .returns<ReverseOpportunityRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listClientReverseOpportunities(user: AuthUser) {
  if (user.role !== "CLIENT" || !user.clientId) {
    throw new Error("Only client users linked to a company can read reverse opportunities.");
  }

  const { data, error } = await supabase
    .from("reverse_opportunities")
    .select("*, companies(id, name, website, relationship_stage, linkedin_company_url), profiles(id, full_name, email)")
    .eq("vendor_company_id", user.clientId)
    .order("created_at", { ascending: false })
    .returns<ReverseOpportunityRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function updateReverseOpportunityStatus(
  user: AuthUser,
  reverseOpportunityId: string,
  status: ReverseOpportunityStatus,
) {
  const { data, error } = await supabase
    .from("reverse_opportunities")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", reverseOpportunityId)
    .select("*, companies(id, name, website, relationship_stage, linkedin_company_url), profiles(id, full_name, email)")
    .single<ReverseOpportunityRecord>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "reverse_opportunity_status_changed", "reverse_opportunities", data.id, {
    status,
  });

  return data;
}

export async function createCustomerTarget(user: AuthUser, input: CustomerTargetInput) {
  if (user.role !== "CLIENT" || !user.clientId) {
    throw new Error("Only client users linked to a company can create target accounts.");
  }

  const targetCompany = await ensureCompany({
    companyName: input.target_account_name,
    companyWebsite: input.company_website,
    linkedinCompanyUrl: input.linkedin_company_url,
    email: input.key_contact_email,
    relationshipStage: "INACTIVE",
  });

  const { data, error } = await supabase
    .from("customer_targets")
    .upsert(
      {
        client_company_id: user.clientId,
        target_company_id: targetCompany.id,
        created_by: user.id,
        status: input.status ?? "PROSPECT",
        priority: input.priority ?? "MEDIUM",
        target_account_name: input.target_account_name.trim(),
        business_unit: toNullableString(input.business_unit),
        key_contact_name: toNullableString(input.key_contact_name),
        key_contact_title: toNullableString(input.key_contact_title),
        key_contact_email: toNullableString(input.key_contact_email),
        expected_product_service: toNullableString(input.expected_product_service),
        estimated_deal_value: input.estimated_deal_value ?? null,
        expected_timeline: toNullableString(input.expected_timeline),
        notes: toNullableString(input.notes),
      },
      { onConflict: "client_company_id,target_company_id" },
    )
    .select("*, client_companies:companies!customer_targets_client_company_id_fkey(id, name), target_companies:companies!customer_targets_target_company_id_fkey(id, name, website, linkedin_company_url), profiles(id, full_name, email)")
    .single<CustomerTargetRecord>();

  if (error) {
    throw error;
  }

  const { error: auditError } = await supabase.from("audit_events").insert({
    company_id: user.clientId,
    user_id: user.id,
    event_type: "customer_target_created",
    entity_type: "customer_targets",
    entity_id: data.id,
    event_data: {
      target_company_id: targetCompany.id,
      target_account_name: input.target_account_name.trim(),
      status: data.status,
    },
  });

  if (auditError) {
    throw auditError;
  }

  return data;
}

export async function listCustomerTargets(user?: Pick<AuthUser, "role" | "clientId"> | null) {
  let query = supabase
    .from("customer_targets")
    .select("*, client_companies:companies!customer_targets_client_company_id_fkey(id, name), target_companies:companies!customer_targets_target_company_id_fkey(id, name, website, linkedin_company_url), profiles(id, full_name, email)")
    .order("created_at", { ascending: false });

  if (user?.role === "CLIENT" && user.clientId) {
    query = query.eq("client_company_id", user.clientId);
  }

  const { data, error } = await query.returns<CustomerTargetRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listTeamsMeetings() {
  const { data, error } = await supabase
    .from("teams_meetings")
    .select("*, customer_targets(id, target_account_name, key_contact_name, key_contact_email, client_companies:companies!customer_targets_client_company_id_fkey(id, name), target_companies:companies!customer_targets_target_company_id_fkey(id, name, website)), profiles(id, full_name, email)")
    .order("start_time", { ascending: true })
    .returns<TeamsMeetingRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listMeetingTranscripts(filters: MeetingTranscriptFilters = {}) {
  let query = supabase
    .from("meeting_transcripts")
    .select("*, teams_meetings(id, subject, start_time, teams_join_url), opportunity_registrations(id, target_account_name), customer_targets(id, target_account_name)")
    .order("created_at", { ascending: false });

  if (filters.opportunityRegistrationId) {
    query = query.eq("opportunity_registration_id", filters.opportunityRegistrationId);
  }
  if (filters.customerTargetId) {
    query = query.eq("customer_target_id", filters.customerTargetId);
  }
  if (filters.teamsMeetingId) {
    query = query.eq("teams_meeting_id", filters.teamsMeetingId);
  }

  const { data, error } = await query.returns<MeetingTranscriptRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createMeetingTranscript(user: AuthUser, input: MeetingTranscriptInput) {
  if (user.role !== "ADMIN" && user.role !== "CLIENT") {
    throw new Error("Only Clients and Admins can add meeting transcripts.");
  }

  let companyId = input.companyId ?? null;

  if (!companyId && input.opportunityRegistrationId) {
    const { data, error } = await supabase
      .from("opportunity_registrations")
      .select("company_id")
      .eq("id", input.opportunityRegistrationId)
      .maybeSingle<Pick<OpportunityRegistration, "company_id">>();

    if (error) {
      throw error;
    }
    companyId = data?.company_id ?? null;
  }

  if (!companyId && input.customerTargetId) {
    const { data, error } = await supabase
      .from("customer_targets")
      .select("client_company_id")
      .eq("id", input.customerTargetId)
      .maybeSingle<Pick<CustomerTargetRecord, "client_company_id">>();

    if (error) {
      throw error;
    }
    companyId = data?.client_company_id ?? null;
  }

  const { data, error } = await supabase
    .from("meeting_transcripts")
    .insert({
      teams_meeting_id: input.teamsMeetingId ?? null,
      customer_target_id: input.customerTargetId ?? null,
      opportunity_registration_id: input.opportunityRegistrationId ?? null,
      opportunity_claim_id: input.opportunityClaimId ?? null,
      company_id: companyId,
      created_by: user.id,
      source: input.source ?? "MANUAL",
      status: input.status ?? "AVAILABLE",
      title: input.title?.trim() || "Teams meeting transcript",
      transcript_text: toNullableString(input.transcriptText),
      transcript_url: toNullableString(input.transcriptUrl),
      content_type: input.contentType ?? "text/plain",
      graph_transcript_id: toNullableString(input.graphTranscriptId),
      captured_at: input.capturedAt ?? new Date().toISOString(),
    })
    .select("*")
    .single<MeetingTranscriptRecord>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "meeting_transcript_created", "meeting_transcripts", data.id, {
    opportunity_registration_id: data.opportunity_registration_id,
    customer_target_id: data.customer_target_id,
    source: data.source,
  });

  return data;
}

export async function createCustomerTargetResponse(user: AuthUser, input: CustomerTargetResponseInput) {
  if (user.role !== "BUM") {
    throw new Error("Only Bums can respond to target account opportunities.");
  }

  const { data: target, error: targetError } = await supabase
    .from("customer_targets")
    .select("id, client_company_id")
    .eq("id", input.customerTargetId)
    .maybeSingle<Pick<CustomerTargetRecord, "id" | "client_company_id">>();

  if (targetError) {
    throw targetError;
  }

  if (!target) {
    throw new Error("That target account is no longer available.");
  }

  const { data, error } = await supabase
    .from("customer_target_responses")
    .insert({
      customer_target_id: target.id,
      client_company_id: target.client_company_id,
      bum_user_id: user.id,
      contact_name: input.contactName.trim(),
      contact_email: toNullableString(input.contactEmail),
      relationship_strength: input.relationshipStrength,
      note: toNullableString(input.note),
      status: "PROPOSED",
    })
    .select("*")
    .single<CustomerTargetResponseRecord>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "customer_target_response_created", "customer_target_responses", data.id, {
    customer_target_id: target.id,
    contact_name: data.contact_name,
    relationship_strength: data.relationship_strength,
  });

  return data;
}

export async function scheduleTeamsMeeting(input: ScheduleTeamsMeetingInput) {
  const accessToken = await getSupabaseAccessToken();

  if (!accessToken) {
    throw new Error("Sign in before scheduling a Teams meeting.");
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/schedule-teams-meeting`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json().catch(() => ({}))) as
    | ScheduleTeamsMeetingResponse
    | { error?: string };

  if (!response.ok) {
    throw new Error("error" in payload && payload.error ? payload.error : "Unable to schedule the Teams meeting.");
  }

  if (!("meeting" in payload)) {
    throw new Error("The Teams scheduler returned an incomplete response.");
  }

  return payload;
}

export async function syncTeamsMeetingAttendance(meetingIds: string[] = []) {
  const accessToken = await getSupabaseAccessToken();

  if (!accessToken) {
    throw new Error("Sign in before refreshing Teams attendance.");
  }

  const response = await fetch(supabaseUrl + "/functions/v1/sync-teams-attendees", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabasePublishableKey,
      Authorization: "Bearer " + accessToken,
    },
    body: JSON.stringify({ meetingIds }),
  });

  const payload = (await response.json().catch(() => ({}))) as SyncTeamsMeetingAttendanceResult | { error?: string };

  if (!response.ok) {
    throw new Error("error" in payload && payload.error ? payload.error : "Unable to refresh Teams attendance.");
  }

  if (!("updated" in payload) || !("failed" in payload)) {
    throw new Error("The Teams attendance sync returned an incomplete response.");
  }

  return payload;
}

export async function listAuditEvents() {
  const { data, error } = await supabase
    .from("audit_events")
    .select("*, companies(name)")
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<AuditEvent[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

const TRAINING_MATERIAL_ATTACHMENTS_BUCKET = "training-material-attachments";

function sanitizeAttachmentFileName(fileName: string) {
  const sanitized = fileName.trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return sanitized || "attachment";
}

async function uploadTrainingMaterialAttachment(user: AuthUser, material: TrainingMaterial, file: File) {
  const storageScope = material.company_id ?? "corporate";
  const storagePath = `${storageScope}/${material.id}/${crypto.randomUUID()}-${sanitizeAttachmentFileName(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from(TRAINING_MATERIAL_ATTACHMENTS_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data, error } = await supabase
    .from("training_material_attachments")
    .insert({
      training_material_id: material.id,
      company_id: material.company_id,
      uploaded_by: user.id,
      file_name: file.name || "Attachment",
      file_type: file.type || null,
      file_size: file.size,
      storage_bucket: TRAINING_MATERIAL_ATTACHMENTS_BUCKET,
      storage_path: storagePath,
    })
    .select("*")
    .single<TrainingMaterialAttachment>();

  if (error) {
    await supabase.storage.from(TRAINING_MATERIAL_ATTACHMENTS_BUCKET).remove([storagePath]);
    throw error;
  }

  return data;
}

export async function getTrainingMaterialAttachmentUrl(attachment: TrainingMaterialAttachment, expiresInSeconds = 60 * 10) {
  const { data, error } = await supabase.storage
    .from(attachment.storage_bucket)
    .createSignedUrl(attachment.storage_path, expiresInSeconds, {
      download: attachment.file_name,
    });

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

export async function listTrainingMaterialsForUser(user: AuthUser) {
  let query = supabase
    .from("training_materials")
    .select("*, companies(id, name), training_material_attachments(*)")
    .order("updated_at", { ascending: false });

  if (user.role === "CLIENT") {
    query = query.or(`company_id.eq.${user.clientId ?? "00000000-0000-0000-0000-000000000000"},company_id.is.null`);
  }

  const { data, error } = await query.returns<TrainingMaterial[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listClientTrainingMaterials(user: AuthUser) {
  return listTrainingMaterialsForUser(user);
}

export async function listMarketplaceTrainingMaterials() {
  const { data, error } = await supabase
    .from("training_materials")
    .select("*, companies(id, name), training_material_attachments(*)")
    .eq("is_published", true)
    .order("updated_at", { ascending: false })
    .returns<TrainingMaterial[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listPublishedClientTrainingMaterials(companyId: string) {
  const { data, error } = await supabase
    .from("training_materials")
    .select("*, companies(id, name), training_material_attachments(*)")
    .eq("is_published", true)
    .or(`company_id.eq.${companyId},company_id.is.null`)
    .order("updated_at", { ascending: false })
    .returns<TrainingMaterial[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createTrainingMaterial(user: AuthUser, input: TrainingMaterialInput) {
  const companyId = user.role === "CLIENT" ? user.clientId ?? null : input.company_id ?? null;

  if (user.role === "CLIENT" && !companyId) {
    throw new Error("This client user is not linked to a company yet.");
  }

  const { data, error } = await supabase
    .from("training_materials")
    .insert({
      company_id: companyId,
      created_by: user.id,
      title: input.title.trim(),
      description: toNullableString(input.description),
      technology: toNullableString(input.technology),
      resource_url: toNullableString(input.resource_url),
      is_published: input.is_published ?? true,
    })
    .select("*, companies(id, name)")
    .single<TrainingMaterial>();

  if (error) {
    throw error;
  }

  const attachments = input.attachments?.length
    ? await Promise.all(input.attachments.map((file) => uploadTrainingMaterialAttachment(user, data, file)))
    : [];

  await createAuditEvent(user, "training_material_created", "training_materials", data.id, {
    title: data.title,
    company_id: data.company_id,
    attachment_count: attachments.length,
  });

  return { ...data, training_material_attachments: attachments };
}

export async function inviteBum(input: BumInviteInput) {
  const token = await getSupabaseAccessToken();
  const response = await fetch(`${supabaseUrl}/functions/v1/invite-bum`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${token ?? supabasePublishableKey}`,
    },
    body: JSON.stringify({
      ...input,
      redirectUrl: new URL(`${import.meta.env.BASE_URL || "/"}login`, window.location.origin).toString(),
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as BumInviteResult & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error || "Unable to invite this Bum.");
  }

  return payload;
}

export async function getOwnBumProfile(userId: string) {
  const { data, error } = await supabase
    .from("bum_profiles")
    .select("*, profiles!bum_profiles_user_id_fkey(full_name, email, created_at)")
    .eq("user_id", userId)
    .maybeSingle<BumProfileRecord>();

  if (error) {
    throw error;
  }

  return data;
}

export async function upsertOwnBumProfile(user: AuthUser, input: BumProfileInput) {
  await ensureSupabaseProfileForAuthUser(user);

  const payload: Record<string, unknown> = {
    user_id: user.id,
    updated_at: new Date().toISOString(),
  };

  if (input.headline !== undefined) {
    payload.headline = toNullableString(input.headline);
  }

  if (input.bio !== undefined) {
    payload.bio = toNullableString(input.bio);
  }

  if (input.linkedin_url !== undefined) {
    payload.linkedin_url = toNullableString(input.linkedin_url);
  }

  if (input.years_experience !== undefined) {
    payload.years_experience = input.years_experience;
  }

  if (input.availability_status !== undefined) {
    payload.availability_status = input.availability_status;
  }

  if (input.home_region !== undefined) {
    payload.home_region = toNullableString(input.home_region);
  }

  if (input.industries !== undefined) {
    payload.industries = toUniqueTrimmedArray(input.industries);
  }

  if (input.regions !== undefined) {
    payload.regions = toUniqueTrimmedArray(input.regions);
  }

  if (input.products_sold !== undefined) {
    payload.products_sold = toUniqueTrimmedArray(input.products_sold);
  }

  if (input.buyer_personas !== undefined) {
    payload.buyer_personas = toUniqueTrimmedArray(input.buyer_personas);
  }

  if (input.worked_with_companies !== undefined) {
    payload.worked_with_companies = toUniqueTrimmedArray(input.worked_with_companies);
  }

  if (input.relationship_companies !== undefined) {
    payload.relationship_companies = toUniqueTrimmedArray(input.relationship_companies);
  }

  if (input.certifications !== undefined) {
    payload.certifications = toUniqueTrimmedArray(input.certifications);
  }

  if (input.skills !== undefined) {
    payload.skills = toUniqueTrimmedArray(input.skills);
  }

  if (input.notable_wins !== undefined) {
    payload.notable_wins = toNullableString(input.notable_wins);
  }

  if (input.verification_status !== undefined) {
    payload.verification_status = input.verification_status;
  }

  if (input.is_visible_to_clients !== undefined) {
    payload.is_visible_to_clients = input.is_visible_to_clients;
  }

  if (input.last_linkedin_imported_at !== undefined) {
    payload.last_linkedin_imported_at = input.last_linkedin_imported_at;
  }

  const { data, error } = await supabase
    .from("bum_profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select("*, profiles!bum_profiles_user_id_fkey(full_name, email, created_at)")
    .single<BumProfileRecord>();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateAdminBumProfile(user: AuthUser, targetUserId: string, input: BumProfileInput) {
  if (user.role !== "ADMIN") {
    throw new Error("Only admins can update Bum profiles.");
  }

  const payload: Record<string, unknown> = {
    user_id: targetUserId,
    updated_at: new Date().toISOString(),
  };

  if (input.headline !== undefined) {
    payload.headline = toNullableString(input.headline);
  }

  if (input.bio !== undefined) {
    payload.bio = toNullableString(input.bio);
  }

  if (input.linkedin_url !== undefined) {
    payload.linkedin_url = toNullableString(input.linkedin_url);
  }

  if (input.years_experience !== undefined) {
    payload.years_experience = input.years_experience;
  }

  if (input.availability_status !== undefined) {
    payload.availability_status = input.availability_status;
  }

  if (input.home_region !== undefined) {
    payload.home_region = toNullableString(input.home_region);
  }

  if (input.industries !== undefined) {
    payload.industries = toUniqueTrimmedArray(input.industries);
  }

  if (input.regions !== undefined) {
    payload.regions = toUniqueTrimmedArray(input.regions);
  }

  if (input.products_sold !== undefined) {
    payload.products_sold = toUniqueTrimmedArray(input.products_sold);
  }

  if (input.buyer_personas !== undefined) {
    payload.buyer_personas = toUniqueTrimmedArray(input.buyer_personas);
  }

  if (input.worked_with_companies !== undefined) {
    payload.worked_with_companies = toUniqueTrimmedArray(input.worked_with_companies);
  }

  if (input.relationship_companies !== undefined) {
    payload.relationship_companies = toUniqueTrimmedArray(input.relationship_companies);
  }

  if (input.certifications !== undefined) {
    payload.certifications = toUniqueTrimmedArray(input.certifications);
  }

  if (input.skills !== undefined) {
    payload.skills = toUniqueTrimmedArray(input.skills);
  }

  if (input.notable_wins !== undefined) {
    payload.notable_wins = toNullableString(input.notable_wins);
  }

  if (input.verification_status !== undefined) {
    payload.verification_status = input.verification_status;
  }

  if (input.is_visible_to_clients !== undefined) {
    payload.is_visible_to_clients = input.is_visible_to_clients;
  }

  if (input.last_linkedin_imported_at !== undefined) {
    payload.last_linkedin_imported_at = input.last_linkedin_imported_at;
  }

  const { data, error } = await supabase
    .from("bum_profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select("*, profiles!bum_profiles_user_id_fkey(full_name, email, created_at)")
    .single<BumProfileRecord>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "admin_bum_profile_updated", "bum_profiles", targetUserId, {
    fields: Object.keys(payload).filter((key) => key !== "user_id" && key !== "updated_at"),
  });

  return data;
}

export async function listAdminBumProfiles() {
  const { data, error } = await supabase
    .from("bum_profiles")
    .select("*, profiles!bum_profiles_user_id_fkey(full_name, email, created_at)")
    .order("updated_at", { ascending: false })
    .returns<BumProfileRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listVisibleBumProfiles() {
  const { data, error } = await supabase
    .from("bum_profiles")
    .select("*, profiles!bum_profiles_user_id_fkey(full_name, email, created_at)")
    .eq("is_visible_to_clients", true)
    .order("verification_status", { ascending: false })
    .order("updated_at", { ascending: false })
    .returns<BumProfileRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function invokeImpersonationFunction(accessToken: string, body: Record<string, unknown>) {
  const response = await fetch(`${supabaseUrl}/functions/v1/clerk-impersonation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => ({}))) as
    | ImpersonationTicketResponse
    | { error?: string };

  if (!response.ok) {
    throw new Error(payload.error || "Unable to complete impersonation.");
  }

  if (!("ticket" in payload) || typeof payload.ticket !== "string" || !payload.ticket) {
    throw new Error("The impersonation service returned an incomplete response.");
  }

  return payload;
}

export async function requestUserImpersonation(accessToken: string, targetUserId: string) {
  return invokeImpersonationFunction(accessToken, {
    action: "start",
    targetUserId,
  });
}

export async function exitUserImpersonation(accessToken: string) {
  return invokeImpersonationFunction(accessToken, {
    action: "stop",
  });
}
