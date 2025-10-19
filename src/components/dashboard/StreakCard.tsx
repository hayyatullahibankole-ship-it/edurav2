import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Calendar, TrendingUp } from "lucide-react";
import { useStreaks } from "@/hooks/useStreaks";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

export const StreakCard = () => {
  const { streakData, loading, updateStreak } = useStreaks();

  useEffect(() => {
    // Update streak when component mounts (when user practices)
    if (!loading && streakData) {
      updateStreak();
    }
  }, []);

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const currentStreak = streakData?.current_streak || 0;
  const longestStreak = streakData?.longest_streak || 0;
  const totalDays = streakData?.total_practice_days || 0;

  const getStreakEmoji = (streak: number) => {
    if (streak >= 100) return "🔥🔥🔥";
    if (streak >= 30) return "🔥🔥";
    if (streak >= 7) return "🔥";
    return "⭐";
  };

  const getNextMilestone = () => {
    const milestones = [7, 14, 30, 60, 100, 365];
    return milestones.find(m => m > currentStreak) || 365;
  };

  const nextMilestone = getNextMilestone();
  const milestoneProgress = (currentStreak / nextMilestone) * 100;

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 via-warning/10 to-destructive/10 overflow-hidden hover-lift animate-fade-in">
      <div className="absolute top-0 right-0 w-32 h-32 bg-warning/10 rounded-full blur-3xl" />
      
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Daily Streak</CardTitle>
            <CardDescription>Keep the momentum going!</CardDescription>
          </div>
          <div className="text-4xl animate-pulse">
            {getStreakEmoji(currentStreak)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Current Streak */}
        <div className="text-center p-4 bg-gradient-to-r from-primary to-warning rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame className="h-8 w-8" />
            <div className="text-5xl font-bold">{currentStreak}</div>
          </div>
          <p className="text-sm font-semibold">Day Streak</p>
          {currentStreak > 0 && (
            <p className="text-xs opacity-90 mt-1">
              Don't break it! Practice today to continue
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <Trophy className="h-5 w-5 mx-auto text-warning mb-1" />
            <div className="text-2xl font-bold">{longestStreak}</div>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
          
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <Calendar className="h-5 w-5 mx-auto text-info mb-1" />
            <div className="text-2xl font-bold">{totalDays}</div>
            <p className="text-xs text-muted-foreground">Total Days</p>
          </div>
        </div>

        {/* Next Milestone */}
        {currentStreak < nextMilestone && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Next milestone</span>
              <Badge className="bg-primary/20 text-primary">
                <TrendingUp className="h-3 w-3 mr-1" />
                {nextMilestone} days
              </Badge>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-warning transition-all duration-500"
                style={{ width: `${Math.min(milestoneProgress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {nextMilestone - currentStreak} more days to go!
            </p>
          </div>
        )}

        {/* Milestones Achieved */}
        {streakData?.streak_milestones && streakData.streak_milestones.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs font-semibold mb-2">🏆 Milestones Achieved</p>
            <div className="flex flex-wrap gap-1">
              {streakData.streak_milestones.map((milestone: any, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {milestone.days} days
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
