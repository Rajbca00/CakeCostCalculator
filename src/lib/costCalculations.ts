import { getUnitCategory, toBaseUnit } from './units';
import { normalizeGroupName } from './recipeGroups';
import { bucketForCategory, resolveExtraCostCategory, resolveIngredientLineCategory } from './costCategory';
import {
  COST_BUCKETS,
  COST_CATEGORIES,
  type BusinessSettings,
  type CostBucket,
  type CostCategory,
  type Ingredient,
  type Recipe,
  type RecipeIngredientLine,
} from '../types';

export function round2(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function costPerBaseUnit(ingredient: Ingredient): number {
  const qtyInBase = toBaseUnit(ingredient.purchaseQuantity, ingredient.purchaseUnit);
  if (!Number.isFinite(qtyInBase) || qtyInBase <= 0) return 0;
  return ingredient.purchaseCost / qtyInBase;
}

export function lineCost(
  line: RecipeIngredientLine,
  ingredient: Ingredient | undefined,
): number {
  if (!ingredient) return 0;
  if (getUnitCategory(line.unit) !== getUnitCategory(ingredient.purchaseUnit)) return 0;
  return toBaseUnit(line.quantity, line.unit) * costPerBaseUnit(ingredient);
}

export interface RecipeCostLineResult {
  lineId: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  cost: number;
  missingIngredient: boolean;
  groupName: string;
  category: CostCategory;
}

export interface RecipeCostExtraResult {
  id: string;
  label: string;
  amount: number;
  groupName: string;
  category: CostCategory;
}

export interface RecipeCostResult {
  lines: RecipeCostLineResult[];
  extraCosts: RecipeCostExtraResult[];
  ingredientsTotal: number;
  extrasTotal: number;
  total: number;
  yieldQuantity: number;
  hasMissingIngredients: boolean;
  /** Markup % applied on top of cost, e.g. 30 means sell at cost * 1.30. */
  profitPercent: number;
  sellingTotal: number;
  /** sellingTotal - total, i.e. the exact currency amount of profit. */
  profitAmount: number;
  /** Discount % taken off the selling price, e.g. 10 means 10% off. */
  discountPercent: number;
  /** sellingTotal - finalPrice, i.e. the exact currency amount discounted. */
  discountAmount: number;
  /** Selling price after the discount is applied. */
  finalPrice: number;

  // --- Cost-breakdown dashboard fields (additive; never affect the pricing fields above) ---
  /** Sum of all ingredient-line/extra-cost amounts per fixed cost category. */
  categoryTotals: Record<CostCategory, number>;
  /** categoryTotals rolled up into the four dashboard buckets. */
  bucketTotals: Record<CostBucket, number>;
  /** Wastage % actually applied (recipe override, else global settings, else 0). */
  wastagePercent: number;
  /** ingredientsTotal * wastagePercent / 100. */
  wastageAmount: number;
  /** recipe.activeTimeMinutes (scaled by multiplier) * settings.laborHourlyRate / 60. */
  laborAmount: number;
  /** (recipe.ovenPowerWatts or settings default) / 1000 * settings.electricityRatePerUnit * recipe.bakeTimeMinutes / 60. */
  electricityAmount: number;
  /** total + wastageAmount + laborAmount + electricityAmount -- the fully-loaded cost. Not used for pricing (yet). */
  actualCost: number;
}

export function calculateRecipeCost(
  recipe: Recipe,
  ingredientsById: Map<string, Ingredient>,
  multiplier: number = 1,
  activeGroups?: Set<string>,
  discountPercent: number = 0,
  settings?: BusinessSettings,
): RecipeCostResult {
  const lines: RecipeCostLineResult[] = recipe.ingredientLines
    .filter((line) => !activeGroups || activeGroups.has(normalizeGroupName(line.groupName)))
    .map((line) => {
      const ingredient = ingredientsById.get(line.ingredientId);
      const scaledQty = line.quantity * multiplier;
      const categoryMismatch =
        !!ingredient && getUnitCategory(line.unit) !== getUnitCategory(ingredient.purchaseUnit);
      const cost =
        ingredient && !categoryMismatch
          ? toBaseUnit(scaledQty, line.unit) * costPerBaseUnit(ingredient)
          : 0;
      return {
        lineId: line.id,
        ingredientId: line.ingredientId,
        ingredientName: ingredient?.name ?? '(deleted ingredient)',
        quantity: scaledQty,
        unit: line.unit,
        cost,
        missingIngredient: !ingredient || categoryMismatch,
        groupName: normalizeGroupName(line.groupName),
        category: resolveIngredientLineCategory(line),
      };
    });

  const extraCosts: RecipeCostExtraResult[] = recipe.extraCosts
    .filter((e) => !activeGroups || activeGroups.has(normalizeGroupName(e.groupName)))
    .map((e) => ({
      id: e.id,
      label: e.label,
      amount: e.scalesWithYield ? e.amount * multiplier : e.amount,
      groupName: normalizeGroupName(e.groupName),
      category: resolveExtraCostCategory(e),
    }));

  // Round subtotals to the cent before combining them, and derive every
  // downstream figure (total, selling price, profit) from those rounded
  // values. This guarantees the displayed figures actually add up for a
  // user checking with a calculator — e.g. ingredientsTotal + extrasTotal
  // always equals total exactly, and total + profitAmount always equals
  // sellingTotal exactly, instead of drifting a cent apart because each
  // was rounded independently from full floating-point precision.
  const ingredientsTotal = round2(lines.reduce((sum, l) => sum + l.cost, 0));
  const extrasTotal = round2(extraCosts.reduce((sum, e) => sum + e.amount, 0));
  const total = round2(ingredientsTotal + extrasTotal);
  const yieldQuantity = recipe.baseYieldQuantity * multiplier;

  const profitPercent = recipe.profitPercent || 0;
  const sellingTotal = round2(total * (1 + profitPercent / 100));

  const safeDiscountPercent = Math.min(100, Math.max(0, discountPercent || 0));
  const finalPrice = round2(sellingTotal * (1 - safeDiscountPercent / 100));

  const categoryTotals = Object.fromEntries(
    COST_CATEGORIES.map((category) => [
      category,
      round2(
        lines.filter((l) => l.category === category).reduce((sum, l) => sum + l.cost, 0) +
          extraCosts.filter((e) => e.category === category).reduce((sum, e) => sum + e.amount, 0),
      ),
    ]),
  ) as Record<CostCategory, number>;

  const wastagePercent = Math.max(
    0,
    recipe.wastagePercentOverride ?? settings?.wastagePercent ?? 0,
  );
  const wastageAmount = round2(ingredientsTotal * (wastagePercent / 100));

  const laborMinutes = (recipe.activeTimeMinutes ?? 0) * multiplier;
  const laborAmount = settings ? round2(laborMinutes * (settings.laborHourlyRate / 60)) : 0;

  const ovenPowerWatts = recipe.ovenPowerWatts ?? settings?.ovenPowerWatts ?? 0;
  const bakeTimeMinutes = recipe.bakeTimeMinutes ?? 0;
  const electricityAmount = settings
    ? round2((ovenPowerWatts / 1000) * settings.electricityRatePerUnit * (bakeTimeMinutes / 60))
    : 0;

  // Bucket totals fold in the automatic labour/electricity amounts (on top of any
  // manually-tagged Labour/Overheads lines) so the breakdown adds up to actualCost below.
  const bucketTotals = Object.fromEntries(
    COST_BUCKETS.map((bucket) => {
      const fromCategories = round2(
        COST_CATEGORIES.filter((category) => bucketForCategory(category) === bucket).reduce(
          (sum, category) => sum + categoryTotals[category],
          0,
        ),
      );
      const automatic = bucket === 'labour' ? laborAmount : bucket === 'overheads' ? electricityAmount : 0;
      return [bucket, round2(fromCategories + automatic)];
    }),
  ) as Record<CostBucket, number>;

  const actualCost = round2(total + wastageAmount + laborAmount + electricityAmount);

  return {
    lines,
    extraCosts,
    ingredientsTotal,
    extrasTotal,
    total,
    yieldQuantity,
    hasMissingIngredients: lines.some((l) => l.missingIngredient),
    profitPercent,
    sellingTotal,
    profitAmount: round2(sellingTotal - total),
    discountPercent: safeDiscountPercent,
    discountAmount: round2(sellingTotal - finalPrice),
    finalPrice,
    categoryTotals,
    bucketTotals,
    wastagePercent,
    wastageAmount,
    laborAmount,
    electricityAmount,
    actualCost,
  };
}

/** Ingredient cost as a % of the selling price -- a standard restaurant/bakery costing metric. */
export function foodCostPercent(result: RecipeCostResult): number {
  if (result.sellingTotal <= 0) return 0;
  return round2((result.ingredientsTotal / result.sellingTotal) * 100);
}
