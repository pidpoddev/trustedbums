import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MessageSquarePlus } from "lucide-react";
import { useLocation } from "react-router-dom";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { submitFeedback, type FeedbackType } from "@/lib/portalApi";

const FEEDBACK_TYPE_OPTIONS: Array<{ value: FeedbackType; label: string }> = [
  { value: "BUG", label: "Bug" },
  { value: "FEATURE", label: "Feature request" },
  { value: "QUESTION", label: "Question" },
  { value: "OTHER", label: "Other" },
];

export function SubmitFeedbackButton() {
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("BUG");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const pagePath = useMemo(
    () => location.pathname + location.search + location.hash,
    [location.hash, location.pathname, location.search],
  );
  const canSubmit = title.trim().length >= 3 && description.trim().length >= 10;

  const mutation = useMutation({
    mutationFn: () =>
      submitFeedback({
        type,
        title,
        description,
        pageUrl: window.location.href,
        pagePath,
        userAgent: navigator.userAgent,
        clientAccessRole: user?.clientAccessRole,
      }),
    onSuccess: (result) => {
      setOpen(false);
      setType("BUG");
      setTitle("");
      setDescription("");
      toast({
        title: "Feedback submitted",
        description: result.emailSent ? "It was logged and sent to Trusted Bums." : "It was logged. Email delivery needs admin review.",
        variant: result.emailSent ? "default" : "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to submit feedback",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2 px-2 sm:px-3" aria-label="Submit feedback">
          <MessageSquarePlus className="h-4 w-4" />
          <span className="hidden lg:inline">Submit Feedback</span>
          <span className="hidden sm:inline lg:hidden">Feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] overflow-y-auto bg-background sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit feedback</DialogTitle>
          <DialogDescription>Send a bug, feature request, question, or other note to Trusted Bums.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)]">
            <div className="space-y-2">
              <Label htmlFor="feedback-type">Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as FeedbackType)}>
                <SelectTrigger id="feedback-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEEDBACK_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback-title">Title</Label>
              <Input id="feedback-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Short summary" maxLength={180} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="feedback-description">Details</Label>
            <Textarea
              id="feedback-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What happened, what you expected, or what would help?"
              rows={6}
              maxLength={5000}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="feedback-page">Page</Label>
            <Input id="feedback-page" value={pagePath || "/"} readOnly className="bg-muted/60 font-mono text-xs" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="button" onClick={() => mutation.mutate()} disabled={!canSubmit || mutation.isPending}>
            {mutation.isPending ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
