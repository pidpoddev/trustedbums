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
  FileCheck,
  User,
  GraduationCap,
  MessageSquarePlus,
  Download,
  Flame,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/client", icon: LayoutDashboard },
  { title: "Agreements", url: "/client/agreements", icon: FileCheck },
  { title: "Profile", url: "/client/profile", icon: User },
  { title: "Trainings", url: "/client/trainings", icon: GraduationCap },
  { title: "Requests", url: "/client/requests", icon: MessageSquarePlus },
  { title: "Exports", url: "/client/exports", icon: Download },
];

export default function ClientLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <div className="p-4 flex items-center gap-2 border-b border-sidebar-border">
            <div className="rounded-lg bg-sidebar-primary p-1.5">
              <Flame className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <span className="font-display font-bold text-sidebar-foreground text-sm">Trusted Bums</span>
              <span className="block text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">Client</span>
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
              {navItems.find(i => location.pathname === i.url || (i.url !== "/client" && location.pathname.startsWith(i.url)))?.title ?? "Client"}
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
