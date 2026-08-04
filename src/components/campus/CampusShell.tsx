import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  BookOpen,
  FolderKanban,
  Compass,
  Wallet as WalletIcon,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SideSwitcher } from "@/components/edura/SideSwitcher";
import { useAcademicStage } from "@/hooks/useAcademicStage";
import { stageLabel } from "@/lib/academicStages";
import eduraLogo from "@/assets/edura-logo.png";

const NAV = [
  { to: "/campus", label: "Home", icon: LayoutGrid, end: true },
  { to: "/campus/academics", label: "Academics", icon: BookOpen },
  { to: "/campus/projects", label: "Projects", icon: FolderKanban },
  { to: "/campus/opportunities", label: "Opportunities", icon: Compass },
];

interface CampusShellProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export const CampusShell = ({ title, subtitle, action, children }: CampusShellProps) => {
  const navigate = useNavigate();
  const { stage, department, study_level } = useAcademicStage();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src={eduraLogo} alt="Edura" className="h-7 w-auto" />
            <Badge variant="outline" className="hidden sm:inline-flex font-medium">
              Campus
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <SideSwitcher compact className="hidden sm:inline-flex" />
            <Button variant="ghost" size="icon" onClick={() => navigate("/campus/journey")} aria-label="Academic journey">
              <UserCog className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigate("/wallet")} aria-label="Wallet">
              <WalletIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <nav className="border-t overflow-x-auto no-scrollbar">
          <div className="container mx-auto px-4 flex items-center gap-1 h-11">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main className="flex-1 container mx-auto px-4 py-5 sm:py-8 max-w-6xl w-full">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-5 sm:mb-7">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="text-[11px]">{stageLabel(stage)}</Badge>
              {department && <Badge variant="outline" className="text-[11px]">{department}</Badge>}
              {study_level && <Badge variant="outline" className="text-[11px]">{study_level} Level</Badge>}
            </div>
          </div>
          {action}
        </div>

        {children}
      </main>
    </div>
  );
};

export default CampusShell;
