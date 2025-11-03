import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function SchoolVerificationPending() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="max-w-md">
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
          <Button onClick={() => navigate("/auth")} variant="outline" className="w-full">
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}