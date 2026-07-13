import type { Unit } from './unit';

export interface RecipeIngredientLine {
  id: string;
  ingredientId: string;
  quantity: number;
  unit: Unit;
}

export interface ExtraCost {
  id: string;
  label: string;
  amount: number;
  scalesWithYield: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  baseYieldQuantity: number;
  baseYieldLabel: string;
  ingredientLines: RecipeIngredientLine[];
  extraCosts: ExtraCost[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
