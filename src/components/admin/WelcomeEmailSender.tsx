import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Send, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function WelcomeEmailSender() {
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0 });

  const sendWelcomeEmails = async () => {
    setSending(true);
    setProgress(0);
    setStats({ total: 0, sent: 0, failed: 0 });

    try {
      // Fetch all users
      const { data: users, error: fetchError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .not('email', 'is', null);

      if (fetchError) throw fetchError;
      if (!users || users.length === 0) {
        toast.error("No users found to send emails to");
        setSending(false);
        return;
      }

      setStats({ total: users.length, sent: 0, failed: 0 });
      let sent = 0;
      let failed = 0;

      // Send emails with rate limiting
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        
        try {
          const { error } = await supabase.functions.invoke('send-welcome-email', {
            body: {
              userId: user.id,
              email: user.email,
              firstName: user.first_name || '',
              lastName: user.last_name || ''
            }
          });

          if (error) {
            console.error(`Failed to send email to ${user.email}:`, error);
            failed++;
          } else {
            sent++;
          }
        } catch (error) {
          console.error(`Error sending email to ${user.email}:`, error);
          failed++;
        }

        // Update progress
        const currentProgress = ((i + 1) / users.length) * 100;
        setProgress(currentProgress);
        setStats({ total: users.length, sent, failed });

        // Rate limiting: wait 100ms between emails
        if (i < users.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      toast.success(`Welcome emails sent! ${sent} successful, ${failed} failed`);
    } catch (error: any) {
      console.error("Error sending welcome emails:", error);
      toast.error(`Failed to send welcome emails: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <CardTitle>Welcome Email Campaign</CardTitle>
        </div>
        <CardDescription>
          Send a beautiful welcome email to all Edura users (students, schools, and admins)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sending && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Sending emails...</span>
              <span>{stats.sent + stats.failed} / {stats.total}</span>
            </div>
            <Progress value={progress} />
            <div className="flex gap-4 text-sm">
              <span className="text-green-600">Sent: {stats.sent}</span>
              <span className="text-red-600">Failed: {stats.failed}</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={sendWelcomeEmails}
            disabled={sending}
            className="gap-2"
          >
            {sending ? (
              <>
                <Send className="h-4 w-4 animate-pulse" />
                Sending...
              </>
            ) : (
              <>
                <Users className="h-4 w-4" />
                Send Welcome Email to All Users
              </>
            )}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground border-t pt-4">
          <p className="font-medium mb-2">Email includes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Personalized greeting with user's name</li>
            <li>Welcome message to Edura platform</li>
            <li>Quick start guide and features overview</li>
            <li>Direct link to dashboard</li>
            <li>Support and contact information</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
