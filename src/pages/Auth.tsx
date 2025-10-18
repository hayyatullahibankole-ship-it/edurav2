import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AuthForm from '@/components/AuthForm';
import MobileAuthForm from '@/components/MobileAuthForm';
import { useNativeApp } from '@/hooks/useNativeApp';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Auth() {
  const { user, loading, isAdmin, userRole } = useAuth();
  const navigate = useNavigate();
  const { isNative } = useNativeApp();
  const isMobileView = useIsMobile();

  useEffect(() => {
    if (user && !loading && userRole !== null) {
      // Redirect based on role
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, loading, userRole, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user && userRole !== null) {
    return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
  }

  // Show mobile auth form for native apps or mobile screen size
  if (isNative || isMobileView) {
    return <MobileAuthForm />;
  }

  return <AuthForm />;
}