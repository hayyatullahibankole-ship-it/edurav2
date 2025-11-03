import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AuthForm from '@/components/AuthForm';
import MobileAuthForm from '@/components/MobileAuthForm';
import { useInstalledApp } from '@/hooks/useInstalledApp';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const { user, loading, isAdmin, isSchoolAdmin, userRole } = useAuth();
  const navigate = useNavigate();
  const { isInstalledApp } = useInstalledApp();

  useEffect(() => {
    const checkSchoolStatus = async () => {
      if (user && !loading && userRole !== null) {
        // Redirect based on role
        if (isAdmin) {
          navigate('/admin', { replace: true });
        } else if (isSchoolAdmin) {
          // Check if school has active subscription
          const { data: schoolData } = await supabase
            .from('schools')
            .select('is_active')
            .eq('admin_user_id', user.id)
            .maybeSingle();
          
          if (schoolData && !schoolData.is_active) {
            // School exists but not active, redirect to subscription
            navigate('/school-subscription', { replace: true });
          } else {
            navigate('/school-dashboard', { replace: true });
          }
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    };
    
    checkSchoolStatus();
  }, [user, loading, userRole, isAdmin, isSchoolAdmin, navigate]);

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
    const redirectTo = isAdmin ? "/admin" : (isSchoolAdmin ? "/school-dashboard" : "/dashboard");
    return <Navigate to={redirectTo} replace />;
  }

  // Show mobile auth form only for installed apps (PWA or native)
  if (isInstalledApp) {
    return <MobileAuthForm />;
  }

  return <AuthForm />;
}