/**
 * Merges a partial locale override onto the complete English dictionary.
 * Plain objects merge key by key; arrays and primitives from the override
 * replace the base wholesale (a partial Tagalog array of onboarding carousel
 * stages should not be zipped element-by-element with the English one).
 */
export function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) {
    return base;
  }
  if (Array.isArray(base) || Array.isArray(override)) {
    return override as T;
  }
  if (typeof base === 'object' && typeof override === 'object') {
    const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const key of Object.keys(override as Record<string, unknown>)) {
      const overrideVal = (override as Record<string, unknown>)[key];
      const baseVal = (base as Record<string, unknown>)[key];
      result[key] = deepMerge(baseVal, overrideVal);
    }
    return result as T;
  }
  return override as T;
}
