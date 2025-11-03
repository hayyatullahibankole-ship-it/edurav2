import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, UserCheck, FileCheck, Trophy, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: 'login' | 'test_submitted' | 'test_completed' | 'achievement';
  student_name: string;
  timestamp: string;
  details?: string;
}

export default function RealtimeActivityFeed({ schoolId }: { schoolId: string }) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivities();
    subscribeToActivities();
  }, [schoolId]);

  const fetchRecentActivities = async () => {
    try {
      // Fetch recent student activities
      const { data: students } = await supabase
        .from("school_students")
        .select("user_id, full_name")
        .eq("school_id", schoolId);

      if (!students) return;

      const studentUserIds = students.map(s => s.user_id);

      // Get recent attempts
      const { data: attempts } = await supabase
        .from("attempts")
        .select("id, user_id, status, created_at, submitted_at")
        .in("user_id", studentUserIds)
        .order("created_at", { ascending: false })
        .limit(10);

      const recentActivities: ActivityItem[] = [];

      attempts?.forEach(attempt => {
        const student = students.find(s => s.user_id === attempt.user_id);
        if (student) {
          if (attempt.status === 'SUBMITTED') {
            recentActivities.push({
              id: attempt.id,
              type: 'test_submitted',
              student_name: student.full_name,
              timestamp: attempt.submitted_at || attempt.created_at,
              details: 'Completed a test'
            });
          }
        }
      });

      setActivities(recentActivities.slice(0, 8));
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToActivities = () => {
    const channel = supabase
      .channel(`school_activities_${schoolId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attempts',
        },
        () => {
          fetchRecentActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'login':
        return <UserCheck className="h-4 w-4 text-blue-500" />;
      case 'test_submitted':
        return <FileCheck className="h-4 w-4 text-green-500" />;
      case 'test_completed':
        return <Trophy className="h-4 w-4 text-purple-500" />;
      case 'achievement':
        return <Trophy className="h-4 w-4 text-amber-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'login':
        return 'bg-blue-50 border-blue-200';
      case 'test_submitted':
        return 'bg-green-50 border-green-200';
      case 'test_completed':
        return 'bg-purple-50 border-purple-200';
      case 'achievement':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading activities...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Live student activities</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`p-3 rounded-lg border ${getActivityColor(activity.type)} transition-all`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium break-words">
                        {activity.student_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.details}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
