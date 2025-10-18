import { ReactNode } from "react";
import Navbar from "./Navbar";
import WhatsAppButton from "./WhatsAppButton";
import MobileNav from "./MobileNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate, useLocation } from "react-router-dom";
import { useInstalledApp } from "@/hooks/useInstalledApp";

interface LayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  showWhatsAppButton?: boolean;
}

const Layout = ({ children, showNavbar = true, showWhatsAppButton = true }: LayoutProps) => {
  const { isInstalledApp } = useInstalledApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab based on current route
  const getActiveTab = () => {
    if (location.pathname === "/dashboard" || location.pathname === "/mobile-home") return "dashboard";
    if (location.pathname === "/study-hub") return "study";
    if (location.pathname === "/forum") return "forum";
    if (location.pathname.includes("profile") || location.search.includes("tab=profile") || location.search.includes("tab=settings")) return "profile";
    return "";
  };

  const handleTabChange = (tab: string) => {
    if (tab === "dashboard") {
      // Navigate to mobile-home if on mobile, otherwise dashboard
      navigate(isInstalledApp ? "/mobile-home" : "/dashboard");
    } else if (tab === "study") {
      navigate("/study-hub");
    } else if (tab === "forum") {
      navigate("/forum");
    } else if (tab === "profile") {
      navigate("/dashboard?tab=profile");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {showNavbar && <Navbar />}
      <main className={showNavbar ? "" : "min-h-screen"}>
        {children}
      </main>
      {showWhatsAppButton && <WhatsAppButton />}
      
      {/* Mobile Navigation - Show only for installed apps */}
      {isInstalledApp && (
        <>
          <MobileNav activeTab={getActiveTab()} onTabChange={handleTabChange} />
          {/* Add padding to bottom to prevent content being hidden by nav */}
          <div className="h-20" />
        </>
      )}
    </div>
  );
};

export default Layout;