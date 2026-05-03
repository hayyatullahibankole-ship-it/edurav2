import { ReactNode } from "react";
import { Helmet } from "react-helmet";
import { AkboyNavbar } from "./AkboyNavbar";
import { AkboyFooter } from "./AkboyFooter";

interface AkboyLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function AkboyLayout({ children, title, description }: AkboyLayoutProps) {
  const pageTitle = title ? `${title} | AKBOY Creative Hub` : "AKBOY Creative Hub - Innovation & Creativity";
  const pageDescription = description || "AKBOY Creative Hub - Your partner in innovation, creativity, and digital excellence.";

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="icon" href="/akboy-logo.png" type="image/png" />
      </Helmet>
      <AkboyNavbar />
      <main className="flex-1 pt-16 sm:pt-20">
        {children}
      </main>
      <AkboyFooter />
    </div>
  );
}
