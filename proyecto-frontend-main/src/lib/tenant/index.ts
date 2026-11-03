import { defaultTenant } from "@/lib/tenant/catalog";
import type { Tenant } from "@/lib/tenant/types";

export { DEFAULT_TENANT_ID, defaultTenant, getTenant, tenants } from "@/lib/tenant/catalog";
export type { Tenant, TenantBrand, TenantId } from "@/lib/tenant/types";

export function staffEmail(localPart: string, tenant: Tenant = defaultTenant) {
  return `${localPart}@${tenant.staffDomain}`;
}

export function studentEmail(localPart: string, tenant: Tenant = defaultTenant) {
  return `${localPart}@${tenant.studentDomain}`;
}

export function tenantDisplayName(tenant: Tenant) {
  return `${tenant.legalName} — ${tenant.acronym}`;
}
