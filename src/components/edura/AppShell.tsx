import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  BookOpen,
  FolderKanban,
  Compass,
  Wallet as WalletIcon,
  UserCog,
  GraduationCap,
  Briefcase,
  ClipboardList,
  Library,
  Users,
  Calculator,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NotificationBell from "@/components/NotificationBell";
import { DashboardThemeMenu } from "@/components/DashboardThemeMenu";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import eduraLogo from "@/assets/edura-logo.png";


export type ShellSide = "cbt" | "services" | "campus";

export type ShellNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

/** One unified nav for every candidate surface (CBT + Services). */
const CANDIDATE_NAV: ShellNavItem[] = [
  { to: "/dashboard", label: "Home", icon: LayoutGrid, end: true },
  { to: "/study-hub", label: "Study", icon: BookOpen },
  { to: "/services", label: "Services", icon: Briefcase },
  { to: "/resources", label: "Resources", icon: Library },
  { to: "/wallet", label: "Wallet", icon: WalletIcon },
];

const NAV: Record<ShellSide, ShellNavItem[]> = {
  cbt: CANDIDATE_NAV,
  services: CANDIDATE_NAV,
  campus: [
    { to: "/campus", label: "Home", icon: LayoutGrid, end: true },
    { to: "/campus/academics", label: "Academics", icon: BookOpen },
    { to: "/campus/tools", label: "Tools", icon: Calculator },
    { to: "/campus/projects", label: "Projects", icon: FolderKanban },
    { to: "/campus/opportunities", label: "Opportunities", icon: Compass },
  ],
};

const SIDE_META: Record<ShellSide, { label: string; settingsTo: string }> = {
  cbt: { label: "CBT", settingsTo: "/campus/journey" },
  services: { label: "Services", settingsTo: "/campus/journey" },
  campus: { label: "Campus", settingsTo: "/campus/journey" },
};

interface AppShellProps {
  side: ShellSide;
  title: string;
  subtitle?: string;
  /** small pills under the title, e.g. stage / department */
  meta?: ReactNode;
  action?: ReactNode;
  /** override the default nav for this side */
  nav?: ShellNavItem[];
  children: ReactNode;
}

/**
 * One shell for every logged-in surface of Edura: a quiet left rail on desktop,
 * a compact top bar plus bottom nav on mobile. Nav content is side-aware.
 */
export const AppShell = ({ side, title, subtitle, meta, action, nav, children }: AppShellProps) => {
  const navigate = useNavigate();
  const items = nav ?? NAV[side];
  const sideMeta = SIDE_META[side];
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      toast({ title: "Logging out...", description: "Please wait" });
      await signOut();
      window.sessionStorage.clear();
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      navigate("/auth", { replace: true });
    }
  };



  const railLink = (item: ShellNavItem) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )
      }
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop rail */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col border-r bg-card">
        <div className="h-16 flex items-center gap-2 px-5 border-b">
          <img src={eduraLogo} alt="Edura" className="h-7 w-auto" />
          <Badge variant="outline" className="text-[10px] font-semibold">{sideMeta.label}</Badge>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">{items.map(railLink)}</nav>
        <div className="p-3 border-t space-y-1">

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2.5 text-muted-foreground"
            onClick={() => navigate(sideMeta.settingsTo)}
          >
            <UserCog className="h-4 w-4" /> My journey
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        </div>

      </aside>

      <div className="lg:pl-60 flex min-h-screen flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-2 min-w-0 lg:hidden">
              <img src={eduraLogo} alt="Edura" className="h-7 w-auto" />
              <Badge variant="outline" className="text-[10px] font-semibold">{sideMeta.label}</Badge>
            </div>
            <p className="hidden lg:block text-sm font-semibold truncate">{title}</p>
            <div className="flex items-center gap-1.5">
              <DashboardThemeMenu />
              <NotificationBell />

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleLogout}
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </Button>

            </div>
          </div>
        </header>

        <main className="flex-1 w-full px-4 sm:px-6 py-5 sm:py-7 pb-28 lg:pb-10">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mb-5 sm:mb-7 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
                {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
                {meta && <div className="mt-2 flex flex-wrap gap-1.5">{meta}</div>}
              </div>
              {action}
            </div>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileTabBar items={items} />


    </div>
  );
};

export default AppShell;
