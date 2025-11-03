import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { emailSchema, passwordSchema, nameSchema, phoneSchema } from "@/utils/inputValidation";
import eduraLogo from "@/assets/edura-logo.png";
import { generateSessionToken, storeSessionToken, setSessionToken } from "@/utils/sessionManager";

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
  const [searchParams] = useSearchParams();
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    // Capture referral code from URL
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      setIsLogin(false); // Switch to signup if there's a referral code
    }
  }, [searchParams]);

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
      // Check if account is locked
      const { data: isLocked } = await supabase.rpc('is_account_locked', {
        user_email: formData.email
      });

      if (isLocked) {
        setErrors({ 
          general: 'Account temporarily locked due to multiple failed login attempts. Please try again in 15 minutes or reset your password.' 
        });
        toast({
          title: 'Account Locked',
          description: 'Too many failed login attempts. Please try again later.',
          variant: 'destructive',
        });
        return;
      }

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

        const email = loginData.email.trim().toLowerCase();

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: loginData.password
        });

        // Record login attempt (non-blocking)
        try {
          await supabase.rpc('record_login_attempt', {
            user_email: loginData.email,
            attempt_success: !error
          });
        } catch (recordError) {
          console.warn('Failed to record login attempt:', recordError);
        }

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please check your credentials and try again.');
          }
          throw error;
        }

        if (data.user) {
          // Generate and store new session token (invalidates other sessions)
          const newSessionToken = generateSessionToken();
          storeSessionToken(newSessionToken);
          
          // Update session token in database
          const tokenSet = await setSessionToken(data.user.id, newSessionToken);
          
          if (!tokenSet) {
            console.error('Failed to set session token');
          }

          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });

          // Let the Auth page handle redirect based on role

        }
      } else {
        // Validate signup form
        const signupData = signupSchema.parse(formData);

        const { data: signUpData, error } = await supabase.auth.signUp({
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
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Please check your email and confirm your account before signing in.');
          }
          throw new Error(`Account creation failed: ${error.message}`);
        }

        // Generate and store session token for new user
        if (signUpData.user) {
          const newSessionToken = generateSessionToken();
          storeSessionToken(newSessionToken);
          
          // Update session token in database
          await setSessionToken(signUpData.user.id, newSessionToken);

          // Process referral if code exists
          if (referralCode) {
            try {
              const { data: userProfile } = await supabase
                .from('users')
                .select('id')
                .eq('auth_user_id', signUpData.user.id)
                .single();

              if (userProfile?.id) {
                const { data: referralProcessed } = await supabase.rpc('process_referral_signup', {
                  new_user_id: userProfile.id,
                  referral_code_param: referralCode
                });

                if (referralProcessed) {
                  toast({
                    title: "Referral bonus earned!",
                    description: "You've received welcome points for joining with a referral code.",
                  });
                }
              }
            } catch (refError) {
              console.error('Referral processing error:', refError);
              // Don't block signup if referral processing fails
            }
          }
        }

        toast({
          title: "Account created successfully!",
          description: "Please check your email and click the verification link to activate your account.",
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
        <div className="text-center mb-4">
          <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={eduraLogo} alt="Edura" className="h-28 w-auto animate-bounce-slow" />
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
            {referralCode && !isLogin && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm">
                <p className="text-primary font-medium">🎉 Referral code applied: {referralCode}</p>
                <p className="text-muted-foreground mt-1">You'll earn bonus points when you sign up!</p>
              </div>
            )}
            
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
                      <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                      {' '}and{' '}
                      <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
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

            {/* Toggle Auth Mode */}
            <div className="text-center space-y-3">
              {isLogin ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsLogin(false);
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
                    className="w-full"
                  >
                    Create Account
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(true);
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
                  Sign in instead
                </button>
              </p>
            )}
            
            <div className="mt-4 pt-4 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Are you a school administrator?{' '}
                <Link to="/school-login" className="text-primary hover:underline font-medium">
                  Login as School
                </Link>
              </p>
            </div>
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}