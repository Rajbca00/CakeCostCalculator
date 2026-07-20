import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from 'react';
import {
  type AppData,
  createEmptyAppData,
  type Ingredient,
  type PriceListingVariant,
  type Recipe,
} from '../types';
import { appDataReducer } from './appDataReducer';
import { useAuth } from './AuthContext';
import { useToast } from '../components/layout/Toast';
import {
  deleteIngredientRow,
  deletePriceListingVariantRow,
  deleteRecipeRow,
  fetchAllData,
  insertIngredientRow,
  insertPriceListingVariantRow,
  insertRecipeRow,
  replaceAllRows,
  updateIngredientRow,
  updatePriceListingVariantRow,
  updateRecipeRow,
} from '../lib/supabaseData';

interface AppDataContextValue {
  ingredients: Ingredient[];
  recipes: Recipe[];
  priceListingVariants: PriceListingVariant[];
  isLoading: boolean;
  addIngredient: (ingredient: Ingredient) => Promise<void>;
  updateIngredient: (ingredient: Ingredient) => Promise<void>;
  deleteIngredient: (id: string) => Promise<void>;
  addRecipe: (recipe: Recipe, successMessage?: string) => Promise<void>;
  updateRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  addPriceListingVariant: (variant: PriceListingVariant) => Promise<void>;
  updatePriceListingVariant: (variant: PriceListingVariant) => Promise<void>;
  deletePriceListingVariant: (id: string) => Promise<void>;
  replaceAllData: (data: AppData) => Promise<void>;
  getSnapshot: () => AppData;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [state, dispatch] = useReducer(appDataReducer, undefined, createEmptyAppData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setIsLoading(true);
    fetchAllData(user.id)
      .then((data) => {
        if (!cancelled) dispatch({ type: 'LOAD', data });
      })
      .catch(() => {
        if (!cancelled) {
          showToast('Could not load your data. Check your connection and refresh.', 'error');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function resync() {
    if (!user) return;
    try {
      const data = await fetchAllData(user.id);
      dispatch({ type: 'LOAD', data });
    } catch {
      // best-effort reconciliation; the failing action already showed a toast
    }
  }

  async function addIngredient(ingredient: Ingredient): Promise<void> {
    dispatch({ type: 'ADD_INGREDIENT', ingredient });
    if (!user) return;
    try {
      await insertIngredientRow(user.id, ingredient);
      showToast(`"${ingredient.name}" added`, 'success');
    } catch {
      showToast('Could not save the ingredient. Refreshing…', 'error');
      await resync();
      throw new Error('Failed to save ingredient');
    }
  }

  async function updateIngredient(ingredient: Ingredient): Promise<void> {
    dispatch({ type: 'UPDATE_INGREDIENT', ingredient });
    if (!user) return;
    try {
      await updateIngredientRow(user.id, ingredient);
      showToast(`"${ingredient.name}" updated`, 'success');
    } catch {
      showToast('Could not save the change. Refreshing…', 'error');
      await resync();
      throw new Error('Failed to update ingredient');
    }
  }

  async function deleteIngredient(id: string): Promise<void> {
    const name = state.ingredients.find((i) => i.id === id)?.name ?? 'Ingredient';
    dispatch({ type: 'DELETE_INGREDIENT', id });
    if (!user) return;
    try {
      await deleteIngredientRow(user.id, id);
      showToast(`"${name}" deleted`, 'success');
    } catch {
      showToast('Could not delete the ingredient. Refreshing…', 'error');
      await resync();
      throw new Error('Failed to delete ingredient');
    }
  }

  async function addRecipe(recipe: Recipe, successMessage?: string): Promise<void> {
    dispatch({ type: 'ADD_RECIPE', recipe });
    if (!user) return;
    try {
      await insertRecipeRow(user.id, recipe);
      showToast(successMessage ?? `"${recipe.name}" added`, 'success');
    } catch {
      showToast('Could not save the recipe. Refreshing…', 'error');
      await resync();
      throw new Error('Failed to save recipe');
    }
  }

  async function updateRecipe(recipe: Recipe): Promise<void> {
    dispatch({ type: 'UPDATE_RECIPE', recipe });
    if (!user) return;
    try {
      await updateRecipeRow(user.id, recipe);
      showToast(`"${recipe.name}" updated`, 'success');
    } catch {
      showToast('Could not save the change. Refreshing…', 'error');
      await resync();
      throw new Error('Failed to update recipe');
    }
  }

  async function deleteRecipe(id: string): Promise<void> {
    const name = state.recipes.find((r) => r.id === id)?.name ?? 'Recipe';
    dispatch({ type: 'DELETE_RECIPE', id });
    if (!user) return;
    try {
      await deleteRecipeRow(user.id, id);
      showToast(`"${name}" deleted`, 'success');
    } catch {
      showToast('Could not delete the recipe. Refreshing…', 'error');
      await resync();
      throw new Error('Failed to delete recipe');
    }
  }

  async function addPriceListingVariant(variant: PriceListingVariant): Promise<void> {
    dispatch({ type: 'ADD_PRICE_LISTING_VARIANT', variant });
    if (!user) return;
    try {
      await insertPriceListingVariantRow(user.id, variant);
      showToast(`"${variant.name}" added to the menu`, 'success');
    } catch {
      showToast('Could not save the menu item. Refreshing…', 'error');
      await resync();
      throw new Error('Failed to save price listing variant');
    }
  }

  async function updatePriceListingVariant(variant: PriceListingVariant): Promise<void> {
    dispatch({ type: 'UPDATE_PRICE_LISTING_VARIANT', variant });
    if (!user) return;
    try {
      await updatePriceListingVariantRow(user.id, variant);
      showToast(`"${variant.name}" updated`, 'success');
    } catch {
      showToast('Could not save the change. Refreshing…', 'error');
      await resync();
      throw new Error('Failed to update price listing variant');
    }
  }

  async function deletePriceListingVariant(id: string): Promise<void> {
    const name = state.priceListingVariants.find((v) => v.id === id)?.name ?? 'Menu item';
    dispatch({ type: 'DELETE_PRICE_LISTING_VARIANT', id });
    if (!user) return;
    try {
      await deletePriceListingVariantRow(user.id, id);
      showToast(`"${name}" removed`, 'success');
    } catch {
      showToast('Could not remove the menu item. Refreshing…', 'error');
      await resync();
      throw new Error('Failed to delete price listing variant');
    }
  }

  async function replaceAllData(data: AppData): Promise<void> {
    dispatch({ type: 'LOAD', data });
    if (!user) return;
    await replaceAllRows(user.id, data);
  }

  const value: AppDataContextValue = {
    ingredients: state.ingredients,
    recipes: state.recipes,
    priceListingVariants: state.priceListingVariants,
    isLoading,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    addPriceListingVariant,
    updatePriceListingVariant,
    deletePriceListingVariant,
    replaceAllData,
    getSnapshot: () => state,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppDataContext(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppDataContext must be used within an AppDataProvider');
  return ctx;
}
