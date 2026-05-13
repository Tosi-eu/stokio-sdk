export type PublicTenantListItem = {
  id: number;
  slug: string;
  name: string;
  brandName: string | null;
};

export type PublicTenantBranding = {
  slug: string;
  name: string;
  brandName: string | null;
  logoUrl: string | null;
  requiresContractCode: true;
  contractCodeMandatory?: boolean;
};

export type TenantBrandingApiResponse =
  | { found: false }
  | {
      found: true;
      slug: string;
      name: string;
      brandName: string | null;
      logoUrl?: string | null;
      requiresContractCode?: boolean;
      contractCodeMandatory?: boolean;
    };

export type TenantProfile = {
  id: number;
  slug: string;
  name: string;
  brandName: string | null;
  logoUrl: string | null;
  brandingUpdatedAt?: string | null;
  lifecycleStatus?: "ONBOARDING" | "ACTIVE" | "CANCELLED";
};

export type TenantModulesConfig = {
  enabled: string[];
};

export type TenantUiDisplayCasela = "numero" | "nome";
export type TenantUiDisplayCaselaSetor =
  | "farmacia"
  | "enfermagem"
  | "todos";
export type TenantUiDisplayArmario = "numero" | "categoria";
export type TenantUiDisplayGaveta = "numero" | "categoria";

export type TenantUiDisplayDefaultReportFormat = "pdf" | "xlsx";

export type TenantUiDisplay = {
  casela: TenantUiDisplayCasela;
  caselaSetor: TenantUiDisplayCaselaSetor;
  armario: TenantUiDisplayArmario;
  gaveta: TenantUiDisplayGaveta;
  defaultReportFormat?: TenantUiDisplayDefaultReportFormat;
};

export type TenantConfigResponse = {
  tenantId: number;
  tenant: TenantProfile | null;
  modules: TenantModulesConfig;
  modulesConfigured?: boolean;
  onboardingComplete?: boolean;
  lifecycleStatus?: "ONBOARDING" | "ACTIVE" | "CANCELLED";
  uiDisplay?: TenantUiDisplay;
};

export type UpdateTenantBrandingPayload = {
  brandName: string | null;
  logoUrl?: string | null;
};
