import { Platform } from 'react-native';

/**
 * Configuration API
 *
 * En debug (__DEV__), l'app appelle le serveur web local sur le port 3000 :
 *   USB + adb reverse          : localhost (après: adb reverse tcp:3000 tcp:3000)
 *   Téléphone physique (WiFi) : IP LAN du PC sur le même réseau (ip addr → 192.168.x.x)
 *   Émulateur Android          : 10.0.2.2
 * En release, l'app appelle toujours l'API de production.
 */
export const DEV_API_HOST = 'localhost';

export const API_BASE_URL = __DEV__
  ? `http://${DEV_API_HOST}:3000/api`
  : 'https://plateform-test.cm/api';

if (__DEV__) {
  console.log('[API] Base URL:', API_BASE_URL);
}
