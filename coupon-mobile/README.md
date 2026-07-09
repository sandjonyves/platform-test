# Plateform-Test Mobile

Application React Native (Android, sans Expo) pour les opérateurs : connexion, gestion des coupons, validation/rejet, envoi d'emails et notifications Firebase.

## Prérequis

- Node.js 22+
- JDK 17
- Android Studio (SDK 36, NDK)
- Backend `coupon-web` en cours d'exécution
- Projet Firebase configuré (voir [FIREBASE_SETUP.md](./FIREBASE_SETUP.md))

## Installation

```bash
cd coupon-mobile
npm install
```

### Configuration Firebase

1. Suivre [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
2. Remplacer `android/app/google-services.json` par le fichier téléchargé depuis Firebase Console

### URL de l'API

Par défaut dans `src/config.ts` :

| Environnement | URL |
|---------------|-----|
| Développement (téléphone WiFi) | `http://192.168.0.108:3000/api` (IP LAN du PC) |
| Développement (émulateur) | `http://10.0.2.2:3000/api` |
| Production | `https://plateform-test.cm/api` |

**Important :** le téléphone et le PC doivent être sur le **même réseau WiFi**. Modifie `DEV_API_HOST` dans `src/config.ts` si ton IP change (`hostname -I`).

Alternative USB :
```bash
adb reverse tcp:3000 tcp:3000
```
Puis mets `DEV_API_HOST = 'localhost'` dans `src/config.ts`.

### Voir les logs de debug

**Terminal 1 — Metro (logs JS) :**
```bash
npm start
```

**Terminal 2 — Logs Android :**
```bash
npx react-native log-android
# ou
adb logcat *:S ReactNative:V ReactNativeJS:V
```

Les requêtes API s'affichent avec le préfixe `[API]` dans la console.

## Lancement

```bash
# Terminal 1 — Metro
npm start

# Terminal 2 — Android
npm run android
```

## Fonctionnalités

- **Connexion** : JWT + enregistrement du token FCM
- **Accueil** : liste des coupons avec filtres (tous, en attente, validés, rejetés) et pull-to-refresh
- **Détail coupon** : validation/rejet par code, actions globales, envoi d'email de confirmation
- **Profil** : informations du compte et déconnexion
- **Notifications** : alerte à la réception d'un nouveau coupon (via FCM)

## Structure

```
src/
├── api/          # Client HTTP et endpoints
├── components/   # UI réutilisable
├── context/      # AuthContext
├── navigation/   # Stacks et tabs
├── screens/      # Écrans
├── services/     # Stockage JWT, notifications
├── theme/        # Couleurs et espacements
└── types/        # Types TypeScript
```

## Checklist de tests manuels

- [ ] Connexion avec un compte opérateur existant
- [ ] Affichage de la liste des coupons et des filtres
- [ ] Pull-to-refresh sur l'accueil
- [ ] Ouverture du détail d'un coupon
- [ ] Validation / rejet d'un code individuel
- [ ] Envoi de l'email de confirmation (`Confirmer et envoyer l'email`)
- [ ] Réception d'une notification push à la création d'un coupon (POST `/api/coupons`)
- [ ] Tap sur la notification → ouverture du détail coupon
- [ ] Affichage du profil et déconnexion

## Backend requis

Le backend doit exposer :

- `POST /api/auth/login` avec `fcmToken`
- Routes coupons protégées par JWT (sauf `POST /api/coupons` public)
- Variable `FIREBASE_SERVICE_ACCOUNT` pour l'envoi des notifications

Voir la documentation backend dans `../coupon-web/`.
