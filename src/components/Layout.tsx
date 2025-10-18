import { ReactNode } from "react";
import Navbar from "./Navbar";
import WhatsAppButton from "./WhatsAppButton";
import MobileNav from "./MobileNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate, useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  showWhatsAppButton?: boolean;
}

const Layout = ({ children, showNavbar = true, showWhatsAppButton = true }: LayoutProps) => {
  const isMobile = useIsMobile();
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
      
      {/* Mobile Navigation - Show on all pages */}
      {isMobile && (
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