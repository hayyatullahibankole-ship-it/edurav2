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
  const pageTitle = title ? `${title} | AKBOY Creative Hub` : "AKBOY Creative Hub — Creativity, Education & Admission Intelligence";
  const pageDescription = description || "AKBOY Creative Hub — design, education and student intelligence in one editorial home.";

  return (
    <div className="min-h-screen flex flex-col bg-akboy-cream font-sans text-akboy-ink selection:bg-akboy-butter selection:text-akboy-ink">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="icon" href="/akboy-logo.png" type="image/png" />
        <meta name="theme-color" content="#0F3D2E" />
      </Helmet>
      <AkboyNavbar />
      <main className="flex-1 pt-16 sm:pt-20">
        {children}
      </main>
      <AkboyFooter />
    </div>
  );
}
