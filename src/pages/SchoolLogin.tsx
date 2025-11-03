import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Loader2, School, Mail, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function SchoolLogin() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast: toastHook } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<any>({});
  const [lastErrorCode, setLastErrorCode] = useState<string | null>(null);
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect
  if (!authLoading && user) {
    navigate("/school-dashboard", { replace: true });
    return null;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      loginSchema.parse(formData);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: any = {};
        error.errors.forEach((err) => {
          if (err.path[0]) fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      }
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      if (data.user) {
        // Check for pending school registration
        const pendingRegistration = localStorage.getItem('pendingSchoolRegistration');
        
        if (pendingRegistration) {
          try {
            const schoolData = JSON.parse(pendingRegistration);
            
            // Call edge function to create school
            const { data: schoolResult, error: schoolError } = await supabase.functions.invoke(
              'create-school-from-pending',
              { body: { schoolData } }
            );
            
            if (schoolError) {
              console.error("School creation error:", schoolError);
              toast.error("Failed to create school record. Please contact support.");
            } else {
              // Clear pending registration
              localStorage.removeItem('pendingSchoolRegistration');
              toast.success("School account created successfully!");
            }
          } catch (err) {
            console.error("Error processing pending registration:", err);
          }
        } else {
          toast.success("Login successful!");
        }
        
        navigate("/school-dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const code = error?.code || null;
      setLastErrorCode(code);
      setLastErrorMessage(error?.message || null);
      if (code === "email_not_confirmed") {
        toastHook({
          variant: "destructive",
          title: "Email not confirmed",
          description: "Please check your inbox or resend the verification email below.",
        });
      } else {
        toastHook({
          variant: "destructive",
          title: "Login failed",
          description: error?.message || "Invalid credentials",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      toastHook({
        variant: "destructive",
        title: "Enter your email",
        description: "Provide the school email and try again.",
      });
      return;
    }
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email: formData.email });
      if (error) throw error;
      toast.success("Verification email sent");
    } catch (err: any) {
      toastHook({
        variant: "destructive",
        title: "Couldn't send verification email",
        description: err?.message || "Please try again later.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <School className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-2">School Login</h1>
          <p className="text-muted-foreground">
            Sign in to manage your school's CBT platform
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Enter your credentials to access your school dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">School Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="admin@school.edu.ng"
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    className="pl-10"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Enter your password"
                  />
                </div>
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              {lastErrorCode === 'email_not_confirmed' && (
                <div className="text-center text-sm text-muted-foreground">
                  Email not confirmed. {""}
                  <Button variant="link" type="button" onClick={handleResendVerification}>
                    Resend verification email
                  </Button>
                </div>
              )}

              <div className="text-center text-sm text-muted-foreground">
                Don't have a school account? {""}
                <Link to="/school-registration" className="text-primary hover:underline">
                  Register here
                </Link>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <Link to="/auth" className="text-primary hover:underline">
                  Login as student instead
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
