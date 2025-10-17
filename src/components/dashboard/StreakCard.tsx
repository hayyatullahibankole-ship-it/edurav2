import { Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StreakCardProps {
  currentStreak: number;
  bestStreak: number;
}

export const StreakCard = ({ currentStreak, bestStreak }: StreakCardProps) => {
  return (
    <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 overflow-hidden">
      <CardContent className="p-6 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-5 w-5" />
            <span className="text-sm font-medium opacity-90">Study Streak</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{currentStreak}</span>
            <span className="text-lg opacity-75">days</span>
          </div>
          <p className="text-xs opacity-75 mt-2">Best: {bestStreak} days 🏆</p>
        </div>
      </CardContent>
    </Card>
  );
};
