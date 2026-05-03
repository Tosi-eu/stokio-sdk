import type { AdminNotificationItem } from "../entities/notification.js";
import type { StockHistoryEntry } from "../entities/movement.js";

export type LoginLogEntry = {
  id: number;
  user_id: number | null;
  login: string;
  success: boolean;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
};

export type AdminLoginLogResponse = {
  data: LoginLogEntry[];
  total: number;
  page: number;
  limit: number;
};

export type AdminMetricsResponse = {
  movementsThisMonth: number;
  activeUsersThisMonth: number;
};

export type AdminActiveUserThisMonth = {
  id: number;
  login: string;
  first_name: string | null;
  last_name: string | null;
  last_login_at: string;
  logins_count: number;
};

export type AdminActiveUsersThisMonthResponse = {
  data: AdminActiveUserThisMonth[];
  total: number;
  page: number;
  limit: number;
};

export type AdminMovementsThisMonthResponse = {
  data: StockHistoryEntry[];
  total: number;
  hasNext: boolean;
  page: number;
  limit: number;
};

export type AdminHealthResponse = {
  database: string;
  redis: string;
  lastBackupAt: string | null;
};

export type AdminBackupStatusResponse = {
  lastBackupAt: string | null;
  lastBackupStatus: string | null;
  lastBackupDurationMs: number | null;
  lastBackupSizeBytes: number | null;
  lastBackupError: string | null;
  retentionCount: number | null;
};

export type AdminDataQualitySummary = {
  negativeStock: { medicines: number; inputs: number };
  missingLot: { medicines: number; inputs: number };
  orphanMovements: number;
};

export type AdminSystemConfig = Record<string, string>;

export type AdminTenant = {
  id: number;
  slug: string;
  name: string;
  brandName?: string | null;
  logoUrl?: string | null;
  contractPortfolioId?: number | null;
  contractConfigured?: boolean;
  contractBoundLogin?: string | null;
};

export type AdminTenantsResponse = {
  data: AdminTenant[];
  total: number;
  page: number;
  limit: number;
};

export type RestoreBackupResponse = {
  message: string;
};

export type AdminNotificationsResponse = {
  items: AdminNotificationItem[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
};

export type AdminInsightsResponse = {
  created: number;
  updated: number;
  deleted: number;
  total: number;
  totalFiltered: number;
  events: Array<{
    id: number;
    user_id: number | null;
    method: string;
    path: string;
    operation_type: string;
    resource: string | null;
    status_code: number;
    duration_ms: number | null;
    created_at: string;
    old_value: Record<string, unknown> | string | null;
    new_value: Record<string, unknown> | string | null;
  }>;
};

export type CreateAdminUserPayload = {
  login: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: "admin" | "user";
  permissions?: unknown;
};
