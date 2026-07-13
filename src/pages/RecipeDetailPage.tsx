import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/common/Button';
import { TextInput } from '../components/common/TextInput';
import { NumberInput } from '../components/common/NumberInput';
import { RecipeIngredientLineEditor } from '../components/recipes/RecipeIngredientLineEditor';
import { ExtraCostEditor } from '../components/recipes/ExtraCostEditor';
import { RecipeCostSummary } from '../components/recipes/RecipeCostSummary';
import { CloneRecipeDialog } from '../components/recipes/CloneRecipeDialog';
import { RecipeScalePanel } from '../components/scaling/RecipeScalePanel';
import { ScaledIngredientTable } from '../components/scaling/ScaledIngredientTable';
import {
  useAppDataContext,
  useIngredients,
  useIngredientsById,
  useRecipeById,
  useRecipes,
} from '../state/useAppData';
import type { ExtraCost, Recipe, RecipeIngredientLine } from '../types';
import { generateId } from '../lib/id';
import { calculateRecipeCost } from '../lib/costCalculations';
import {
  isNonEmptyString,
  isNonNegativeNumber,
  isPositiveNumber,
  isRecipeNameUnique,
} from '../lib/validation';
import { cloneRecipeWithName } from '../lib/recipeClone';

interface DraftState {
  name: string;
  baseYieldQuantity: number;
  baseYieldLabel: string;
  baseServings: number;
  profitPercent: number;
  ingredientLines: RecipeIngredientLine[];
  extraCosts: ExtraCost[];
  notes: string;
}

