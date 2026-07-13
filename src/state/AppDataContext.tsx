import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from 'react';
import { type AppData, createEmptyAppData, type Ingredient, type Recipe } from '../types';
import { appDataReducer } from './appDataReducer';
import { useAuth } from './AuthContext';
import { useToast } from '../components/layout/Toast';
import {
  deleteIngredientRow,
  deleteRecipeRow,
  fetchAllData,
  insertIngredientRow,
  insertRecipeRow,
  replaceAllRows,
  updateIngredientRow,
  updateRecipeRow,
} from '../lib/supabaseData';

interface AppDataContextValue {
  ingredients: Ingredient[];
  recipes: Recipe[];
  isLoading: boolean;
  addIngredient: (ingredient: Ingredient) => void;
  updateIngredient: (ingredient: Ingredient) => void;
  deleteIngredient: (id: string) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
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

  function addIngredient(ingredient: Ingredient) {
    dispatch({ type: 'ADD_INGREDIENT', ingredient });
    if (!user) return;
    insertIngredientRow(user.id, ingredient).catch(() => {
      showToast('Could not save the ingredient. Refreshing…', 'error');
      resync();
    });
  }

  function updateIngredient(ingredient: Ingredient) {
    dispatch({ type: 'UPDATE_INGREDIENT', ingredient });
    if (!user) return;
    updateIngredientRow(user.id, ingredient).catch(() => {
      showToast('Could not save the change. Refreshing…', 'error');
      resync();
    });
  }

  function deleteIngredient(id: string) {
    dispatch({ type: 'DELETE_INGREDIENT', id });
    if (!user) return;
    deleteIngredientRow(user.id, id).catch(() => {
      showToast('Could not delete the ingredient. Refreshing…', 'error');
      resync();
    });
  }

  function addRecipe(recipe: Recipe) {
    dispatch({ type: 'ADD_RECIPE', recipe });
    if (!user) return;
    insertRecipeRow(user.id, recipe).catch(() => {
      showToast('Could not save the recipe. Refreshing…', 'error');
      resync();
    });
  }

  function updateRecipe(recipe: Recipe) {
    dispatch({ type: 'UPDATE_RECIPE', recipe });
    if (!user) return;
    updateRecipeRow(user.id, recipe).catch(() => {
      showToast('Could not save the change. Refreshing…', 'error');
      resync();
    });
  }

  function deleteRecipe(id: string) {
    dispatch({ type: 'DELETE_RECIPE', id });
    if (!user) return;
    deleteRecipeRow(user.id, id).catch(() => {
      showToast('Could not delete the recipe. Refreshing…', 'error');
      resync();
    });
  }

  async function replaceAllData(data: AppData) {
    dispatch({ type: 'LOAD', data });
    if (!user) return;
    await replaceAllRows(user.id, data);
  }

  const value: AppDataContextValue = {
    ingredients: state.ingredients,
    recipes: state.recipes,
    isLoading,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    addRecipe,
    updateRecipe,
    deleteRecipe,
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
