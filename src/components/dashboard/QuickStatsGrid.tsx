import { Target, TrendingUp, Clock, Trophy, Zap, Award } from "lucide-react";
import { ProgressRing } from "./ProgressRing";

interface Stats {
  testsTaken: number;
  averageScore: number;
  studyHours: number;
  rank: number;
  totalStudents: number;
}

interface QuickStatsGridProps {
  stats: Stats;
  loading: boolean;
}

export const QuickStatsGrid = ({ stats, loading }: QuickStatsGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
            <div className="h-12 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {/* Tests Taken */}
      <div className="bg-card rounded-2xl p-4 border border-border hover:shadow-lg transition-all hover:-translate-y-1 group">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.testsTaken}</div>
            <div className="text-xs text-muted-foreground mt-1">Tests Taken</div>
          </div>
        </div>
      </div>

      {/* Average Score with Progress Ring */}
      <div className="bg-card rounded-2xl p-4 border border-border hover:shadow-lg transition-all hover:-translate-y-1 group">
        <div className="flex flex-col items-center text-center gap-2">
          <ProgressRing progress={stats.averageScore} size={80} strokeWidth={6}>
            <div className="text-center">
              <div className="text-xl font-bold text-success">{stats.averageScore}%</div>
            </div>
          </ProgressRing>
          <div className="text-xs text-muted-foreground">Avg Score</div>
        </div>
      </div>

      {/* Study Hours */}
      <div className="bg-card rounded-2xl p-4 border border-border hover:shadow-lg transition-all hover:-translate-y-1 group">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-3 bg-info/10 rounded-xl group-hover:scale-110 transition-transform">
            <Clock className="h-6 w-6 text-info" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.studyHours}h</div>
            <div className="text-xs text-muted-foreground mt-1">Study Time</div>
          </div>
        </div>
      </div>

      {/* Rank */}
      <div className="bg-card rounded-2xl p-4 border border-border hover:shadow-lg transition-all hover:-translate-y-1 group">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-3 bg-warning/10 rounded-xl group-hover:scale-110 transition-transform">
            <Trophy className="h-6 w-6 text-warning" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {stats.rank > 0 ? `#${stats.rank}` : "-"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.totalStudents > 0 ? `of ${stats.totalStudents}` : "Your Rank"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
