import type { BumProfileInput } from "@/lib/portalApi";
import { parseCsv, type CsvRow } from "@/lib/csv";

export interface LinkedInExportSelection {
  profile?: File | null;
  positions?: File | null;
  skills?: File | null;
  certifications?: File | null;
  connections?: File | null;
}

export interface LinkedInImportResult {
  patch: Partial<BumProfileInput>;
  notes: string[];
}

function normalizeHeader(header: string) {
  return header.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getValue(row: CsvRow, aliases: string[]) {
  const entries = Object.entries(row);

  for (const alias of aliases) {
    const normalizedAlias = normalizeHeader(alias);
    const match = entries.find(([header]) => normalizeHeader(header) === normalizedAlias);

    if (match?.[1]?.trim()) {
      return match[1].trim();
    }
  }

  return "";
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function splitParagraphs(value: string) {
  return value
    .split(/\n+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseMonthYear(value: string) {
  if (!value.trim()) {
    return null;
  }

  const normalized = value.replace(/\//g, "-").trim();
  const date = new Date(`${normalized}-01`);

  if (!Number.isNaN(date.getTime())) {
    return date;
  }

  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function deriveYearsExperience(rows: CsvRow[]) {
  const startDates = rows
    .map((row) => getValue(row, ["Started On", "Start Date", "Date Started"]))
    .map(parseMonthYear)
    .filter((date): date is Date => Boolean(date))
    .sort((left, right) => left.getTime() - right.getTime());

  if (!startDates.length) {
    return null;
  }

  const firstStart = startDates[0];
  const now = new Date();
  const diffMs = now.getTime() - firstStart.getTime();
  const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));

  return years >= 0 ? years : null;
}

async function parseFile(file?: File | null) {
  if (!file) {
    return [];
  }

  return parseCsv(await file.text());
}

export async function importLinkedInExport(selection: LinkedInExportSelection): Promise<LinkedInImportResult> {
  const [profileRows, positionRows, skillRows, certificationRows, connectionRows] = await Promise.all([
    parseFile(selection.profile),
    parseFile(selection.positions),
    parseFile(selection.skills),
    parseFile(selection.certifications),
    parseFile(selection.connections),
  ]);

  const profileRow = profileRows[0];
  const workedWithCompanies = unique(
    positionRows.map((row) => getValue(row, ["Company Name", "Company"])),
  );
  const relationshipCompanies = unique(
    connectionRows.map((row) => getValue(row, ["Company", "Company Name"])),
  );
  const skills = unique(skillRows.map((row) => getValue(row, ["Name", "Skill", "Skill Name"])));
  const certifications = unique(
    certificationRows.map((row) => getValue(row, ["Name", "Certification", "Certification Name"])),
  );
  const profileIndustry = profileRow
    ? getValue(profileRow, ["Industry", "Primary Industry"])
    : "";

  const notes = [
    workedWithCompanies.length ? `Imported ${workedWithCompanies.length} past companies from Positions.` : "",
    relationshipCompanies.length ? `Imported ${relationshipCompanies.length} connection companies from Connections.` : "",
    skills.length ? `Imported ${skills.length} skills.` : "",
    certifications.length ? `Imported ${certifications.length} certifications.` : "",
  ].filter(Boolean);

  return {
    patch: {
      headline: profileRow ? getValue(profileRow, ["Headline"]) : undefined,
      bio: profileRow ? getValue(profileRow, ["Summary", "About", "Description"]) : undefined,
      linkedin_url: profileRow ? getValue(profileRow, ["Public Profile URL", "Profile URL"]) : undefined,
      home_region: profileRow ? getValue(profileRow, ["Geo Location", "Location", "Geo Location Name"]) : undefined,
      industries: profileIndustry ? [profileIndustry] : undefined,
      years_experience: deriveYearsExperience(positionRows),
      worked_with_companies: workedWithCompanies,
      relationship_companies: relationshipCompanies,
      skills,
      certifications,
      last_linkedin_imported_at: new Date().toISOString(),
      notable_wins: positionRows.length
        ? splitParagraphs(
            positionRows
              .map((row) => getValue(row, ["Description", "Position Description"]))
              .filter(Boolean)
              .slice(0, 2)
              .join("\n\n"),
          ).join("\n\n")
        : undefined,
    },
    notes,
  };
}
