import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Loader2, School, Mail, Phone, MapPin, User, Lock, CheckCircle } from "lucide-react";

const baseSchema = z.object({
  schoolName: z.string().min(3, "School name must be at least 3 characters").max(200),
  schoolEmail: z.string().email("Invalid email address"),
  schoolPhone: z.string().min(10, "Phone number must be at least 10 digits").max(15),
  schoolType: z.enum(["primary", "secondary", "tutorial_centre"]),
  schoolAddress: z.string().max(500).optional(),
  state: z.string().max(100).optional(),
  adminFullName: z.string().min(3, "Full name required").max(100),
  adminPosition: z.string().min(2, "Position required").max(100),
  adminPhone: z.string().min(10).max(15),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to terms"),
});

const schoolRegistrationSchema = baseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
);

export default function SchoolRegistration() {
  const navigate = useNavigate();
  const { toast: toastHook } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: "",
    schoolEmail: "",
    schoolPhone: "",
    schoolType: "secondary" as const,
    schoolAddress: "",
    state: "",
    adminFullName: "",
    adminPosition: "",
    adminPhone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<any>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep1 = () => {
    try {
      const step1Schema = z.object({
        schoolName: baseSchema.shape.schoolName,
        schoolEmail: baseSchema.shape.schoolEmail,
        schoolPhone: baseSchema.shape.schoolPhone,
        schoolType: baseSchema.shape.schoolType,
      });
      step1Schema.parse({
        schoolName: formData.schoolName,
        schoolEmail: formData.schoolEmail,
        schoolPhone: formData.schoolPhone,
        schoolType: formData.schoolType,
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: any = {};
        error.errors.forEach((err) => {
          if (err.path[0]) fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const validateStep2 = () => {
    try {
      schoolRegistrationSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: any = {};
        error.errors.forEach((err) => {
          if (err.path[0]) fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    setLoading(true);

    try {
      // Ensure no active session interferes with sign up
      try { await supabase.auth.signOut(); } catch {}

      // Create auth user with auto-confirm for schools (no email verification delay)
      const { data: signupData, error: authError } = await supabase.auth.signUp({
        email: formData.schoolEmail,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/school-subscription`,
          data: {
            first_name: formData.adminFullName.split(' ')[0],
            last_name: formData.adminFullName.split(' ').slice(1).join(' ') || formData.adminFullName,
            phone: formData.adminPhone,
            role: "school_admin",
          }
        }
      });

      if (authError) throw authError;

      // If user was created and session exists, proceed to login them immediately
      if (signupData.user && signupData.session) {
        // Store registration data for school creation
        localStorage.setItem(
          'pendingSchoolRegistration',
          JSON.stringify({
            schoolName: formData.schoolName,
            schoolEmail: formData.schoolEmail,
            schoolPhone: formData.schoolPhone,
            schoolAddress: formData.schoolAddress || null,
            state: formData.state || null,
            adminFullName: formData.adminFullName,
            adminPhone: formData.adminPhone,
          })
        );

        toast.success("Registration successful! Redirecting to subscription...");
        navigate("/school-subscription");
        return;
      }

      // If we reach here, email confirmation is required
      localStorage.setItem(
        'pendingSchoolRegistration',
        JSON.stringify({
          schoolName: formData.schoolName,
          schoolEmail: formData.schoolEmail,
          schoolPhone: formData.schoolPhone,
          schoolAddress: formData.schoolAddress || null,
          state: formData.state || null,
          adminFullName: formData.adminFullName,
          adminPhone: formData.adminPhone,
        })
      );

      toast.success("Registration successful! Please check your email to verify your account.");
      navigate("/school-verification-pending");

    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Display detailed error message
      const errorMessage = error?.message || "Failed to register school";
      
      toast.error(errorMessage, {
        duration: 6000,
        description: "Please check your email address and try again, or contact support."
      });
      
      toastHook({
        variant: "destructive",
        title: "Registration Failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <School className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-2">School Registration</h1>
          <p className="text-muted-foreground">
            Join Edura's CBT Platform and empower your students
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Already have an account?{" "}
            <a href="/school-login" className="text-primary hover:underline font-medium">
              Login here
            </a>
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 gap-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {step > 1 ? <CheckCircle className="h-5 w-5" /> : "1"}
            </div>
            <span className="font-medium">School Details</span>
          </div>
          <div className="h-px w-12 bg-border" />
          <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              2
            </div>
            <span className="font-medium">Admin Details</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 ? "School Information" : "Admin Information"}
            </CardTitle>
            <CardDescription>
              {step === 1 
                ? "Enter your school's basic information" 
                : "Create your admin account to manage the school"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {step === 1 ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="schoolName">School Name *</Label>
                    <div className="relative">
                      <School className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="schoolName"
                        className="pl-10"
                        value={formData.schoolName}
                        onChange={(e) => handleInputChange("schoolName", e.target.value)}
                        placeholder="e.g., Kings College Lagos"
                      />
                    </div>
                    {errors.schoolName && <p className="text-sm text-destructive mt-1">{errors.schoolName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="schoolEmail">School Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="schoolEmail"
                        type="email"
                        className="pl-10"
                        value={formData.schoolEmail}
                        onChange={(e) => handleInputChange("schoolEmail", e.target.value)}
                        placeholder="admin@school.edu.ng"
                      />
                    </div>
                    {errors.schoolEmail && <p className="text-sm text-destructive mt-1">{errors.schoolEmail}</p>}
                  </div>

                  <div>
                    <Label htmlFor="schoolPhone">School Phone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="schoolPhone"
                        type="tel"
                        className="pl-10"
                        value={formData.schoolPhone}
                        onChange={(e) => handleInputChange("schoolPhone", e.target.value)}
                        placeholder="08012345678"
                      />
                    </div>
                    {errors.schoolPhone && <p className="text-sm text-destructive mt-1">{errors.schoolPhone}</p>}
                  </div>

                  <div>
                    <Label htmlFor="schoolType">School Type *</Label>
                    <Select value={formData.schoolType} onValueChange={(value: any) => handleInputChange("schoolType", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary School</SelectItem>
                        <SelectItem value="secondary">Secondary School</SelectItem>
                        <SelectItem value="tutorial_centre">Tutorial Centre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="state">State</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="state"
                        className="pl-10"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        placeholder="e.g., Lagos"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="schoolAddress">School Address</Label>
                    <Textarea
                      id="schoolAddress"
                      value={formData.schoolAddress}
                      onChange={(e) => handleInputChange("schoolAddress", e.target.value)}
                      placeholder="Full address of the school"
                      rows={3}
                    />
                  </div>

                  <Button type="button" onClick={handleNext} className="w-full">
                    Next Step
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="adminFullName">Admin Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="adminFullName"
                        className="pl-10"
                        value={formData.adminFullName}
                        onChange={(e) => handleInputChange("adminFullName", e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    {errors.adminFullName && <p className="text-sm text-destructive mt-1">{errors.adminFullName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="adminPosition">Position/Role *</Label>
                    <Input
                      id="adminPosition"
                      value={formData.adminPosition}
                      onChange={(e) => handleInputChange("adminPosition", e.target.value)}
                      placeholder="e.g., Principal, IT Manager"
                    />
                    {errors.adminPosition && <p className="text-sm text-destructive mt-1">{errors.adminPosition}</p>}
                  </div>

                  <div>
                    <Label htmlFor="adminPhone">Admin Phone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="adminPhone"
                        type="tel"
                        className="pl-10"
                        value={formData.adminPhone}
                        onChange={(e) => handleInputChange("adminPhone", e.target.value)}
                        placeholder="08012345678"
                      />
                    </div>
                    {errors.adminPhone && <p className="text-sm text-destructive mt-1">{errors.adminPhone}</p>}
                  </div>

                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        className="pl-10"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        placeholder="Min. 8 characters"
                      />
                    </div>
                    {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        className="pl-10"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        placeholder="Re-enter password"
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>}
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                    />
                    <Label htmlFor="agreeToTerms" className="text-sm cursor-pointer">
                      I agree to Edura's Terms and Conditions *
                    </Label>
                  </div>
                  {errors.agreeToTerms && <p className="text-sm text-destructive">{errors.agreeToTerms}</p>}

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        "Complete Registration"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}