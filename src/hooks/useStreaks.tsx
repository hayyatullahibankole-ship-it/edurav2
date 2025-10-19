import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_practice_date: string | null;
  total_practice_days: number;
  streak_milestones: Array<{ days: number; achieved_at: string }>;
}

export const useStreaks = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.id) {
      fetchStreak();
    }
  }, [userProfile]);

  const fetchStreak = async () => {
    if (!userProfile?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userProfile.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setStreakData({
          ...data,
          streak_milestones: (data.streak_milestones as any) || []
        });
      } else {
        // Create initial streak record
        const { data: newStreak, error: insertError } = await supabase
          .from('user_streaks')
          .insert({
            user_id: userProfile.id,
            current_streak: 0,
            longest_streak: 0,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setStreakData({
          ...newStreak,
          streak_milestones: (newStreak.streak_milestones as any) || []
        });
      }
    } catch (error) {
      console.error('Error fetching streak:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = async () => {
    if (!userProfile?.id) return;

    try {
      const { data, error } = await supabase
        .rpc('update_user_streak', {
          p_user_id: userProfile.id
        });

      if (error) throw error;

      // Refetch to get updated data
      await fetchStreak();

      // Show milestone notification
      const responseData = data as any;
      if (responseData?.new_milestone) {
        toast({
          title: `🔥 ${responseData.milestone_reached}-Day Streak!`,
          description: `Amazing! You've reached a ${responseData.milestone_reached}-day practice streak!`,
          duration: 5000,
        });
      }

      return responseData;
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  return {
    streakData,
    loading,
    updateStreak,
    refetch: fetchStreak,
  };
};
