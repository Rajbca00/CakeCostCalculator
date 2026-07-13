import type { Unit } from './unit';

export interface Ingredient {
  id: string;
  name: string;
  purchaseCost: number;
  purchaseQuantity: number;
  purchaseUnit: Unit;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
