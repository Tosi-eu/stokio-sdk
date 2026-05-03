export interface PaginatedResponse<T> {
  data: T[];
  hasNext: boolean;
  page?: number;
  limit?: number;
  total?: number;
}

export type HealthCheckResponse = {
  status: string;
  database?: string;
  redis?: string;
};
