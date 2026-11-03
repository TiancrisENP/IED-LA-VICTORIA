import type { LucideIcon } from "lucide-react";
import {
  BookMarked,
  BookOpen,
  ClipboardList,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  Link2,
  ScrollText,
  Shield,
  Users,
  UsersRound,
} from "lucide-react";

import type { RoleCode } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: RoleCode[];
}

const ALL: RoleCode[] = [
  "ADMINISTRADOR",
  "RECTOR",
  "COORDINADOR",
  "DOCENTE",
  "PSICORIENTADOR",
  "ESTUDIANTE",
  "ACUDIENTE",
];

export const navItems: NavItem[] = [
  {
    href: "/",
    label: "Inicio",
    icon: LayoutDashboard,
    roles: ALL,
  },
  {
    href: "/usuarios",
    label: "Usuarios",
    icon: Users,
    roles: ["ADMINISTRADOR", "RECTOR", "COORDINADOR"],
  },
  {
    href: "/roles",
    label: "Roles y permisos",
    icon: Shield,
    roles: ["ADMINISTRADOR"],
  },
  {
    href: "/academico",
    label: "Estructura académica",
    icon: GraduationCap,
    roles: ["ADMINISTRADOR", "RECTOR", "COORDINADOR"],
  },
  {
    href: "/matriculas",
    label: "Matrículas",
    icon: ClipboardList,
    roles: ["ADMINISTRADOR", "RECTOR", "COORDINADOR"],
  },
  {
    href: "/asignaciones",
    label: "Asignaciones",
    icon: BookOpen,
    roles: ["ADMINISTRADOR", "RECTOR", "COORDINADOR"],
  },
  {
    href: "/vinculos",
    label: "Vínculos",
    icon: Link2,
    roles: ["ADMINISTRADOR", "COORDINADOR"],
  },
  {
    href: "/excusas",
    label: "Excusas",
    icon: BookMarked,
    roles: ["ADMINISTRADOR", "COORDINADOR", "DOCENTE", "ESTUDIANTE", "ACUDIENTE"],
  },
  {
    href: "/convivencia",
    label: "Convivencia",
    icon: HeartHandshake,
    roles: ["ADMINISTRADOR", "COORDINADOR", "DOCENTE", "PSICORIENTADOR"],
  },
  {
    href: "/auditoria",
    label: "Auditoría",
    icon: ScrollText,
    roles: ["ADMINISTRADOR", "RECTOR", "COORDINADOR"],
  },
  {
    href: "/mis-cursos",
    label: "Mis cursos",
    icon: BookMarked,
    roles: ["DOCENTE"],
  },
  {
    href: "/consulta",
    label: "Consulta estudiantil",
    icon: HeartHandshake,
    roles: ["PSICORIENTADOR"],
  },
  {
    href: "/acudidos",
    label: "Mis acudidos",
    icon: UsersRound,
    roles: ["ACUDIENTE"],
  },
];

export function navForRole(role: RoleCode) {
  return navItems.filter((item) => item.roles.includes(role));
}
