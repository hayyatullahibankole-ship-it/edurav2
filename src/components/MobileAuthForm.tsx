import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { emailSchema, passwordSchema, nameSchema } from "@/utils/inputValidation";
import { generateSessionToken, storeSessionToken, setSessionToken } from "@/utils/sessionManager";
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import eduraLogo from "@/assets/edura-logo.png";

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required")
});

const signupSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function MobileAuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleHaptic = async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    await handleHaptic();

    try {
      if (isLogin) {
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
            throw new Error('Invalid email or password');
          }
          throw error;
        }

        if (data.user) {
          const newSessionToken = generateSessionToken();
          storeSessionToken(newSessionToken);
          await setSessionToken(data.user.id, newSessionToken);

          toast({
            title: "Welcome back!",
            description: "Login successful",
          });
        }
      } else {
        const signupData = signupSchema.parse(formData);

        const { data: signUpData, error } = await supabase.auth.signUp({
          email: signupData.email,
          password: signupData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              first_name: signupData.firstName,
              last_name: signupData.lastName,
            }
          }
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            throw new Error('Email already registered. Please sign in.');
          }
          throw error;
        }

        if (signUpData.user) {
          const newSessionToken = generateSessionToken();
          storeSessionToken(newSessionToken);
          await setSessionToken(signUpData.user.id, newSessionToken);
        }

        toast({
          title: "Account created!",
          description: "Check your email to verify your account",
        });

        setIsLogin(true);
      }
    } catch (error: any) {
      if (error.issues) {
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section with Image */}
      <div className="relative h-[45vh] bg-gradient-to-br from-primary via-primary-glow to-secondary overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
          <div className="bg-white rounded-3xl p-4 shadow-2xl mb-4">
            <img src={eduraLogo} alt="Edura" className="h-12 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back!' : 'Join Edura'}
          </h1>
          <p className="text-white/90 text-sm">
            {isLogin ? 'Sign in to continue learning' : 'Start your journey to success'}
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 bg-background px-6 pt-6 pb-8 -mt-6 rounded-t-[2rem] relative z-20 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={errors.firstName ? 'border-destructive' : ''}
                />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={errors.lastName ? 'border-destructive' : ''}
                />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={isLogin ? "Enter password" : "Create password"}
                className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                className={errors.confirmPassword ? 'border-destructive' : ''}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base font-semibold rounded-xl shadow-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity mt-6"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading...
              </div>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={async () => {
              await handleHaptic();
              setIsLogin(!isLogin);
              setErrors({});
            }}
            className="text-sm text-muted-foreground"
          >
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span className="text-primary font-semibold">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
