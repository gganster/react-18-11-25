# Backend API avec OAuth Google

## Routes disponibles

### Authentification traditionnelle

#### POST /register
Inscription avec email/password

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /login
Connexion avec email/password

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Authentification OAuth Google

#### GET /auth/google
Génère l'URL d'autorisation Google

**Response:**
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

**Usage frontend:**
```javascript
const response = await fetch('http://localhost:3000/auth/google');
const { authUrl } = await response.json();
window.location.href = authUrl;
```

#### GET /auth/google/callback
Callback Google OAuth (géré automatiquement)

**Query params:**
- `code`: Authorization code de Google
- `state`: CSRF token

**Redirect:**
```
http://localhost:5173/#/auth/callback?token=JWT_TOKEN
```

**Erreurs possibles:**
- `?error=missing_params` - Code ou state manquant
- `?error=invalid_state` - State token invalide (CSRF)
- `?error=auth_failed` - Erreur lors de l'authentification

---

### Tasks API (protégé par JWT)

#### GET /tasks/:userId
Liste des tasks d'un utilisateur

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
[
  {
    "userId": 1,
    "id": 1,
    "title": "Task title",
    "completed": false
  }
]
```

#### POST /tasks
Créer une nouvelle task

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request:**
```json
{
  "title": "New task",
  "completed": false
}
```

**Response:**
```json
{
  "userId": 1,
  "id": 10,
  "title": "New task",
  "completed": false
}
```

#### PUT /tasks/:id
Mettre à jour une task

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request:**
```json
{
  "title": "Updated title",
  "completed": true
}
```

**Response:**
```json
{
  "userId": 1,
  "id": 10,
  "title": "Updated title",
  "completed": true
}
```

#### DELETE /tasks/:id
Supprimer une task

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "id": 10
}
```

---

## Configuration

### Variables d'environnement (.env)

```env
JWT_SECRET="your-secret-key-change-in-production"
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"
FRONTEND_URL="http://localhost:5173"
```

### Google Cloud Console

1. Aller sur https://console.cloud.google.com/
2. Créer un projet (ou sélectionner un existant)
3. Activer l'API "Google+ API" ou "People API"
4. Créer des identifiants OAuth 2.0:
   - Type: Application Web
   - Origines JavaScript autorisées: `http://localhost:5173`
   - URI de redirection autorisés: `http://localhost:3000/auth/google/callback`
5. Copier Client ID et Client Secret dans `.env`

---

## Structure des données (db.json)

### Users avec support OAuth

```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "password": "$2a$10$...",
      "authProvider": "local",
      "googleId": null,
      "name": null,
      "picture": null
    },
    {
      "id": 2,
      "email": "googleuser@gmail.com",
      "password": null,
      "authProvider": "google",
      "googleId": "123456789",
      "name": "John Doe",
      "picture": "https://lh3.googleusercontent.com/..."
    },
    {
      "id": 3,
      "email": "both@example.com",
      "password": "$2a$10$...",
      "authProvider": "both",
      "googleId": "987654321",
      "name": "Jane Smith",
      "picture": "https://lh3.googleusercontent.com/..."
    }
  ],
  "tasks": [...]
}
```

**Champs users:**
- `id`: Identifiant unique
- `email`: Email de l'utilisateur
- `password`: Hash bcrypt (null si OAuth uniquement)
- `authProvider`: `"local"`, `"google"`, ou `"both"`
- `googleId`: ID Google unique (null si local uniquement)
- `name`: Nom complet (récupéré de Google)
- `picture`: URL de la photo de profil (récupéré de Google)

---

## Account Linking

Le backend supporte l'account linking:

1. **User crée un compte local** (`authProvider: "local"`)
2. **User se connecte avec Google** avec le même email
3. **Backend met à jour** l'user:
   - `authProvider: "both"`
   - `googleId: "123..."`
   - Conserve le `password` existant

L'utilisateur peut alors se connecter avec email/password OU Google OAuth.

---

## Sécurité

### CSRF Protection
- Token `state` généré aléatoirement (32 bytes hex)
- Stocké en mémoire pendant 10 minutes max
- Validé au callback

### JWT
- Payload: `{ sub: userId, email: userEmail }`
- Expiration: 24h
- Secret: Variable d'environnement `JWT_SECRET`

### OAuth Scopes
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`

### ID Token Verification
- Vérifié avec `google-auth-library`
- Audience: `GOOGLE_CLIENT_ID`
- Signature Google validée automatiquement

---

## Démarrage

```bash
npm install
npm run backend
```

Le serveur écoute sur `http://localhost:3000`
