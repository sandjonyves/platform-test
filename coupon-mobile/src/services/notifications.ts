import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import { authApi } from '../api/auth';

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (result !== PermissionsAndroid.RESULTS.GRANTED) {
      console.warn('[FCM] Permission POST_NOTIFICATIONS refusée');
      return false;
    }
  }

  const authStatus = await messaging().requestPermission();
  const granted =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!granted) {
    console.warn('[FCM] Permission messaging refusée');
  }

  return granted;
}

export async function getFcmToken(): Promise<string | null> {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return null;

    const token = await messaging().getToken();
    if (__DEV__) {
      console.log('[FCM] Token obtenu:', token?.slice(0, 20) + '...');
    }
    return token;
  } catch (error) {
    console.warn('[FCM] token error:', error);
    return null;
  }
}

/** Enregistre le token FCM sur le backend si l'utilisateur est connecté */
export async function syncFcmTokenWithBackend(): Promise<void> {
  const token = await getFcmToken();
  if (!token) return;

  try {
    await authApi.updateFcmToken(token);
    if (__DEV__) console.log('[FCM] Token synchronisé avec le backend');
  } catch (error) {
    console.warn('[FCM] Échec sync token backend:', error);
  }
}

export function setupNotificationHandlers(onNavigateToCoupons: () => void) {
  const goToCoupons = () => {
    if (__DEV__) console.log('[FCM] Redirection vers la liste des coupons');
    onNavigateToCoupons();
  };

  const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
    if (__DEV__) {
      console.log('[FCM] Message reçu (foreground):', remoteMessage.notification);
    }
    goToCoupons();
  });

  messaging().onNotificationOpenedApp(() => {
    goToCoupons();
  });

  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) goToCoupons();
    });

  const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
    if (__DEV__) console.log('[FCM] Token rafraîchi');
    try {
      await authApi.updateFcmToken(newToken);
    } catch {
      // utilisateur peut ne pas être connecté
    }
  });

  return () => {
    unsubscribeForeground();
    unsubscribeTokenRefresh();
  };
}
