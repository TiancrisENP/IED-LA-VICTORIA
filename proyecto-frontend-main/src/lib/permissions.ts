import type { RoleCode } from "@/lib/types";

export function hasPermission(permisos: string[] | RoleCode, permissionId: string) {
  if (Array.isArray(permisos)) {
    return permisos.includes(permissionId);
  }
  return false;
}

export function canManageUsers(permisos: string[]) {
  return (
    permisos.includes("usuario.crear") ||
    permisos.includes("usuario.editar")
  );
}
