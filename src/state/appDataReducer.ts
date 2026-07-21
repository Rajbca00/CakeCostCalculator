import {
  type AddOn,
  type AppData,
  type BusinessSettings,
  type Ingredient,
  type PackagingTemplate,
  type PriceListingVariant,
  type Quote,
  type Recipe,
  type RecipeVersion,
} from '../types';

export type AppDataAction =
  | { type: 'LOAD'; data: AppData }
  | { type: 'ADD_INGREDIENT'; ingredient: Ingredient }
  | { type: 'UPDATE_INGREDIENT'; ingredient: Ingredient }
  | { type: 'DELETE_INGREDIENT'; id: string }
  | { type: 'ADD_RECIPE'; recipe: Recipe }
  | { type: 'UPDATE_RECIPE'; recipe: Recipe }
  | { type: 'DELETE_RECIPE'; id: string }
  | { type: 'ADD_PRICE_LISTING_VARIANT'; variant: PriceListingVariant }
  | { type: 'UPDATE_PRICE_LISTING_VARIANT'; variant: PriceListingVariant }
  | { type: 'DELETE_PRICE_LISTING_VARIANT'; id: string }
  | { type: 'SET_SETTINGS'; settings: BusinessSettings }
  | { type: 'ADD_PACKAGING_TEMPLATE'; template: PackagingTemplate }
  | { type: 'UPDATE_PACKAGING_TEMPLATE'; template: PackagingTemplate }
  | { type: 'DELETE_PACKAGING_TEMPLATE'; id: string }
  | { type: 'ADD_RECIPE_VERSION'; version: RecipeVersion }
  | { type: 'ADD_ADD_ON'; addOn: AddOn }
  | { type: 'UPDATE_ADD_ON'; addOn: AddOn }
  | { type: 'DELETE_ADD_ON'; id: string }
  | { type: 'ADD_QUOTE'; quote: Quote }
  | { type: 'DELETE_QUOTE'; id: string };

export function appDataReducer(state: AppData, action: AppDataAction): AppData {
  switch (action.type) {
    case 'LOAD':
      return action.data;
    case 'ADD_INGREDIENT':
      return { ...state, ingredients: [...state.ingredients, action.ingredient] };
    case 'UPDATE_INGREDIENT':
      return {
        ...state,
        ingredients: state.ingredients.map((i) =>
          i.id === action.ingredient.id ? action.ingredient : i,
        ),
      };
    case 'DELETE_INGREDIENT':
      return {
        ...state,
        ingredients: state.ingredients.filter((i) => i.id !== action.id),
      };
    case 'ADD_RECIPE':
      return { ...state, recipes: [...state.recipes, action.recipe] };
    case 'UPDATE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.map((r) => (r.id === action.recipe.id ? action.recipe : r)),
      };
    case 'DELETE_RECIPE':
      return {
        ...state,
        recipes: state.recipes
          .filter((r) => r.id !== action.id)
          .map((r) => (r.parentRecipeId === action.id ? { ...r, parentRecipeId: undefined } : r)),
        priceListingVariants: state.priceListingVariants.filter(
          (v) => v.recipeId !== action.id,
        ),
        recipeVersions: state.recipeVersions.filter((v) => v.recipeId !== action.id),
        quotes: state.quotes.filter((q) => q.recipeId !== action.id),
      };
    case 'ADD_PRICE_LISTING_VARIANT':
      return { ...state, priceListingVariants: [...state.priceListingVariants, action.variant] };
    case 'UPDATE_PRICE_LISTING_VARIANT':
      return {
        ...state,
        priceListingVariants: state.priceListingVariants.map((v) =>
          v.id === action.variant.id ? action.variant : v,
        ),
      };
    case 'DELETE_PRICE_LISTING_VARIANT':
      return {
        ...state,
        priceListingVariants: state.priceListingVariants.filter((v) => v.id !== action.id),
        quotes: state.quotes.map((q) =>
          q.variantId === action.id ? { ...q, variantId: undefined } : q,
        ),
      };
    case 'SET_SETTINGS':
      return { ...state, settings: action.settings };
    case 'ADD_PACKAGING_TEMPLATE':
      return { ...state, packagingTemplates: [...state.packagingTemplates, action.template] };
    case 'UPDATE_PACKAGING_TEMPLATE':
      return {
        ...state,
        packagingTemplates: state.packagingTemplates.map((t) =>
          t.id === action.template.id ? action.template : t,
        ),
      };
    case 'DELETE_PACKAGING_TEMPLATE':
      return {
        ...state,
        packagingTemplates: state.packagingTemplates.filter((t) => t.id !== action.id),
        priceListingVariants: state.priceListingVariants.map((v) =>
          v.packagingTemplateId === action.id ? { ...v, packagingTemplateId: undefined } : v,
        ),
      };
    case 'ADD_RECIPE_VERSION':
      return { ...state, recipeVersions: [...state.recipeVersions, action.version] };
    case 'ADD_ADD_ON':
      return { ...state, addOns: [...state.addOns, action.addOn] };
    case 'UPDATE_ADD_ON':
      return {
        ...state,
        addOns: state.addOns.map((a) => (a.id === action.addOn.id ? action.addOn : a)),
      };
    case 'DELETE_ADD_ON':
      return {
        ...state,
        addOns: state.addOns.filter((a) => a.id !== action.id),
        quotes: state.quotes.map((q) =>
          q.addOnIds.includes(action.id)
            ? { ...q, addOnIds: q.addOnIds.filter((id) => id !== action.id) }
            : q,
        ),
      };
    case 'ADD_QUOTE':
      return { ...state, quotes: [...state.quotes, action.quote] };
    case 'DELETE_QUOTE':
      return { ...state, quotes: state.quotes.filter((q) => q.id !== action.id) };
    default:
      return state;
  }
}
