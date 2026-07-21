import { round2, type RecipeCostResult } from './costCalculations';
import type { PricingStrategy } from '../types';

/**
 * Resolves a menu item's customer-facing selling price from its chosen pricing strategy.
 * `pricingStrategy` undefined (or 'markup') keeps the pre-Phase-3 behavior of using the
 * recipe's own Profit %-based `sellingTotal` -- existing menu items are unaffected.
 */
export function resolveVariantPrice(
  costResult: RecipeCostResult,
  pricingStrategy: PricingStrategy | undefined,
  fixedPrice: number | undefined,
  targetProfitAmount: number | undefined,
  targetFoodCostPercent: number | undefined,
): number {
  switch (pricingStrategy) {
    case 'fixed':
      return Number.isFinite(fixedPrice) && (fixedPrice ?? 0) >= 0
        ? (fixedPrice as number)
        : costResult.sellingTotal;
    case 'targetProfit':
      return round2(costResult.total + Math.max(0, targetProfitAmount ?? 0));
    case 'foodCostPercent':
      return targetFoodCostPercent && targetFoodCostPercent > 0
        ? round2(costResult.ingredientsTotal / (targetFoodCostPercent / 100))
        : costResult.sellingTotal;
    case 'markup':
    default:
      return costResult.sellingTotal;
  }
}
