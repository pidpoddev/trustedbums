import type { BumProfileInput, BumProfileRecord } from "@/lib/portalApi";

export type BumProfilePromptKey =
  | "headline"
  | "years_experience"
  | "industries"
  | "products_sold"
  | "buyer_personas"
  | "worked_with_companies"
  | "relationship_companies"
  | "home_region"
  | "linkedin_url"
  | "bio";

export interface BumProfilePromptDefinition {
  key: BumProfilePromptKey;
  label: string;
  description: string;
  type: "text" | "textarea" | "number" | "url";
  placeholder: string;
}

const BUM_PROFILE_PROMPTS: BumProfilePromptDefinition[] = [
  {
    key: "headline",
    label: "What is your Bum headline?",
    description: "Give clients a one-line summary of who you help and what you know.",
    type: "text",
    placeholder: "Healthcare Bum with 12 years selling enterprise software",
  },
  {
    key: "years_experience",
    label: "How many years of experience do you have?",
    description: "A simple number helps clients calibrate seniority quickly.",
    type: "number",
    placeholder: "12",
  },
  {
    key: "industries",
    label: "Which industries have you worked in?",
    description: "List the markets where you have real operating or sales context.",
    type: "textarea",
    placeholder: "Healthcare\nCybersecurity\nFinancial Services",
  },
  {
    key: "products_sold",
    label: "What kinds of products or services have you sold?",
    description: "This helps clients understand the motion you know best.",
    type: "textarea",
    placeholder: "Managed services\nRevenue intelligence\nSecurity software",
  },
  {
    key: "buyer_personas",
    label: "Who do you usually sell to?",
    description: "Share the titles or functions you know how to reach.",
    type: "textarea",
    placeholder: "CIO\nVP Sales\nHead of Procurement",
  },
  {
    key: "worked_with_companies",
    label: "Which companies have you worked with?",
    description: "Add examples that show where you have experience or credibility.",
    type: "textarea",
    placeholder: "Company One\nCompany Two",
  },
  {
    key: "relationship_companies",
    label: "Where do you already have warm relationships?",
    description: "List companies where you have friends, buyers, or trusted operators.",
    type: "textarea",
    placeholder: "Mayo Clinic\nDatadog",
  },
  {
    key: "home_region",
    label: "What is your home region?",
    description: "A quick geography anchor helps clients route the right Bum.",
    type: "text",
    placeholder: "North America",
  },
  {
    key: "linkedin_url",
    label: "What is your LinkedIn URL?",
    description: "Add your profile link so admins and clients can verify context quickly.",
    type: "url",
    placeholder: "https://www.linkedin.com/in/your-name",
  },
  {
    key: "bio",
    label: "What should clients know about you?",
    description: "Share a short background on your network, style, or strengths.",
    type: "textarea",
    placeholder: "I help technical founders break into health systems and payer organizations...",
  },
];

function hasListValue(value?: string[] | null) {
  return Array.isArray(value) && value.some((item) => item.trim().length > 0);
}

function hasStringValue(value?: string | null) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPromptComplete(profile: BumProfileRecord | null | undefined, key: BumProfilePromptKey) {
  if (!profile) {
    return false;
  }

  switch (key) {
    case "headline":
    case "home_region":
    case "linkedin_url":
    case "bio":
      return hasStringValue(profile[key]);
    case "years_experience":
      return typeof profile.years_experience === "number" && profile.years_experience > 0;
    case "industries":
    case "products_sold":
    case "buyer_personas":
    case "worked_with_companies":
    case "relationship_companies":
      return hasListValue(profile[key]);
    default:
      return false;
  }
}

export function getBumProfileCompleteness(profile: BumProfileRecord | null | undefined) {
  const completedPrompts = BUM_PROFILE_PROMPTS.filter((prompt) => isPromptComplete(profile, prompt.key));
  const missingPrompts = BUM_PROFILE_PROMPTS.filter((prompt) => !isPromptComplete(profile, prompt.key));
  const percent = Math.round((completedPrompts.length / BUM_PROFILE_PROMPTS.length) * 100);

  return {
    total: BUM_PROFILE_PROMPTS.length,
    completed: completedPrompts.length,
    percent,
    missingPrompts,
    nextPrompts: missingPrompts.slice(0, 2),
    isComplete: missingPrompts.length === 0,
  };
}

export function getPromptDraftValue(profile: BumProfileRecord | null | undefined, key: BumProfilePromptKey) {
  if (!profile) {
    return "";
  }

  switch (key) {
    case "years_experience":
      return profile.years_experience?.toString() ?? "";
    case "industries":
    case "products_sold":
    case "buyer_personas":
    case "worked_with_companies":
    case "relationship_companies":
      return (profile[key] ?? []).join("\n");
    case "headline":
    case "home_region":
    case "linkedin_url":
    case "bio":
      return profile[key] ?? "";
    default:
      return "";
  }
}

function linesToArray(value: string) {
  return value
    .split(/\n|,/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildBumProfileInputFromPrompt(
  key: BumProfilePromptKey,
  value: string,
): Partial<BumProfileInput> | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  switch (key) {
    case "years_experience": {
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) && parsed > 0 ? { years_experience: parsed } : null;
    }
    case "industries":
      return { industries: linesToArray(value) };
    case "products_sold":
      return { products_sold: linesToArray(value) };
    case "buyer_personas":
      return { buyer_personas: linesToArray(value) };
    case "worked_with_companies":
      return { worked_with_companies: linesToArray(value) };
    case "relationship_companies":
      return { relationship_companies: linesToArray(value) };
    case "headline":
      return { headline: trimmed };
    case "home_region":
      return { home_region: trimmed };
    case "linkedin_url":
      return { linkedin_url: trimmed };
    case "bio":
      return { bio: trimmed };
    default:
      return null;
  }
}
