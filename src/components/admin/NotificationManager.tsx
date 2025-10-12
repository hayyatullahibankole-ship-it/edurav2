import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell, Send, Users, User, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function NotificationManager() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [recipientType, setRecipientType] = useState<'all' | 'specific'>('all');
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning',
  });

  useEffect(() => {
    fetchUsers();
    fetchRecentNotifications();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.rpc('get_users_masked');
    
    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    setUsers(data || []);
  };

  const fetchRecentNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        users(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching notifications:', error);
      return;
    }

    setRecentNotifications(data || []);
  };

  const handleSendNotification = async () => {
    if (!notification.title || !notification.message) {
      toast({
        title: "Validation Error",
        description: "Please fill in title and message",
        variant: "destructive",
      });
      return;
    }

    const targetUsers = recipientType === 'all' 
      ? users.map(u => u.id) 
      : selectedUsers;

    if (targetUsers.length === 0) {
      toast({
        title: "No Recipients",
        description: "Please select at least one user",
        variant: "destructive",
      });
      return;
    }

    try {
      const notifications = targetUsers.map(userId => ({
        user_id: userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        is_read: false,
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Notification sent to ${targetUsers.length} user(s)`,
      });

      // Reset form
      setNotification({ title: '', message: '', type: 'info' });
      setSelectedUsers([]);
      fetchRecentNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Notification deleted",
    });
    fetchRecentNotifications();
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Send Notification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Notification
            </CardTitle>
            <CardDescription>
              Send notifications to students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Recipients</Label>
              <Select
                value={recipientType}
                onValueChange={(value: 'all' | 'specific') => setRecipientType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      All Users ({users.length})
                    </div>
                  </SelectItem>
                  <SelectItem value="specific">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Specific Users
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {recipientType === 'specific' && (
              <div className="space-y-2">
                <Label>Select Users</Label>
                <ScrollArea className="h-40 border rounded-md p-2">
                  <div className="space-y-1">
                    {users.map(user => (
                      <div
                        key={user.id}
                        className={`p-2 rounded cursor-pointer hover:bg-muted ${
                          selectedUsers.includes(user.id) ? 'bg-primary/10' : ''
                        }`}
                        onClick={() => toggleUserSelection(user.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            {user.first_name} {user.last_name}
                          </span>
                          {selectedUsers.includes(user.id) && (
                            <Badge variant="secondary" className="text-xs">Selected</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <p className="text-xs text-muted-foreground">
                  {selectedUsers.length} user(s) selected
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={notification.type}
                onValueChange={(value: any) => setNotification(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">📢 Info</SelectItem>
                  <SelectItem value="success">✅ Success</SelectItem>
                  <SelectItem value="warning">⚠️ Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Notification title"
                value={notification.title}
                onChange={(e) => setNotification(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="Notification message"
                value={notification.message}
                onChange={(e) => setNotification(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
              />
            </div>

            <Button onClick={handleSendNotification} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notifications
            </CardTitle>
            <CardDescription>
              Last 10 notifications sent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {recentNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No notifications sent yet</p>
                  </div>
                ) : (
                  recentNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {notif.type}
                            </Badge>
                            <h4 className="font-medium text-sm">{notif.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>
                              To: {notif.users?.first_name} {notif.users?.last_name}
                            </span>
                            <span>•</span>
                            <span>
                              {formatDistanceToNow(new Date(notif.created_at), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteNotification(notif.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
