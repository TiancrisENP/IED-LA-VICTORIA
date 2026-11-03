"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Lock,
  Pencil,
  RotateCcw,
  Upload,
  UserCheck,
  UserPlus,
  UserX,
} from "lucide-react";

import { ColumnHeaderFilter } from "@/components/shared/column-header-filter";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar, paginate } from "@/components/shared/pagination-bar";
import { RoleBadge } from "@/components/shared/role-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDocument, fullName } from "@/lib/format";
import { roleLabel } from "@/components/shared/role-badge";
import { canManageUsers } from "@/lib/permissions";
import type { RoleCode, UserStatus } from "@/lib/types";
import { useAppData } from "@/providers/data-provider";
import { useSession } from "@/providers/session-provider";

export default function UsersPage() {
  const { people, togglePersonStatus, catalogRoles } = useAppData();
  const { session } = useSession();
  const manage = canManageUsers(session?.permisos ?? []);
  const [nameSort, setNameSort] = useState<"asc" | "desc" | null>(null);
  const [nameFilter, setNameFilter] = useState("");
  const [docFilter, setDocFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const hasActiveFilters =
    nameSort !== null ||
    !!nameFilter.trim() ||
    !!docFilter.trim() ||
    !!emailFilter.trim() ||
    roleFilter !== "all" ||
    statusFilter !== "all";

  const clearAllFilters = () => {
    setNameSort(null);
    setNameFilter("");
    setDocFilter("");
    setEmailFilter("");
    setRoleFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  const filtered = useMemo(() => {
    const nf = nameFilter.trim().toLowerCase();
    const df = docFilter.trim().toLowerCase();
    const ef = emailFilter.trim().toLowerCase();

    const list = people.filter((person) => {
      const pName = fullName(person).toLowerCase();
      const pDoc = person.documentNumber.toLowerCase();
      const pEmail = person.email.toLowerCase();

      const matchesName = !nf || pName.includes(nf);
      const matchesDoc = !df || pDoc.includes(df);
      const matchesEmail = !ef || pEmail.includes(ef);
      const matchesRole =
        roleFilter === "all" || person.roleIds.includes(roleFilter as RoleCode);
      const matchesStatus =
        statusFilter === "all" || person.status === (statusFilter as UserStatus);

      return (
        matchesName &&
        matchesDoc &&
        matchesEmail &&
        matchesRole &&
        matchesStatus
      );
    });

    if (nameSort) {
      list.sort((a, b) => {
        const left = `${a.lastNames} ${a.firstNames}`.localeCompare(
          `${b.lastNames} ${b.firstNames}`,
          "es",
          { sensitivity: "base" }
        );
        return nameSort === "desc" ? -left : left;
      });
    }

    return list;
  }, [people, nameFilter, docFilter, emailFilter, roleFilter, statusFilter, nameSort]);

  const { rows, pageCount, total } = paginate(filtered, page);

  return (
    <div>
      <PageHeader
        title="Usuarios"
        description="Directorio de personas del sistema de identidad. Utilice los filtros integrados en cada encabezado para filtrar y ordenar el listado."
        crumbs={[{ href: "/", label: "Inicio" }, { label: "Usuarios" }]}
        actions={
          manage ? (
            <>
              <Button
                variant="outline"
                className="h-9"
                nativeButton={false}
                render={<Link href="/usuarios/carga-masiva" />}
              >
                <Upload />
                Carga masiva
              </Button>
              <Button
                className="h-9"
                nativeButton={false}
                render={<Link href="/usuarios/nuevo" />}
              >
                <UserPlus />
                Nuevo usuario
              </Button>
            </>
          ) : null
        }
      />

      <Card>
        <CardContent className="space-y-4">
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-foreground">
                  Filtros aplicados:
                </span>
                {nameSort && (
                  <Badge variant="outline" className="gap-1 bg-background text-[11px]">
                    Orden: {nameSort === "asc" ? "A → Z" : "Z → A"}
                  </Badge>
                )}
                {nameFilter && (
                  <Badge variant="outline" className="gap-1 bg-background text-[11px]">
                    Nombre: "{nameFilter}"
                  </Badge>
                )}
                {docFilter && (
                  <Badge variant="outline" className="gap-1 bg-background text-[11px]">
                    Doc: "{docFilter}"
                  </Badge>
                )}
                {emailFilter && (
                  <Badge variant="outline" className="gap-1 bg-background text-[11px]">
                    Correo: "{emailFilter}"
                  </Badge>
                )}
                {roleFilter !== "all" && (
                  <Badge variant="outline" className="gap-1 bg-background text-[11px]">
                    Rol: {roleLabel(roleFilter as RoleCode)}
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge variant="outline" className="gap-1 bg-background text-[11px]">
                    Estado: {statusFilter}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={clearAllFilters}
              >
                <RotateCcw className="size-3" />
                Limpiar filtros
              </Button>
            </div>
          )}

          {rows.length === 0 ? (
            <EmptyState
              title="Sin coincidencias"
              description="Ajuste los filtros de las columnas para ver personas del directorio."
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <ColumnHeaderFilter
                        title="Nombre"
                        sort={nameSort}
                        onSortChange={(s) => {
                          setNameSort(s);
                          setPage(1);
                        }}
                        filterValue={nameFilter}
                        onFilterChange={(v) => {
                          setNameFilter(v);
                          setPage(1);
                        }}
                        filterType="text"
                        placeholder="Buscar por nombre..."
                      />
                    </TableHead>
                    <TableHead>
                      <ColumnHeaderFilter
                        title="Documento"
                        filterValue={docFilter}
                        onFilterChange={(v) => {
                          setDocFilter(v);
                          setPage(1);
                        }}
                        filterType="text"
                        placeholder="Buscar documento..."
                      />
                    </TableHead>
                    <TableHead>
                      <ColumnHeaderFilter
                        title="Correo"
                        filterValue={emailFilter}
                        onFilterChange={(v) => {
                          setEmailFilter(v);
                          setPage(1);
                        }}
                        filterType="text"
                        placeholder="Buscar correo..."
                      />
                    </TableHead>
                    <TableHead>
                      <ColumnHeaderFilter
                        title="Rol"
                        filterValue={roleFilter}
                        onFilterChange={(v) => {
                          setRoleFilter(v);
                          setPage(1);
                        }}
                        filterType="select"
                        options={(catalogRoles.length
                          ? catalogRoles.map((r) => ({
                              label: roleLabel(r.nombre as RoleCode),
                              value: r.nombre,
                            }))
                          : [
                              { label: "Administrador", value: "ADMINISTRADOR" },
                              { label: "Coordinador", value: "COORDINADOR" },
                              { label: "Docente", value: "DOCENTE" },
                              { label: "Estudiante", value: "ESTUDIANTE" },
                              { label: "Acudiente", value: "ACUDIENTE" },
                            ])}
                      />
                    </TableHead>
                    <TableHead>
                      <ColumnHeaderFilter
                        title="Estado"
                        filterValue={statusFilter}
                        onFilterChange={(v) => {
                          setStatusFilter(v);
                          setPage(1);
                        }}
                        filterType="select"
                        options={[
                          { label: "Activo", value: "ACTIVO" },
                          { label: "Inactivo", value: "INACTIVO" },
                          { label: "Bloqueado", value: "BLOQUEADO" },
                        ]}
                      />
                    </TableHead>
                    <TableHead className="w-24 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell className="font-medium">{fullName(person)}</TableCell>
                      <TableCell className="tabular">
                        {formatDocument(person.documentType, person.documentNumber)}
                      </TableCell>
                      <TableCell>{person.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {person.roleIds.map((item) => (
                            <RoleBadge key={item} role={item} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={person.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="size-8 text-slate-600 hover:text-brand-navy hover:bg-brand-navy/10 cursor-pointer"
                            nativeButton={false}
                            render={<Link href={`/usuarios/${person.id}`} />}
                            title={manage ? "Editar usuario" : "Ver detalle"}
                          >
                            <Pencil className="size-4" />
                            <span className="sr-only">
                              {manage ? "Editar" : "Ver"}
                            </span>
                          </Button>
                          {manage ? (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              disabled={person.status === "BLOQUEADO"}
                              className={
                                person.status === "ACTIVO"
                                  ? "size-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                  : person.status === "BLOQUEADO"
                                  ? "size-8 opacity-40 cursor-not-allowed"
                                  : "size-8 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                              }
                              title={
                                person.status === "BLOQUEADO"
                                  ? "Usuario bloqueado"
                                  : person.status === "ACTIVO"
                                  ? "Desactivar usuario"
                                  : "Activar usuario"
                              }
                              onClick={() => {
                                togglePersonStatus(person.id);
                                toast.success(
                                  person.status === "ACTIVO"
                                    ? "Usuario desactivado"
                                    : "Usuario activado"
                                );
                              }}
                            >
                              {person.status === "ACTIVO" ? (
                                <UserX className="size-4 text-slate-600 hover:text-rose-600" />
                              ) : person.status === "BLOQUEADO" ? (
                                <Lock className="size-4 text-slate-400" />
                              ) : (
                                <UserCheck className="size-4 text-slate-600 hover:text-emerald-600" />
                              )}
                              <span className="sr-only">
                                {person.status === "ACTIVO" ? "Desactivar" : "Activar"}
                              </span>
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <PaginationBar
                page={page}
                pageCount={pageCount}
                total={total}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
