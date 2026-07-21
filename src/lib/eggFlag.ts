import type { Ingredient, Recipe } from '../types';

/**
 * True if any ingredient line on `recipe` uses an ingredient marked as containing egg.
 * Pass the effective (parent-inherited) recipe so a child recipe correctly picks up an
 * egg ingredient used only in an ancestor.
 */
export function recipeContainsEgg(
  recipe: Pick<Recipe, 'ingredientLines'>,
  ingredientsById: Map<string, Ingredient>,
): boolean {
  return recipe.ingredientLines.some((line) => ingredientsById.get(line.ingredientId)?.containsEgg);
}
