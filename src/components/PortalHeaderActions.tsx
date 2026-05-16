import { UserButton } from "@clerk/react";
import { AccessibilityMenu } from "@/components/AccessibilityMenu";
import { useAuth } from "@/contexts/AuthContext";

export function PortalHeaderActions() {
  const { user } = useAuth();

  return (
    <div className="ml-auto flex items-center gap-3">
      <AccessibilityMenu />
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium leading-none">{user?.name}</p>
        <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
      </div>
      <UserButton />
    </div>
  );
}
