export type TenantModuleDefinitionRow = {
  key: string;
  label: string;
};

export type TenantModuleCatalogResponse = {
  modules: TenantModuleDefinitionRow[];
};

export type TenantConfigUpdateResponse = {
  tenantId: number;
  modules: UpdateTenantModulesPayload;
};

export type UpdateTenantModulesPayload = {
  enabled: string[];
  automatic_price_search?: boolean;
  automatic_reposicao_notifications?: boolean;
  enabled_sectors?: string[];
};

export type ForceTenantPriceBackfillResponse = {
  accepted?: boolean;
  acceptedAtMs?: number;
  workflowId?: string;
  requestId?: string;
  message?: string;
};

export type TenantPriceBackfillStatusResponse = {
  running: boolean;
  cooldownSeconds: number | null;
  last: {
    finishedAtMs: number;
    processed: number;
    ok: boolean;
    error?: string;
  } | null;
  queueLength?: number;
  currentRequestId?: string | null;
  workflowId?: string;
};

export type TenantSetorRow = {
  id: number;
  tenant_id: number;
  key: string;
  nome: string;
  proportion_profile: string;
  sort_order: number;
  active: boolean;
};

export type CreateTenantSetorPayload = {
  key?: string;
  nome: string;
  proportionProfile?: "farmacia" | "enfermagem";
};
