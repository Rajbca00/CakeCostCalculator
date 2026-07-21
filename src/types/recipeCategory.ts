/** Product category a whole recipe belongs to (Recipe Book / Recipe Dashboard grouping). */
export const RECIPE_CATEGORIES = [
  'Cakes',
  'Cupcakes',
  'Brownies',
  'Cookies',
  'Frostings',
  'Fillings',
  'Ganache',
  'Decorations',
] as const;

export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number];
