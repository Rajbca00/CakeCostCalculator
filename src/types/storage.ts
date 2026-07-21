import type { Ingredient } from './ingredient';
import type { Recipe } from './recipe';
import type { RecipeVersion } from './recipeVersion';
import type { PriceListingVariant } from './priceListing';
import type { BusinessSettings } from './settings';
import { DEFAULT_BUSINESS_SETTINGS } from './settings';
import type { AddOn } from './addOn';
import type { Quote } from './quote';

export interface AppDataV1 {
  schemaVersion: 1;
  ingredients: Ingredient[];
  recipes: Recipe[];
  recipeVersions: RecipeVersion[];
  priceListingVariants: PriceListingVariant[];
  settings: BusinessSettings;
  addOns: AddOn[];
  quotes: Quote[];
}

export type AppData = AppDataV1;

export const CURRENT_SCHEMA_VERSION = 1 as const;

export function createEmptyAppData(): AppData {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    ingredients: [],
    recipes: [],
    recipeVersions: [],
    priceListingVariants: [],
    settings: DEFAULT_BUSINESS_SETTINGS,
    addOns: [],
    quotes: [],
  };
}
