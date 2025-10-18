import { Home, BookOpen, User, GraduationCap, FileCheck, Award, Zap, ChevronRight, Sparkles, Sword, Library } from "lucide-react";
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
    <ScheduleTestModal defaultExamType={examType} onOpenChange={(open) => {
      // Close the sheet when the modal opens
      if (open) {
        setTimeout(() => onClose(), 200);
      }
    }}>
      <Card 
        className={`relative overflow-hidden cursor-pointer transition-all duration-300 active:scale-[0.97] hover-lift group border-0 shadow-lg`}
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
      {/* Modern Professional Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* Glass Effect Background */}
        <div className="absolute inset-0 bg-background/95 backdrop-blur-2xl border-t border-border/40" />
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent pointer-events-none" />
        
        {/* Navigation Container - 5 Button Layout */}
        <div className="relative h-18 px-2 py-2">
          <div className="flex items-center justify-around max-w-md mx-auto">
            {/* Home Button */}
            <Link to="/dashboard" className="flex-1 flex justify-center">
              <button
                className={`relative flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl transition-all duration-300 ${
                  activeTab === "dashboard"
                    ? "scale-105"
                    : "active:scale-95"
                }`}
              >
                {activeTab === "dashboard" && (
                  <div className="absolute inset-0 bg-primary/10 rounded-2xl" />
                )}
                <div className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                  activeTab === "dashboard" 
                    ? "bg-gradient-to-br from-primary to-primary-glow text-white shadow-lg shadow-primary/30" 
                    : "bg-muted/60 text-muted-foreground"
                }`}>
                  <Home className="h-5 w-5" />
                </div>
                <span className={`text-[10px] font-bold tracking-wide ${
                  activeTab === "dashboard" ? "text-primary" : "text-muted-foreground"
                }`}>
                  Home
                </span>
              </button>
            </Link>

            {/* Study Button */}
            <Link to="/study-hub" className="flex-1 flex justify-center">
              <button className={`relative flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl transition-all duration-300 ${
                activeTab === "study" ? "scale-105" : "active:scale-95"
              }`}>
                {activeTab === "study" && (
                  <div className="absolute inset-0 bg-secondary/10 rounded-2xl" />
                )}
                <div className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                  activeTab === "study" 
                    ? "bg-gradient-to-br from-secondary to-info text-white shadow-lg shadow-secondary/30" 
                    : "bg-muted/60 text-muted-foreground"
                }`}>
                  <Library className="h-5 w-5" />
                </div>
                <span className={`text-[10px] font-bold tracking-wide ${
                  activeTab === "study" ? "text-secondary" : "text-muted-foreground"
                }`}>
                  Study
                </span>
              </button>
            </Link>

            {/* Center - Tests FAB (Elevated) */}
            <div className="flex-1 flex justify-center">
              <Sheet open={testsSheetOpen} onOpenChange={setTestsSheetOpen}>
                <SheetTrigger asChild>
                  <button className="relative -mt-6">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent rounded-2xl blur-xl opacity-50" />
                    
                    {/* Main FAB */}
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-primary-glow to-secondary shadow-2xl flex items-center justify-center active:scale-95 transition-all duration-300 border border-white/20">
                      {/* Inner shine */}
                      <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
                      
                      {/* Icon */}
                      <BookOpen className="h-7 w-7 text-white relative z-10" />
                      
                      {/* Active indicator */}
                      <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-warning rounded-full border-2 border-background">
                        <Sparkles className="h-2.5 w-2.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                    
                    <span className="block mt-1.5 text-[10px] font-bold text-foreground text-center">Tests</span>
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

            {/* Arena Button */}
            <Link to="/challenge-arena" className="flex-1 flex justify-center">
              <button className={`relative flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl transition-all duration-300 ${
                activeTab === "arena" ? "scale-105" : "active:scale-95"
              }`}>
                {activeTab === "arena" && (
                  <div className="absolute inset-0 bg-warning/10 rounded-2xl" />
                )}
                <div className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                  activeTab === "arena" 
                    ? "bg-gradient-to-br from-warning to-destructive text-white shadow-lg shadow-warning/30" 
                    : "bg-muted/60 text-muted-foreground"
                }`}>
                  <Sword className="h-5 w-5" />
                </div>
                <span className={`text-[10px] font-bold tracking-wide ${
                  activeTab === "arena" ? "text-warning" : "text-muted-foreground"
                }`}>
                  Arena
                </span>
              </button>
            </Link>

            {/* Profile Button */}
            <button
              onClick={() => onTabChange("profile")}
              className={`flex-1 flex justify-center relative flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl transition-all duration-300 ${
                activeTab === "profile" || activeTab === "settings"
                  ? "scale-105"
                  : "active:scale-95"
              }`}
            >
              {(activeTab === "profile" || activeTab === "settings") && (
                <div className="absolute inset-0 bg-accent/10 rounded-2xl" />
              )}
              <div className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                activeTab === "profile" || activeTab === "settings"
                  ? "bg-gradient-to-br from-accent to-success text-white shadow-lg shadow-accent/30" 
                  : "bg-muted/60 text-muted-foreground"
              }`}>
                <User className="h-5 w-5" />
              </div>
              <span className={`text-[10px] font-bold tracking-wide ${
                activeTab === "profile" || activeTab === "settings" ? "text-accent" : "text-muted-foreground"
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
