import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { EmptyState } from '../components/layout/EmptyState';
import { Button } from '../components/common/Button';
import {
  useIngredientsById,
  useRecipes,
  useRecipesById,
  useSettings,
} from '../state/useAppData';
import { calculateRecipeCost, round2 } from '../lib/costCalculations';
import { getEffectiveRecipe } from '../lib/recipeHierarchy';
import { formatCurrency } from '../lib/format';

const LOW_MARGIN_THRESHOLD_PERCENT = 20;

export function BusinessDashboardPage() {
  const navigate = useNavigate();
  const recipes = useRecipes();
  const recipesById = useRecipesById();
  const ingredientsById = useIngredientsById();
  const settings = useSettings();

  const rows = useMemo(
    () =>
      recipes.map((recipe) => {
        const result = calculateRecipeCost(
          getEffectiveRecipe(recipe, recipesById),
          ingredientsById,
          1,
          undefined,
          0,
          settings,
        );
        const marginPercent =
          result.sellingTotal > 0
            ? round2(((result.sellingTotal - result.actualCost) / result.sellingTotal) * 100)
            : 0;
        return { recipe, result, marginPercent };
      }),
    [recipes, recipesById, ingredientsById, settings],
  );

  const totals = rows.reduce(
    (acc, { result }) => ({
      ingredients: acc.ingredients + result.bucketTotals.ingredients,
      packaging: acc.packaging + result.bucketTotals.packaging,
      overheads: acc.overheads + result.bucketTotals.overheads,
      labour: acc.labour + result.bucketTotals.labour,
      actualCost: acc.actualCost + result.actualCost,
    }),
    { ingredients: 0, packaging: 0, overheads: 0, labour: 0, actualCost: 0 },
  );

  const pct = (part: number) => (totals.actualCost > 0 ? round2((part / totals.actualCost) * 100) : 0);

  const mostProfitable = rows.reduce<(typeof rows)[number] | undefined>((best, row) => {
    if (row.result.sellingTotal <= 0) return best;
    if (!best || row.marginPercent > best.marginPercent) return row;
    return best;
  }, undefined);

  const lowMarginProducts = rows
    .filter((r) => r.result.sellingTotal > 0 && r.marginPercent < LOW_MARGIN_THRESHOLD_PERCENT)
    .sort((a, b) => a.marginPercent - b.marginPercent);

  if (recipes.length === 0) {
    return (
      <PageContainer>
        <h1 className="mb-4 text-xl font-semibold text-slate-900">Business Dashboard</h1>
        <EmptyState
          title="No recipes yet"
          description="Add recipes and set a Profit % on them to see business metrics here."
          action={<Button onClick={() => navigate('/recipes/new')}>Add a recipe</Button>}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Business Dashboard</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Total recipes</p>
          <p className="text-2xl font-semibold text-slate-900">{recipes.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Most profitable (by margin %)</p>
          {mostProfitable ? (
            <>
              <Link
                to={`/recipes/${mostProfitable.recipe.id}`}
                className="block truncate text-lg font-semibold text-rose-600 hover:underline"
              >
                {mostProfitable.recipe.name}
              </Link>
              <p className="text-sm text-slate-500">{mostProfitable.marginPercent}% margin</p>
            </>
          ) : (
            <p className="text-sm text-slate-400">Set a Profit % on a recipe to see this</p>
          )}
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Low margin products (&lt;{LOW_MARGIN_THRESHOLD_PERCENT}%)</p>
          <p className="text-2xl font-semibold text-slate-900">{lowMarginProducts.length}</p>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          Blended cost composition (across all recipes)
        </h2>
        {totals.actualCost > 0 ? (
          <div className="flex flex-col gap-2 text-sm">
            {(
              [
                ['Ingredient cost %', pct(totals.ingredients)],
                ['Labour %', pct(totals.labour)],
                ['Packaging %', pct(totals.packaging)],
                ['Overheads %', pct(totals.overheads)],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <div className="mb-1 flex justify-between">
                  <span className="text-slate-600">{label}</span>
                  <span className="font-medium text-slate-800">{value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-rose-500"
                    style={{ width: `${Math.min(100, value)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            Set ingredient costs, labour/electricity rates, or packaging costs to see this.
          </p>
        )}
        <p className="mt-3 text-xs text-slate-400">
          "Monthly profit" isn't shown here -- it needs real sales/order data (which orders and
          when they were fulfilled), and this app doesn't track orders yet. Showing a number
          without that data would just be a guess, so it's left out rather than faked.
        </p>
      </div>

      {lowMarginProducts.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h2 className="mb-2 text-sm font-semibold text-amber-800">Low margin products</h2>
          <div className="flex flex-col gap-1">
            {lowMarginProducts.map(({ recipe, result, marginPercent }) => (
              <div key={recipe.id} className="flex items-center justify-between text-sm">
                <Link to={`/recipes/${recipe.id}`} className="text-amber-900 hover:underline">
                  {recipe.name}
                </Link>
                <span className="text-amber-700">
                  {marginPercent}% margin · {formatCurrency(result.actualCost)} cost →{' '}
                  {formatCurrency(result.sellingTotal)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
