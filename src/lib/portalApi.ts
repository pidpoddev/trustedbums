import { BUM_FALLBACK_TERMS_VERSION, FALLBACK_TERMS_VERSION, DEFAULT_COMMISSION_DURATION, type TermsFallbackVersion } from "@/data/partnerTerms";
import { getSupabaseAccessToken, supabase, supabasePublishableKey, supabaseUrl } from "@/lib/supabase";
import { DEFAULT_CLIENT_ACCESS_ROLE, type AuthUser, type ClientAccessRole } from "@/data/authData";
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
  description: string | null;
  target_industries: string[];
  target_regions: string[];
  ideal_customer_profile: string | null;
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
  client_access_role: string | null;
  last_sign_in_at: string | null;
  time_zone: string | null;
  date_format: string | null;
  invited_to_customer_introductions: boolean;
  created_at: string;
  companies?: Pick<CompanyRecord, "id" | "name"> | null;
}

export type ClerkPortalRole = "ADMIN" | "CLIENT" | "BUM";

export interface SyncClerkUsersResult {
  synced: Array<{ id: string; email: string; role: ClerkPortalRole; companyName?: string | null }>;
  skipped: Array<{ id?: string; email?: string; reason: string }>;
}

export interface ClerkAdminUserRecord {
  id: string | null;
  email: string;
  name: string;
  createdAt: string | null;
  updatedAt: string | null;
  lastSignInAt: string | null;
  publicMetadata: Record<string, unknown>;
  privateMetadata: Record<string, unknown>;
  unsafeMetadata: Record<string, unknown>;
  metadata: {
    role: ClerkPortalRole | null;
    companyId: string | null;
    companyName: string | null;
    companyWebsite: string | null;
  };
  profile: {
    id: string;
    companyId: string | null;
    companyName: string | null;
    fullName: string | null;
    email: string | null;
    role: string | null;
    isAdmin: boolean;
    createdAt: string;
    lastSignInAt: string | null;
  } | null;
}

export interface ClerkUserToolSyncResult {
  results: Array<{
    synced: boolean;
    id?: string | null;
    email?: string | null;
    role?: ClerkPortalRole;
    companyId?: string | null;
    companyName?: string | null;
    reason?: string;
  }>;
}

export interface ClerkUserAccessInput {
  userId: string;
  role: ClerkPortalRole;
  companyId?: string | null;
  companyName?: string | null;
  companyWebsite?: string | null;
}

export interface ClerkSupportLinkResult {
  url: string | null;
  token: string | null;
  expiresInSeconds: number;
}

export type AdminEmailRecipientGroup = "ALL_USERS" | "CLIENT_COMPANY" | "ALL_CLIENTS" | "ALL_BUMS" | "BUM_INDUSTRY_MATCH" | "ADMINS" | "CUSTOM";
export type AdminEmailTriggerEvent =
  | "MANUAL"
  | "CLIENT_SIGNUP_CREATED"
  | "BUM_SIGNUP_CREATED"
  | "CLIENT_USER_CREATED"
  | "OPPORTUNITY_CLAIM_CREATED"
  | "OPPORTUNITY_CLAIM_ACCEPTED"
  | "OPPORTUNITY_CLAIM_STATUS_CHANGED"
  | "OPPORTUNITY_QUESTION_CREATED"
  | "CUSTOMER_TARGET_RESPONSE_CREATED"
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

export type AdminEmailCampaignStatus = "DRAFT" | "SENT" | "FAILED" | "CANCELLED";

