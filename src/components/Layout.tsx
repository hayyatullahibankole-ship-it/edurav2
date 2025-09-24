import { ReactNode } from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
}

const Layout = ({ children, showNavbar = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {showNavbar && <Navbar />}
      <main className={showNavbar ? "" : "min-h-screen"}>
        {children}
      </main>
    </div>
  );
};

export default Layout;