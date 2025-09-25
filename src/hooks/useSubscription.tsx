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
      if (!user || !userProfile) {
        // Wait until auth and profile are ready before determining access
        setLoading(true);
        return;
      }

      try {
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
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching subscription:', error);
        } else {
          setSubscription(data);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user, userProfile]);

  // Normalize subscription state
  const active = subscription?.status === 'ACTIVE';
  const notExpired = subscription?.end_date ? new Date(subscription.end_date) > new Date() : true;
  const accessLevel = subscription?.subscription_plans?.resource_access_level?.toLowerCase();

  // User has any active (non-expired) subscription
  const hasPremiumAccess = Boolean(!loading && active && notExpired);
  
  // User is premium if access level is premium
  const isPremium = Boolean(hasPremiumAccess && accessLevel === 'premium');
  
  // User is on free/basic plan
  const isFree = Boolean(hasPremiumAccess && accessLevel === 'basic');

  return {
    subscription,
    loading,
    hasPremiumAccess: !!hasPremiumAccess,
    isPremium: !!isPremium,
    isFree: !!isFree,
  };
}