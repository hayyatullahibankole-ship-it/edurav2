import { useState, useEffect, Component, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, Award, Users } from "lucide-react";

interface Props {
  schoolId: string;
}

interface PerformanceData {
  passed: number;
  failed: number;
  totalTests: number;
  averageScore: number;
  studentPerformance: Array<{
    name: string;
    score: number;
    tests: number;
  }>;
}

class ChartErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.error("Chart render error:", error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Unable to render chart</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function SchoolOverviewCharts({ schoolId }: Props) {
  const [data, setData] = useState<PerformanceData>({
    passed: 0,
    failed: 0,
    totalTests: 0,
    averageScore: 0,
    studentPerformance: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, [schoolId]);

  const fetchPerformanceData = async () => {
    try {
      // Get all students
      const { data: students, error: studentsError } = await supabase
        .from("school_students")
        .select("id, full_name, user_id")
        .eq("school_id", schoolId);

      if (studentsError) throw studentsError;

      if (!students || students.length === 0) {
        setLoading(false);
        return;
      }

      const studentUserIds = students.map(s => s.user_id);

      // Get all submitted attempts
      const { data: attempts, error: attemptsError } = await supabase
        .from("attempts")
        .select("id, user_id")
        .in("user_id", studentUserIds)
        .eq("status", "SUBMITTED");

      if (attemptsError) throw attemptsError;

      if (!attempts || attempts.length === 0) {
        setLoading(false);
        return;
      }

      // Get results for all attempts
      const attemptIds = attempts.map(a => a.id);
      const { data: results, error: resultsError } = await supabase
        .from("results")
        .select("attempt_id, percentage")
        .in("attempt_id", attemptIds);

      if (resultsError) throw resultsError;

      // Normalize and filter results to ensure numeric percentages
      const numericResults = (results || []).map(r => ({
        ...r,
        percentage: Number(r.percentage)
      }));

      const validResults = numericResults.filter(r => Number.isFinite(r.percentage));

      // Calculate pass/fail (pass threshold: 50%)
      const passThreshold = 50;
      let passed = 0;
      let failed = 0;
      let totalScore = 0;

      validResults.forEach(result => {
        if (result.percentage >= passThreshold) {
          passed++;
        } else {
          failed++;
        }
        totalScore += result.percentage;
      });

      const totalTests = validResults.length;
      const averageScore = totalTests > 0 ? totalScore / totalTests : 0;

      // Calculate per-student performance
      const studentPerformance = students.map(student => {
        const studentAttempts = attempts.filter(a => a.user_id === student.user_id);
        const studentResults = validResults.filter(r => 
          studentAttempts.some(a => a.id === r.attempt_id)
        );
        
        const avgScore = studentResults.length > 0
          ? studentResults.reduce((sum, r) => sum + (r.percentage || 0), 0) / studentResults.length
          : 0;

        return {
          name: (student.full_name?.split(' ')[0] || student.full_name || 'Student'), // First name or fallback
          score: Math.round(avgScore),
          tests: studentResults.length
        };
      }).filter(s => s.tests > 0) // Only include students with tests
        .sort((a, b) => b.score - a.score) // Sort by score descending
        .slice(0, 10); // Top 10 students

      setData({
        passed,
        failed,
        totalTests,
        averageScore,
        studentPerformance
      });
    } catch (error) {
      console.error("Error fetching performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: "Passed (≥50%)", value: data.passed || 0, color: "#10b981" },
    { name: "Failed (<50%)", value: data.failed || 0, color: "#ef4444" }
  ].filter(item => !isNaN(item.value) && item.value >= 0);

const COLORS = ["#10b981", "#ef4444"];

// Ensure student performance data has valid scores
const validStudentPerformance = data.studentPerformance.filter(s => 
  !isNaN(s.score) && s.score >= 0 && s.score <= 100
);

// Total count used to safely render the pie chart
const totalPie = pieData.reduce((sum, item) => sum + (Number(item.value) || 0), 0);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">Loading charts...</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">Loading charts...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (data.totalTests === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Analytics
          </CardTitle>
          <CardDescription>No test data available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Students haven't taken any tests yet</p>
            <p className="text-sm text-muted-foreground mt-2">Charts will appear here once students complete tests</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-semibold mb-1">Performance Analytics</h2>
        <p className="text-sm text-muted-foreground">Overview of student test results and performance</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Total Tests Taken</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{data.totalTests}</div>
            <p className="text-xs text-muted-foreground mt-2">Completed assessments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Average Score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {isNaN(data.averageScore) ? "0.0" : data.averageScore.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">Overall performance</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Pass Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {data.totalTests > 0 && !isNaN(data.passed) ? ((data.passed / data.totalTests) * 100).toFixed(1) : "0.0"}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">Students passing (≥50%)</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pie Chart - Pass/Fail Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Success Rate</CardTitle>
            <CardDescription>Distribution of passing vs failing tests</CardDescription>
          </CardHeader>
          <CardContent>
            {totalPie > 0 ? (
              <ChartErrorBoundary>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => {
                        const pct = Number.isFinite(percent) ? (percent * 100).toFixed(0) : "0";
                        return `${name}: ${value} (${pct}%)`;
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value} tests`, "Count"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartErrorBoundary>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No test results yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - Top Students */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top Performers</CardTitle>
            <CardDescription>Average scores by student (Top 10)</CardDescription>
          </CardHeader>
          <CardContent>
            {validStudentPerformance.length > 0 ? (
              <ChartErrorBoundary>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={validStudentPerformance} layout="horizontal">
                    <XAxis type="number" domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={80} />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === "score") return [`${value}%`, "Avg Score"];
                        return [value, name];
                      }}
                    />
                    <Bar dataKey="score" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartErrorBoundary>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No student performance data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
