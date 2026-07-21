import { useMemo } from 'react';
import type { Ingredient } from '../types';
import { useAppDataContext } from './AppDataContext';

export function useIngredients(): Ingredient[] {
  return useAppDataContext().ingredients;
}

export function useIngredientsById(): Map<string, Ingredient> {
  const ingredients = useIngredients();
  return useMemo(() => new Map(ingredients.map((i) => [i.id, i])), [ingredients]);
}

export function useIngredientById(id: string | undefined): Ingredient | undefined {
  const ingredients = useIngredients();
  return useMemo(() => ingredients.find((i) => i.id === id), [ingredients, id]);
}

export function useRecipes() {
  return useAppDataContext().recipes;
}

export function useRecipeById(id: string | undefined) {
  const recipes = useRecipes();
  return useMemo(() => recipes.find((r) => r.id === id), [recipes, id]);
}

export function useRecipesUsingIngredient(ingredientId: string) {
  const recipes = useRecipes();
  return useMemo(
    () =>
      recipes.filter((r) => r.ingredientLines.some((l) => l.ingredientId === ingredientId)),
    [recipes, ingredientId],
  );
}

export function usePriceListingVariants() {
  return useAppDataContext().priceListingVariants;
}

export function useSettings() {
  return useAppDataContext().settings;
}

export function usePackagingTemplates() {
  return useAppDataContext().packagingTemplates;
}

export { useAppDataContext } from './AppDataContext';
