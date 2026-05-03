# @stokio/sdk

Shared TypeScript types and entities for **Stokio** (stock, medicines, residents, movements, canonical errors, and related contracts). Use the same package in backend and frontend to keep a single source of truth.

The published `dist/` is **CommonJS** (`require`) so Node (Nest, Temporal worker, scripts) resolves subpaths correctly; bundlers (Next.js, Vite) consume it without extra configuration.

## Install

From the public npm registry:

```bash
npm install @stokio/sdk
# or
pnpm add @stokio/sdk
```

## Usage

```ts
import type { PublicTenantListItem, TenantConfigResponse } from "@stokio/sdk";
import { toCanonicalError } from "@stokio/sdk";
```

### Node-only exports (`pg_dump` gzip / rewrite)

The default entry (`@stokio/sdk`) is safe for **browser and Next.js client bundles**. Helpers that use Node built-ins (`node:zlib`, etc.) are exported only from:

```ts
import { gunzipIfNeeded } from "@stokio/sdk/server";
```

Do **not** import `@stokio/sdk/server` from browser or shared client code.

Multi-tenant contracts (login, branding) are documented in the Stokio product docs.
