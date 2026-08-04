import { Home, BookOpen, User, GraduationCap, FileCheck, Award, Zap, ChevronRight, Sparkles, Sword, MessageSquare, Library, Download, Smartphone, Wifi, Bell, Compass } from "lucide-react";
import { ExploreSheet } from "@/components/edura/ExploreSheet";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import ScheduleTestModal from "./ScheduleTestModal";
import { useState } from "react";
import { playTapSound, playPopSound, playWhooshSound } from "@/utils/sounds";
import { useInstalledApp } from "@/hooks/useInstalledApp";
import { InstallRequiredModal } from "./InstallRequiredModal";

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface TestCardProps {
  examType: "jamb" | "waec" | "neco" | "post-utme";
  title: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
  gradient: string;
  onClose: () => void;
}

interface TestCardWithCloseProps extends TestCardProps {
  onModalOpen: () => void;
}

const TestCard = ({ examType, title, description, icon: Icon, badge, gradient, onClose }: TestCardProps) => {
  return (
    <ScheduleTestModal 
      defaultExamType={examType}
    >
      <Card 
        className={`relative overflow-hidden cursor-pointer transition-all duration-300 active:scale-[0.97] hover-lift group border-0 shadow-lg`}
        onClick={() => playPopSound()}
      >
        <div className={`absolute inset-0 ${gradient} opacity-5 group-active:opacity-10 transition-opacity`} />
        
        <div className="relative p-5 flex items-center gap-4">
          {/* Icon Container */}
          <div className={`relative w-14 h-14 rounded-2xl ${gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="h-7 w-7 text-white" />
            <div className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg">{title}</h3>
              {badge && (
                <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs px-2 py-0">
                  {badge}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {/* Arrow */}
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </div>
      </Card>
    </ScheduleTestModal>
  );
};

const MobileNav = ({ activeTab, onTabChange }: MobileNavProps) => {
  const [testsSheetOpen, setTestsSheetOpen] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const { isInstalledApp } = useInstalledApp();
  const navigate = useNavigate();
  
  const isMobileBrowser = !isInstalledApp && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const handleTestsClick = () => {
    if (isMobileBrowser) {
      setShowInstallModal(true);
      playPopSound();
    } else {
      setTestsSheetOpen(true);
      playWhooshSound();
    }
  };

  return (
    <>
      {/* Fluid Navigation Bar */}
      <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <div className="relative max-w-md mx-auto">
          {/* Dashboard navigation */}
          <div className="relative h-16 rounded-2xl border bg-card shadow-card overflow-visible">
            {/* Navigation Buttons */}
            <div className="relative h-full flex items-center justify-around px-4 z-10">
              {/* Home Button */}
              <Link to={isInstalledApp ? "/mobile-home" : "/dashboard"} className="flex-1 flex justify-center">
                <button
                  onClick={() => playTapSound()}
                  className="flex flex-col items-center justify-center gap-0.5 transition-all duration-300 active:scale-90 py-2"
                >
                  <Home 
                    className={`h-6 w-6 transition-colors duration-300 ${
                      activeTab === "dashboard" ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span className={`text-[9px] font-medium transition-all duration-300 ${
                    activeTab === "dashboard" ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}>
                    Home
                  </span>
                </button>
              </Link>

              {/* Study Button */}
              <Link to="/study-hub" className="flex-1 flex justify-center">
                <button 
                  onClick={() => playTapSound()}
                  className="flex flex-col items-center justify-center gap-0.5 transition-all duration-300 active:scale-90 py-2"
                >
                  <Library 
                    className={`h-6 w-6 transition-colors duration-300 ${
                      activeTab === "study" ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span className={`text-[9px] font-medium transition-all duration-300 ${
                    activeTab === "study" ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}>
                    Study
                  </span>
                </button>
              </Link>

              {/* Center - Explore FAB */}
              <div className="flex-1 flex justify-center -mt-8">
                <button
                  onClick={handleTestsClick}
                  className="relative transition-all duration-300 active:scale-90"
                  aria-label="Explore"
                >
                  {/* Main FAB */}
                  <div className="relative w-16 h-16 rounded-full bg-primary shadow-card flex items-center justify-center border-4 border-card">
                    <Compass className="h-7 w-7 text-primary-foreground" />
                  </div>
                </button>

                {/* Explore gateway - only for installed app */}
                <ExploreSheet open={testsSheetOpen} onOpenChange={setTestsSheetOpen} />
              </div>


              {/* Forum Button */}
              <Link to="/forum" className="flex-1 flex justify-center">
                <button 
                  onClick={() => playTapSound()}
                  className="flex flex-col items-center justify-center gap-0.5 transition-all duration-300 active:scale-90 py-2"
                >
                  <MessageSquare 
                    className={`h-6 w-6 transition-colors duration-300 ${
                      activeTab === "forum" ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span className={`text-[9px] font-medium transition-all duration-300 ${
                    activeTab === "forum" ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}>
                    Forum
                  </span>
                </button>
              </Link>

              {/* Profile Button */}
              <button
                onClick={() => {
                  playTapSound();
                  onTabChange("profile");
                }}
                className="flex-1 flex justify-center"
              >
                <div className="flex flex-col items-center justify-center gap-0.5 transition-all duration-300 active:scale-90 py-2">
                  <User 
                    className={`h-6 w-6 transition-colors duration-300 ${
                      activeTab === "profile" || activeTab === "settings" ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span className={`text-[9px] font-medium transition-all duration-300 ${
                    activeTab === "profile" || activeTab === "settings" ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}>
                    Profile
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Install Required Modal for mobile browser users */}
      <InstallRequiredModal 
        open={showInstallModal} 
        onOpenChange={setShowInstallModal}
        featureName="CBT Practice"
      />
    </>
  );
};

export default MobileNav;
