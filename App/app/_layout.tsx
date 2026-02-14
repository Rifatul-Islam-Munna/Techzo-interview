import { Stack, useRouter } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { setupNotificationListeners } from '@/lib/notificationService';
import '../global.css';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const router = useRouter();
  const notificationListener =
    useRef<ReturnType<typeof Notifications.addNotificationReceivedListener>>(null);
  const responseListener =
    useRef<ReturnType<typeof Notifications.addNotificationResponseReceivedListener>>(null);

  // ✅ NEW: Hook to handle notification that opened the app
  const lastNotificationResponse = Notifications.useLastNotificationResponse();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  // ✅ NEW: Handle notification that opened the app
  useEffect(() => {
    if (lastNotificationResponse) {
      const data = lastNotificationResponse.notification.request.content.data;
      if (data.postId) {
        console.log('App opened from notification, navigating to:', data.postId);
        router.push(`/post/${data.postId}` as any);
      }
    }
  }, [lastNotificationResponse]);

  // Setup notification listeners
  useEffect(() => {
    const listeners = setupNotificationListeners(
      // When notification received while app is open
      (notification) => {
        console.log('📬 Notification received:', notification);
      },
      // When user taps notification
      (response) => {
        console.log('👆 Notification tapped:', response);
        const data = response.notification.request.content.data;

        // Navigate to post when tapped
        if (data.postId) {
          router.push(`/post/${data.postId}` as any);
        }
      }
    );

    notificationListener.current = listeners.notificationListener;
    responseListener.current = listeners.responseListener;

    // Cleanup
    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2563eb',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen name="index" options={{ title: 'SocialHub' }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
