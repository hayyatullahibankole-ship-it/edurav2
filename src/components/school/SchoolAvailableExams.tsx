import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, GraduationCap, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SchoolAvailableExams() {
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch published exams
      const { data: examsData, error: examsError } = await supabase
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

      if (examsError) throw examsError;

      // Fetch available subjects for practice mode
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select("id, name, description")
        .eq("is_active", true)
        .order("name");

      if (subjectsError) throw subjectsError;

      // Get question counts for each subject
      const { data: questionCounts, error: countsError } = await supabase
        .from("questions")
        .select("subject_id")
        .eq("is_active", true);

      if (countsError) throw countsError;

      // Count questions per subject
      const subjectQuestionCounts: Record<string, number> = {};
      questionCounts?.forEach((q: any) => {
        subjectQuestionCounts[q.subject_id] = (subjectQuestionCounts[q.subject_id] || 0) + 1;
      });

      // Add question counts to subjects
      const subjectsWithCounts = (subjectsData || []).map((subject: any) => ({
        id: subject.id,
        name: subject.name,
        description: subject.description,
        question_count: subjectQuestionCounts[subject.id] || 0
      }));

      setExams(examsData || []);
      setSubjects(subjectsWithCounts || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setError(error.message || "Failed to load exams and practice options");
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
              <p className="text-sm text-muted-foreground">Loading available tests...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="exams" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="exams">
            <BookOpen className="h-4 w-4 mr-2" />
            CBT Exams
          </TabsTrigger>
          <TabsTrigger value="practice">
            <GraduationCap className="h-4 w-4 mr-2" />
            Practice Mode
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exams" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Available CBT Exams</CardTitle>
              <CardDescription>
                Formal timed exams that students can take for assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {exams.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No published exams available</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Contact the administrator to publish exams
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {exams.map((exam) => (
                    <Card key={exam.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-semibold break-words">
                              {exam.title}
                            </CardTitle>
                            {exam.description && (
                              <CardDescription className="mt-1 break-words">
                                {exam.description}
                              </CardDescription>
                            )}
                          </div>
                          <BookOpen className="h-5 w-5 text-primary ml-2 flex-shrink-0" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground text-xs">Duration</p>
                              <p className="font-medium">{exam.duration_minutes} min</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Questions</p>
                              <p className="font-medium">{exam.total_questions}</p>
                            </div>
                          </div>
                          
                          {exam.exam_subjects && exam.exam_subjects.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-2">Subjects:</p>
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practice" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Practice Mode</CardTitle>
              <CardDescription>
                Students can practice individual subjects at their own pace
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subjects.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No subjects available for practice</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {subjects.map((subject) => (
                    <Card key={subject.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-semibold break-words">
                              {subject.name}
                            </CardTitle>
                            {subject.description && (
                              <CardDescription className="mt-1 text-xs break-words">
                                {subject.description}
                              </CardDescription>
                            )}
                          </div>
                          <GraduationCap className="h-5 w-5 text-primary ml-2 flex-shrink-0" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Available Questions</span>
                            <Badge variant="outline" className="text-xs">
                              {subject.question_count} questions
                            </Badge>
                          </div>
                          {subject.question_count > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Students can practice with custom question counts
                            </p>
                          )}
                          {subject.question_count === 0 && (
                            <p className="text-xs text-amber-600">
                              No questions available yet
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