function draftFromRecipe(recipe?: Recipe): DraftState {
  return {
    name: recipe?.name ?? '',
    baseYieldQuantity: recipe?.baseYieldQuantity ?? 1,
    baseYieldLabel: recipe?.baseYieldLabel ?? 'servings',
    baseServings: recipe?.baseServings ?? NaN,
    profitPercent: recipe?.profitPercent ?? NaN,
    ingredientLines: recipe?.ingredientLines ?? [],
    extraCosts: recipe?.extraCosts ?? [],
    notes: recipe?.notes ?? '',
  };
}

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const recipe = useRecipeById(isNew ? undefined : id);
  const ingredients = useIngredients();
  const ingredientsById = useIngredientsById();
  const recipes = useRecipes();
  const { addRecipe, updateRecipe } = useAppDataContext();

  const [draft, setDraft] = useState<DraftState>(() => draftFromRecipe(recipe));
  const [touched, setTouched] = useState(false);
  const [tab, setTab] = useState<'edit' | 'calculate'>('edit');
  const [multiplier, setMultiplier] = useState(1);
  const [cloning, setCloning] = useState(false);

  const draftAsRecipe: Recipe = useMemo(
    () => ({
      id: recipe?.id ?? '',
      name: draft.name,
      baseYieldQuantity: draft.baseYieldQuantity,
      baseYieldLabel: draft.baseYieldLabel,
      baseServings: isPositiveNumber(draft.baseServings) ? draft.baseServings : undefined,
      profitPercent: isNonNegativeNumber(draft.profitPercent) ? draft.profitPercent : 0,
      ingredientLines: draft.ingredientLines,
      extraCosts: draft.extraCosts,
      notes: draft.notes,
      createdAt: recipe?.createdAt ?? '',
      updatedAt: recipe?.updatedAt ?? '',
    }),
    [draft, recipe],
  );

  const baseCostResult = useMemo(
    () => calculateRecipeCost(draftAsRecipe, ingredientsById, 1),
    [draftAsRecipe, ingredientsById],
  );

  const scaledCostResult = useMemo(
    () => (recipe ? calculateRecipeCost(recipe, ingredientsById, multiplier) : baseCostResult),
    [recipe, ingredientsById, multiplier, baseCostResult],
  );

  const errors = {
    name: !isNonEmptyString(draft.name)
      ? 'Name is required'
      : !isRecipeNameUnique(draft.name, recipes, recipe?.id)
        ? 'A recipe with this name already exists'
        : undefined,
    baseYieldQuantity: isPositiveNumber(draft.baseYieldQuantity)
      ? undefined
      : 'Enter a yield greater than 0',
    baseServings:
      Number.isNaN(draft.baseServings) || isPositiveNumber(draft.baseServings)
        ? undefined
        : 'Enter a value greater than 0, or leave blank',
    profitPercent:
      Number.isNaN(draft.profitPercent) || isNonNegativeNumber(draft.profitPercent)
        ? undefined
        : 'Enter 0 or a positive percentage',
  };
  const hasErrors = Object.values(errors).some(Boolean);

  function handleConfirmClone(newName: string) {
    if (!recipe) return;
    const cloned = cloneRecipeWithName(recipe, newName);
    addRecipe(cloned);
    setCloning(false);
    navigate(`/recipes/${cloned.id}`);
  }

  function handleSave() {
    setTouched(true);
    if (hasErrors) return;

    const now = new Date().toISOString();
    const saved: Recipe = {
      id: recipe?.id ?? generateId(),
      name: draft.name.trim(),
      baseYieldQuantity: draft.baseYieldQuantity,
      baseYieldLabel: draft.baseYieldLabel.trim() || 'servings',
      baseServings: isPositiveNumber(draft.baseServings) ? draft.baseServings : undefined,
      profitPercent: isNonNegativeNumber(draft.profitPercent) ? draft.profitPercent : 0,
      ingredientLines: draft.ingredientLines,
      extraCosts: draft.extraCosts,
      notes: draft.notes.trim() || undefined,
      createdAt: recipe?.createdAt ?? now,
      updatedAt: now,
    };

    if (recipe) {
      updateRecipe(saved);
    } else {
      addRecipe(saved);
      navigate(`/recipes/${saved.id}`, { replace: true });
    }
  }

  return (
    <PageContainer>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="min-w-0 truncate text-xl font-semibold text-slate-900">
          {isNew ? 'New recipe' : recipe?.name || 'Recipe'}
        </h1>
        <div className="flex shrink-0 gap-2">
          {recipe && (
            <Button variant="secondary" onClick={() => setCloning(true)}>
              Clone
            </Button>
          )}
          <Button variant="secondary" onClick={() => navigate('/recipes')}>
            Back to recipes
          </Button>
        </div>
      </div>

      <CloneRecipeDialog
        open={cloning}
        sourceRecipe={recipe}
        existingRecipes={recipes}
        onClose={() => setCloning(false)}
        onConfirm={handleConfirmClone}
      />

      <div className="mb-4 flex gap-2 border-b border-slate-200">
        <button
          className={`px-3 py-2 text-sm font-medium ${
            tab === 'edit' ? 'border-b-2 border-rose-600 text-rose-600' : 'text-slate-500'
          }`}
          onClick={() => setTab('edit')}
        >
          Edit
        </button>
        <button
          disabled={!recipe}
          title={!recipe ? 'Save the recipe first' : undefined}
          className={`px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:text-slate-300 ${
            tab === 'calculate' ? 'border-b-2 border-rose-600 text-rose-600' : 'text-slate-500'
          }`}
          onClick={() => recipe && setTab('calculate')}
        >
          Calculate
        </button>
      </div>

      {tab === 'edit' ? (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <TextInput
              label="Recipe name"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              error={touched ? errors.name : undefined}
              placeholder="e.g. Vanilla Sponge Cake"
              className="sm:col-span-1"
            />
            <NumberInput
              label="Base yield quantity"
              value={draft.baseYieldQuantity}
              onValueChange={(v) => setDraft((d) => ({ ...d, baseYieldQuantity: v }))}
              error={touched ? errors.baseYieldQuantity : undefined}
              min={0}
            />
            <TextInput
              label="Yield label"
              value={draft.baseYieldLabel}
              onChange={(e) => setDraft((d) => ({ ...d, baseYieldLabel: e.target.value }))}
              placeholder="e.g. servings, 8-inch round"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <NumberInput
              label="Servings (optional)"
              value={draft.baseServings}
              onValueChange={(v) => setDraft((d) => ({ ...d, baseServings: v }))}
              error={touched ? errors.baseServings : undefined}
              min={0}
              placeholder="e.g. 6"
            />
            <NumberInput
              label="Profit % (optional)"
              value={draft.profitPercent}
              onValueChange={(v) => setDraft((d) => ({ ...d, profitPercent: v }))}
              error={touched ? errors.profitPercent : undefined}
              min={0}
              placeholder="e.g. 30"
            />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-800">Ingredients</h2>
            <RecipeIngredientLineEditor
              lines={draft.ingredientLines}
              ingredients={ingredients}
              onChange={(lines) => setDraft((d) => ({ ...d, ingredientLines: lines }))}
            />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-800">
              Extra costs <span className="font-normal text-slate-400">(optional)</span>
            </h2>
            <ExtraCostEditor
              extraCosts={draft.extraCosts}
              onChange={(extraCosts) => setDraft((d) => ({ ...d, extraCosts }))}
            />
          </div>

          <RecipeCostSummary result={baseCostResult} yieldLabel={draft.baseYieldLabel} />

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => navigate('/recipes')}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save recipe</Button>
          </div>
        </div>
      ) : (
        recipe && (
          <div className="flex flex-col gap-4">
            <RecipeScalePanel
              baseYieldQuantity={recipe.baseYieldQuantity}
              baseYieldLabel={recipe.baseYieldLabel}
              baseServings={recipe.baseServings}
              multiplier={multiplier}
              onMultiplierChange={setMultiplier}
            />
            <ScaledIngredientTable result={scaledCostResult} />
            <RecipeCostSummary result={scaledCostResult} yieldLabel={recipe.baseYieldLabel} />
          </div>
        )
      )}
    </PageContainer>
  );
}
