import { BrandLogo } from "@/components/BrandLogo";
import { NavLink } from "@/components/NavLink";
import { PortalHeaderActions } from "@/components/PortalHeaderActions";
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
  Briefcase,
  Handshake,
  Calendar,
  Wallet,
  User,
  Building2,
  GraduationCap,
  PlusCircle,
  Sparkles,
  BarChart3,
} from "lucide-react";

const navGroups = [
  { label: "Workspace", items: [
  { title: "Dashboard", url: "/bum/dashboard", icon: LayoutDashboard },
  { title: "Prospects", url: "/bum/prospects", icon: PlusCircle },
  { title: "Reverse Opportunities", url: "/bum/reverse-opportunities", icon: Sparkles },
  { title: "Clients", url: "/bum/clients", icon: Building2 },
  { title: "Opportunities", url: "/bum/opportunities", icon: Briefcase },
  { title: "My Claims", url: "/bum/claims", icon: Handshake },
  { title: "Live Conversations", url: "/bum/live-conversations", icon: Calendar },
  { title: "Training & Assets", url: "/bum/trainings", icon: GraduationCap },
  ] },
  { label: "Finance", items: [
  { title: "Earnings", url: "/bum/earnings", icon: Wallet },
  { title: "Reports", url: "/bum/reports", icon: BarChart3 },
  ] },
];

const navItems = [...navGroups.flatMap((group) => group.items), { title: "Profile settings", url: "/bum/profile", icon: User }];

export default function BumLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <div className="p-4 flex items-center gap-2 border-b border-sidebar-border">
            <div>
              <BrandLogo to="/" theme="dark" imageClassName="h-12" />
              <span className="block text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">Bum</span>
            </div>
          </div>
          <SidebarContent>
            {navGroups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            end={item.url === "/bum/dashboard"}
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
            ))}
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <header className="h-14 border-b flex items-center px-4 bg-card">
            <SidebarTrigger />
            <span className="ml-4 truncate text-sm text-muted-foreground">
              {navItems.find((i) => location.pathname === i.url || location.pathname.startsWith(`${i.url}/`))?.title ?? "Bum"}
            </span>
            <PortalHeaderActions />
          </header>
          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
