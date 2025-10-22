import { ReactNode } from "react";
import { AkboyNavbar } from "./AkboyNavbar";
import { AkboyFooter } from "./AkboyFooter";

interface AkboyLayoutProps {
  children: ReactNode;
}

export function AkboyLayout({ children }: AkboyLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white font-lato">
      <AkboyNavbar />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <AkboyFooter />
    </div>
  );
}
