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

  const getIndicatorPosition = () => {
    switch(activeTab) {
      case "dashboard": return "8%";
      case "study": return "28%";
      case "forum": return "62%";
      case "profile":
      case "settings": return "82%";
      default: return "8%";
    }
  };

  return (
    <>
      {/* Fluid Navigation Bar with Moving Bubble */}
      <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <div className="relative max-w-md mx-auto">
          {/* White Navigation Bar with Curved Cutout */}
          <div className="relative h-16 bg-white rounded-[28px] shadow-2xl overflow-visible">
            {/* Animated Bubble Indicator */}
            <div 
              className="absolute -top-1 w-14 h-14 rounded-full bg-gradient-to-br from-primary via-primary-glow to-secondary shadow-xl transition-all duration-500 ease-in-out z-20"
              style={{ 
                left: getIndicatorPosition(),
                transform: 'translateX(-50%)'
              }}
            >
              {/* Inner glow */}
              <div className="absolute inset-1 rounded-full bg-white/20" />
            </div>

            {/* Navigation Buttons */}
            <div className="relative h-full flex items-center justify-around px-4 z-10">
              {/* Home Button */}
              <Link to="/dashboard" className="flex-1 flex justify-center">
                <button
                  onClick={() => playTapSound()}
                  className="flex flex-col items-center justify-center gap-0.5 transition-all duration-300 active:scale-90 py-2"
                >
                  <Home 
                    className={`h-6 w-6 transition-colors duration-300 ${
                      activeTab === "dashboard" ? "text-white" : "text-foreground/60"
                    }`}
                    style={{
                      filter: activeTab === "dashboard" ? "drop-shadow(0 2px 8px rgba(255,255,255,0.5))" : "none"
                    }}
                  />
                  <span className={`text-[9px] font-medium transition-all duration-300 ${
                    activeTab === "dashboard" ? "text-foreground/80 font-semibold" : "text-foreground/50"
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
                      activeTab === "study" ? "text-white" : "text-foreground/60"
                    }`}
                    style={{
                      filter: activeTab === "study" ? "drop-shadow(0 2px 8px rgba(255,255,255,0.5))" : "none"
                    }}
                  />
                  <span className={`text-[9px] font-medium transition-all duration-300 ${
                    activeTab === "study" ? "text-foreground/80 font-semibold" : "text-foreground/50"
                  }`}>
                    Study
                  </span>
                </button>
              </Link>

              {/* Center - Tests FAB */}
              <div className="flex-1 flex justify-center -mt-8">
                <Sheet open={testsSheetOpen} onOpenChange={(open) => {
                  setTestsSheetOpen(open);
                  if (open) playWhooshSound();
                }}>
                  <SheetTrigger asChild>
                    <button 
                      onClick={() => playPopSound()}
                      className="relative transition-all duration-300 active:scale-90"
                    >
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl" />
                      
                      {/* Main FAB */}
                      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary via-primary-glow to-secondary shadow-2xl flex items-center justify-center border-4 border-white">
                        <BookOpen className="h-7 w-7 text-white" />
                      </div>
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
                  className="flex flex-col items-center justify-center gap-0.5 transition-all duration-300 active:scale-90 py-2"
                >
                  <MessageSquare 
                    className={`h-6 w-6 transition-colors duration-300 ${
                      activeTab === "forum" ? "text-white" : "text-foreground/60"
                    }`}
                    style={{
                      filter: activeTab === "forum" ? "drop-shadow(0 2px 8px rgba(255,255,255,0.5))" : "none"
                    }}
                  />
                  <span className={`text-[9px] font-medium transition-all duration-300 ${
                    activeTab === "forum" ? "text-foreground/80 font-semibold" : "text-foreground/50"
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
                      activeTab === "profile" || activeTab === "settings" ? "text-white" : "text-foreground/60"
                    }`}
                    style={{
                      filter: (activeTab === "profile" || activeTab === "settings") ? "drop-shadow(0 2px 8px rgba(255,255,255,0.5))" : "none"
                    }}
                  />
                  <span className={`text-[9px] font-medium transition-all duration-300 ${
                    activeTab === "profile" || activeTab === "settings" ? "text-foreground/80 font-semibold" : "text-foreground/50"
                  }`}>
                    Profile
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNav;
