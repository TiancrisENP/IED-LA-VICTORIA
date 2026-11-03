"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { UserForm } from "@/components/users/user-form";
import { Button } from "@/components/ui/button";
import { fullName } from "@/lib/format";
import { canManageUsers } from "@/lib/permissions";
import { useAppData } from "@/providers/data-provider";
import { useSession } from "@/providers/session-provider";

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const { people } = useAppData();
  const { session } = useSession();
  const person = people.find((item) => item.id === params.id);
  const canEdit = canManageUsers(session?.permisos ?? []);

  if (!person) {
    return (
      <EmptyState
        title="Usuario no encontrado"
        description="El identificador no existe en los datos de demostración."
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
        title={fullName(person)}
        description="Actualice los datos personales o la asignación de roles."
        crumbs={[
          { href: "/", label: "Inicio" },
          { href: "/usuarios", label: "Usuarios" },
          { label: fullName(person) },
        ]}
      />
      {canEdit ? (
        <UserForm person={person} />
      ) : (
        <EmptyState
          title="Solo lectura"
          description="Su perfil puede consultar este usuario, no editarlo."
          action={
            <Button nativeButton={false} render={<Link href="/usuarios" />}>
              Volver al directorio
            </Button>
          }
        />
      )}
    </div>
  );
}
