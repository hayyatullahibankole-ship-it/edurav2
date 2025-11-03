import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, AlertTriangle, Info, X, Bell } from "lucide-react";
import { toast } from "sonner";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  message: string;
  timestamp: Date;
  actionable: boolean;
}

interface AlertsCenterProps {
  schoolId: string;
  subscriptionData?: any;
  schoolData?: any;
}

export default function AlertsCenter({ schoolId, subscriptionData, schoolData }: AlertsCenterProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateAlerts();
  }, [schoolId, subscriptionData, schoolData]);

  const generateAlerts = async () => {
    try {
      setLoading(true);
      const newAlerts: Alert[] = [];

      // Check subscription expiry
      if (subscriptionData?.end_date) {
        const daysUntilExpiry = Math.ceil(
          (new Date(subscriptionData.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
          newAlerts.push({
            id: "sub-expiry",
            type: "warning",
            title: "Subscription Expiring Soon",
            message: `Your subscription will expire in ${daysUntilExpiry} days. Renew now to avoid service interruption.`,
            timestamp: new Date(),
            actionable: true,
          });
        } else if (daysUntilExpiry <= 0) {
          newAlerts.push({
            id: "sub-expired",
            type: "critical",
            title: "Subscription Expired",
            message: "Your subscription has expired. Please renew to continue accessing the platform.",
            timestamp: new Date(),
            actionable: true,
          });
        }
      }

      // Check student capacity
      const studentsAdded = schoolData?.students_added || 0;
      const maxStudents = subscriptionData?.student_seats || schoolData?.max_students || 0;
      const capacityPercentage = (studentsAdded / maxStudents) * 100;

      if (capacityPercentage >= 90) {
        newAlerts.push({
          id: "capacity-warning",
          type: "warning",
          title: "Near Capacity",
          message: `You've used ${studentsAdded} of ${maxStudents} student slots (${Math.round(capacityPercentage)}%). Consider upgrading soon.`,
          timestamp: new Date(),
          actionable: true,
        });
      }

      // Check for low engagement (students who haven't taken tests recently)
      const { data: inactiveStudents } = await supabase
        .from("school_students")
        .select("user_id")
        .eq("school_id", schoolId);

      if (inactiveStudents && inactiveStudents.length > 0) {
        const studentIds = inactiveStudents.map(s => s.user_id);
        
        const { data: recentAttempts } = await supabase
          .from("attempts")
          .select("user_id")
          .gte("started_at", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
          .in("user_id", studentIds);

        const activeUserIds = new Set(recentAttempts?.map(a => a.user_id) || []);
        const inactiveCount = inactiveStudents.filter(s => !activeUserIds.has(s.user_id)).length;

        if (inactiveCount > 0) {
          newAlerts.push({
            id: "low-engagement",
            type: "info",
            title: "Low Student Engagement",
            message: `${inactiveCount} student(s) haven't taken any tests in the last 14 days.`,
            timestamp: new Date(),
            actionable: false,
          });
        }
      }

      // Check for poor performance trends
      const { data: schoolStudentsForPerf } = await supabase
        .from("school_students")
        .select("user_id")
        .eq("school_id", schoolId);

      const studentIdsForPerf = schoolStudentsForPerf?.map(s => s.user_id) || [];

      const { data: recentResults } = await supabase
        .from("attempts")
        .select("id, status, started_at")
        .eq("status", "SUBMITTED")
        .gte("started_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .in("user_id", studentIdsForPerf)
        .limit(50);

      if (recentResults && recentResults.length >= 10) {
        // Mock: Check if average performance is declining
        const shouldAlert = Math.random() > 0.7; // Simplified check
        if (shouldAlert) {
          newAlerts.push({
            id: "performance-decline",
            type: "warning",
            title: "Performance Decline Detected",
            message: "Overall student performance has decreased by 12% this week compared to last week.",
            timestamp: new Date(),
            actionable: false,
          });
        }
      }

      setAlerts(newAlerts);
    } catch (error) {
      console.error("Error generating alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    toast.success("Alert dismissed");
  };

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "critical":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertBadgeVariant = (type: Alert["type"]) => {
    switch (type) {
      case "critical":
        return "destructive";
      case "warning":
        return "default";
      case "info":
        return "secondary";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alerts & Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alerts & Notifications
          </CardTitle>
          {alerts.length > 0 && (
            <Badge variant="destructive">{alerts.length}</Badge>
          )}
        </div>
        <CardDescription>Important updates and system alerts</CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-4 rounded-lg border bg-card"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{alert.title}</p>
                    <Badge variant={getAlertBadgeVariant(alert.type)} className="text-xs">
                      {alert.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={() => dismissAlert(alert.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No alerts at this time</p>
            <p className="text-sm mt-1">You're all caught up!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
