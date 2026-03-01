import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ExamNotYetAvailableModalProps {
  isOpen: boolean;
  examTitle: string;
  scheduledDate: Date;
  onClose: () => void;
}

export const ExamNotYetAvailableModal: React.FC<ExamNotYetAvailableModalProps> = ({
  isOpen,
  examTitle,
  scheduledDate,
  onClose
}) => {
  const navigate = useNavigate();
  const formattedDate = scheduledDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  
  const formattedTime = scheduledDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  const handleClose = () => {
    onClose();
    navigate('/dashboard');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Exam Not Yet Available
          </DialogTitle>
          <DialogDescription>
            This exam is scheduled for a future date and time
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="font-semibold text-blue-900 mb-3">"{examTitle}"</p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Date</p>
                  <p className="text-blue-900">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Time</p>
                  <p className="text-blue-900">{formattedTime}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-900">
              ⚠️ <strong>Please try logging in again on the scheduled date and time</strong> to start your exam. You'll be able to access it once the scheduled time arrives.
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleClose}>
            Return to Dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
