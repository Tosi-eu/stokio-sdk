export type SuperAdminAuth = {
  apiKey: string;
};

export type SuperAdminClientConfig = SuperAdminAuth & {
  baseUrl: string;
};

export type AdminTenantListItem = {
  id: number;
  slug: string;
  name: string;
  brandName: string | null;
  logoUrl: string | null;
  contractPortfolioId: number | null;
  contractConfigured: boolean;
  contractBoundLogin: string | null;
};

export type AdminTenantsResponse = {
  data: AdminTenantListItem[];
  total: number;
  page: number;
  limit: number;
};

export type HealthCheckResponse = {
  status: string;
  database?: string;
  redis?: string;
};

export type AdminHealthResponse = {
  database: string;
  redis: string;
  lastBackupAt: string | null;
};

export type TenantPgDumpImportSummary = {
  categoriaArmario: number;
  categoriaGaveta: number;
  armarios: number;
  gavetas: number;
  medicamentos: number;
  insumos: number;
  residentes: number;
  logins: number;
  estoqueMedicamentos: number;
  estoqueInsumos: number;
  movimentacoes: number;
  notificacoes: number;
};

export type TenantPgDumpImportResponse = {
  ok: true;
  warnings: string[];
  summary: TenantPgDumpImportSummary;
};

export type TenantImportEntitySummary = {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
};

export type TenantImportXlsxResponse = {
  ok: true;
  summary: Record<string, TenantImportEntitySummary>;
  rows: Record<string, unknown[]>;
  errors: Array<{
    sheet: string;
    row: number;
    field?: string;
    message: string;
  }>;
};

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

