import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Download, Bell, FileText, Mail } from "lucide-react";
import { toast } from "sonner";

interface QuickActionsProps {
  onAddStudent: () => void;
  schoolId: string;
}

export default function QuickActions({ onAddStudent, schoolId }: QuickActionsProps) {
  const handleDownloadReport = () => {
    toast.info("Report download feature coming soon");
  };

  const handleSendAnnouncement = () => {
    toast.info("Announcement feature coming soon");
  };

  const handleViewReports = () => {
    toast.info("Navigate to Reports tab for detailed analytics");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 p-4"
            onClick={onAddStudent}
          >
            <UserPlus className="h-5 w-5" />
            <span className="text-xs font-medium">Add Student</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col gap-2 p-4"
            onClick={handleDownloadReport}
          >
            <Download className="h-5 w-5" />
            <span className="text-xs font-medium">Download Report</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col gap-2 p-4"
            onClick={handleSendAnnouncement}
          >
            <Bell className="h-5 w-5" />
            <span className="text-xs font-medium">Send Alert</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col gap-2 p-4"
            onClick={handleViewReports}
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs font-medium">View Reports</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
