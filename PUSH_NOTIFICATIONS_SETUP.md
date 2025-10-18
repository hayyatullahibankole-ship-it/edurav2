# Push Notifications Setup Guide

## Overview
Push notifications have been implemented for the mobile app using Capacitor Push Notifications plugin. This allows students to receive real-time notifications about test results, achievements, and updates directly on their phones.

## What's Already Implemented

### Frontend (Mobile App)
✅ `@capacitor/push-notifications` package installed
✅ Custom hook `usePushNotifications.tsx` handles:
  - Requesting permission from users
  - Registering device tokens
  - Handling incoming notifications
  - Managing notification clicks
✅ NotificationBell component with real-time updates
✅ Database updated with push notification fields

### Backend
✅ Edge function `send-push-notification` created
✅ Database table `user_preferences` updated with:
  - `push_token` - stores device FCM/APNs token
  - `push_notifications_enabled` - user preference flag

## Required Setup Steps

### 1. Firebase Cloud Messaging (Android)

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.com/)
   - Create a new project or select existing
   - Add an Android app to your project

2. **Get FCM Server Key**:
   - In Firebase Console → Project Settings → Cloud Messaging
   - Copy the "Server key"

3. **Add FCM Server Key to Supabase**:
   ```bash
   # In your terminal after pulling the project
   npx supabase secrets set FCM_SERVER_KEY=your_server_key_here
   ```
   Or use the Supabase dashboard:
   - Go to Project Settings → Edge Functions
   - Add secret: `FCM_SERVER_KEY`

4. **Update Capacitor Config**:
   ```typescript
   // capacitor.config.ts
   import { CapacitorConfig } from '@capacitor/cli';

   const config: CapacitorConfig = {
     // ... existing config
     plugins: {
       PushNotifications: {
         presentationOptions: ["badge", "sound", "alert"]
       }
     }
   };
   ```

5. **Add google-services.json**:
   - Download `google-services.json` from Firebase Console
   - Place it in `android/app/` directory
   - Run `npx cap sync android`

### 2. Apple Push Notification Service (iOS)

1. **Apple Developer Account**:
   - Requires an active Apple Developer account ($99/year)
   - Create an App ID in Apple Developer Portal
   - Enable Push Notifications capability

2. **Create APNs Key**:
   - In Apple Developer Portal → Certificates, IDs & Profiles
   - Keys → Create new key
   - Enable Apple Push Notifications service (APNs)
   - Download the `.p8` key file

3. **Configure Firebase for iOS**:
   - In Firebase Console → Project Settings → Cloud Messaging
   - Upload APNs certificate or key
   - Add your App ID and Team ID

4. **Update Xcode Project**:
   - Open project in Xcode
   - Enable Push Notifications capability
   - Add Background Modes → Remote notifications

5. **Run sync**:
   ```bash
   npx cap sync ios
   ```

### 3. Testing Push Notifications

#### Development Testing:
```bash
# Test the edge function directly
curl -X POST https://your-project-ref.supabase.co/functions/v1/send-push-notification \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-auth-uuid","title": "Test Notification","body": "This is a test push notification","data": {"route": "/mobile-home"}}'
```

#### Mobile Testing:
1. Build and run app on physical device (push notifications don't work on simulators)
2. Grant notification permission when prompted
3. Send a test notification using the curl command above
4. Check if notification appears

### 4. Triggering Notifications

You can trigger push notifications from:

**Test Results**:
```typescript
// In your results submission code
await supabase.functions.invoke('send-push-notification', {
  body: {
    userId: user.id,
    title: '🎯 Test Results Ready!',
    body: `You scored ${percentage}% on your ${examType} test`,
    data: {
      route: `/test-results/${attemptId}`
    }
  }
});
```

**Achievements**:
```typescript
await supabase.functions.invoke('send-push-notification', {
  body: {
    userId: user.id,
    title: '🏆 Achievement Unlocked!',
    body: `You've earned the "${achievementName}" achievement`,
    data: {
      route: '/dashboard?tab=achievements'
    }
  }
});
```

**Daily Reminders** (using cron):
```sql
-- Create scheduled job to send daily study reminders
select cron.schedule(
  'daily-study-reminder',
  '0 9 * * *', -- 9 AM daily
  $$
  select net.http_post(
    url:='https://your-project-ref.supabase.co/functions/v1/send-push-notification',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body:='{"userId": "user-id", "title": "📚 Time to Study!", "body": "Don't break your streak! Take a practice test today."}'::jsonb
  );
  $$
);
```

## Current Capabilities

✅ Real-time in-app notifications with unread count
✅ Push notification permission handling
✅ Device token storage
✅ Notification delivery via FCM (Android)
✅ Notification click handling with routing
✅ Background notification support

## User Experience

1. **First Launch**: App requests notification permission
2. **Permission Granted**: Device token saved to database
3. **Notifications Received**: 
   - App in foreground: Toast notification
   - App in background: Native OS notification
   - Tap notification: Navigate to relevant screen

## Security Notes

- Push tokens are stored securely in the database
- FCM server key must be kept secret (stored in Supabase secrets)
- Only authenticated users can receive notifications
- User can disable notifications via preferences

## Troubleshooting

### Notifications not received?
1. Check device has internet connection
2. Verify permission was granted
3. Check FCM_SERVER_KEY is set correctly
4. Ensure device token is saved in database
5. Check edge function logs for errors

### iOS issues?
- Ensure you're testing on a physical device
- Verify APNs certificate is valid
- Check Xcode console for error messages

### Android issues?
- Verify google-services.json is in correct location
- Check FCM server key is valid
- Ensure app has notification permission in settings

## Next Steps

To complete the setup:
1. Create Firebase project and get FCM server key
2. Add FCM_SERVER_KEY to Supabase secrets
3. For iOS: Set up APNs with Apple Developer account
4. Test on physical devices
5. Integrate notification triggers in your app logic
