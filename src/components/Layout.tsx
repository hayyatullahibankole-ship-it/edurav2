import { ReactNode, useEffect } from "react";
import Navbar from "./Navbar";
import WhatsAppButton from "./WhatsAppButton";
import MobileNav from "./MobileNav";
import { useNavigate, useLocation } from "react-router-dom";
import { useInstalledApp } from "@/hooks/useInstalledApp";
import { useNativeApp } from "@/hooks/useNativeApp";
import { StatusBar, Style } from "@capacitor/status-bar";

interface LayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  showWhatsAppButton?: boolean;
  showMobileNav?: boolean;
}

const Layout = ({
  children,
  showNavbar = true,
  showWhatsAppButton = true,
  showMobileNav = true,
}: LayoutProps) => {
  const { isInstalledApp } = useInstalledApp();
  const { isNative } = useNativeApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Configure status bar for native apps
  useEffect(() => {
    if (isNative) {
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: "#0ea5e9" }).catch(() => {});
    }
  }, [isNative]);

  // Determine active tab based on current route
  const getActiveTab = () => {
    if (location.pathname === "/dashboard" || location.pathname === "/mobile-home") return "dashboard";
    if (location.pathname === "/study-hub") return "study";
    if (location.pathname === "/forum") return "forum";
    if (
      location.pathname.includes("profile") ||
      location.search.includes("tab=profile") ||
      location.search.includes("tab=settings")
    )
      return "profile";
    return "";
  };

  const handleTabChange = (tab: string) => {
    if (tab === "dashboard") {
      // For app users, go to mobile-home, otherwise dashboard
      navigate(isInstalledApp || isNative ? "/mobile-home" : "/dashboard");
    } else if (tab === "study") {
      navigate("/study-hub");
    } else if (tab === "forum") {
      navigate("/forum");
    } else if (tab === "profile") {
      navigate("/dashboard?tab=profile");
    }
  };

  // ✅ Mobile Navigation: show ONLY for the app (installed PWA OR native app)
  const isAuthRoute = location.pathname === "/auth";
  const shouldShowMobileNav = showMobileNav && !isAuthRoute && (isInstalledApp || isNative);

  return (
    <div className="min-h-screen bg-background">
      {showNavbar && !(isInstalledApp || isNative) && <Navbar />}

      <main className={showNavbar ? "" : "min-h-screen"}>{children}</main>

      {showWhatsAppButton && !(isInstalledApp || isNative) && <WhatsAppButton />}

      {/* Mobile Navigation - Show ONLY for installed apps / native app */}
      {shouldShowMobileNav && (
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
