import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X, Download, LayoutDashboard, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import eduraLogo from "@/assets/edura-logo.png";
import NotificationBell from "@/components/NotificationBell";
import { useInstalledApp } from "@/hooks/useInstalledApp";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    user,
    isAdmin
  } = useAuth();
  const {
    isInstalledApp
  } = useInstalledApp();
  const isMobile = useIsMobile();
  const isMobileWeb = isMobile && !isInstalledApp;
  const [isSchoolAdmin, setIsSchoolAdmin] = useState(false);
  useEffect(() => {
    const checkSchoolAdmin = async () => {
      if (!user) {
        setIsSchoolAdmin(false);
        return;
      }
      const {
        data: userData
      } = await supabase.from("users").select("id").eq("auth_user_id", user.id).maybeSingle();
      if (!userData) return;
      const {
        data: school
      } = await supabase.from("schools").select("id").eq("admin_user_id", userData.id).maybeSingle();
      setIsSchoolAdmin(!!school);
    };
    checkSchoolAdmin();
  }, [user]);
  return <nav className="bg-background/90 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={eduraLogo} alt="Edura" className="h-16 md:h-20 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-7 text-sm font-medium">
            <Link to="/demo" className="text-muted-foreground hover:text-foreground transition-colors">
              Practice
            </Link>
            <Link to="/services" className="text-muted-foreground hover:text-foreground transition-colors">
              Services
            </Link>
            <Link to="/resources" className="text-muted-foreground hover:text-foreground transition-colors">
              Resources
            </Link>
            {user && <>
                <Link to="/study-hub" className="text-muted-foreground hover:text-foreground transition-colors">
                  Study Hub
                </Link>
                <Link to="/forum" className="text-muted-foreground hover:text-foreground transition-colors">
                  Forum
                </Link>
              </>}
            <Link to="/school-landing" className="text-muted-foreground hover:text-foreground transition-colors">
              For Schools
            </Link>
            <Link to="/payment" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
          </div>


          {/* Desktop Auth Buttons */}
          {user ? <div className="hidden md:flex items-center space-x-2">
              <NotificationBell />
              {isSchoolAdmin && <Link to="/school-dashboard">
                  <Button variant="outline">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    School Dashboard
                  </Button>
                </Link>}
              <Link to={isMobileWeb ? "/install-app" : "/dashboard"}>
                <Button variant="ghost">
                  {isMobileWeb ? <>
                      <Download className="h-4 w-4 mr-2" />
                      Install App
                    </> : 'Dashboard'}
                </Button>
              </Link>
            </div> : <div className="hidden md:flex items-center space-x-4">
              <Link to={isMobileWeb ? "/install-app" : "/auth"}>
                <Button>
                  {isMobileWeb ? <>
                      <Download className="h-4 w-4 mr-2" />
                      Install App
                    </> : 'Get Started'}
                </Button>
              </Link>
            </div>}

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-card rounded-lg mt-2 border border-border">
              <Link to="/demo" className="block px-3 py-2 text-foreground hover:bg-muted rounded-md" onClick={() => setIsMenuOpen(false)}>
                Practice Tests
              </Link>
              <Link to="/resources" className="block px-3 py-2 text-foreground hover:bg-muted rounded-md" onClick={() => setIsMenuOpen(false)}>
                Resources
              </Link>
              {user && <>
                  <Link to="/study-hub" className="block px-3 py-2 text-foreground hover:bg-muted rounded-md" onClick={() => setIsMenuOpen(false)}>
                    Study Hub
                  </Link>
                  <Link to="/forum" className="block px-3 py-2 text-foreground hover:bg-muted rounded-md" onClick={() => setIsMenuOpen(false)}>
                    Forum
                  </Link>
                </>}
              <Link to="/payment" className="block px-3 py-2 text-foreground hover:bg-muted rounded-md" onClick={() => setIsMenuOpen(false)}>
                Pricing
              </Link>
              <div className="px-3 py-2 space-y-2">
                {user ? <>
                    {isSchoolAdmin && <Link to="/school-dashboard" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          School Dashboard
                        </Button>
                      </Link>}
                    <Link to={isMobileWeb ? "/install-app" : "/dashboard"} onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">
                        {isMobileWeb ? <>
                            <Download className="h-4 w-4 mr-2" />
                            Install App
                          </> : 'Dashboard'}
                      </Button>
                    </Link>
                  </> : <>
                    <Link to={isMobileWeb ? "/install-app" : "/auth"} onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full">
                        {isMobileWeb ? <>
                            <LogIn className="h-4 w-4 mr-2" />
                            Install App
                          </> : 'Get Started'}
                      </Button>
                    </Link>
                  </>}
              </div>
            </div>
          </div>}
      </div>
    </nav>;
};
export default Navbar;