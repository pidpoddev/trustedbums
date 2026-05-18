import { supabase } from "@/lib/supabase";

export type ContactInterest = "CLIENT" | "BUM" | "GENERAL";

export interface ContactSubmissionInput {
  name: string;
  email: string;
  companyName?: string;
  interest: ContactInterest;
  targetAccounts?: string;
  message: string;
  website?: string;
}

function toNullableString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function submitContactSubmission(input: ContactSubmissionInput) {
  if (input.website?.trim()) {
    return { submitted: true };
  }

  const { error } = await supabase.from("contact_submissions").insert({
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    company_name: toNullableString(input.companyName),
    interest: input.interest,
    target_accounts: toNullableString(input.targetAccounts),
    message: input.message.trim(),
    source: "homepage",
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    status: "NEW",
  });

  if (error) {
    throw error;
  }

  return { submitted: true };
}
