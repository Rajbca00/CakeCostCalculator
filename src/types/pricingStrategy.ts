/** How a menu item's customer-facing selling price is derived from its recipe cost. */
export const PRICING_STRATEGIES = ['markup', 'fixed', 'targetProfit', 'foodCostPercent'] as const;

export type PricingStrategy = (typeof PRICING_STRATEGIES)[number];

export const PRICING_STRATEGY_LABELS: Record<PricingStrategy, string> = {
  markup: "Markup % (recipe's own Profit %)",
  fixed: 'Fixed price',
  targetProfit: 'Target profit amount',
  foodCostPercent: 'Target food cost %',
};
