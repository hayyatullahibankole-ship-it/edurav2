import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Phone,
  GraduationCap,
  BookOpen
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { emailSchema, passwordSchema, nameSchema, phoneSchema } from "@/utils/inputValidation";
import eduraLogo from "@/assets/edura-logo.png";

// Enhanced validation schemas for security
const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required") // Don't validate length on login
});

const signupSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  examType: z.string().min(1, "Please select an exam type"),
  currentClass: z.string().min(1, "Please select your current class"),
  password: passwordSchema,
  confirmPassword: z.string(),
  agreedToTerms: z.boolean().refine(val => val === true, "You must agree to the terms")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+234',
    examType: '',
    currentClass: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const examTypes = [
    { value: "JAMB", label: "JAMB (Joint Admissions and Matriculation Board)" },
    { value: "WAEC", label: "WAEC (West African Examinations Council)" },
    { value: "NECO", label: "NECO (National Examinations Council)" },
    { value: "GCE", label: "GCE (General Certificate of Education)" }
  ];

  const currentClasses = [
    { value: "SS1", label: "SS1 (Senior Secondary 1)" },
    { value: "SS2", label: "SS2 (Senior Secondary 2)" },
    { value: "SS3", label: "SS3 (Senior Secondary 3)" },
    { value: "Graduate", label: "Graduate" },
    { value: "Other", label: "Other" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Optional rate limit check (non-blocking if unavailable)
      let rateLimited = false;
      try {
        const { data: rateLimitResult } = await supabase.rpc('check_auth_rate_limit');
        const allowed = typeof rateLimitResult === 'boolean' 
          ? rateLimitResult 
          : (rateLimitResult as any)?.allowed;
        if (allowed === false) {
          rateLimited = true;
        }
      } catch (e) {
        // If the RPC is missing or errors out, do not block login
      }
      if (rateLimited) {
        setErrors({ general: 'Too many authentication attempts. Please try again in 15 minutes.' });
        toast({
          title: 'Rate limit hit',
          description: 'Please wait 15 minutes before trying again.',
          variant: 'destructive',
        });
        return;
      }

      if (isLogin) {
        // Validate login form
        const loginData = loginSchema.parse({
          email: formData.email,
          password: formData.password
        });

        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginData.email,
          password: loginData.password
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please check your credentials and try again.');
          }
          throw error;
        }

        if (data.user) {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });

          // Wait for auth state to update before navigation
          setTimeout(() => {
            navigate('/dashboard');
          }, 100);
        }
      } else {
        // Validate signup form
        const signupData = signupSchema.parse(formData);

        const { error } = await supabase.auth.signUp({
          email: signupData.email,
          password: signupData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              first_name: signupData.firstName,
              last_name: signupData.lastName,
              phone: signupData.phone,
              exam_type: signupData.examType,
              current_class: signupData.currentClass
            }
          }
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            throw new Error('This email is already registered. Please sign in instead.');
          }
          throw error;
        }

        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account.",
        });

        setIsLogin(true);
      }
    } catch (error: any) {
      if (error.issues) {
        // Zod validation errors
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue: any) => {
          newErrors[issue.path[0]] = issue.message;
        });
        setErrors(newErrors);
      } else {
        toast({
          title: "Error",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to sign in with ${provider}`,
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast({
        title: "Email required",
        description: "Please enter your email address first",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth`
      });

      if (error) throw error;

      toast({
        title: "Password reset email sent",
        description: "Check your email for password reset instructions",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
            <img src={eduraLogo} alt="Edura" className="h-32 w-auto" />
          </Link>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-foreground">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isLogin 
                ? 'Sign in to continue your exam preparation' 
                : 'Join thousands of students achieving their exam goals'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                        First Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          className={`pl-10 ${errors.firstName ? 'border-destructive' : ''}`}
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                      </div>
                      {errors.firstName && (
                        <p className="text-xs text-destructive">{errors.firstName}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                        Last Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          className={`pl-10 ${errors.lastName ? 'border-destructive' : ''}`}
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                      </div>
                      {errors.lastName && (
                        <p className="text-xs text-destructive">{errors.lastName}</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              {!isLogin && (
                <>
                  {/* Phone Field */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+234 800 000 0000"
                        className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-destructive">{errors.phone}</p>
                    )}
                  </div>

                  {/* Exam Type and Current Class */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="examType" className="text-sm font-medium text-foreground">
                        Exam Type
                      </Label>
                      <Select 
                        value={formData.examType} 
                        onValueChange={(value) => setFormData({ ...formData, examType: value })}
                      >
                        <SelectTrigger className={errors.examType ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select exam" />
                        </SelectTrigger>
                        <SelectContent>
                          {examTypes.map((exam) => (
                            <SelectItem key={exam.value} value={exam.value}>
                              {exam.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.examType && (
                        <p className="text-xs text-destructive">{errors.examType}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentClass" className="text-sm font-medium text-foreground">
                        Current Class
                      </Label>
                      <Select 
                        value={formData.currentClass} 
                        onValueChange={(value) => setFormData({ ...formData, currentClass: value })}
                      >
                        <SelectTrigger className={errors.currentClass ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentClasses.map((cls) => (
                            <SelectItem key={cls.value} value={cls.value}>
                              {cls.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.currentClass && (
                        <p className="text-xs text-destructive">{errors.currentClass}</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                    className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {/* Remember Me / Terms Agreement */}
              <div className="flex items-center justify-between">
                {isLogin ? (
                  <>
                    <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                    />
                      <Label htmlFor="remember" className="text-sm text-muted-foreground">
                        Remember me
                      </Label>
                    </div>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </>
                ) : (
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={formData.agreedToTerms}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, agreedToTerms: Boolean(checked) })
                      }
                    />
                    <Label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                      I agree to the{' '}
                      <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
                      {' '}and{' '}
                      <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                    </Label>
                  </div>
                )}
              </div>
              {errors.agreedToTerms && (
                <p className="text-xs text-destructive">{errors.agreedToTerms}</p>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
              </Button>
            </form>

            {/* Social Login - Only for login */}
            {isLogin && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('google')}
                    className="w-full"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('facebook')}
                    className="w-full"
                  >
                    <svg className="mr-2 h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </Button>
                </div>
              </>
            )}

            {/* Toggle Auth Mode */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrors({});
                    setFormData({
                      firstName: '',
                      lastName: '',
                      email: formData.email, // Keep email when switching
                      phone: '+234',
                      examType: '',
                      currentClass: '',
                      password: '',
                      confirmPassword: '',
                      agreedToTerms: false
                    });
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  {isLogin ? "Sign up here" : "Sign in instead"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}