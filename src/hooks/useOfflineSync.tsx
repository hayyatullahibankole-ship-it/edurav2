import { useEffect, useState } from 'react';
import { useOffline } from './useOffline';
import { offlineStorage } from '@/utils/offlineStorage';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useOfflineSync = () => {
  const { isOnline } = useOffline();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (isOnline && !isSyncing) {
      syncPendingAttempts();
    }
  }, [isOnline]);

  const syncPendingAttempts = async () => {
    try {
      setIsSyncing(true);
      const pendingAttempts = await offlineStorage.getPendingAttempts();
      
      if (pendingAttempts.length === 0) {
        return;
      }

      toast({
        title: "Syncing Data",
        description: `Uploading ${pendingAttempts.length} offline attempt(s)...`,
      });

      for (const attempt of pendingAttempts) {
        try {
          // Create attempt in database
          const { data: newAttempt, error: attemptError } = await supabase
            .from('attempts')
            .insert([{
              exam_id: attempt.examId,
              status: attempt.status === 'COMPLETED' ? 'SUBMITTED' : 'IN_PROGRESS',
              started_at: attempt.startedAt,
            }])
            .select()
            .single();

          if (attemptError) throw attemptError;

          // Insert answers
          const answersToInsert = Object.entries(attempt.answers).map(([questionId, answer]) => ({
            attempt_id: newAttempt.id,
            question_id: questionId,
            answer: answer,
          }));

          const { error: answersError } = await supabase
            .from('attempt_answers')
            .insert(answersToInsert);

          if (answersError) throw answersError;

          // Mark as synced
          await offlineStorage.updateAttemptSyncStatus(attempt.id, 'SYNCED');
        } catch (error) {
          console.error('Error syncing attempt:', error);
          await offlineStorage.updateAttemptSyncStatus(attempt.id, 'FAILED');
        }
      }

      const successCount = pendingAttempts.length;
      toast({
        title: "Sync Complete! ✓",
        description: `Successfully synced ${successCount} attempt(s).`,
      });
    } catch (error) {
      console.error('Error during sync:', error);
      toast({
        title: "Sync Error",
        description: "Some data couldn't be synced. Will retry later.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    syncPendingAttempts,
  };
};
