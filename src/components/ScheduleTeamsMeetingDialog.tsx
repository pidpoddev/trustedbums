import { useMemo, useState } from "react";
import { CalendarPlus, ExternalLink } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
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
import { useToast } from "@/hooks/use-toast";
import { scheduleTeamsMeeting, type CustomerTargetRecord, type ScheduleTeamsMeetingResponse } from "@/lib/portalApi";

interface ScheduleTeamsMeetingDialogProps {
  target: CustomerTargetRecord;
  triggerLabel?: string;
  onScheduled?: (response: ScheduleTeamsMeetingResponse) => void;
}

function toDatetimeLocalValue(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function getDefaultStartTime() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return toDatetimeLocalValue(date);
}

function splitEmails(value: string) {
  return value
    .split(/[\n,;]/)
    .map((email) => email.trim())
    .filter(Boolean);
}

export function ScheduleTeamsMeetingDialog({
  target,
  triggerLabel = "Schedule Teams call",
  onScheduled,
}: ScheduleTeamsMeetingDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [startTime, setStartTime] = useState(getDefaultStartTime);
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [subject, setSubject] = useState("");
  const [attendeeEmails, setAttendeeEmails] = useState("");
  const [description, setDescription] = useState("");

  const targetName = target.target_companies?.name ?? target.target_account_name;
  const clientName = target.client_companies?.name ?? "Client";
  const defaultSubject = useMemo(() => `Trusted Bums intro: ${clientName} <> ${targetName}`, [clientName, targetName]);

  const scheduleMutation = useMutation({
    mutationFn: () =>
      scheduleTeamsMeeting({
        customerTargetId: target.id,
        subject: subject.trim() || defaultSubject,
        description,
        startTime: new Date(startTime).toISOString(),
        durationMinutes: Number(durationMinutes),
        attendeeEmails: splitEmails(attendeeEmails),
      }),
    onSuccess: (response) => {
      toast({
        title: "Teams call scheduled",
        description: "Microsoft created the calendar invite from bums@trustedbums.com.",
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

  const primaryContactLine = target.key_contact_email
    ? `${target.key_contact_name ?? "Target contact"} <${target.key_contact_email}> will be included automatically.`
    : "Add the target contact email below so Microsoft can send the invite.";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <div className="rounded-xl border bg-muted/40 p-3 text-sm text-muted-foreground">
            {primaryContactLine}
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
            <Label htmlFor={`meeting-subject-${target.id}`}>Subject</Label>
            <Input
              id={`meeting-subject-${target.id}`}
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder={defaultSubject}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`meeting-attendees-${target.id}`}>Additional attendees</Label>
            <Textarea
              id={`meeting-attendees-${target.id}`}
              rows={3}
              value={attendeeEmails}
              onChange={(event) => setAttendeeEmails(event.target.value)}
              placeholder="client@example.com, admin@trustedbums.com, another.bum@example.com"
            />
            <p className="text-xs text-muted-foreground">
              The scheduler automatically includes you and the target key contact when available.
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
          <Button type="button" onClick={() => scheduleMutation.mutate()} disabled={scheduleMutation.isPending}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Create Teams invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
