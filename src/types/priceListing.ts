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
  createdAt: string;
  updatedAt: string;
}
