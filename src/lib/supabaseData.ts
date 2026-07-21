import { supabase } from './supabaseClient';
import { DEFAULT_BUSINESS_SETTINGS } from '../types';
import type {
  AddOn,
  AppData,
  BusinessSettings,
  CostBucket,
  ExtraCost,
  Ingredient,
  PriceListingVariant,
  PricingStrategy,
  Quote,
  Recipe,
  RecipeCategory,
  RecipeIngredientLine,
  RecipeStatus,
  RecipeVersion,
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
  category: string | null;
  active_time_minutes: number | null;
  bake_time_minutes: number | null;
  oven_power_watts: number | null;
  wastage_percent_override: number | null;
  parent_recipe_id: string | null;
  status: string | null;
  group_buckets: Record<string, CostBucket> | null;
  created_at: string;
  updated_at: string;
}

interface RecipeVersionRow {
  id: string;
  user_id: string;
  recipe_id: string;
  version_number: number;
  status: string;
  name: string;
  base_yield_quantity: number;
  base_yield_label: string;
  profit_percent: number;
  ingredient_lines: RecipeIngredientLine[];
  extra_costs: ExtraCost[];
  notes: string | null;
  category: string | null;
  parent_recipe_id: string | null;
  active_time_minutes: number | null;
  bake_time_minutes: number | null;
  oven_power_watts: number | null;
  wastage_percent_override: number | null;
  group_buckets: Record<string, CostBucket> | null;
  created_at: string;
}

interface PriceListingVariantRow {
  id: string;
  user_id: string;
  recipe_id: string;
  name: string;
  group_names: string[];
  multiplier: number;
  pricing_strategy: string | null;
  fixed_price: number | null;
  target_profit_amount: number | null;
  target_food_cost_percent: number | null;
  serving_size: string | null;
  created_at: string;
  updated_at: string;
}

interface AddOnRow {
  id: string;
  user_id: string;
  name: string;
  additional_cost: number;
  additional_selling_price: number;
  created_at: string;
  updated_at: string;
}

interface QuoteRow {
  id: string;
  user_id: string;
  recipe_id: string;
  variant_id: string | null;
  add_on_ids: string[];
  multiplier: number;
  custom_label: string | null;
  customer_name: string | null;
  notes: string | null;
  selling_price: number;
  internal_cost: number | null;
  created_at: string;
  updated_at: string;
}

interface BusinessSettingsRow {
  user_id: string;
  labor_hourly_rate: number;
  electricity_rate_per_unit: number;
  oven_power_watts: number;
  lpg_cost_per_hour: number;
  wastage_percent: number;
  default_markup_percent: number;
  currency_code: string;
  currency_symbol: string;
  tax_percent: number;
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
    category: (row.category as RecipeCategory | null) ?? undefined,
    activeTimeMinutes: row.active_time_minutes ?? undefined,
    bakeTimeMinutes: row.bake_time_minutes ?? undefined,
    ovenPowerWatts: row.oven_power_watts ?? undefined,
    wastagePercentOverride: row.wastage_percent_override ?? undefined,
    parentRecipeId: row.parent_recipe_id ?? undefined,
    status: (row.status as RecipeStatus | null) ?? undefined,
    groupBuckets: row.group_buckets ?? undefined,
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
    category: recipe.category ?? null,
    active_time_minutes: recipe.activeTimeMinutes ?? null,
    bake_time_minutes: recipe.bakeTimeMinutes ?? null,
    oven_power_watts: recipe.ovenPowerWatts ?? null,
    wastage_percent_override: recipe.wastagePercentOverride ?? null,
    parent_recipe_id: recipe.parentRecipeId ?? null,
    status: recipe.status ?? null,
    group_buckets: recipe.groupBuckets ?? null,
    created_at: recipe.createdAt,
    updated_at: recipe.updatedAt,
  };
}

