import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, ExternalLink, X } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import { listClientIntroductionAttendees, scheduleTeamsMeeting, type CustomerTargetRecord, type ScheduleTeamsMeetingResponse } from "@/lib/portalApi";
import {
  formatDateTimeForTimeZone,
  getBrowserTimeZone,
  parseDateTimeLocalInTimeZoneToUtcIso,
  toDateTimeLocalValueInTimeZone,
} from "@/lib/timezone";

interface ScheduleTeamsMeetingDialogProps {
  target: CustomerTargetRecord;
  triggerLabel?: string;
  onScheduled?: (response: ScheduleTeamsMeetingResponse) => void;
}

interface MeetingAttendeeDraft {
  label: string;
  email: string;
  source: "Bum" | "Client" | "Customer" | "Added";
}

function getDefaultStartTime(timeZone: string) {
  const tomorrowDate = toDateTimeLocalValueInTimeZone(
    new Date(Date.now() + 24 * 60 * 60 * 1000),
    timeZone,
  ).slice(0, 10);

  return `${tomorrowDate}T09:00`;
}


function isEmailAddress(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeEmail(value: string) {
  return value.trim().replace(/[;,]+$/, "").toLowerCase();
}

function getDisplayName(value: string | null | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed || fallback;
}

function uniqueAttendees(attendees: MeetingAttendeeDraft[]) {
  const seen = new Set<string>();
  const unique: MeetingAttendeeDraft[] = [];

  for (const attendee of attendees) {
    const email = normalizeEmail(attendee.email);
    if (!email || seen.has(email)) {
      continue;
    }

    seen.add(email);
    unique.push({ ...attendee, email });
  }

  return unique;
}

function getTimeZoneAbbreviation(value: string, timeZone: string) {
  try {
    const iso = parseDateTimeLocalInTimeZoneToUtcIso(value, timeZone);
    const part = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "short",
    })
      .formatToParts(new Date(iso))
      .find((item) => item.type === "timeZoneName")?.value;

    return part || timeZone;
  } catch {
    return timeZone;
  }
}

