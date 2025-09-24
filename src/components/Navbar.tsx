import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-inter font-bold text-xl text-foreground">EduCBT</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/practice" className="text-foreground hover:text-primary transition-colors">
              Practice Tests
            </Link>
            <Link to="/resources" className="text-foreground hover:text-primary transition-colors">
              Resources
            </Link>
            <Link to="/consultation" className="text-foreground hover:text-primary transition-colors">
              Consultation
            </Link>
            <Link to="/pricing" className="text-foreground hover:text-primary transition-colors">
              Pricing
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-card rounded-lg mt-2 border border-border">
              <Link
                to="/practice"
                className="block px-3 py-2 text-foreground hover:bg-muted rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Practice Tests
              </Link>
              <Link
                to="/resources"
                className="block px-3 py-2 text-foreground hover:bg-muted rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Resources
              </Link>
              <Link
                to="/consultation"
                className="block px-3 py-2 text-foreground hover:bg-muted rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Consultation
              </Link>
              <Link
                to="/pricing"
                className="block px-3 py-2 text-foreground hover:bg-muted rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="px-3 py-2 space-y-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full">Login</Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;