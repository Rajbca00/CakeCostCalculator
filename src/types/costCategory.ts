/** Fixed accounting categories a cost line rolls up into, for the cost-breakdown dashboard. */
export const COST_CATEGORIES = [
  'Batter',
  'Frosting',
  'Filling',
  'Decoration',
  'Packaging',
  'Overheads',
  'Labour',
] as const;

export type CostCategory = (typeof COST_CATEGORIES)[number];

export type CostBucket = 'ingredients' | 'packaging' | 'overheads' | 'labour';

/** Which top-level dashboard bucket each fixed category rolls into. */
export const CATEGORY_BUCKET: Record<CostCategory, CostBucket> = {
  Batter: 'ingredients',
  Frosting: 'ingredients',
  Filling: 'ingredients',
  Decoration: 'ingredients',
  Packaging: 'packaging',
  Overheads: 'overheads',
  Labour: 'labour',
};

export const COST_BUCKETS: CostBucket[] = ['ingredients', 'packaging', 'overheads', 'labour'];

export const BUCKET_LABELS: Record<CostBucket, string> = {
  ingredients: 'Ingredients',
  packaging: 'Packaging',
  overheads: 'Overheads',
  labour: 'Labour',
};
