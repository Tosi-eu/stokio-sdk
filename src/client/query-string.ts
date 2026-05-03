export function buildQueryString(params?: Record<string, unknown>): string {
  if (!params) return "";

  try {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            searchParams.append(key, String(item));
          });
        } else {
          const sanitizedKey = String(key).replace(/[^a-zA-Z0-9_-]/g, "");
          if (sanitizedKey) {
            searchParams.append(sanitizedKey, String(value));
          }
        }
      }
    });

    const query = searchParams.toString();
    return query ? `?${query}` : "";
  } catch {
    return "";
  }
}
