import type { Unit } from './unit';

export interface RecipeIngredientLine {
  id: string;
  ingredientId: string;
  quantity: number;
  unit: Unit;
  /** Optional named group, e.g. "Base cake", "Icing 1". Blank/undefined = ungrouped. */
  groupName?: string;
}

export interface ExtraCost {
  id: string;
  label: string;
  amount: number;
  scalesWithYield: boolean;
  /** Optional named group, e.g. "Decorations & toppings". Blank/undefined = ungrouped. */
  groupName?: string;
}

export interface Recipe {
  id: string;
  name: string;
  baseYieldQuantity: number;
  baseYieldLabel: string;
  /** Markup percentage applied on top of cost to get selling price: sellingPrice = cost * (1 + profitPercent / 100). */
  profitPercent: number;
  ingredientLines: RecipeIngredientLine[];
  extraCosts: ExtraCost[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
