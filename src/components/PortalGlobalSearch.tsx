import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Briefcase,
  Building2,
  ContactRound,
  FileText,
  GraduationCap,
  Handshake,
  Mail,
  MessageSquare,
  Search,
  Target,
  UserRound,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import {
  listAdminProspectRecommendations,
  listAdminReverseOpportunities,
  listBumRepresentedContacts,
  listCompanies,
  listConversationThreads,
  listCustomerTargets,
  listMarketplaceOpportunities,
  listOpportunityClaims,
  listOpportunityRegistrations,
  listOwnOpportunityRegistrations,
  listOwnProspectRecommendations,
  listOwnReverseOpportunities,
  listProfiles,
  listTrainingMaterialsForUser,
  listVisibleBumProfiles,
  type BumRepresentedContactRecord,
  type ProspectRecommendationRecord,
} from "@/lib/portalApi";

const MAX_RESULTS = 10;

type SearchIcon = "opportunity" | "target" | "contact" | "client" | "claim" | "conversation" | "training" | "profile" | "report" | "email" | "page";

interface PortalSearchResult {
  id: string;
  icon: SearchIcon;
  category: string;
  title: string;
  subtitle: string;
  href: string;
  searchable: string;
}

function iconFor(type: SearchIcon) {
  if (type === "opportunity") return Briefcase;
  if (type === "target") return Target;
  if (type === "contact") return ContactRound;
  if (type === "client") return Building2;
  if (type === "claim") return Handshake;
  if (type === "conversation") return MessageSquare;
  if (type === "training") return GraduationCap;
  if (type === "profile") return UserRound;
  if (type === "report") return BarChart3;
  if (type === "email") return Mail;
  return FileText;
}

function searchable(parts: Array<string | number | null | undefined>) {
  return parts.filter((part) => part !== null && part !== undefined && String(part).trim()).join(" ").toLowerCase();
}

function result(input: Omit<PortalSearchResult, "searchable"> & { terms: Array<string | number | null | undefined> }): PortalSearchResult {
  return {
    ...input,
    searchable: searchable([input.title, input.subtitle, input.category, ...input.terms]),
  };
}

function companyWebsiteSubtitle(website?: string | null) {
  return website ? website.replace(new RegExp("^https?://"), "") : "Company";
}

function prospectCompanyName(prospect: ProspectRecommendationRecord) {
  return prospect.companies?.name ?? "Prospect";
}

function contactResultHref(contact: BumRepresentedContactRecord) {
  return contact.id.includes(":") ? contact.detailUrl : "/bum/contacts/" + contact.id;
}

function normalizeSearchText(value: string) {
  return value.trim().toLowerCase();
}

function singularizeSearchToken(value: string) {
  return value.length > 3 && value.endsWith("s") ? value.slice(0, -1) : value;
}

function scoreSearchResult(item: PortalSearchResult, normalizedQuery: string) {
  const title = normalizeSearchText(item.title);
  const category = normalizeSearchText(item.category);
  const subtitle = normalizeSearchText(item.subtitle);
  const href = normalizeSearchText(item.href);
  const normalizedToken = singularizeSearchToken(normalizedQuery);

  if (title === normalizedQuery || title === normalizedToken) return 0;
  if (item.icon === "page" && (title.includes(normalizedQuery) || title.includes(normalizedToken))) return 1;
  if (item.icon === "page" && (href.includes(normalizedQuery) || href.includes(normalizedToken))) return 2;
  if (category.includes(normalizedQuery) || category.includes(normalizedToken)) return 3;
  if (subtitle.includes(normalizedQuery) || subtitle.includes(normalizedToken)) return 4;
  return 5;
}

