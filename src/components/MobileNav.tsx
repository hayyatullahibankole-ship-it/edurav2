import { Home, BookOpen, User, GraduationCap, FileCheck, Award, Zap, ChevronRight, Sparkles, Sword, MessageSquare, Library } from "lucide-react";
import { Link } from "react-router-dom";
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
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-active:opacity-10 transition-opacity`} />
        
        <div className="relative p-5 flex items-center gap-4">
          {/* Icon Container */}
          <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="h-7 w-7 text-white" />
            <div className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg">{title}</h3>
              {badge && (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-2 py-0">
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

  return (
    <>
      {/* Sleek Modern Navigation Bar with Blue Gradient */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* Blue gradient background with glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-glow to-secondary opacity-95 backdrop-blur-xl" />
        
        {/* Navigation Container */}
        <div className="relative px-4 py-3 safe-area-pb">
          <div className="flex items-center justify-around max-w-md mx-auto">
            {/* Home Button */}
            <Link to="/dashboard" className="flex-1 flex justify-center">
              <button
                onClick={() => playTapSound()}
                className="flex flex-col items-center gap-1 transition-all duration-300 active:scale-90"
              >
                <div className={`p-3 rounded-2xl transition-all duration-300 ${
                  activeTab === "dashboard" 
                    ? "bg-white/30 shadow-lg scale-110" 
                    : "bg-white/10 hover:bg-white/20"
                }`}>
                  <Home className="h-6 w-6 text-white" />
                </div>
                <span className={`text-[11px] font-medium text-white transition-all duration-300 ${
                  activeTab === "dashboard" ? "opacity-100" : "opacity-70"
                }`}>
                  Home
                </span>
              </button>
            </Link>

            {/* Study Button */}
            <Link to="/study-hub" className="flex-1 flex justify-center">
              <button 
                onClick={() => playTapSound()}
                className="flex flex-col items-center gap-1 transition-all duration-300 active:scale-90"
              >
                <div className={`p-3 rounded-2xl transition-all duration-300 ${
                  activeTab === "study" 
                    ? "bg-white/30 shadow-lg scale-110" 
                    : "bg-white/10 hover:bg-white/20"
                }`}>
                  <Library className="h-6 w-6 text-white" />
                </div>
                <span className={`text-[11px] font-medium text-white transition-all duration-300 ${
                  activeTab === "study" ? "opacity-100" : "opacity-70"
                }`}>
                  Study
                </span>
              </button>
            </Link>

            {/* Center - Tests FAB */}
            <div className="flex-1 flex justify-center">
              <Sheet open={testsSheetOpen} onOpenChange={(open) => {
                setTestsSheetOpen(open);
                if (open) playWhooshSound();
              }}>
                <SheetTrigger asChild>
                  <button 
                    onClick={() => playPopSound()}
                    className="relative -mt-8 transition-all duration-300 active:scale-90"
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-40" />
                    
                    {/* Main FAB */}
                    <div className="relative w-16 h-16 rounded-full bg-white shadow-2xl flex items-center justify-center">
                      <BookOpen className="h-7 w-7 text-primary" />
                    </div>
                    
                    <span className="block mt-2 text-[11px] font-medium text-white">Tests</span>
                  </button>
                </SheetTrigger>
                
                <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0 border-t-4 border-primary">
                  {/* Header with Gradient */}
                  <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                    
                    <SheetHeader className="relative text-left p-6 pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                          <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <SheetTitle className="text-2xl font-extrabold">Choose Your Test</SheetTitle>
                          <SheetDescription className="text-base">
                            Select exam type to begin practice
                          </SheetDescription>
                        </div>
                      </div>
                    </SheetHeader>
                  </div>

                  {/* Test Options */}
                  <div className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                    <TestCard
                      examType="jamb"
                      title="JAMB CBT"
                      description="Practice for UTME with real exam format"
                      icon={GraduationCap}
                      badge="Popular"
                      gradient="from-primary to-primary-glow"
                      onClose={() => setTestsSheetOpen(false)}
                    />

                    <TestCard
                      examType="waec"
                      title="WAEC"
                      description="West African Examinations Council"
                      icon={FileCheck}
                      gradient="from-secondary to-info"
                      onClose={() => setTestsSheetOpen(false)}
                    />

                    <TestCard
                      examType="neco"
                      title="NECO"
                      description="National Examinations Council"
                      icon={Award}
                      gradient="from-accent to-success"
                      onClose={() => setTestsSheetOpen(false)}
                    />

                    <TestCard
                      examType="post-utme"
                      title="Post-UTME"
                      description="University screening examination"
                      icon={Zap}
                      badge="New"
                      gradient="from-warning to-destructive"
                      onClose={() => setTestsSheetOpen(false)}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Forum Button */}
            <Link to="/forum" className="flex-1 flex justify-center">
              <button 
                onClick={() => playTapSound()}
                className="flex flex-col items-center gap-1 transition-all duration-300 active:scale-90"
              >
                <div className={`p-3 rounded-2xl transition-all duration-300 ${
                  activeTab === "forum" 
                    ? "bg-white/30 shadow-lg scale-110" 
                    : "bg-white/10 hover:bg-white/20"
                }`}>
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <span className={`text-[11px] font-medium text-white transition-all duration-300 ${
                  activeTab === "forum" ? "opacity-100" : "opacity-70"
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
              className="flex-1 flex justify-center flex flex-col items-center gap-1 transition-all duration-300 active:scale-90"
            >
              <div className={`p-3 rounded-2xl transition-all duration-300 ${
                activeTab === "profile" || activeTab === "settings"
                  ? "bg-white/30 shadow-lg scale-110" 
                  : "bg-white/10 hover:bg-white/20"
              }`}>
                <User className="h-6 w-6 text-white" />
              </div>
              <span className={`text-[11px] font-medium text-white transition-all duration-300 ${
                activeTab === "profile" || activeTab === "settings" ? "opacity-100" : "opacity-70"
              }`}>
                Profile
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNav;
