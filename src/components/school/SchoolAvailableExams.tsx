import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SchoolAvailableExams() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);

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
    } catch (error: any) {
      console.error("Error fetching exams:", error);
      setError(error.message || "Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading available exams...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Available Practice Tests</h2>
        <p className="text-sm text-muted-foreground">
          WAEC, NECO, JAMB and other exam types available for students to practice
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {exams.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium">No practice tests available</p>
              <p className="text-sm text-muted-foreground mt-2">
                Contact the administrator to publish exam types
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold break-words flex items-center gap-2">
                      <BookOpen className="h-4 w-4 flex-shrink-0 text-primary" />
                      {exam.title}
                    </CardTitle>
                    {exam.description && (
                      <CardDescription className="mt-2 text-xs break-words line-clamp-2">
                        {exam.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-xs">Duration</span>
                    </div>
                    <p className="text-sm font-semibold">{exam.duration_minutes} mins</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      <span className="text-xs">Questions</span>
                    </div>
                    <p className="text-sm font-semibold">{exam.total_questions}</p>
                  </div>
                </div>

                {exam.passing_score && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Passing Score</span>
                      <Badge variant="outline" className="text-xs">
                        {exam.passing_score}%
                      </Badge>
                    </div>
                  </div>
                )}

                {exam.exam_subjects && exam.exam_subjects.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Subjects Covered:</p>
                    <div className="flex flex-wrap gap-1">
                      {exam.exam_subjects.slice(0, 3).map((subject: any, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {subject.subject_name}
                        </Badge>
                      ))}
                      {exam.exam_subjects.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{exam.exam_subjects.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