export function ScheduleTeamsMeetingDialog({
  target,
  triggerLabel = "Schedule Teams call",
  onScheduled,
}: ScheduleTeamsMeetingDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const timeZone = useUserTimeZone();
  const [open, setOpen] = useState(false);
  const [startTime, setStartTime] = useState(() => getDefaultStartTime(timeZone));
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [subject, setSubject] = useState("");
  const [attendees, setAttendees] = useState<MeetingAttendeeDraft[]>([]);
  const [hasEditedAttendees, setHasEditedAttendees] = useState(false);
  const [attendeeEmailDraft, setAttendeeEmailDraft] = useState("");
  const [attendeeEmailError, setAttendeeEmailError] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  const targetName = target.target_companies?.name ?? target.target_account_name;
  const clientName = target.client_companies?.name ?? "Client";
  const bumName = getDisplayName(target.profiles?.full_name, getDisplayName(user?.name, "Trusted Bums"));
  const defaultSubject = useMemo(() => `${bumName} introducing ${clientName}`, [bumName, clientName]);
  const clientAttendeesQuery = useQuery({
    queryKey: ["client-introduction-attendees", target.client_company_id],
    queryFn: () => listClientIntroductionAttendees(target.client_company_id),
    enabled: open && Boolean(target.client_company_id),
  });
  const defaultAttendees = useMemo(() =>
    uniqueAttendees([
      user?.email
        ? { label: user.name || user.email, email: user.email, source: "Bum" as const }
        : null,
      ...(clientAttendeesQuery.data ?? []).map((profile) => ({
        label: profile.full_name || profile.email || "Client contact",
        email: profile.email ?? "",
        source: "Client" as const,
      })),
      target.key_contact_email
        ? { label: target.key_contact_name || "Customer target", email: target.key_contact_email, source: "Customer" as const }
        : null,
    ].filter((attendee): attendee is MeetingAttendeeDraft => Boolean(attendee))),
    [clientAttendeesQuery.data, target.key_contact_email, target.key_contact_name, user?.email, user?.name],
  );
  useEffect(() => {
    if (open && !subject.trim()) {
      setSubject(defaultSubject);
    }
  }, [defaultSubject, open, subject]);

  useEffect(() => {
    if (open && !hasEditedAttendees) {
      setAttendees(defaultAttendees);
    }
  }, [defaultAttendees, hasEditedAttendees, open]);

  const timeZoneAbbreviation = useMemo(() => getTimeZoneAbbreviation(startTime, timeZone), [startTime, timeZone]);
  const previewStartTime = useMemo(() => {
    if (!startTime) {
      return "";
    }

    try {
      return `${formatDateTimeForTimeZone(parseDateTimeLocalInTimeZoneToUtcIso(startTime, timeZone), timeZone)} ${timeZoneAbbreviation}`;
    } catch {
      return "";
    }
  }, [startTime, timeZone, timeZoneAbbreviation]);

  const scheduleMutation = useMutation({
    mutationFn: () =>
      scheduleTeamsMeeting({
        customerTargetId: target.id,
        subject: subject.trim() || defaultSubject,
        description,
        startTime: parseDateTimeLocalInTimeZoneToUtcIso(startTime, timeZone),
        durationMinutes: Number(durationMinutes),
        attendeeEmails: attendees.map((attendee) => attendee.email),
      }),
    onSuccess: (response) => {
      toast({
        title: "Teams call scheduled",
        description: response.meetingOptionsWarning
          ? `Invite created, but Teams options need attention: ${response.meetingOptionsWarning}`
          : "Microsoft created the calendar invite from bums@trustedbums.com with lobby bypass and automatic recording/transcription enabled.",
        variant: response.meetingOptionsWarning ? "destructive" : "default",
      });
      setOpen(false);
      onScheduled?.(response);
    },
    onError: (error) => {
      toast({
        title: "Unable to schedule Teams call",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });


  const addAttendeeEmail = (value: string) => {
    const email = normalizeEmail(value);

    if (!email) {
      return true;
    }

    if (!isEmailAddress(email)) {
      setAttendeeEmailError("Enter a valid email address.");
      return false;
    }

    setAttendees((current) => uniqueAttendees([...current, { label: email, email, source: "Added" }]));
    setHasEditedAttendees(true);
    setAttendeeEmailDraft("");
    setAttendeeEmailError(null);
    return true;
  };

  const addAttendeeEmails = (values: string[]) => {
    const normalizedEmails = values.map(normalizeEmail).filter(Boolean);
    const invalid = normalizedEmails.find((email) => !isEmailAddress(email));

    if (invalid) {
      setAttendeeEmailDraft(invalid);
      setAttendeeEmailError("Enter a valid email address.");
      return false;
    }

    setAttendees((current) =>
      uniqueAttendees([
        ...current,
        ...normalizedEmails.map((email) => ({ label: email, email, source: "Added" as const })),
      ]),
    );
    setHasEditedAttendees(true);
    setAttendeeEmailError(null);
    return true;
  };

  const handleAttendeeDraftChange = (value: string) => {
    if (!/[\n,;]/.test(value)) {
      setAttendeeEmailDraft(value);
      setAttendeeEmailError(null);
      return;
    }

    const parts = value.split(/[\n,;]+/);
    const trailing = parts.pop() ?? "";

    if (addAttendeeEmails(parts)) {
      setAttendeeEmailDraft(trailing.trimStart());
    }
  };

  const completeAttendeeDraft = () => {
    if (addAttendeeEmail(attendeeEmailDraft)) {
      setAttendeeEmailDraft("");
    }
  };

  const removeAttendeeEmail = (email: string) => {
    setAttendees((current) => current.filter((item) => item.email !== email));
    setHasEditedAttendees(true);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (nextOpen) {
          setStartTime(getDefaultStartTime(timeZone));
          setSubject(defaultSubject);
          setHasEditedAttendees(false);
          setAttendees(defaultAttendees);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <CalendarPlus className="mr-2 h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">Schedule a Teams intro</DialogTitle>
          <DialogDescription>
            Create a Teams calendar invite from bums@trustedbums.com for {clientName} and {targetName}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground">
            Meeting preview: {previewStartTime || "Pick a start time"}.
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_140px]">
            <div className="space-y-2">
              <Label htmlFor={`meeting-start-${target.id}`}>Start time</Label>
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_96px]">
                <Input
                  id={`meeting-start-${target.id}`}
                  type="datetime-local"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                />
                <div
                  className="flex h-10 items-center justify-center rounded-md border bg-muted px-3 text-sm font-medium text-muted-foreground"
                  aria-label={`Timezone ${timeZoneAbbreviation}`}
                  title={timeZone}
                >
                  {timeZoneAbbreviation}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Date and time are interpreted in {timeZone}. Browser detected: {getBrowserTimeZone()}.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`meeting-duration-${target.id}`}>Minutes</Label>
              <Input
                id={`meeting-duration-${target.id}`}
                type="number"
                min="15"
                max="240"
                step="15"
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={"meeting-subject-" + target.id}>Subject</Label>
            <Input
              id={"meeting-subject-" + target.id}
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder={defaultSubject}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={"meeting-attendees-" + target.id}>Additional attendees</Label>
            <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-md border bg-background px-2 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              {attendees.map((attendee) => (
                <Badge key={attendee.email} variant="secondary" className="max-w-full gap-1 py-1 pr-1">
                  <span className="rounded-sm bg-background/70 px-1 text-[10px] uppercase tracking-wide text-muted-foreground">{attendee.source}</span>
                  <span className="truncate">{attendee.label}</span>
                  <span className="font-normal text-muted-foreground">{attendee.email}</span>
                  <button
                    type="button"
                    className="rounded-full p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
                    onClick={() => removeAttendeeEmail(attendee.email)}
                    aria-label={"Remove " + attendee.email}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <input
                id={"meeting-attendees-" + target.id}
                className="h-7 min-w-[14rem] flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                value={attendeeEmailDraft}
                onChange={(event) => handleAttendeeDraftChange(event.target.value)}
                onBlur={completeAttendeeDraft}
                onKeyDown={(event) => {
                  const draft = normalizeEmail(attendeeEmailDraft);
                  const shouldComplete = ["Enter", "Tab", ",", ";"].includes(event.key) || (event.key === " " && isEmailAddress(draft));

                  if (shouldComplete && attendeeEmailDraft.trim()) {
                    event.preventDefault();
                    completeAttendeeDraft();
                  }
                }}
                placeholder={attendees.length ? "Add another email" : "client@example.com"}
              />
            </div>
            {attendeeEmailError ? <p className="text-xs text-destructive">{attendeeEmailError}</p> : null}
            <p className="text-xs text-muted-foreground">
              Bum, enabled client contacts, and the customer target are prefilled. Remove anyone who should not receive this invite.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`meeting-description-${target.id}`}>Context for the invite</Label>
            <Textarea
              id={`meeting-description-${target.id}`}
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Agenda, customer context, and anything the invitees should know."
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => scheduleMutation.mutate()} disabled={scheduleMutation.isPending || !attendees.length}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Create Teams invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
