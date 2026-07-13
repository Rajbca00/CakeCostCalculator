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
});

export const ExtraCostSchema = z.object({
  id: z.string(),
  label: z.string(),
  amount: z.number(),
  scalesWithYield: z.boolean(),
});

export const RecipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  baseYieldQuantity: z.number(),
  baseYieldLabel: z.string(),
  ingredientLines: z.array(RecipeIngredientLineSchema),
  extraCosts: z.array(ExtraCostSchema),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const AppDataImportSchema = z.object({
  schemaVersion: z.literal(1),
  ingredients: z.array(IngredientSchema),
  recipes: z.array(RecipeSchema),
});
