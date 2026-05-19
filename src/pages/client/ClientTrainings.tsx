import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import { createTrainingMaterial, getTrainingMaterialAttachmentUrl, listClientTrainingMaterials, type TrainingMaterialAttachment } from "@/lib/portalApi";
import { formatDateForTimeZone } from "@/lib/timezone";
import { Download, FileText, Paperclip, Plus, Search, Upload, X } from "lucide-react";

type TrainingTypeFilter = "ALL" | "LINKED_RESOURCE" | "REFERENCE_ONLY" | "TECH_SPECIFIC";

const trainingTypeFilters: { value: TrainingTypeFilter; label: string }[] = [
  { value: "ALL", label: "All training types" },
  { value: "LINKED_RESOURCE", label: "Linked resources" },
  { value: "REFERENCE_ONLY", label: "Reference notes only" },
  { value: "TECH_SPECIFIC", label: "Technology-specific" },
];

function formatAttachmentSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default function ClientTrainings() {
  const { user } = useAuth();
  const timeZone = useUserTimeZone();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TrainingTypeFilter>("ALL");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [form, setForm] = useState({
    title: "",
    technology: "",
    resource_url: "",
    description: "",
  });
  const trainingsQuery = useQuery({
    queryKey: ["client-training-materials", user?.clientId],
    queryFn: () => listClientTrainingMaterials(user!),
    enabled: Boolean(user?.clientId),
  });
  const createMutation = useMutation({
    mutationFn: () => createTrainingMaterial(user!, { ...form, attachments }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["client-training-materials", user?.clientId] });
      await queryClient.invalidateQueries({ queryKey: ["bum-marketplace-trainings"] });
      setForm({ title: "", technology: "", resource_url: "", description: "" });
      setAttachments([]);
      setShowForm(false);
      toast({
        title: "Training added",
        description: "Bums can now learn from this training in the shared library.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to save training",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const openAttachment = async (attachment: TrainingMaterialAttachment) => {
    try {
      const url = await getTrainingMaterialAttachmentUrl(attachment);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast({
        title: "Unable to open attachment",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const trainings = trainingsQuery.data ?? [];
  const filteredTrainings = useMemo(() => {
    return trainings.filter((training) => {
      const matchesType =
        typeFilter === "ALL" ||
        (typeFilter === "LINKED_RESOURCE" && Boolean(training.resource_url)) ||
        (typeFilter === "REFERENCE_ONLY" && !training.resource_url) ||
        (typeFilter === "TECH_SPECIFIC" && Boolean(training.technology));

      const matchesQuery = [training.title, training.description, training.technology]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchesType && matchesQuery;
    });
  }, [query, trainings, typeFilter]);

  return (
    <div>
      <PageHeader title="Trainings & Assets" description="Upload materials that Bums can reference">
        <Button onClick={() => setShowForm((current) => !current)}>
          <Plus className="h-4 w-4 mr-2" /> Add Training
        </Button>
      </PageHeader>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="trainingTitle">Training title</Label>
                <Input
                  id="trainingTitle"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Product overview"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trainingTechnology">Technology / topic</Label>
                <Input
                  id="trainingTechnology"
                  value={form.technology}
                  onChange={(event) => setForm((current) => ({ ...current, technology: event.target.value }))}
                  placeholder="Revenue intelligence"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="trainingUrl">Training link</Label>
                <Input
                  id="trainingUrl"
                  value={form.resource_url}
                  onChange={(event) => setForm((current) => ({ ...current, resource_url: event.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="trainingAttachments">Read Ahead attachments</Label>
                <Input
                  id="trainingAttachments"
                  type="file"
                  multiple
                  onChange={(event) => setAttachments(Array.from(event.target.files ?? []))}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.png,.jpg,.jpeg"
                />
                {attachments.length ? (
                  <div className="grid gap-2 rounded-md border bg-muted/30 p-3">
                    {attachments.map((file, index) => (
                      <div key={`${file.name}-${file.size}-${index}`} className="flex items-center justify-between gap-3 text-sm">
                        <div className="flex min-w-0 items-center gap-2">
                          <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="truncate">{file.name}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">{formatAttachmentSize(file.size)}</span>
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setAttachments((current) => current.filter((_, currentIndex) => currentIndex !== index))}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="trainingDescription">Description</Label>
                <Textarea
                  id="trainingDescription"
                  rows={4}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="What should Bums understand before they make introductions?"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button disabled={!form.title.trim() || createMutation.isPending} onClick={() => createMutation.mutate()}>
                Save Training
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(240px,0.8fr)] md:items-end">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search trainings, technologies, or descriptions"
                className="pl-9"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={(value: TrainingTypeFilter) => setTypeFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {trainingTypeFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredTrainings.map((training) => (
          <Card key={training.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-secondary p-2">
                  <FileText className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{training.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{training.description ?? "No description provided."}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {training.technology ?? "General"} · Updated {formatDateForTimeZone(training.updated_at, timeZone)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {training.resource_url ? (
                      <Button size="sm" variant="outline" asChild>
                        <a href={training.resource_url} target="_blank" rel="noreferrer">
                          Open training link
                        </a>
                      </Button>
                    ) : null}
                    {(training.training_material_attachments ?? []).map((attachment) => (
                      <Button key={attachment.id} size="sm" variant="outline" onClick={() => openAttachment(attachment)}>
                        <Download className="mr-2 h-4 w-4" />
                        {attachment.file_name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {!trainingsQuery.isLoading && !trainings.length && (
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-secondary p-2">
                  <FileText className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-medium">No training materials uploaded yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add product decks, FAQ links, or positioning notes so Bums can learn your technology before making introductions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!trainingsQuery.isLoading && trainings.length > 0 && !filteredTrainings.length && (
          <Card className="md:col-span-2">
            <CardContent className="pt-6 text-sm text-muted-foreground">
              No trainings match your current filters.
            </CardContent>
          </Card>
        )}

        <Card className="border-dashed hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6 flex flex-col items-center justify-center h-full text-center py-12">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="font-medium text-muted-foreground">Training library is live</p>
            <p className="text-sm text-muted-foreground mt-1">Add titles, descriptions, links, and read-ahead attachments.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
