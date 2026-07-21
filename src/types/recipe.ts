import type { Unit } from './unit';
import type { CostBucket, CostCategory } from './costCategory';
import type { RecipeCategory } from './recipeCategory';
import type { RecipeStatus } from './recipeStatus';

export interface RecipeIngredientLine {
  id: string;
  ingredientId: string;
  quantity: number;
  unit: Unit;
  /**
   * Optional named group, e.g. "Base cake", "Icing 1". Blank/undefined = ungrouped.
   * Drives which optional components exist for Price Listing variant combinations,
   * the grouped Calculate-tab view, and (via Recipe.groupBuckets) the cost-breakdown
   * dashboard -- one group name now serves all three.
   */
  groupName?: string;
  /**
   * Legacy per-line cost category from before groups could carry a bucket assignment
   * directly. Kept only so recipes saved before that change keep costing exactly the
   * same; the UI no longer sets this -- see Recipe.groupBuckets and lib/groupBucket.ts.
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
  /**
   * Which cost-breakdown bucket (Ingredients/Packaging/Overheads/Labour) each group name
   * rolls into, e.g. { "Ganache Topping": "ingredients" }. Set once per group name (not per
   * line) via the recipe editor's "Groups & cost buckets" panel. A group without an entry
   * here falls back to a keyword guess from its name -- see lib/groupBucket.ts.
   */
  groupBuckets?: Record<string, CostBucket>;
  /**
   * Recipe this one inherits ingredients/extra costs from. The child stores only its own
   * additional lines; effective cost = parent's effective lines + this recipe's own lines,
   * recomputed live so editing the parent automatically updates every child. See
   * lib/recipeHierarchy.ts. Must not form a cycle (enforced in the UI).
   */
  parentRecipeId?: string;
  /** Lifecycle status of the current (live) version. See also RecipeVersion for history. */
  status?: RecipeStatus;
  createdAt: string;
  updatedAt: string;
}
