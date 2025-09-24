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
  };
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, userProfile } = useAuth();

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user || !userProfile) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select(`
            *,
            subscription_plans (
              name,
              price,
              resource_access_level
            )
          `)
          .eq('user_id', userProfile.id)
          .eq('status', 'ACTIVE')
          .gte('end_date', new Date().toISOString())
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

  const hasPremiumAccess = !loading && subscription && subscription.status === 'ACTIVE';
  const isPremium = hasPremiumAccess && subscription?.subscription_plans?.resource_access_level !== 'basic';

  return {
    subscription,
    loading,
    hasPremiumAccess: !!hasPremiumAccess,
    isPremium: !!isPremium,
  };
}