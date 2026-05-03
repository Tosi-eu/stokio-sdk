export interface UserPermissions {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface LoggedUser {
  id: number;
  login: string;
  first_name?: string;
  last_name?: string;
  role?: "admin" | "user";
}

export interface Login {
  first_name?: string;
  last_name?: string;
  login: string;
  password: string;
}

export interface LoginCreateWithTenant extends Login {
  tenant_id: number;
}

export interface LoginTenantSummary {
  slug: string;
  label: string;
  tenantName?: string;
  brandName?: string | null;
}
