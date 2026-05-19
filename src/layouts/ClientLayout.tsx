import { BrandLogo } from "@/components/BrandLogo";
import { NavLink } from "@/components/NavLink";
import { PortalHeaderActions } from "@/components/PortalHeaderActions";
import { getClientAccessLabel, type ClientAccessRole } from "@/data/authData";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, Outlet } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FileCheck,
  User,
  GraduationCap,
  MessageSquarePlus,
  Download,
  BarChart3,
  PlusCircle,
  Users,
  Target,
  CreditCard,
} from "lucide-react";

const navItems: Array<{
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  allowedAccessRoles?: ClientAccessRole[];
}> = [
  { title: "Dashboard", url: "/client/dashboard", icon: LayoutDashboard },
  { title: "Target Accounts", url: "/client/targets", icon: Target, allowedAccessRoles: ["CLIENT_ADMIN", "CLIENT_MEMBER"] },
  { title: "Register Opportunity", url: "/client/opportunities/new", icon: PlusCircle, allowedAccessRoles: ["CLIENT_ADMIN", "CLIENT_MEMBER"] },
  { title: "Partner Terms", url: "/client/terms", icon: FileCheck },
  { title: "Agreements", url: "/client/agreements", icon: FileCheck },
  { title: "Profile", url: "/client/profile", icon: User },
  { title: "Bums", url: "/client/bum-directory", icon: Users, allowedAccessRoles: ["CLIENT_ADMIN", "CLIENT_MEMBER"] },
  { title: "Trainings", url: "/client/trainings", icon: GraduationCap, allowedAccessRoles: ["CLIENT_ADMIN", "CLIENT_MEMBER"] },
  { title: "Requests", url: "/client/requests", icon: MessageSquarePlus, allowedAccessRoles: ["CLIENT_ADMIN", "CLIENT_MEMBER"] },
  { title: "Payments", url: "/client/payments", icon: CreditCard, allowedAccessRoles: ["CLIENT_ADMIN", "CLIENT_FINANCE"] },
  { title: "Exports", url: "/client/exports", icon: Download, allowedAccessRoles: ["CLIENT_ADMIN", "CLIENT_FINANCE"] },
  { title: "Reports", url: "/client/reports", icon: BarChart3 },
];

export default function ClientLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const visibleNavItems = navItems.filter(
    (item) =>
      !item.allowedAccessRoles ||
      (user?.role === "CLIENT" &&
        user.clientAccessRole &&
        item.allowedAccessRoles.includes(user.clientAccessRole)),
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <div className="p-4 flex items-center gap-2 border-b border-sidebar-border">
            <div>
              <BrandLogo to="/" theme="dark" imageClassName="h-12" />
              <span className="block text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">
                {user?.role === "CLIENT" ? `Client • ${getClientAccessLabel(user.clientAccessRole)}` : "Client"}
              </span>
            </div>
          </div>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end={item.url === "/client"}
                          className="hover:bg-sidebar-accent/50"
                          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <header className="h-14 border-b flex items-center px-4 bg-card">
            <SidebarTrigger />
            <span className="ml-4 text-sm text-muted-foreground">
              {visibleNavItems.find(i => location.pathname === i.url || (i.url !== "/client" && location.pathname.startsWith(i.url)))?.title ?? "Client"}
            </span>
            <PortalHeaderActions />
          </header>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
