"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { InstitutionMark } from "@/components/brand/institution-mark";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/providers/session-provider";
import { useTenant } from "@/providers/tenant-provider";

export default function LoginPage() {
  const router = useRouter();
  const { tenant } = useTenant();
  const { login } = useSession();
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [errors, setErrors] = useState<{ usuario?: string; clave?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  async function attemptLogin() {
    const next: typeof errors = {};
    if (!usuario.trim()) next.usuario = "Ingrese su usuario institucional.";
    if (!clave.trim()) next.clave = "Ingrese su contraseña.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmitting(true);
    try {
      await login(usuario.trim(), clave);
      router.push("/");
    } catch (error) {
      setErrors({
        clave: error instanceof Error ? error.message : "Credenciales inválidas.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    attemptLogin();
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-10">
      <img
        src="/brand/campus.png"
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-brand-navy/78" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-brand-navy to-transparent" />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center text-white">
          <InstitutionMark size={92} priority className="mb-3 drop-shadow-md" />
          <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-white/75">
            {tenant.legalName}
          </p>
          <h1 className="mt-1 text-2xl font-semibold">{tenant.shortName}</h1>
          <p className="mt-1 text-sm font-medium tracking-wide text-brand-gold uppercase">
            {tenant.motto}
          </p>
          <p className="mt-2 text-sm text-white/80">{tenant.moduleName}</p>
        </div>
        <Card className="shadow-lg ring-1 ring-white/20">
          <CardHeader>
            <CardTitle>Iniciar sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="usuario">Usuario</Label>
                <Input
                  id="usuario"
                  autoComplete="username"
                  placeholder={`usuario@${tenant.staffDomain}`}
                  value={usuario}
                  aria-invalid={Boolean(errors.usuario)}
                  onChange={(event) => setUsuario(event.target.value)}
                />
                {errors.usuario ? (
                  <p className="text-xs text-destructive">{errors.usuario}</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="clave">Contraseña</Label>
                <Input
                  id="clave"
                  type="password"
                  autoComplete="current-password"
                  value={clave}
                  aria-invalid={Boolean(errors.clave)}
                  onChange={(event) => setClave(event.target.value)}
                />
                {errors.clave ? (
                  <p className="text-xs text-destructive">{errors.clave}</p>
                ) : null}
              </div>
              <Button type="submit" className="h-10 w-full" disabled={submitting}>
                {submitting ? "Ingresando..." : "Iniciar sesión"}
              </Button>
              <button
                type="button"
                className="block min-h-10 w-full text-center text-sm text-brand-blue hover:underline"
                onClick={() =>
                  toast.info("Recuperación de contraseña", {
                    description:
                      "En el prototipo no se envía correo. Contacte a coordinación académica.",
                  })
                }
              >
                ¿Olvidó su contraseña?
              </button>
            </form>
            <Alert className="mt-5 border-brand-wine/25 bg-brand-wine/8">
              <AlertTitle className="text-brand-wine">Primer ingreso</AlertTitle>
              <AlertDescription>
                En el primer ingreso deberá cambiar su contraseña.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-xs text-white/75">
          Prototipo académico conectado al API NestJS. Use usuario o correo institucional.
        </p>
      </div>
    </div>
  );
}
