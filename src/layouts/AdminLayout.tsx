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
  Users,
  Briefcase,
  Target,
  Award,
  FileText,
  CreditCard,
  DollarSign,
  Video,
  Mail,
  GraduationCap,
  BarChart3,
  Wrench,
  FileSignature,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

const navGroups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Operations",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
      { title: "Clients", url: "/admin/clients", icon: Briefcase },
      { title: "Bums", url: "/admin/bums", icon: Users },
      { title: "Opportunities", url: "/admin/opportunities", icon: Target },
      { title: "Live Conversations", url: "/admin/live-conversations", icon: Video },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Credits", url: "/admin/credits", icon: Award },
      { title: "Commission Plans", url: "/admin/commission-plans", icon: FileText },
      { title: "Payments", url: "/admin/payments", icon: CreditCard },
      { title: "Payouts", url: "/admin/payouts", icon: DollarSign },
    ],
  },
  {
    label: "Communications",
    items: [
      { title: "Emails", url: "/admin/emails", icon: Mail },
      { title: "Training & Assets", url: "/admin/training-assets", icon: GraduationCap },
      { title: "Reports", url: "/admin/reports", icon: BarChart3 },
    ],
  },
  {
    label: "Admin Tools",
    items: [
      { title: "Tools", url: "/admin/troubleshooting", icon: Wrench },
      { title: "Legal", url: "/admin/legal", icon: FileSignature },
    ],
  },
];

const navItems = [...navGroups.flatMap((group) => group.items), { title: "Profile settings", url: "/admin/profile", icon: LayoutDashboard }];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <div className="flex items-center gap-2 border-b border-sidebar-border p-4">
            <div>
              <BrandLogo to="/" theme="dark" imageClassName="h-12" />
              <span className="block text-[10px] uppercase tracking-wider text-sidebar-foreground/60">Admin</span>
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
                            end={item.url === "/admin"}
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
          <header className="flex h-14 items-center border-b bg-card px-4">
            <SidebarTrigger />
            <span className="ml-4 truncate text-sm text-muted-foreground">
              {navItems.find((i) => location.pathname === i.url || (i.url !== "/admin" && location.pathname.startsWith(i.url)))?.title ?? "Admin"}
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