export interface AdminEmailCampaignRecord {
  id: string;
  template_id: string | null;
  template_slug: string | null;
  name: string;
  status: AdminEmailCampaignStatus;
  recipient_group: AdminEmailRecipientGroup;
  recipient_count: number;
  category: AdminEmailCategory;
  subject_snapshot: string;
  body_snapshot: string;
  metadata: Record<string, unknown>;
  created_by: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminEmailTriggerRuleRecord {
  id: string;
  name: string;
  trigger_event: Exclude<AdminEmailTriggerEvent, "MANUAL">;
  template_id: string;
  is_active: boolean;
  delay_minutes: number;
  conditions: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  admin_email_templates?: Pick<AdminEmailTemplateRecord, "id" | "name" | "slug"> | null;
}

export interface AdminEmailScheduleRecord {
  id: string;
  name: string;
  template_id: string;
  is_active: boolean;
  cron_expression: string;
  recipient_group: AdminEmailRecipientGroup;
  recipient_emails: string[];
  metadata: Record<string, unknown>;
  category: AdminEmailCategory;
  next_run_at: string | null;
  last_run_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  admin_email_templates?: Pick<AdminEmailTemplateRecord, "id" | "name" | "slug"> | null;
}

export interface AdminEmailBrandSettingsRecord {
  id: boolean;
  sender_name: string;
  logo_url: string;
  accent_color: string;
  footer_text: string;
  physical_address: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export type AdminEmailScheduleInput = Pick<AdminEmailScheduleRecord, "name" | "template_id" | "is_active" | "cron_expression" | "recipient_group" | "recipient_emails" | "metadata" | "category" | "next_run_at">;
export type AdminEmailTriggerRuleInput = Pick<AdminEmailTriggerRuleRecord, "name" | "trigger_event" | "template_id" | "is_active" | "delay_minutes" | "conditions">;
export type AdminEmailBrandSettingsInput = Pick<AdminEmailBrandSettingsRecord, "sender_name" | "logo_url" | "accent_color" | "footer_text" | "physical_address">;

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


export type BumRepresentedContactSource = "OPPORTUNITY_CLAIM" | "PROSPECT" | "TARGET_RESPONSE" | "EXTENSION_CAPTURE";

export interface BumRepresentedContactRecord {
  id: string;
  source: BumRepresentedContactSource;
  name: string;
  title: string | null;
  email: string | null;
  companyName: string;
  relationshipStrength: string | null;
  status: string;
  contextLabel: string;
  detailUrl: string;
  linkedinUrl: string | null;
  note: string | null;
  created_at: string;
}

interface ExtensionPageCaptureRecord {
  id: string;
  created_by: string;
  company_id: string | null;
  opportunity_registration_id: string | null;
  customer_target_id: string | null;
  capture_type: string;
  source_url: string;
  page_title: string | null;
  selected_text: string | null;
  note: string | null;
  status: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  opportunity_registrations?: Pick<OpportunityRegistration, "id" | "target_account_name" | "company_id"> & { companies?: Pick<CompanyRecord, "name"> | null } | null;
  customer_targets?: Pick<CustomerTargetRecord, "id" | "target_account_name"> & {
    client_companies?: Pick<CompanyRecord, "name"> | null;
    target_companies?: Pick<CompanyRecord, "name"> | null;
  } | null;
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

export interface ForceTranscriptSyncResult {
  checked: number;
  saved: number;
  pending: number;
  failed: number;
}

export type FeedbackType = "BUG" | "FEATURE" | "QUESTION" | "OTHER";
export type FeedbackStatus = "OPEN" | "IN_REVIEW" | "COMPLETE";

export interface FeedbackSubmissionRecord {
  id: string;
  created_by: string;
  company_id: string | null;
  role: string | null;
  client_access_role: string | null;
  submitter_name: string | null;
  submitter_email: string | null;
  type: FeedbackType;
  title: string;
  description: string;
  page_url: string;
  page_path: string;
  user_agent: string | null;
  status: FeedbackStatus;
  admin_notes: string | null;
  completed_at: string | null;
  completed_by: string | null;
  notification_sent_at: string | null;
  notification_error: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Pick<ProfileRecord, "id" | "full_name" | "email"> | null;
  companies?: Pick<CompanyRecord, "id" | "name"> | null;
}

export interface FeedbackInput {
  type: FeedbackType;
  title: string;
  description: string;
  pageUrl: string;
  pagePath: string;
  userAgent?: string;
  clientAccessRole?: string;
}

export interface FeedbackSubmitResult {
  feedback: FeedbackSubmissionRecord;
  emailSent: boolean;
  emailError?: string;
}

export type CustomerTargetResponseStrength = "warm" | "strong" | "advisor" | "unknown";

export interface CustomerTargetResponseRecord {
  id: string;
  customer_target_id: string;
  client_company_id: string;
  bum_user_id: string;
  opportunity_registration_id: string | null;
  opportunity_claim_id: string | null;
  contact_name: string;
  contact_email: string | null;
  relationship_strength: CustomerTargetResponseStrength;
  note: string | null;
  status: "PROPOSED" | "ACCEPTED" | "DECLINED" | "CONTACTED" | "MEETING_SET";
  created_at: string;
  updated_at: string;
  customer_targets?: Pick<CustomerTargetRecord, "id" | "target_account_name" | "business_unit" | "expected_product_service" | "estimated_deal_value" | "expected_timeline" | "notes" | "key_contact_name" | "key_contact_email"> & {
    client_companies?: Pick<CompanyRecord, "id" | "name"> | null;
    target_companies?: Pick<CompanyRecord, "id" | "name" | "website" | "linkedin_company_url"> | null;
  } | null;
  profiles?: Pick<ProfileRecord, "id" | "full_name" | "email"> | null;
  conversation_thread_id?: string | null;
  conversation_threads?: Array<{ id: string }> | { id: string } | null;
}

export interface CustomerTargetResponseInput {
  customerTargetId: string;
  contactName: string;
  contactEmail?: string;
  relationshipStrength: CustomerTargetResponseStrength;
  note?: string;
}

export interface CustomerTargetQuestionInput {
  customerTargetId: string;
  question: string;
}

export interface CustomerTargetResponseFormalizeInput {
  payProgramId: string;
  estimatedDealValue?: number | null;
  expectedTimeline?: string;
  notes?: string;
}

export interface OpportunityClaimSummaryRecord {
  id: string;
  opportunity_registration_id: string;
  company_id: string | null;
  bum_user_id: string;
  bum_display_name: string;
  status: OpportunityClaimStatus;
  created_at: string;
  updated_at: string;
}

export type ClientBumIntroRequestStatus = "SUBMITTED" | "IN_REVIEW" | "INTRO_REQUESTED" | "CLOSED";

export interface ClientBumIntroRequestRecord {
  id: string;
  client_company_id: string;
  client_user_id: string;
  bum_user_id: string;
  target_company_name: string;
  target_contact_name: string | null;
  target_contact_title: string | null;
  intro_context: string;
  notes: string | null;
  status: ClientBumIntroRequestStatus;
  created_at: string;
  updated_at: string;
}

export interface ClientBumIntroRequestInput {
  bumUserId: string;
  targetCompanyName: string;
  targetContactName?: string;
  targetContactTitle?: string;
  introContext: string;
  notes?: string;
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
  change_summary: string | null;
  audience: "CLIENT" | "BUM";
  is_custom: boolean;
  custom_label: string | null;
  created_by: string | null;
  is_active: boolean;
  created_at: string;
}

export interface TermsAssignmentRecord {
  id: string;
  terms_version_id: string;
  audience: "CLIENT" | "BUM";
  assigned_company_id: string | null;
  assigned_user_id: string | null;
  is_required: boolean;
  notes: string | null;
  assigned_by: string | null;
  created_at: string;
  due_at: string | null;
  terms_versions?: TermsVersion | null;
  companies?: Pick<CompanyRecord, "id" | "name"> | null;
  profiles?: Pick<ProfileRecord, "id" | "full_name" | "email"> | null;
}

export interface LegalDocumentRecord {
  slug: string;
  title: string;
  description: string;
  effective_date: string;
  sections: Array<{ title: string; body: string[] }>;
  is_published: boolean;
  draft_title: string | null;
  draft_description: string | null;
  draft_effective_date: string | null;
  draft_sections: Array<{ title: string; body: string[] }> | null;
  change_summary: string | null;
  created_by: string | null;
  updated_by: string | null;
  published_by: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
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
  terms_versions?: Pick<TermsVersion, "id" | "version" | "title" | "body" | "faq_body" | "change_summary" | "audience" | "is_custom" | "custom_label" | "created_at"> | null;
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
    "id" | "target_account_name" | "commission_rate" | "company_id" | "pay_program_id" | "commission_schedule_start_at"
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

export type OpportunityQuestionStatus = "OPEN" | "ANSWERED" | "CLOSED";
export type OpportunityQuestionVisibility = "BUM_ONLY" | "PUBLIC";

export interface OpportunityQuestionRecord {
  id: string;
  opportunity_registration_id: string;
  company_id: string;
  bum_user_id: string;
  question: string;
  status: OpportunityQuestionStatus;
  response: string | null;
  response_visibility: OpportunityQuestionVisibility | null;
  responded_by: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Pick<ProfileRecord, "id" | "full_name" | "email"> | null;
  responded_by_profile?: Pick<ProfileRecord, "id" | "full_name" | "email"> | null;
  opportunity_registrations?: Pick<OpportunityRegistration, "id" | "target_account_name" | "company_id" | "status"> & {
    companies?: Pick<CompanyRecord, "name"> | null;
  } | null;
  conversation_thread_id?: string | null;
  conversation_threads?: Array<{ id: string }> | { id: string } | null;
}

export interface OpportunityQuestionInput {
  opportunityId: string;
  question: string;
}

export interface OpportunityQuestionResponseInput {
  response: string;
  visibility: OpportunityQuestionVisibility;
}

export type ConversationContextType = "GENERAL" | "OPPORTUNITY" | "CUSTOMER_TARGET";
export type ConversationStatus = "OPEN" | "ARCHIVED";

export interface ConversationParticipantRecord {
  conversation_id: string;
  user_id: string;
  added_by: string | null;
  joined_at: string;
  last_read_at: string | null;
  profiles?: Pick<ProfileRecord, "id" | "full_name" | "email" | "role"> | null;
}

export interface ConversationMessageRecord {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  body: string;
  created_at: string;
  profiles?: Pick<ProfileRecord, "id" | "full_name" | "email" | "role"> | null;
}

export interface ConversationThreadRecord {
  id: string;
  subject: string;
  context_type: ConversationContextType;
  company_id: string | null;
  opportunity_registration_id: string | null;
  customer_target_id: string | null;
  opportunity_question_id: string | null;
  customer_target_response_id: string | null;
  created_by: string;
  status: ConversationStatus;
  created_at: string;
  updated_at: string;
  conversation_participants?: ConversationParticipantRecord[];
  conversation_messages?: ConversationMessageRecord[];
  opportunity_registrations?: Pick<OpportunityRegistration, "id" | "target_account_name"> | null;
  customer_targets?: Pick<CustomerTargetRecord, "id" | "target_account_name"> & {
    target_companies?: Pick<CompanyRecord, "id" | "name"> | null;
  } | null;
}

export interface ConversationThreadInput {
  subject?: string;
  message: string;
  contextType?: ConversationContextType;
  opportunityId?: string;
  customerTargetId?: string;
  participantUserIds?: string[];
  opportunityQuestionId?: string;
  customerTargetResponseId?: string;
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

export interface ClientTeamMemberRecord {
  id: string;
  company_id: string;
  full_name: string | null;
  email: string | null;
  role: "CLIENT";
  is_admin: boolean;
  client_access_role: ClientAccessRole;
  last_sign_in_at: string | null;
  created_at: string;
}

export interface ClientTeamInvitationRecord {
  id: string;
  company_id: string;
  email: string;
  full_name: string | null;
  client_access_role: ClientAccessRole;
  status: "pending" | "accepted" | "revoked" | "failed";
  invited_by: string | null;
  clerk_invitation_id: string | null;
  error_message: string | null;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientTeamResponse {
  members: ClientTeamMemberRecord[];
  invitations: ClientTeamInvitationRecord[];
}

export interface ClientTeamInviteInput {
  email: string;
  name?: string;
  clientAccessRole: ClientAccessRole;
}

export interface ClientTeamRoleInput {
  profileId: string;
  clientAccessRole: ClientAccessRole;
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

function areStringArraysEqual(left?: string[] | null, right: string[] = []) {
  const normalizedLeft = toUniqueTrimmedArray(left ?? []);
  const normalizedRight = toUniqueTrimmedArray(right);

  return (
    normalizedLeft.length === normalizedRight.length &&
    normalizedLeft.every((value, index) => value === normalizedRight[index])
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
  const matchedCompanyBefore = !existing?.company_id && user.role === "CLIENT" && user.companyName
    ? await findExistingCompanyMatch({ companyName: user.companyName, email: user.email })
    : null;
  const company =
    existing?.company_id
      ? await getCompanyById(existing.company_id)
      : user.role === "CLIENT" && user.companyName
        ? matchedCompanyBefore ?? await ensureCompany({
            companyName: user.companyName,
            email: user.email,
            relationshipStage: "CLIENT",
          })
        : null;
  const companyId = existing?.company_id ?? company?.id ?? null;
  const isNewProfile = !existing;

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
        client_access_role: user.role === "CLIENT"
          ? existing?.client_access_role ?? user.clientAccessRole ?? DEFAULT_CLIENT_ACCESS_ROLE
          : existing?.client_access_role ?? DEFAULT_CLIENT_ACCESS_ROLE,
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

  if (isNewProfile) {
    const templateSlug = user.role === "BUM"
      ? "bum_signup_admin"
      : user.role === "CLIENT" && matchedCompanyBefore
        ? "client_user_created_admin"
        : user.role === "CLIENT"
          ? "client_signup_admin"
          : null;
    const triggeredBy = user.role === "BUM"
      ? "BUM_SIGNUP_CREATED"
      : user.role === "CLIENT" && matchedCompanyBefore
        ? "CLIENT_USER_CREATED"
        : "CLIENT_SIGNUP_CREATED";

    const signupMetadata = {
      company_id: data.company_id ?? "",
      client_company_name: data.companies?.name ?? user.companyName ?? "",
      client_name: data.companies?.name ?? user.companyName ?? "",
      user_name: data.full_name ?? user.name,
      user_email: data.email ?? user.email,
      bum_name: data.full_name ?? user.name,
      recipient_name: data.full_name ?? user.name,
    };

    if (templateSlug) {
      await sendAdminEmail({
        mode: "action",
        templateSlug,
        metadata: signupMetadata,
        triggeredBy,
      }).catch((error) => {
        console.error("Unable to send signup notification", error);
      });
    }

    const welcomeTemplateSlug = user.role === "BUM" ? "bum_signup_welcome" : user.role === "CLIENT" ? "client_signup_welcome" : null;
    const recipientEmail = data.email ?? user.email;

    if (welcomeTemplateSlug && recipientEmail) {
      await sendAdminEmail({
        mode: "action",
        templateSlug: welcomeTemplateSlug,
        recipientEmails: [recipientEmail],
        metadata: signupMetadata,
        triggeredBy,
      }).catch((error) => {
        console.error("Unable to send signup welcome email", error);
      });
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
    .eq("audience", "CLIENT")
    .eq("is_custom", false)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<TermsVersion>();

  if (error || !data) {
    return FALLBACK_TERMS_VERSION;
  }

  return data;
}

export async function getDefaultBumTermsVersion() {
  const { data, error } = await supabase
    .from("terms_versions")
    .select("*")
    .eq("audience", "BUM")
    .eq("is_custom", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<TermsVersion>();

  if (error || !data) {
    return BUM_FALLBACK_TERMS_VERSION;
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
  const query = supabase
    .from("terms_acceptances")
    .select("*")
    .eq("terms_version_id", termsVersionId);

  const scopedQuery = companyId
    ? query.eq("company_id", companyId)
    : query.eq("user_id", userId).is("company_id", null);

  const { data, error } = await scopedQuery.order("accepted_at", { ascending: false }).limit(1).maybeSingle<TermsAcceptance>();

  if (error) {
    throw error;
  }

  return data;
}

const TERMS_ASSIGNMENT_SELECT = `
  *,
  companies:companies!terms_assignments_assigned_company_id_fkey(id, name),
  profiles:profiles!terms_assignments_assigned_user_id_fkey(id, full_name, email),
  terms_versions(*)
`;

export async function listRequiredTermsAssignmentsForUser(user: AuthUser) {
  const baseQuery = supabase
    .from("terms_assignments")
    .select(TERMS_ASSIGNMENT_SELECT)
    .eq("is_required", true)
    .order("created_at", { ascending: true });

  const query = user.role === "BUM"
    ? baseQuery.eq("assigned_user_id", user.id)
    : user.clientId
      ? baseQuery.eq("assigned_company_id", user.clientId)
      : baseQuery.eq("assigned_user_id", user.id);

  const { data, error } = await query.returns<TermsAssignmentRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getRequiredTermsForUser(user: AuthUser) {
  const defaultTerms = user.role === "BUM" ? await getDefaultBumTermsVersion() : await getActiveTermsVersion();
  const defaultAcceptance = await getCurrentTermsAcceptance(user.id, user.clientId, defaultTerms.id);

  if (!defaultAcceptance) {
    return { terms: defaultTerms, acceptance: null, assignment: null as TermsAssignmentRecord | null };
  }

  const assignments = await listRequiredTermsAssignmentsForUser(user);
  for (const assignment of assignments) {
    const assignedTerms = assignment.terms_versions;
    if (!assignedTerms) {
      continue;
    }

    const acceptance = await getCurrentTermsAcceptance(
      user.id,
      assignment.assigned_company_id ? user.clientId : undefined,
      assignedTerms.id,
    );

    if (!acceptance) {
      return { terms: assignedTerms, acceptance: null, assignment };
    }
  }

  return { terms: defaultTerms, acceptance: defaultAcceptance, assignment: null as TermsAssignmentRecord | null };
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
  const status = input.status ?? "Accepted";
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
  if (status === "Submitted") {
    await createAuditEvent(user, "admin_notification_queued", "opportunity_registrations", data.id, {
      message: "New opportunity registration submitted for admin review.",
    });
  } else if (status === "Accepted") {
    await createAuditEvent(user, "opportunity_auto_accepted", "opportunity_registrations", data.id, {
      message: "New opportunity registration auto-approved and published.",
    });
  }

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

export function buildTieredCommissionSummary(
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

export function resolveTieredCommissionRate(
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

export function getCommissionPlanInvoiceBlockReason(
  program:
    | Pick<ClientPayProgramRecord, "status" | "approval_status">
    | null
    | undefined,
) {
  if (!program) {
    return "This deal does not have a commission plan assigned.";
  }

  if (program.approval_status !== "APPROVED") {
    return "This deal's commission plan is not approved yet.";
  }

  if (program.status !== "ACTIVE") {
    return "This deal's commission plan is not active.";
  }

  return null;
}

export function calculateTrustedBumsCommission(
  program: Pick<
    ClientPayProgramRecord,
    "year_1_rate" | "year_2_rate" | "year_3_rate" | "year_4_rate" | "year_5_rate" | "year_6_plus_rate"
  >,
  scheduleStartAt: string | null | undefined,
  customerPaymentReceivedAt: string | null | undefined,
  commissionableAmount: number,
) {
  const commissionRate = resolveTieredCommissionRate(program, scheduleStartAt, customerPaymentReceivedAt);
  return {
    commissionRate,
    invoiceAmount: Number(((Number(commissionableAmount || 0) * commissionRate) / 100).toFixed(2)),
  };
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
    .select("*, opportunity_registrations(id, target_account_name, commission_rate, company_id, pay_program_id, commission_schedule_start_at, client_pay_programs(*)), profiles(id, full_name, email)")
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

  if (user.role === "CLIENT" && user.clientId !== claim.company_id) {
    throw new Error("That claim is not assigned to your company.");
  }

  const { data: opportunity, error: opportunityError } = await supabase
    .from("opportunity_registrations")
    .select("id, client_pay_programs(*)")
    .eq("id", claim.opportunity_registration_id)
    .maybeSingle<Pick<OpportunityRegistration, "id"> & { client_pay_programs?: ClientPayProgramRecord | null }>();

  if (opportunityError) {
    throw opportunityError;
  }

  const commissionPlanBlockReason = getCommissionPlanInvoiceBlockReason(opportunity?.client_pay_programs);
  if (commissionPlanBlockReason) {
    throw new Error(`${commissionPlanBlockReason} Assign an approved active commission plan before reporting a payment for invoice generation.`);
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

  if (user.role === "CLIENT" && user.clientId !== report.company_id) {
    throw new Error("That payment report is not assigned to your company.");
  }

  const program = report.opportunity_registrations.client_pay_programs;
  const commissionPlanBlockReason = getCommissionPlanInvoiceBlockReason(program);
  if (commissionPlanBlockReason || !program) {
    throw new Error(`${commissionPlanBlockReason ?? "This deal does not have a commission plan assigned."} Assign an approved active commission plan before generating an invoice.`);
  }

  const { commissionRate, invoiceAmount } = calculateTrustedBumsCommission(
    program,
    report.opportunity_registrations.commission_schedule_start_at,
    report.customer_payment_received_at,
    Number(report.commissionable_amount),
  );

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

async function upsertOpportunityClaimPublicSummary(claim: OpportunityClaimRecord, displayName?: string | null) {
  const bumDisplayName = displayName || claim.profiles?.full_name || claim.profiles?.email || "Trusted Bum";
  const { error } = await supabase.from("opportunity_claim_public_summaries").upsert(
    {
      id: claim.id,
      opportunity_registration_id: claim.opportunity_registration_id,
      company_id: claim.company_id,
      bum_user_id: claim.bum_user_id,
      bum_display_name: bumDisplayName,
      status: claim.status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error("Unable to update opportunity claim public summary", error);
  }
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

async function notifyClaimAccepted(user: AuthUser, claim: OpportunityClaimRecord, note?: string) {
  if (user.role !== "ADMIN" || !claim.profiles?.email) {
    return;
  }

  const company = claim.company_id ? await getCompanyById(claim.company_id) : null;
  await sendAdminEmail({
    mode: "action",
    templateSlug: "opportunity_claim_accepted_bum",
    recipientEmails: [claim.profiles.email],
    metadata: {
      bum_name: claim.profiles.full_name ?? claim.profiles.email,
      target_account_name: claim.opportunity_registrations?.target_account_name ?? "this opportunity",
      contact_name: claim.contact_name,
      contact_company: claim.contact_company,
      client_name: company?.name ?? "the client",
      admin_note: note ?? claim.note ?? "",
    },
    triggeredBy: "OPPORTUNITY_CLAIM_ACCEPTED",
  }).catch((error) => {
    console.error("Unable to send claim accepted notification", error);
  });
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
    .select("*, opportunity_registrations(id, target_account_name, commission_rate, company_id, pay_program_id, commission_schedule_start_at, client_pay_programs(*)), profiles(id, full_name, email)")
    .single<OpportunityClaimRecord>();

  if (error) {
    throw error;
  }

  await rebalanceOpportunityClaimShares(data.opportunity_registration_id);
  await upsertOpportunityClaimPublicSummary(data);
  await createAuditEvent(user, "opportunity_claim_updated", "opportunity_claims", data.id, {
    fields: Object.keys(payload),
  });

  if (updates.status === "APPROVED" && claim.status !== "APPROVED") {
    await notifyClaimAccepted(user, data, updates.note);
  }

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
  await upsertOpportunityClaimPublicSummary(data, user.name || user.email);

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

const OPPORTUNITY_QUESTION_SELECT = "*, profiles:profiles!opportunity_questions_bum_user_id_fkey(id, full_name, email), responded_by_profile:profiles!opportunity_questions_responded_by_fkey(id, full_name, email), opportunity_registrations(id, target_account_name, company_id, status, companies(name)), conversation_threads(id)";

function embeddedConversationThreadId(record: { conversation_thread_id?: string | null; conversation_threads?: Array<{ id: string }> | { id: string } | null }) {
  if (record.conversation_thread_id) {
    return record.conversation_thread_id;
  }

  const embedded = Array.isArray(record.conversation_threads) ? record.conversation_threads[0] : record.conversation_threads;
  return embedded?.id ?? null;
}

function normalizeOpportunityQuestion(question: OpportunityQuestionRecord): OpportunityQuestionRecord {
  return { ...question, conversation_thread_id: embeddedConversationThreadId(question) };
}

function normalizeCustomerTargetResponse(response: CustomerTargetResponseRecord): CustomerTargetResponseRecord {
  return { ...response, conversation_thread_id: embeddedConversationThreadId(response) };
}

function getPortalOrigin() {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  return "https://trustedbums.com";
}

const CONVERSATION_THREAD_SELECT = "*, conversation_participants(*, profiles:profiles!conversation_participants_user_id_fkey(id, full_name, email, role)), conversation_messages(*, profiles:profiles!conversation_messages_sender_user_id_fkey(id, full_name, email, role)), opportunity_registrations(id, target_account_name), customer_targets(id, target_account_name, target_companies:companies!customer_targets_target_company_id_fkey(id, name))";

function sortConversationThread(thread: ConversationThreadRecord) {
  return {
    ...thread,
    conversation_messages: [...(thread.conversation_messages ?? [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    conversation_participants: [...(thread.conversation_participants ?? [])].sort((a, b) => {
      const aName = a.profiles?.full_name ?? a.profiles?.email ?? a.user_id;
      const bName = b.profiles?.full_name ?? b.profiles?.email ?? b.user_id;
      return aName.localeCompare(bName);
    }),
  };
}

async function loadConversationThread(threadId: string) {
  const { data, error } = await supabase
    .from("conversation_threads")
    .select(CONVERSATION_THREAD_SELECT)
    .eq("id", threadId)
    .single<ConversationThreadRecord>();

  if (error) {
    throw error;
  }

  return sortConversationThread(data);
}

async function clientParticipantIds(companyId: string | null) {
  if (!companyId) {
    return [];
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("company_id", companyId)
    .eq("role", "CLIENT")
    .returns<Array<Pick<ProfileRecord, "id">>>();

  if (error) {
    throw error;
  }

  return (data ?? []).map((profile) => profile.id);
}

export async function listConversationThreads() {
  const { data, error } = await supabase
    .from("conversation_threads")
    .select(CONVERSATION_THREAD_SELECT)
    .eq("status", "OPEN")
    .order("updated_at", { ascending: false })
    .returns<ConversationThreadRecord[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).map(sortConversationThread);
}

export async function createConversationThread(user: AuthUser, input: ConversationThreadInput) {
  const message = input.message.trim();
  if (!message) {
    throw new Error("Add a message before starting the conversation.");
  }

  let companyId: string | null = user.clientId ?? null;
  if (!companyId && user.role === "CLIENT") {
    const { data: ownProfile, error: ownProfileError } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle<Pick<ProfileRecord, "company_id">>();

    if (ownProfileError) {
      throw ownProfileError;
    }

    companyId = ownProfile?.company_id ?? null;
  }

  if (!companyId && user.role === "CLIENT") {
    throw new Error("Your client profile is not linked to a company yet.");
  }

  let subject = input.subject?.trim() || "Conversation";
  let contextType: ConversationContextType = input.contextType ?? "GENERAL";
  let opportunityRegistrationId: string | null = null;
  let customerTargetId: string | null = null;

  if (input.opportunityId) {
    const { data: opportunity, error } = await supabase
      .from("opportunity_registrations")
      .select("id, company_id, target_account_name")
      .eq("id", input.opportunityId)
      .maybeSingle<Pick<OpportunityRegistration, "id" | "company_id" | "target_account_name">>();

    if (error) throw error;
    if (!opportunity?.company_id) throw new Error("That opportunity is no longer available.");

    companyId = opportunity.company_id;
    opportunityRegistrationId = opportunity.id;
    contextType = "OPPORTUNITY";
    subject = input.subject?.trim() || `Question: ${opportunity.target_account_name}`;
  }

  if (input.customerTargetId) {
    const { data: target, error } = await supabase
      .from("customer_targets")
      .select("id, client_company_id, target_account_name, target_companies:companies!customer_targets_target_company_id_fkey(name)")
      .eq("id", input.customerTargetId)
      .maybeSingle<Pick<CustomerTargetRecord, "id" | "client_company_id" | "target_account_name"> & { target_companies?: Pick<CompanyRecord, "name"> | null }>();

    if (error) throw error;
    if (!target?.client_company_id) throw new Error("That target account is no longer available.");

    companyId = target.client_company_id;
    customerTargetId = target.id;
    contextType = "CUSTOMER_TARGET";
    subject = input.subject?.trim() || `Question: ${target.target_companies?.name ?? target.target_account_name}`;
  }

  const { data: thread, error: threadError } = await supabase
    .from("conversation_threads")
    .insert({
      subject,
      context_type: contextType,
      company_id: companyId,
      opportunity_registration_id: opportunityRegistrationId,
      customer_target_id: customerTargetId,
      opportunity_question_id: input.opportunityQuestionId ?? null,
      customer_target_response_id: input.customerTargetResponseId ?? null,
      created_by: user.id,
      status: "OPEN",
    })
    .select("id")
    .single<{ id: string }>();

  if (threadError) {
    throw threadError;
  }

  const participantIds = new Set<string>([user.id, ...(input.participantUserIds ?? [])]);
  for (const clientId of await clientParticipantIds(companyId)) {
    participantIds.add(clientId);
  }

  const participantRows = Array.from(participantIds).filter(Boolean).map((participantId) => ({
    conversation_id: thread.id,
    user_id: participantId,
    added_by: user.id,
  }));

  if (participantRows.length) {
    const { error } = await supabase.from("conversation_participants").insert(participantRows);
    if (error && error.code !== "23505") {
      throw error;
    }
  }

  const { error: messageError } = await supabase.from("conversation_messages").insert({
    conversation_id: thread.id,
    sender_user_id: user.id,
    body: message,
  });

  if (messageError) {
    throw messageError;
  }

  await supabase.from("conversation_threads").update({ updated_at: new Date().toISOString() }).eq("id", thread.id);

  await createAuditEvent(user, "conversation_thread_created", "conversation_threads", thread.id, {
    context_type: contextType,
    opportunity_registration_id: opportunityRegistrationId,
    customer_target_id: customerTargetId,
  });

  return loadConversationThread(thread.id);
}

export async function sendConversationMessage(user: AuthUser, conversationId: string, body: string) {
  const message = body.trim();
  if (!message) {
    throw new Error("Add a message before sending.");
  }

  const { error } = await supabase.from("conversation_messages").insert({
    conversation_id: conversationId,
    sender_user_id: user.id,
    body: message,
  });

  if (error) {
    throw error;
  }

  await supabase.from("conversation_threads").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
  return loadConversationThread(conversationId);
}

export async function addConversationParticipantByEmail(user: AuthUser, conversationId: string, email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error("Enter an email address to add.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email")
    .ilike("email", normalizedEmail)
    .maybeSingle<Pick<ProfileRecord, "id" | "email">>();

  if (profileError) {
    throw profileError;
  }

  if (!profile) {
    throw new Error("No Trusted Bums user was found for that email.");
  }

  const { error } = await supabase.from("conversation_participants").insert({
    conversation_id: conversationId,
    user_id: profile.id,
    added_by: user.id,
  });

  if (error && error.code !== "23505") {
    throw error;
  }

  return loadConversationThread(conversationId);
}

export async function listOpportunityQuestionsForBum(opportunityId: string) {
  const { data, error } = await supabase
    .from("opportunity_questions")
    .select(OPPORTUNITY_QUESTION_SELECT)
    .eq("opportunity_registration_id", opportunityId)
    .order("created_at", { ascending: false })
    .returns<OpportunityQuestionRecord[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).map(normalizeOpportunityQuestion);
}

export async function listClientOpportunityQuestions(user: AuthUser) {
  if (user.role !== "CLIENT" || !user.clientId) {
    throw new Error("Only client users can load opportunity questions.");
  }

  const { data, error } = await supabase
    .from("opportunity_questions")
    .select(OPPORTUNITY_QUESTION_SELECT)
    .eq("company_id", user.clientId)
    .order("created_at", { ascending: false })
    .returns<OpportunityQuestionRecord[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).map(normalizeOpportunityQuestion);
}

export async function createOpportunityQuestion(user: AuthUser, input: OpportunityQuestionInput) {
  if (user.role !== "BUM") {
    throw new Error("Only Bums can request more information about opportunities.");
  }

  const question = input.question.trim();
  if (!question) {
    throw new Error("Add your question before sending the request.");
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

  if (!opportunity?.company_id) {
    throw new Error("That opportunity is no longer available for questions.");
  }

  const { data, error } = await supabase
    .from("opportunity_questions")
    .insert({
      opportunity_registration_id: opportunity.id,
      company_id: opportunity.company_id,
      bum_user_id: user.id,
      question,
      status: "OPEN",
    })
    .select(OPPORTUNITY_QUESTION_SELECT)
    .single<OpportunityQuestionRecord>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "opportunity_question_created", "opportunity_questions", data.id, {
    opportunity_registration_id: opportunity.id,
    target_account_name: opportunity.target_account_name,
  });

  let conversationThreadId: string | null = null;
  await createConversationThread(user, {
    contextType: "OPPORTUNITY",
    opportunityId: opportunity.id,
    opportunityQuestionId: data.id,
    subject: `Question: ${opportunity.target_account_name}`,
    message: question,
  })
    .then((thread) => {
      conversationThreadId = thread.id;
    })
    .catch((error) => {
      console.error("Unable to create opportunity question conversation", error);
    });

  const opportunityUrl = `${getPortalOrigin()}/client/opportunities?tab=questions&opportunityId=${encodeURIComponent(opportunity.id)}`;
  await sendAdminEmail({
    mode: "action",
    templateSlug: "opportunity_question_created_client",
    metadata: {
      company_id: opportunity.company_id,
      client_name: "client team",
      target_account_name: opportunity.target_account_name,
      bum_name: user.name || user.email,
      question,
      opportunity_url: opportunityUrl,
    },
    triggeredBy: "OPPORTUNITY_QUESTION_CREATED",
  }).catch((error) => {
    console.error("Unable to send opportunity question notification", error);
  });

  return normalizeOpportunityQuestion({ ...data, conversation_thread_id: conversationThreadId });
}

export async function respondToOpportunityQuestion(user: AuthUser, questionId: string, input: OpportunityQuestionResponseInput) {
  if (user.role !== "CLIENT" || !user.clientId) {
    throw new Error("Only client users can answer opportunity questions.");
  }

  const response = input.response.trim();
  if (!response) {
    throw new Error("Add a response before sending it.");
  }

  const { data, error } = await supabase
    .from("opportunity_questions")
    .update({
      response,
      response_visibility: input.visibility,
      responded_by: user.id,
      responded_at: new Date().toISOString(),
      status: "ANSWERED",
    })
    .eq("id", questionId)
    .eq("company_id", user.clientId)
    .select(OPPORTUNITY_QUESTION_SELECT)
    .single<OpportunityQuestionRecord>();

  if (error) {
    throw error;
  }

  const normalizedQuestion = normalizeOpportunityQuestion(data);

  if (normalizedQuestion.conversation_thread_id) {
    await sendConversationMessage(user, normalizedQuestion.conversation_thread_id, response).catch((messageError) => {
      console.error("Unable to add opportunity question response to conversation", messageError);
    });
  }

  await createAuditEvent(user, "opportunity_question_answered", "opportunity_questions", data.id, {
    opportunity_registration_id: data.opportunity_registration_id,
    response_visibility: data.response_visibility,
  });

  return normalizedQuestion;
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
    .select("*, opportunity_registrations(id, target_account_name, commission_rate, company_id, pay_program_id, commission_schedule_start_at, client_pay_programs(*)), profiles(id, full_name, email)")
    .single<OpportunityClaimRecord>();

  if (error) {
    throw error;
  }

  await rebalanceOpportunityClaimShares(data.opportunity_registration_id);
  await upsertOpportunityClaimPublicSummary(data);

  await createAuditEvent(user, "opportunity_claim_status_changed", "opportunity_claims", data.id, {
    status,
  });

  if (status === "APPROVED") {
    await notifyClaimAccepted(user, data, note);
  }

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

export async function createTermsVersion(
  user: AuthUser,
  input: Pick<TermsVersion, "version" | "title" | "body" | "faq_body" | "change_summary"> &
    Partial<Pick<TermsVersion, "audience" | "is_custom" | "custom_label" | "is_active">>,
) {
  const audience = input.audience ?? "CLIENT";
  const isCustom = input.is_custom ?? false;
  const shouldActivate = audience === "CLIENT" && !isCustom && Boolean(input.is_active);
  if (shouldActivate) {
    await supabase
      .from("terms_versions")
      .update({ is_active: false })
      .eq("audience", "CLIENT")
      .eq("is_custom", false)
      .eq("is_active", true);
  }

  const payload = { ...input, audience, is_custom: isCustom, custom_label: input.custom_label ?? null, is_active: shouldActivate, created_by: user.id };
  const { data, error } = await supabase.from("terms_versions").insert(payload).select("*").single<TermsVersion>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "terms_version_created", "terms_versions", data.id, { version: data.version });
  return data;
}

export async function activateTermsVersion(user: AuthUser, terms: TermsVersion) {
  if (terms.audience !== "CLIENT" || terms.is_custom) {
    throw new Error("Only standard Client contract versions can be activated globally.");
  }

  await supabase
    .from("terms_versions")
    .update({ is_active: false })
    .eq("audience", "CLIENT")
    .eq("is_custom", false)
    .eq("is_active", true);
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
    .select("*, companies(name), terms_versions(id, version, title, body, faq_body, change_summary, audience, is_custom, custom_label, created_at)")
    .order("accepted_at", { ascending: false })
    .returns<TermsAcceptance[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createTermsAssignment(
  user: AuthUser,
  input: Pick<TermsAssignmentRecord, "terms_version_id" | "audience" | "assigned_company_id" | "assigned_user_id" | "is_required" | "notes" | "due_at">,
) {
  const { data, error } = await supabase
    .from("terms_assignments")
    .insert({ ...input, assigned_by: user.id })
    .select(TERMS_ASSIGNMENT_SELECT)
    .single<TermsAssignmentRecord>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "terms_assignment_created", "terms_versions", input.terms_version_id, {
    audience: input.audience,
    assigned_company_id: input.assigned_company_id,
    assigned_user_id: input.assigned_user_id,
  });

  return data;
}

export async function listTermsAssignments() {
  const { data, error } = await supabase
    .from("terms_assignments")
    .select(TERMS_ASSIGNMENT_SELECT)
    .order("created_at", { ascending: false })
    .returns<TermsAssignmentRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getPublishedLegalDocument(slug: string) {
  const { data, error } = await supabase
    .from("legal_documents")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .limit(1)
    .maybeSingle<LegalDocumentRecord>();

  if (error) {
    throw error;
  }

  return data;
}

export async function listLegalDocuments() {
  const { data, error } = await supabase
    .from("legal_documents")
    .select("*")
    .order("updated_at", { ascending: false })
    .returns<LegalDocumentRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function saveLegalDocumentDraft(
  user: AuthUser,
  input: Pick<LegalDocumentRecord, "slug" | "title" | "description" | "effective_date" | "sections" | "change_summary">,
) {
  const payload = {
    slug: input.slug,
    title: input.title,
    description: input.description,
    effective_date: input.effective_date,
    sections: input.sections,
    draft_title: input.title,
    draft_description: input.description,
    draft_effective_date: input.effective_date,
    draft_sections: input.sections,
    change_summary: input.change_summary,
    updated_by: user.id,
    created_by: user.id,
  };

  const { data, error } = await supabase
    .from("legal_documents")
    .upsert(payload, { onConflict: "slug" })
    .select("*")
    .single<LegalDocumentRecord>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "legal_document_draft_saved", undefined, undefined, { slug: input.slug });
  return data;
}

export async function publishLegalDocument(
  user: AuthUser,
  input: Pick<LegalDocumentRecord, "slug" | "title" | "description" | "effective_date" | "sections" | "change_summary">,
) {
  const payload = {
    slug: input.slug,
    title: input.title,
    description: input.description,
    effective_date: input.effective_date,
    sections: input.sections,
    draft_title: input.title,
    draft_description: input.description,
    draft_effective_date: input.effective_date,
    draft_sections: input.sections,
    change_summary: input.change_summary,
    is_published: true,
    updated_by: user.id,
    published_by: user.id,
    created_by: user.id,
    published_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("legal_documents")
    .upsert(payload, { onConflict: "slug" })
    .select("*")
    .single<LegalDocumentRecord>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "legal_document_published", undefined, undefined, { slug: input.slug });
  return data;
}

type AdminEmailOperationResponse<T> = { data?: T; error?: string };
type AdminEmailFunctionResponse<T> = T & { error?: string };

async function invokeAdminEmailFunction<T>(body: Record<string, unknown>, fallbackError: string) {
  const token = await getSupabaseAccessToken("session");

  if (!token) {
    throw new Error("Sign in before using admin email tools.");
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/send-admin-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as AdminEmailFunctionResponse<T>;

  if (!response.ok || data.error) {
    throw new Error(data.error || fallbackError);
  }

  return data;
}

async function invokeAdminEmailOperation<T>(operation: string, payload?: Record<string, unknown>) {
  const data = await invokeAdminEmailFunction<AdminEmailOperationResponse<T>>(
    { operation, payload: payload ?? {} },
    "Unable to run admin email tool.",
  );

  if (!Object.prototype.hasOwnProperty.call(data, "data")) {
    throw new Error("Email function returned no response.");
  }

  return data.data as T;
}

export async function listAdminEmailTemplates() {
  return await invokeAdminEmailOperation<AdminEmailTemplateRecord[]>("list_templates");
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

  return await invokeAdminEmailOperation<AdminEmailTemplateRecord>("create_template", {
    slug: input.slug?.trim() || slugifyEmailTemplateName(input.name),
    name: input.name,
    description: input.description,
    recipient_group: input.recipient_group,
    trigger_event: input.trigger_event,
    subject: input.subject,
    body: input.body,
    metadata_fields: input.metadata_fields,
    category: input.category,
    reply_to: input.reply_to,
    rate_limit_per_hour: input.rate_limit_per_hour,
    is_active: input.is_active,
  });
}

export async function saveAdminEmailTemplate(user: AuthUser, template: AdminEmailTemplateRecord) {
  if (user.role !== "ADMIN") {
    throw new Error("Only admins can edit email templates.");
  }

  return await invokeAdminEmailOperation<AdminEmailTemplateRecord>("update_template", {
    id: template.id,
    name: template.name,
    description: template.description,
    recipient_group: template.recipient_group,
    trigger_event: template.trigger_event,
    subject: template.subject,
    body: template.body,
    metadata_fields: template.metadata_fields,
    category: template.category,
    reply_to: template.reply_to,
    rate_limit_per_hour: template.rate_limit_per_hour,
    is_active: template.is_active,
  });
}

export async function listAdminEmailDeliveries() {
  return await invokeAdminEmailOperation<AdminEmailDeliveryRecord[]>("list_deliveries");
}

export async function listAdminEmailEngagementSummary() {
  return await invokeAdminEmailOperation<AdminEmailEngagementSummaryRecord[]>("list_engagement");
}

export async function listAdminEmailCampaigns() {
  return await invokeAdminEmailOperation<AdminEmailCampaignRecord[]>("list_campaigns");
}

export async function listAdminEmailTriggerRules() {
  return await invokeAdminEmailOperation<AdminEmailTriggerRuleRecord[]>("list_trigger_rules");
}

export async function createAdminEmailTriggerRule(user: AuthUser, input: AdminEmailTriggerRuleInput) {
  if (user.role !== "ADMIN") {
    throw new Error("Only admins can create email trigger rules.");
  }

  return await invokeAdminEmailOperation<AdminEmailTriggerRuleRecord>("create_trigger_rule", input);
}

export async function updateAdminEmailTriggerRule(user: AuthUser, id: string, input: AdminEmailTriggerRuleInput) {
  if (user.role !== "ADMIN") {
    throw new Error("Only admins can update email trigger rules.");
  }

  return await invokeAdminEmailOperation<AdminEmailTriggerRuleRecord>("update_trigger_rule", { id, ...input });
}

export async function listAdminEmailSchedules() {
  return await invokeAdminEmailOperation<AdminEmailScheduleRecord[]>("list_schedules");
}

export async function createAdminEmailSchedule(user: AuthUser, input: AdminEmailScheduleInput) {
  if (user.role !== "ADMIN") {
    throw new Error("Only admins can create recurring emails.");
  }

  return await invokeAdminEmailOperation<AdminEmailScheduleRecord>("create_schedule", input);
}

export async function updateAdminEmailSchedule(user: AuthUser, id: string, input: AdminEmailScheduleInput) {
  if (user.role !== "ADMIN") {
    throw new Error("Only admins can update recurring emails.");
  }

  return await invokeAdminEmailOperation<AdminEmailScheduleRecord>("update_schedule", { id, ...input });
}

export async function getAdminEmailBrandSettings() {
  return await invokeAdminEmailOperation<AdminEmailBrandSettingsRecord>("get_brand_settings");
}

export async function saveAdminEmailBrandSettings(user: AuthUser, input: AdminEmailBrandSettingsInput) {
  if (user.role !== "ADMIN") {
    throw new Error("Only admins can update email branding.");
  }

  return await invokeAdminEmailOperation<AdminEmailBrandSettingsRecord>("save_brand_settings", input);
}

export async function sendAdminEmail(input: AdminEmailSendInput) {
  return await invokeAdminEmailFunction<AdminEmailSendResult>(input, "Unable to send admin email.");
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
  input: {
    name: string;
    website?: string;
    linkedin_company_url?: string;
    description?: string;
    target_industries?: string[];
    target_regions?: string[];
    ideal_customer_profile?: string;
  },
) {
  if (user.role !== "CLIENT" || !user.clientId) {
    throw new Error("Only client users linked to a company can update company profile details.");
  }

  const name = input.name.trim();
  const website = toNullableString(input.website);
  const linkedinCompanyUrl = normalizeLinkedInCompanyUrl(input.linkedin_company_url);
  const description = toNullableString(input.description);
  const targetIndustries = toUniqueTrimmedArray(input.target_industries);
  const targetRegions = toUniqueTrimmedArray(input.target_regions);
  const idealCustomerProfile = toNullableString(input.ideal_customer_profile);

  if (!name) {
    throw new Error("Company name is required.");
  }

  const { error } = await supabase
    .from("companies")
    .update({
      name,
      website,
      linkedin_company_url: linkedinCompanyUrl,
      description,
      target_industries: targetIndustries,
      target_regions: targetRegions,
      ideal_customer_profile: idealCustomerProfile,
    })
    .eq("id", user.clientId);

  if (error) {
    throw error;
  }

  const data = await getOwnClientCompany(user);

  if (
    data.name !== name ||
    data.website !== website ||
    data.linkedin_company_url !== linkedinCompanyUrl ||
    data.description !== description ||
    !areStringArraysEqual(data.target_industries, targetIndustries) ||
    !areStringArraysEqual(data.target_regions, targetRegions) ||
    data.ideal_customer_profile !== idealCustomerProfile
  ) {
    throw new Error("Your company profile could not be updated. Please contact support if this continues.");
  }

  await createAuditEvent(user, "client_company_profile_updated", "companies", data.id, {
    name: data.name,
    website: data.website,
    linkedin_company_url: data.linkedin_company_url,
    description: data.description,
    target_industries: data.target_industries,
    target_regions: data.target_regions,
    ideal_customer_profile: data.ideal_customer_profile,
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

async function invokeClerkUserTools<T>(body: Record<string, unknown>) {
  const token = await getSupabaseAccessToken();

  if (!token) {
    throw new Error("Sign in before using Clerk troubleshooting tools.");
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/clerk-user-tools`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error || "Unable to run Clerk troubleshooting tool.");
  }

  return payload;
}

export async function syncClerkUsers(input: { emails?: string[]; userIds?: string[]; query?: string; limit?: number } = {}) {
  const payload = await invokeClerkUserTools<ClerkUserToolSyncResult>({ action: "sync", ...input });
  return {
    synced: payload.results
      .filter((result) => result.synced)
      .map((result) => ({
        id: result.id ?? "",
        email: result.email ?? "",
        role: result.role ?? "BUM",
        companyName: result.companyName ?? null,
      })),
    skipped: payload.results
      .filter((result) => !result.synced)
      .map((result) => ({ id: result.id ?? undefined, email: result.email ?? undefined, reason: result.reason ?? "Unable to sync user." })),
  } satisfies SyncClerkUsersResult;
}

export async function listClerkAdminUsers(input: { emails?: string[]; userIds?: string[]; query?: string; limit?: number } = {}) {
  const payload = await invokeClerkUserTools<{ users: ClerkAdminUserRecord[] }>({ action: "list", ...input });
  return payload.users ?? [];
}

export async function updateClerkUserAccess(input: ClerkUserAccessInput) {
  return invokeClerkUserTools<{ user: ClerkAdminUserRecord; syncResult: ClerkUserToolSyncResult["results"][number] }>({
    action: "update_access",
    ...input,
  });
}

export async function createClerkSupportLink(input: { userId: string; expiresInSeconds?: number }) {
  return invokeClerkUserTools<ClerkSupportLinkResult>({ action: "create_support_link", ...input });
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

function cleanLinkedInProfileName(value?: string | null) {
  return (value ?? "")
    .replace(/\s*\|\s*LinkedIn\s*$/i, "")
    .replace(/\s+LinkedIn\s*$/i, "")
    .split("·")[0]
    .trim();
}

function stringMetadataValue(metadata: Record<string, unknown> | null | undefined, key: string) {
  const value = metadata?.[key];
  return typeof value === "string" ? value.trim() : "";
}

function inferLinkedInHeadline(capture: ExtensionPageCaptureRecord, name: string) {
  const metadataHeadline = stringMetadataValue(capture.metadata, "headline");
  if (metadataHeadline) return metadataHeadline;

  let text = capture.selected_text?.trim() ?? "";
  if (name && text.toLowerCase().startsWith(name.toLowerCase())) {
    text = text.slice(name.length).trim();
  }
  text = text.replace(/^(?:[·\s]*(?:1st|2nd|3rd)[·\s]*)+/i, "").trim();
  const atMatch = text.match(/^(.{1,120}?\bat\b[^,·.\n]+)/i);
  if (atMatch?.[1]) return atMatch[1].trim();
  return text.split(/[\n·]/)[0]?.trim().slice(0, 120) || null;
}

function inferCompanyFromHeadline(headline?: string | null) {
  const match = headline?.match(/\bat\s+([^,·.\n]+)/i);
  return match?.[1]?.trim() || null;
}

function extensionCaptureContactName(capture: ExtensionPageCaptureRecord) {
  return (
    cleanLinkedInProfileName(stringMetadataValue(capture.metadata, "profileName")) ||
    cleanLinkedInProfileName(capture.page_title) ||
    "LinkedIn contact"
  );
}

function extensionCaptureContextLabel(capture: ExtensionPageCaptureRecord) {
  if (capture.opportunity_registrations?.target_account_name) {
    return "Opportunity: " + capture.opportunity_registrations.target_account_name;
  }
  const targetName = capture.customer_targets?.target_companies?.name ?? capture.customer_targets?.target_account_name;
  if (targetName) return "Client target: " + targetName;
  return "LinkedIn page capture";
}

function extensionCaptureDetailUrl(capture: ExtensionPageCaptureRecord, companyName: string) {
  if (capture.opportunity_registration_id) return "/bum/opportunities/" + capture.opportunity_registration_id;
  if (capture.customer_target_id) return "/bum/opportunities?search=" + encodeURIComponent(companyName);
  return "/bum/contacts";
}


export async function listBumRepresentedContacts(userId: string) {
  const [claimsResult, recommendationsResult, contactsResult, targetResponsesResult, extensionCapturesResult] = await Promise.all([
    supabase
      .from("opportunity_claims")
      .select("*, opportunity_registrations(id, target_account_name, company_id, companies(name))")
      .eq("bum_user_id", userId)
      .order("created_at", { ascending: false })
      .returns<Array<OpportunityClaimRecord & { opportunity_registrations?: Pick<OpportunityRegistration, "id" | "target_account_name" | "company_id"> & { companies?: Pick<CompanyRecord, "name"> | null } | null }>>(),
    supabase
      .from("prospect_recommendations")
      .select("*, companies(id, name, website, relationship_stage, linkedin_company_url), profiles(id, full_name, email)")
      .eq("bum_user_id", userId)
      .order("created_at", { ascending: false })
      .returns<ProspectRecommendationRecord[]>(),
    supabase
      .from("prospect_contacts")
      .select("*, prospect_recommendations(id, bum_user_id)")
      .order("created_at", { ascending: false })
      .returns<ProspectContactRecord[]>(),
    supabase
      .from("customer_target_responses")
      .select(CUSTOMER_TARGET_RESPONSE_SELECT)
      .eq("bum_user_id", userId)
      .order("created_at", { ascending: false })
      .returns<CustomerTargetResponseRecord[]>(),
    supabase
      .from("extension_page_captures")
      .select("*, opportunity_registrations(id, target_account_name, company_id, companies(name)), customer_targets(id, target_account_name, client_companies:companies!customer_targets_client_company_id_fkey(name), target_companies:companies!customer_targets_target_company_id_fkey(name))")
      .eq("created_by", userId)
      .eq("capture_type", "LINKEDIN_PROFILE")
      .order("created_at", { ascending: false })
      .returns<ExtensionPageCaptureRecord[]>(),
  ]);

  for (const result of [claimsResult, recommendationsResult, contactsResult, targetResponsesResult, extensionCapturesResult]) {
    if (result.error) {
      throw result.error;
    }
  }

  const recommendations = recommendationsResult.data ?? [];
  const recommendationById = new Map(recommendations.map((recommendation) => [recommendation.id, recommendation]));
  const ownRecommendationIds = new Set(recommendations.map((recommendation) => recommendation.id));

  const claimContacts: BumRepresentedContactRecord[] = (claimsResult.data ?? []).map((claim) => ({
    id: "claim:" + claim.id,
    source: "OPPORTUNITY_CLAIM",
    name: claim.contact_name,
    title: null,
    email: claim.contact_email,
    companyName: claim.contact_company || claim.opportunity_registrations?.companies?.name || claim.opportunity_registrations?.target_account_name || "Unknown company",
    relationshipStrength: claim.relationship_strength,
    status: claim.status,
    contextLabel: claim.opportunity_registrations?.target_account_name ? "Opportunity: " + claim.opportunity_registrations.target_account_name : "Opportunity claim",
    detailUrl: claim.opportunity_registration_id ? "/bum/opportunities/" + claim.opportunity_registration_id : "/bum/claims",
    linkedinUrl: null,
    note: claim.note,
    created_at: claim.created_at,
  }));

  const prospectContacts: BumRepresentedContactRecord[] = (contactsResult.data ?? [])
    .filter((contact) => contact.recommendation_id && ownRecommendationIds.has(contact.recommendation_id))
    .map((contact) => {
      const recommendation = contact.recommendation_id ? recommendationById.get(contact.recommendation_id) : null;
      return {
        id: "prospect:" + contact.id,
        source: "PROSPECT",
        name: contact.full_name,
        title: contact.title,
        email: contact.email,
        companyName: recommendation?.companies?.name ?? "Prospected company",
        relationshipStrength: contact.is_primary ? "PRIMARY" : null,
        status: recommendation?.status ?? "PROSPECT",
        contextLabel: "Prospect recommendation",
        detailUrl: "/bum/prospects",
        linkedinUrl: contact.linkedin_url,
        note: recommendation?.notes ?? null,
        created_at: contact.created_at,
      } satisfies BumRepresentedContactRecord;
    });

  const targetContacts: BumRepresentedContactRecord[] = (targetResponsesResult.data ?? []).map((response) => {
    const normalized = normalizeCustomerTargetResponse(response);
    const targetName = normalized.customer_targets?.target_companies?.name ?? normalized.customer_targets?.target_account_name ?? "Target account";
    return {
      id: "target:" + normalized.id,
      source: "TARGET_RESPONSE",
      name: normalized.contact_name,
      title: null,
      email: normalized.contact_email,
      companyName: targetName,
      relationshipStrength: normalized.relationship_strength,
      status: normalized.status,
      contextLabel: normalized.customer_targets?.client_companies?.name ? "Client target for " + normalized.customer_targets.client_companies.name : "Client target response",
      detailUrl: "/bum/opportunities?search=" + encodeURIComponent(targetName),
      linkedinUrl: null,
      note: normalized.note,
      created_at: normalized.created_at,
    };
  });

  const extensionCaptureContacts: BumRepresentedContactRecord[] = (extensionCapturesResult.data ?? []).map((capture) => {
    const name = extensionCaptureContactName(capture);
    const headline = inferLinkedInHeadline(capture, name);
    const companyName =
      inferCompanyFromHeadline(headline) ??
      capture.customer_targets?.target_companies?.name ??
      capture.customer_targets?.target_account_name ??
      capture.opportunity_registrations?.target_account_name ??
      capture.opportunity_registrations?.companies?.name ??
      "LinkedIn contact";

    return {
      id: "extension:" + capture.id,
      source: "EXTENSION_CAPTURE",
      name,
      title: headline,
      email: null,
      companyName,
      relationshipStrength: null,
      status: capture.status,
      contextLabel: extensionCaptureContextLabel(capture),
      detailUrl: extensionCaptureDetailUrl(capture, companyName),
      linkedinUrl: capture.source_url,
      note: capture.note ?? capture.selected_text,
      created_at: capture.created_at,
    } satisfies BumRepresentedContactRecord;
  });

  return [...claimContacts, ...prospectContacts, ...targetContacts, ...extensionCaptureContacts].sort((a, b) => b.created_at.localeCompare(a.created_at));
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

export async function createClientBumIntroRequest(user: AuthUser, input: ClientBumIntroRequestInput) {
  if (user.role !== "CLIENT" || !user.clientId) {
    throw new Error("Only client users can request Bum introductions.");
  }

  const targetCompanyName = input.targetCompanyName.trim();
  const introContext = input.introContext.trim();

  if (!input.bumUserId.trim()) {
    throw new Error("Choose a Bum before requesting an intro.");
  }

  if (!targetCompanyName) {
    throw new Error("Enter the target company for this intro request.");
  }

  if (!introContext) {
    throw new Error("Add context for the requested introduction.");
  }

  const { data: bumProfile, error: bumProfileError } = await supabase
    .from("bum_profiles")
    .select("user_id, is_visible_to_clients")
    .eq("user_id", input.bumUserId)
    .eq("is_visible_to_clients", true)
    .maybeSingle<Pick<BumProfileRecord, "user_id" | "is_visible_to_clients">>();

  if (bumProfileError) {
    throw bumProfileError;
  }

  if (!bumProfile) {
    throw new Error("That Bum profile is no longer available.");
  }

  const { data, error } = await supabase
    .from("client_bum_intro_requests")
    .insert({
      client_company_id: user.clientId,
      client_user_id: user.id,
      bum_user_id: input.bumUserId,
      target_company_name: targetCompanyName,
      target_contact_name: toNullableString(input.targetContactName),
      target_contact_title: toNullableString(input.targetContactTitle),
      intro_context: introContext,
      notes: toNullableString(input.notes),
      status: "SUBMITTED",
    })
    .select("*")
    .single<ClientBumIntroRequestRecord>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "client_bum_intro_request_created", "client_bum_intro_requests", data.id, {
    bum_user_id: input.bumUserId,
    target_company_name: data.target_company_name,
    target_contact_name: data.target_contact_name,
  });

  return data;
}

const CUSTOMER_TARGET_RESPONSE_SELECT = "*, customer_targets(id, target_account_name, business_unit, expected_product_service, estimated_deal_value, expected_timeline, notes, key_contact_name, key_contact_email, client_companies:companies!customer_targets_client_company_id_fkey(id, name), target_companies:companies!customer_targets_target_company_id_fkey(id, name, website, linkedin_company_url)), profiles(id, full_name, email), conversation_threads(id)";

export async function listCustomerTargetResponses(user: AuthUser) {
  if (user.role !== "CLIENT" && user.role !== "ADMIN") {
    throw new Error("Only Clients and Admins can load Bum target responses.");
  }

  let query = supabase
    .from("customer_target_responses")
    .select(CUSTOMER_TARGET_RESPONSE_SELECT)
    .order("created_at", { ascending: false });

  if (user.role === "CLIENT") {
    if (!user.clientId) {
      throw new Error("Your client account is not linked to a company.");
    }
    query = query.eq("client_company_id", user.clientId);
  }

  const { data, error } = await query.returns<CustomerTargetResponseRecord[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).map(normalizeCustomerTargetResponse);
}

export async function updateCustomerTargetResponseStatus(
  user: AuthUser,
  responseId: string,
  status: Pick<CustomerTargetResponseRecord, "status">["status"],
) {
  if (user.role !== "CLIENT" && user.role !== "ADMIN") {
    throw new Error("Only Clients and Admins can update Bum target responses.");
  }

  const { data: response, error: responseError } = await supabase
    .from("customer_target_responses")
    .select("id, client_company_id, status")
    .eq("id", responseId)
    .maybeSingle<Pick<CustomerTargetResponseRecord, "id" | "client_company_id" | "status">>();

  if (responseError) {
    throw responseError;
  }

  if (!response) {
    throw new Error("That Bum response could not be found.");
  }

  if (user.role === "CLIENT" && response.client_company_id !== user.clientId) {
    throw new Error("That Bum response is not assigned to your company.");
  }

  const { data, error } = await supabase
    .from("customer_target_responses")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", responseId)
    .select(CUSTOMER_TARGET_RESPONSE_SELECT)
    .single<CustomerTargetResponseRecord>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "customer_target_response_status_changed", "customer_target_responses", data.id, { status });

  return normalizeCustomerTargetResponse(data);
}

function mapTargetResponseStrength(strength: CustomerTargetResponseStrength): OpportunityClaimStrength {
  if (strength === "strong" || strength === "advisor") {
    return "STRONG";
  }
  if (strength === "unknown") {
    return "WEAK";
  }
  return "MODERATE";
}

export async function formalizeCustomerTargetResponse(
  user: AuthUser,
  responseId: string,
  input: CustomerTargetResponseFormalizeInput,
) {
  if (user.role !== "CLIENT" || !user.clientId) {
    throw new Error("Only client users linked to a company can formalize Bum responses.");
  }

  if (!input.payProgramId) {
    throw new Error("Choose a commission plan before approving this Bum response.");
  }

  const { data: response, error: responseError } = await supabase
    .from("customer_target_responses")
    .select(CUSTOMER_TARGET_RESPONSE_SELECT)
    .eq("id", responseId)
    .maybeSingle<CustomerTargetResponseRecord>();

  if (responseError) {
    throw responseError;
  }

  if (!response?.customer_targets) {
    throw new Error("That Bum response could not be found.");
  }

  if (response.client_company_id !== user.clientId) {
    throw new Error("That Bum response is not assigned to your company.");
  }

  if (response.status !== "PROPOSED") {
    throw new Error("Only proposed Bum responses can be formalized.");
  }

  const target = response.customer_targets;
  const targetAccountName = target.target_companies?.name ?? target.target_account_name;
  const opportunity = await createOpportunityRegistration(user, {
    pay_program_id: input.payProgramId,
    target_account_name: targetAccountName,
    business_unit: target.business_unit ?? undefined,
    opportunity_description: target.notes ?? "Bum-submitted relationship path for " + targetAccountName + ".",
    client_contact: target.key_contact_name ?? undefined,
    trusted_bums_contact: response.profiles?.full_name ?? response.profiles?.email ?? undefined,
    expected_product_service: target.expected_product_service ?? undefined,
    estimated_deal_value: input.estimatedDealValue ?? target.estimated_deal_value ?? null,
    expected_timeline: input.expectedTimeline ?? target.expected_timeline ?? undefined,
    notes: input.notes ?? response.note ?? undefined,
    status: "Accepted",
  });

  const { data: claim, error: claimError } = await supabase
    .from("opportunity_claims")
    .insert({
      opportunity_registration_id: opportunity.id,
      company_id: user.clientId,
      bum_user_id: response.bum_user_id,
      bum_share_percent: DEFAULT_BUM_COMMISSION_POOL_PERCENT,
      share_manually_set: false,
      contact_name: response.contact_name,
      contact_company: targetAccountName,
      contact_email: response.contact_email,
      relationship_strength: mapTargetResponseStrength(response.relationship_strength),
      note: response.note,
      status: "APPROVED",
    })
    .select("*, opportunity_registrations(id, target_account_name, commission_rate, company_id, pay_program_id, commission_schedule_start_at, client_pay_programs(*)), profiles(id, full_name, email)")
    .single<OpportunityClaimRecord>();

  if (claimError) {
    throw claimError;
  }

  await rebalanceOpportunityClaimShares(opportunity.id);
  await upsertOpportunityClaimPublicSummary(claim, response.profiles?.full_name ?? response.profiles?.email);

  const { error: updateError } = await supabase
    .from("customer_target_responses")
    .update({
      status: "ACCEPTED",
      opportunity_registration_id: opportunity.id,
      opportunity_claim_id: claim.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", response.id);

  if (updateError) {
    throw updateError;
  }

  await createAuditEvent(user, "customer_target_response_formalized", "customer_target_responses", response.id, {
    opportunity_registration_id: opportunity.id,
    opportunity_claim_id: claim.id,
    bum_user_id: response.bum_user_id,
  });

  return { opportunity, claim };
}

export async function createCustomerTargetResponse(user: AuthUser, input: CustomerTargetResponseInput) {
  if (user.role !== "BUM") {
    throw new Error("Only Bums can respond to target account opportunities.");
  }

  const { data: target, error: targetError } = await supabase
    .from("customer_targets")
    .select("id, client_company_id, target_account_name")
    .eq("id", input.customerTargetId)
    .maybeSingle<Pick<CustomerTargetRecord, "id" | "client_company_id" | "target_account_name">>();

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
    .select(CUSTOMER_TARGET_RESPONSE_SELECT)
    .single<CustomerTargetResponseRecord>();

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "customer_target_response_created", "customer_target_responses", data.id, {
    customer_target_id: target.id,
    contact_name: data.contact_name,
    relationship_strength: data.relationship_strength,
  });

  await sendAdminEmail({
    mode: "action",
    templateSlug: "customer_target_response_created_client",
    metadata: {
      company_id: target.client_company_id,
      target_account_name: data.customer_targets?.target_companies?.name ?? target.target_account_name,
      contact_name: data.contact_name,
      contact_email: data.contact_email ?? "",
      relationship_strength: data.relationship_strength,
      bum_name: user.name || user.email,
      response_note: data.note ?? "",
      response_url: getPortalOrigin() + "/client/opportunities?tab=responses&targetResponseId=" + data.id,
    },
    triggeredBy: "CUSTOMER_TARGET_RESPONSE_CREATED",
  }).catch((error) => {
    console.error("Unable to send customer target response notification", error);
  });

  return normalizeCustomerTargetResponse(data);
}

export async function createCustomerTargetQuestion(user: AuthUser, input: CustomerTargetQuestionInput) {
  if (user.role !== "BUM") {
    throw new Error("Only Bums can ask target account questions.");
  }

  const question = input.question.trim();
  if (!question) {
    throw new Error("Add your question before sending it.");
  }

  const { data: target, error: targetError } = await supabase
    .from("customer_targets")
    .select("id, client_company_id, target_account_name, target_companies:companies!customer_targets_target_company_id_fkey(name)")
    .eq("id", input.customerTargetId)
    .maybeSingle<Pick<CustomerTargetRecord, "id" | "client_company_id" | "target_account_name"> & { target_companies?: Pick<CompanyRecord, "name"> | null }>();

  if (targetError) {
    throw targetError;
  }

  if (!target?.client_company_id) {
    throw new Error("That target account is no longer available.");
  }

  const targetName = target.target_companies?.name ?? target.target_account_name;
  const questionContactName = `Question about ${targetName} - ${new Date().toISOString()}`;
  const { data, error } = await supabase
    .from("customer_target_responses")
    .insert({
      customer_target_id: target.id,
      client_company_id: target.client_company_id,
      bum_user_id: user.id,
      contact_name: questionContactName,
      contact_email: null,
      relationship_strength: "unknown",
      note: question,
      status: "PROPOSED",
    })
    .select(CUSTOMER_TARGET_RESPONSE_SELECT)
    .single<CustomerTargetResponseRecord>();

  if (error) {
    throw error;
  }

  let conversationThreadId: string | null = null;
  await createConversationThread(user, {
    contextType: "CUSTOMER_TARGET",
    customerTargetId: target.id,
    customerTargetResponseId: data.id,
    subject: "Question: " + targetName,
    message: question,
  })
    .then((thread) => {
      conversationThreadId = thread.id;
    })
    .catch((conversationError) => {
      console.error("Unable to create customer target question conversation", conversationError);
    });

  await createAuditEvent(user, "customer_target_question_created", "customer_target_responses", data.id, {
    customer_target_id: target.id,
  });

  await sendAdminEmail({
    mode: "action",
    templateSlug: "customer_target_response_created_client",
    metadata: {
      company_id: target.client_company_id,
      target_account_name: targetName,
      contact_name: "Question",
      contact_email: "",
      relationship_strength: "unknown",
      bum_name: user.name || user.email,
      response_note: question,
      response_url: getPortalOrigin() + "/client/opportunities?tab=questions&targetResponseId=" + data.id,
    },
    triggeredBy: "CUSTOMER_TARGET_RESPONSE_CREATED",
  }).catch((emailError) => {
    console.error("Unable to send customer target question notification", emailError);
  });

  return normalizeCustomerTargetResponse({ ...data, conversation_thread_id: conversationThreadId });
}

export async function listOpportunityClaimSummaries() {
  const { data, error } = await supabase
    .from("opportunity_claim_public_summaries")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<OpportunityClaimSummaryRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
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

export async function forceTeamsTranscriptSync(batchSize = 10) {
  const accessToken = await getSupabaseAccessToken();

  if (!accessToken) {
    throw new Error("Sign in before forcing Teams transcript sync.");
  }

  const response = await fetch(supabaseUrl + "/functions/v1/sync-teams-transcripts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabasePublishableKey,
      Authorization: "Bearer " + accessToken,
    },
    body: JSON.stringify({ batchSize, source: "admin-tool" }),
  });

  const payload = (await response.json().catch(() => ({}))) as ForceTranscriptSyncResult | { error?: string };

  if (!response.ok) {
    throw new Error("error" in payload && payload.error ? payload.error : "Unable to sync Teams transcripts.");
  }

  if (!("checked" in payload) || !("saved" in payload) || !("pending" in payload) || !("failed" in payload)) {
    throw new Error("The Teams transcript sync returned an incomplete response.");
  }

  return payload;
}

export async function submitFeedback(input: FeedbackInput) {
  const accessToken = await getSupabaseAccessToken();

  if (!accessToken) {
    throw new Error("Sign in before submitting feedback.");
  }

  const response = await fetch(supabaseUrl + "/functions/v1/submit-feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabasePublishableKey,
      Authorization: "Bearer " + accessToken,
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json().catch(() => ({}))) as FeedbackSubmitResult | { error?: string };

  if (!response.ok) {
    throw new Error("error" in payload && payload.error ? payload.error : "Unable to submit feedback.");
  }

  if (!("feedback" in payload)) {
    throw new Error("The feedback service returned an incomplete response.");
  }

  return payload;
}

export async function listFeedbackSubmissions() {
  const { data, error } = await supabase
    .from("feedback_submissions")
    .select("*, profiles:feedback_submissions_created_by_fkey(id, full_name, email), companies:feedback_submissions_company_id_fkey(id, name)")
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<FeedbackSubmissionRecord[]>();

  if (error) {
    throw new Error(error.message || "Unable to load feedback submissions.");
  }

  return data ?? [];
}

export async function updateFeedbackSubmissionStatus(input: { id: string; status: FeedbackStatus; adminNotes?: string | null; completedBy?: string | null }) {
  const patch = {
    status: input.status,
    admin_notes: input.adminNotes ?? null,
    completed_at: input.status === "COMPLETE" ? new Date().toISOString() : null,
    completed_by: input.status === "COMPLETE" ? input.completedBy ?? null : null,
  };
  const { data, error } = await supabase
    .from("feedback_submissions")
    .update(patch)
    .eq("id", input.id)
    .select("*, profiles:feedback_submissions_created_by_fkey(id, full_name, email), companies:feedback_submissions_company_id_fkey(id, name)")
    .single<FeedbackSubmissionRecord>();

  if (error) {
    throw new Error(error.message || "Unable to update feedback.");
  }

  return data;
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

function getTrainingAttachmentContentType(file: File) {
  const fileType = file.type.trim().toLowerCase();
  const extension = file.name.split(".").pop()?.toLowerCase();
  const isGenericType = !fileType || fileType === "application/octet-stream" || fileType === "binary/octet-stream";

  if (fileType === "application/pdf" || fileType === "application/x-pdf" || (isGenericType && extension === "pdf")) {
    return "application/pdf";
  }

  const extensionTypes: Record<string, string> = {
    csv: "text/csv",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    pdf: "application/pdf",
    png: "image/png",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    txt: "text/plain",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };

  return isGenericType && extension ? extensionTypes[extension] ?? fileType : fileType || "application/octet-stream";
}

async function uploadTrainingMaterialAttachment(user: AuthUser, material: TrainingMaterial, file: File) {
  const storageScope = material.company_id ?? "corporate";
  const storagePath = `${storageScope}/${material.id}/${crypto.randomUUID()}-${sanitizeAttachmentFileName(file.name)}`;
  const contentType = getTrainingAttachmentContentType(file);
  const { error: uploadError } = await supabase.storage
    .from(TRAINING_MATERIAL_ATTACHMENTS_BUCKET)
    .upload(storagePath, file, {
      contentType,
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
      file_type: contentType,
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

export async function getTrainingMaterialAttachmentPreviewUrl(attachment: TrainingMaterialAttachment, expiresInSeconds = 60 * 10) {
  const { data, error } = await supabase.storage
    .from(attachment.storage_bucket)
    .createSignedUrl(attachment.storage_path, expiresInSeconds);

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

  let attachments: TrainingMaterialAttachment[] = [];
  try {
    attachments = input.attachments?.length
      ? await Promise.all(input.attachments.map((file) => uploadTrainingMaterialAttachment(user, data, file)))
      : [];
  } catch (error) {
    await supabase.from("training_materials").delete().eq("id", data.id);
    throw error;
  }

  await createAuditEvent(user, "training_material_created", "training_materials", data.id, {
    title: data.title,
    company_id: data.company_id,
    attachment_count: attachments.length,
  });

  return { ...data, training_material_attachments: attachments };
}

export async function updateTrainingMaterial(user: AuthUser, material: TrainingMaterial, input: TrainingMaterialInput) {
  const companyId = user.role === "CLIENT" ? user.clientId ?? null : input.company_id ?? null;

  if (user.role === "CLIENT" && !companyId) {
    throw new Error("This client user is not linked to a company yet.");
  }

  const { data, error } = await supabase
    .from("training_materials")
    .update({
      company_id: companyId,
      title: input.title.trim(),
      description: toNullableString(input.description),
      technology: toNullableString(input.technology),
      resource_url: toNullableString(input.resource_url),
      is_published: input.is_published ?? material.is_published,
    })
    .eq("id", material.id)
    .select("*, companies(id, name), training_material_attachments(*)")
    .single<TrainingMaterial>();

  if (error) {
    throw error;
  }

  const existingAttachments = data.training_material_attachments ?? [];
  if (existingAttachments.length) {
    const { error: attachmentUpdateError } = await supabase
      .from("training_material_attachments")
      .update({ company_id: data.company_id })
      .eq("training_material_id", data.id);

    if (attachmentUpdateError) {
      throw attachmentUpdateError;
    }
  }

  const newAttachments = input.attachments?.length
    ? await Promise.all(input.attachments.map((file) => uploadTrainingMaterialAttachment(user, data, file)))
    : [];

  await createAuditEvent(user, "training_material_updated", "training_materials", data.id, {
    title: data.title,
    company_id: data.company_id,
    attachment_count_added: newAttachments.length,
  });

  return { ...data, training_material_attachments: [...existingAttachments, ...newAttachments] };
}

export async function deleteTrainingMaterial(user: AuthUser, material: TrainingMaterial) {
  const attachments = material.training_material_attachments ?? [];
  const storagePaths = attachments.map((attachment) => attachment.storage_path);

  if (storagePaths.length) {
    const { error: storageError } = await supabase.storage
      .from(TRAINING_MATERIAL_ATTACHMENTS_BUCKET)
      .remove(storagePaths);

    if (storageError) {
      throw storageError;
    }
  }

  const { error } = await supabase
    .from("training_materials")
    .delete()
    .eq("id", material.id);

  if (error) {
    throw error;
  }

  await createAuditEvent(user, "training_material_deleted", "training_materials", material.id, {
    title: material.title,
    company_id: material.company_id,
    attachment_count: attachments.length,
  });
}

async function invokeClientTeamFunction<T>(body: Record<string, unknown>) {
  const token = await getSupabaseAccessToken();
  const response = await fetch(`${supabaseUrl}/functions/v1/client-team`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${token ?? supabasePublishableKey}`,
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error || "Unable to manage this client team.");
  }

  return payload;
}

export async function getClientTeam(user: AuthUser) {
  if (user.role !== "CLIENT" || user.clientAccessRole !== "CLIENT_ADMIN") {
    throw new Error("Only client admins can view team management.");
  }

  return invokeClientTeamFunction<ClientTeamResponse>({ action: "list" });
}

export async function inviteClientTeamMember(user: AuthUser, input: ClientTeamInviteInput) {
  if (user.role !== "CLIENT" || user.clientAccessRole !== "CLIENT_ADMIN") {
    throw new Error("Only client admins can invite team members.");
  }

  return invokeClientTeamFunction<ClientTeamResponse & { invited?: boolean; existingUser?: boolean }>({
    action: "invite",
    ...input,
    redirectUrl: new URL(`${import.meta.env.BASE_URL || "/"}login`, window.location.origin).toString(),
  });
}

export async function updateClientTeamMemberRole(user: AuthUser, input: ClientTeamRoleInput) {
  if (user.role !== "CLIENT" || user.clientAccessRole !== "CLIENT_ADMIN") {
    throw new Error("Only client admins can update team roles.");
  }

  return invokeClientTeamFunction<ClientTeamResponse & { updated?: boolean }>({
    action: "update_role",
    ...input,
  });
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
