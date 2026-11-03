"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { defaultTenant, getTenant, tenants } from "@/lib/tenant";
import type { Tenant } from "@/lib/tenant/types";

interface TenantContextValue {
  tenant: Tenant;
  setTenantId: (id: string) => void;
}

const TenantContext = createContext<TenantContextValue | null>(null);

function applyBrand(tenant: Tenant, target: CSSStyleDeclaration | CSSProperties) {
  const tokens: Record<string, string> = {
    "--brand-navy": tenant.brand.navy,
    "--brand-blue": tenant.brand.blue,
    "--brand-wine": tenant.brand.wine,
    "--brand-paper": tenant.brand.paper,
    "--brand-gold": tenant.brand.gold,
    "--brand-sky": tenant.brand.sky,
    "--primary": tenant.brand.navy,
    "--sidebar": tenant.brand.navy,
    "--ring": tenant.brand.blue,
    "--destructive": tenant.brand.wine,
  };
  if ("setProperty" in target) {
    Object.entries(tokens).forEach(([key, value]) => target.setProperty(key, value));
    return tokens;
  }
  return tokens;
}

function brandStyle(tenant: Tenant): CSSProperties {
  return applyBrand(tenant, {}) as CSSProperties;
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantId] = useState(defaultTenant.id);
  const tenant = tenants[tenantId] ?? defaultTenant;

  useLayoutEffect(() => {
    const root = document.documentElement;
    applyBrand(tenant, root.style);
  }, [tenant]);

  const value = useMemo(
    () => ({
      tenant,
      setTenantId: (id: string) => setTenantId(getTenant(id).id),
    }),
    [tenant]
  );

  return (
    <TenantContext.Provider value={value}>
      <div className="min-h-svh" style={brandStyle(tenant)}>
        {children}
      </div>
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within TenantProvider");
  }
  return context;
}
