import { z } from 'zod';
import type { AppData } from '../types';

const UnitSchema = z.enum(['g', 'kg', 'oz', 'lb', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'piece']);

const IngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  purchaseCost: z.number(),
  purchaseQuantity: z.number(),
  purchaseUnit: UnitSchema,
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const RecipeIngredientLineSchema = z.object({
  id: z.string(),
  ingredientId: z.string(),
  quantity: z.number(),
  unit: UnitSchema,
});

const ExtraCostSchema = z.object({
  id: z.string(),
  label: z.string(),
  amount: z.number(),
  scalesWithYield: z.boolean(),
});

const RecipeSchema = z.object({
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

export interface ImportValidationResult {
  success: boolean;
  data?: AppData;
  error?: string;
}

export function parseImportedAppData(json: string): ImportValidationResult {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { success: false, error: 'The file is not valid JSON.' };
  }

  const result = AppDataImportSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: 'The file does not match the expected backup format.' };
  }

  return { success: true, data: result.data };
}

export function exportAppData(data: AppData): void {
  const payload = {
    ...data,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cake-cost-calculator-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
