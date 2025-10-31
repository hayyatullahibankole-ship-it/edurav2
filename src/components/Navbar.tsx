import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X, Download } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import eduraLogo from "@/assets/edura-logo.png";
import NotificationBell from "@/components/NotificationBell";
import { useInstalledApp } from "@/hooks/useInstalledApp";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const { isInstalledApp } = useInstalledApp();
  const isMobile = useIsMobile();
  const isMobileWeb = isMobile && !isInstalledApp;

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={eduraLogo} alt="Edura" className="h-24 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/demo" className="text-foreground hover:text-primary transition-colors">
              Practice Tests
            </Link>
            <Link to="/resources" className="text-foreground hover:text-primary transition-colors">
              Resources
            </Link>
            <Link to="/books" className="text-foreground hover:text-primary transition-colors">
              Books
            </Link>
            {user && (
              <>
                <Link to="/study-hub" className="text-foreground hover:text-primary transition-colors">
                  Study Hub
                </Link>
                <Link to="/forum" className="text-foreground hover:text-primary transition-colors">
                  Forum
                </Link>
              </>
            )}
            <Link to="/consultation" className="text-foreground hover:text-primary transition-colors">
              Consultation
            </Link>
            <Link to="/payment" className="text-foreground hover:text-primary transition-colors">
              Pricing
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          {user ? (
            <div className="hidden md:flex items-center space-x-2">
              <NotificationBell />
              <Link to={isMobileWeb ? "/install-app" : "/dashboard"}>
                <Button variant="ghost">
                  {isMobileWeb ? (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Install App
                    </>
                  ) : (
                    'Dashboard'
                  )}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <Link to={isMobileWeb ? "/install-app" : "/auth"}>
                <Button>
                  {isMobileWeb ? (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Install App
                    </>
                  ) : (
                    'Get Started'
                  )}
                </Button>
              </Link>
            </div>
          )}

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
                to="/demo"
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
                to="/books"
                className="block px-3 py-2 text-foreground hover:bg-muted rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Books
              </Link>
              {user && (
                <>
                  <Link
                    to="/study-hub"
                    className="block px-3 py-2 text-foreground hover:bg-muted rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Study Hub
                  </Link>
                  <Link
                    to="/forum"
                    className="block px-3 py-2 text-foreground hover:bg-muted rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Forum
                  </Link>
                </>
              )}
              <Link
                to="/consultation"
                className="block px-3 py-2 text-foreground hover:bg-muted rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Consultation
              </Link>
              <Link
                to="/payment"
                className="block px-3 py-2 text-foreground hover:bg-muted rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="px-3 py-2 space-y-2">
                {user ? (
                  <>
                    <Link to={isMobileWeb ? "/install-app" : "/dashboard"} onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">
                        {isMobileWeb ? (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Install App
                          </>
                        ) : (
                          'Dashboard'
                        )}
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to={isMobileWeb ? "/install-app" : "/auth"} onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full">
                        {isMobileWeb ? (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Install App
                          </>
                        ) : (
                          'Get Started'
                        )}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;