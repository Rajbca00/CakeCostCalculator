import { generateId } from './id';
import type { Recipe } from '../types';

export function generateUniqueCloneName(
  baseName: string,
  existingRecipes: { name: string }[],
): string {
  const existingLower = new Set(existingRecipes.map((r) => r.name.trim().toLowerCase()));
  let candidate = `${baseName} (Copy)`;
  let n = 2;
  while (existingLower.has(candidate.toLowerCase())) {
    candidate = `${baseName} (Copy ${n})`;
    n++;
  }
  return candidate;
}

export function cloneRecipeWithName(source: Recipe, newName: string): Recipe {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: newName.trim(),
    baseYieldQuantity: source.baseYieldQuantity,
    baseYieldLabel: source.baseYieldLabel,
    profitPercent: source.profitPercent,
    ingredientLines: source.ingredientLines.map((line) => ({ ...line, id: generateId() })),
    extraCosts: source.extraCosts.map((cost) => ({ ...cost, id: generateId() })),
    notes: source.notes,
    category: source.category,
    activeTimeMinutes: source.activeTimeMinutes,
    bakeTimeMinutes: source.bakeTimeMinutes,
    ovenPowerWatts: source.ovenPowerWatts,
    wastagePercentOverride: source.wastagePercentOverride,
    createdAt: now,
    updatedAt: now,
  };
}
