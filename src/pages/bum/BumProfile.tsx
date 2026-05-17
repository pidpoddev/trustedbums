import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileUp, Linkedin, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { UserTimeZoneCard } from "@/components/UserTimeZoneCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { importLinkedInExport, type LinkedInExportSelection } from "@/lib/linkedinImport";
import { getOwnBumProfile, upsertOwnBumProfile } from "@/lib/portalApi";

interface BumProfileFormState {
  headline: string;
  bio: string;
  linkedin_url: string;
  years_experience: string;
  availability_status: "open" | "selective" | "unavailable";
  home_region: string;
  industries: string;
  regions: string;
  products_sold: string;
  buyer_personas: string;
  worked_with_companies: string;
  relationship_companies: string;
  certifications: string;
  skills: string;
  notable_wins: string;
  is_visible_to_clients: boolean;
}

const defaultForm: BumProfileFormState = {
  headline: "",
  bio: "",
  linkedin_url: "",
  years_experience: "",
  availability_status: "open",
  home_region: "",
  industries: "",
  regions: "",
  products_sold: "",
  buyer_personas: "",
  worked_with_companies: "",
  relationship_companies: "",
  certifications: "",
  skills: "",
  notable_wins: "",
  is_visible_to_clients: true,
};

function linesToArray(value: string) {
  return value
    .split(/\n|,/g)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function arrayToLines(values?: string[]) {
  return values?.join("\n") ?? "";
}

function toFormState(profile: Awaited<ReturnType<typeof getOwnBumProfile>>): BumProfileFormState {
  if (!profile) {
    return defaultForm;
  }

  return {
    headline: profile.headline ?? "",
    bio: profile.bio ?? "",
    linkedin_url: profile.linkedin_url ?? "",
    years_experience: profile.years_experience?.toString() ?? "",
    availability_status: profile.availability_status ?? "open",
    home_region: profile.home_region ?? "",
    industries: arrayToLines(profile.industries),
    regions: arrayToLines(profile.regions),
    products_sold: arrayToLines(profile.products_sold),
    buyer_personas: arrayToLines(profile.buyer_personas),
    worked_with_companies: arrayToLines(profile.worked_with_companies),
    relationship_companies: arrayToLines(profile.relationship_companies),
    certifications: arrayToLines(profile.certifications),
    skills: arrayToLines(profile.skills),
    notable_wins: profile.notable_wins ?? "",
    is_visible_to_clients: profile.is_visible_to_clients ?? true,
  };
}

export default function BumProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<BumProfileFormState>(defaultForm);
  const [hasHydratedForm, setHasHydratedForm] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [linkedInFiles, setLinkedInFiles] = useState<LinkedInExportSelection>({});
  const [importNotes, setImportNotes] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [pendingLinkedInImportedAt, setPendingLinkedInImportedAt] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: ["bum-profile", user?.id],
    queryFn: () => getOwnBumProfile(user!.id),
    enabled: Boolean(user?.id),
  });

  useEffect(() => {
    setForm(defaultForm);
    setHasHydratedForm(false);
    setIsDirty(false);
    setLinkedInFiles({});
    setImportNotes([]);
    setPendingLinkedInImportedAt(null);
  }, [user?.id]);

  useEffect(() => {
    if (profileQuery.isSuccess && !hasHydratedForm) {
      if (!isDirty) {
        setForm(toFormState(profileQuery.data));
        setPendingLinkedInImportedAt(profileQuery.data?.last_linkedin_imported_at ?? null);
      }
      setHasHydratedForm(true);
    }
  }, [hasHydratedForm, isDirty, profileQuery.data, profileQuery.isSuccess]);

  function updateForm(updater: (current: BumProfileFormState) => BumProfileFormState) {
    setIsDirty(true);
    setForm(updater);
  }

  const saveMutation = useMutation({
    mutationFn: () =>
      upsertOwnBumProfile(user!, {
        headline: form.headline,
        bio: form.bio,
        linkedin_url: form.linkedin_url,
        years_experience: form.years_experience.trim() ? Number(form.years_experience) : null,
        availability_status: form.availability_status,
        home_region: form.home_region,
        industries: linesToArray(form.industries),
        regions: linesToArray(form.regions),
        products_sold: linesToArray(form.products_sold),
        buyer_personas: linesToArray(form.buyer_personas),
        worked_with_companies: linesToArray(form.worked_with_companies),
        relationship_companies: linesToArray(form.relationship_companies),
        certifications: linesToArray(form.certifications),
        skills: linesToArray(form.skills),
        notable_wins: form.notable_wins,
        is_visible_to_clients: form.is_visible_to_clients,
        last_linkedin_imported_at: pendingLinkedInImportedAt,
      }),
    onSuccess: async (profile) => {
      setIsDirty(false);
      setPendingLinkedInImportedAt(profile.last_linkedin_imported_at ?? null);
      await queryClient.invalidateQueries({ queryKey: ["bum-profile", user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["admin-bum-profiles"] });
      await queryClient.invalidateQueries({ queryKey: ["client-visible-bum-profiles"] });
      toast({
        title: "Profile saved",
        description: "Your connector profile is updated for admin and client review.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to save profile",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  async function handleImport() {
    setIsImporting(true);

    try {
      const result = await importLinkedInExport(linkedInFiles);
      const importedAt = result.patch.last_linkedin_imported_at ?? new Date().toISOString();
      setImportNotes(result.notes);
      setPendingLinkedInImportedAt(importedAt);
      setIsDirty(true);
      setForm((current) => ({
        ...current,
        headline: result.patch.headline ?? current.headline,
        bio: result.patch.bio ?? current.bio,
        linkedin_url: result.patch.linkedin_url ?? current.linkedin_url,
        years_experience:
          result.patch.years_experience !== undefined && result.patch.years_experience !== null
            ? String(result.patch.years_experience)
            : current.years_experience,
        home_region: result.patch.home_region ?? current.home_region,
        industries: result.patch.industries?.length ? arrayToLines(result.patch.industries) : current.industries,
        worked_with_companies: result.patch.worked_with_companies?.length
          ? arrayToLines(result.patch.worked_with_companies)
          : current.worked_with_companies,
        relationship_companies: result.patch.relationship_companies?.length
          ? arrayToLines(result.patch.relationship_companies)
          : current.relationship_companies,
        certifications: result.patch.certifications?.length
          ? arrayToLines(result.patch.certifications)
          : current.certifications,
        skills: result.patch.skills?.length ? arrayToLines(result.patch.skills) : current.skills,
        notable_wins: result.patch.notable_wins ?? current.notable_wins,
      }));

      toast({
        title: "LinkedIn export imported",
        description: "We prefilled what we could. Review everything before saving.",
      });
    } catch (error) {
      toast({
        title: "Unable to import LinkedIn export",
        description: error instanceof Error ? error.message : "Check the files and try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  }

  const profileStatus = useMemo(() => {
    const profile = profileQuery.data;

    if (!profile) {
      return {
        verification: "Self reported",
        visibility: form.is_visible_to_clients ? "Visible to clients" : "Hidden from clients",
      };
    }

    return {
      verification:
        profile.verification_status === "verified"
          ? "Verified"
          : profile.verification_status === "reviewed"
            ? "Reviewed"
            : "Self reported",
      visibility: profile.is_visible_to_clients ? "Visible to clients" : "Hidden from clients",
    };
  }, [form.is_visible_to_clients, profileQuery.data]);

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Build the connector profile that admins and clients will review." />

      <div className="max-w-2xl">
        <UserTimeZoneCard description="Your time zone controls how meetings and timestamps appear throughout the Bum portal." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Connector Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <StatusBadge label={profileStatus.verification} variant={profileQuery.data?.verification_status === "verified" ? "success" : profileQuery.data?.verification_status === "reviewed" ? "info" : "secondary"} />
              <StatusBadge label={profileStatus.visibility} variant={form.is_visible_to_clients ? "success" : "warning"} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  value={form.headline}
                  onChange={(event) => updateForm((current) => ({ ...current, headline: event.target.value }))}
                  placeholder="Healthcare connector with 15 years selling enterprise software"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  value={form.linkedin_url}
                  onChange={(event) => updateForm((current) => ({ ...current, linkedin_url: event.target.value }))}
                  placeholder="https://www.linkedin.com/in/your-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Short bio</Label>
              <Textarea
                id="bio"
                rows={4}
                value={form.bio}
                onChange={(event) => updateForm((current) => ({ ...current, bio: event.target.value }))}
                placeholder="What should clients know about your background, network, and style?"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of experience</Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  min="0"
                  value={form.years_experience}
                  onChange={(event) => updateForm((current) => ({ ...current, years_experience: event.target.value }))}
                  placeholder="15"
                />
              </div>
              <div className="space-y-2">
                <Label>Availability</Label>
                <Select
                  value={form.availability_status}
                  onValueChange={(value: BumProfileFormState["availability_status"]) =>
                    updateForm((current) => ({ ...current, availability_status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="selective">Selective</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="homeRegion">Home region</Label>
                <Input
                  id="homeRegion"
                  value={form.home_region}
                  onChange={(event) => updateForm((current) => ({ ...current, home_region: event.target.value }))}
                  placeholder="North America"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="industries">Industries worked in</Label>
                <Textarea
                  id="industries"
                  rows={5}
                  value={form.industries}
                  onChange={(event) => updateForm((current) => ({ ...current, industries: event.target.value }))}
                  placeholder={"Healthcare\nCybersecurity\nSaaS"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regions">Regions covered</Label>
                <Textarea
                  id="regions"
                  rows={5}
                  value={form.regions}
                  onChange={(event) => updateForm((current) => ({ ...current, regions: event.target.value }))}
                  placeholder={"North America\nEMEA"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productsSold">Products / services sold</Label>
                <Textarea
                  id="productsSold"
                  rows={5}
                  value={form.products_sold}
                  onChange={(event) => updateForm((current) => ({ ...current, products_sold: event.target.value }))}
                  placeholder={"Revenue intelligence\nManaged services"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyerPersonas">Buyer personas / titles</Label>
                <Textarea
                  id="buyerPersonas"
                  rows={5}
                  value={form.buyer_personas}
                  onChange={(event) => updateForm((current) => ({ ...current, buyer_personas: event.target.value }))}
                  placeholder={"CIO\nVP Sales\nHead of Procurement"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workedWithCompanies">Companies worked with</Label>
                <Textarea
                  id="workedWithCompanies"
                  rows={6}
                  value={form.worked_with_companies}
                  onChange={(event) => updateForm((current) => ({ ...current, worked_with_companies: event.target.value }))}
                  placeholder={"Acme Corp\nBlueWave Solutions"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationshipCompanies">Companies where you have relationships</Label>
                <Textarea
                  id="relationshipCompanies"
                  rows={6}
                  value={form.relationship_companies}
                  onChange={(event) => updateForm((current) => ({ ...current, relationship_companies: event.target.value }))}
                  placeholder={"Mayo Clinic\nDatadog"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills / expertise</Label>
                <Textarea
                  id="skills"
                  rows={5}
                  value={form.skills}
                  onChange={(event) => updateForm((current) => ({ ...current, skills: event.target.value }))}
                  placeholder={"Enterprise sales\nChannel partnerships"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certifications">Certifications</Label>
                <Textarea
                  id="certifications"
                  rows={5}
                  value={form.certifications}
                  onChange={(event) => updateForm((current) => ({ ...current, certifications: event.target.value }))}
                  placeholder={"AWS Certified Cloud Practitioner"}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notableWins">Notable wins or examples</Label>
              <Textarea
                id="notableWins"
                rows={5}
                value={form.notable_wins}
                onChange={(event) => updateForm((current) => ({ ...current, notable_wins: event.target.value }))}
                placeholder="Describe major accounts, deals, launches, or introductions you are comfortable sharing."
              />
            </div>

            <div className="flex items-center space-x-2 rounded-md border p-4">
              <Checkbox
                id="visibleToClients"
                checked={form.is_visible_to_clients}
                onCheckedChange={(checked) =>
                  updateForm((current) => ({ ...current, is_visible_to_clients: checked === true }))
                }
              />
              <div className="space-y-1">
                <Label htmlFor="visibleToClients">Visible to clients</Label>
                <p className="text-sm text-muted-foreground">
                  Turn this on when you want clients browsing the directory to see your profile.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || profileQuery.isLoading}>
                Save profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Linkedin className="h-5 w-5 text-primary" />
                Import from LinkedIn export
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-md border bg-muted/20 p-4 text-muted-foreground">
                <p className="font-medium text-foreground">How it works</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  <li>In LinkedIn, open Settings & Privacy.</li>
                  <li>Go to Data Privacy and choose Get a copy of your data.</li>
                  <li>Request the Profile, Positions, Skills, Certifications, and Connections exports.</li>
                  <li>Download the archive, unzip it, and upload the CSV files below.</li>
                </ol>
              </div>

              <div className="grid gap-3">
                <div className="space-y-2">
                  <Label htmlFor="linkedinProfileCsv">Profile CSV</Label>
                  <Input id="linkedinProfileCsv" type="file" accept=".csv" onChange={(event) => setLinkedInFiles((current) => ({ ...current, profile: event.target.files?.[0] ?? null }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedinPositionsCsv">Positions CSV</Label>
                  <Input id="linkedinPositionsCsv" type="file" accept=".csv" onChange={(event) => setLinkedInFiles((current) => ({ ...current, positions: event.target.files?.[0] ?? null }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedinSkillsCsv">Skills CSV</Label>
                  <Input id="linkedinSkillsCsv" type="file" accept=".csv" onChange={(event) => setLinkedInFiles((current) => ({ ...current, skills: event.target.files?.[0] ?? null }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedinCertificationsCsv">Certifications CSV</Label>
                  <Input id="linkedinCertificationsCsv" type="file" accept=".csv" onChange={(event) => setLinkedInFiles((current) => ({ ...current, certifications: event.target.files?.[0] ?? null }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedinConnectionsCsv">Connections CSV</Label>
                  <Input id="linkedinConnectionsCsv" type="file" accept=".csv" onChange={(event) => setLinkedInFiles((current) => ({ ...current, connections: event.target.files?.[0] ?? null }))} />
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={handleImport} disabled={isImporting}>
                <FileUp className="mr-2 h-4 w-4" />
                {isImporting ? "Importing..." : "Import and prefill"}
              </Button>

              {importNotes.length ? (
                <div className="rounded-md border bg-card p-4">
                  <p className="font-medium">Imported summary</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                    {importNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Profile review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Imported LinkedIn data is only a starting point. Review every field before saving, especially relationship companies, products sold, and notable wins.
              </p>
              <p>
                Imported data is only a draft until you click <span className="font-medium text-foreground">Save profile</span>.
              </p>
              <p>
                Clients only see the profile when <span className="font-medium text-foreground">Visible to clients</span> is enabled.
              </p>
              <a
                href="https://www.linkedin.com/help/linkedin/answer/a1339364/download-your-account-data?lang=en"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                LinkedIn export instructions <Download className="h-4 w-4" />
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
