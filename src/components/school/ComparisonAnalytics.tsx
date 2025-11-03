import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users } from "lucide-react";

interface ComparisonAnalyticsProps {
  schoolId: string;
}

export default function ComparisonAnalytics({ schoolId }: ComparisonAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [comparisonType, setComparisonType] = useState("time");
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  useEffect(() => {
    fetchComparisonData();
  }, [schoolId, comparisonType]);

  const fetchComparisonData = async () => {
    try {
      setLoading(true);

      if (comparisonType === "time") {
        // Compare last 4 weeks
        const weeks = [];
        for (let i = 3; i >= 0; i--) {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() - (i * 7));
          const startDate = new Date(endDate);
          startDate.setDate(startDate.getDate() - 7);

          // Get student IDs first
          const { data: schoolStudents } = await supabase
            .from("school_students")
            .select("user_id")
            .eq("school_id", schoolId);

          const studentIds = schoolStudents?.map(s => s.user_id) || [];

          const { data: attempts } = await supabase
            .from("attempts")
            .select(`
              id,
              status,
              started_at,
              submitted_at,
              user_id
            `)
            .gte("started_at", startDate.toISOString())
            .lte("started_at", endDate.toISOString())
            .in("user_id", studentIds);

          const completedAttempts = attempts?.filter(a => a.status === "SUBMITTED") || [];
          const avgScore = completedAttempts.length > 0
            ? completedAttempts.reduce((sum, a) => sum + (calculateScore(a) || 0), 0) / completedAttempts.length
            : 0;

          weeks.push({
            name: `Week ${4 - i}`,
            tests: completedAttempts.length,
            avgScore: Math.round(avgScore),
            students: new Set(attempts?.map(a => a.user_id) || []).size
          });
        }
        setComparisonData(weeks);
      }
    } catch (error) {
      console.error("Error fetching comparison data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = (attempt: any) => {
    // Simplified score calculation
    return Math.floor(Math.random() * 40) + 60; // Mock data for now
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparison Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Comparison Analytics</CardTitle>
            <CardDescription>Compare performance across different periods</CardDescription>
          </div>
          <Select value={comparisonType} onValueChange={setComparisonType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">Time Periods</SelectItem>
              <SelectItem value="cohorts">Student Cohorts</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {comparisonData.length > 0 ? (
          <div className="space-y-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
                <Bar dataKey="avgScore" fill="hsl(var(--primary))" name="Avg Score (%)" />
                <Bar dataKey="tests" fill="hsl(var(--chart-2))" name="Tests Taken" />
              </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Performance Trend</p>
                  <p className="text-lg font-semibold">
                    {comparisonData[comparisonData.length - 1]?.avgScore > comparisonData[0]?.avgScore
                      ? "↑ Improving"
                      : "→ Stable"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Users className="h-8 w-8 text-chart-2" />
                <div>
                  <p className="text-xs text-muted-foreground">Active Students</p>
                  <p className="text-lg font-semibold">
                    {comparisonData[comparisonData.length - 1]?.students || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No comparison data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
