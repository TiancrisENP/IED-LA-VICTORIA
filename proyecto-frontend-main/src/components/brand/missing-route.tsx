import Link from "next/link";

import { InstitutionMark } from "@/components/brand/institution-mark";
import { Button } from "@/components/ui/button";
import { defaultTenant } from "@/lib/tenant";

export function MissingRoute() {
  const tenant = defaultTenant;

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-10">
      <img
        src="/brand/campus.png"
        alt=""
        className="absolute inset-0 size-full object-cover outline outline-1 outline-black/10"
      />
      <div className="absolute inset-0 bg-brand-navy/80" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-brand-navy to-transparent" />

      <div className="relative w-full max-w-md text-center text-white">
        <InstitutionMark size={88} priority className="mx-auto mb-4 drop-shadow-md" />
        <p className="text-[11px] font-medium tracking-[0.18em] text-white/75 uppercase">
          {tenant.legalName}
        </p>
        <p className="mt-1 text-2xl font-semibold text-balance">{tenant.shortName}</p>
        <p className="mt-1 text-sm font-medium tracking-wide text-brand-gold uppercase">
          {tenant.motto}
        </p>

        <p className="mt-8 font-semibold text-5xl text-brand-gold tabular-nums">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-balance">Página no encontrada</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-pretty text-white/80">
          {`Esta ruta no existe en ${tenant.moduleName}. Vuelva al panel o inicie sesión de nuevo.`}
        </p>

        <div className="mt-6 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
          <Button
            nativeButton={false}
            render={<Link href="/" />}
            className="h-10 bg-white text-brand-navy hover:bg-white/90 active:scale-[0.96]"
          >
            Ir al inicio
          </Button>
          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href="/login" />}
            className="h-10 border-white/35 bg-transparent text-white hover:bg-white/10 hover:text-white active:scale-[0.96]"
          >
            Iniciar sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
