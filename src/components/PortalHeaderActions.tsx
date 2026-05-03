import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function PortalHeaderActions() {
  const { user, signOut } = useAuth();

  return (
    <div className="ml-auto flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium leading-none">{user?.name}</p>
        <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={signOut}>
        <LogOut className="h-4 w-4" />
        <span className="sr-only">Sign out</span>
      </Button>
    </div>
  );
}
