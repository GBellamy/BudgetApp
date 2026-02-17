# BudgetApp - Guide de démarrage

## Architecture
- **Frontend** : React Native / Expo (ce dossier)
- **Backend** : Node.js + Express + PostgreSQL (`backend/`)
- **Hébergement** : Backend sur Railway (cloud), accessible depuis n'importe quelle connexion internet

---

## 1. Déploiement du backend sur Railway

### Étape 1 : Pousser le code sur GitHub

```bash
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/VOTRE_USERNAME/budgetapp.git
git push -u origin main
```

### Étape 2 : Créer le projet Railway

1. Allez sur [railway.app](https://railway.app) et connectez-vous avec GitHub
2. Cliquez **New Project** → **Deploy from GitHub repo**
3. Sélectionnez votre repo `budgetapp`
4. Railway détecte automatiquement le `railway.json` à la racine

### Étape 3 : Ajouter PostgreSQL

Dans votre projet Railway :
1. Cliquez **+ New** → **Database** → **Add PostgreSQL**
2. Railway crée la base et injecte automatiquement `DATABASE_URL` dans votre service

### Étape 4 : Configurer les variables d'environnement

Dans votre service backend Railway → onglet **Variables**, ajoutez :

| Variable | Valeur |
|----------|--------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | une chaîne aléatoire longue (ex: `openssl rand -hex 32` dans le terminal) |
| `USER1_USERNAME` | votre prénom (minuscules) |
| `USER1_PASSWORD` | votre mot de passe |
| `USER1_NAME` | Votre Prénom |
| `USER2_USERNAME` | prénom compagne |
| `USER2_PASSWORD` | mot de passe compagne |
| `USER2_NAME` | Prénom Compagne |

> `DATABASE_URL` et `PORT` sont injectés automatiquement par Railway — ne les ajoutez pas manuellement.

### Étape 5 : Déployer

Railway déclenche automatiquement un build à chaque `git push`. Pour forcer le premier déploiement, cliquez **Deploy** dans l'interface.

Suivez les logs dans l'onglet **Deployments**. Une fois déployé :
```
BudgetApp backend running on http://0.0.0.0:XXXX
```

### Étape 6 : Lancer le seed (une seule fois)

1. Dans votre service → onglet **Settings** → **Deploy** → **Start Command**
2. Remplacez temporairement par : `cd backend && npm run seed:prod`
3. Cliquez **Restart** et attendez la fin du seed dans les logs
4. Remettez la commande d'origine : `cd backend && npm start`
5. Cliquez **Restart**

> Avec Railway CLI : `railway run "cd backend && npm run seed:prod"`

### Étape 7 : Récupérer l'URL

1. Dans votre service Railway → onglet **Settings** → **Networking** → **Generate Domain**
2. Copiez l'URL (ex: `https://budgetapp-production-xxxx.up.railway.app`)

---

## 2. Installer l'app sur les téléphones

### Option A : Expo Go (rapide, pour tester)

1. Installez **[Expo Go](https://expo.dev/go)** sur les téléphones (Google Play)
2. Lancez le serveur de développement :
   ```bash
   npx expo start
   ```
3. Scannez le QR code avec Expo Go

> L'app s'arrête si le serveur de développement est arrêté. À utiliser pour tester.

### Option B : APK Android autonome (installation permanente)

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
# → Lien de téléchargement de l'APK fourni à la fin
# → Activez "Sources inconnues" dans les paramètres Android avant d'installer
```

---

## 3. Configurer l'URL du serveur dans l'app

Dans l'app → onglet **Paramètres** → **URL du serveur**, entrez l'URL Railway :
```
https://budgetapp-production-xxxx.up.railway.app
```
Sans barre oblique finale.

---

## 4. Déploiements suivants

Chaque `git push` déclenche un redéploiement automatique :
```bash
git add .
git commit -m "ma modification"
git push
```

---

## Comptes par défaut

| Utilisateur | Mot de passe |
|-------------|-------------|
| user1       | password123 |
| user2       | password123 |

Changez ces valeurs dans les variables d'environnement Railway avant de lancer le seed.

---

## Résolution de problèmes

| Problème | Solution |
|----------|----------|
| Build échoue | Vérifiez les logs Railway, souvent une erreur TypeScript |
| `DATABASE_URL` non définie | Vérifiez que PostgreSQL est bien lié au service dans Railway |
| Seed échoue | Vérifiez que le service a démarré au moins une fois (migrations exécutées) avant le seed |
| App ne se connecte pas | Vérifiez l'URL dans Paramètres (doit être `https://`, pas `http://`) |
| "Network request failed" | Vérifiez que l'URL Railway est correcte et sans barre oblique finale |
