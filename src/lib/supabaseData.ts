import { supabase } from './supabaseClient';
import type {
  AppData,
  ExtraCost,
  Ingredient,
  PriceListingVariant,
  Recipe,
  RecipeIngredientLine,
  Unit,
} from '../types';

interface IngredientRow {
  id: string;
  user_id: string;
  name: string;
  purchase_cost: number;
  purchase_quantity: number;
  purchase_unit: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface RecipeRow {
  id: string;
  user_id: string;
  name: string;
  base_yield_quantity: number;
  base_yield_label: string;
  profit_percent: number;
  ingredient_lines: RecipeIngredientLine[];
  extra_costs: ExtraCost[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface PriceListingVariantRow {
  id: string;
  user_id: string;
  recipe_id: string;
  name: string;
  group_names: string[];
  multiplier: number;
  created_at: string;
  updated_at: string;
}

function rowToIngredient(row: IngredientRow): Ingredient {
  return {
    id: row.id,
    name: row.name,
    purchaseCost: row.purchase_cost,
    purchaseQuantity: row.purchase_quantity,
    purchaseUnit: row.purchase_unit as Unit,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function ingredientToRow(userId: string, ingredient: Ingredient): IngredientRow {
  return {
    id: ingredient.id,
    user_id: userId,
    name: ingredient.name,
    purchase_cost: ingredient.purchaseCost,
    purchase_quantity: ingredient.purchaseQuantity,
    purchase_unit: ingredient.purchaseUnit,
    notes: ingredient.notes ?? null,
    created_at: ingredient.createdAt,
    updated_at: ingredient.updatedAt,
  };
}

function rowToRecipe(row: RecipeRow): Recipe {
  return {
    id: row.id,
    name: row.name,
    baseYieldQuantity: row.base_yield_quantity,
    baseYieldLabel: row.base_yield_label,
    profitPercent: row.profit_percent ?? 0,
    ingredientLines: row.ingredient_lines,
    extraCosts: row.extra_costs,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function recipeToRow(userId: string, recipe: Recipe): RecipeRow {
  return {
    id: recipe.id,
    user_id: userId,
    name: recipe.name,
    base_yield_quantity: recipe.baseYieldQuantity,
    base_yield_label: recipe.baseYieldLabel,
    profit_percent: recipe.profitPercent,
    ingredient_lines: recipe.ingredientLines,
    extra_costs: recipe.extraCosts,
    notes: recipe.notes ?? null,
    created_at: recipe.createdAt,
    updated_at: recipe.updatedAt,
  };
}

function rowToPriceListingVariant(row: PriceListingVariantRow): PriceListingVariant {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    name: row.name,
    groupNames: row.group_names,
    multiplier: row.multiplier,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function priceListingVariantToRow(
  userId: string,
  variant: PriceListingVariant,
): PriceListingVariantRow {
  return {
    id: variant.id,
    user_id: userId,
    recipe_id: variant.recipeId,
    name: variant.name,
    group_names: variant.groupNames,
    multiplier: variant.multiplier,
    created_at: variant.createdAt,
    updated_at: variant.updatedAt,
  };
}

export async function fetchAllData(userId: string): Promise<AppData> {
  const [ingredientsResult, recipesResult, priceListingVariantsResult] = await Promise.all([
    supabase.from('ingredients').select('*').eq('user_id', userId),
    supabase.from('recipes').select('*').eq('user_id', userId),
    supabase.from('price_listing_variants').select('*').eq('user_id', userId),
  ]);

  if (ingredientsResult.error) throw ingredientsResult.error;
  if (recipesResult.error) throw recipesResult.error;
  if (priceListingVariantsResult.error) throw priceListingVariantsResult.error;

  return {
    schemaVersion: 1,
    ingredients: (ingredientsResult.data as IngredientRow[]).map(rowToIngredient),
    recipes: (recipesResult.data as RecipeRow[]).map(rowToRecipe),
    priceListingVariants: (priceListingVariantsResult.data as PriceListingVariantRow[]).map(
      rowToPriceListingVariant,
    ),
  };
}

export async function insertIngredientRow(userId: string, ingredient: Ingredient): Promise<void> {
  const { error } = await supabase.from('ingredients').insert(ingredientToRow(userId, ingredient));
  if (error) throw error;
}

export async function updateIngredientRow(userId: string, ingredient: Ingredient): Promise<void> {
  const { error } = await supabase
    .from('ingredients')
    .update(ingredientToRow(userId, ingredient))
    .eq('id', ingredient.id)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function deleteIngredientRow(userId: string, id: string): Promise<void> {
  const { error } = await supabase.from('ingredients').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
}

export async function insertRecipeRow(userId: string, recipe: Recipe): Promise<void> {
  const { error } = await supabase.from('recipes').insert(recipeToRow(userId, recipe));
  if (error) throw error;
}

export async function updateRecipeRow(userId: string, recipe: Recipe): Promise<void> {
  const { error } = await supabase
    .from('recipes')
    .update(recipeToRow(userId, recipe))
    .eq('id', recipe.id)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function deleteRecipeRow(userId: string, id: string): Promise<void> {
  const { error } = await supabase.from('recipes').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
}

export async function insertPriceListingVariantRow(
  userId: string,
  variant: PriceListingVariant,
): Promise<void> {
  const { error } = await supabase
    .from('price_listing_variants')
    .insert(priceListingVariantToRow(userId, variant));
  if (error) throw error;
}

export async function updatePriceListingVariantRow(
  userId: string,
  variant: PriceListingVariant,
): Promise<void> {
  const { error } = await supabase
    .from('price_listing_variants')
    .update(priceListingVariantToRow(userId, variant))
    .eq('id', variant.id)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function deletePriceListingVariantRow(userId: string, id: string): Promise<void> {
  const { error } = await supabase
    .from('price_listing_variants')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function replaceAllRows(userId: string, data: AppData): Promise<void> {
  const [deleteIngredients, deleteRecipes, deletePriceListingVariants] = await Promise.all([
    supabase.from('ingredients').delete().eq('user_id', userId),
    supabase.from('recipes').delete().eq('user_id', userId),
    supabase.from('price_listing_variants').delete().eq('user_id', userId),
  ]);
  if (deleteIngredients.error) throw deleteIngredients.error;
  if (deleteRecipes.error) throw deleteRecipes.error;
  if (deletePriceListingVariants.error) throw deletePriceListingVariants.error;

  if (data.ingredients.length > 0) {
    const { error } = await supabase
      .from('ingredients')
      .insert(data.ingredients.map((i) => ingredientToRow(userId, i)));
    if (error) throw error;
  }
  if (data.recipes.length > 0) {
    const { error } = await supabase
      .from('recipes')
      .insert(data.recipes.map((r) => recipeToRow(userId, r)));
    if (error) throw error;
  }
  if (data.priceListingVariants.length > 0) {
    const { error } = await supabase
      .from('price_listing_variants')
      .insert(data.priceListingVariants.map((v) => priceListingVariantToRow(userId, v)));
    if (error) throw error;
  }
}
