import { calculateRecipeCost, type RecipeCostResult } from './costCalculations';
import { getGroupNames } from './recipeGroups';
import { getEffectiveRecipe } from './recipeHierarchy';
import { resolveVariantPrice } from './pricingStrategy';
import type { BusinessSettings, Ingredient, PriceListingVariant, Recipe } from '../types';

export function calculateVariantCost(
  variant: PriceListingVariant,
  recipe: Recipe,
  ingredientsById: Map<string, Ingredient>,
  recipesById: Map<string, Recipe>,
  settings?: BusinessSettings,
): RecipeCostResult {
  const effectiveRecipe = getEffectiveRecipe(recipe, recipesById);
  return calculateRecipeCost(
    effectiveRecipe,
    ingredientsById,
    variant.multiplier,
    new Set(variant.groupNames),
    0,
    settings,
  );
}

/** The customer-facing selling price for a menu item, per its chosen pricing strategy. */
export function calculateVariantSellingPrice(
  variant: PriceListingVariant,
  costResult: RecipeCostResult,
): number {
  return resolveVariantPrice(
    costResult,
    variant.pricingStrategy,
    variant.fixedPrice,
    variant.targetProfitAmount,
    variant.targetFoodCostPercent,
  );
}

/**
 * Default display name for a variant, e.g. "Vanilla Sponge" or "Vanilla Sponge — Base + Icing".
 * Groups are counted against the effective (parent-inherited) group set, so a child recipe's
 * variant name only calls out the groups actually excluded, not every inherited one.
 */
export function suggestVariantName(
  recipe: Recipe,
  groupNames: string[],
  recipesById: Map<string, Recipe>,
): string {
  const allGroups = getGroupNames(getEffectiveRecipe(recipe, recipesById));
  if (groupNames.length === allGroups.length) return recipe.name;
  return `${recipe.name} — ${groupNames.join(' + ')}`;
}
