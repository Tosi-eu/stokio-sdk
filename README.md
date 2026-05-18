# @stokio/sdk

Pacote TypeScript partilhado entre frontend e backend: tipos, erros canónicos e cliente HTTP tipado (`createStokioClient`).

## Instalação

```bash
npm install @stokio/sdk
```

## Uso rápido

```ts
import { createStokioClient } from "@stokio/sdk";

const client = createStokioClient({
  baseUrl: "http://localhost:3001/api/v1",
  getToken: () => sessionStorage.getItem("authToken"),
});

await client.auth.login("user@example.com", "password", "slug-do-abrigo");
await client.tenant.config();
```

Tipos: `import type { TenantConfigResponse } from "@stokio/sdk"`.

Helpers só Node (ex.: gzip de backup): `import { … } from "@stokio/sdk/server"` — não usar no browser.

## Build local

```bash
cd sdk
npm install
npm run build
```
