import { Show, UserButton } from "@clerk/react";
import { useAuth } from "@/contexts/AuthContext";

export function PortalHeaderActions() {
  const { user } = useAuth();

  return (
    <div className="ml-auto flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium leading-none">{user?.name}</p>
        <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
      </div>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </div>
  );
}
