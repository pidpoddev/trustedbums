import { LogOut, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { ImpersonationControls } from "@/components/ImpersonationControls";
import { AccessibilityMenu } from "@/components/AccessibilityMenu";
import { SubmitFeedbackButton } from "@/components/SubmitFeedbackButton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

function getProfilePath(role?: string) {
  if (role === "ADMIN") {
    return "/admin/profile";
  }

  if (role === "CLIENT") {
    return "/client/profile";
  }

  if (role === "BUM") {
    return "/bum/profile";
  }

  return "/dashboard";
}

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "User";
  const parts = source.split(/\s+/).filter(Boolean);
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : source.slice(0, 2).toUpperCase();
}

export function PortalHeaderActions() {
  const { user, signOut } = useAuth();
  const profilePath = getProfilePath(user?.role);

  return (
    <div className="ml-auto flex items-center gap-3">
      <ImpersonationControls />
      <SubmitFeedbackButton />
      <AccessibilityMenu />
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium leading-none">{user?.name}</p>
        <p className="mt-1 text-xs text-muted-foreground">{user?.email}</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" aria-label="Open account menu">
            <span className="text-xs font-semibold">{getInitials(user?.name, user?.email)}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            <span className="block truncate">{user?.name ?? "Account"}</span>
            <span className="mt-1 block truncate text-xs font-normal text-muted-foreground">{user?.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to={profilePath}>
              <Settings className="mr-2 h-4 w-4" />
              Profile settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => void signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
