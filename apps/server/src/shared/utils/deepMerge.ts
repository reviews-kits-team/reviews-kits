/**
 * PRODUCTION-GRADE DEEP MERGE UTILITY
 * 
 * Why this algorithm?
 * This implementation was chosen because it goes beyond simple object spreading.
 * In a complex domain layer (DDD), we often deal with nested configurations, 
 * circular references (especially in rich domain models), and special JS types 
 * (Date, Map, Set). Standard shallow merges or naive recursive merges often
 * fail or cause data loss in these scenarios.
 * 
 * Key Features:
 * - Circular Reference Protection: Prevents infinite loops using WeakMap tracking.
 * - Special Type Handling: Properly clones Dates, RegExps, Maps, and Sets instead of merging them.
 * - Configurable Array Strategies: Supports replacing, concatenating, or deduplicating arrays.
 * - Depth-First Recursion: Ensures all nested levels are visited and merged.
 */

type DeepMergeOptions = {
  arrayStrategy?: "replace" | "concat" | "unique";
};

export function deepMerge<T extends object>(
  target: T,
  source: Partial<T>,
  options: DeepMergeOptions = {},
  _seen = new WeakMap()
): T {
  const { arrayStrategy = "replace" } = options;

  // --- CIRCULAR REFERENCE PROTECTION ---
  // If we've already processed this source object, return its previously created clone.
  // This prevents infinite recursion in graphs with cycles.
  if (_seen.has(source as object)) {
    return _seen.get(source as object);
  }

  // Base case: null, undefined, or primitives cannot be merged.
  if (
    source === null ||
    source === undefined ||
    typeof source !== "object"
  ) {
    return source as unknown as T;
  }

  // --- SPECIAL TYPES PRESERVATION ---
  // These types shouldn't be recursed into. We create fresh instances 
  // to maintain value object immutability principles.
  if (source instanceof Date) return new Date(source.getTime()) as unknown as T;
  if (source instanceof RegExp) return new RegExp(source.source, source.flags) as unknown as T;
  if (source instanceof Map) return new Map(source) as unknown as T;
  if (source instanceof Set) return new Set(source) as unknown as T;

  // --- ARRAY MERGING STRATEGY ---
  if (Array.isArray(source)) {
    // If target isn't an array, we simply take the source array.
    if (!Array.isArray(target)) return [...source] as unknown as T;

    if (arrayStrategy === "concat") return [...target, ...source] as unknown as T;
    if (arrayStrategy === "unique") return [...new Set([...target, ...source])] as unknown as T;
    return [...source] as unknown as T; // Default: 'replace'
  }

  // --- OBJECT MERGING ---
  // Start with a shallow copy of the target.
  const output = { ...target } as T;

  // Register the source and its output early to handle potential circular 
  // references discovered during recursion.
  _seen.set(source as object, output);

  for (const key of Object.keys(source) as Array<keyof T>) {
    const sourceVal = source[key];
    const targetVal = target[key];

    // Identify nested objects or arrays for recursion.
    // Note: even if targetVal is missing, we recurse to ensure sourceVal is deep-copied.
    if (
      sourceVal &&
      typeof sourceVal === "object"
    ) {
      output[key] = deepMerge(
        (targetVal || {}) as object,
        sourceVal as object,
        options,
        _seen
      ) as T[keyof T];
    } else {
      // For primitives or simple overrides, just assign the value.
      output[key] = sourceVal as T[keyof T];
    }
  }

  return output;
}
