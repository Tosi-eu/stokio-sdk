# @stokio/sdk

Shared TypeScript **contracts**, **entities**, **enums**, **canonical errors**, and a **typed HTTP client** (`createStokioClient`) for Stokio (stock, medicines, residents, movements, admin, tenant, etc.). Use the same package in backend and frontend to keep a single source of truth.

The published `dist/` is **CommonJS** (`require`) so Node (Nest, Temporal worker, scripts) resolves subpaths correctly; bundlers (Next.js, Vite) consume it without extra configuration.

## Install

From the public npm registry:

```bash
npm install @stokio/sdk
# or
pnpm add @stokio/sdk
```

## Usage

### Types and errors

```ts
import type { PublicTenantListItem, TenantConfigResponse } from "@stokio/sdk";
import { toCanonicalError } from "@stokio/sdk";
```

### HTTP client (`createStokioClient`)

The client is **environment-agnostic**: pass `baseUrl`, `getToken`, and optional hooks for preview mode / error UX (as in the Next.js app).

```ts
import { createStokioClient, StokioApiError } from "@stokio/sdk";

const client = createStokioClient({
  baseUrl: "https://api.example.com/api/v1",
  getToken: () => sessionStorage.getItem("authToken"),
  onBeforeRequest: async ({ path, method }) => {
    // e.g. block mutations in demo mode
  },
  onHttpError: (err: StokioApiError) => {
    // Map 401/403 to your router or throw user-facing errors; must throw/reject.
    throw err;
  },
});

// Modular API (also available as client.get/post/... for raw paths)
await client.auth.login("user", "pass", "tenant-slug");
await client.movements.listMedicineMovements({ page: 1, limit: 10, type: "entrada" });
await client.tenant.config();
```

`createStokioClient` returns an object that merges `StokioHttp` (`get`, `post`, `put`, `patch`, `delete`) with resource groups (`movements`, `stock`, `auth`, `tenant`, `admin`, `public`, `imports`, …).

### Node-only exports (`pg_dump` gzip / rewrite)

The default entry (`@stokio/sdk`) is safe for **browser and Next.js client bundles**. Helpers that use Node built-ins (`node:zlib`, etc.) are exported only from:

```ts
import { gunzipIfNeeded } from "@stokio/sdk/server";
```

Do **not** import `@stokio/sdk/server` from browser or shared client code.

### Optional: upload progress (browser)

```ts
import { uploadTenantBrandingLogoWithProgress } from "@stokio/sdk";

await uploadTenantBrandingLogoWithProgress({
  baseUrl,
  file,
  brandName,
  getToken: () => token,
  callbacks: { onUploadProgress: (p) => {} },
});
```

Multi-tenant contracts (login, branding) are documented in the Stokio product docs.
