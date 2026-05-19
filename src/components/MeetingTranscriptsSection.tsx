import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, FileText, Link as LinkIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import {
  createMeetingTranscript,
  listMeetingTranscripts,
  type MeetingTranscriptFilters,
} from "@/lib/portalApi";
import { formatDateTimeForTimeZone } from "@/lib/timezone";

interface MeetingTranscriptsSectionProps {
  title?: string;
  description?: string;
  filters: MeetingTranscriptFilters;
  companyId?: string | null;
  allowAdd?: boolean;
  compact?: boolean;
}

function transcriptPreview(text: string | null) {
  if (!text) {
    return "Transcript content is stored externally.";
  }
  return text.length > 280 ? `${text.slice(0, 280)}...` : text;
}

export function MeetingTranscriptsSection({
  title = "Meeting transcripts",
  description = "Teams call transcripts and meeting notes tied to this opportunity.",
  filters,
  companyId,
  allowAdd = false,
  compact = false,
}: MeetingTranscriptsSectionProps) {
  const { user } = useAuth();
  const timeZone = useUserTimeZone();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(!compact);
  const [transcriptTitle, setTranscriptTitle] = useState("");
  const [transcriptText, setTranscriptText] = useState("");
  const [transcriptUrl, setTranscriptUrl] = useState("");

  const transcriptsQuery = useQuery({
    queryKey: ["meeting-transcripts", filters],
    queryFn: () => listMeetingTranscripts(filters),
  });
  const transcripts = transcriptsQuery.data ?? [];
  const showContent = !compact || expanded;

  const createMutation = useMutation({
    mutationFn: () =>
      createMeetingTranscript(user!, {
        opportunityRegistrationId: filters.opportunityRegistrationId,
        customerTargetId: filters.customerTargetId,
        teamsMeetingId: filters.teamsMeetingId,
        companyId,
        title: transcriptTitle,
        transcriptText,
        transcriptUrl,
        source: "MANUAL",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["meeting-transcripts"] });
      toast({ title: "Transcript added", description: "The meeting transcript is now visible on this opportunity." });
      setOpen(false);
      setTranscriptTitle("");
      setTranscriptText("");
      setTranscriptUrl("");
    },
    onError: (error) => {
      toast({
        title: "Unable to add transcript",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader className={compact ? "p-4" : undefined}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="font-display flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <p className={compact ? "mt-1 text-xs text-muted-foreground" : "mt-1 text-sm text-muted-foreground"}>
              {compact ? `${transcripts.length} transcript${transcripts.length === 1 ? "" : "s"} attached` : description}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {compact ? (
              <Button type="button" size="sm" variant="ghost" onClick={() => setExpanded((current) => !current)}>
                {expanded ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                {expanded ? "Hide" : "Show"}
              </Button>
            ) : null}
          {allowAdd ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add transcript
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-display">Add meeting transcript</DialogTitle>
                  <DialogDescription>
                    Use this for manual notes now. Microsoft Graph transcripts can use this same section once fetched.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={transcriptTitle}
                      onChange={(event) => setTranscriptTitle(event.target.value)}
                      placeholder="Teams intro transcript"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Transcript URL</Label>
                    <Input
                      value={transcriptUrl}
                      onChange={(event) => setTranscriptUrl(event.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Transcript text / notes</Label>
                    <Textarea
                      rows={8}
                      value={transcriptText}
                      onChange={(event) => setTranscriptText(event.target.value)}
                      placeholder="Paste transcript text or meeting notes here."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    disabled={(!transcriptText.trim() && !transcriptUrl.trim()) || createMutation.isPending}
                    onClick={() => createMutation.mutate()}
                  >
                    Save transcript
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : null}
          </div>
        </div>
      </CardHeader>
      {showContent ? (
      <CardContent className={compact ? "space-y-3 px-4 pb-4 pt-0" : "space-y-3"}>
        {transcripts.map((transcript) => (
          <div key={transcript.id} className="rounded-xl border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{transcript.title}</p>
                <p className="text-xs text-muted-foreground">
                  {transcript.teams_meetings?.subject ?? transcript.opportunity_registrations?.target_account_name ?? "Teams meeting"}
                  {" · "}
                  {formatDateTimeForTimeZone(transcript.captured_at ?? transcript.created_at, timeZone)}
                </p>
              </div>
              <StatusBadge label={transcript.status} variant={transcript.status === "AVAILABLE" ? "success" : transcript.status === "FAILED" ? "destructive" : "warning"} />
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{transcriptPreview(transcript.transcript_text)}</p>
            {transcript.transcript_url ? (
              <a
                href={transcript.transcript_url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <LinkIcon className="h-4 w-4" />
                Open transcript
              </a>
            ) : null}
          </div>
        ))}
        {!transcriptsQuery.isLoading && !transcripts.length ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            No transcripts have been added yet.
          </div>
        ) : null}
      </CardContent>
      ) : null}
    </Card>
  );
}
