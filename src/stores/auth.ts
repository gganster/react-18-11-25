import { create } from 'zustand'
import type { User } from '@/type'

type AuthStore = {
  token: string | null
  user: User | null
  loading: boolean
  autologin: () => Promise<User | null>,
  login: (email: string, password: string) => Promise<User | null>,
  register: (email: string, password: string) => Promise<User | null>,
  logout: () => void
}

const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  loading: true,

  autologin: async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        set({ loading: false, user: null, token: null });
        return null;
      }

      //check for expired token
      const unserializedToken = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      if (unserializedToken.exp < now) {
        localStorage.removeItem('token');
        set({ loading: false, user: null, token: null });
        return null;
      }

      const user: User = {
        id: unserializedToken.sub,
        email: unserializedToken.email,
      };

      set({ 
        token,
        user,
        loading: false
      });
      return user;
    } catch (e) {
      console.error(e);
      localStorage.removeItem('token');
      set({ loading: false, user: null, token: null });
      return null;
    }
  },
  login: async (email, password) => {
    try {
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) return null;

      const data = await res.json();
      const unserializedUser = JSON.parse(atob(data.accessToken.split('.')[1]));
      const user: User = {
        id: unserializedUser.sub,
        email: unserializedUser.email,
      };

      localStorage.setItem('token', data.accessToken);
      set({ 
        token: data.accessToken,
        user,
        loading: false
      });

      return user;
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  register: async (email, password) => {
    try {
      const res = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) return null;

      const data = await res.json();
      const unserializedUser = JSON.parse(atob(data.accessToken.split('.')[1]));
      const user: User = {
        id: unserializedUser.sub,
        email: unserializedUser.email,
      };

      localStorage.setItem('token', data.accessToken);
      set({ 
        token: data.accessToken,
        user,
        loading: false
      });

      return user;
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  logout: () => {
    set({ token: null, user: null, loading: false });
    localStorage.removeItem('token');
  },
}))

export default useAuthStore;