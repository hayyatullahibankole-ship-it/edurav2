import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import akboyLogo from "@/assets/akboy-logo.png";
import { useDomainDetection } from "@/hooks/useDomainDetection";

type NavChild = { name: string; path: string; external?: boolean };
type NavGroup = { name: string; children: NavChild[]; cta?: NavChild };

export function AkboyNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);
  const location = useLocation();
  const { isAkboy, isCampusHub } = useDomainDetection();

  const basePath = isCampusHub ? "" : isAkboy ? "" : "/akboy";

  const groups: NavGroup[] = [
    {
      name: "Services",
      children: [
        { name: "Graphics Design", path: `${basePath}/services#graphics` },
        { name: "Web Design", path: `${basePath}/services#web` },
        { name: "Branding & Identity", path: `${basePath}/services#branding` },
      ],
      cta: { name: "Request a Service", path: `${basePath}/contact` },
    },
    {
      name: "Learn",
      children: [
        { name: "Akboy Exam Prep Academy", path: `${basePath}/register` },
        { name: "JAMB CBT Practice", path: "https://edura.space", external: true },
        { name: "Mock Exams", path: `${basePath}/mock` },
        { name: "Online Classes", path: `${basePath}/register` },
      ],
      cta: { name: "Start Learning", path: `${basePath}/register` },
    },
    {
      name: "Campus Hub",
      children: [
        { name: "Admission News", path: `${basePath}/campus-hub?category=Admission List` },
        { name: "Exam Tips", path: `${basePath}/campus-hub?category=Exam Tips` },
        { name: "Student Opportunities", path: `${basePath}/campus-hub?category=Opportunities` },
        { name: "School Updates", path: `${basePath}/campus-hub?category=School Updates` },
      ],
      cta: { name: "Explore Campus Hub", path: `${basePath}/campus-hub` },
    },
    {
      name: "About",
      children: [
        { name: "About AKBOY", path: `${basePath}/about` },
        { name: "Portfolio", path: `${basePath}/portfolio` },
        { name: "Contact", path: `${basePath}/contact` },
      ],
    },
  ];

  const isActive = (p: string) => location.pathname === p.split("?")[0].split("#")[0];

  const renderLink = (c: NavChild, className = "") =>
    c.external ? (
      <a href={c.path} target="_blank" rel="noopener noreferrer" className={className}>
        {c.name}
      </a>
    ) : (
      <Link to={c.path} className={className} onClick={() => { setIsOpen(false); setMobileGroup(null); setOpenGroup(null); }}>
        {c.name}
      </Link>
    );

  if (isCampusHub) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between h-20 gap-4">
            <Link to="/" className="text-lg md:text-xl font-semibold text-slate-900">Campus Hub</Link>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <Link to="/" className="font-medium hover:text-slate-900">Home</Link>
              <Link to="/blog" className="font-medium hover:text-slate-900">Blog</Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link to={basePath || "/"} className="flex items-center flex-shrink-0">
            <img src={akboyLogo} alt="AKBOY Creative Hub" className="h-10 sm:h-12 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-0.5">
            {groups.map((g) => (
              <div
                key={g.name}
                className="relative group"
                onMouseEnter={() => setOpenGroup(g.name)}
                onMouseLeave={() => setOpenGroup(null)}
              >
                <button
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-stone-100 transition-colors duration-200"
                >
                  {g.name}
                  <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
                </button>
                {openGroup === g.name && (
                  <div className="absolute left-0 top-full pt-2 w-56">
                    <div className="bg-white border border-stone-200 rounded-lg shadow-lg overflow-hidden">
                      <div className="py-1">
                        {g.children.map((c) =>
                          renderLink(
                            c,
                            "block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-stone-50 hover:text-gray-900 transition-colors"
                          )
                        )}
                      </div>
                      {g.cta && (
                        <div className="border-t border-stone-200 p-2 bg-stone-50">
                          {renderLink(
                            g.cta,
                            "block text-center px-4 py-2 text-sm font-semibold text-white bg-green-800 hover:bg-green-900 rounded-md transition-colors"
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Button (desktop) */}
          <div className="hidden lg:flex items-center">
            <Button asChild className="bg-green-800 hover:bg-green-900 text-white font-semibold rounded-lg px-6 py-2 shadow-sm transition-colors h-10">
              <Link to={`${basePath}/contact`}>Get Started</Link>
            </Button>
          </div>

          {/* Mobile CTA + Menu */}
          <div className="lg:hidden flex items-center gap-2">
            <Button asChild size="sm" className="bg-green-800 hover:bg-green-900 text-white font-semibold rounded-lg">
              <Link to={`${basePath}/contact`}>Get Started</Link>
            </Button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-stone-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-stone-200">
            <div className="flex flex-col">
              {groups.map((g) => {
                const expanded = mobileGroup === g.name;
                return (
                  <div key={g.name} className="border-b border-stone-100">
                    <button
                      onClick={() => setMobileGroup(expanded ? null : g.name)}
                      className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-gray-700 hover:bg-stone-50 transition-colors"
                    >
                      {g.name}
                      <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
                    </button>
                    {expanded && (
                      <div className="pb-3 pl-4 space-y-1 bg-stone-50">
                        {g.children.map((c) => (
                          <div key={c.name} className="py-1">
                            {renderLink(c, "block px-2 py-2 text-sm font-medium text-gray-700 hover:text-green-900 hover:bg-white rounded transition-colors")}
                          </div>
                        ))}
                        {g.cta && (
                          <div className="mt-2 pt-2 border-t border-stone-200">
                            {renderLink(
                              g.cta,
                              "block text-center px-4 py-2 text-sm font-semibold text-white bg-green-800 hover:bg-green-900 rounded transition-colors"
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
