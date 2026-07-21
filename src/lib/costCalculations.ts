import { getUnitCategory, toBaseUnit } from './units';
import { normalizeGroupName } from './recipeGroups';
import { resolveExtraCostBucket, resolveIngredientLineBucket } from './groupBucket';
import {
  COST_BUCKETS,
  type BusinessSettings,
  type CostBucket,
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
  bucket: CostBucket;
}

export interface RecipeCostExtraResult {
  id: string;
  label: string;
  amount: number;
  groupName: string;
  bucket: CostBucket;
}

export interface RecipeCostResult {
  lines: RecipeCostLineResult[];
  extraCosts: RecipeCostExtraResult[];
  ingredientsTotal: number;
  extrasTotal: number;
  /**
   * ingredientsTotal + extrasTotal + wastageAmount + laborAmount + electricityAmount --
   * the fully-loaded cost. Every selling-price figure below (sellingTotal, finalPrice, and
   * pricing-strategy calculations) is derived from this, so automatic wastage/labour/
   * electricity costs are priced in, not just shown for reference.
   */
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

  // --- Cost-breakdown dashboard fields ---
  /** Sum of all ingredient-line/extra-cost amounts per dashboard bucket, per each group's Recipe.groupBuckets assignment. */
  bucketTotals: Record<CostBucket, number>;
  /** Wastage % actually applied (recipe override, else global settings, else 0). Folded into `total`. */
  wastagePercent: number;
  /** ingredientsTotal * wastagePercent / 100. Folded into `total`. */
  wastageAmount: number;
  /** recipe.activeTimeMinutes (scaled by multiplier) * settings.laborHourlyRate / 60. Folded into `total`. */
  laborAmount: number;
  /** (recipe.ovenPowerWatts or settings default) / 1000 * settings.electricityRatePerUnit * recipe.bakeTimeMinutes / 60. Folded into `total`. */
  electricityAmount: number;
  /** Equal to `total` -- kept for existing dashboard/quote consumers of the fully-loaded cost. */
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
        bucket: resolveIngredientLineBucket(line, recipe),
      };
    });

  const extraCosts: RecipeCostExtraResult[] = recipe.extraCosts
    .filter((e) => !activeGroups || activeGroups.has(normalizeGroupName(e.groupName)))
    .map((e) => ({
      id: e.id,
      label: e.label,
      amount: e.scalesWithYield ? e.amount * multiplier : e.amount,
      groupName: normalizeGroupName(e.groupName),
      bucket: resolveExtraCostBucket(e, recipe),
    }));

  // Round subtotals to the cent before combining them, and derive every
  // downstream figure (total, selling price, profit) from those rounded
  // values. This guarantees the displayed figures actually add up for a
  // user checking with a calculator — e.g. ingredientsTotal + extrasTotal
  // + wastageAmount + laborAmount + electricityAmount always equals total
  // exactly, and total + profitAmount always equals sellingTotal exactly,
  // instead of drifting a cent apart because each was rounded independently
  // from full floating-point precision.
  const ingredientsTotal = round2(lines.reduce((sum, l) => sum + l.cost, 0));
  const extrasTotal = round2(extraCosts.reduce((sum, e) => sum + e.amount, 0));

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

  // total is the fully-loaded cost -- materials plus the automatic wastage/labour/
  // electricity costs -- so it's the actual basis selling price is calculated from,
  // not just a reference number shown alongside it.
  const total = round2(
    ingredientsTotal + extrasTotal + wastageAmount + laborAmount + electricityAmount,
  );
  const yieldQuantity = recipe.baseYieldQuantity * multiplier;

  const profitPercent = recipe.profitPercent || 0;
  const sellingTotal = round2(total * (1 + profitPercent / 100));

  const safeDiscountPercent = Math.min(100, Math.max(0, discountPercent || 0));
  const finalPrice = round2(sellingTotal * (1 - safeDiscountPercent / 100));

  // Bucket totals fold in the automatic labour/electricity amounts (on top of any
  // lines/extra costs whose group resolves to Labour/Overheads) so the breakdown
  // adds up to total above.
  const bucketTotals = Object.fromEntries(
    COST_BUCKETS.map((bucket) => {
      const fromLines = lines
        .filter((l) => l.bucket === bucket)
        .reduce((sum, l) => sum + l.cost, 0);
      const fromExtras = extraCosts
        .filter((e) => e.bucket === bucket)
        .reduce((sum, e) => sum + e.amount, 0);
      const automatic = bucket === 'labour' ? laborAmount : bucket === 'overheads' ? electricityAmount : 0;
      return [bucket, round2(fromLines + fromExtras + automatic)];
    }),
  ) as Record<CostBucket, number>;

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
    bucketTotals,
    wastagePercent,
    wastageAmount,
    laborAmount,
    electricityAmount,
    actualCost: total,
  };
}

/** Ingredient cost as a % of the selling price -- a standard restaurant/bakery costing metric. */
export function foodCostPercent(result: RecipeCostResult): number {
  if (result.sellingTotal <= 0) return 0;
  return round2((result.ingredientsTotal / result.sellingTotal) * 100);
}
