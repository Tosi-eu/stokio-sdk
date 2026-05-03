import type { StokioHttp } from "./http.js";
import type { PaginatedResponse } from "../contracts/common.js";
import type {
  AdminActiveUsersThisMonthResponse,
  AdminBackupStatusResponse,
  AdminDataQualitySummary,
  AdminHealthResponse,
  AdminInsightsResponse,
  AdminLoginLogResponse,
  AdminMetricsResponse,
  AdminMovementsThisMonthResponse,
  AdminNotificationsResponse,
  AdminConfigApiResponse,
  AdminConfigPutBody,
  AdminTenant,
  AdminTenantsResponse,
  CreateAdminUserPayload,
  RestoreBackupResponse,
} from "../contracts/admin.js";
import type { StockHistoryEntry } from "../entities/movement.js";
import type {
  CreateTenantInviteResponse,
  CurrentUserResponse,
  DisplayConfigResponse,
  LoginTenantsForEmailResponse,
  RegisterAccountResponse,
  RegisterUserResponse,
  ResolveTenantByLoginResponse,
  VerifyContractCodeResponse,
} from "../contracts/auth.js";
import type { ResidentListItem } from "../contracts/catalog.js";
import type { Drawer, DrawerCategory } from "../entities/cabinet.js";
import type { StockItemRaw } from "../entities/stock.js";
import type {
  ConsumptionByItemResponse,
  ConsumptionPeriodItem,
  RawMovement,
} from "../contracts/movements.js";
import type {
  DashboardSummaryResponse,
  ExpiringItem,
} from "../contracts/dashboard.js";
import type { NotificationsResponse } from "../contracts/notifications.js";
import type { StockProportionResponse } from "../contracts/stock.js";
import type {
  CreateTenantSetorPayload,
  ForceTenantPriceBackfillResponse,
  TenantPriceBackfillStatusResponse,
  TenantSetorRow,
  UpdateTenantModulesPayload,
} from "../contracts/tenant.js";
import type {
  TenantBrandingApiResponse,
  TenantConfigResponse,
  UpdateTenantBrandingPayload,
} from "../entities/tenant.js";
import type {
  TenantImportXlsxResponse,
  TenantPgDumpImportResponse,
} from "../contracts/imports.js";
import type { PublicAppConfigResponse } from "../contracts/public.js";
import type { PublicTenantListItem } from "../entities/tenant.js";
import type { HealthCheckResponse } from "../contracts/common.js";
import {
  EventStatus,
  MovementType,
  OperationType,
  SectorType,
} from "../enums.js";

export function buildReportQuery(
  type: string,
  casela?: number,
  params?: Record<string, string | number | boolean | undefined>,
): string {
  const search = new URLSearchParams({ type });
  if (casela != null) search.append("casela", String(casela));
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      search.append(key, String(value));
    });
  }
  return search.toString();
}

export function buildAdminExportParams(
  type: string,
  casela?: number,
  params?: Record<string, string | number | boolean | undefined>,
): Record<string, string> {
  const out: Record<string, string> = { type };
  if (casela != null) out.casela = String(casela);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      out[key] = String(value);
    });
  }
  return out;
}

