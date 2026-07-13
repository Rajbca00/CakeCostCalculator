import { Link } from 'react-router-dom';
import type { Recipe } from '../../types';
import { calculateRecipeCost } from '../../lib/costCalculations';
import { formatCurrency, formatUnitCost } from '../../lib/format';
import { useIngredientsById } from '../../state/useAppData';
import { Button } from '../common/Button';

interface RecipeCardProps {
  recipe: Recipe;
  onDelete: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onDelete }: RecipeCardProps) {
  const ingredientsById = useIngredientsById();
  const result = calculateRecipeCost(recipe, ingredientsById);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <Link to={`/recipes/${recipe.id}`} className="font-medium text-slate-900 hover:underline">
          {recipe.name}
        </Link>
        <p className="text-sm text-slate-500">
          {recipe.baseYieldQuantity} {recipe.baseYieldLabel} · {formatCurrency(result.total)} total ·{' '}
          {formatUnitCost(result.costPerYieldUnit)} / {recipe.baseYieldLabel}
          {result.hasMissingIngredients && (
            <span className="ml-2 text-amber-600">⚠ missing ingredient</span>
          )}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Link to={`/recipes/${recipe.id}`}>
          <Button variant="secondary">Open</Button>
        </Link>
        <Button variant="danger" onClick={() => onDelete(recipe)}>
          Delete
        </Button>
      </div>
    </div>
  );
}
