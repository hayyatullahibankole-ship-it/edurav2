import { Home, BookOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ScheduleTestModal from "./ScheduleTestModal";
import { useState } from "react";

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileNav = ({ activeTab, onTabChange }: MobileNavProps) => {
  const [testsSheetOpen, setTestsSheetOpen] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Home Button */}
        <Button
          variant="ghost"
          className={`flex-col h-full gap-1 flex-1 rounded-none ${
            activeTab === "dashboard"
              ? "text-primary bg-primary/10"
              : "text-muted-foreground"
          }`}
          onClick={() => onTabChange("dashboard")}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs font-medium">Home</span>
        </Button>

        {/* Tests Button */}
        <Sheet open={testsSheetOpen} onOpenChange={setTestsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="flex-col h-full gap-1 flex-1 rounded-none text-muted-foreground active:text-primary"
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-xs font-medium">Tests</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
            <SheetHeader className="text-left mb-6">
              <SheetTitle className="text-2xl font-bold">Choose Your Test</SheetTitle>
              <SheetDescription>
                Select the exam you want to practice
              </SheetDescription>
            </SheetHeader>
            
            <div className="space-y-4">
              {/* JAMB Test */}
              <ScheduleTestModal defaultExamType="jamb">
                <Button 
                  className="w-full h-20 text-lg font-semibold justify-start px-6 relative overflow-hidden group shadow-lg"
                  onClick={() => setTestsSheetOpen(false)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-glow to-primary opacity-0 group-active:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">JAMB CBT</div>
                      <div className="text-xs opacity-90">Practice for UTME</div>
                    </div>
                  </div>
                </Button>
              </ScheduleTestModal>

              {/* WAEC Test */}
              <ScheduleTestModal defaultExamType="waec">
                <Button 
                  variant="outline" 
                  className="w-full h-20 text-lg font-semibold justify-start px-6 border-2 shadow-md hover:bg-muted active:scale-[0.98] transition-all"
                  onClick={() => setTestsSheetOpen(false)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">WAEC</div>
                      <div className="text-xs text-muted-foreground">West African Examinations</div>
                    </div>
                  </div>
                </Button>
              </ScheduleTestModal>

              {/* NECO Test */}
              <ScheduleTestModal defaultExamType="neco">
                <Button 
                  variant="outline" 
                  className="w-full h-20 text-lg font-semibold justify-start px-6 border-2 shadow-md hover:bg-muted active:scale-[0.98] transition-all"
                  onClick={() => setTestsSheetOpen(false)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-accent" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">NECO</div>
                      <div className="text-xs text-muted-foreground">National Examinations Council</div>
                    </div>
                  </div>
                </Button>
              </ScheduleTestModal>

              {/* Post-UTME Test */}
              <ScheduleTestModal defaultExamType="post-utme">
                <Button 
                  variant="outline" 
                  className="w-full h-20 text-lg font-semibold justify-start px-6 border-2 shadow-md hover:bg-muted active:scale-[0.98] transition-all"
                  onClick={() => setTestsSheetOpen(false)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-warning" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">Post-UTME</div>
                      <div className="text-xs text-muted-foreground">University Screening</div>
                    </div>
                  </div>
                </Button>
              </ScheduleTestModal>
            </div>
          </SheetContent>
        </Sheet>

        {/* Profile Button */}
        <Button
          variant="ghost"
          className={`flex-col h-full gap-1 flex-1 rounded-none ${
            activeTab === "profile" || activeTab === "settings"
              ? "text-primary bg-primary/10"
              : "text-muted-foreground"
          }`}
          onClick={() => onTabChange("profile")}
        >
          <User className="h-5 w-5" />
          <span className="text-xs font-medium">Profile</span>
        </Button>
      </div>
    </div>
  );
};

export default MobileNav;
