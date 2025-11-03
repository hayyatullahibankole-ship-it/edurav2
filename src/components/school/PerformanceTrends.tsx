import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendData {
  date: string;
  average_score: number;
  tests_taken: number;
}

export default function PerformanceTrends({ schoolId }: { schoolId: string }) {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [trendPercentage, setTrendPercentage] = useState(0);

  useEffect(() => {
    fetchTrendData();
  }, [schoolId]);

  const fetchTrendData = async () => {
    try {
      const { data: students } = await supabase
        .from("school_students")
        .select("user_id")
        .eq("school_id", schoolId);

      if (!students || students.length === 0) {
        setLoading(false);
        return;
      }

      const studentUserIds = students.map(s => s.user_id);

      // Get attempts from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: attempts } = await supabase
        .from("attempts")
        .select("id, submitted_at")
        .in("user_id", studentUserIds)
        .eq("status", "SUBMITTED")
        .gte("submitted_at", thirtyDaysAgo.toISOString());

      if (!attempts || attempts.length === 0) {
        setLoading(false);
        return;
      }

      const attemptIds = attempts.map(a => a.id);

      const { data: results } = await supabase
        .from("results")
        .select("attempt_id, percentage")
        .in("attempt_id", attemptIds);

      // Group by week
      const weeklyData: Record<string, { scores: number[]; count: number }> = {};

      attempts.forEach(attempt => {
        const result = results?.find(r => r.attempt_id === attempt.id);
        if (result && result.percentage != null) {
          const date = new Date(attempt.submitted_at);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekKey = weekStart.toISOString().split('T')[0];

          if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = { scores: [], count: 0 };
          }
          weeklyData[weekKey].scores.push(result.percentage);
          weeklyData[weekKey].count++;
        }
      });

      const trends: TrendData[] = Object.entries(weeklyData)
        .map(([date, data]) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          average_score: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
          tests_taken: data.count
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-6);

      setTrendData(trends);

      // Calculate trend
      if (trends.length >= 2) {
        const recent = trends.slice(-2);
        const diff = recent[1].average_score - recent[0].average_score;
        const percentage = Math.abs((diff / recent[0].average_score) * 100);
        
        setTrendPercentage(Math.round(percentage));
        if (diff > 2) setTrend('up');
        else if (diff < -2) setTrend('down');
        else setTrend('stable');
      }
    } catch (error) {
      console.error("Error fetching trend data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Performance Trends</CardTitle>
            <CardDescription>Average scores over the last 6 weeks</CardDescription>
          </div>
          {trendData.length >= 2 && (
            <div className={`flex items-center gap-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-sm font-medium">{trendPercentage}%</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading trends...</p>
          </div>
        ) : trendData.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Not enough data yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Trends will appear after students complete tests
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line 
                type="monotone" 
                dataKey="average_score" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Avg Score (%)"
                dot={{ fill: 'hsl(var(--primary))' }}
              />
              <Line 
                type="monotone" 
                dataKey="tests_taken" 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth={2}
                name="Tests Taken"
                dot={{ fill: 'hsl(var(--muted-foreground))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
