import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function SchoolVerificationPending() {
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);

  const resendVerification = async () => {
    try {
      setSending(true);
      const pendingRaw = localStorage.getItem("pendingSchoolRegistration");
      const pending = pendingRaw ? JSON.parse(pendingRaw) : null;
      const email = pending?.schoolEmail;

      if (!email) {
        toast.error("We couldn't find your registration email. Please register again.");
        navigate("/school-registration");
        return;
      }

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/school-subscription`,
        },
      } as any);

      if (error) throw error;

      toast.success("Verification email resent. Please check your inbox.");
    } catch (e: any) {
      console.error("Resend verification failed", e);
      toast.error(e.message || "Failed to resend verification email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <Mail className="h-16 w-16 mx-auto mb-4 text-primary" />
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification email to your school email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-center text-muted-foreground">
            Please check your inbox and click the verification link to activate your school account.
            Once verified, you'll be redirected to complete your subscription.
          </p>
          <Button onClick={resendVerification} disabled={sending} className="w-full">
            {sending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resending...</>) : "Resend verification email"}
          </Button>
          <Button onClick={() => navigate("/auth")} variant="outline" className="w-full">
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}