import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

export default function SchoolAvailableExams() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from("exams")
        .select(`
          *,
          exam_subjects(
            subject_name,
            question_count
          )
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading exams...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available CBT Exams</CardTitle>
        <CardDescription>
          Your students can practice these exams on the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {exams.map((exam) => (
            <Card key={exam.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{exam.title}</CardTitle>
                    <CardDescription className="mt-1">{exam.description}</CardDescription>
                  </div>
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{exam.duration_minutes} minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Questions:</span>
                    <span className="font-medium">{exam.total_questions}</span>
                  </div>
                  {exam.exam_subjects && exam.exam_subjects.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Subjects:</p>
                      <div className="flex flex-wrap gap-1">
                        {exam.exam_subjects.map((subject: any, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {subject.subject_name} ({subject.question_count}Q)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}