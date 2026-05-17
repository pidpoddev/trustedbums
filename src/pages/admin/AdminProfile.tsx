import { PageHeader } from "@/components/PageHeader";
import { UserTimeZoneCard } from "@/components/UserTimeZoneCard";

export default function AdminProfile() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your personal admin settings for scheduling and timestamp display."
      />

      <div className="max-w-2xl">
        <UserTimeZoneCard />
      </div>
    </div>
  );
}