export function buildStokioApi(http: StokioHttp) {
  return {
    movements: {
      listInputMovements: (args: {
        page?: number;
        limit?: number;
        days?: number;
        type?: string;
      }): Promise<PaginatedResponse<RawMovement>> =>
        http.get("/movimentacoes/insumos", { params: args as Record<string, unknown> }),

      listMedicineMovements: (args: {
        page?: number;
        limit?: number;
        days?: number;
        type?: string;
      }): Promise<PaginatedResponse<RawMovement>> =>
        http.get("/movimentacoes/medicamentos", { params: args as Record<string, unknown> }),

      getNonMovementProducts: () => http.get("/movimentacoes/produtos-parados"),

      getConsumptionByPeriod: (
        start: string,
        end: string,
        groupBy: "month" | "quarter" = "month",
      ): Promise<ConsumptionPeriodItem[]> =>
        http.get("/movimentacoes/consumo", {
          params: { start, end, groupBy },
        }),

      getConsumptionByItem: (
        start: string,
        end: string,
      ): Promise<ConsumptionByItemResponse> =>
        http.get("/movimentacoes/consumo-por-item", { params: { start, end } }),

      getMedicineRanking: (type: "more" | "less", page = 1, limit = 10) =>
        http.get("/movimentacoes/medicamentos/ranking", {
          params: { type, page, limit },
        }),

      create: (payload: {
        tipo: MovementType;
        login_id: number;
        armario_id: number;
        quantidade: number;
        casela_id?: number;
        gaveta_id?: number;
        medicamento_id?: number;
        validade: string;
        insumo_id?: number;
        setor: string;
        lote?: string | null;
      }) => http.post("/movimentacoes", payload),
    },

    stock: {
      createIn: (payload: {
        tipo: string;
        medicamento_id?: number;
        insumo_id?: number;
        quantidade: number;
        armario_id?: number | null;
        gaveta_id?: number | null;
        casela_id?: number | null;
        validade?: Date | null;
        origem?: string | null;
        setor: string;
        lote?: string | null;
        observacao?: string | null;
        preco?: number | null;
      }) => http.post("/estoque/entrada", payload),

      createOut: (payload: {
        estoqueId: number;
        tipo: OperationType;
        quantidade: number;
      }) => http.post("/estoque/saida", payload),

      getProportions: (sector?: string) =>
        http.get<StockProportionResponse | unknown>(
          `/estoque/proporcao${sector ? `?setor=${encodeURIComponent(sector)}` : ""}`,
        ),

      getFilterOptions: () =>
        http.get<{ cabinets: number[]; caselas: number[]; lots: string[] }>(
          "/estoque/filter-options",
        ),

      list: (
        page = 1,
        limit = 6,
        filters?: Record<string, unknown>,
        extraFilter?: string | null,
      ): Promise<PaginatedResponse<StockItemRaw>> => {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        if (filters) {
          if (filters.type) params.append("type", String(filters.type));
          if (filters.name) params.append("name", String(filters.name));
          if (filters.activeSubstance)
            params.append("activeSubstance", String(filters.activeSubstance));
          if (filters.cabinet) params.append("cabinet", String(filters.cabinet));
          if (filters.drawer) params.append("drawer", String(filters.drawer));
          if (filters.casela) params.append("casela", String(filters.casela));
          if (filters.origin) params.append("origin", String(filters.origin));
          if (filters.sector) params.append("sector", String(filters.sector));
          if (filters.lot) params.append("lot", String(filters.lot));
          if (filters.itemType) params.append("itemType", String(filters.itemType));
          if (filters.stockType) params.append("stockType", String(filters.stockType));
        }
        if (extraFilter) params.append("filter", extraFilter);
        return http.get<PaginatedResponse<StockItemRaw>>(
          `/estoque?${params.toString()}`,
        );
      },

      removeIndividualMedicine: (stockId: number) =>
        http.patch(`/estoque/medicamento/${stockId}/remover-individual`),

      getDaysForReplacementForNursing: (medicamentoId: number, caselaId: number) =>
        http.get("/estoque/medicamento/dias-para-repor", {
          params: { medicamento_id: medicamentoId, casela_id: caselaId },
        }),

      suspendMedicine: (stockId: number) =>
        http.patch(`/estoque/medicamento/${stockId}/suspender`),

      resumeMedicine: (stockId: number) =>
        http.patch(`/estoque/medicamento/${stockId}/retomar`),

      removeIndividualInput: (stockId: number) =>
        http.patch(`/estoque/insumo/${stockId}/remover-individual`),

      suspendInput: (stockId: number) =>
        http.patch(`/estoque/insumo/${stockId}/suspender`),

      resumeInput: (stockId: number) =>
        http.patch(`/estoque/insumo/${stockId}/retomar`),

      deleteItem: (stockId: number, type: string) =>
        http.delete(`/estoque/${type}/${stockId}`),

      transferSector: (payload: {
        estoque_id: number;
        setor: SectorType;
        itemType: string;
        quantidade?: number;
        casela_id?: number;
        destino?: string | null;
        observacao?: string | null;
        bypassCasela: boolean;
        dias_para_repor: number | null;
      }) => {
        const basePath =
          payload.itemType === "medicamento"
            ? "/estoque/medicamento"
            : "/estoque/insumo";
        return http.patch(`${basePath}/${payload.estoque_id}/transferir-setor`, {
          setor: payload.setor,
          quantidade: payload.quantidade,
          casela_id: payload.casela_id,
          destino: payload.destino,
          observacao: payload.observacao,
          bypassCasela: payload.bypassCasela,
          dias_para_repor: payload.dias_para_repor,
        });
      },

      updateItem: (
        estoqueId: number,
        itemTipo: string,
        data: {
          quantidade?: number;
          armario_id?: number | null;
          gaveta_id?: number | null;
          validade?: string | null;
          origem?: string | null;
          setor?: string;
          lote?: string | null;
          casela_id?: number | null;
          tipo?: string;
          preco?: number | null;
          observacao?: string | null;
          dias_para_repor?: number | null;
        },
      ) => {
        const { tipo: stockTipo, ...restData } = data;
        return http.put(`/estoque/${estoqueId}`, {
          tipo: itemTipo,
          stockTipo,
          ...restData,
        });
      },
    },

    medicines: {
      list: (page = 1, limit = 10, name?: string) =>
        http.get<PaginatedResponse<Record<string, unknown>>>("/medicamentos", {
          params: { page, limit, ...(name ? { name } : {}) },
        }),
      remove: (id: number) => http.delete(`/medicamentos/${id}`),
      update: (id: number, data: Record<string, unknown>) =>
        http.put(`/medicamentos/${id}`, data),
      create: (
        nome: string,
        principio_ativo: string,
        dosagem: string,
        unidade_medida: string,
        estoque_minimo?: number | null,
        _preco?: number | null,
      ) =>
        http.post("/medicamentos", {
          nome,
          principio_ativo,
          dosagem,
          unidade_medida,
          estoque_minimo: estoque_minimo != null ? Number(estoque_minimo) : null,
        }),
    },

    inputs: {
      list: (page = 1, limit = 10, name?: string) => {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        if (name) params.append("name", name);
        return http.get<PaginatedResponse<Record<string, unknown>>>(
          `/insumos?${params.toString()}`,
        );
      },
      remove: (id: number) => http.delete(`/insumos/${id}`),
      update: (id: number, data: Record<string, unknown>) =>
        http.put(`/insumos/${id}`, data),
      create: (
        nome: string,
        descricao?: string,
        estoque_minimo?: number,
        preco?: number | null,
      ) =>
        http.post("/insumos", {
          nome,
          descricao: descricao ?? null,
          estoque_minimo: estoque_minimo ?? 0,
          preco: preco ?? null,
        }),
    },

    cabinets: {
      list: (page = 1, limit = 10) =>
        http.get<PaginatedResponse<{ numero: number; categoria: string }>>("/armarios", {
          params: { page, limit },
        }),
      check: (number: number) => http.get(`/armarios/${number}/check`),
      remove: (number: number, destiny?: Record<string, unknown>) =>
        http.delete(`/armarios/${number}`, destiny),
      update: (id: number, data: Record<string, unknown>) =>
        http.put(`/armarios/${id}`, data),
      create: (numero: number, categoria_id: number) =>
        http.post("/armarios", { numero, categoria_id }),
      count: () => http.get("/armarios/count"),
      categories: {
        list: (page = 1, limit = 5) =>
          http.get<PaginatedResponse<{ id: number; nome: string }>>("/categoria-armario", {
            params: { page, limit },
          }),
        create: (nome: string) => http.post("/categoria-armario", { nome }),
      },
    },

    drawers: {
      list: (page = 1, limit = 10) =>
        http.get<PaginatedResponse<Drawer>>("/gavetas", { params: { page, limit } }),
      getByNumber: (numero: number) => http.get(`/gavetas/${numero}`),
      create: (numero: number, categoria_id: number) =>
        http.post("/gavetas", { numero, categoria_id }),
      update: (numero: number, categoria_id: number) =>
        http.put(`/gavetas/${numero}`, { categoria_id }),
      remove: (numero: number) => http.delete(`/gavetas/${numero}`),
      count: () => http.get("/gavetas/count"),
      categories: {
        list: (page = 1, limit = 10) =>
          http.get<PaginatedResponse<DrawerCategory>>("/categoria-gaveta", {
            params: { page, limit },
          }),
        getById: (id: number) => http.get(`/categoria-gaveta/${id}`),
        create: (nome: string) => http.post("/categoria-gaveta", { nome }),
        update: (id: number, nome: string) =>
          http.put(`/categoria-gaveta/${id}`, { nome }),
        remove: (id: number) => http.delete(`/categoria-gaveta/${id}`),
      },
    },

    residents: {
      list: (page = 1, limit = 20) =>
        http.get<PaginatedResponse<ResidentListItem>>("/residentes", {
          params: { page, limit },
        }),
      getByCasela: (casela: string | number) =>
        http.get<ResidentListItem>(`/residentes/${casela}`),
      count: () => http.get("/residentes/count"),
      remove: (casela: string | number) => http.delete(`/residentes/${casela}`),
      update: (casela: string | number, data: Record<string, unknown>) =>
        http.put(`/residentes/${casela}`, data),
      create: (nome: string, casela: string, data_nascimento?: string | null) =>
        http.post("/residentes", {
          nome,
          casela: parseInt(casela, 10),
          ...(data_nascimento != null && String(data_nascimento).trim() !== ""
            ? { data_nascimento: String(data_nascimento).trim() }
            : {}),
        }),
    },

    dashboard: {
      summary: (params?: { expiringDays?: number }) =>
        http.get<DashboardSummaryResponse>("/dashboard/summary", {
          params: params as Record<string, unknown> | undefined,
        }),
      expiringItems: (days: number, page = 1, limit = 50) =>
        http.get<{ data: ExpiringItem[]; total: number; hasNext: boolean }>(
          "/dashboard/expiring-items",
          { params: { days, page, limit } },
        ),
    },

    reports: {
      get: (type: string, casela?: number, params?: Record<string, string | number | boolean | undefined>) =>
        http.get(`/relatorios?${buildReportQuery(type, casela, params)}`),
      transferencias: () => http.get("/relatorios?type=transferencias"),
      movimentosDia: () => http.get("/relatorios?type=movimentos_dia"),
    },

    notifications: {
      list: (args: {
        page?: number;
        limit?: number;
        type: string;
        status?: string;
        date?: "today" | "tomorrow" | string;
        residente_nome?: string;
        visto?: boolean;
      }) => {
        const params: Record<string, string | number | boolean | undefined> = {
          page: args.page,
          limit: args.limit,
          type: args.type,
          status: args.status,
          date: args.date,
          residente_nome: args.residente_nome,
        };
        if (args.visto === false) params.visto = false;
        if (args.visto === true) params.visto = true;
        return http.get<NotificationsResponse>("/notificacao", {
          params,
          silentInsufficientPrivileges: true,
        });
      },
      create: (payload: {
        medicamento_id: number;
        residente_id: number;
        destino: string;
        data_prevista: Date;
        criado_por: number;
        tipo_evento: string;
        status: EventStatus;
      }) => http.post("/notificacao", payload),
      update: (id: number, data: { status?: string; visto?: boolean }) =>
        http.patch(`/notificacao/${id}`, data),
      patchEvent: (
        id: number,
        data: Partial<{
          medicamento_id: number;
          residente_id: number;
          destino: string;
          data_prevista: Date;
          criado_por: number;
          status: EventStatus;
        }>,
      ) => http.patch(`/notificacao/${id}`, data),
    },

    auth: {
      login: (login: string, password: string, tenantSlug: string) =>
        http.post(
          "/login/authenticate",
          { login, password },
          { headers: { "X-Tenant": tenantSlug } },
        ),
      logout: () => http.post("/login/logout"),
      currentUser: () => http.get<CurrentUserResponse>("/login/usuario-logado"),
      displayConfig: () => http.get<DisplayConfigResponse>("/login/display-config"),
      register: (
        login: string,
        password: string,
        firstName: string,
        lastName: string,
        tenantSlug: string,
        contractCode?: string,
      ) =>
        http.post(
          "/login",
          {
            login,
            password,
            first_name: firstName,
            last_name: lastName,
            ...(contractCode != null && contractCode.trim() !== ""
              ? { contract_code: contractCode.trim() }
              : {}),
          },
          { headers: { "X-Tenant": tenantSlug } },
        ),
      registerAccount: (
        login: string,
        password: string,
        firstName: string,
        lastName: string,
      ): Promise<RegisterAccountResponse> =>
        http.post("/login/register-account", {
          login,
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      registerUser: (
        login: string,
        password: string,
        firstName: string,
        lastName: string,
        opts?: { contract_code?: string },
      ): Promise<RegisterUserResponse> => {
        const cc = opts?.contract_code?.trim();
        return http.post("/login/register-user", {
          login,
          password,
          first_name: firstName,
          last_name: lastName,
          ...(cc ? { contract_code: cc } : {}),
        });
      },
      joinByInviteToken: (payload: {
        token: string;
        login: string;
        password: string;
        first_name: string;
        last_name: string;
      }): Promise<RegisterUserResponse> =>
        http.post("/login/join-by-token", payload),
      resetPassword: (login: string, newPassword: string) =>
        http.post("/login/reset-password", { login, newPassword }),
      updateUser: (payload: Record<string, unknown>) => http.put("/login", payload),
      tenantsForEmail: (login: string) =>
        http.getAllowingNonOk<LoginTenantsForEmailResponse>(
          "/login/tenants-for-email",
          { params: { login: login.trim() } },
        ),
      resolveTenantByLogin: (login: string) =>
        http.getAllowingNonOk<ResolveTenantByLoginResponse>(
          "/login/resolve-tenant",
          { params: { login: login.trim() } },
        ),
    },

    tenant: {
      config: () => http.get<TenantConfigResponse>("/tenant/config"),
      updateConfig: (modules: UpdateTenantModulesPayload) =>
        http.put<{ tenantId: number; modules: UpdateTenantModulesPayload }>(
          "/tenant/config",
          { modules },
        ),
      updateBranding: (payload: UpdateTenantBrandingPayload) =>
        http.put<{ tenantId: number; tenant: TenantConfigResponse["tenant"] }>(
          "/tenant/branding",
          payload,
        ),
      setContractCode: (contractCode: string, boundLogin: string) =>
        http.put<{
          ok: true;
          migrated?: boolean;
          tenantId?: number;
          tenantSlug?: string;
        }>("/tenant/contract-code", {
          contract_code: contractCode,
          bound_login: boundLogin.trim(),
        }),
      claimContractCode: (contractCode: string, boundLogin: string) =>
        http.post<{
          ok: true;
          migrated?: boolean;
          tenantId?: number;
          tenantSlug?: string;
        }>("/tenant/contract-code/claim", {
          contract_code: contractCode,
          bound_login: boundLogin.trim(),
        }),
      listSetores: () => http.get<{ data: TenantSetorRow[] }>("/tenant/setores"),
      createSetor: (payload: CreateTenantSetorPayload) =>
        http.post<TenantSetorRow>("/tenant/setores", payload),
      forcePriceBackfill: () =>
        http.post<ForceTenantPriceBackfillResponse>("/tenant/price-backfill/run"),
      priceBackfillStatus: () =>
        http.get<TenantPriceBackfillStatusResponse>("/tenant/price-backfill/status"),
      createInvite: (payload: {
        email: string;
        role: "user" | "admin";
        permissions?: {
          read?: boolean;
          create?: boolean;
          update?: boolean;
          delete?: boolean;
        };
        expires_in_days?: number;
      }): Promise<CreateTenantInviteResponse> => http.post("/tenant/invites", payload),

      importTemplateBlob: () =>
        http.get<Blob>("/tenant/import/template", { responseType: "blob" }),
    },

    public: {
      listTenants: (params?: { q?: string; limit?: number }) =>
        http.get<{ data: PublicTenantListItem[] }>("/tenants", { params: params ?? {} }),
      tenantBrandingBySlug: (slug: string) =>
        http.get<TenantBrandingApiResponse | null>(
          `/tenants/${encodeURIComponent(slug.trim())}/branding`,
          { treatNotOkAsNull: true },
        ),
      appConfig: () => http.get<PublicAppConfigResponse>("/public/app-config"),
      verifyTenantContractCode: (tenantSlug: string, contractCode: string) =>
        http.post<VerifyContractCodeResponse>(
          `/tenants/${encodeURIComponent(tenantSlug)}/verify-contract-code`,
          { contract_code: contractCode },
        ),
      verifySignupContractCode: (contractCode: string, signupEmail?: string) => {
        const login = signupEmail?.trim();
        return http.post<{ valid: boolean }>(`/contract-code/verify`, {
          contract_code: contractCode,
          ...(login ? { login } : {}),
        });
      },
    },

    imports: {
      tenantXlsx: (file: File) => {
        const form = new FormData();
        form.append("file", file);
        return http.post<TenantImportXlsxResponse>("/tenant/import/xlsx", form);
      },
      tenantPgDump: (
        file: File,
        options?: {
          replaceTenantData?: boolean;
          birthDateFallback?: string;
          sourceTenantId?: number;
        },
      ) => {
        const params = new URLSearchParams();
        if (options?.replaceTenantData) params.set("replaceTenantData", "1");
        if (options?.birthDateFallback?.trim()) {
          params.set("birthDateFallback", options.birthDateFallback.trim());
        }
        if (options?.sourceTenantId != null) {
          params.set("sourceTenantId", String(options.sourceTenantId));
        }
        const qs = params.toString();
        const path = qs ? `/tenant/import/pg-dump?${qs}` : "/tenant/import/pg-dump";
        const form = new FormData();
        form.append("file", file);
        return http.post<TenantPgDumpImportResponse>(path, form);
      },
    },

    health: {
      backend: () => http.get<HealthCheckResponse>("/health"),
    },

    admin: {
      setTenantContractCodeBySlug: (
        slug: string,
        payload:
          | { contract_code: string; bound_login: string }
          | { clear_contract_code: true },
        headers?: HeadersInit,
      ) =>
        http.put<{ ok: boolean; slug: string; contractCodeConfigured: boolean }>(
          `/admin/tenants/by-slug/${encodeURIComponent(slug)}/contract-code`,
          payload,
          { headers },
        ),

      users: {
        list: (params?: { page?: number; limit?: number }) =>
          http.get("/admin/users", { params: params ?? {} }),
        create: (data: CreateAdminUserPayload) => http.post("/admin/users", data),
        update: (
          id: number,
          data: {
            firstName?: string;
            lastName?: string;
            login?: string;
            password?: string;
            role?: "admin" | "user";
            permissions?: unknown;
          },
        ) => http.put(`/admin/users/${id}`, data),
        remove: (id: number) => http.delete(`/admin/users/${id}`),
      },

      loginLog: (params?: {
        page?: number;
        limit?: number;
        userId?: number;
        login?: string;
        success?: boolean;
        fromDate?: string;
        toDate?: string;
      }) => http.get<AdminLoginLogResponse>("/admin/login-log", { params: params ?? {} }),

      metrics: () => http.get<AdminMetricsResponse>("/admin/metrics"),

      activeUsersThisMonth: (params?: { page?: number; limit?: number }) =>
        http.get<AdminActiveUsersThisMonthResponse>("/admin/metrics/active-users", {
          params: params ?? {},
        }),

      movementsThisMonth: (params?: { page?: number; limit?: number }) =>
        http.get<AdminMovementsThisMonthResponse>("/admin/metrics/movements", {
          params: params ?? {},
        }),

      health: () => http.get<AdminHealthResponse>("/admin/health"),

      backup: {
        status: () => http.get<AdminBackupStatusResponse>("/admin/backup/status"),
        runNow: () => http.post("/admin/backup/run", {}),
      },

      dataQuality: {
        summary: () => http.get<AdminDataQualitySummary>("/admin/data-quality/summary"),
        inconsistencies: (params: {
          type: "negative_stock" | "missing_lot" | "orphan_movements";
          page?: number;
          limit?: number;
        }) => http.get("/admin/data-quality/inconsistencies", { params }),
        medicineDuplicates: (params?: { page?: number; limit?: number }) =>
          http.get("/admin/data-quality/medicine-duplicates", { params: params ?? {} }),
        mergeMedicines: (payload: { keepId: number; mergeIds: number[] }) =>
          http.post("/admin/data-quality/merge-medicines", payload),
        normalizeMedicineUnits: (payload?: { dryRun?: boolean }) =>
          http.post("/admin/data-quality/normalize-medicine-units", payload ?? {}),
      },

      config: {
        get: () => http.get<AdminConfigApiResponse>("/admin/config"),
        update: (body: AdminConfigPutBody) =>
          http.put<AdminConfigApiResponse>("/admin/config", body),
      },

      tenants: {
        list: (params?: { page?: number; limit?: number }, headers?: HeadersInit) =>
          http.get<AdminTenantsResponse>("/admin/tenants", {
            params: params ?? {},
            headers,
          }),
        create: (
          data: { slug: string; name: string; contract_code?: string },
          headers?: HeadersInit,
        ) => http.post<AdminTenant>("/admin/tenants", data, { headers }),
        update: (
          id: number,
          data: Partial<{ slug: string; name: string; contract_code?: string }>,
          headers?: HeadersInit,
        ) => http.put<AdminTenant>(`/admin/tenants/${id}`, data, { headers }),
        remove: (id: number, headers?: HeadersInit) =>
          http.delete<{ ok: boolean }>(`/admin/tenants/${id}`, undefined, { headers }),
        getConfig: (id: number, headers?: HeadersInit) =>
          http.get<TenantConfigResponse>(`/admin/tenants/${id}/config`, { headers }),
        setConfig: (id: number, modules: { enabled: string[] }, headers?: HeadersInit) =>
          http.put<TenantConfigResponse>(
            `/admin/tenants/${id}/config`,
            { modules },
            { headers },
          ),
      },

      restoreBackup: (file: File) => {
        const form = new FormData();
        form.append("file", file);
        return http.post<RestoreBackupResponse>("/admin/restore-backup", form);
      },

      notifications: {
        list: (params?: {
          page?: number;
          limit?: number;
          tipo?: string;
          status?: string;
          visto?: boolean;
        }) =>
          http.get<AdminNotificationsResponse>("/admin/notifications", {
            params: params ?? {},
          }),
        patch: (id: number, data: { visto?: boolean; status?: string }) =>
          http.patch(`/admin/notifications/${id}`, data),
      },

      insights: (params?: {
        days?: number;
        limit?: number;
        page?: number;
        operationType?: "create" | "update" | "delete";
        resource?: string;
        userId?: number;
      }) => http.get<AdminInsightsResponse>("/admin/insights", { params: params ?? {} }),

      stockHistory: (params: {
        itemType?: "medicamento" | "insumo";
        itemId?: number;
        lote?: string;
        page?: number;
        limit?: number;
      }) =>
        http.get<{
          data: StockHistoryEntry[];
          total: number;
          hasNext: boolean;
          page: number;
          limit: number;
        }>("/admin/stock-history", { params }),

      exportCsvBlob: (queryParams: Record<string, string>) =>
        http.get<Blob>(`/admin/export?${new URLSearchParams(queryParams).toString()}`, {
          responseType: "blob",
        }),
    },
  };
}

export type StokioClientSurface = ReturnType<typeof buildStokioApi>;
