type RewriteOptions = {
  tables?: string[];
};

function normalizeTableName(raw: string): string {
  return raw.replace(/^public\./i, "").replace(/"/g, "").trim();
}

function shouldRewriteTable(table: string, opt?: RewriteOptions): boolean {
  const t = normalizeTableName(table);
  const allow = opt?.tables;
  if (!allow || allow.length === 0) return true;
  return allow.map((x) => x.trim()).filter(Boolean).includes(t);
}

function parseCopyHeader(line: string): {
  table: string;
  columns: string[];
  prefix: string;
  suffix: string;
} | null {
  const m = /^COPY\s+([^\s]+)\s*\(([^)]*)\)\s+FROM\s+stdin;\s*$/i.exec(
    line.trim(),
  );
  if (!m) return null;
  const table = m[1] ?? "";
  const colsRaw = m[2] ?? "";
  const columns = colsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((c) => c.replace(/"/g, ""));
  return {
    table,
    columns,
    prefix: `COPY ${table} (`,
    suffix: `) FROM stdin;`,
  };
}

export function rewritePgDumpCopyAddTenantId(
  sql: string,
  tenantId: number,
  opt?: RewriteOptions,
): string {
  const lines = sql.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];

  let inCopy = false;
  let currentCols: string[] = [];
  let rewrite = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";

    if (!inCopy) {
      const header = parseCopyHeader(line);
      if (!header) {
        out.push(line);
        continue;
      }

      const colsLower = header.columns.map((c) => c.toLowerCase());
      const hasTenant = colsLower.includes("tenant_id");
      rewrite = !hasTenant && shouldRewriteTable(header.table, opt);
      currentCols = rewrite ? [...header.columns, "tenant_id"] : header.columns;

      out.push(`${header.prefix}${currentCols.join(", ")}${header.suffix}`);
      inCopy = true;
      continue;
    }

    if (line.trim() === "\\.") {
      out.push(line);
      inCopy = false;
      currentCols = [];
      rewrite = false;
      continue;
    }

    if (!rewrite) {
      out.push(line);
      continue;
    }

    out.push(line.length > 0 ? `${line}\t${tenantId}` : line);
  }

  return out.join("\n");
}

