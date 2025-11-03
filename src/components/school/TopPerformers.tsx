import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";

interface TopPerformer {
  user_id: string;
  full_name: string;
  average_score: number;
  tests_completed: number;
}

export default function TopPerformers({ schoolId }: { schoolId: string }) {
  const [performers, setPerformers] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopPerformers();
  }, [schoolId]);

  const fetchTopPerformers = async () => {
    try {
      const { data: students } = await supabase
        .from("school_students")
        .select("user_id, full_name")
        .eq("school_id", schoolId);

      if (!students || students.length === 0) {
        setLoading(false);
        return;
      }

      const studentUserIds = students.map(s => s.user_id);

      const { data: attempts } = await supabase
        .from("attempts")
        .select("id, user_id")
        .in("user_id", studentUserIds)
        .eq("status", "SUBMITTED");

      if (!attempts || attempts.length === 0) {
        setLoading(false);
        return;
      }

      const attemptIds = attempts.map(a => a.id);

      const { data: results } = await supabase
        .from("results")
        .select("attempt_id, percentage")
        .in("attempt_id", attemptIds);

      // Calculate average scores per student
      const studentScores: Record<string, { scores: number[]; name: string }> = {};

      attempts.forEach(attempt => {
        const result = results?.find(r => r.attempt_id === attempt.id);
        const student = students.find(s => s.user_id === attempt.user_id);
        
        if (result && student && result.percentage != null) {
          if (!studentScores[attempt.user_id]) {
            studentScores[attempt.user_id] = { scores: [], name: student.full_name };
          }
          studentScores[attempt.user_id].scores.push(result.percentage);
        }
      });

      const topPerformers: TopPerformer[] = Object.entries(studentScores)
        .map(([user_id, data]) => ({
          user_id,
          full_name: data.name,
          average_score: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
          tests_completed: data.scores.length
        }))
        .sort((a, b) => b.average_score - a.average_score)
        .slice(0, 5);

      setPerformers(topPerformers);
    } catch (error) {
      console.error("Error fetching top performers:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-4 w-4 text-amber-500" />;
    if (index === 1) return <Medal className="h-4 w-4 text-gray-400" />;
    if (index === 2) return <Award className="h-4 w-4 text-amber-700" />;
    return null;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Top Performers
        </CardTitle>
        <CardDescription>Highest scoring students</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Loading leaderboard...</p>
          </div>
        ) : performers.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No performance data yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {performers.map((performer, index) => (
              <div
                key={performer.user_id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-center w-6">
                  {getRankIcon(index) || (
                    <span className="text-sm font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                  )}
                </div>

                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {getInitials(performer.full_name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {performer.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {performer.tests_completed} test{performer.tests_completed !== 1 ? 's' : ''}
                  </p>
                </div>

                <Badge
                  variant={index === 0 ? "default" : "secondary"}
                  className="font-semibold"
                >
                  {performer.average_score}%
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
