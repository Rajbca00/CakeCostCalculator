import type { Unit } from './unit';
import type { CostCategory } from './costCategory';
import type { RecipeCategory } from './recipeCategory';

export interface RecipeIngredientLine {
  id: string;
  ingredientId: string;
  quantity: number;
  unit: Unit;
  /**
   * Optional named group, e.g. "Base cake", "Icing 1". Blank/undefined = ungrouped.
   * Drives which optional components exist for Price Listing variant combinations
   * and the grouped Calculate-tab view -- kept independent from `category` below.
   */
  groupName?: string;
  /**
   * Fixed cost-accounting category (Batter/Frosting/Filling/Decoration/Packaging/
   * Overheads/Labour) used to roll costs up for the cost-breakdown dashboard.
   * When unset, it's derived from `groupName` on the fly -- see lib/costCategory.ts.
   */
  category?: CostCategory;
}

export interface ExtraCost {
  id: string;
  label: string;
  amount: number;
  scalesWithYield: boolean;
  /** Optional named group, e.g. "Decorations & toppings". Blank/undefined = ungrouped. */
  groupName?: string;
  /** See RecipeIngredientLine.category. */
  category?: CostCategory;
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
  /** Product category for the Recipe Book / dashboard, e.g. "Cakes", "Frostings". */
  category?: RecipeCategory;
  /** Minutes of active hands-on labour; labour cost = this × (settings.laborHourlyRate / 60). */
  activeTimeMinutes?: number;
  /** Minutes in the oven; electricity cost = ovenPowerWatts × settings.electricityRatePerUnit × (this / 60). */
  bakeTimeMinutes?: number;
  /** Overrides the global default oven power (watts) for this recipe's electricity cost. */
  ovenPowerWatts?: number;
  /** Overrides the global default wastage % for this recipe. */
  wastagePercentOverride?: number;
  createdAt: string;
  updatedAt: string;
}
