import type { Ingredient } from './ingredient';
import type { Recipe } from './recipe';
import type { PriceListingVariant } from './priceListing';

export interface AppDataV1 {
  schemaVersion: 1;
  ingredients: Ingredient[];
  recipes: Recipe[];
  priceListingVariants: PriceListingVariant[];
}

export type AppData = AppDataV1;

export const CURRENT_SCHEMA_VERSION = 1 as const;

export function createEmptyAppData(): AppData {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    ingredients: [],
    recipes: [],
    priceListingVariants: [],
  };
}
