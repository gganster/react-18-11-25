import {createContext, useContext, useState} from 'react';
import { useQuery } from '@tanstack/react-query';
import type { User } from '@/type';
import { authCtx } from './AuthCtx.hook';

export const AuthProvider = ({children} : {children: React.ReactNode}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useQuery({
    queryKey: ['autologin'],
    queryFn: () => autologin(),
  });

  const autologin = async () => {
  }

  const login = async (email: string, password: string) => {
    return null;
  }

  const register = async (email: string, password: string) => {
    return null;
  }

  const logout = () => {
  }

  return (
    <authCtx.Provider value={{user, token, loading, login, register, logout}}>
      {children}
    </authCtx.Provider>
  );
}