function rolePages(user?: { role?: string; clientAccessRole?: string }) {
  const role = user?.role;

  if (role === "ADMIN") {
    return [
      result({ id: "page:admin-dashboard", icon: "page", category: "Page", title: "Admin dashboard", subtitle: "Operations overview", href: "/admin", terms: ["dashboard operations"] }),
      result({ id: "page:admin-clients", icon: "client", category: "Page", title: "Clients", subtitle: "Manage client companies", href: "/admin/clients", terms: ["companies prospects contacts"] }),
      result({ id: "page:admin-bums", icon: "profile", category: "Page", title: "Bums", subtitle: "Manage Bum profiles", href: "/admin/bums", terms: ["users profiles sellers"] }),
      result({ id: "page:admin-opportunities", icon: "opportunity", category: "Page", title: "Opportunities", subtitle: "Pipeline and target accounts", href: "/admin/opportunities", terms: ["targets reverse pipeline"] }),
      result({ id: "page:admin-emails", icon: "email", category: "Page", title: "Emails", subtitle: "Campaigns and deliveries", href: "/admin/emails", terms: ["communications templates"] }),
      result({ id: "page:admin-reports", icon: "report", category: "Page", title: "Reports", subtitle: "Admin reporting", href: "/admin/reports", terms: ["analytics exports"] }),
    ];
  }

  if (role === "CLIENT") {
    const accessRole = user?.clientAccessRole;
    const pages = [
      result({ id: "page:client-dashboard", icon: "page", category: "Page", title: "Client dashboard", subtitle: "Client overview", href: "/client/dashboard", terms: ["dashboard overview"] }),
      result({ id: "page:client-reports", icon: "report", category: "Page", title: "Reports", subtitle: "Client reporting", href: "/client/reports", terms: ["analytics reports"] }),
      result({ id: "page:client-profile", icon: "profile", category: "Page", title: "Company Profile", subtitle: "Company settings", href: "/client/profile", terms: ["company settings"] }),
      result({ id: "page:client-user-profile", icon: "profile", category: "Page", title: "User Profile", subtitle: "Personal settings", href: "/client/user-profile", terms: ["account settings"] }),
      result({ id: "page:client-agreements", icon: "page", category: "Page", title: "Client Agreement", subtitle: "Agreement records and current terms", href: "/client/agreements", terms: ["contracts terms legal agreement records"] }),
    ];

    if (accessRole === "CLIENT_ADMIN" || accessRole === "CLIENT_MEMBER") {
      pages.push(
        result({ id: "page:client-targets", icon: "target", category: "Page", title: "Target Accounts", subtitle: "Customer targets", href: "/client/targets", terms: ["accounts contacts customers"] }),
        result({ id: "page:client-opportunities", icon: "opportunity", category: "Page", title: "Opportunities", subtitle: "Registered opportunities", href: "/client/opportunities", terms: ["pipeline registrations"] }),
        result({ id: "page:client-bums", icon: "profile", category: "Page", title: "Bums", subtitle: "Bum directory", href: "/client/bum-directory", terms: ["directory relationships sellers"] }),
        result({ id: "page:client-trainings", icon: "training", category: "Page", title: "Training & Assets", subtitle: "Bum enablement content", href: "/client/trainings", terms: ["training assets materials"] }),
        result({ id: "page:client-requests", icon: "conversation", category: "Page", title: "Customer Leads", subtitle: "Bum-submitted buyer demand", href: "/client/requests", terms: ["customer leads buyer demand conversations opportunities"] }),
      );
    }

    if (accessRole === "CLIENT_ADMIN" || accessRole === "CLIENT_FINANCE") {
      pages.push(
        result({ id: "page:client-payments", icon: "report", category: "Page", title: "Payment Reports", subtitle: "Customer Payment Reports and commission invoices", href: "/client/payments", terms: ["finance invoices customer payment reports commission"] }),
        result({ id: "page:client-exports", icon: "report", category: "Page", title: "Exports", subtitle: "CSV downloads", href: "/client/exports", terms: ["downloads csv exports"] }),
      );
    }

    if (accessRole === "CLIENT_ADMIN") {
      pages.push(result({ id: "page:client-team", icon: "profile", category: "Page", title: "Team Management", subtitle: "Client users", href: "/client/team", terms: ["members invitations"] }));
    }

    return pages;
  }

  if (role === "BUM") {
    return [
      result({ id: "page:bum-dashboard", icon: "page", category: "Page", title: "Bum dashboard", subtitle: "Workspace overview", href: "/bum/dashboard", terms: ["dashboard overview"] }),
      result({ id: "page:bum-contacts", icon: "contact", category: "Page", title: "Contacts", subtitle: "People you represent", href: "/bum/contacts", terms: ["relationships represented people"] }),
      result({ id: "page:bum-opportunities", icon: "opportunity", category: "Page", title: "Opportunities", subtitle: "Marketplace and target accounts", href: "/bum/opportunities", terms: ["targets marketplace"] }),
      result({ id: "page:bum-claims", icon: "claim", category: "Page", title: "Claims", subtitle: "Opportunity Claim requests", href: "/bum/claims", terms: ["introductions contacts claims"] }),
      result({ id: "page:bum-prospects", icon: "client", category: "Page", title: "Prospects", subtitle: "Client Prospects and contacts", href: "/bum/prospects", terms: ["recommendations contacts"] }),
      result({ id: "page:bum-clients", icon: "client", category: "Page", title: "Clients", subtitle: "Client companies", href: "/bum/clients", terms: ["companies customers"] }),
      result({ id: "page:bum-earnings", icon: "report", category: "Page", title: "Earnings", subtitle: "Bum finance", href: "/bum/earnings", terms: ["payments payouts"] }),
    ];
  }

  return [];
}

