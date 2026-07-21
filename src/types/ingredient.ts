import type { Unit } from './unit';

export interface Ingredient {
  id: string;
  name: string;
  purchaseCost: number;
  purchaseQuantity: number;
  purchaseUnit: Unit;
  notes?: string;
  /** Whether this ingredient itself contains egg -- drives the Egg/Eggless flag on any recipe using it. */
  containsEgg?: boolean;
  createdAt: string;
  updatedAt: string;
}
