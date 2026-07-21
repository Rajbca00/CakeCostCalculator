import type { ExtraCost, Recipe, RecipeIngredientLine } from '../types';

/** Guards against pathological chains; real cycles are prevented separately via seen-set checks. */
const MAX_CHAIN_DEPTH = 25;

/** Ancestors of `recipe` ordered root-first (index 0 is the topmost parent). Stops early on a cycle. */
export function getParentChain(recipe: Recipe, recipesById: Map<string, Recipe>): Recipe[] {
  const chain: Recipe[] = [];
  const seen = new Set<string>([recipe.id]);
  let current = recipe;
  while (current.parentRecipeId && chain.length < MAX_CHAIN_DEPTH) {
    const parent = recipesById.get(current.parentRecipeId);
    if (!parent || seen.has(parent.id)) break;
    chain.unshift(parent);
    seen.add(parent.id);
    current = parent;
  }
  return chain;
}

/**
 * Merges a recipe with all of its ancestors' ingredient lines/extra costs (root-first, so a
 * grandparent's lines come before the parent's, before the recipe's own), so its cost
 * automatically reflects the whole inheritance chain -- editing an ancestor is instantly
 * reflected here since nothing is duplicated/stored, just recomputed on read. Every other
 * field (yield, profit %, notes, labour/electricity/wastage settings, etc.) comes from
 * `recipe` itself; only ingredientLines/extraCosts are inherited.
 */
export function getEffectiveRecipe(recipe: Recipe, recipesById: Map<string, Recipe>): Recipe {
  const ancestors = getParentChain(recipe, recipesById);
  if (ancestors.length === 0) return recipe;

  const ingredientLines: RecipeIngredientLine[] = [
    ...ancestors.flatMap((a) => a.ingredientLines),
    ...recipe.ingredientLines,
  ];
  const extraCosts: ExtraCost[] = [...ancestors.flatMap((a) => a.extraCosts), ...recipe.extraCosts];

  return { ...recipe, ingredientLines, extraCosts };
}

export function getDirectChildren(recipeId: string, recipes: Recipe[]): Recipe[] {
  return recipes.filter((r) => r.parentRecipeId === recipeId);
}

/**
 * True if setting `candidateParentId` as `recipeId`'s parent would create a cycle
 * (including the trivial self-reference case).
 */
export function wouldCreateCycle(
  recipeId: string,
  candidateParentId: string,
  recipesById: Map<string, Recipe>,
): boolean {
  if (recipeId === candidateParentId) return true;
  const seen = new Set<string>([recipeId]);
  let current = recipesById.get(candidateParentId);
  while (current) {
    if (seen.has(current.id)) return true;
    seen.add(current.id);
    if (!current.parentRecipeId) return false;
    current = recipesById.get(current.parentRecipeId);
  }
  return false;
}