export function PortalGlobalSearch() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const shouldFetchSearchData = Boolean(user && (focused || mobileOpen || query.trim().length >= 2));

  const marketplaceOpportunitiesQuery = useQuery({
    queryKey: ["portal-search", "marketplace-opportunities", user?.role],
    queryFn: listMarketplaceOpportunities,
    enabled: shouldFetchSearchData && user?.role === "BUM",
    staleTime: 60_000,
  });
  const adminOpportunitiesQuery = useQuery({
    queryKey: ["portal-search", "admin-opportunities", user?.role],
    queryFn: () => listOpportunityRegistrations(),
    enabled: shouldFetchSearchData && user?.role === "ADMIN",
    staleTime: 60_000,
  });
  const clientOpportunitiesQuery = useQuery({
    queryKey: ["portal-search", "client-opportunities", user?.id],
    queryFn: () => listOwnOpportunityRegistrations(user!),
    enabled: shouldFetchSearchData && user?.role === "CLIENT",
    staleTime: 60_000,
  });
  const targetsQuery = useQuery({
    queryKey: ["portal-search", "targets", user?.role, user?.clientId],
    queryFn: () => listCustomerTargets(user?.role === "CLIENT" ? user : null),
    enabled: shouldFetchSearchData,
    staleTime: 60_000,
  });
  const companiesQuery = useQuery({
    queryKey: ["portal-search", "companies", user?.role],
    queryFn: listCompanies,
    enabled: shouldFetchSearchData && (user?.role === "ADMIN" || user?.role === "BUM"),
    staleTime: 60_000,
  });
  const contactsQuery = useQuery({
    queryKey: ["portal-search", "bum-contacts", user?.id],
    queryFn: () => listBumRepresentedContacts(user!.id),
    enabled: shouldFetchSearchData && user?.role === "BUM",
    staleTime: 60_000,
  });
  const claimsQuery = useQuery({
    queryKey: ["portal-search", "claims", user?.role],
    queryFn: () => listOpportunityClaims(),
    enabled: shouldFetchSearchData && (user?.role === "BUM" || user?.role === "ADMIN"),
    staleTime: 60_000,
  });
  const bumProspectsQuery = useQuery({
    queryKey: ["portal-search", "bum-prospects", user?.id],
    queryFn: () => listOwnProspectRecommendations(user!.id),
    enabled: shouldFetchSearchData && user?.role === "BUM",
    staleTime: 60_000,
  });
  const adminProspectsQuery = useQuery({
    queryKey: ["portal-search", "admin-prospects"],
    queryFn: listAdminProspectRecommendations,
    enabled: shouldFetchSearchData && user?.role === "ADMIN",
    staleTime: 60_000,
  });
  const ownReverseQuery = useQuery({
    queryKey: ["portal-search", "own-reverse", user?.id],
    queryFn: () => listOwnReverseOpportunities(user!.id),
    enabled: shouldFetchSearchData && user?.role === "BUM",
    staleTime: 60_000,
  });
  const adminReverseQuery = useQuery({
    queryKey: ["portal-search", "admin-reverse"],
    queryFn: listAdminReverseOpportunities,
    enabled: shouldFetchSearchData && user?.role === "ADMIN",
    staleTime: 60_000,
  });
  const profilesQuery = useQuery({
    queryKey: ["portal-search", "profiles", user?.role],
    queryFn: listProfiles,
    enabled: shouldFetchSearchData && user?.role === "ADMIN",
    staleTime: 60_000,
  });
  const visibleBumsQuery = useQuery({
    queryKey: ["portal-search", "visible-bums"],
    queryFn: listVisibleBumProfiles,
    enabled: shouldFetchSearchData && user?.role === "CLIENT",
    staleTime: 60_000,
  });
  const conversationsQuery = useQuery({
    queryKey: ["portal-search", "conversations", user?.id],
    queryFn: listConversationThreads,
    enabled: shouldFetchSearchData,
    staleTime: 60_000,
  });
  const trainingQuery = useQuery({
    queryKey: ["portal-search", "training", user?.id],
    queryFn: () => listTrainingMaterialsForUser(user!),
    enabled: shouldFetchSearchData,
    staleTime: 60_000,
  });

  const allResults = useMemo(() => {
    if (!user) return [];

    const opportunities = [
      ...(marketplaceOpportunitiesQuery.data ?? []).map((opportunity) => result({
        id: "opportunity:" + opportunity.id,
        icon: "opportunity",
        category: "Opportunity",
        title: opportunity.target_account_name,
        subtitle: [opportunity.companies?.name, opportunity.expected_product_service].filter(Boolean).join(" · "),
        href: "/bum/opportunities/" + opportunity.id,
        terms: [opportunity.opportunity_description, opportunity.client_contact, opportunity.trusted_bums_contact, opportunity.notes],
      })),
      ...(adminOpportunitiesQuery.data ?? []).map((opportunity) => result({
        id: "admin-opportunity:" + opportunity.id,
        icon: "opportunity",
        category: "Opportunity",
        title: opportunity.target_account_name,
        subtitle: [opportunity.companies?.name, opportunity.status].filter(Boolean).join(" · "),
        href: "/admin/opportunities",
        terms: [opportunity.opportunity_description, opportunity.expected_product_service, opportunity.client_contact, opportunity.trusted_bums_contact, opportunity.notes],
      })),
      ...(clientOpportunitiesQuery.data ?? []).map((opportunity) => result({
        id: "client-opportunity:" + opportunity.id,
        icon: "opportunity",
        category: "Opportunity",
        title: opportunity.target_account_name,
        subtitle: [opportunity.status, opportunity.expected_product_service].filter(Boolean).join(" · "),
        href: "/client/opportunities",
        terms: [opportunity.opportunity_description, opportunity.client_contact, opportunity.trusted_bums_contact, opportunity.notes],
      })),
    ];

    const targetHref = user.role === "BUM"
      ? (title: string) => "/bum/opportunities?search=" + encodeURIComponent(title)
      : user.role === "ADMIN"
        ? () => "/admin/opportunities"
        : () => "/client/targets";

    const targets = (targetsQuery.data ?? []).map((target) => {
      const title = target.target_companies?.name ?? target.target_account_name;
      return result({
        id: "target:" + target.id,
        icon: "target",
        category: "Target account",
        title,
        subtitle: [target.client_companies?.name, target.status, target.expected_product_service].filter(Boolean).join(" · "),
        href: targetHref(title),
        terms: [target.key_contact_name, target.key_contact_email, target.business_unit, target.notes],
      });
    });

    const companies = (companiesQuery.data ?? []).map((company) => result({
      id: "company:" + company.id,
      icon: "client",
      category: company.relationship_stage === "CLIENT" ? "Client" : "Company",
      title: company.name,
      subtitle: companyWebsiteSubtitle(company.website),
      href: user.role === "ADMIN" ? "/admin/clients" : "/bum/clients",
      terms: [company.description, company.linkedin_company_url, company.relationship_stage, ...(company.target_industries ?? []), ...(company.target_regions ?? [])],
    }));

    const contacts = (contactsQuery.data ?? []).map((contact) => result({
      id: "contact:" + contact.id,
      icon: "contact",
      category: "Contact",
      title: contact.name,
      subtitle: [contact.companyName, contact.contextLabel].filter(Boolean).join(" · "),
      href: contactResultHref(contact),
      terms: [contact.email, contact.title, contact.status, contact.relationshipStrength, contact.note],
    }));

    const claims = (claimsQuery.data ?? []).map((claim) => result({
      id: "claim:" + claim.id,
      icon: "claim",
      category: "Claim",
      title: claim.contact_name,
      subtitle: [claim.contact_company, claim.status].filter(Boolean).join(" · "),
      href: user.role === "ADMIN" ? "/admin/credits" : claim.opportunity_registration_id ? "/bum/opportunities/" + claim.opportunity_registration_id : "/bum/claims",
      terms: [claim.contact_email, claim.relationship_strength, claim.note, claim.opportunity_registrations?.target_account_name],
    }));

    const prospects = [
      ...(bumProspectsQuery.data ?? []),
      ...(adminProspectsQuery.data ?? []),
    ].map((prospect) => result({
      id: "prospect:" + prospect.id,
      icon: "client",
      category: "Prospect",
      title: prospectCompanyName(prospect),
      subtitle: [prospect.profiles?.full_name ?? prospect.profiles?.email, prospect.status].filter(Boolean).join(" · "),
      href: user.role === "ADMIN" ? "/admin/clients" : "/bum/prospects",
      terms: [prospect.notes, prospect.companies?.website, prospect.companies?.linkedin_company_url],
    }));

    const reverseOpportunities = [
      ...(ownReverseQuery.data ?? []),
      ...(adminReverseQuery.data ?? []),
    ].map((reverseOpportunity) => result({
      id: "reverse:" + reverseOpportunity.id,
      icon: "opportunity",
      category: "Customer lead",
      title: reverseOpportunity.customer_company_name,
      subtitle: [reverseOpportunity.companies?.name, reverseOpportunity.status].filter(Boolean).join(" · "),
      href: user.role === "ADMIN" ? "/admin/opportunities" : "/bum/reverse-opportunities",
      terms: [reverseOpportunity.vendor_contact_name, reverseOpportunity.customer_contact_name, reverseOpportunity.customer_need_summary, reverseOpportunity.notes],
    }));

    const people = [
      ...(profilesQuery.data ?? []).map((profile) => result({
        id: "profile:" + profile.id,
        icon: "profile",
        category: profile.role ?? "Profile",
        title: profile.full_name ?? profile.email ?? "Profile",
        subtitle: [profile.email, profile.companies?.name].filter(Boolean).join(" · "),
        href: profile.role === "BUM" ? "/admin/bums" : "/admin/clients",
        terms: [profile.role, profile.client_access_role],
      })),
      ...(visibleBumsQuery.data ?? []).map((bum) => result({
        id: "bum:" + bum.user_id,
        icon: "profile",
        category: "Bum",
        title: bum.profiles?.full_name ?? bum.profiles?.email ?? "Bum",
        subtitle: [bum.headline, bum.availability_status].filter(Boolean).join(" · "),
        href: "/client/bum-directory",
        terms: [bum.bio, bum.linkedin_url, ...(bum.industries ?? []), ...(bum.regions ?? []), ...(bum.products_sold ?? []), ...(bum.relationship_companies ?? [])],
      })),
    ];

    const conversations = (conversationsQuery.data ?? []).map((thread) => result({
      id: "conversation:" + thread.id,
      icon: "conversation",
      category: "Conversation",
      title: thread.subject,
      subtitle: [thread.context_type, thread.opportunity_registrations?.target_account_name ?? thread.customer_targets?.target_account_name].filter(Boolean).join(" · "),
      href: user.role === "ADMIN" ? "/admin/live-conversations" : user.role === "CLIENT" ? "/client/requests" : "/bum/live-conversations",
      terms: [thread.conversation_messages?.[0]?.body],
    }));

    const training = (trainingQuery.data ?? []).map((material) => result({
      id: "training:" + material.id,
      icon: "training",
      category: "Training",
      title: material.title,
      subtitle: [material.technology, material.companies?.name].filter(Boolean).join(" · "),
      href: user.role === "ADMIN" ? "/admin/training-assets" : user.role === "CLIENT" ? "/client/trainings" : "/bum/trainings",
      terms: [material.description, material.resource_url],
    }));

    return [
      ...rolePages(user),
      ...opportunities,
      ...targets,
      ...companies,
      ...contacts,
      ...claims,
      ...prospects,
      ...reverseOpportunities,
      ...people,
      ...conversations,
      ...training,
    ];
  }, [
    adminOpportunitiesQuery.data,
    adminProspectsQuery.data,
    adminReverseQuery.data,
    claimsQuery.data,
    clientOpportunitiesQuery.data,
    companiesQuery.data,
    contactsQuery.data,
    conversationsQuery.data,
    marketplaceOpportunitiesQuery.data,
    ownReverseQuery.data,
    profilesQuery.data,
    targetsQuery.data,
    trainingQuery.data,
    user,
    visibleBumsQuery.data,
    bumProspectsQuery.data,
  ]);

  const results = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query);
    if (normalizedQuery.length < 2) return [];
    return allResults
      .filter((item) => {
        const normalizedToken = singularizeSearchToken(normalizedQuery);
        return item.searchable.includes(normalizedQuery) || item.searchable.includes(normalizedToken);
      })
      .sort((first, second) => scoreSearchResult(first, normalizedQuery) - scoreSearchResult(second, normalizedQuery))
      .slice(0, MAX_RESULTS);
  }, [allResults, query]);

  const isLoading = [
    marketplaceOpportunitiesQuery,
    adminOpportunitiesQuery,
    clientOpportunitiesQuery,
    targetsQuery,
    companiesQuery,
    contactsQuery,
    claimsQuery,
    bumProspectsQuery,
    adminProspectsQuery,
    ownReverseQuery,
    adminReverseQuery,
    profilesQuery,
    visibleBumsQuery,
    conversationsQuery,
    trainingQuery,
  ].some((queryState) => queryState.isLoading && queryState.fetchStatus !== "idle");
  const showResults = focused && query.trim().length >= 2;

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    if (results[0]) {
      setFocused(false);
      setMobileOpen(false);
      navigate(results[0].href);
    }
  };

  const resultList = (
    <>
      {isLoading ? (
        <div className="p-3 text-sm text-muted-foreground">Searching...</div>
      ) : results.length ? (
        <div className="max-h-96 overflow-auto py-1">
          {results.map((item) => {
            const Icon = iconFor(item.icon);
            return (
              <Link
                key={item.id}
                to={item.href}
                className="flex items-start gap-3 px-3 py-2 text-sm hover:bg-muted"
                onClick={() => {
                  setFocused(false);
                  setMobileOpen(false);
                }}
              >
                <span className="mt-0.5 rounded-md bg-primary/10 p-1.5 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{item.title}</span>
                  {item.subtitle ? <span className="block truncate text-xs text-muted-foreground">{item.subtitle}</span> : null}
                </span>
                <Badge variant="outline" className="shrink-0">{item.category}</Badge>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="p-3 text-sm text-muted-foreground">No matching results you can access.</div>
      )}
    </>
  );

  const searchInput = (
    <>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => window.setTimeout(() => setFocused(false), 120)}
        placeholder="Search anything"
        className="h-9 pl-9"
        aria-label="Search anything you can access"
      />
    </>
  );

  return (
    <>
      <form onSubmit={submitSearch} className="relative ml-4 hidden w-full max-w-lg md:block">
        {searchInput}
      {showResults ? (
        <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg">
          {resultList}
        </div>
      ) : null}
      </form>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button type="button" variant="ghost" size="icon" className="ml-auto md:hidden" aria-label="Open portal search">
            <Search className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="top" className="min-h-[70vh]">
          <SheetHeader>
            <SheetTitle>Search</SheetTitle>
          </SheetHeader>
          <form onSubmit={submitSearch} className="mt-6">
            <div className="relative">
              {searchInput}
            </div>
          </form>
          {query.trim().length >= 2 ? (
            <div className="mt-4 overflow-hidden rounded-lg border bg-popover text-popover-foreground">
              {resultList}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
