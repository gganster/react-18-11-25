import {createContext, useContext} from "react";
import type { User } from "@/type";

export type AuthCtxType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
}

const authCtx = createContext<AuthCtxType>({
  user: null,
  token: null,
  loading: true,
  login: () => Promise.resolve(null),
  register: () => Promise.resolve(null),
  logout: () => {},
});

const useAuth = () => {
  return useContext(authCtx);
};

export { authCtx, useAuth };