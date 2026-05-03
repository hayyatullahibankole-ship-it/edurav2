import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, ArrowUpRight } from "lucide-react";
import akboyLogo from "@/assets/akboy-logo.png";
import { useDomainDetection } from "@/hooks/useDomainDetection";

type NavChild = { name: string; path: string; external?: boolean; desc?: string };
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
        { name: "Graphics Design", path: `${basePath}/services#graphics`, desc: "Logos, posters, brand kits" },
        { name: "Web Design", path: `${basePath}/services#web`, desc: "Sites that convert" },
        { name: "Branding & Identity", path: `${basePath}/services#branding`, desc: "Brand systems end-to-end" },
      ],
      cta: { name: "Request a Service", path: `${basePath}/contact` },
    },
    {
      name: "Learn",
      children: [
        { name: "Akboy Exam Prep Academy", path: `${basePath}/register`, desc: "Tutorials & online classes" },
        { name: "JAMB CBT Practice", path: "https://edura.space", external: true, desc: "Powered by Edura" },
        { name: "Mock Exams", path: `${basePath}/mock`, desc: "Real-time exam simulation" },
      ],
      cta: { name: "Start Learning", path: `${basePath}/register` },
    },
    {
      name: "Campus Hub",
      children: [
        { name: "Admissions", path: `${basePath}/campus-hub?category=Admissions`, desc: "ND, HND, UTME & PG" },
        { name: "Scholarships", path: `${basePath}/campus-hub?category=Scholarships`, desc: "Local & global funding" },
        { name: "JAMB & Exams", path: `${basePath}/campus-hub?category=Exams %26 JAMB`, desc: "JAMB, WAEC, Post-UTME" },
        { name: "All Stories", path: `${basePath}/campus-hub`, desc: "Browse the full feed" },
      ],
      cta: { name: "Open Campus Hub", path: `${basePath}/campus-hub` },
    },
    {
      name: "Studio",
      children: [
        { name: "About AKBOY", path: `${basePath}/about` },
        { name: "Portfolio", path: `${basePath}/portfolio` },
        { name: "Contact", path: `${basePath}/contact` },
      ],
    },
  ];

  const renderLink = (c: NavChild, className = "", showDesc = false) =>
    c.external ? (
      <a href={c.path} target="_blank" rel="noopener noreferrer" className={className}>
        <span className="flex items-center justify-between gap-2">
          <span>{c.name}</span>
          <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
        </span>
        {showDesc && c.desc && <span className="block text-xs font-normal text-akboy-ink/55 mt-0.5">{c.desc}</span>}
      </a>
    ) : (
      <Link
        to={c.path}
        className={className}
        onClick={() => { setIsOpen(false); setMobileGroup(null); setOpenGroup(null); }}
      >
        <span>{c.name}</span>
        {showDesc && c.desc && <span className="block text-xs font-normal text-akboy-ink/55 mt-0.5">{c.desc}</span>}
      </Link>
    );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-akboy-forest/95 text-akboy-cream backdrop-blur-md border-b border-akboy-cream/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link to={basePath || "/"} className="flex items-center gap-3 flex-shrink-0 group">
            <img src={akboyLogo} alt="AKBOY Creative Hub" className="h-16 sm:h-20 w-auto" />
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-display font-black tracking-tight text-akboy-cream text-xl sm:text-2xl">AKBOY</span>
              <span className="text-[10px] uppercase tracking-[0.28em] text-akboy-cream/75 mt-0.5">Creative Hub</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {groups.map((g) => (
              <div
                key={g.name}
                className="relative"
                onMouseEnter={() => setOpenGroup(g.name)}
                onMouseLeave={() => setOpenGroup(null)}
              >
                <button
                  className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    openGroup === g.name ? "bg-akboy-cream/10 text-akboy-cream" : "text-akboy-cream/80 hover:text-akboy-cream"
                  }`}
                >
                  {g.name}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openGroup === g.name ? "rotate-180" : ""}`} />
                </button>
                {openGroup === g.name && (
                  <div className="absolute left-0 top-full pt-3 w-72">
                    <div className="bg-akboy-paper border border-akboy-cream/15 rounded-2xl shadow-[0_24px_60px_-20px_rgba(15,61,46,0.25)] overflow-hidden">
                      <div className="p-2">
                        {g.children.map((c) => (
                          <div key={c.name}>
                            {renderLink(
                              c,
                              "block px-3 py-2.5 text-sm font-semibold text-akboy-forest rounded-xl hover:bg-akboy-cream transition-colors",
                              true
                            )}
                          </div>
                        ))}
                      </div>
                      {g.cta && (
                        <div className="border-t border-akboy-cream/15 p-2 bg-akboy-forest/10">
                          {renderLink(
                            g.cta,
                            "block text-center px-4 py-2.5 text-sm font-bold text-akboy-cream bg-akboy-forest hover:bg-akboy-moss rounded-xl transition-colors"
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
          <div className="hidden lg:flex items-center gap-2">
            <Link
              to={`${basePath}/contact`}
              className="inline-flex items-center gap-2 bg-akboy-cream text-akboy-forest font-bold rounded-full px-5 py-2.5 text-sm transition-colors shadow-[0_8px_24px_-8px_rgba(15,61,46,0.25)] hover:bg-akboy-paper"
            >
              Hire Akboy
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile CTA + Menu */}
          <div className="lg:hidden flex items-center gap-2">
            <Link
              to={`${basePath}/contact`}
              className="bg-akboy-cream text-akboy-forest font-bold rounded-full px-3.5 py-2 text-xs"
            >
              Hire
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full text-akboy-cream hover:bg-akboy-cream/15 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-3 border-t border-akboy-ink/10">
            <div className="flex flex-col">
              {groups.map((g) => {
                const expanded = mobileGroup === g.name;
                return (
                  <div key={g.name} className="border-b border-akboy-ink/5">
                    <button
                      onClick={() => setMobileGroup(expanded ? null : g.name)}
                      className="w-full flex items-center justify-between px-2 py-3.5 text-base font-semibold text-akboy-cream"
                    >
                      {g.name}
                      <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
                    </button>
                    {expanded && (
                      <div className="pb-3 pl-2 space-y-1">
                        {g.children.map((c) => (
                          <div key={c.name} className="py-0.5">
                            {renderLink(c, "block px-3 py-2 text-sm font-medium text-akboy-cream/90 rounded-lg hover:bg-akboy-cream/15", true)}
                          </div>
                        ))}
                        {g.cta && (
                          <div className="pt-2">
                            {renderLink(
                              g.cta,
                              "block text-center px-4 py-2.5 text-sm font-bold text-akboy-forest bg-akboy-cream rounded-xl hover:bg-akboy-paper"
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
