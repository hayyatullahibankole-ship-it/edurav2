import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX, AlertTriangle } from "lucide-react";

interface EngagementMetrics {
  total_students: number;
  active_students: number;
  inactive_students: number;
  at_risk_students: number;
}

export default function StudentEngagement({ schoolId }: { schoolId: string }) {
  const [metrics, setMetrics] = useState<EngagementMetrics>({
    total_students: 0,
    active_students: 0,
    inactive_students: 0,
    at_risk_students: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEngagementMetrics();
  }, [schoolId]);

  const fetchEngagementMetrics = async () => {
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

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentAttempts } = await supabase
        .from("attempts")
        .select("user_id")
        .in("user_id", studentUserIds)
        .gte("created_at", sevenDaysAgo.toISOString());

      // Get students with no activity in 14 days
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const { data: oldAttempts } = await supabase
        .from("attempts")
        .select("user_id")
        .in("user_id", studentUserIds)
        .lt("created_at", fourteenDaysAgo.toISOString());

      const activeUserIds = new Set(recentAttempts?.map(a => a.user_id) || []);
      const atRiskUserIds = studentUserIds.filter(id => {
        const hasOldActivity = oldAttempts?.some(a => a.user_id === id);
        const hasRecentActivity = activeUserIds.has(id);
        return hasOldActivity && !hasRecentActivity;
      });

      setMetrics({
        total_students: students.length,
        active_students: activeUserIds.size,
        inactive_students: students.length - activeUserIds.size,
        at_risk_students: atRiskUserIds.length
      });
    } catch (error) {
      console.error("Error fetching engagement metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const engagementRate = metrics.total_students > 0 
    ? Math.round((metrics.active_students / metrics.total_students) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Student Engagement
        </CardTitle>
        <CardDescription>Activity in the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Loading metrics...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Engagement Rate */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Engagement Rate</span>
                <Badge variant="default">{engagementRate}%</Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${engagementRate}%` }}
                />
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border bg-green-50 border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <UserCheck className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-muted-foreground">Active</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {metrics.active_students}
                </p>
              </div>

              <div className="p-3 rounded-lg border bg-gray-50 border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <UserX className="h-4 w-4 text-gray-600" />
                  <span className="text-xs text-muted-foreground">Inactive</span>
                </div>
                <p className="text-2xl font-bold text-gray-600">
                  {metrics.inactive_students}
                </p>
              </div>
            </div>

            {/* At Risk Alert */}
            {metrics.at_risk_students > 0 && (
              <div className="p-3 rounded-lg border bg-amber-50 border-amber-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900">
                      {metrics.at_risk_students} student{metrics.at_risk_students > 1 ? 's' : ''} at risk
                    </p>
                    <p className="text-xs text-amber-700">
                      No activity in the last 14 days
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
