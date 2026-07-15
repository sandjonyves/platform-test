# Déploiement backend — Dokploy (plateform-test.cm)

Votre serveur utilise **Dokploy** (interface avec Projects, Deployments, Docker…).  
Le backend se trouve dans le dossier **`coupon-web`** du dépôt GitHub.

---

## Vue d'ensemble

```
GitHub (platform-test)
       │
       ▼ push sur main
   Dokploy (VPS)
       │
       ├── Build image Docker (coupon-web/dockerfile)
       ├── Variables d'environnement (.env)
       └── Domaine plateform-test.cm → port 3000
```

---

## Étape 1 — Pousser le code sur GitHub

Sur votre machine locale :

```bash
cd /chemin/vers/coupon
git add .
git commit -m "votre message"
git push origin main
```

Dokploy peut déployer automatiquement à chaque push (si activé), ou manuellement.

---

## Étape 2 — Ouvrir le projet dans Dokploy

1. Connectez-vous à Dokploy (votre capture d'écran : accueil « Welcome back, yves »)
2. Menu gauche → **Projects**
3. Ouvrez le projet existant (vous avez déjà **1 compose** pour `plateform-test.cm`)
4. Cliquez sur le service **Compose** (pas « app » ni « db »)

---

## Étape 3 — Configurer le dépôt Git

Dans l'onglet **General** / **Source** du service Compose :

| Champ | Valeur |
|-------|--------|
| **Repository** | `https://github.com/sandjonyves/platform-test` |
| **Branch** | `main` |
| **Root path** (ou *Build path*) | `coupon-web` |
| **Compose file** | `docker-compose.yml` |

> Important : le dépôt est un **monorepo** (`coupon-web` + `coupon-mobile`).  
> Sans `coupon-web` comme racine, le build échouera.

---

## Étape 4 — Variables d'environnement

Onglet **Environment** (ou **Env**) — ajoutez :

| Variable | Valeur |
|----------|--------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `HOST_PORT` | `3000` |
| `DATABASE_URL` | Votre URL PostgreSQL Neon |
| `JWT_SECRET` | Chaîne longue et secrète |
| `SESSION_SECRET` | Autre chaîne longue et secrète |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | `/app/firebase-adminsdk.json` |

### Firebase (2 options)

**Option A — Fichier monté (volume)**  
1. Uploadez `bloodlink2-76cd2-firebase-adminsdk-fbsvc-c31d006507.json` sur le VPS  
2. Dans **Mounts / Volumes** du service :
   - Hôte : chemin du fichier sur le serveur
   - Conteneur : `/app/firebase-adminsdk.json`
3. Gardez `FIREBASE_SERVICE_ACCOUNT_PATH=/app/firebase-adminsdk.json`

**Option B — Variable JSON (plus simple sur Dokploy)**  
1. Ouvrez le fichier JSON Firebase  
2. Copiez tout le contenu sur **une seule ligne**  
3. Ajoutez la variable :
   ```
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
   ```
4. Supprimez ou laissez vide `FIREBASE_SERVICE_ACCOUNT_PATH`

---

## Étape 5 — Domaine et HTTPS

Onglet **Domains** :

| Champ | Valeur |
|-------|--------|
| **Host** | `plateform-test.cm` |
| **Port** | `3000` |
| **HTTPS** | Activé (Let's Encrypt via Dokploy) |

Ajoutez aussi `www.plateform-test.cm` si besoin.

Dokploy configure le reverse proxy (Traefik) automatiquement — **pas besoin de nginx manuel**.

---

## Étape 6 — Lancer le déploiement

1. Cliquez sur **Deploy** (bouton en haut à droite du service)
2. Attendez la fin du build (1 à 3 minutes)
3. Statut attendu : **done** (point vert)

Suivi en temps réel :
- Onglet **Logs** du service
- Ou menu **Deployments** → dernier déploiement → **logs**

---

## Étape 7 — Vérifier que ça marche

```bash
# Site web
curl -I https://plateform-test.cm

# API
curl https://plateform-test.cm/api/coupons/pending
# (réponse 401 = normal sans token JWT)
```

Dans Dokploy, carte **STATUS** doit afficher : **1 running**.

---

## Mise à jour après modification du code

### Méthode automatique (recommandée)
1. **Projects** → votre compose → **General**
2. Activez **Auto Deploy** sur push `main`
3. Chaque `git push` redéploie automatiquement

### Méthode manuelle
1. `git push origin main`
2. Dokploy → **Projects** → service Compose → **Deploy**

---

## Commandes utiles dans Dokploy

| Action | Où cliquer |
|--------|------------|
| Voir les logs | Service → **Logs** |
| Redémarrer | Service → **Restart** |
| Historique | Menu **Deployments** |
| Monitoring | Menu **Monitoring** |
| Conteneurs Docker | Menu **Docker** |

---

## Dépannage

| Problème | Solution |
|----------|----------|
| Build échoue « input.css not found » | Vérifier **Root path** = `coupon-web` |
| `DATABASE_URL is not defined` | Ajouter la variable dans **Environment** |
| FCM ne marche pas | Vérifier Firebase (fichier monté ou `FIREBASE_SERVICE_ACCOUNT`) |
| 502 Bad Gateway | Vérifier que le conteneur tourne (STATUS running) et port **3000** |
| Ancien code encore en ligne | Relancer **Deploy** après le push |
| Erreur volume Firebase | Utiliser l'option B (variable JSON) |

---

## App mobile

L'URL API production est déjà configurée :

```
https://plateform-test.cm/api
```

(dans `coupon-mobile/src/config.ts`)

---

## Déploiement SSH manuel (alternative)

Si vous préférez la ligne de commande sans l'interface :

```bash
ssh user@votre-vps
cd /var/www/plateform-test/coupon-web   # adapter le chemin
git pull
docker compose up -d --build
docker compose logs -f
```

Voir aussi `.env.example` pour la liste complète des variables.
