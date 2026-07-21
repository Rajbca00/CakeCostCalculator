import type { ExtraCost, RecipeIngredientLine } from './recipe';
import type { RecipeCategory } from './recipeCategory';
import type { RecipeStatus } from './recipeStatus';

/**
 * Immutable checkpoint of a recipe's own fields at the moment "Save new version"
 * was clicked. The live `recipes` row is always the current version being edited;
 * this is read-only history, not a separately-editable/costable record. It does not
 * snapshot the parent recipe's state, so historical cost figures for a child recipe
 * with a parent are not retroactively reconstructable from a past version alone.
 */
export interface RecipeVersion {
  id: string;
  recipeId: string;
  versionNumber: number;
  status: RecipeStatus;
  name: string;
  baseYieldQuantity: number;
  baseYieldLabel: string;
  profitPercent: number;
  ingredientLines: RecipeIngredientLine[];
  extraCosts: ExtraCost[];
  notes?: string;
  category?: RecipeCategory;
  parentRecipeId?: string;
  activeTimeMinutes?: number;
  bakeTimeMinutes?: number;
  ovenPowerWatts?: number;
  wastagePercentOverride?: number;
  createdAt: string;
}
