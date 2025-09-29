import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SubscriptionData {
  id: string;
  status: string;
  plan_id: string;
  start_date: string;
  end_date: string | null;
  subscription_plans?: {
    name: string;
    price: number;
    resource_access_level: string;
    features?: any;
  };
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, userProfile } = useAuth();

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        // No user authenticated, clear subscription and stop loading
        setSubscription(null);
        setLoading(false);
        return;
      }

      if (!userProfile) {
        // Wait until profile is loaded, but add timeout
        setLoading(true);
        
        // Set a fallback timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.warn('Subscription loading timed out, user may not have profile');
          setSubscription({
            id: 'fallback',
            status: 'ACTIVE',
            plan_id: 'basic',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            subscription_plans: {
              name: 'Basic Access',
              price: 0,
              resource_access_level: 'basic',
              features: ['Basic practice tests']
            }
          });
          setLoading(false);
        }, 8000); // 8 second timeout
        
        return () => clearTimeout(timeoutId);
      }

      try {
        setLoading(true);
        
        // Get the user's active subscription (including free accounts)
        const { data, error } = await supabase
          .from('subscriptions')
          .select(`
            *,
            subscription_plans (
              name,
              price,
              resource_access_level,
              features
            )
          `)
          .eq('user_id', userProfile.id)
          .eq('status', 'ACTIVE')
          .gte('end_date', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching subscription:', error);
          // Set a basic subscription as fallback
          setSubscription({
            id: 'fallback',
            status: 'ACTIVE',
            plan_id: 'basic',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            subscription_plans: {
              name: 'Basic Access',
              price: 0,
              resource_access_level: 'basic',
              features: ['Basic practice tests']
            }
          });
        } else {
          setSubscription(data);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        // Set fallback subscription on error
        setSubscription({
          id: 'fallback',
          status: 'ACTIVE', 
          plan_id: 'basic',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          subscription_plans: {
            name: 'Basic Access',
            price: 0,
            resource_access_level: 'basic',
            features: ['Basic practice tests']
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user, userProfile]);

  // Normalize subscription state - fix the premium detection logic
  const active = subscription?.status === 'ACTIVE';
  const notExpired = subscription?.end_date ? new Date(subscription.end_date) > new Date() : true;
  const accessLevel = subscription?.subscription_plans?.resource_access_level?.toLowerCase();
  const planName = (subscription?.subscription_plans?.name || '').toLowerCase();

  // User has any active (non-expired) subscription
  const hasPremiumAccess = Boolean(!loading && active && notExpired);
  
  // User is premium if access level is premium OR plan name contains premium
  const isPremium = Boolean(
    hasPremiumAccess && (
      accessLevel === 'premium' || 
      planName.includes('premium') ||
      (subscription?.subscription_plans?.price && subscription.subscription_plans.price > 0)
    )
  );
  
  // User is enterprise if access level is enterprise OR plan name contains enterprise
  const isEnterprise = Boolean(
    hasPremiumAccess && (
      accessLevel === 'enterprise' || 
      planName.includes('enterprise')
    )
  );
  
  // User can access premium content (premium or enterprise)
  const canAccessPremium = Boolean(isPremium || isEnterprise);
  
  // User is on free/basic plan (has access but not premium/enterprise)
  const isFree = Boolean(hasPremiumAccess && accessLevel === 'basic' && !isPremium && !isEnterprise);
  
  if (typeof window !== 'undefined') {
    console.debug('useSubscription', {
      userId: user?.id,
      profileId: userProfile?.id,
      subscription,
      accessLevel,
      active,
      notExpired,
      isPremium: Boolean(isPremium),
      loading
    });
  }

  return {
    subscription,
    loading,
    hasPremiumAccess: !!hasPremiumAccess,
    isPremium: !!isPremium,
    isEnterprise: !!isEnterprise,
    canAccessPremium: !!canAccessPremium,
    isFree: !!isFree,
  };
}