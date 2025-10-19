import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface WeakTopic {
  subject_name: string;
  topic_name: string;
  weakness_score: number;
  recommended_count: number;
}

export const useWeakTopics = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile?.id) {
      generateRecommendations();
    }
  }, [userProfile]);

  const generateRecommendations = async () => {
    if (!userProfile?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('generate_weak_topic_recommendations', {
          p_user_id: userProfile.id
        });

      if (error) throw error;

      setWeakTopics(data || []);
    } catch (error) {
      console.error('Error generating weak topic recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissTopic = async (topicName: string) => {
    try {
      const { error } = await supabase
        .from('weak_topic_recommendations')
        .update({ is_active: false })
        .eq('user_id', userProfile?.id)
        .eq('topic_name', topicName);

      if (error) throw error;

      setWeakTopics(prev => prev.filter(t => t.topic_name !== topicName));
      
      toast({
        title: "Topic Dismissed",
        description: "This recommendation has been removed.",
      });
    } catch (error) {
      console.error('Error dismissing topic:', error);
      toast({
        title: "Error",
        description: "Failed to dismiss topic",
        variant: "destructive",
      });
    }
  };

  return {
    weakTopics,
    loading,
    generateRecommendations,
    dismissTopic,
  };
};
