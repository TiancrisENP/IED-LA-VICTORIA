import { Badge } from "@/components/ui/badge";
import type { RoleCode } from "@/lib/types";

const ROLE_NAMES: Record<RoleCode, string> = {
  ADMINISTRADOR: "Administrador",
  RECTOR: "Rector",
  COORDINADOR: "Coordinador",
  DOCENTE: "Docente",
  PSICORIENTADOR: "Psicorientador",
  ESTUDIANTE: "Estudiante",
  ACUDIENTE: "Acudiente",
};

export function roleLabel(role: RoleCode) {
  return ROLE_NAMES[role] ?? role;
}

export function RoleBadge({ role }: { role: RoleCode }) {
  return (
    <Badge variant="secondary" className="font-normal">
      {roleLabel(role)}
    </Badge>
  );
}
