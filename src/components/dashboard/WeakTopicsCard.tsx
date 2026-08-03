import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Target, X, Zap } from "lucide-react";
import { useWeakTopics } from "@/hooks/useWeakTopics";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

export const WeakTopicsCard = () => {
  const { weakTopics, loading, dismissTopic } = useWeakTopics();
  const navigate = useNavigate();

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

  const getWeaknessColor = (score: number) => {
    if (score < 30) return "bg-destructive text-white";
    if (score < 50) return "bg-warning text-white";
    return "bg-orange-500 text-white";
  };

  const handlePractice = (topic: any) => {
    // Navigate to practice with this specific topic
    navigate('/demo-test', { 
      state: { 
        focusTopic: topic.topic_name,
        recommendedCount: topic.recommended_count 
      } 
    });
  };

  return (
    <Card className="border border-border bg-card overflow-hidden hover-lift">
      <div className="absolute top-0 right-0 w-32 h-32 bg-warning/5 rounded-full blur-3xl" />
      
      <CardHeader className="relative">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-warning/10 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
          <div>
            <CardTitle className="text-2xl">Focus Areas</CardTitle>
            <CardDescription>Topics that need more practice</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-3">
        {weakTopics.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Great job! No weak topics identified yet.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Complete more practice tests to get personalized recommendations.
            </p>
          </div>
        ) : (
          <>
            {weakTopics.map((topic, index) => (
              <div 
                key={`${topic.subject_name}-${topic.topic_name}`}
                className="p-4 rounded-lg bg-muted/50 border-l-4 border-warning space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{topic.topic_name}</p>
                      <Badge className={getWeaknessColor(topic.weakness_score)}>
                        {Math.round(topic.weakness_score)}% accuracy
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{topic.subject_name}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissTopic(topic.topic_name)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => handlePractice(topic)}
                    size="sm" 
                    className="flex-1"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Practice {topic.recommended_count} Questions
                  </Button>
                </div>

                {index === 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    💡 Start here for maximum improvement!
                  </p>
                )}
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
};
