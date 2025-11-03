import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, CheckCircle } from "lucide-react";
import { generateSchoolManual } from "@/utils/schoolManualGenerator";
import { toast } from "sonner";

interface WelcomeManualModalProps {
  open: boolean;
  onClose: () => void;
  schoolName: string;
}

export default function WelcomeManualModal({ open, onClose, schoolName }: WelcomeManualModalProps) {
  const handleDownloadManual = () => {
    try {
      generateSchoolManual();
      toast.success("User manual downloaded successfully!");
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      toast.error("Failed to download manual. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Welcome to Edura, {schoolName}! 🎉
          </DialogTitle>
          <DialogDescription className="text-center text-base space-y-4 pt-4">
            <p>
              Your school account has been successfully created! We're excited to help your students prepare for WAEC, JAMB & NECO exams.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-left">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Download Your User Manual
              </h4>
              <p className="text-sm">
                We've prepared a comprehensive guide to help you get started. The manual includes:
              </p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Step-by-step dashboard tutorial</li>
                <li>• Student management guide</li>
                <li>• Reports & analytics walkthrough</li>
                <li>• Best practices for exam preparation</li>
                <li>• Support contacts & FAQs</li>
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button 
            onClick={handleDownloadManual}
            size="lg"
            className="w-full"
          >
            <Download className="h-5 w-5 mr-2" />
            Download User Manual
          </Button>
          <Button 
            onClick={onClose}
            variant="outline"
            size="lg"
            className="w-full"
          >
            I'll Download Later
          </Button>
        </div>
        
        <p className="text-xs text-center text-muted-foreground mt-2">
          You can download the manual anytime from Quick Actions on your dashboard
        </p>
      </DialogContent>
    </Dialog>
  );
}
