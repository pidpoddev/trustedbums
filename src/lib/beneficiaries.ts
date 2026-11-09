import { supabase } from "@/lib/supabase";

export type CharityStatus = "PENDING" | "APPROVED" | "REJECTED";
export interface Charity {
  id: string;
  name: string;
  website: string;
  registration_number: string;
  suggestion_reason: string;
  suggested_by: string;
  status: CharityStatus;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
}
export interface BeneficiaryPreference { bum_user_id: string; charity_id: string | null }

export function validateCharity(input: { name: string; website: string; registration_number: string; suggestion_reason: string }) {
  if (!input.name.trim() || !input.registration_number.trim() || !input.suggestion_reason.trim()) {
    throw new Error("Enter the charity name, registration number, and why it fits Trusted Bums.");
  }
  const url = new URL(input.website);
  if (url.protocol !== "https:") throw new Error("Use an https:// charity website.");
  return { ...input, name: input.name.trim(), website: url.href, registration_number: input.registration_number.trim(), suggestion_reason: input.suggestion_reason.trim() };
}

export async function listCharities() {
  const { data, error } = await supabase.from("charities").select("*").order("name").returns<Charity[]>();
  if (error) throw error;
  return data ?? [];
}
export async function suggestCharity(userId: string, input: Parameters<typeof validateCharity>[0]) {
  const { error } = await supabase.from("charities").insert({ ...validateCharity(input), suggested_by: userId });
  if (error) throw error;
}
export async function reviewCharity(id: string, status: CharityStatus, notes: string) {
  if (!notes.trim()) throw new Error("Add a review reason before saving a decision.");
  const { error } = await supabase.from("charities").update({ status, review_notes: notes.trim(), charitable_status_verified: status === "APPROVED", nonpolitical_verified: status === "APPROVED", ethos_verified: status === "APPROVED" }).eq("id", id).select("id").single();
  if (error) throw error;
}
export async function getBeneficiary(userId: string) {
  const { data, error } = await supabase.from("bum_beneficiary_preferences").select("*").eq("bum_user_id", userId).maybeSingle<BeneficiaryPreference>();
  if (error) throw error;
  return data;
}
export async function saveBeneficiary(userId: string, charityId: string | null) {
  const { error } = await supabase.from("bum_beneficiary_preferences").upsert({ bum_user_id: userId, charity_id: charityId });
  if (error) throw error;
}
export function payoutBeneficiaryLabel(payout: { beneficiary_charity_id?: string | null; beneficiary_name?: string | null }) {
  return payout.beneficiary_charity_id ? `Charity: ${payout.beneficiary_name ?? "Charity review required"}` : "Bum";
}
