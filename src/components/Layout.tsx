import { ReactNode } from "react";
import Navbar from "./Navbar";
import WhatsAppButton from "./WhatsAppButton";

interface LayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  showWhatsAppButton?: boolean;
}

const Layout = ({ children, showNavbar = true, showWhatsAppButton = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {showNavbar && <Navbar />}
      <main className={showNavbar ? "" : "min-h-screen"}>
        {children}
      </main>
      {showWhatsAppButton && <WhatsAppButton />}
    </div>
  );
};

export default Layout;