import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles } from "lucide-react";

export function AkboyNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/akboy" },
    { name: "About", path: "/akboy/about" },
    { name: "Services", path: "/akboy/services" },
    { name: "Portfolio", path: "/akboy/portfolio" },
    { name: "Events", path: "/akboy/events" },
    { name: "Blog", path: "/blog" },
    { name: "Contact", path: "/akboy/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-purple-100 shadow-lg shadow-purple-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/akboy" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-2xl blur-md group-hover:blur-lg transition-all"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-900 to-fuchsia-800 bg-clip-text text-transparent leading-tight font-poppins">
                AKBOY Creative Hub
              </h1>
              <p className="text-xs text-gray-600 font-lato">Innovation & Excellence</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive(link.path)
                    ? "bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-lg shadow-purple-500/30"
                    : "text-gray-700 hover:bg-purple-50 hover:text-purple-900"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button
              asChild
              className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white font-bold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-105 transition-all rounded-xl border-0"
            >
              <Link to="/akboy/contact">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2.5 rounded-xl text-purple-900 hover:bg-purple-50 transition-colors"
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-6 border-t border-purple-100 animate-fade-in">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-5 py-3.5 rounded-xl text-base font-semibold transition-all ${
                    isActive(link.path)
                      ? "bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Button
                asChild
                className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white font-bold shadow-lg mt-4 rounded-xl border-0"
              >
                <Link to="/akboy/contact" onClick={() => setIsOpen(false)}>
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
