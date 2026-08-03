import { Home, ClipboardList, Wallet, GraduationCap, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { playTapSound } from "@/utils/sounds";

interface ServicesMobileNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const ITEMS = [
  { key: "home", label: "Services", icon: Home, to: "/dashboard" },
  { key: "admissions", label: "Admissions", icon: GraduationCap, to: "/dashboard?provider=admission" },
  { key: "requests", label: "Requests", icon: ClipboardList, to: "/dashboard?tab=requests" },
  { key: "wallet", label: "Wallet", icon: Wallet, to: "/wallet" },
];

const ServicesMobileNav = ({ activeTab = "home", onTabChange }: ServicesMobileNavProps) => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <div className="relative max-w-md mx-auto">
        <div className="h-16 bg-white rounded-[28px] shadow-2xl border">
          <div className="h-full flex items-center justify-around px-2">
            {ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.key;
              return (
                <Link key={item.key} to={item.to} className="flex-1 flex justify-center">
                  <button
                    onClick={() => playTapSound()}
                    className="flex flex-col items-center justify-center gap-0.5 py-2 transition-transform active:scale-90"
                  >
                    <Icon className={`h-5 w-5 ${active ? "text-orange-500" : "text-foreground/60"}`} />
                    <span
                      className={`text-[9px] font-medium ${
                        active ? "text-orange-500 font-semibold" : "text-foreground/50"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                </Link>
              );
            })}

            <button
              onClick={() => {
                playTapSound();
                if (onTabChange) onTabChange("profile");
                else navigate("/dashboard");
              }}
              className="flex-1 flex justify-center"
            >
              <div className="flex flex-col items-center justify-center gap-0.5 py-2 transition-transform active:scale-90">
                <User
                  className={`h-5 w-5 ${activeTab === "profile" ? "text-orange-500" : "text-foreground/60"}`}
                />
                <span
                  className={`text-[9px] font-medium ${
                    activeTab === "profile" ? "text-orange-500 font-semibold" : "text-foreground/50"
                  }`}
                >
                  Profile
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesMobileNav;
