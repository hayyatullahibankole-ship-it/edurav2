import { Home, BookOpen, Trophy, User, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: BookOpen, label: "Study", path: "/study-hub" },
    { icon: Sparkles, label: "Tests", path: "/demo" },
    { icon: Trophy, label: "Arena", path: "/challenge-arena" },
    { icon: User, label: "Profile", path: "/dashboard?tab=profile" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border shadow-2xl">
      <div className="flex items-center justify-around h-20 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full relative transition-all duration-300",
                isActive && "text-primary"
              )}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-primary via-primary-glow to-primary rounded-full" />
              )}
              <div
                className={cn(
                  "p-2.5 rounded-2xl transition-all duration-300",
                  isActive ? "bg-primary/10 scale-110" : "hover:bg-muted/50"
                )}
              >
                <Icon
                  className={cn(
                    "h-6 w-6 transition-all duration-300",
                    isActive && "animate-pulse-glow"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-xs font-medium transition-all duration-300",
                  isActive ? "opacity-100 font-bold" : "opacity-60"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
