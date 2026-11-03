import type { Tenant } from "@/lib/tenant/types";

export const DEFAULT_TENANT_ID = "ied-la-victoria";

export const tenants: Record<string, Tenant> = {
  "ied-la-victoria": {
    id: "ied-la-victoria",
    slug: "ied-la-victoria",
    shortName: "IED La Victoria",
    legalName: "Institución Educativa Distrital La Victoria",
    acronym: "IED",
    city: "Barranquilla",
    productName: "Proyecto C",
    moduleName: "Administración de Usuarios e Identidad",
    staffDomain: "iedlavictoria.edu.co",
    studentDomain: "estudiantes.iedlavictoria.edu.co",
    footerNote: "IED La Victoria — Humanismo y excelencia.",
    motto: "Humanismo y excelencia",
    brand: {
      navy: "#163A6F",
      blue: "#1E4F9C",
      wine: "#C1272D",
      paper: "#F3F6FA",
      gold: "#C9A227",
      sky: "#5BA8D4",
    },
  },
};

export function getTenant(
  id: string = process.env.NEXT_PUBLIC_TENANT_ID ?? DEFAULT_TENANT_ID
): Tenant {
  return tenants[id] ?? tenants[DEFAULT_TENANT_ID];
}

export const defaultTenant = getTenant();
