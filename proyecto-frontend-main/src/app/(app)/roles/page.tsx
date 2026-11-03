"use client";

import {
  Compass,
  Crown,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { roleLabel } from "@/components/shared/role-badge";
import type { RoleCode } from "@/lib/types";
import { useAppData } from "@/providers/data-provider";

const roleVisualConfig: Record<
  RoleCode,
  {
    icon: typeof ShieldCheck;
    badgeBg: string;
    iconColor: string;
    borderAccent: string;
  }
> = {
  ADMINISTRADOR: {
    icon: ShieldCheck,
    badgeBg: "bg-indigo-50 dark:bg-indigo-950/40",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    borderAccent: "hover:border-indigo-300 dark:hover:border-indigo-800",
  },
  RECTOR: {
    icon: Crown,
    badgeBg: "bg-amber-50 dark:bg-amber-950/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderAccent: "hover:border-amber-300 dark:hover:border-amber-800",
  },
  COORDINADOR: {
    icon: Compass,
    badgeBg: "bg-sky-50 dark:bg-sky-950/40",
    iconColor: "text-sky-600 dark:text-sky-400",
    borderAccent: "hover:border-sky-300 dark:hover:border-sky-800",
  },
  DOCENTE: {
    icon: GraduationCap,
    badgeBg: "bg-blue-50 dark:bg-blue-950/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderAccent: "hover:border-blue-300 dark:hover:border-blue-800",
  },
  PSICORIENTADOR: {
    icon: HeartHandshake,
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderAccent: "hover:border-emerald-300 dark:hover:border-emerald-800",
  },
  ESTUDIANTE: {
    icon: GraduationCap,
    badgeBg: "bg-slate-50 dark:bg-slate-950/40",
    iconColor: "text-slate-600 dark:text-slate-400",
    borderAccent: "hover:border-slate-300 dark:hover:border-slate-800",
  },
  ACUDIENTE: {
    icon: Users,
    badgeBg: "bg-purple-50 dark:bg-purple-950/40",
    iconColor: "text-purple-600 dark:text-purple-400",
    borderAccent: "hover:border-purple-300 dark:hover:border-purple-800",
  },
};

export default function RolesPage() {
  const { matrix, setPermission, catalogRoles, catalogPermisos } = useAppData();
  const roles = catalogRoles.map((role) => ({
    id: role.nombre as RoleCode,
    name: roleLabel(role.nombre as RoleCode),
    description: role.descripcion ?? "",
  }));
  const permissions = catalogPermisos.map((permiso) => ({
    id: permiso.codigo,
    module: permiso.codigo.split(".")[0] ?? "",
    label: permiso.nombre,
    description: permiso.descripcion ?? "",
  }));

  return (
    <div>
      <PageHeader
        title="Roles y permisos"
        description="Matriz RBAC del prototipo. Cada interruptor muestra —y simula— lo que puede hacer un rol."
        crumbs={[{ href: "/", label: "Inicio" }, { label: "Roles y permisos" }]}
      />

      <div className="mb-6 grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((role) => {
          const config = roleVisualConfig[role.id];
          const Icon = config.icon;

          return (
            <Card
              key={role.id}
              size="sm"
              className={`transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border border-border/80 ${config.borderAccent}`}
            >
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                <div
                  className={`flex size-10 items-center justify-center rounded-lg shadow-2xs ${config.badgeBg} ${config.iconColor}`}
                >
                  <Icon className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">{role.name}</CardTitle>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
                    Rol RBAC
                  </span>
                </div>
              </CardHeader>
              <CardContent className="text-xs leading-relaxed text-muted-foreground pt-0">
                {role.description}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matriz de permisos</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-56">Permiso</TableHead>
                {roles.map((role) => {
                  const config = roleVisualConfig[role.id];
                  const Icon = config.icon;
                  return (
                    <TableHead key={role.id} className="text-center">
                      <div className="flex items-center justify-center gap-1.5 font-medium">
                        <Icon className={`size-3.5 ${config.iconColor}`} />
                        <span>{role.name}</span>
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell>
                    <p className="font-medium">{permission.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {permission.module} · {permission.id}
                    </p>
                  </TableCell>
                  {roles.map((role) => {
                    const enabled = matrix[role.id]?.includes(permission.id) ?? false;
                    return (
                      <TableCell key={role.id} className="text-center">
                        <Switch
                          checked={enabled}
                          onCheckedChange={(checked) => {
                            setPermission(role.id as RoleCode, permission.id, checked);
                            toast.success("Permiso actualizado", {
                              description: `${role.name}: ${permission.label}`,
                            });
                          }}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
