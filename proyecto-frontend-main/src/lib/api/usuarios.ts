import { api } from "./client";
import type { ApiUsuario } from "./mappers";

export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; pageCount: number };
}

export const usuariosApi = {
  list(params: Record<string, string | number | undefined> = {}) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value != null && value !== "") query.set(key, String(value));
    }
    const suffix = query.size ? `?${query}` : "";
    return api<Paginated<ApiUsuario>>(`/usuarios${suffix}`);
  },
  get(id: number) {
    return api<ApiUsuario>(`/usuarios/${id}`);
  },
  create(body: Record<string, unknown>) {
    return api<ApiUsuario>("/usuarios", { method: "POST", body: JSON.stringify(body) });
  },
  update(id: number, body: Record<string, unknown>) {
    return api<ApiUsuario>(`/usuarios/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  },
  cargaMasiva(file: File) {
    const form = new FormData();
    form.append("file", file);
    return api<{ procesadas: number; ok: number; errores: number; filas: unknown[] }>(
      "/usuarios/carga-masiva",
      { method: "POST", body: form },
    );
  },
};
