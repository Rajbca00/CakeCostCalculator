import { z } from 'zod';
import { COST_BUCKETS, COST_CATEGORIES } from '../types/costCategory';
import { RECIPE_CATEGORIES } from '../types/recipeCategory';
import { RECIPE_STATUSES } from '../types/recipeStatus';
import { PRICING_STRATEGIES } from '../types/pricingStrategy';
import { DEFAULT_BUSINESS_SETTINGS } from '../types/settings';

export const UnitSchema = z.enum(['g', 'kg', 'oz', 'lb', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'piece']);

export const CostCategorySchema = z.enum(COST_CATEGORIES);
export const CostBucketSchema = z.enum(COST_BUCKETS);
export const RecipeCategorySchema = z.enum(RECIPE_CATEGORIES);
export const RecipeStatusSchema = z.enum(RECIPE_STATUSES);
export const PricingStrategySchema = z.enum(PRICING_STRATEGIES);

export const IngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  purchaseCost: z.number(),
  purchaseQuantity: z.number(),
  purchaseUnit: UnitSchema,
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const RecipeIngredientLineSchema = z.object({
  id: z.string(),
  ingredientId: z.string(),
  quantity: z.number(),
  unit: UnitSchema,
  groupName: z.string().optional(),
  category: CostCategorySchema.optional(),
});

export const ExtraCostSchema = z.object({
  id: z.string(),
  label: z.string(),
  amount: z.number(),
  scalesWithYield: z.boolean(),
  groupName: z.string().optional(),
  category: CostCategorySchema.optional(),
});

export const RecipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  baseYieldQuantity: z.number(),
  baseYieldLabel: z.string(),
  profitPercent: z.number().default(0),
  ingredientLines: z.array(RecipeIngredientLineSchema),
  extraCosts: z.array(ExtraCostSchema),
  notes: z.string().optional(),
  category: RecipeCategorySchema.optional(),
  activeTimeMinutes: z.number().optional(),
  bakeTimeMinutes: z.number().optional(),
  ovenPowerWatts: z.number().optional(),
  wastagePercentOverride: z.number().optional(),
  parentRecipeId: z.string().optional(),
  status: RecipeStatusSchema.optional(),
  groupBuckets: z.record(z.string(), CostBucketSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const RecipeVersionSchema = z.object({
  id: z.string(),
  recipeId: z.string(),
  versionNumber: z.number(),
  status: RecipeStatusSchema,
  name: z.string(),
  baseYieldQuantity: z.number(),
  baseYieldLabel: z.string(),
  profitPercent: z.number().default(0),
  ingredientLines: z.array(RecipeIngredientLineSchema),
  extraCosts: z.array(ExtraCostSchema),
  notes: z.string().optional(),
  category: RecipeCategorySchema.optional(),
  parentRecipeId: z.string().optional(),
  activeTimeMinutes: z.number().optional(),
  bakeTimeMinutes: z.number().optional(),
  ovenPowerWatts: z.number().optional(),
  wastagePercentOverride: z.number().optional(),
  groupBuckets: z.record(z.string(), CostBucketSchema).optional(),
  createdAt: z.string(),
});

export const PriceListingVariantSchema = z.object({
  id: z.string(),
  recipeId: z.string(),
  name: z.string(),
  groupNames: z.array(z.string()),
  multiplier: z.number(),
  pricingStrategy: PricingStrategySchema.optional(),
  fixedPrice: z.number().optional(),
  targetProfitAmount: z.number().optional(),
  targetFoodCostPercent: z.number().optional(),
  servingSize: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const BusinessSettingsSchema = z.object({
  laborHourlyRate: z.number(),
  electricityRatePerUnit: z.number(),
  ovenPowerWatts: z.number(),
  lpgCostPerHour: z.number(),
  wastagePercent: z.number(),
  defaultMarkupPercent: z.number(),
  currencyCode: z.string(),
  currencySymbol: z.string(),
  taxPercent: z.number(),
  updatedAt: z.string(),
});

export const AddOnSchema = z.object({
  id: z.string(),
  name: z.string(),
  additionalCost: z.number(),
  additionalSellingPrice: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const QuoteSchema = z.object({
  id: z.string(),
  recipeId: z.string(),
  variantId: z.string().optional(),
  addOnIds: z.array(z.string()),
  multiplier: z.number(),
  customLabel: z.string().optional(),
  customerName: z.string().optional(),
  notes: z.string().optional(),
  sellingPrice: z.number(),
  internalCost: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const AppDataImportSchema = z.object({
  schemaVersion: z.literal(1),
  ingredients: z.array(IngredientSchema),
  recipes: z.array(RecipeSchema),
  priceListingVariants: z.array(PriceListingVariantSchema).default([]),
  settings: BusinessSettingsSchema.default(DEFAULT_BUSINESS_SETTINGS),
  recipeVersions: z.array(RecipeVersionSchema).default([]),
  addOns: z.array(AddOnSchema).default([]),
  quotes: z.array(QuoteSchema).default([]),
});
