import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { AppData, Ingredient, Recipe } from '../types';
import { appDataReducer, initAppDataState } from './appDataReducer';
import { isStorageAvailable, loadAppData, saveAppData } from '../lib/storage';

interface AppDataContextValue {
  ingredients: Ingredient[];
  recipes: Recipe[];
  storageAvailable: boolean;
  saveFailed: boolean;
  addIngredient: (ingredient: Ingredient) => void;
  updateIngredient: (ingredient: Ingredient) => void;
  deleteIngredient: (id: string) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  replaceAllData: (data: AppData) => void;
  getSnapshot: () => AppData;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appDataReducer, undefined, initAppDataState);
  const [storageAvailable] = useState<boolean>(() => isStorageAvailable());
  const [saveFailed, setSaveFailed] = useState(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!storageAvailable) {
      hasLoaded.current = true;
      return;
    }
    const loaded = loadAppData();
    dispatch({ type: 'LOAD', data: loaded });
    hasLoaded.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasLoaded.current || !storageAvailable) return;
    const ok = saveAppData(state);
    setSaveFailed(!ok);
  }, [state, storageAvailable]);

  const value: AppDataContextValue = {
    ingredients: state.ingredients,
    recipes: state.recipes,
    storageAvailable,
    saveFailed,
    addIngredient: (ingredient) => dispatch({ type: 'ADD_INGREDIENT', ingredient }),
    updateIngredient: (ingredient) => dispatch({ type: 'UPDATE_INGREDIENT', ingredient }),
    deleteIngredient: (id) => dispatch({ type: 'DELETE_INGREDIENT', id }),
    addRecipe: (recipe) => dispatch({ type: 'ADD_RECIPE', recipe }),
    updateRecipe: (recipe) => dispatch({ type: 'UPDATE_RECIPE', recipe }),
    deleteRecipe: (id) => dispatch({ type: 'DELETE_RECIPE', id }),
    replaceAllData: (data) => dispatch({ type: 'LOAD', data }),
    getSnapshot: () => state,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppDataContext(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppDataContext must be used within an AppDataProvider');
  return ctx;
}
