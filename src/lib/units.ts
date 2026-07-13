import type { Unit, UnitCategory } from '../types';

export const UNIT_CATEGORY: Record<Unit, UnitCategory> = {
  g: 'weight',
  kg: 'weight',
  oz: 'weight',
  lb: 'weight',
  ml: 'volume',
  l: 'volume',
  tsp: 'volume',
  tbsp: 'volume',
  cup: 'volume',
  piece: 'count',
};

export const BASE_UNIT: Record<UnitCategory, Unit> = {
  weight: 'g',
  volume: 'ml',
  count: 'piece',
};

// Quantity of the base unit equal to 1 of this unit.
export const CONVERSION_TO_BASE: Record<Unit, number> = {
  // weight -> grams
  g: 1,
  kg: 1000,
  oz: 28.349523125,
  lb: 453.59237,
  // volume -> milliliters (US customary cooking units)
  ml: 1,
  l: 1000,
  tsp: 4.92892159375,
  tbsp: 14.78676478125,
  cup: 236.5882365,
  // count -> piece
  piece: 1,
};

export const UNITS_BY_CATEGORY: Record<UnitCategory, Unit[]> = {
  weight: ['g', 'kg', 'oz', 'lb'],
  volume: ['ml', 'l', 'tsp', 'tbsp', 'cup'],
  count: ['piece'],
};

export const UNIT_LABELS: Record<Unit, string> = {
  g: 'g',
  kg: 'kg',
  oz: 'oz',
  lb: 'lb',
  ml: 'ml',
  l: 'L',
  tsp: 'tsp',
  tbsp: 'tbsp',
  cup: 'cup',
  piece: 'piece',
};

export const UNIT_CATEGORY_LABELS: Record<UnitCategory, string> = {
  weight: 'Weight',
  volume: 'Volume',
  count: 'Count',
};

export function getUnitCategory(unit: Unit): UnitCategory {
  return UNIT_CATEGORY[unit];
}

export function toBaseUnit(quantity: number, unit: Unit): number {
  return quantity * CONVERSION_TO_BASE[unit];
}

export function convert(quantity: number, from: Unit, to: Unit): number {
  const fromCat = UNIT_CATEGORY[from];
  const toCat = UNIT_CATEGORY[to];
  if (fromCat !== toCat) {
    throw new Error(
      `Cannot convert "${from}" (${fromCat}) to "${to}" (${toCat}) — different unit categories.`,
    );
  }
  return toBaseUnit(quantity, from) / CONVERSION_TO_BASE[to];
}
