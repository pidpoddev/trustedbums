import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockTrainings } from "@/data/mockData";
import { Plus, FileText, Upload } from "lucide-react";

export default function ClientTrainings() {
  const clientTrainings = mockTrainings.filter(t => t.scope === "CLIENT" && t.client === "AcmeCorp");

  return (
    <div>
      <PageHeader title="Trainings & Assets" description="Upload materials that Bums can reference">
        <Button><Plus className="h-4 w-4 mr-2" /> Upload Training</Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2">
        {clientTrainings.map(t => (
          <Card key={t.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-secondary p-2">
                  <FileText className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-medium">{t.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">Updated {t.updatedAt}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="border-dashed hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6 flex flex-col items-center justify-center h-full text-center py-12">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="font-medium text-muted-foreground">Upload new training material</p>
            <p className="text-sm text-muted-foreground mt-1">PDF, PPTX, or link</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
