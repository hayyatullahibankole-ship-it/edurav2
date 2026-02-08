import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Terminal } from "lucide-react";
import akboyLogo from "@/assets/akboy-logo.png";
import { useDomainDetection } from "@/hooks/useDomainDetection";

export function AkboyNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAkboy } = useDomainDetection();

  const basePath = isAkboy ? "" : "/akboy";

  const navLinks = [
    { name: "Home", path: basePath || "/" },
    { name: "About", path: `${basePath}/about` },
    { name: "Services", path: `${basePath}/services` },
    { name: "Register", path: `${basePath}/register` },
    { name: "Portfolio", path: `${basePath}/portfolio` },
    { name: "Events", path: `${basePath}/events` },
    { name: "Blog", path: "/blog" },
    { name: "Contact", path: `${basePath}/contact` },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-cyan-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to={basePath || "/"} className="flex items-center space-x-3 group">
            <img 
              src={akboyLogo} 
              alt="AKBOY Creative Hub" 
              className="h-12 w-auto sm:h-14 transform group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                    : "text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center">
            <Button
              asChild
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/30 transition-all rounded-lg"
            >
              <Link to={`${basePath}/contact`}>
                <Terminal className="mr-2 h-4 w-4" />
                Get Started
              </Link>
            </Button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2.5 rounded-lg text-cyan-400 hover:bg-slate-800/50 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="lg:hidden py-4 border-t border-cyan-500/10 animate-fade-in">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      : "text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Button
                asChild
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold mt-3 rounded-lg"
              >
                <Link to={`${basePath}/contact`} onClick={() => setIsOpen(false)}>
                  <Terminal className="mr-2 h-4 w-4" />
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
