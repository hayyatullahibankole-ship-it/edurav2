import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Props {
  schoolId: string;
}

export default function SchoolReports({ schoolId }: Props) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [schoolId]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("school_students")
        .select(`
          id,
          full_name,
          user_id,
          attempts:attempts(
            id,
            exam_id,
            created_at,
            exams(title)
          )
        `)
        .eq("school_id", schoolId);

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    // Generate CSV report
    const csv = [
      ["Student Name", "Total Attempts"],
      ...reports.map(r => [r.full_name, r.attempts?.length || 0])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_performance_report.csv";
    a.click();
    toast.success("Report downloaded successfully");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Student Performance Reports</CardTitle>
            <CardDescription>
              Monitor your students' practice performance
            </CardDescription>
          </div>
          <Button variant="outline" onClick={downloadReport} disabled={reports.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading reports...</p>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No performance data yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Total Attempts</TableHead>
                <TableHead>Last Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.full_name}</TableCell>
                  <TableCell>{report.attempts?.length || 0}</TableCell>
                  <TableCell>
                    {report.attempts && report.attempts.length > 0
                      ? new Date(report.attempts[0].created_at).toLocaleDateString()
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}