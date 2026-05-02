import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { mockLiveConversations } from "@/data/mockData";
import { Plus, Video, Calendar } from "lucide-react";

export default function AdminLiveConversations() {
  return (
    <div>
      <PageHeader title="Live Conversations" description="Schedule and manage live team events">
        <Button><Plus className="h-4 w-4 mr-2" /> New Event</Button>
      </PageHeader>

      <div className="grid gap-4">
        {mockLiveConversations.map(event => (
          <Card key={event.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-primary/10 p-3">
                    <Video className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium font-display">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.startsAt).toLocaleDateString()} · {event.durationMins} min
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold font-display">{event.rsvps}</p>
                    <p className="text-xs text-muted-foreground">RSVPs</p>
                  </div>
                  <StatusBadge
                    label={event.status === "upcoming" ? "Upcoming" : "Completed"}
                    variant={event.status === "upcoming" ? "info" : "success"}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
