"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usernameOf } from "@/lib/format";
import { roleLabel } from "@/components/shared/role-badge";
import type { Person, RoleCode, UserStatus } from "@/lib/types";
import { useAppData } from "@/providers/data-provider";

const empty: Omit<Person, "id"> = {
  documentType: "CC",
  documentNumber: "",
  firstNames: "",
  lastNames: "",
  birthDate: "1990-01-01",
  email: "",
  phone: "",
  status: "ACTIVO",
  roleIds: ["ESTUDIANTE"],
};

export function UserForm({ person }: { person?: Person }) {
  const router = useRouter();
  const { upsertPerson, catalogRoles } = useAppData();
  const [form, setForm] = useState(person ?? empty);
  const [username, setUsername] = useState(
    person ? usernameOf(person.email) : ""
  );
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const roleId = form.roleIds[0] ?? "ESTUDIANTE";

  function validate() {
    const next: Record<string, string> = {};
    if (!form.documentNumber.trim()) next.documentNumber = "La identificación es obligatoria.";
    else if (!/^\d{6,12}$/.test(form.documentNumber.trim())) {
      next.documentNumber = "Use entre 6 y 12 dígitos, sin puntos.";
    }
    if (!username.trim()) next.username = "El usuario de acceso es obligatorio.";
    else if (username.trim().length > 20) next.username = "Máximo 20 caracteres.";
    if (!person && !password.trim()) next.password = "La contraseña es obligatoria.";
    if (!form.firstNames.trim()) next.firstNames = "Ingrese el nombre.";
    if (!form.lastNames.trim()) next.lastNames = "Ingrese el apellido.";
    if (!form.email.trim()) next.email = "El correo es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "El correo no tiene un formato válido.";
    }
    if (!roleId) next.roleIds = "Asigne un rol.";
    return next;
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const saved: Person = {
      ...form,
      id: person?.id ?? `u-${Date.now()}`,
      status: form.status,
      documentNumber: form.documentNumber.trim(),
      firstNames: form.firstNames.trim(),
      lastNames: form.lastNames.trim(),
      email: form.email.trim().toLowerCase(),
      roleIds: [roleId],
    };
    void upsertPerson(saved, {
      usuario: username.trim(),
      contrasena: password.trim() || undefined,
    })
      .then(() => {
        toast.success(person ? "Usuario actualizado" : "Usuario creado");
        router.push("/usuarios");
      })
      .catch((error: unknown) => {
        toast.error("No se pudo guardar", {
          description: error instanceof Error ? error.message : undefined,
        });
      });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Datos de usuario</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Identificación" error={errors.documentNumber}>
            <Input
              value={form.documentNumber}
              aria-invalid={Boolean(errors.documentNumber)}
              onChange={(event) =>
                setForm((current) => ({ ...current, documentNumber: event.target.value }))
              }
            />
          </Field>
          <Field label="Usuario" error={errors.username}>
            <Input
              value={username}
              maxLength={20}
              aria-invalid={Boolean(errors.username)}
              onChange={(event) => setUsername(event.target.value)}
            />
          </Field>
          <Field label="Nombre" error={errors.firstNames}>
            <Input
              value={form.firstNames}
              aria-invalid={Boolean(errors.firstNames)}
              onChange={(event) =>
                setForm((current) => ({ ...current, firstNames: event.target.value }))
              }
            />
          </Field>
          <Field label="Apellido" error={errors.lastNames}>
            <Input
              value={form.lastNames}
              aria-invalid={Boolean(errors.lastNames)}
              onChange={(event) =>
                setForm((current) => ({ ...current, lastNames: event.target.value }))
              }
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Correo electrónico" error={errors.email}>
              <Input
                type="email"
                value={form.email}
                aria-invalid={Boolean(errors.email)}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field
              label={person ? "Contraseña (dejar en blanco para no cambiar)" : "Contraseña"}
              error={errors.password}
            >
              <Input
                type="password"
                value={password}
                aria-invalid={Boolean(errors.password)}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado y rol</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Estado">
            <Select
              value={form.status}
              onValueChange={(value) =>
                setForm((current) => ({ ...current, status: value as UserStatus }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue>{form.status}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVO">ACTIVO</SelectItem>
                <SelectItem value="INACTIVO">INACTIVO</SelectItem>
                <SelectItem value="BLOQUEADO">BLOQUEADO</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Rol" error={errors.roleIds}>
            <Select
              value={roleId}
              onValueChange={(value) =>
                setForm((current) => ({ ...current, roleIds: [value as RoleCode] }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {catalogRoles.find((item) => item.nombre === roleId)?.nombre
                    ? roleLabel(roleId)
                    : roleId}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(catalogRoles.length
                  ? catalogRoles.map((role) => role.nombre as RoleCode)
                  : (["ADMINISTRADOR", "COORDINADOR", "DOCENTE", "ESTUDIANTE", "ACUDIENTE"] as RoleCode[])
                ).map((role) => (
                  <SelectItem key={role} value={role}>
                    {roleLabel(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Un usuario tiene un solo rol (id_rol), según el modelo relacional.
            </p>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => router.push("/usuarios")}>
              Cancelar
            </Button>
            <Button type="submit">{person ? "Guardar cambios" : "Crear usuario"}</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
