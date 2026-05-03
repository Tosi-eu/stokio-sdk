import type { ErrorCategory, ErrorSeverity } from "../errors.js";
import { StokioError } from "../errors.js";

function inferCategory(httpStatus: number): ErrorCategory {
  if (httpStatus === 401 || httpStatus === 403) return "auth";
  if (httpStatus === 400 || httpStatus === 422) return "validation";
  if (httpStatus >= 500) return "integration";
  return "unknown";
}

function inferSeverity(httpStatus: number, category: ErrorCategory): ErrorSeverity {
  if (category === "validation" || category === "auth") {
    if (httpStatus < 500) return "warning";
  }
  return "error";
}

export type StokioApiErrorBody = Record<string, unknown> | unknown[] | null;

export class StokioApiError extends StokioError {
  readonly httpStatus: number;
  readonly httpPath: string;
  readonly httpMethod: string;
  readonly responseBody: StokioApiErrorBody;
  readonly messageRaw: string;
  readonly silentInsufficientPrivileges?: boolean;

  constructor(opts: {
    message: string;
    messageRaw: string;
    httpStatus: number;
    httpPath: string;
    httpMethod: string;
    responseBody: StokioApiErrorBody;
    silentInsufficientPrivileges?: boolean;
  }) {
    const category = inferCategory(opts.httpStatus);
    const severity = inferSeverity(opts.httpStatus, category);
    super(opts.message, {
      code: `HTTP_${opts.httpStatus}`,
      category,
      severity,
      source: "sdk",
      context: {
        httpPath: opts.httpPath,
        httpMethod: opts.httpMethod,
        httpStatus: opts.httpStatus,
      },
    });
    this.name = "StokioApiError";
    this.httpStatus = opts.httpStatus;
    this.httpPath = opts.httpPath;
    this.httpMethod = opts.httpMethod;
    this.responseBody = opts.responseBody;
    this.messageRaw = opts.messageRaw;
    this.silentInsufficientPrivileges = opts.silentInsufficientPrivileges;
  }

  static is(e: unknown): e is StokioApiError {
    return e instanceof StokioApiError;
  }
}

export function extractApiErrorMessage(data: unknown): string {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const o = data as Record<string, unknown>;
    const err = o.error ?? o.message;
    if (typeof err === "string" && err.trim()) return err;
  }
  return "Erro inesperado";
}
