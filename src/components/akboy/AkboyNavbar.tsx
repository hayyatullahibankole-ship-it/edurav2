import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
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
        { name: "Educational Consultancy", path: `${basePath}/services#educational`, desc: "Strategy for students, parents & schools" },
        { name: "Tutorials & Exam Prep", path: `${basePath}/services#tutorials`, desc: "JAMB, WAEC & academic support" },
        { name: "Graphic Design", path: `${basePath}/services#graphics`, desc: "Flyers, posters, branding kits" },
        { name: "Web Design", path: `${basePath}/services#web`, desc: "Websites, landing pages, management" },
        { name: "Branding & Identity", path: `${basePath}/services#branding`, desc: "Logos, identity systems, social design" },
      ],
      cta: { name: "Book a Consultation", path: `${basePath}/consultation` },
    },
    {
      name: "Work",
      children: [
        { name: "Portfolio", path: `${basePath}/portfolio`, desc: "Selected projects across creative & education" },
        { name: "Testimonials", path: `${basePath}/testimonials`, desc: "Stories from students, schools & brands" },
      ],
    },
    {
      name: "Learn",
      children: [
        { name: "Akboy Exam Prep Academy", path: `${basePath}/register`, desc: "JAMB / WAEC physical tutorials" },
        { name: "Academy (Online — coming soon)", path: `${basePath}/academy`, desc: "Courses, recorded lessons, certificates" },
        { name: "JAMB CBT Practice", path: "https://edura.space", external: true, desc: "Powered by Edura" },
        { name: "Mock Exams", path: `${basePath}/mock`, desc: "Sit a full timed mock" },
        { name: "Resources", path: `${basePath}/resources`, desc: "JAMB/WAEC materials, e-books, templates" },
      ],
      cta: { name: "Start Learning", path: `${basePath}/register` },
    },
    {
      name: "Insights",
      children: [
        { name: "Campus Hub Blog", path: `${basePath}/campus-hub`, desc: "Admissions, exams, opportunities" },
        { name: "Admission News", path: `${basePath}/campus-hub?category=Admission List` },
        { name: "Exam Tips", path: `${basePath}/campus-hub?category=Exam Tips` },
        { name: "Opportunities", path: `${basePath}/campus-hub?category=Opportunities` },
      ],
    },
    {
      name: "Company",
      children: [
        { name: "About AKBOY", path: `${basePath}/about` },
        { name: "Contact", path: `${basePath}/contact` },
        { name: "Book Consultation", path: `${basePath}/consultation` },
      ],
    },
  ];

  const renderLink = (c: NavChild, className = "", withDesc = false) =>
    c.external ? (
      <a href={c.path} target="_blank" rel="noopener noreferrer" className={className}>
        <span className="block">{c.name}</span>
        {withDesc && c.desc && <span className="block text-xs text-akboy-ink/55 font-normal mt-0.5">{c.desc}</span>}
      </a>
    ) : (
      <Link to={c.path} className={className} onClick={() => { setIsOpen(false); setMobileGroup(null); setOpenGroup(null); }}>
        <span className="block">{c.name}</span>
        {withDesc && c.desc && <span className="block text-xs text-akboy-ink/55 font-normal mt-0.5">{c.desc}</span>}
      </Link>
    );

  if (isCampusHub) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-akboy-stone shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between h-20 gap-4">
            <Link to="/" className="text-lg md:text-xl font-display font-semibold text-akboy-ink">Campus Hub</Link>
            <div className="flex flex-wrap items-center gap-4 text-sm text-akboy-ink/70">
              <Link to="/" className="font-medium hover:text-akboy-forest">Home</Link>
              <Link to="/blog" className="font-medium hover:text-akboy-forest">Blog</Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-akboy-cream/85 backdrop-blur-md border-b border-akboy-stone">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <Link to={basePath || "/"} className="flex items-center flex-shrink-0 gap-2">
            <img src={akboyLogo} alt="AKBOY Creative Hub" className="h-9 sm:h-11 w-auto" />
            <span className="hidden sm:block font-display text-base font-semibold tracking-tight text-akboy-forest">
              AKBOY <span className="text-akboy-ink/60 font-normal">Creative Hub</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-0.5">
            {groups.map((g) => (
              <div
                key={g.name}
                className="relative"
                onMouseEnter={() => setOpenGroup(g.name)}
                onMouseLeave={() => setOpenGroup(null)}
              >
                <button className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium text-akboy-ink/80 hover:text-akboy-forest hover:bg-white transition-colors">
                  {g.name}
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </button>
                {openGroup === g.name && (
                  <div className="absolute left-0 top-full pt-2 w-80">
                    <div className="bg-white border border-akboy-stone rounded-2xl shadow-xl overflow-hidden">
                      <div className="p-2">
                        {g.children.map((c) =>
                          renderLink(
                            c,
                            "block px-3 py-2.5 rounded-lg text-sm font-semibold text-akboy-ink hover:bg-akboy-cream transition-colors",
                            true
                          )
                        )}
                      </div>
                      {g.cta && (
                        <div className="border-t border-akboy-stone p-2 bg-akboy-cream/60">
                          {renderLink(
                            g.cta,
                            "block text-center px-4 py-2.5 text-sm font-semibold text-akboy-ink bg-akboy-butter hover:brightness-95 rounded-lg transition"
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <Button asChild variant="ghost" className="text-akboy-ink hover:text-akboy-forest font-medium">
              <Link to={`${basePath}/contact`}>Contact</Link>
            </Button>
            <Button asChild className="bg-akboy-forest hover:bg-akboy-forest-deep text-akboy-cream font-semibold rounded-full px-5 h-10 shadow-sm">
              <Link to={`${basePath}/consultation`}>Book Consultation</Link>
            </Button>
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <Button asChild size="sm" className="bg-akboy-forest hover:bg-akboy-forest-deep text-akboy-cream font-semibold rounded-full px-4">
              <Link to={`${basePath}/consultation`}>Book</Link>
            </Button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-akboy-ink hover:bg-white transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden py-3 border-t border-akboy-stone max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col">
              {groups.map((g) => {
                const expanded = mobileGroup === g.name;
                return (
                  <div key={g.name} className="border-b border-akboy-stone/60">
                    <button
                      onClick={() => setMobileGroup(expanded ? null : g.name)}
                      className="w-full flex items-center justify-between px-4 py-3.5 text-base font-semibold text-akboy-ink hover:bg-white transition-colors"
                    >
                      {g.name}
                      <ChevronDown className={`h-5 w-5 opacity-50 transition-transform ${expanded ? "rotate-180" : ""}`} />
                    </button>
                    {expanded && (
                      <div className="pb-3 pl-3 pr-2 space-y-1 bg-white/60">
                        {g.children.map((c) => (
                          <div key={c.name}>
                            {renderLink(c, "block px-3 py-2 rounded-lg text-sm font-medium text-akboy-ink/85 hover:text-akboy-forest hover:bg-akboy-cream transition")}
                          </div>
                        ))}
                        {g.cta && (
                          <div className="mt-2 pt-2 border-t border-akboy-stone">
                            {renderLink(
                              g.cta,
                              "block text-center px-4 py-2.5 text-sm font-semibold text-akboy-ink bg-akboy-butter rounded-lg"
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
