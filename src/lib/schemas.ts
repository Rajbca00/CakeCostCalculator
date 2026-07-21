import { z } from 'zod';
import { COST_CATEGORIES } from '../types/costCategory';
import { RECIPE_CATEGORIES } from '../types/recipeCategory';
import { DEFAULT_BUSINESS_SETTINGS } from '../types/settings';

export const UnitSchema = z.enum(['g', 'kg', 'oz', 'lb', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'piece']);

export const CostCategorySchema = z.enum(COST_CATEGORIES);
export const RecipeCategorySchema = z.enum(RECIPE_CATEGORIES);

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
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const PriceListingVariantSchema = z.object({
  id: z.string(),
  recipeId: z.string(),
  name: z.string(),
  groupNames: z.array(z.string()),
  multiplier: z.number(),
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

export const PackagingTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  cost: z.number(),
  description: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const AppDataImportSchema = z.object({
  schemaVersion: z.literal(1),
  ingredients: z.array(IngredientSchema),
  recipes: z.array(RecipeSchema),
  priceListingVariants: z.array(PriceListingVariantSchema).default([]),
  settings: BusinessSettingsSchema.default(DEFAULT_BUSINESS_SETTINGS),
  packagingTemplates: z.array(PackagingTemplateSchema).default([]),
});
