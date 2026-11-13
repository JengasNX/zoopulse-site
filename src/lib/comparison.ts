export const COMPARISON_LIMIT = 3;
export const COMPARISON_KEY = "zp_compare_v1";

export function sanitizeComparison(value: unknown, allowedIds: readonly string[]): string[] {
  if (!Array.isArray(value)) return [];
  const allowed = new Set(allowedIds);
  return [...new Set(value.filter((id): id is string => typeof id === "string" && allowed.has(id)))].slice(0, COMPARISON_LIMIT);
}

export function toggleComparison(ids: readonly string[], id: string): string[] {
  if (ids.includes(id)) return ids.filter(value => value !== id);
  return ids.length < COMPARISON_LIMIT ? [...ids, id] : [...ids];
}
