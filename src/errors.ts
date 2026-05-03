export type ErrorSource =
  | "backend_http"
  | "temporal"
  | "price_search"
  | "frontend_web"
  | "sdk";

export type ErrorSeverity = "info" | "warning" | "error" | "fatal";

export type ErrorCategory =
  | "validation"
  | "auth"
  | "database"
  | "integration"
  | "route"
  | "workflow"
  | "config"
  | "unknown";

export interface CanonicalErrorPayload {
  occurredAt: string;
  source: ErrorSource;
  severity: ErrorSeverity;
  category: ErrorCategory;
  code: string | null;
  messageRaw: string;
  messageSanitized?: string | null;
  fingerprint: string;
  context?: Record<string, unknown> | null;
  stack?: string | null;
  correlationId?: string | null;
  tenantId?: number | null;
  httpMethod?: string | null;
  httpPath?: string | null;
  httpStatus?: number | null;
  workflowId?: string | null;
  workflowRunId?: string | null;
  originApp?: string | null;
}

export type ToCanonicalDefaults = {
  source: ErrorSource;
  severity?: ErrorSeverity;
  category?: ErrorCategory;
  code?: string | null;
  correlationId?: string | null;
  tenantId?: number | null;
  httpMethod?: string | null;
  httpPath?: string | null;
  httpStatus?: number | null;
  workflowId?: string | null;
  workflowRunId?: string | null;
  originApp?: string | null;
  context?: Record<string, unknown> | null;
  occurredAt?: string;
};

const FNV_OFFSET = 14695981039346656037n;
const FNV_PRIME = 1099511628211n;
const MASK64 = 0xffffffffffffffffn;

function fnv1a64(input: string): bigint {
  let h = FNV_OFFSET;
  for (let i = 0; i < input.length; i++) {
    h ^= BigInt(input.charCodeAt(i) & 0xff);
    h = (h * FNV_PRIME) & MASK64;
  }
  return h;
}

function toHex16(n: bigint): string {
  return n.toString(16).padStart(16, "0").slice(0, 16);
}

export function fingerprintError(parts: {
  source: ErrorSource;
  code: string | null;
  messageRaw: string;
  stack?: string | null;
}): string {
  const normalizedMsg = normalizeForFingerprint(parts.messageRaw);
  const topFrame = firstStackLine(parts.stack);
  const key = `${parts.source}:${parts.code ?? ""}:${normalizedMsg}:${topFrame}`;
  const a = fnv1a64(key);
  const b = fnv1a64(key.split("").reverse().join(""));
  const c = fnv1a64(`${key}|salt`);
  return (toHex16(a) + toHex16(b) + toHex16(c ^ a)).slice(0, 40);
}

function normalizeForFingerprint(msg: string): string {
  return msg.replace(/\s+/g, " ").trim().slice(0, 500);
}

function firstStackLine(stack: string | null | undefined): string {
  if (!stack || typeof stack !== "string") return "";
  const line = stack.split("\n").map((l) => l.trim())[0] ?? "";
  return line.slice(0, 300);
}

export class StokioError extends Error {
  readonly code: string;
  readonly category: ErrorCategory;
  readonly severity: ErrorSeverity;
  readonly source: ErrorSource;
  readonly context: Record<string, unknown>;
  readonly correlationId?: string;

  constructor(
    message: string,
    opts: {
      code: string;
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      source?: ErrorSource;
      context?: Record<string, unknown>;
      correlationId?: string;
    },
  ) {
    super(message);
    this.name = "StokioError";
    this.code = opts.code;
    this.category = opts.category ?? "unknown";
    this.severity = opts.severity ?? "error";
    this.source = opts.source ?? "sdk";
    this.context = opts.context ?? {};
    this.correlationId = opts.correlationId;
  }
}

function isStokioError(e: unknown): e is StokioError {
  return e instanceof StokioError;
}

function isHttpLike(e: unknown): e is Error & { statusCode: number } {
  return (
    typeof e === "object" &&
    e !== null &&
    "statusCode" in e &&
    typeof (e as { statusCode: unknown }).statusCode === "number"
  );
}

function prismaCode(e: unknown): string | null {
  if (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    typeof (e as { code: unknown }).code === "string"
  ) {
    return (e as { code: string }).code;
  }
  return null;
}

function inferCategory(
  err: unknown,
  httpStatus: number | null,
): ErrorCategory {
  const pc = prismaCode(err);
  if (pc && pc.startsWith("P")) return "database";
  if (httpStatus === 401 || httpStatus === 403) return "auth";
  if (httpStatus === 400 || httpStatus === 422) return "validation";
  if (httpStatus != null && httpStatus >= 500) return "integration";
  if (isStokioError(err)) return err.category;
  return "unknown";
}

function inferSeverity(httpStatus: number | null, category: ErrorCategory): ErrorSeverity {
  if (category === "validation" || category === "auth") {
    if (httpStatus != null && httpStatus < 500) return "warning";
  }
  return "error";
}

export function toCanonicalError(
  err: unknown,
  defaults: ToCanonicalDefaults,
): CanonicalErrorPayload {
  const messageRaw =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : JSON.stringify(err);
  const stack = err instanceof Error ? err.stack ?? null : null;
  const httpStatus = defaults.httpStatus ?? (isHttpLike(err) ? err.statusCode : null);
  const category =
    defaults.category ?? inferCategory(err, httpStatus);
  const severity =
    defaults.severity ?? inferSeverity(httpStatus, category);
  const code =
    defaults.code ??
    (isStokioError(err) ? err.code : prismaCode(err)) ??
    (httpStatus != null ? `HTTP_${httpStatus}` : null);

  const occurredAt =
    defaults.occurredAt ?? new Date().toISOString();

  const fingerprint = fingerprintError({
    source: defaults.source,
    code,
    messageRaw,
    stack,
  });

  return {
    occurredAt,
    source: defaults.source,
    severity,
    category,
    code,
    messageRaw,
    messageSanitized: null,
    fingerprint,
    context: defaults.context ?? null,
    stack,
    correlationId: defaults.correlationId ?? null,
    tenantId: defaults.tenantId ?? null,
    httpMethod: defaults.httpMethod ?? null,
    httpPath: defaults.httpPath ?? null,
    httpStatus,
    workflowId: defaults.workflowId ?? null,
    workflowRunId: defaults.workflowRunId ?? null,
    originApp: defaults.originApp ?? null,
  };
}
