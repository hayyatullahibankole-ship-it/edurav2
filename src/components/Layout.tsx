import { ReactNode } from "react";
import Navbar from "./Navbar";
import WhatsAppButton from "./WhatsAppButton";
import MobileNav from "./MobileNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate, useLocation } from "react-router-dom";
import { useNativeApp } from "@/hooks/useNativeApp";

interface LayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  showWhatsAppButton?: boolean;
}

const Layout = ({ children, showNavbar = true, showWhatsAppButton = true }: LayoutProps) => {
  const isMobile = useIsMobile();
  const { isNative } = useNativeApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab based on current route
  const getActiveTab = () => {
    if (location.pathname === "/dashboard") return "dashboard";
    if (location.pathname === "/study-hub") return "study";
    if (location.pathname === "/forum") return "forum";
    return "";
  };

  const handleTabChange = (tab: string) => {
    if (tab === "dashboard") navigate("/dashboard");
    else if (tab === "profile") navigate("/dashboard?tab=profile");
  };

  return (
    <div className="min-h-screen bg-background">
      {showNavbar && <Navbar />}
      <main className={showNavbar ? "" : "min-h-screen"}>
        {children}
      </main>
      {showWhatsAppButton && <WhatsAppButton />}
      
      {/* Mobile Navigation - Show only for native apps */}
      {isNative && (
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