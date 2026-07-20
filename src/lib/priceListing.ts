import { calculateRecipeCost, type RecipeCostResult } from './costCalculations';
import { getGroupNames } from './recipeGroups';
import type { Ingredient, PriceListingVariant, Recipe } from '../types';

export function calculateVariantCost(
  variant: PriceListingVariant,
  recipe: Recipe,
  ingredientsById: Map<string, Ingredient>,
): RecipeCostResult {
  return calculateRecipeCost(
    recipe,
    ingredientsById,
    variant.multiplier,
    new Set(variant.groupNames),
  );
}

/** Default display name for a variant, e.g. "Vanilla Sponge" or "Vanilla Sponge — Base + Icing". */
export function suggestVariantName(recipe: Recipe, groupNames: string[]): string {
  const allGroups = getGroupNames(recipe);
  if (groupNames.length === allGroups.length) return recipe.name;
  return `${recipe.name} — ${groupNames.join(' + ')}`;
}
