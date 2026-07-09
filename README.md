# platform-test

Monorepo Plateform-Test — vérification de coupons prépayés.

## Structure

| Dossier | Description |
|---------|-------------|
| `coupon-web/` | Backend Express + interface web admin |
| `coupon-mobile/` | Application React Native Android (opérateurs) |

## Démarrage rapide

### Backend

```bash
cd coupon-web
npm install
cp .env.example .env   # configurer DATABASE_URL, Firebase, etc.
npm start
```

### Mobile

```bash
cd coupon-mobile
npm install
npm run android
```

Voir les README de chaque sous-projet pour la configuration détaillée.

## Déploiement

- Backend : Docker + VPS (voir `coupon-web/.github/workflows/`)
- Mobile : build APK via `cd coupon-mobile/android && ./gradlew assembleRelease`
