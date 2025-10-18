import { useEffect, useState } from 'react';
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const usePushNotifications = () => {
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const { userProfile } = useAuth();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    initializePushNotifications();
  }, [userProfile]);

  const initializePushNotifications = async () => {
    try {
      // Request permission
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive === 'granted') {
        setPermissionStatus('granted');
        await PushNotifications.register();
      } else {
        setPermissionStatus('denied');
      }

      // On successful registration, save token to database
      await PushNotifications.addListener('registration', async (token: Token) => {
        console.log('Push registration success, token: ' + token.value);
        
        if (userProfile?.id) {
          // Save token to user preferences
          await supabase
            .from('user_preferences')
            .update({ 
              push_token: token.value,
              push_notifications_enabled: true 
            })
            .eq('user_id', userProfile.id);
        }
      });

      // Registration error
      await PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration: ' + JSON.stringify(error));
        toast.error('Failed to register for push notifications');
      });

      // Show notification when app is in foreground
      await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        console.log('Push notification received: ' + JSON.stringify(notification));
        toast.success(notification.title || 'New notification', {
          description: notification.body
        });
      });

      // Handle notification tap
      await PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
        console.log('Push notification action performed', JSON.stringify(notification));
        
        // Handle navigation based on notification data
        const data = notification.notification.data;
        if (data?.route) {
          // Navigate to specific route based on notification
          window.location.href = data.route;
        }
      });

    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  };

  const requestPermission = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast.error('Push notifications are only available on mobile devices');
      return;
    }

    const permission = await PushNotifications.requestPermissions();
    
    if (permission.receive === 'granted') {
      setPermissionStatus('granted');
      await PushNotifications.register();
      toast.success('Notifications enabled!');
    } else {
      setPermissionStatus('denied');
      toast.error('Notification permission denied');
    }
  };

  const disableNotifications = async () => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      if (userProfile?.id) {
        await supabase
          .from('user_preferences')
          .update({ 
            push_notifications_enabled: false 
          })
          .eq('user_id', userProfile.id);
      }
      
      toast.success('Notifications disabled');
    } catch (error) {
      console.error('Error disabling notifications:', error);
      toast.error('Failed to disable notifications');
    }
  };

  return {
    permissionStatus,
    requestPermission,
    disableNotifications
  };
};
