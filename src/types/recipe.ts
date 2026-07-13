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
  /** Number of servings the base yield produces, e.g. "0.5 kg = 6 servings". Optional — enables scaling/costing by servings in addition to yield quantity. */
  baseServings?: number;
  /** Markup percentage applied on top of cost to get selling price: sellingPrice = cost * (1 + profitPercent / 100). */
  profitPercent: number;
  ingredientLines: RecipeIngredientLine[];
  extraCosts: ExtraCost[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
