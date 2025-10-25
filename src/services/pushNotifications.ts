/**
 * Push Notifications Service
 *
 * Handles push notifications for turn-based gameplay
 * Sends notifications when it's the other player's turn
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register for push notifications
 * Returns the push token or null if registration fails
 */
export async function registerForPushNotifications(): Promise<string | null> {
  let token: string | null = null;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    try {
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        })
      ).data;
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  // Android specific config
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D4A5A5',
    });
  }

  return token;
}

/**
 * Schedule a local notification when it's the other player's turn
 */
export async function scheduleYourTurnNotification(storyTitle: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Your turn! ✍️",
      body: `${storyTitle} - Add your word to continue the story`,
      data: { type: 'your_turn', storyTitle },
      sound: true,
    },
    trigger: null, // Send immediately
  });
}

/**
 * Cancel all pending notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Send a push notification to a specific user (requires backend)
 * This is a placeholder - you'd need to implement a backend service
 * to actually send push notifications to other users
 */
export async function sendPushNotificationToPartner(
  partnerToken: string,
  storyTitle: string
): Promise<void> {
  // This would normally call your backend API
  // For now, we'll just log it
  console.log('Would send push notification to partner:', partnerToken, storyTitle);

  // Example of what the backend would do:
  /*
  const message = {
    to: partnerToken,
    sound: 'default',
    title: "Your turn! ✍️",
    body: `${storyTitle} - Add your word to continue the story`,
    data: { type: 'your_turn', storyTitle },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
  */
}

/**
 * Set up notification listeners
 * Returns cleanup function
 */
export function setupNotificationListeners(
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationTapped: (response: Notifications.NotificationResponse) => void
): () => void {
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    onNotificationReceived
  );

  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    onNotificationTapped
  );

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}
