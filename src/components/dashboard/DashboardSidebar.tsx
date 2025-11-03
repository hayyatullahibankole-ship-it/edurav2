import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  FolderOpen,
  MessageSquare,
  Sword,
  Calendar,
  BookOpen,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import eduraLogo from "@/assets/edura-logo.png";

const navItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Study Hub", path: "/study-hub", icon: BookOpen },
  { title: "Challenge Arena", path: "/challenge-arena", icon: Sword },
  { title: "Study Planner", path: "/study-planner", icon: Calendar },
  { title: "Resources", path: "/resources", icon: FolderOpen },
  { title: "Forum", path: "/forum", icon: MessageSquare },
  { title: "Referral Program", path: "/referral-program", icon: Users },
  { title: "Profile", path: "/dashboard?tab=profile", icon: User },
  { title: "Settings", path: "/dashboard?tab=profile", icon: Settings },
];

interface DashboardSidebarProps {
  onLogout: () => void;
}

export function DashboardSidebar({ onLogout }: DashboardSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path.includes("?tab=")) {
      const [basePath, query] = path.split("?");
      return location.pathname === basePath && location.search.includes(query.split("=")[1]);
    }
    return location.pathname === path;
  };

  return (
    <Sidebar className="border-r bg-sidebar">
      <SidebarContent className="bg-sidebar">
        {/* Logo */}
        <div className="p-6 flex items-center justify-center border-b border-sidebar-border bg-white">
          <img src={eduraLogo} alt="Edura" className="h-16 w-auto" />
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-3 py-4">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      className={({ isActive: navActive }) => {
                        const active = isActive(item.path);
                        return `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          active
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-sidebar-foreground hover:bg-sidebar-accent"
                        }`;
                      }}
                    >
                      <item.icon className="h-5 w-5" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout Button */}
        <div className="mt-auto p-4">
          <Button
            onClick={onLogout}
            variant="default"
            className="w-full gap-2"
            size={state === "collapsed" ? "icon" : "default"}
          >
            <LogOut className="h-5 w-5" />
            {state !== "collapsed" && <span>LOGOUT</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
