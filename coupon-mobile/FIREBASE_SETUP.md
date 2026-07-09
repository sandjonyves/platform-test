# Configuration Firebase — Plateform-Test Mobile

Ce guide décrit la création du projet Firebase pour l'application Android et la configuration du backend.

## 1. Créer le projet Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquer sur **Ajouter un projet**
3. Nom suggéré : `plateform-test-mobile`
4. Désactiver Google Analytics si non nécessaire (optionnel)
5. Créer le projet

## 2. Ajouter l'application Android

1. Dans le projet Firebase, cliquer sur l'icône Android
2. Renseigner :
   - **Nom du package Android** : `com.couponmobile`
   - **Surnom de l'app** : Plateform-Test (optionnel)
3. Télécharger `google-services.json`
4. Placer le fichier dans :

```
coupon-mobile/android/app/google-services.json
```

(Remplace le fichier placeholder existant.)

## 3. Activer Cloud Messaging

1. Dans Firebase Console → **Build** → **Cloud Messaging**
2. Vérifier que l'API Firebase Cloud Messaging est activée
3. Aucune clé serveur legacy n'est requise — le backend utilise Firebase Admin SDK

## 4. Compte de service pour le backend

1. Firebase Console → **Paramètres du projet** (engrenage) → **Comptes de service**
2. Cliquer sur **Générer une nouvelle clé privée**
3. Télécharger le fichier JSON (ex. `plateform-test-mobile-firebase-adminsdk.json`)

### Configuration backend (`coupon-web`)

**Option recommandée** — chemin vers le fichier JSON dans `.env` :

```env
FIREBASE_SERVICE_ACCOUNT_PATH=./bloodlink2-76cd2-firebase-adminsdk-fbsvc-c31d006507.json
```

**Option alternative** — JSON sur une seule ligne (dotenv ne supporte pas le JSON multiligne) :

```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",...}
```

**Ne jamais committer** le fichier de compte de service dans Git.

## 5. Vérification

### Mobile

```bash
cd coupon-mobile
npm run android
```

À la connexion, le token FCM est envoyé au backend via `POST /api/auth/login`.

### Backend

Après connexion mobile, vérifier en base que le champ `fcmToken` est renseigné sur l'utilisateur.

Créer un coupon test :

```bash
curl -X POST http://localhost:3000/api/coupons \
  -H "Content-Type: application/json" \
  -d '{"type":"NEOSURF","montant":"10","devise":"EURO","codes":["ABC123"],"email":"test@example.com"}'
```

L'opérateur connecté sur mobile doit recevoir une notification.

## 6. Dépannage

| Problème | Solution |
|----------|----------|
| Pas de token FCM | Vérifier `google-services.json`, package `com.couponmobile`, permissions notifications Android 13+ |
| Notification non reçue | Vérifier `FIREBASE_SERVICE_ACCOUNT` côté backend et `fcmToken` en base |
| Erreur réseau en dev | Utiliser `10.0.2.2` (émulateur) ou IP LAN (appareil physique) dans `src/config.ts` |
| Build Gradle échoue | Vérifier que le plugin `google-services` est appliqué et que `google-services.json` est valide |

## Canal de notification Android

Le canal `coupons` est créé automatiquement au démarrage de l'app (`MainApplication.kt`). Le backend envoie les notifications sur ce canal.
