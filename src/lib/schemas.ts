import { z } from 'zod';

export const UnitSchema = z.enum(['g', 'kg', 'oz', 'lb', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'piece']);

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
});

export const ExtraCostSchema = z.object({
  id: z.string(),
  label: z.string(),
  amount: z.number(),
  scalesWithYield: z.boolean(),
  groupName: z.string().optional(),
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

export const AppDataImportSchema = z.object({
  schemaVersion: z.literal(1),
  ingredients: z.array(IngredientSchema),
  recipes: z.array(RecipeSchema),
  priceListingVariants: z.array(PriceListingVariantSchema).default([]),
});
