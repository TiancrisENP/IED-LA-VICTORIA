export interface TenantBrand {
  navy: string;
  blue: string;
  wine: string;
  paper: string;
  gold: string;
  sky: string;
}

export interface Tenant {
  id: string;
  slug: string;
  shortName: string;
  legalName: string;
  acronym: string;
  city: string;
  productName: string;
  moduleName: string;
  staffDomain: string;
  studentDomain: string;
  footerNote: string;
  motto: string;
  brand: TenantBrand;
}

export type TenantId = string;
