"use client";

import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { UserForm } from "@/components/users/user-form";
import { Button } from "@/components/ui/button";
import { canManageUsers } from "@/lib/permissions";
import { useSession } from "@/providers/session-provider";

export default function NewUserPage() {
  const { session } = useSession();
  if (!canManageUsers(session?.permisos ?? [])) {
    return (
      <EmptyState
        title="Sin permiso"
        description="No puede crear usuarios con el perfil actual."
        action={
          <Button nativeButton={false} render={<Link href="/usuarios" />}>
            Volver al directorio
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Nuevo usuario"
        description="Registre una persona y asígnele uno o más roles institucionales."
        crumbs={[
          { href: "/", label: "Inicio" },
          { href: "/usuarios", label: "Usuarios" },
          { label: "Nuevo" },
        ]}
      />
      <UserForm />
    </div>
  );
}
