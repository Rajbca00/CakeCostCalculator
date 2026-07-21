import { useMemo } from 'react';
import type { AddOn, Ingredient, PackagingTemplate, Recipe } from '../types';
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

export function useRecipeVersions(recipeId: string | undefined) {
  const versions = useAppDataContext().recipeVersions;
  return useMemo(
    () =>
      versions
        .filter((v) => v.recipeId === recipeId)
        .sort((a, b) => a.versionNumber - b.versionNumber),
    [versions, recipeId],
  );
}

export function useRecipesById(): Map<string, Recipe> {
  const recipes = useRecipes();
  return useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);
}

export function usePackagingTemplatesById(): Map<string, PackagingTemplate> {
  const templates = usePackagingTemplates();
  return useMemo(() => new Map(templates.map((t) => [t.id, t])), [templates]);
}

export function useAddOns() {
  return useAppDataContext().addOns;
}

export function useAddOnsById(): Map<string, AddOn> {
  const addOns = useAddOns();
  return useMemo(() => new Map(addOns.map((a) => [a.id, a])), [addOns]);
}

export function useQuotes() {
  return useAppDataContext().quotes;
}

export { useAppDataContext } from './AppDataContext';
