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

const TestCard = ({ examType, title, description, icon: Icon, badge, gradient, onClose }: TestCardProps) => {
  const handleClick = () => {
    // Small delay before closing to allow the modal to open
    setTimeout(() => {
      onClose();
    }, 100);
  };

  return (
    <ScheduleTestModal defaultExamType={examType}>
      <Card 
        className={`relative overflow-hidden cursor-pointer transition-all duration-300 active:scale-[0.97] hover-lift group border-0 shadow-lg`}
        onClick={handleClick}
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
      {/* Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* Backdrop blur effect */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/50" />
        
        {/* Navigation Items - Centered Layout with Tests in middle */}
        <div className="relative flex items-center justify-between h-20 px-4 w-full">
          {/* Left Side - 2 buttons */}
          <div className="flex items-center gap-2 flex-1 justify-start">
            {/* Home Button */}
            <Link to="/dashboard">
              <button
                className={`relative flex flex-col items-center gap-1 px-2 py-2 rounded-2xl transition-all duration-300 ${
                  activeTab === "dashboard"
                    ? "text-primary"
                    : "text-muted-foreground active:scale-95"
                }`}
              >
                {activeTab === "dashboard" && (
                  <div className="absolute inset-0 bg-primary/10 rounded-2xl animate-fade-in" />
                )}
                <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                  activeTab === "dashboard" 
                    ? "bg-primary text-white shadow-lg scale-110" 
                    : "bg-muted/50"
                }`}>
                  <Home className="h-4 w-4" />
                </div>
                <span className={`text-[10px] font-semibold ${
                  activeTab === "dashboard" ? "text-primary" : ""
                }`}>
                  Home
                </span>
              </button>
            </Link>

            {/* Study Hub Button */}
            <Link to="/study-hub">
              <button className={`relative flex flex-col items-center gap-1 px-2 py-2 rounded-2xl transition-all duration-300 ${
                activeTab === "study" ? "text-primary" : "text-muted-foreground active:scale-95"
              }`}>
                {activeTab === "study" && (
                  <div className="absolute inset-0 bg-primary/10 rounded-2xl animate-fade-in" />
                )}
                <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                  activeTab === "study" ? "bg-primary text-white shadow-lg scale-110" : "bg-muted/50"
                }`}>
                  <Library className="h-4 w-4" />
                </div>
                <span className={`text-[10px] font-semibold ${
                  activeTab === "study" ? "text-primary" : ""
                }`}>Study</span>
              </button>
            </Link>
          </div>

          {/* Center - Tests Button with Special Styling */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Sheet open={testsSheetOpen} onOpenChange={setTestsSheetOpen}>
              <SheetTrigger asChild>
                <button className="relative flex flex-col items-center -mt-8">
                  {/* Floating Action Button */}
                  <div className="relative">
                    {/* Multi-layer Glow Effects */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent rounded-3xl blur-2xl opacity-60 animate-pulse" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-3xl blur-xl opacity-40" />
                    
                    {/* Main Button - Modern Glassmorphism */}
                    <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent shadow-2xl flex items-center justify-center active:scale-95 transition-all duration-300 border-2 border-white/20 backdrop-blur-sm">
                      {/* Inner glow */}
                      <div className="absolute inset-1 rounded-[22px] bg-gradient-to-br from-white/20 to-transparent" />
                      
                      {/* Icon */}
                      <BookOpen className="h-7 w-7 text-white relative z-10 drop-shadow-lg" />
                      
                      {/* Premium Sparkle Badge */}
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-warning to-warning/80 rounded-full flex items-center justify-center shadow-lg animate-bounce border-2 border-white/30">
                        <Sparkles className="h-3 w-3 text-white drop-shadow" />
                      </div>

                      {/* Rotating ring effect */}
                      <div className="absolute inset-0 rounded-3xl border-2 border-white/10 animate-spin-slow" style={{ animationDuration: '8s' }} />
                    </div>
                  </div>
                  
                  <span className="mt-2 text-xs font-bold text-foreground drop-shadow-sm">Tests</span>
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

          {/* Right Side - 2 buttons */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            {/* Forum Button */}
            <Link to="/forum">
              <button className={`relative flex flex-col items-center gap-1 px-2 py-2 rounded-2xl transition-all duration-300 ${
                activeTab === "forum" ? "text-primary" : "text-muted-foreground active:scale-95"
              }`}>
                {activeTab === "forum" && (
                  <div className="absolute inset-0 bg-primary/10 rounded-2xl animate-fade-in" />
                )}
                <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                  activeTab === "forum" ? "bg-primary text-white shadow-lg scale-110" : "bg-muted/50"
                }`}>
                  <MessageSquare className="h-4 w-4" />
                </div>
                <span className={`text-[10px] font-semibold ${
                  activeTab === "forum" ? "text-primary" : ""
                }`}>Forum</span>
              </button>
            </Link>

            {/* Profile Button */}
            <button
              onClick={() => onTabChange("profile")}
              className={`relative flex flex-col items-center gap-1 px-2 py-2 rounded-2xl transition-all duration-300 ${
                activeTab === "profile" || activeTab === "settings"
                  ? "text-primary"
                  : "text-muted-foreground active:scale-95"
              }`}
            >
              {(activeTab === "profile" || activeTab === "settings") && (
                <div className="absolute inset-0 bg-primary/10 rounded-2xl animate-fade-in" />
              )}
              <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                activeTab === "profile" || activeTab === "settings"
                  ? "bg-primary text-white shadow-lg scale-110" 
                  : "bg-muted/50"
              }`}>
                <User className="h-4 w-4" />
              </div>
              <span className={`text-[10px] font-semibold ${
                activeTab === "profile" || activeTab === "settings" ? "text-primary" : ""
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
