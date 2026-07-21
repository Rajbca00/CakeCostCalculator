import { Link } from 'react-router-dom';
import type { Recipe } from '../../types';
import { calculateRecipeCost } from '../../lib/costCalculations';
import { getEffectiveRecipe } from '../../lib/recipeHierarchy';
import { recipeContainsEgg } from '../../lib/eggFlag';
import { formatCurrency } from '../../lib/format';
import { useIngredientsById, useRecipesById, useSettings } from '../../state/useAppData';
import { Button } from '../common/Button';
import { EggFlagBadge } from './EggFlagBadge';

interface RecipeCardProps {
  recipe: Recipe;
  onRename: (recipe: Recipe) => void;
  onClone: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onRename, onClone, onDelete }: RecipeCardProps) {
  const ingredientsById = useIngredientsById();
  const recipesById = useRecipesById();
  const settings = useSettings();
  const effectiveRecipe = getEffectiveRecipe(recipe, recipesById);
  const result = calculateRecipeCost(effectiveRecipe, ingredientsById, 1, undefined, 0, settings);
  const parent = recipe.parentRecipeId ? recipesById.get(recipe.parentRecipeId) : undefined;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <Link to={`/recipes/${recipe.id}`} className="font-medium text-slate-900 hover:underline">
          {recipe.name}
        </Link>{' '}
        <EggFlagBadge containsEgg={recipeContainsEgg(effectiveRecipe, ingredientsById)} />
        {(recipe.category || recipe.status || parent) && (
          <p className="text-xs text-slate-400">
            {recipe.category && <span>{recipe.category}</span>}
            {recipe.category && (recipe.status || parent) && ' · '}
            {recipe.status && <span>{recipe.status}</span>}
            {recipe.status && parent && ' · '}
            {parent && <span>Child of {parent.name}</span>}
          </p>
        )}
        <p className="text-sm text-slate-500">
          {recipe.baseYieldQuantity} {recipe.baseYieldLabel} · {formatCurrency(result.total)} total
          {result.profitPercent > 0 && (
            <> · sells for {formatCurrency(result.sellingTotal)}</>
          )}
          {result.hasMissingIngredients && (
            <span className="ml-2 text-amber-600">⚠ missing ingredient</span>
          )}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Link to={`/recipes/${recipe.id}`}>
          <Button variant="secondary">Open</Button>
        </Link>
        <Button variant="secondary" onClick={() => onRename(recipe)}>
          Rename
        </Button>
        <Button variant="secondary" onClick={() => onClone(recipe)}>
          Clone
        </Button>
        <Button variant="danger" onClick={() => onDelete(recipe)}>
          Delete
        </Button>
      </div>
    </div>
  );
}
