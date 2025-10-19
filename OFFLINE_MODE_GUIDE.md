# Edura Offline Mode Guide

## Overview
Edura now supports full offline functionality for the native mobile app! You can download exams, practice without internet, and automatically sync your progress when you're back online.

## Features

### 🔄 **Automatic Sync**
- Your exam attempts are automatically saved locally
- When you reconnect to the internet, all data syncs automatically
- No data loss, even if you're offline for days

### 📥 **Offline Exam Downloads**
- Download complete practice exams for any exam type (JAMB, WAEC, NECO, Post-UTME)
- Each download includes 10 questions per subject
- Downloaded exams expire after 7 days (for freshness)

### 📱 **Offline Indicator**
- Visual indicator shows when you're offline
- Toast notifications when connection status changes
- Continue seamlessly without interruption

### 💾 **IndexedDB Storage**
- All offline data stored securely in your device
- Efficient storage management
- Automatic cleanup of expired data

## How to Use

### Download an Exam
1. Navigate to `/offline-exams` page
2. Select your exam type (JAMB, WAEC, NECO, or Post-UTME)
3. Click "Download for Offline" (requires internet)
4. Wait for download to complete

### Practice Offline
1. Go to Offline Exams page
2. Click "Start" on any downloaded exam
3. Complete your practice test
4. Submit when done
5. Your attempt will be saved locally and synced when online

### View Offline Exams
- Navigate to Settings → Offline Exams
- Or visit `/offline-exams` directly
- See all downloaded exams with expiry dates
- Delete exams you no longer need

## Technical Implementation

### Service Worker
- Configured with Vite PWA Plugin
- Implements caching strategies:
  - **CacheFirst**: Fonts, images
  - **NetworkFirst**: API calls (with fallback)
  - **StaleWhileRevalidate**: App assets

### IndexedDB Structure
```javascript
{
  exams: {
    id: string,
    examType: string,
    questions: Question[],
    downloadedAt: Date,
    expiresAt: Date
  },
  attempts: {
    id: string,
    examId: string,
    answers: Record<questionId, answer>,
    startedAt: Date,
    status: 'IN_PROGRESS' | 'COMPLETED',
    syncStatus: 'PENDING' | 'SYNCED' | 'FAILED'
  }
}
```

### Offline Detection
```typescript
// Automatically detects online/offline status
const { isOnline, wasOffline } = useOffline();

// Shows toast notifications
// Enables/disables download functionality
```

### Auto-Sync
```typescript
// Syncs pending attempts when online
const { isSyncing, syncPendingAttempts } = useOfflineSync();

// Automatically triggered when connection restored
// Uploads all pending attempts to server
// Marks attempts as synced
```

## Best Practices

1. **Download Before Going Offline**
   - Download exams while connected
   - Can't download new exams while offline

2. **Storage Management**
   - Each exam takes ~1-2 MB
   - Device should have adequate storage
   - Expired exams are auto-deleted

3. **Sync Regularly**
   - Connect to internet periodically
   - Allows progress to sync
   - Keeps downloaded exams fresh

4. **Battery Considerations**
   - IndexedDB operations are battery-efficient
   - Service worker runs in background
   - Minimal impact on device performance

## Troubleshooting

### Downloads Failing
- Check internet connection
- Ensure enough storage space
- Try smaller exam types first

### Sync Not Working
- Check internet connection stability
- Wait a few moments after connecting
- Check sync status in offline exams page

### Exams Expired
- Re-download the exam
- Downloads are only valid for 7 days
- This ensures fresh content

### Storage Full
- Delete old downloaded exams
- Clear browser cache
- Free up device storage

## Future Enhancements

- [ ] Background sync for larger downloads
- [ ] Selective subject downloads
- [ ] Offline study materials
- [ ] Custom expiry periods
- [ ] Download progress indicators
- [ ] Offline analytics tracking

## Technical Stack

- **vite-plugin-pwa**: PWA configuration
- **workbox**: Service worker management
- **IndexedDB**: Offline storage
- **React Hooks**: Offline state management
- **Capacitor**: Native app capabilities

## Support

For issues or questions about offline mode:
- Check the app's help section
- Contact support at support@edura.app
- Visit our documentation at docs.edura.app
