import type { PricingStrategy } from './pricingStrategy';

/** A specific priced item on the menu: a recipe scaled and limited to a chosen combination of its groups. */
export interface PriceListingVariant {
  id: string;
  recipeId: string;
  /** Display name shown on the menu, e.g. "Chocolate Cake — Base + Ganache". */
  name: string;
  /** Normalized group names (see recipeGroups.ts) from the recipe included in this variant. Always non-empty. */
  groupNames: string[];
  /** Scale factor applied to the recipe's base yield. */
  multiplier: number;
  /**
   * How the selling price shown on the menu is derived. Undefined behaves exactly like the
   * pre-Phase-3 default ('markup' -- the recipe's own Profit %), so existing menu items keep
   * showing the same price until the owner explicitly picks a different strategy.
   */
  pricingStrategy?: PricingStrategy;
  /** Used when pricingStrategy is 'fixed': the exact selling price, independent of cost. */
  fixedPrice?: number;
  /** Used when pricingStrategy is 'targetProfit': desired profit amount added on top of cost. */
  targetProfitAmount?: number;
  /** Used when pricingStrategy is 'foodCostPercent': desired ingredient cost as a % of the selling price. */
  targetFoodCostPercent?: number;
  /** Optional descriptor shown on the menu, e.g. "Serves 8-10" -- distinct from `name`. */
  servingSize?: string;
  createdAt: string;
  updatedAt: string;
}
