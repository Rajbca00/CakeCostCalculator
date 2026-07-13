export function isPositiveNumber(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function isNonNegativeNumber(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

export function isNonEmptyString(value: string): boolean {
  return value.trim().length > 0;
}

export function isRecipeNameUnique(
  name: string,
  recipes: { id: string; name: string }[],
  excludeId?: string,
): boolean {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return true;
  return !recipes.some(
    (r) => r.id !== excludeId && r.name.trim().toLowerCase() === normalized,
  );
}
