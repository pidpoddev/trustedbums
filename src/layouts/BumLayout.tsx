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
  FileCheck,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/bum/dashboard", icon: LayoutDashboard },
  { title: "Prospects", url: "/bum/prospects", icon: PlusCircle },
  { title: "Clients", url: "/bum/clients", icon: Building2 },
  { title: "Opportunities", url: "/bum/opportunities", icon: Briefcase },
  { title: "My Claims", url: "/bum/claims", icon: Handshake },
  { title: "Trainings", url: "/bum/trainings", icon: GraduationCap },
  { title: "Live Conversations", url: "/bum/live-conversations", icon: Calendar },
  { title: "Earnings", url: "/bum/earnings", icon: Wallet },
  { title: "Connector Terms", url: "/bum/terms", icon: FileCheck },
  { title: "Profile", url: "/bum/profile", icon: User },
];

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
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
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
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <header className="h-14 border-b flex items-center px-4 bg-card">
            <SidebarTrigger />
            <span className="ml-4 text-sm text-muted-foreground">
              {navItems.find((i) => location.pathname === i.url || location.pathname.startsWith(`${i.url}/`))?.title ?? "Bum"}
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
