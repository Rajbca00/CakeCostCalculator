import { getUnitCategory, toBaseUnit } from './units';
import { normalizeGroupName } from './recipeGroups';
import type { Ingredient, Recipe, RecipeIngredientLine } from '../types';

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
}

export interface RecipeCostExtraResult {
  id: string;
  label: string;
  amount: number;
  groupName: string;
}

export interface RecipeCostResult {
  lines: RecipeCostLineResult[];
  extraCosts: RecipeCostExtraResult[];
  ingredientsTotal: number;
  extrasTotal: number;
  total: number;
  yieldQuantity: number;
  costPerYieldUnit: number;
  hasMissingIngredients: boolean;
  /** Markup % applied on top of cost, e.g. 30 means sell at cost * 1.30. */
  profitPercent: number;
  sellingTotal: number;
  sellingPricePerYieldUnit: number;
  /** sellingTotal - total, i.e. the exact currency amount of profit. */
  profitAmount: number;
}

export function calculateRecipeCost(
  recipe: Recipe,
  ingredientsById: Map<string, Ingredient>,
  multiplier: number = 1,
  activeGroups?: Set<string>,
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
      };
    });

  const extraCosts: RecipeCostExtraResult[] = recipe.extraCosts
    .filter((e) => !activeGroups || activeGroups.has(normalizeGroupName(e.groupName)))
    .map((e) => ({
      id: e.id,
      label: e.label,
      amount: e.scalesWithYield ? e.amount * multiplier : e.amount,
      groupName: normalizeGroupName(e.groupName),
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

  return {
    lines,
    extraCosts,
    ingredientsTotal,
    extrasTotal,
    total,
    yieldQuantity,
    costPerYieldUnit: yieldQuantity > 0 ? total / yieldQuantity : 0,
    hasMissingIngredients: lines.some((l) => l.missingIngredient),
    profitPercent,
    sellingTotal,
    sellingPricePerYieldUnit: yieldQuantity > 0 ? sellingTotal / yieldQuantity : 0,
    profitAmount: round2(sellingTotal - total),
  };
}
