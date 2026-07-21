import { normalizeGroupName } from './recipeGroups';
import { CATEGORY_BUCKET, type CostBucket, type CostCategory, type Recipe } from '../types';

const KEYWORD_BUCKETS: [RegExp, CostBucket][] = [
  [/frost|icing|fill|decor|topper|theme/i, 'ingredients'],
  [/pack|box|ribbon|sticker|board/i, 'packaging'],
  [/electric|gas|lpg|water|overhead|clean|equipment|wastage|depreciation/i, 'overheads'],
  [/labour|labor/i, 'labour'],
];

/** Best-effort bucket guess from a group name. Never throws, always returns a bucket. */
export function guessBucketFromGroupName(groupName: string, fallback: CostBucket): CostBucket {
  const match = KEYWORD_BUCKETS.find(([pattern]) => pattern.test(groupName));
  return match?.[1] ?? fallback;
}

/**
 * The cost-breakdown bucket a group currently resolves to: an explicit per-recipe
 * override (set once via the "Groups & cost buckets" panel) if there is one, otherwise
 * a keyword guess from the group's own name.
 */
export function resolveGroupBucket(
  groupName: string | undefined,
  recipe: Pick<Recipe, 'groupBuckets'>,
  fallback: CostBucket = 'ingredients',
): CostBucket {
  const normalized = normalizeGroupName(groupName);
  return recipe.groupBuckets?.[normalized] ?? guessBucketFromGroupName(normalized, fallback);
}

/**
 * Resolves an ingredient line's bucket. A legacy per-line `category` (from before groups
 * could carry a bucket assignment directly) still wins, so recipes saved before this
 * change keep costing exactly the same; new recipes are classified by group instead.
 */
export function resolveIngredientLineBucket(
  line: { category?: CostCategory; groupName?: string },
  recipe: Pick<Recipe, 'groupBuckets'>,
): CostBucket {
  if (line.category) return CATEGORY_BUCKET[line.category];
  return resolveGroupBucket(line.groupName, recipe, 'ingredients');
}

export function resolveExtraCostBucket(
  cost: { category?: CostCategory; groupName?: string },
  recipe: Pick<Recipe, 'groupBuckets'>,
): CostBucket {
  if (cost.category) return CATEGORY_BUCKET[cost.category];
  return resolveGroupBucket(cost.groupName, recipe, 'packaging');
}
