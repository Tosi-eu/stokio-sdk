import { buildStokioApi } from "./api-surface.js";
import { StokioHttp, type StokioHttpConfig } from "./http.js";

export type StokioClientConfig = StokioHttpConfig;

export type StokioClient = StokioHttp & ReturnType<typeof buildStokioApi>;

export function createStokioClient(cfg: StokioClientConfig): StokioClient {
  const http = new StokioHttp(cfg);
  const api = buildStokioApi(http);
  return Object.assign(http, api);
}
