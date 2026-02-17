# BudgetApp

Application mobile de gestion de budget familial pour suivre les revenus et dépenses du foyer à deux.

## Fonctionnalités

- **Suivi des transactions** : revenus et dépenses avec catégories, descriptions et dates
- **Dashboard mensuel** : solde, total revenus/dépenses du mois en cours
- **Catégories personnalisables** : catégories par défaut (Alimentation, Loyer, Salaire...) avec icônes et couleurs
- **Graphiques** : répartition par catégorie (camembert) et évolution mensuelle (barres)
- **Multi-utilisateurs** : chaque membre du foyer a son compte (authentification JWT)
- **URL serveur configurable** : modifiable directement depuis l'app

## Stack technique

| Couche | Technologies |
|--------|-------------|
| **Mobile** | React Native, Expo SDK 54, Expo Router v6, TypeScript |
| **State** | Zustand (auth), TanStack React Query (données serveur) |
| **UI** | victory-native + Skia (graphiques), react-hook-form + Zod (formulaires) |
| **Backend** | Node.js, Express, PostgreSQL |
| **Auth** | JWT + bcrypt, expo-secure-store |
| **Hébergement** | Railway (backend + PostgreSQL) |

## Prérequis

- [Node.js](https://nodejs.org/) v18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npx expo`)
- Un compte [Railway](https://railway.app) (plan gratuit suffisant pour commencer)
- Un compte [Expo](https://expo.dev) (pour le build APK)

## Installation rapide

### 1. Cloner le projet

```bash
git clone https://github.com/VOTRE_USERNAME/budgetapp.git
cd budgetapp
npm install
cd backend && npm install && cd ..
```

### 2. Déployer le backend sur Railway

1. Créez un projet sur [railway.app](https://railway.app) depuis votre repo GitHub
2. Ajoutez une base **PostgreSQL** au projet
3. Configurez les variables d'environnement :

| Variable | Valeur |
|----------|--------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | chaîne aléatoire (`openssl rand -hex 32`) |
| `USER1_USERNAME` | prénom utilisateur 1 |
| `USER1_PASSWORD` | mot de passe utilisateur 1 |
| `USER1_NAME` | Nom affiché utilisateur 1 |
| `USER2_USERNAME` | prénom utilisateur 2 |
| `USER2_PASSWORD` | mot de passe utilisateur 2 |
| `USER2_NAME` | Nom affiché utilisateur 2 |

> `DATABASE_URL` et `PORT` sont injectés automatiquement par Railway.

4. Lancez le seed une fois (voir [guide détaillé](GETTING_STARTED.md#étape-6--lancer-le-seed-une-seule-fois))
5. Générez un domaine public dans **Settings → Networking**

### 3. Installer l'app mobile

**Expo Go (pour tester) :**
```bash
npx expo start
# Scannez le QR code avec Expo Go sur Android
```

**APK autonome :**
```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

### 4. Configurer l'URL du serveur

Dans l'app → **Paramètres** → **URL du serveur**, entrez l'URL Railway :
```
https://votre-app.up.railway.app
```

## Structure du projet

```
BudgetApp/
├── app/                    # Écrans (Expo Router)
│   ├── (auth)/login.tsx    # Connexion
│   ├── (tabs)/             # Navigation principale
│   │   ├── index.tsx       # Dashboard
│   │   ├── transactions.tsx
│   │   ├── add.tsx         # Nouvelle transaction
│   │   ├── analytics.tsx   # Graphiques
│   │   └── settings.tsx    # Paramètres
│   └── transaction/[id].tsx # Détail/édition
├── backend/                # API Express + PostgreSQL
│   └── src/
│       ├── controllers/
│       ├── services/
│       ├── database/       # Migrations, seed, connexion
│       └── middleware/      # Auth JWT
├── components/             # Composants réutilisables
├── hooks/                  # React Query hooks
├── store/                  # Zustand (auth)
├── lib/                    # Axios client, secure storage
├── types/                  # Types TypeScript
└── constants/              # Thème, catégories, config API
```

## Développement local

Pour travailler sur le code en local, vous aurez besoin d'une instance PostgreSQL locale :

```bash
# Backend (avec PostgreSQL local)
cp backend/.env.example backend/.env
# Éditez backend/.env avec votre DATABASE_URL locale
cd backend && npm run seed && npm run dev

# Frontend
npx expo start
```

## Licence

MIT
