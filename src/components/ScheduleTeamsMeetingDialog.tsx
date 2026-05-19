import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, ExternalLink, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
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
import { scheduleTeamsMeeting, type CustomerTargetRecord, type ScheduleTeamsMeetingResponse } from "@/lib/portalApi";
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
  const [attendeeEmails, setAttendeeEmails] = useState<string[]>([]);
  const [attendeeEmailDraft, setAttendeeEmailDraft] = useState("");
  const [attendeeEmailError, setAttendeeEmailError] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  const targetName = target.target_companies?.name ?? target.target_account_name;
  const clientName = target.client_companies?.name ?? "Client";
  const bumName = getDisplayName(target.profiles?.full_name, getDisplayName(user?.name, "Trusted Bums"));
  const defaultSubject = useMemo(() => `${bumName} introducing ${clientName}`, [bumName, clientName]);
  const automaticAttendees = useMemo(
    () =>
      [
        user?.email
          ? {
              label: user.name || user.email,
              email: user.email,
            }
          : null,
        target.key_contact_email
          ? {
              label: target.key_contact_name || "Target contact",
              email: target.key_contact_email,
            }
          : null,
      ].filter((attendee): attendee is { label: string; email: string } => Boolean(attendee)),
    [target.key_contact_email, target.key_contact_name, user?.email, user?.name],
  );
  useEffect(() => {
    if (open && !subject.trim()) {
      setSubject(defaultSubject);
    }
  }, [defaultSubject, open, subject]);

  const previewStartTime = useMemo(() => {
    if (!startTime) {
      return "";
    }

    try {
      return formatDateTimeForTimeZone(parseDateTimeLocalInTimeZoneToUtcIso(startTime, timeZone), timeZone);
    } catch {
      return "";
    }
  }, [startTime, timeZone]);

  const scheduleMutation = useMutation({
    mutationFn: () =>
      scheduleTeamsMeeting({
        customerTargetId: target.id,
        subject: subject.trim() || defaultSubject,
        description,
        startTime: parseDateTimeLocalInTimeZoneToUtcIso(startTime, timeZone),
        durationMinutes: Number(durationMinutes),
        attendeeEmails,
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

    setAttendeeEmails((current) => (current.some((item) => item.toLowerCase() === email) ? current : [...current, email]));
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

    setAttendeeEmails((current) => {
      const known = new Set(current.map((email) => email.toLowerCase()));
      const next = [...current];

      for (const email of normalizedEmails) {
        if (!known.has(email)) {
          known.add(email);
          next.push(email);
        }
      }

      return next;
    });
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
    setAttendeeEmails((current) => current.filter((item) => item !== email));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (nextOpen) {
          setStartTime(getDefaultStartTime(timeZone));
          setSubject(defaultSubject);
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
              <Input
                id={`meeting-start-${target.id}`}
                type="datetime-local"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Interpreted in {timeZone}. Browser detected: {getBrowserTimeZone()}.
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
            <Label>Automatic attendees</Label>
            <div className="flex flex-wrap gap-2 rounded-md border bg-muted/30 p-2">
              {automaticAttendees.length ? (
                automaticAttendees.map((attendee) => (
                  <Badge key={attendee.email} variant="secondary" className="max-w-full gap-1.5 py-1">
                    <span className="truncate">{attendee.label}</span>
                    <span className="font-normal text-muted-foreground">{attendee.email}</span>
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">Add attendees below before sending the invite.</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={"meeting-attendees-" + target.id}>Additional attendees</Label>
            <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-md border bg-background px-2 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              {attendeeEmails.map((email) => (
                <Badge key={email} variant="secondary" className="max-w-full gap-1 py-1 pr-1">
                  <span className="truncate">{email}</span>
                  <button
                    type="button"
                    className="rounded-full p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
                    onClick={() => removeAttendeeEmail(email)}
                    aria-label={"Remove " + email}
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
                placeholder={attendeeEmails.length ? "Add another email" : "client@example.com"}
              />
            </div>
            {attendeeEmailError ? <p className="text-xs text-destructive">{attendeeEmailError}</p> : null}
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
          <Button type="button" onClick={() => scheduleMutation.mutate()} disabled={scheduleMutation.isPending}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Create Teams invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
