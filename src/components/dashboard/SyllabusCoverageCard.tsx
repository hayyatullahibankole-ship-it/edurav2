import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Target, TrendingUp } from "lucide-react";
import { useSyllabusCoverage } from "@/hooks/useSyllabusCoverage";
import { Skeleton } from "@/components/ui/skeleton";

export const SyllabusCoverageCard = () => {
  const { coverage, loading, overallCoverage } = useSyllabusCoverage();

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getColorByPercentage = (percentage: number) => {
    if (percentage >= 80) return "text-success";
    if (percentage >= 60) return "text-info";
    if (percentage >= 40) return "text-warning";
    return "text-destructive";
  };

  const getMasteryBadge = (mastery: number) => {
    if (mastery >= 90) return { label: "Master", color: "bg-success text-white" };
    if (mastery >= 75) return { label: "Expert", color: "bg-info text-white" };
    if (mastery >= 60) return { label: "Proficient", color: "bg-warning text-white" };
    if (mastery >= 40) return { label: "Learning", color: "bg-orange-500 text-white" };
    return { label: "Beginner", color: "bg-muted text-muted-foreground" };
  };

  return (
    <Card className="border border-border bg-card overflow-hidden hover-lift">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      
      <CardHeader className="relative">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-2xl">Syllabus Coverage</CardTitle>
            <CardDescription>Track your mastery across all topics</CardDescription>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getColorByPercentage(overallCoverage)}`}>
              {overallCoverage}%
            </div>
            <div className="text-xs text-muted-foreground">Overall</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {coverage.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Start practicing to track your syllabus coverage
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-3">
              {coverage.slice(0, 5).map((topic) => {
                const masteryBadge = getMasteryBadge(topic.mastery_percentage);
                return (
                  <div key={topic.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{topic.topic_name}</p>
                          <Badge className={`${masteryBadge.color} text-xs`}>
                            {masteryBadge.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{topic.subject_name}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-primary" />
                          <span className="text-sm font-bold">
                            {Math.round(topic.mastery_percentage)}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {topic.attempted_questions} questions
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Coverage</span>
                        <span>{Math.round(topic.coverage_percentage)}%</span>
                      </div>
                      <Progress value={topic.coverage_percentage} className="h-2" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Accuracy</span>
                        <span>{Math.round(topic.mastery_percentage)}%</span>
                      </div>
                      <Progress value={topic.mastery_percentage} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>

            {coverage.length > 5 && (
              <p className="text-center text-sm text-muted-foreground">
                +{coverage.length - 5} more topics
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
