import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
  EventType,
} from '@notifee/react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import { authApi } from '../api/auth';
import { requestCouponRefresh } from './couponRefresh';

/** Nouveau canal : Android ne met pas à jour importance/visibilité d'un canal existant. */
const CHANNEL_ID = 'coupons_v4';

/** Double vibration style WhatsApp : buzz, pause, buzz (Notifee : valeurs paires positives) */
const DOUBLE_VIBRATION_NOTIFEE = [250, 200, 250, 200];

type RemoteMessage = FirebaseMessagingTypes.RemoteMessage;

type NotificationHandlers = {
  onNavigateToCoupons: () => void;
};

export async function ensureNotificationChannel(): Promise<string> {
  return notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Coupons',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
    vibrationPattern: DOUBLE_VIBRATION_NOTIFEE,
    visibility: AndroidVisibility.PUBLIC,
    badge: true,
  });
}

export async function displayCouponNotification(
  remoteMessage: RemoteMessage,
): Promise<void> {
  const channelId = await ensureNotificationChannel();
  const title = remoteMessage.notification?.title || 'Nouveau coupon';
  const body =
    remoteMessage.notification?.body || 'Un nouveau coupon est disponible';

  await notifee.displayNotification({
    id: remoteMessage.data?.couponId
      ? `coupon-${remoteMessage.data.couponId}`
      : `coupon-${Date.now()}`,
    title,
    body,
    data: remoteMessage.data ?? {},
    android: {
      channelId,
      smallIcon: 'ic_notification',
      pressAction: { id: 'default', launchActivity: 'default' },
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      category: AndroidCategory.MESSAGE,
      sound: 'default',
      vibrationPattern: DOUBLE_VIBRATION_NOTIFEE,
      lightUpScreen: true,
      autoCancel: true,
    },
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (result !== PermissionsAndroid.RESULTS.GRANTED) {
      console.warn('[FCM] Permission POST_NOTIFICATIONS refusée');
      return false;
    }
    return true;
  }

  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const granted =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (!granted) {
      console.warn('[FCM] Permission messaging refusée');
    }
    return granted;
  }

  return true;
}

export async function getFcmToken(): Promise<string | null> {
  try {
    await requestNotificationPermission();

    const token = await messaging().getToken();
    if (__DEV__ && token) {
      console.log('[FCM] Token obtenu:', token.slice(0, 20) + '...');
    }
    return token;
  } catch (error) {
    console.warn('[FCM] token error:', error);
    return null;
  }
}

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

export async function initializeNotifications(): Promise<void> {
  await ensureNotificationChannel();
  await requestNotificationPermission();
}

export function setupNotificationHandlers({
  onNavigateToCoupons,
}: NotificationHandlers) {
  const handleTap = () => {
    if (__DEV__) console.log('[FCM] Tap notification → refresh + navigation');
    requestCouponRefresh();
    onNavigateToCoupons();
  };

  const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
    if (__DEV__) {
      console.log('[FCM] Message reçu (foreground):', remoteMessage.notification);
    }
    requestCouponRefresh();
    await displayCouponNotification(remoteMessage);
  });

  const unsubscribeNotifeeForeground = notifee.onForegroundEvent(({ type }) => {
    if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
      handleTap();
    }
  });

  const unsubscribeOpened = messaging().onNotificationOpenedApp(() => {
    handleTap();
  });

  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) handleTap();
    });

  notifee.getInitialNotification().then((initial) => {
    if (initial) handleTap();
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
    unsubscribeNotifeeForeground();
    unsubscribeOpened();
    unsubscribeTokenRefresh();
  };
}

export function registerBackgroundNotificationHandlers(): void {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    if (__DEV__) {
      console.log('[FCM] Message reçu (background):', remoteMessage.notification?.title);
    }
    // Data-only : afficher via Notifee. Sinon FCM affiche déjà la notification.
    if (!remoteMessage.notification) {
      await displayCouponNotification(remoteMessage);
    }
  });

  notifee.onBackgroundEvent(async ({ type }) => {
    if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
      if (__DEV__) console.log('[FCM] Notification tap (background notifee)');
      requestCouponRefresh();
    }
  });
}
