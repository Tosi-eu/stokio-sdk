export type SuperAdminAuth = {
  apiKey: string;
};

export type SuperAdminClientConfig = SuperAdminAuth & {
  baseUrl: string;
};

export type { AdminTenant as AdminTenantListItem } from "./contracts/admin.js";

export function superAdminHeaders(auth: SuperAdminAuth): Record<string, string> {
  return { "X-API-Key": auth.apiKey };
}

export function adminTenantsUrl(cfg: SuperAdminClientConfig): string {
  return `${cfg.baseUrl.replace(/\/+$/, "")}/admin/tenants`;
}

export function backendHealthUrl(cfg: SuperAdminClientConfig): string {
  return `${cfg.baseUrl.replace(/\/+$/, "")}/health`;
}

export function adminHealthUrl(cfg: SuperAdminClientConfig): string {
  return `${cfg.baseUrl.replace(/\/+$/, "")}/admin/health`;
}

export function adminTenantImportTemplateUrl(
  cfg: SuperAdminClientConfig,
  slug: string,
): string {
  return `${cfg.baseUrl.replace(/\/+$/, "")}/admin/tenants/by-slug/${encodeURIComponent(
    slug,
  )}/import/template`;
}

export function adminTenantImportXlsxUrl(
  cfg: SuperAdminClientConfig,
  slug: string,
): string {
  return `${cfg.baseUrl.replace(/\/+$/, "")}/admin/tenants/by-slug/${encodeURIComponent(
    slug,
  )}/import/xlsx`;
}

export function adminTenantImportPgDumpUrl(
  cfg: SuperAdminClientConfig,
  slug: string,
): string {
  return `${cfg.baseUrl.replace(/\/+$/, "")}/admin/tenants/by-slug/${encodeURIComponent(
    slug,
  )}/import/pg-dump`;
}
