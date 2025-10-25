# Push Notifications Setup Guide

## ✅ What's Already Done

- Push notification service created at `/src/services/pushNotificationService.ts`
- Edge Function created at `/supabase/functions/send-turn-notification/index.ts`
- `expo-notifications` package already installed
- Supabase client configured with AsyncStorage

## 📋 Setup Steps

### Step 1: Deploy the Edge Function

**Option A: Via Supabase Dashboard (Easiest)**

1. Go to https://supabase.com/dashboard/project/qwafuwhkksaffmbzfqpq
2. Click **Edge Functions** in the left sidebar
3. Click **Create a new function**
4. Name: `send-turn-notification`
5. Copy the entire code from `/supabase/functions/send-turn-notification/index.ts`
6. Paste into the editor
7. Click **Deploy**

**Option B: Via Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref qwafuwhkksaffmbzfqpq

# Deploy the function
supabase functions deploy send-turn-notification
```

### Step 2: Get Your Expo Project ID

1. Go to https://expo.dev
2. Sign in to your account
3. Find your project or create a new one
4. Copy the Project ID (looks like: `abc123-def456-ghi789`)

### Step 3: Update Push Notification Service

In `/src/services/pushNotificationService.ts`, line 42:

```typescript
const tokenData = await Notifications.getExpoPushTokenAsync({
  projectId: "your-expo-project-id", // ← Replace with your actual Expo Project ID
});
```

### Step 4: Register for Push Notifications in App

Update your `App.tsx` to register for push notifications after login:

```typescript
import { registerForPushNotificationsAsync, setupNotificationListeners } from "./src/services/pushNotificationService";

// Inside your App component, after user logs in:
useEffect(() => {
  if (user) {
    // Register for push notifications
    registerForPushNotificationsAsync();

    // Setup listeners for when notifications are received or tapped
    const cleanup = setupNotificationListeners(
      (notification) => {
        // Handle notification received while app is open
        console.log("Notification received:", notification);
      },
      (response) => {
        // Handle notification tapped - navigate to story
        const storyId = response.notification.request.content.data?.storyId;
        if (storyId) {
          // Navigate to story detail screen
          // navigation.navigate("StoryDetail", { storyId });
        }
      }
    );

    return cleanup;
  }
}, [user]);
```

### Step 5: Configure app.json for Push Notifications

Add this to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#D4A5A5",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#D4A5A5",
      "iosDisplayInForeground": true,
      "androidMode": "default",
      "androidCollapsedTitle": "Our Story Book"
    }
  }
}
```

### Step 6: Test Push Notifications

**Test on Physical Device Only** (push notifications don't work on simulators)

1. Build and install the app on a physical device
2. Sign up or log in
3. The app will request notification permissions
4. Accept the permissions
5. Create a story with a partner
6. Add a word to the story
7. Your partner should receive a push notification

**Test with Local Notification:**

In your Settings screen, add a test button:

```typescript
import { scheduleTestNotification } from "../services/pushNotificationService";

<Button title="Test Notification" onPress={scheduleTestNotification} />
```

## 🔧 How It Works

1. **User logs in** → App requests notification permissions
2. **Permissions granted** → App gets Expo Push Token
3. **Token saved** → Stored in `profiles.push_token` in Supabase
4. **User adds word** → App calls Edge Function with partner details
5. **Edge Function runs** → Queries partner's push token from database
6. **Push sent** → Edge Function sends notification via Expo Push API
7. **Partner receives** → Notification appears on partner's device
8. **Partner taps** → App opens to the specific story

## 🚨 Troubleshooting

### Push notifications not working?

1. **Check permissions:** Go to device Settings → Your App → Notifications
2. **Check push token:** Look for "Got push token:" in console logs
3. **Check Edge Function logs:** In Supabase dashboard → Edge Functions → Logs
4. **Verify profile has token:** Check Supabase → Table Editor → profiles → push_token column
5. **Test with local notification:** Use `scheduleTestNotification()` function

### Common Issues:

- **"Push notifications only work on physical devices"** - You're testing on a simulator. Use a real device.
- **No push token** - User didn't grant permissions. Request permissions again.
- **Edge Function 401 error** - Auth token not passed correctly. Check storyStore.ts Edge Function call.
- **Edge Function 400 error** - Missing required fields in payload.

## 📱 Platform-Specific Notes

### iOS:
- Requires physical device for testing
- Push notifications work immediately after permissions granted
- Notifications appear in Notification Center even when app is closed

### Android:
- Requires physical device for testing
- Notification channel configured as "story-updates"
- Notifications appear in status bar

## 🎯 Next Steps After Setup

1. Build app for production (EAS Build)
2. Test on multiple devices
3. Implement deep linking to open specific stories
4. Add notification settings in app (enable/disable)
5. Track notification delivery status
6. Add notification badges for unread stories

## 📚 Resources

- Expo Push Notifications: https://docs.expo.dev/push-notifications/overview/
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Expo Application Services: https://docs.expo.dev/eas/
