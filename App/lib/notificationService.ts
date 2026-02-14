import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true, // ✅ Added
    shouldShowList: true,  
  }),
});

/**
 * Get FCM token from device
 * @returns FCM token string or null if failed
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    // Setup Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // Check if physical device
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return null;
    }

    // Request permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Permission not granted for notifications');
      return null;
    }

    // Get FCM token (works without Firebase SDK in Expo)
    const tokenData = await Notifications.getDevicePushTokenAsync();
    console.log('FCM Token:', tokenData.data);
    return tokenData.data;
    
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

/**
 * Setup notification listeners
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void
) {
  // When notification received while app is open
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('📬 Notification received:', notification);
      onNotificationReceived?.(notification);
    }
  );

  // When user taps notification
  const responseListener = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log('👆 Notification tapped:', response);
      onNotificationTapped?.(response);
    }
  );

  return { notificationListener, responseListener };
}
