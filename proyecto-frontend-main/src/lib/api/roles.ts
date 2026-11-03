import { api } from "./client";

export interface ApiPermiso {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
}

export interface ApiRol {
  id: number;
  nombre: string;
  descripcion?: string | null;
  permisos: ApiPermiso[];
}

export const rolesApi = {
  list() {
    return api<ApiRol[]>("/roles");
  },
  permisos() {
    return api<ApiPermiso[]>("/permisos");
  },
  updatePermisos(id: number, permisoIds: number[]) {
    return api<ApiRol>(`/roles/${id}/permisos`, {
      method: "PATCH",
      body: JSON.stringify({ permisoIds }),
    });
  },
};