function rowToRecipeVersion(row: RecipeVersionRow): RecipeVersion {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    versionNumber: row.version_number,
    status: row.status as RecipeStatus,
    name: row.name,
    baseYieldQuantity: row.base_yield_quantity,
    baseYieldLabel: row.base_yield_label,
    profitPercent: row.profit_percent ?? 0,
    ingredientLines: row.ingredient_lines,
    extraCosts: row.extra_costs,
    notes: row.notes ?? undefined,
    category: (row.category as RecipeCategory | null) ?? undefined,
    parentRecipeId: row.parent_recipe_id ?? undefined,
    activeTimeMinutes: row.active_time_minutes ?? undefined,
    bakeTimeMinutes: row.bake_time_minutes ?? undefined,
    ovenPowerWatts: row.oven_power_watts ?? undefined,
    wastagePercentOverride: row.wastage_percent_override ?? undefined,
    groupBuckets: row.group_buckets ?? undefined,
    createdAt: row.created_at,
  };
}

function recipeVersionToRow(userId: string, version: RecipeVersion): RecipeVersionRow {
  return {
    id: version.id,
    user_id: userId,
    recipe_id: version.recipeId,
    version_number: version.versionNumber,
    status: version.status,
    name: version.name,
    base_yield_quantity: version.baseYieldQuantity,
    base_yield_label: version.baseYieldLabel,
    profit_percent: version.profitPercent,
    ingredient_lines: version.ingredientLines,
    extra_costs: version.extraCosts,
    notes: version.notes ?? null,
    category: version.category ?? null,
    parent_recipe_id: version.parentRecipeId ?? null,
    active_time_minutes: version.activeTimeMinutes ?? null,
    bake_time_minutes: version.bakeTimeMinutes ?? null,
    oven_power_watts: version.ovenPowerWatts ?? null,
    wastage_percent_override: version.wastagePercentOverride ?? null,
    group_buckets: version.groupBuckets ?? null,
    created_at: version.createdAt,
  };
}

function rowToPriceListingVariant(row: PriceListingVariantRow): PriceListingVariant {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    name: row.name,
    groupNames: row.group_names,
    multiplier: row.multiplier,
    pricingStrategy: (row.pricing_strategy as PricingStrategy | null) ?? undefined,
    fixedPrice: row.fixed_price ?? undefined,
    targetProfitAmount: row.target_profit_amount ?? undefined,
    targetFoodCostPercent: row.target_food_cost_percent ?? undefined,
    servingSize: row.serving_size ?? undefined,
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
    pricing_strategy: variant.pricingStrategy ?? null,
    fixed_price: variant.fixedPrice ?? null,
    target_profit_amount: variant.targetProfitAmount ?? null,
    target_food_cost_percent: variant.targetFoodCostPercent ?? null,
    serving_size: variant.servingSize ?? null,
    created_at: variant.createdAt,
    updated_at: variant.updatedAt,
  };
}

