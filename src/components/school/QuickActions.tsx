import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Download, Users, FileText } from "lucide-react";
import { toast } from "sonner";

interface QuickActionsProps {
  onAddStudent: () => void;
  onViewReports: () => void;
  onViewStudents: () => void;
  schoolId: string;
}

export default function QuickActions({ onAddStudent, onViewReports, onViewStudents, schoolId }: QuickActionsProps) {
  const handleDownloadReport = () => {
    toast.info("Report download feature coming soon");
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
            onClick={onViewStudents}
          >
            <Users className="h-5 w-5" />
            <span className="text-xs font-medium">View Students</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col gap-2 p-4"
            onClick={onViewReports}
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs font-medium">View Reports</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
