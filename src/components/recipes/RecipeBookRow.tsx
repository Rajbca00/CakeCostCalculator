import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { BusinessSettings, Ingredient, Recipe } from '../../types';
import { calculateRecipeCost } from '../../lib/costCalculations';
import { getEffectiveRecipe } from '../../lib/recipeHierarchy';
import { formatCurrency, formatQuantity } from '../../lib/format';

interface RecipeBookRowProps {
  recipe: Recipe;
  depth: number;
  childrenByParentId: Map<string, Recipe[]>;
  recipesById: Map<string, Recipe>;
  ingredientsById: Map<string, Ingredient>;
  settings: BusinessSettings;
  versionCountByRecipeId: Map<string, number>;
}

export function RecipeBookRow({
  recipe,
  depth,
  childrenByParentId,
  recipesById,
  ingredientsById,
  settings,
  versionCountByRecipeId,
}: RecipeBookRowProps) {
  const [expanded, setExpanded] = useState(true);
  const children = childrenByParentId.get(recipe.id) ?? [];
  const result = calculateRecipeCost(
    getEffectiveRecipe(recipe, recipesById),
    ingredientsById,
    1,
    undefined,
    0,
    settings,
  );
  const versionCount = versionCountByRecipeId.get(recipe.id) ?? 0;

  return (
    <>
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-3 py-2 last:border-b-0"
        style={{ paddingLeft: `${0.75 + depth * 1.5}rem` }}
      >
        <div className="flex min-w-0 items-center gap-2">
          {children.length > 0 ? (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="w-4 shrink-0 text-slate-400 hover:text-slate-600"
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? '▾' : '▸'}
            </button>
          ) : (
            <span className="w-4 shrink-0" />
          )}
          <div className="min-w-0">
            <Link
              to={`/recipes/${recipe.id}`}
              className="font-medium text-slate-900 hover:underline"
            >
              {recipe.name}
            </Link>
            <p className="truncate text-xs text-slate-400">
              {recipe.category ?? 'Uncategorized'} · v{versionCount + 1}
              {recipe.status ? ` (${recipe.status})` : ''}
              {recipe.notes && ` · ${recipe.notes}`}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right text-sm">
          <p className="text-slate-500">
            {formatQuantity(recipe.baseYieldQuantity)} {recipe.baseYieldLabel}
          </p>
          <p className="font-medium text-slate-800">
            {formatCurrency(result.total)}
            {result.profitPercent > 0 && <> → {formatCurrency(result.sellingTotal)}</>}
          </p>
        </div>
      </div>
      {expanded &&
        children.map((child) => (
          <RecipeBookRow
            key={child.id}
            recipe={child}
            depth={depth + 1}
            childrenByParentId={childrenByParentId}
            recipesById={recipesById}
            ingredientsById={ingredientsById}
            settings={settings}
            versionCountByRecipeId={versionCountByRecipeId}
          />
        ))}
    </>
  );
}