function rowToAddOn(row: AddOnRow): AddOn {
  return {
    id: row.id,
    name: row.name,
    additionalCost: row.additional_cost,
    additionalSellingPrice: row.additional_selling_price,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function addOnToRow(userId: string, addOn: AddOn): AddOnRow {
  return {
    id: addOn.id,
    user_id: userId,
    name: addOn.name,
    additional_cost: addOn.additionalCost,
    additional_selling_price: addOn.additionalSellingPrice,
    created_at: addOn.createdAt,
    updated_at: addOn.updatedAt,
  };
}

function rowToQuote(row: QuoteRow): Quote {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    variantId: row.variant_id ?? undefined,
    addOnIds: row.add_on_ids,
    multiplier: row.multiplier,
    customLabel: row.custom_label ?? undefined,
    customerName: row.customer_name ?? undefined,
    notes: row.notes ?? undefined,
    sellingPrice: row.selling_price,
    internalCost: row.internal_cost ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function quoteToRow(userId: string, quote: Quote): QuoteRow {
  return {
    id: quote.id,
    user_id: userId,
    recipe_id: quote.recipeId,
    variant_id: quote.variantId ?? null,
    add_on_ids: quote.addOnIds,
    multiplier: quote.multiplier,
    custom_label: quote.customLabel ?? null,
    customer_name: quote.customerName ?? null,
    notes: quote.notes ?? null,
    selling_price: quote.sellingPrice,
    internal_cost: quote.internalCost ?? null,
    created_at: quote.createdAt,
    updated_at: quote.updatedAt,
  };
}

function rowToBusinessSettings(row: BusinessSettingsRow): BusinessSettings {
  return {
    laborHourlyRate: row.labor_hourly_rate,
    electricityRatePerUnit: row.electricity_rate_per_unit,
    ovenPowerWatts: row.oven_power_watts,
    lpgCostPerHour: row.lpg_cost_per_hour,
    wastagePercent: row.wastage_percent,
    defaultMarkupPercent: row.default_markup_percent,
    currencyCode: row.currency_code,
    currencySymbol: row.currency_symbol,
    taxPercent: row.tax_percent,
    updatedAt: row.updated_at,
  };
}

function businessSettingsToRow(userId: string, settings: BusinessSettings): BusinessSettingsRow {
  return {
    user_id: userId,
    labor_hourly_rate: settings.laborHourlyRate,
    electricity_rate_per_unit: settings.electricityRatePerUnit,
    oven_power_watts: settings.ovenPowerWatts,
    lpg_cost_per_hour: settings.lpgCostPerHour,
    wastage_percent: settings.wastagePercent,
    default_markup_percent: settings.defaultMarkupPercent,
    currency_code: settings.currencyCode,
    currency_symbol: settings.currencySymbol,
    tax_percent: settings.taxPercent,
    updated_at: settings.updatedAt,
  };
}

export async function fetchAllData(userId: string): Promise<AppData> {
  const [
    ingredientsResult,
    recipesResult,
    priceListingVariantsResult,
    settingsResult,
    recipeVersionsResult,
    addOnsResult,
    quotesResult,
  ] = await Promise.all([
    supabase.from('ingredients').select('*').eq('user_id', userId),
    supabase.from('recipes').select('*').eq('user_id', userId),
    supabase.from('price_listing_variants').select('*').eq('user_id', userId),
    supabase.from('business_settings').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('recipe_versions').select('*').eq('user_id', userId),
    supabase.from('add_ons').select('*').eq('user_id', userId),
    supabase.from('quotes').select('*').eq('user_id', userId),
  ]);

  if (ingredientsResult.error) throw ingredientsResult.error;
  if (recipesResult.error) throw recipesResult.error;
  if (priceListingVariantsResult.error) throw priceListingVariantsResult.error;
  if (recipeVersionsResult.error) throw recipeVersionsResult.error;
  if (settingsResult.error) throw settingsResult.error;
  if (addOnsResult.error) throw addOnsResult.error;
  if (quotesResult.error) throw quotesResult.error;

  return {
    schemaVersion: 1,
    ingredients: (ingredientsResult.data as IngredientRow[]).map(rowToIngredient),
    recipes: (recipesResult.data as RecipeRow[]).map(rowToRecipe),
    priceListingVariants: (priceListingVariantsResult.data as PriceListingVariantRow[]).map(
      rowToPriceListingVariant,
    ),
    settings: settingsResult.data
      ? rowToBusinessSettings(settingsResult.data as BusinessSettingsRow)
      : DEFAULT_BUSINESS_SETTINGS,
    recipeVersions: (recipeVersionsResult.data as RecipeVersionRow[]).map(rowToRecipeVersion),
    addOns: (addOnsResult.data as AddOnRow[]).map(rowToAddOn),
    quotes: (quotesResult.data as QuoteRow[]).map(rowToQuote),
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

export async function upsertBusinessSettingsRow(
  userId: string,
  settings: BusinessSettings,
): Promise<void> {
  const { error } = await supabase
    .from('business_settings')
    .upsert(businessSettingsToRow(userId, settings), { onConflict: 'user_id' });
  if (error) throw error;
}

export async function insertRecipeVersionRow(userId: string, version: RecipeVersion): Promise<void> {
  const { error } = await supabase
    .from('recipe_versions')
    .insert(recipeVersionToRow(userId, version));
  if (error) throw error;
}

export async function insertAddOnRow(userId: string, addOn: AddOn): Promise<void> {
  const { error } = await supabase.from('add_ons').insert(addOnToRow(userId, addOn));
  if (error) throw error;
}

export async function updateAddOnRow(userId: string, addOn: AddOn): Promise<void> {
  const { error } = await supabase
    .from('add_ons')
    .update(addOnToRow(userId, addOn))
    .eq('id', addOn.id)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function deleteAddOnRow(userId: string, id: string): Promise<void> {
  const { error } = await supabase.from('add_ons').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
}

export async function insertQuoteRow(userId: string, quote: Quote): Promise<void> {
  const { error } = await supabase.from('quotes').insert(quoteToRow(userId, quote));
  if (error) throw error;
}

export async function deleteQuoteRow(userId: string, id: string): Promise<void> {
  const { error } = await supabase.from('quotes').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
}

export async function replaceAllRows(userId: string, data: AppData): Promise<void> {
  const [
    deleteIngredients,
    deleteRecipes,
    deletePriceListingVariants,
    deleteRecipeVersions,
    deleteAddOns,
    deleteQuotes,
  ] = await Promise.all([
    supabase.from('ingredients').delete().eq('user_id', userId),
    supabase.from('recipes').delete().eq('user_id', userId),
    supabase.from('price_listing_variants').delete().eq('user_id', userId),
    supabase.from('recipe_versions').delete().eq('user_id', userId),
    supabase.from('add_ons').delete().eq('user_id', userId),
    supabase.from('quotes').delete().eq('user_id', userId),
  ]);
  if (deleteIngredients.error) throw deleteIngredients.error;
  if (deleteRecipes.error) throw deleteRecipes.error;
  if (deletePriceListingVariants.error) throw deletePriceListingVariants.error;
  if (deleteRecipeVersions.error) throw deleteRecipeVersions.error;
  if (deleteAddOns.error) throw deleteAddOns.error;
  if (deleteQuotes.error) throw deleteQuotes.error;

  if (data.ingredients.length > 0) {
    const { error } = await supabase
      .from('ingredients')
      .insert(data.ingredients.map((i) => ingredientToRow(userId, i)));
    if (error) throw error;
  }
  if (data.recipes.length > 0) {
    const rows = data.recipes.map((r) => recipeToRow(userId, r));
    // Insert with parent_recipe_id nulled out first, then set it in a second pass --
    // a single multi-row insert can't safely rely on parents being pre-inserted before
    // their children when parent_recipe_id self-references this same table/statement.
    const { error: insertError } = await supabase
      .from('recipes')
      .insert(rows.map((r) => ({ ...r, parent_recipe_id: null })));
    if (insertError) throw insertError;

    for (const row of rows) {
      if (!row.parent_recipe_id) continue;
      const { error } = await supabase
        .from('recipes')
        .update({ parent_recipe_id: row.parent_recipe_id })
        .eq('id', row.id)
        .eq('user_id', userId);
      if (error) throw error;
    }
  }
  if (data.priceListingVariants.length > 0) {
    const { error } = await supabase
      .from('price_listing_variants')
      .insert(data.priceListingVariants.map((v) => priceListingVariantToRow(userId, v)));
    if (error) throw error;
  }
  if (data.recipeVersions.length > 0) {
    const { error } = await supabase
      .from('recipe_versions')
      .insert(data.recipeVersions.map((v) => recipeVersionToRow(userId, v)));
    if (error) throw error;
  }
  if (data.addOns.length > 0) {
    const { error } = await supabase
      .from('add_ons')
      .insert(data.addOns.map((a) => addOnToRow(userId, a)));
    if (error) throw error;
  }
  // Quotes may reference a menu item, so they're inserted last.
  if (data.quotes.length > 0) {
    const { error } = await supabase
      .from('quotes')
      .insert(data.quotes.map((q) => quoteToRow(userId, q)));
    if (error) throw error;
  }
  await upsertBusinessSettingsRow(userId, data.settings);
}
