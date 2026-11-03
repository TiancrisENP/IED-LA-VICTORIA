"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { authApi } from "@/lib/api";
import { mapUsuarioToPerson, type SessionUser } from "@/lib/api/mappers";
import type { Person, RoleCode } from "@/lib/types";

interface SessionContextValue {
  role: RoleCode;
  setRole: (role: RoleCode) => void;
  currentUser: Person;
  session: SessionUser | null;
  loading: boolean;
  login: (usuario: string, contrasena: string) => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const guest: Person = {
  id: "0",
  documentType: "CC",
  documentNumber: "",
  firstNames: "Sesión",
  lastNames: "no iniciada",
  birthDate: "",
  email: "",
  phone: "",
  status: "INACTIVO",
  roleIds: ["ESTUDIANTE"],
};

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .me()
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (usuario: string, contrasena: string) => {
    const result = await authApi.login(usuario, contrasena);
    authApi.persist();
    setSession(result.user);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setSession(null);
  }, []);

  const role = (session?.rol as RoleCode) ?? "ESTUDIANTE";
  const currentUser = session ? mapUsuarioToPerson(session) : guest;

  const setRole = useCallback((_next: RoleCode) => {
    // El rol real lo determina el backend.
  }, []);

  const value = useMemo(
    () => ({
      role,
      setRole,
      currentUser,
      session,
      loading,
      login,
      logout,
    }),
    [role, setRole, currentUser, session, loading, login, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}

export function useCurrentRoleLabel() {
  const { session, role } = useSession();
  return session?.rol ?? role;
}
