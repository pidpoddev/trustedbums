import { ExternalLink, Heart, Link2, MapPin, MessageSquare, ShieldCheck, Star, BriefcaseBusiness, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import type { BumProfileRecord } from "@/lib/portalApi";
import { formatDateForTimeZone, formatDateTimeForTimeZone } from "@/lib/timezone";

interface BumProfileCardProps {
  profile: Partial<BumProfileRecord> & {
    user_id: string;
    hasAcceptedAgreement?: boolean;
    acceptedTerms?: Array<{
      version: string;
      title: string;
      acceptedAt: string;
    }>;
    lastLoggedInAt?: string | null;
  };
  showAdminMeta?: boolean;
  showClientActions?: boolean;
  isShortlisted?: boolean;
  onShortlist?: () => void;
  onRequestIntro?: () => void;
  onMessage?: () => void;
  onHide?: () => void;
}

function formatList(items: string[] | undefined, emptyLabel: string) {
  const values = items?.filter(Boolean) ?? [];

  if (!values.length) {
    return <Badge variant="outline">{emptyLabel}</Badge>;
  }

  return values.slice(0, 6).map((item) => (
    <Badge key={item} variant="secondary">
      {item}
    </Badge>
  ));
}

function availabilityLabel(status?: string) {
  if (status === "selective") {
    return "Selective";
  }

  if (status === "unavailable") {
    return "Unavailable";
  }

  return "Open";
}

function verificationVariant(status?: string) {
  if (status === "verified") {
    return "success" as const;
  }

  if (status === "reviewed") {
    return "info" as const;
  }

  return "secondary" as const;
}

function toFirstName(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.split(/\s+/)[0] || null;
}

function firstNameFromEmail(email?: string | null) {
  const localPart = email?.split("@")[0]?.trim();

  if (!localPart) {
    return null;
  }

  const token = localPart.split(/[._-]+/)[0]?.trim();

  if (!token) {
    return null;
  }

  return token.charAt(0).toUpperCase() + token.slice(1);
}

function profileName(profile: BumProfileCardProps["profile"], showFullName = false) {
  const fullName = profile.profiles?.full_name?.trim();

  if (showFullName && fullName) {
    return fullName;
  }

  return (
    toFirstName(fullName) ||
    firstNameFromEmail(profile.profiles?.email) ||
    "Connector"
  );
}

export function BumProfileCard({ profile, showAdminMeta = false, showClientActions = false, isShortlisted = false, onShortlist, onRequestIntro, onMessage, onHide }: BumProfileCardProps) {
  const timeZone = useUserTimeZone();
  const acceptedTerms = profile.acceptedTerms ?? [];
  const displayName = profileName(profile, showClientActions && profile.is_visible_to_clients === true);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-lg font-bold">{displayName}</h3>
              <StatusBadge label={availabilityLabel(profile.availability_status)} variant="info" />
              <StatusBadge
                label={profile.verification_status === "verified" ? "Verified" : profile.verification_status === "reviewed" ? "Reviewed" : "Self reported"}
                variant={verificationVariant(profile.verification_status)}
              />
              {showAdminMeta ? (
                <StatusBadge
                  label={profile.is_visible_to_clients ? "Visible to clients" : "Hidden from clients"}
                  variant={profile.is_visible_to_clients ? "success" : "warning"}
                />
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{profile.profiles?.email ?? profile.user_id}</p>
            {profile.headline ? <p className="mt-3 font-medium">{profile.headline}</p> : null}
            {profile.bio ? <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{profile.bio}</p> : null}
          </div>

          <div className="flex flex-col items-end gap-2 text-right shrink-0">
            {profile.years_experience !== null && profile.years_experience !== undefined ? (
              <div>
                <p className="text-lg font-bold font-display">{profile.years_experience}</p>
                <p className="text-xs text-muted-foreground">Years experience</p>
              </div>
            ) : null}
            {profile.linkedin_url ? (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                LinkedIn <ExternalLink className="h-3 w-3" />
              </a>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground inline-flex items-center gap-1">
              <BriefcaseBusiness className="h-3.5 w-3.5" /> Industries
            </p>
            <div className="flex flex-wrap gap-2">{formatList(profile.industries, "No industries yet")}</div>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> Regions
            </p>
            <div className="flex flex-wrap gap-2">
              {formatList(
                [profile.home_region, ...(profile.regions ?? [])].filter(Boolean) as string[],
                "No regions yet",
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5" /> Products / services sold
            </p>
            <div className="flex flex-wrap gap-2">{formatList(profile.products_sold, "No products yet")}</div>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Buyer personas
            </p>
            <div className="flex flex-wrap gap-2">{formatList(profile.buyer_personas, "No buyer personas yet")}</div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground inline-flex items-center gap-1">
              <BriefcaseBusiness className="h-3.5 w-3.5" /> Worked with
            </p>
            <div className="flex flex-wrap gap-2">{formatList(profile.worked_with_companies, "No companies listed yet")}</div>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground inline-flex items-center gap-1">
              <Link2 className="h-3.5 w-3.5" /> Relationships at
            </p>
            <div className="flex flex-wrap gap-2">{formatList(profile.relationship_companies, "No relationship companies yet")}</div>
          </div>
        </div>

        {(profile.skills?.length || profile.certifications?.length || profile.notable_wins || showAdminMeta) ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Skills</p>
              <div className="flex flex-wrap gap-2">{formatList(profile.skills, "No skills listed yet")}</div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Certifications</p>
              <div className="flex flex-wrap gap-2">{formatList(profile.certifications, "No certifications yet")}</div>
            </div>

            {profile.notable_wins ? (
              <div className="space-y-2 md:col-span-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Notable wins</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{profile.notable_wins}</p>
              </div>
            ) : null}

            {showAdminMeta ? (
              <div className="space-y-2 md:col-span-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Admin status</p>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge
                    label={profile.hasAcceptedAgreement ? "Connector agreement accepted" : "Agreement pending"}
                    variant={profile.hasAcceptedAgreement ? "success" : "warning"}
                  />
                  {profile.last_linkedin_imported_at ? (
                    <Badge variant="outline">
                      Imported {formatDateForTimeZone(profile.last_linkedin_imported_at, timeZone)}
                    </Badge>
                  ) : (
                    <Badge variant="outline">No LinkedIn import yet</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {acceptedTerms.length ? (
                    acceptedTerms.map((terms) => (
                      <Badge key={`${terms.version}-${terms.acceptedAt}`} variant="outline">
                        {terms.version} accepted {formatDateForTimeZone(terms.acceptedAt, timeZone)}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline">No accepted terms recorded</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    Last login {profile.lastLoggedInAt ? formatDateTimeForTimeZone(profile.lastLoggedInAt, timeZone) : "Never recorded"}
                  </Badge>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {showClientActions ? (
          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant={isShortlisted ? "secondary" : "outline"}
                  onClick={onShortlist}
                  aria-label={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
                >
                  <Heart className={isShortlisted ? "h-4 w-4 fill-current" : "h-4 w-4"} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isShortlisted ? "Remove from shortlist" : "Shortlist"}</TooltipContent>
            </Tooltip>
            <Button type="button" size="sm" onClick={onRequestIntro}>
              Request intro
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={onMessage}>
              <MessageSquare className="mr-2 h-4 w-4" /> Message
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={onHide}>
              <EyeOff className="mr-2 h-4 w-4" /> Hide
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
