import { PageHeader } from "@/components/PageHeader";
import { UserAppearanceCard } from "@/components/UserAppearanceCard";
import { UserTimeZoneCard } from "@/components/UserTimeZoneCard";

export default function AdminProfile() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your personal admin settings for scheduling and timestamp display."
      />

      <div className="grid max-w-4xl gap-4 lg:grid-cols-2">
        <UserTimeZoneCard />
        <UserAppearanceCard />
      </div>
    </div>
  );
}
