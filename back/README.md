# Backend NestJS - Progression

Backend API pour le projet Progression avec Firebase/Firestore.

## Installation

```bash
cd back
pnpm install
```

## Configuration

1. Créer un compte de service Firebase :
   - Va dans Firebase Console > Project Settings > Service Accounts
   - Clique "Generate new private key"
   - Télécharge le fichier JSON

2. Renseigne les variables dans `.env` :
   ```env
   FIREBASE_PRIVATE_KEY_ID=...
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_CLIENT_ID=...
   ```

## Lancement

```bash
# Mode développement (watch)
pnpm start:dev

# Mode production
pnpm build
pnpm start:prod
```

Le serveur démarre sur `http://localhost:3001`

## API Endpoints

### Missions

- `GET /api/missions` - Liste toutes les missions
- `GET /api/missions/current` - Missions de la rotation actuelle (3h)
- `GET /api/missions/:id` - Détails d'une mission
- `POST /api/missions` - Créer une mission
  ```json
  { "title": "...", "category": "horreur", "difficulty": "easy" }
  ```
- `PUT /api/missions/:id` - Modifier une mission (pin/unpin)
  ```json
  { "isPinned": true }
  ```
- `DELETE /api/missions/:id` - Supprimer une mission

### Status

- `GET /api` - Status du backend

## Structure

```
back/
├── src/
│   ├── app/           # Module principal
│   ├── config/        # Configuration Firebase
│   └── modules/
│       └── missions/  # Module missions
│           ├── missions.controller.ts
│           ├── missions.service.ts
│           ├── missions.module.ts
│           └── missions.interface.ts
├── package.json
├── tsconfig.json
└── nest-cli.json
```
