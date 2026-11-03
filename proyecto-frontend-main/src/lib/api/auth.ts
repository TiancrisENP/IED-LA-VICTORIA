import { api, clearTokens } from "./client";
import type { SessionUser } from "./mappers";

export interface LoginResponse {
  expiresIn: number;
  user: SessionUser;
}

export const authApi = {
  login(usuario: string, contrasena: string) {
    return api<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ usuario, contrasena }),
    });
  },
  me() {
    return api<SessionUser>("/auth/me");
  },
  refresh() {
    return api<LoginResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },
  persist() {
    clearTokens();
  },
  async logout() {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      /* la cookie puede haber vencido */
    }
    clearTokens();
  },
};
