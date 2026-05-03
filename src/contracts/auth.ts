import type { UserPermissions } from "../entities/user.js";

export type CurrentUserResponse = {
  id?: number;
  login?: string;
  role?: "admin" | "user";
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  tenantId?: number | null;
  isTenantOwner?: boolean;
  isSuperAdmin?: boolean;
  permissions?: UserPermissions;
  permissionMatrix?: unknown;
};

export type DisplayConfigResponse = {
  uiDisplay: {
    casela: "numero" | "nome";
    caselaSetor: "farmacia" | "enfermagem" | "todos";
    armario: "numero" | "categoria";
    gaveta: "numero" | "categoria";
  };
};

export type RegisterAccountResponse = {
  tenant: { id: number; slug: string };
  user: { id: number; login: string; role: string };
};

export type RegisterUserResponse = {
  tenant: { id: number; slug: string };
  user: { id: number; login: string; role: string };
};

export type CreateTenantInviteResponse =
  | {
      ok: true;
      emailSent: true;
      expiresAt: string;
    }
  | {
      token: string;
      link: string;
      emailSent: false;
      expiresAt: string;
      warning?: string;
    };

export type VerifyContractCodeResponse = {
  valid: boolean;
  contractCodeRequired?: boolean;
  reason?: "missing" | "mismatch" | "no_canonical_tenant";
  canonicalSlug?: string;
};
