import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (result !== PermissionsAndroid.RESULTS.GRANTED) {
      return false;
    }
  }

  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

export async function getFcmToken(): Promise<string | null> {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return null;
    const token = await messaging().getToken();
    return token;
  } catch (error) {
    console.warn('FCM token error:', error);
    return null;
  }
}

export function setupNotificationHandlers(
  onForeground: (couponId: string) => void,
  onOpen: (couponId: string) => void,
) {
  const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
    const couponId = remoteMessage.data?.couponId;
    if (couponId) onForeground(String(couponId));
  });

  messaging().onNotificationOpenedApp((remoteMessage) => {
    const couponId = remoteMessage?.data?.couponId;
    if (couponId) onOpen(String(couponId));
  });

  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      const couponId = remoteMessage?.data?.couponId;
      if (couponId) onOpen(String(couponId));
    });

  return unsubscribeForeground;
}
