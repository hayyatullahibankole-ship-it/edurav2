import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, TrendingUp, ChevronRight, ChevronDown, Award } from "lucide-react";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Props {
  schoolId: string;
}

interface StudentAttempt {
  id: string;
  created_at: string;
  submitted_at: string;
  exam_id: string;
  user_id: string;
  status: string;
  exams: { title: string; type: string } | null;
  results: {
    percentage: number;
    correct_answers: number;
    wrong_answers: number;
    total_questions: number;
    scaled_score: number;
  } | null;
}

interface StudentReport {
  id: string;
  full_name: string;
  class_level: string;
  user_id: string;
  attempts: StudentAttempt[];
}

export default function SchoolReports({ schoolId }: Props) {
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, [schoolId]);

  const fetchReports = async () => {
    try {
      // First get all students
      const { data: students, error: studentsError } = await supabase
        .from("school_students")
        .select("id, full_name, class_level, user_id")
        .eq("school_id", schoolId);

      if (studentsError) throw studentsError;

      if (!students || students.length === 0) {
        setReports([]);
        setLoading(false);
        return;
      }

      // Then get all attempts for these students
      const studentUserIds = students.map(s => s.user_id);
      
      const { data: attempts, error: attemptsError } = await supabase
        .from("attempts")
        .select(`
          id,
          created_at,
          submitted_at,
          exam_id,
          user_id,
          status,
          exams(title, type)
        `)
        .in("user_id", studentUserIds)
        .eq("status", "SUBMITTED")
        .order("created_at", { ascending: false });

      if (attemptsError) throw attemptsError;

      // Get results for all these attempts
      const attemptIds = (attempts || []).map(a => a.id);
      const { data: results, error: resultsError } = await supabase
        .from("results")
        .select(`
          attempt_id,
          percentage,
          correct_answers,
          wrong_answers,
          total_questions,
          scaled_score
        `)
        .in("attempt_id", attemptIds);

      if (resultsError) throw resultsError;

      // Merge everything together
      const attemptsWithResults = (attempts || []).map(attempt => ({
        ...attempt,
        results: (results || []).find(r => r.attempt_id === attempt.id) || null
      }));

      const merged = students.map(student => ({
        ...student,
        attempts: attemptsWithResults.filter(a => a.user_id === student.user_id)
      }));

      setReports(merged);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    const csv = [
      ["Student Name", "Class", "Test Title", "Score (%)", "Correct", "Wrong", "Total", "Date"],
      ...reports.flatMap(student => 
        (student.attempts || []).map(attempt => [
          student.full_name,
          student.class_level || "-",
          attempt.exams?.title || "Practice Test",
          attempt.results?.percentage?.toFixed(1) || "-",
          attempt.results?.correct_answers || "-",
          attempt.results?.wrong_answers || "-",
          attempt.results?.total_questions || "-",
          new Date(attempt.submitted_at || attempt.created_at).toLocaleDateString()
        ])
      )
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `school_performance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Report downloaded successfully");
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 75) return "default";
    if (percentage >= 50) return "secondary";
    return "destructive";
  };

  const calculateAverage = (attempts: StudentAttempt[]) => {
    const validAttempts = attempts.filter(a => a.results?.percentage);
    if (validAttempts.length === 0) return 0;
    const sum = validAttempts.reduce((acc, a) => acc + (a.results?.percentage || 0), 0);
    return sum / validAttempts.length;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Student Performance Reports</CardTitle>
            <CardDescription>
              View detailed test scores for all students
            </CardDescription>
          </div>
          <Button variant="outline" onClick={downloadReport} disabled={reports.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center py-8 text-muted-foreground">Loading reports...</p>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No students added yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {reports.map((student) => {
              const avgScore = calculateAverage(student.attempts || []);
              const totalAttempts = student.attempts?.length || 0;
              
              return (
                <Collapsible
                  key={student.id}
                  open={expandedStudent === student.id}
                  onOpenChange={(open) => setExpandedStudent(open ? student.id : null)}
                >
                  <Card>
                    <CollapsibleTrigger asChild>
                      <button className="w-full">
                        <CardHeader className="hover:bg-accent/50 transition-colors cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {expandedStudent === student.id ? (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              )}
                              <div className="text-left">
                                <CardTitle className="text-lg">{student.full_name}</CardTitle>
                                <CardDescription>
                                  {student.class_level || "No class"} • {totalAttempts} test{totalAttempts !== 1 ? 's' : ''}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {totalAttempts > 0 && (
                                <>
                                  <div className="text-right">
                                    <div className="text-sm text-muted-foreground">Average Score</div>
                                    <div className="text-2xl font-bold">{avgScore.toFixed(1)}%</div>
                                  </div>
                                  <Award className={`h-8 w-8 ${
                                    avgScore >= 75 ? 'text-yellow-500' : 
                                    avgScore >= 50 ? 'text-blue-500' : 
                                    'text-gray-400'
                                  }`} />
                                </>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        {totalAttempts === 0 ? (
                          <p className="text-center py-8 text-muted-foreground">No test attempts yet</p>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Test</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Correct</TableHead>
                                <TableHead>Wrong</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Date</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {student.attempts.map((attempt) => {
                                const result = attempt.results;
                                return (
                                  <TableRow key={attempt.id}>
                                    <TableCell className="font-medium">
                                      {attempt.exams?.title || "Practice Test"}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline">
                                        {attempt.exams?.type || "PRACTICE"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      {result ? (
                                        <Badge variant={getScoreColor(result.percentage)}>
                                          {result.percentage.toFixed(1)}%
                                        </Badge>
                                      ) : (
                                        <span className="text-muted-foreground">-</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-green-600 font-semibold">
                                      {result?.correct_answers || 0}
                                    </TableCell>
                                    <TableCell className="text-red-600 font-semibold">
                                      {result?.wrong_answers || 0}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                      {result?.total_questions || 0}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                      {new Date(attempt.submitted_at || attempt.created_at).toLocaleDateString()}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}