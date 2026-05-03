import { buildQueryString } from "./query-string.js";
import {
  extractApiErrorMessage,
  StokioApiError,
  type StokioApiErrorBody,
} from "./stokio-api-error.js";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type BeforeRequestCtx = {
  path: string;
  method: HttpMethod;
  body?: unknown;
};

export type StokioHttpConfig = {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  getToken?: () => string | null | Promise<string | null>;
  getExtraHeaders?: () => HeadersInit | Promise<HeadersInit>;
  onBeforeRequest?: (ctx: BeforeRequestCtx) => void | Promise<void>;
  onHttpError?: (err: StokioApiError) => Promise<never> | never;
};

export type HttpRequestInit = {
  params?: Record<string, unknown>;
  headers?: HeadersInit;
  body?: unknown;
  silentInsufficientPrivileges?: boolean;
  responseType?: "json" | "blob" | "text";
  signal?: AbortSignal;
  credentials?: RequestCredentials;
};

function normalizeBase(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function mergeHeaders(
  a: HeadersInit | undefined,
  b: HeadersInit | undefined,
): HeadersInit {
  const out = new Headers();
  if (a) new Headers(a).forEach((v, k) => out.set(k, v));
  if (b) new Headers(b).forEach((v, k) => out.set(k, v));
  return out;
}

export class StokioHttp {
  constructor(private readonly cfg: StokioHttpConfig) {}

  async request<T>(
    method: HttpMethod,
    path: string,
    init?: HttpRequestInit,
  ): Promise<T> {
    const body = init?.body;
    await this.cfg.onBeforeRequest?.({ path, method, body });

    const token =
      this.cfg.getToken != null
        ? await Promise.resolve(this.cfg.getToken())
        : null;
    const extra =
      this.cfg.getExtraHeaders != null
        ? await Promise.resolve(this.cfg.getExtraHeaders())
        : undefined;

    const fetchFn = this.cfg.fetchImpl ?? globalThis.fetch.bind(globalThis);
    const rel = path.startsWith("/") ? path : `/${path}`;
    const url = `${normalizeBase(this.cfg.baseUrl)}${rel}${buildQueryString(init?.params)}`;

    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    const baseHeaders: Record<string, string> = {};
    if (!isFormData) {
      baseHeaders["Content-Type"] = "application/json";
      baseHeaders.Accept = "application/json";
    }
    if (token) baseHeaders.Authorization = `Bearer ${token}`;

    const headers = mergeHeaders(
      baseHeaders as HeadersInit,
      mergeHeaders(extra, init?.headers),
    );

    const res = await fetchFn(url, {
      method,
      credentials: init?.credentials ?? "include",
      headers,
      signal: init?.signal,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? (body as FormData)
            : JSON.stringify(body),
    });

    const responseType = init?.responseType ?? "json";

    if (responseType === "blob") {
      if (!res.ok) {
        const err = await this.buildError(
          res,
          method,
          path,
          init?.silentInsufficientPrivileges,
        );
        if (this.cfg.onHttpError) await this.cfg.onHttpError(err);
        throw err;
      }
      return (await res.blob()) as T;
    }

    if (responseType === "text") {
      const text = await res.text();
      if (!res.ok) {
        let data: StokioApiErrorBody = null;
        try {
          data = text ? (JSON.parse(text) as Record<string, unknown>) : null;
        } catch {
          data = { raw: text };
        }
        const rawMsg = extractApiErrorMessage(data);
        const err = new StokioApiError({
          message: rawMsg,
          messageRaw: rawMsg,
          httpStatus: res.status,
          httpPath: path,
          httpMethod: method,
          responseBody: data,
          silentInsufficientPrivileges: init?.silentInsufficientPrivileges,
        });
        if (this.cfg.onHttpError) await this.cfg.onHttpError(err);
        throw err;
      }
      return text as T;
    }

    const data = (await res.json().catch(() => null)) as unknown;
    if (!res.ok) {
      const rawMsg = extractApiErrorMessage(data);
      const err = new StokioApiError({
        message: rawMsg,
        messageRaw: rawMsg,
        httpStatus: res.status,
        httpPath: path,
        httpMethod: method,
        responseBody:
          data !== null && typeof data === "object"
            ? (data as Record<string, unknown>)
            : null,
        silentInsufficientPrivileges: init?.silentInsufficientPrivileges,
      });
      if (this.cfg.onHttpError) await this.cfg.onHttpError(err);
      throw err;
    }
    return data as T;
  }

  private async buildError(
    res: Response,
    method: HttpMethod,
    path: string,
    silentInsufficientPrivileges?: boolean,
  ): Promise<StokioApiError> {
    const text = await res.text().catch(() => "");
    let data: StokioApiErrorBody = null;
    try {
      data = text ? (JSON.parse(text) as Record<string, unknown>) : null;
    } catch {
      data = text ? { raw: text } : null;
    }
    const rawMsg = extractApiErrorMessage(data);
    return new StokioApiError({
      message: rawMsg,
      messageRaw: rawMsg,
      httpStatus: res.status,
      httpPath: path,
      httpMethod: method,
      responseBody: data,
      silentInsufficientPrivileges,
    });
  }

  get<T>(path: string, init?: Omit<HttpRequestInit, "body">) {
    return this.request<T>("GET", path, init);
  }

  post<T>(
    path: string,
    body?: unknown,
    init?: Omit<HttpRequestInit, "body"> & Pick<RequestInit, "headers">,
  ) {
    return this.request<T>("POST", path, { ...init, body });
  }

  put<T>(
    path: string,
    body?: unknown,
    init?: Omit<HttpRequestInit, "body"> & Pick<RequestInit, "headers">,
  ) {
    return this.request<T>("PUT", path, {
      ...init,
      headers: init?.headers,
      body,
    });
  }

  patch<T>(
    path: string,
    body?: unknown,
    init?: Omit<HttpRequestInit, "body"> & Pick<RequestInit, "headers">,
  ) {
    return this.request<T>("PATCH", path, {
      ...init,
      headers: init?.headers,
      body,
    });
  }

  delete<T>(
    path: string,
    body?: unknown,
    init?: Omit<HttpRequestInit, "body"> & Pick<RequestInit, "headers">,
  ) {
    return this.request<T>("DELETE", path, {
      ...init,
      headers: init?.headers,
      body,
    });
  }
}
