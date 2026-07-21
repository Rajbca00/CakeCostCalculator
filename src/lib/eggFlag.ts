import type { Ingredient, Recipe } from '../types';

const EGG_NAME_PATTERN = /\begg(s)?\b/i;

/** True if an ingredient's own name is (or contains) the word "egg"/"eggs", e.g. "Eggs", "Farm Eggs". */
export function isEggIngredient(ingredient: Pick<Ingredient, 'name'>): boolean {
  return EGG_NAME_PATTERN.test(ingredient.name);
}

/**
 * True if any ingredient line on `recipe` uses an ingredient named "egg"/"eggs" (e.g. "Eggs",
 * "Farm Eggs"). Pass the effective (parent-inherited) recipe so a child recipe correctly picks
 * up an egg ingredient used only in an ancestor.
 */
export function recipeContainsEgg(
  recipe: Pick<Recipe, 'ingredientLines'>,
  ingredientsById: Map<string, Ingredient>,
): boolean {
  return recipe.ingredientLines.some((line) => {
    const ingredient = ingredientsById.get(line.ingredientId);
    return !!ingredient && isEggIngredient(ingredient);
  });
}
