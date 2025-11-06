import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: ReactNode;
  schoolInfo?: {
    name: string;
    logo_url: string;
    school_code: string;
  } | null;
}

export const DashboardLayout = ({ children, schoolInfo }: DashboardLayoutProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    try {
      await signOut();
      // Clear any cached data
      window.sessionStorage.clear();
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Error during logout:", error);
      // Force navigation even on error
      navigate("/auth", { replace: true });
    }
  };

  // On mobile, show without sidebar
  if (isMobile) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // On desktop, show with sidebar
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar onLogout={handleLogout} schoolInfo={schoolInfo} />
        <main className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-background via-muted/30 to-background animate-fade-in overflow-x-hidden">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};
