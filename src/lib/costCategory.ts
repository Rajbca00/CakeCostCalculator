import { CATEGORY_BUCKET, type CostBucket, type CostCategory } from '../types';

const KEYWORD_CATEGORIES: [RegExp, CostCategory][] = [
  [/frost|icing/i, 'Frosting'],
  [/fill/i, 'Filling'],
  [/decor|topper|theme/i, 'Decoration'],
  [/pack|box|ribbon|sticker|board/i, 'Packaging'],
  [/electric|gas|lpg|water|overhead|clean|equipment|wastage|depreciation/i, 'Overheads'],
  [/labour|labor/i, 'Labour'],
];

/** Best-effort category guess from a legacy free-text group name. Never throws, always returns a category. */
function guessCategoryFromGroupName(groupName: string | undefined): CostCategory | undefined {
  if (!groupName) return undefined;
  const match = KEYWORD_CATEGORIES.find(([pattern]) => pattern.test(groupName));
  return match?.[1];
}

/**
 * Resolves the cost category for an ingredient line or extra cost: explicit `category`
 * wins, otherwise it's guessed from the legacy `groupName`, otherwise falls back to a
 * sensible default so every line always has a category for the cost-breakdown rollup.
 */
export function resolveIngredientLineCategory(line: {
  category?: CostCategory;
  groupName?: string;
}): CostCategory {
  return line.category ?? guessCategoryFromGroupName(line.groupName) ?? 'Batter';
}

export function resolveExtraCostCategory(cost: {
  category?: CostCategory;
  groupName?: string;
}): CostCategory {
  return cost.category ?? guessCategoryFromGroupName(cost.groupName) ?? 'Packaging';
}

export function bucketForCategory(category: CostCategory): CostBucket {
  return CATEGORY_BUCKET[category];
}
