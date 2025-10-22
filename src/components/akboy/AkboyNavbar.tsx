import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function AkboyNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/akboy" },
    { name: "About", path: "/akboy/about" },
    { name: "Services", path: "/akboy/services" },
    { name: "Portfolio", path: "/akboy/portfolio" },
    { name: "Events", path: "/akboy/events" },
    { name: "Blog", path: "/akboy/blog" },
    { name: "Contact", path: "/akboy/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/akboy" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-[#075E54] to-[#A8E6A1] rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-xl">AK</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-[#075E54] leading-tight font-poppins">
                AKBOY Creative Hub
              </h1>
              <p className="text-xs text-gray-600 font-lato">Where Creativity Meets Learning</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? "bg-[#075E54] text-white"
                    : "text-gray-700 hover:bg-[#A8E6A1]/20 hover:text-[#075E54]"
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
              className="bg-[#FFD700] text-[#075E54] hover:bg-[#FFD700]/90 font-semibold"
            >
              <Link to="/akboy/contact">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg text-[#075E54] hover:bg-[#A8E6A1]/20 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 animate-fade-in">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? "bg-[#075E54] text-white"
                      : "text-gray-700 hover:bg-[#A8E6A1]/20"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Button
                asChild
                className="bg-[#FFD700] text-[#075E54] hover:bg-[#FFD700]/90 font-semibold mt-4"
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
