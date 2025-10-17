import { ReactNode } from "react";
import Navbar from "./Navbar";
import WhatsAppButton from "./WhatsAppButton";
import BottomNav from "./BottomNav";
import { useAuth } from "@/hooks/useAuth";

interface LayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  showWhatsAppButton?: boolean;
}

const Layout = ({ children, showNavbar = true, showWhatsAppButton = true }: LayoutProps) => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      {showNavbar && <Navbar />}
      <main className={showNavbar ? "pb-20 md:pb-0" : "min-h-screen"}>
        {children}
      </main>
      {showWhatsAppButton && <WhatsAppButton />}
      {user && <BottomNav />}
    </div>
  );
};

export default Layout;