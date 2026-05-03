# @stokio/sdk

Shared TypeScript types and entities for **Stokio** (stock, medicines, residents, movements, canonical errors, and related contracts). Use the same package in backend and frontend to keep a single source of truth.

## Install

From the public npm registry:

```bash
npm install @stokio/sdk
# or
pnpm add @stokio/sdk
```

In a monorepo, apps can depend on a version range from the registry so CI can run in frontend-only or backend-only checkouts without a local `sdk` folder.

## Local development (without publishing)

After changing the SDK, build and link from the `sdk` directory:

```bash
cd sdk && npm run build && npm link
cd ../frontend && npm link @stokio/sdk
# or, with pnpm: pnpm add @stokio/sdk@../sdk
```

As a temporary override in an app `package.json`:

```json
"@stokio/sdk": "file:../sdk"
```

## Publishing to npm

1. Create or join the npm organization that owns the `@stokio` scope (see [npm orgs](https://www.npmjs.com/org/create)) and ensure you are logged in (`npm login` / `npm whoami`).
2. From the `sdk` folder:

```bash
npm run build
npm publish --access public
```

`package.json` already sets `"publishConfig": { "access": "public" }` and `prepublishOnly` runs the build.

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
