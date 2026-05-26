import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Building2, ExternalLink, Mail, Search, UserRound } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import { formatDateForTimeZone } from "@/lib/timezone";
import { listBumRepresentedContacts, type BumRepresentedContactRecord, type BumRepresentedContactSource } from "@/lib/portalApi";

const sourceLabels: Record<BumRepresentedContactSource, string> = {
  OPPORTUNITY_CLAIM: "Claim",
  PROSPECT: "Prospect",
  TARGET_RESPONSE: "Target response",
};

function formatDate(value: string, timeZone: string) {
  return formatDateForTimeZone(value, timeZone, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function searchableText(contact: BumRepresentedContactRecord) {
  return [
    contact.name,
    contact.title,
    contact.email,
    contact.companyName,
    contact.contextLabel,
    contact.status,
    contact.relationshipStrength,
    contact.note,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function BumContacts() {
  const { user } = useAuth();
  const timeZone = useUserTimeZone();
  const [query, setQuery] = useState("");
  const contactsQuery = useQuery({
    queryKey: ["bum-represented-contacts", user?.id],
    queryFn: () => listBumRepresentedContacts(user!.id),
    enabled: Boolean(user?.id),
  });
  const contacts = useMemo(() => contactsQuery.data ?? [], [contactsQuery.data]);
  const filteredContacts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return contacts;
    return contacts.filter((contact) => searchableText(contact).includes(normalizedQuery));
  }, [contacts, query]);

  const countsBySource = useMemo(() => {
    return contacts.reduce<Record<BumRepresentedContactSource, number>>(
      (counts, contact) => ({ ...counts, [contact.source]: counts[contact.source] + 1 }),
      { OPPORTUNITY_CLAIM: 0, PROSPECT: 0, TARGET_RESPONSE: 0 },
    );
  }, [contacts]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts"
        description="See the people you represent across claims, prospect recommendations, and client target responses."
      />

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total contacts</p>
          <p className="mt-1 text-2xl font-semibold">{contacts.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Claim contacts</p>
          <p className="mt-1 text-2xl font-semibold">{countsBySource.OPPORTUNITY_CLAIM}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Prospect contacts</p>
          <p className="mt-1 text-2xl font-semibold">{countsBySource.PROSPECT}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Target responses</p>
          <p className="mt-1 text-2xl font-semibold">{countsBySource.TARGET_RESPONSE}</p>
        </div>
      </div>

      <div className="relative max-w-2xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search contacts, companies, emails, or opportunity context"
          className="pl-9"
        />
      </div>

      {contactsQuery.isLoading ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">Loading represented contacts...</div>
      ) : null}

      {!contactsQuery.isLoading && contactsQuery.isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive">
          Unable to load contacts right now.
        </div>
      ) : null}

      {!contactsQuery.isLoading && !contactsQuery.isError && !contacts.length ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <div className="rounded-full bg-muted p-3">
              <UserRound className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No represented contacts yet</p>
              <p className="text-sm text-muted-foreground">
                Add a prospect, respond to a client target, or claim an opportunity to start building your contact list.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/bum/opportunities">Browse opportunities</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!contactsQuery.isLoading && !contactsQuery.isError && contacts.length && !filteredContacts.length ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">No contacts match that search.</div>
      ) : null}

      <div className="grid gap-3">
        {filteredContacts.map((contact) => (
          <Card key={contact.id}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-semibold leading-tight">{contact.name}</h3>
                    <Badge variant="secondary">{sourceLabels[contact.source]}</Badge>
                    <Badge variant="outline">{contact.status.replaceAll("_", " ")}</Badge>
                  </div>
                  <div className="grid gap-1 text-sm text-muted-foreground">
                    {contact.title ? <p>{contact.title}</p> : null}
                    <p className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {contact.companyName}
                    </p>
                    {contact.email ? (
                      <a className="flex items-center gap-2 hover:text-primary" href={"mailto:" + contact.email}>
                        <Mail className="h-4 w-4" />
                        {contact.email}
                      </a>
                    ) : null}
                    <p>{contact.contextLabel}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {contact.relationshipStrength ? <Badge variant="outline">{contact.relationshipStrength.replaceAll("_", " ")}</Badge> : null}
                    <span>Added {formatDate(contact.created_at, timeZone)}</span>
                  </div>
                  {contact.note ? <p className="max-w-3xl text-sm text-muted-foreground line-clamp-2">{contact.note}</p> : null}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {contact.linkedinUrl ? (
                    <Button variant="outline" size="sm" asChild>
                      <a href={contact.linkedinUrl} target="_blank" rel="noreferrer">
                        LinkedIn
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  ) : null}
                  <Button size="sm" asChild>
                    <Link to={contact.detailUrl}>Open context</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
