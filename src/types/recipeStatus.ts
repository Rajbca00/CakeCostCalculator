/** Lifecycle status of a recipe's current version. */
export const RECIPE_STATUSES = ['Draft', 'Testing', 'Final'] as const;

export type RecipeStatus = (typeof RECIPE_STATUSES)[number];
