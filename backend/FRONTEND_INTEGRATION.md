# Intégration Frontend - Google OAuth

## Flux complet côté frontend

### 1. Bouton "Se connecter avec Google"

```tsx
// Login.tsx
import { useState } from 'react';

function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      // Récupérer l'URL d'autorisation Google
      const response = await fetch('http://localhost:3000/auth/google');
      const { authUrl } = await response.json();

      // Rediriger vers Google
      window.location.href = authUrl;
    } catch (error) {
      console.error('Erreur OAuth:', error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={loading}
      className="google-login-btn"
    >
      {loading ? 'Connexion...' : 'Se connecter avec Google'}
    </button>
  );
}
```

### 2. Page de callback OAuth

Créer une route `/auth/callback?token=xxxx` pour gérer le retour de Google:

```tsx
// src/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';

function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setToken, setUser } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('Erreur OAuth:', error);
      navigate('/login?error=' + error);
      return;
    }

    if (token) {
      // Décoder le JWT pour extraire les infos user
      const payload = JSON.parse(atob(token.split('.')[1]));

      const user = {
        id: payload.sub,
        email: payload.email
      };

      // Stocker le token et user dans le store
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);

      // Rediriger vers le dashboard
      navigate('/dashboard');
    } else {
      navigate('/login?error=no_token');
    }
  }, [searchParams, navigate, setToken, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="spinner"></div>
        <p className="mt-4">Authentification en cours...</p>
      </div>
    </div>
  );
}

export default AuthCallback;
```

### 3. Router configuration

Ajouter la route callback dans votre router:

```tsx
// src/App.tsx ou routes.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthCallback from './pages/AuthCallback';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* ... autres routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

### 4. Store Zustand (optionnel - adapter si différent)

```tsx
// src/stores/auth.ts
import { create } from 'zustand';

type User = {
  id: number;
  email: string;
};

type AuthStore = {
  token: string | null;
  user: User | null;
  loading: boolean;

  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  autologin: () => Promise<User | null>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  loading: true,

  setToken: (token) => set({ token }),

  setUser: (user) => set({ user }),

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },

  autologin: async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      set({ loading: false, user: null, token: null });
      return null;
    }

    try {
      // Vérifier si le token est expiré
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;

      if (payload.exp < now) {
        localStorage.removeItem('token');
        set({ loading: false, user: null, token: null });
        return null;
      }

      const user: User = {
        id: payload.sub,
        email: payload.email,
      };

      set({ token, user, loading: false });
      return user;
    } catch (error) {
      console.error('Autologin error:', error);
      localStorage.removeItem('token');
      set({ loading: false, user: null, token: null });
      return null;
    }
  },
}));
```

---

## Interface utilisateur complète

### Page de Login avec les deux options

```tsx
// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login traditionnel
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erreur de connexion');
        return;
      }

      const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
      const user = { id: payload.sub, email: payload.email };

      localStorage.setItem('token', data.accessToken);
      useAuthStore.setState({ token: data.accessToken, user });

      navigate('/dashboard');
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Login Google
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/auth/google');
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      setError('Erreur OAuth');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <h2 className="text-3xl font-bold text-center">Connexion</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Formulaire traditionnel */}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Séparateur */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Ou</span>
          </div>
        </div>

        {/* Bouton Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Se connecter avec Google
        </button>
      </div>
    </div>
  );
}

export default Login;
```

---

## Gestion des erreurs

### Erreurs possibles

| Paramètre `error` | Description | Action |
|-------------------|-------------|--------|
| `missing_params` | Code ou state manquant dans le callback | Réessayer la connexion |
| `invalid_state` | Token CSRF invalide (sécurité) | Réessayer la connexion |
| `auth_failed` | Erreur lors de l'échange de tokens | Vérifier la configuration OAuth |
| `no_token` | Pas de token dans l'URL de callback | Erreur technique |

### Affichage des erreurs

```tsx
// Dans AuthCallback.tsx
useEffect(() => {
  const error = searchParams.get('error');

  if (error) {
    const errorMessages = {
      missing_params: 'Paramètres OAuth manquants',
      invalid_state: 'Erreur de sécurité CSRF',
      auth_failed: 'Échec de l\'authentification Google',
      no_token: 'Token manquant'
    };

    const message = errorMessages[error as keyof typeof errorMessages]
      || 'Erreur inconnue';

    // Afficher un toast ou une notification
    console.error('OAuth Error:', message);
    navigate('/login?error=' + message);
  }
}, [searchParams, navigate]);
```

---

## Styling - Bouton Google officiel

Pour respecter les guidelines Google:

```css
/* Google Login Button */
.google-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 10px 16px;
  background: white;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #3c4043;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.google-login-btn:hover {
  background: #f8f9fa;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.google-login-btn:active {
  background: #f1f3f4;
}

.google-login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## Testing

### Test manuel du flux OAuth

1. Démarrer le backend: `npm run backend`
2. Démarrer le frontend: `npm run dev`
3. Cliquer sur "Se connecter avec Google"
4. Autoriser l'accès sur la page Google
5. Vérifier la redirection vers `/auth/callback`
6. Vérifier le stockage du token dans localStorage
7. Vérifier la redirection vers `/dashboard`

### Vérifier le token JWT

```javascript
// Dans la console du navigateur
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);
// { sub: 1, email: "user@gmail.com", iat: ..., exp: ... }
```

---

## Production

### HTTPS obligatoire

En production, Google OAuth nécessite HTTPS:

```env
# .env.production
GOOGLE_CALLBACK_URL="https://votredomaine.com/auth/google/callback"
FRONTEND_URL="https://votredomaine.com"
```

### Configurer Google Cloud Console

1. Ajouter les URLs de production:
   - Origines JavaScript autorisées: `https://votredomaine.com`
   - URI de redirection: `https://votredomaine.com/auth/google/callback`

2. Vérifier le domaine dans Google Cloud Console

---

## Ressources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In Branding Guidelines](https://developers.google.com/identity/branding-guidelines)
- [google-auth-library npm](https://www.npmjs.com/package/google-auth-library)
