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

export const COST_BUCKETS = ['ingredients', 'packaging', 'overheads', 'labour'] as const;

export type CostBucket = (typeof COST_BUCKETS)[number];

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

export const BUCKET_LABELS: Record<CostBucket, string> = {
  ingredients: 'Ingredients',
  packaging: 'Packaging',
  overheads: 'Overheads',
  labour: 'Labour',
};
