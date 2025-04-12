/**
 * Build a complete URL with query parameters.
 *
 * @param base - The base URL (e.g., "https://example.com")
 * @param path - Optional relative path (e.g., "/api/route")
 * @param params - Optional query parameters as key-value pairs
 * @returns Full URL string
 */
export function buildUrl(
  base: string,
  path?: string,
  params?: Record<string, string | number | boolean | (string | number)[]>
): string {
  const url = new URL(path ?? "", base);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => {
          url.searchParams.append(key, String(v));
        });
      } else if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}
