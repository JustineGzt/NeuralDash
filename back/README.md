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
# Mode développement Node.js/Express (watch)
pnpm dev

# Mode développement NestJS (si besoin)
pnpm dev:nest

# Mode production
pnpm build
pnpm start
```

Le serveur démarre sur `http://localhost:3001`

## Securite et SIEM

Le backend inclut:


Variables recommandees:
- config Nginx Docker: `deploy/nginx/progression.docker.conf`
- deploiement limite en ressources: `deploy/docker-compose.security.yml`
- image backend: `deploy/Dockerfile`
NODE_ENV=production
## Reverse Proxy Nginx durci

La configuration fournie applique:

- terminaison TLS avec redirection HTTP -> HTTPS
- `limit_req` pour limiter le debit par IP
- `limit_conn` pour limiter les connexions simultanees
- `client_max_body_size 1m` pour reduire l'impact des payloads abusifs
- timeouts courts contre slowloris et connexions pendantes
- logs JSON adaptes a un SIEM

## Limitation des ressources anti-DoS

Le fichier `deploy/docker-compose.security.yml` fixe des plafonds simples:

- backend Node.js: `0.50 CPU`, `256m RAM`, `128` PID max
- Nginx: `0.50 CPU`, `128m RAM`, `64` PID max
- systeme de fichiers en lecture seule
- `tmpfs` limites pour eviter l'ecriture disque non controlee
- `no-new-privileges` active

Exemple de lancement:

```bash
cd back/deploy
docker compose -f docker-compose.security.yml up -d --build
```

Avant de lancer en production, adapte:

- `progression.example.com`
- les certificats sous `deploy/nginx/certs`
- `ALLOWED_ORIGINS`
PORT=3001
ALLOWED_ORIGINS=https://ton-front.example.com
LOG_LEVEL=info
```

Pour le reverse proxy durci et la centralisation SIEM:

- config Nginx: `deploy/nginx/progression.conf`
- guide SSL/HTTPS: `deploy/nginx/INSTALLATION_SSL.md`
- guide SIEM: `deploy/siem/README.md`

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
