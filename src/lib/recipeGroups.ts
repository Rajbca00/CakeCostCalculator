import type { Recipe } from '../types';

export const UNGROUPED = 'Ungrouped';

export function normalizeGroupName(name: string | undefined): string {
  const trimmed = name?.trim();
  return trimmed ? trimmed : UNGROUPED;
}

/** Distinct group names used across a recipe's ingredient lines and extra costs, in first-seen order. */
export function getGroupNames(recipe: Recipe): string[] {
  const seen: string[] = [];
  const add = (name: string | undefined) => {
    const normalized = normalizeGroupName(name);
    if (!seen.includes(normalized)) seen.push(normalized);
  };
  recipe.ingredientLines.forEach((l) => add(l.groupName));
  recipe.extraCosts.forEach((e) => add(e.groupName));
  return seen;
}
