import { useEffect, useMemo, useRef, useState } from 'react';
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
import { RecipeGroupFilter } from '../components/scaling/RecipeGroupFilter';
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
import { getGroupNames } from '../lib/recipeGroups';
import {
  isNonEmptyString,
  isNonNegativeNumber,
  isPositiveNumber,
  isRecipeNameUnique,
} from '../lib/validation';
import { cloneRecipeWithName } from '../lib/recipeClone';
import { captureElementAsPng, shareOrDownloadImage } from '../lib/shareImage';
import { formatQuantity } from '../lib/format';
import { useToast } from '../components/layout/Toast';

interface DraftState {
  name: string;
  baseYieldQuantity: number;
  baseYieldLabel: string;
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
  const { showToast } = useToast();

  const [draft, setDraft] = useState<DraftState>(() => draftFromRecipe(recipe));
  const [touched, setTouched] = useState(false);
  const [tab, setTab] = useState<'edit' | 'calculate'>('edit');
  const [multiplier, setMultiplier] = useState(1);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [sharing, setSharing] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const recipeGroupNames = useMemo(() => (recipe ? getGroupNames(recipe) : []), [recipe]);
  const hasMultipleGroups = recipeGroupNames.length > 1;

  useEffect(() => {
    if (recipe) setSelectedGroups(new Set(getGroupNames(recipe)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe?.id]);

  const draftGroupSuggestions = useMemo(() => {
    const seen: string[] = [];
    const add = (name: string | undefined) => {
      const trimmed = name?.trim();
      if (trimmed && !seen.includes(trimmed)) seen.push(trimmed);
    };
    draft.ingredientLines.forEach((l) => add(l.groupName));
    draft.extraCosts.forEach((e) => add(e.groupName));
    return seen;
  }, [draft.ingredientLines, draft.extraCosts]);

  const draftAsRecipe: Recipe = useMemo(
    () => ({
      id: recipe?.id ?? '',
      name: draft.name,
      baseYieldQuantity: draft.baseYieldQuantity,
      baseYieldLabel: draft.baseYieldLabel,
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
    () =>
      recipe
        ? calculateRecipeCost(
            recipe,
            ingredientsById,
            multiplier,
            hasMultipleGroups ? selectedGroups : undefined,
          )
        : baseCostResult,
    [recipe, ingredientsById, multiplier, hasMultipleGroups, selectedGroups, baseCostResult],
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
    profitPercent:
      Number.isNaN(draft.profitPercent) || isNonNegativeNumber(draft.profitPercent)
        ? undefined
        : 'Enter 0 or a positive percentage',
  };
  const hasErrors = Object.values(errors).some(Boolean);

  async function handleShareImage() {
    if (!shareRef.current || !recipe) return;
    setSharing(true);
    try {
      const blob = await captureElementAsPng(shareRef.current);
      const filename = `${recipe.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`;
      const result = await shareOrDownloadImage(blob, filename, recipe.name);
      if (result === 'downloaded') showToast('Image downloaded', 'success');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // user cancelled the native share sheet — not an error
      } else {
        showToast('Could not create the image. Please try again.', 'error');
      }
    } finally {
      setSharing(false);
    }
  }

  async function handleConfirmClone(newName: string) {
    if (!recipe) return;
    const cloned = cloneRecipeWithName(recipe, newName);
    setCloning(true);
    try {
      await addRecipe(cloned, `Cloned as "${cloned.name}"`);
      setCloneDialogOpen(false);
      navigate(`/recipes/${cloned.id}`);
    } catch {
      // failure toast already shown; keep dialog open so the user can retry
    } finally {
      setCloning(false);
    }
  }

  async function handleSave() {
    setTouched(true);
    if (hasErrors || saving) return;

    const now = new Date().toISOString();
    const saved: Recipe = {
      id: recipe?.id ?? generateId(),
      name: draft.name.trim(),
      baseYieldQuantity: draft.baseYieldQuantity,
      baseYieldLabel: draft.baseYieldLabel.trim() || 'servings',
      profitPercent: isNonNegativeNumber(draft.profitPercent) ? draft.profitPercent : 0,
      ingredientLines: draft.ingredientLines,
      extraCosts: draft.extraCosts,
      notes: draft.notes.trim() || undefined,
      createdAt: recipe?.createdAt ?? now,
      updatedAt: now,
    };

    setSaving(true);
    try {
      if (recipe) {
        await updateRecipe(saved);
      } else {
        await addRecipe(saved);
        navigate(`/recipes/${saved.id}`, { replace: true });
      }
    } catch {
      // failure toast already shown by the context
    } finally {
      setSaving(false);
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
            <Button variant="secondary" onClick={() => setCloneDialogOpen(true)}>
              Clone
            </Button>
          )}
          <Button variant="secondary" onClick={() => navigate('/recipes')}>
            Back to recipes
          </Button>
        </div>
      </div>

      <CloneRecipeDialog
        open={cloneDialogOpen}
        sourceRecipe={recipe}
        existingRecipes={recipes}
        confirming={cloning}
        onClose={() => setCloneDialogOpen(false)}
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
              label="Profit % (optional)"
              value={draft.profitPercent}
              onValueChange={(v) => setDraft((d) => ({ ...d, profitPercent: v }))}
              error={touched ? errors.profitPercent : undefined}
              min={0}
              placeholder="e.g. 30"
            />
          </div>

          <datalist id="recipe-group-suggestions">
            {draftGroupSuggestions.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-800">
              Ingredients{' '}
              <span className="font-normal text-slate-400">
                (optionally group with a name, e.g. "Base cake", "Icing 1")
              </span>
            </h2>
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
            <Button variant="secondary" onClick={() => navigate('/recipes')} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Save recipe
            </Button>
          </div>
        </div>
      ) : (
        recipe && (
          <div className="flex flex-col gap-4">
            {hasMultipleGroups && (
              <RecipeGroupFilter
                groups={recipeGroupNames}
                selectedGroups={selectedGroups}
                onChange={setSelectedGroups}
              />
            )}
            <RecipeScalePanel
              baseYieldQuantity={recipe.baseYieldQuantity}
              baseYieldLabel={recipe.baseYieldLabel}
              multiplier={multiplier}
              onMultiplierChange={setMultiplier}
            />

            <div className="flex justify-end">
              <Button variant="secondary" onClick={handleShareImage} loading={sharing}>
                Share as image
              </Button>
            </div>

            <div ref={shareRef} className="flex flex-col gap-4 bg-white p-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{recipe.name}</h3>
                <p className="text-sm text-slate-500">
                  {formatQuantity(scaledCostResult.yieldQuantity)} {recipe.baseYieldLabel}
                  {hasMultipleGroups && selectedGroups.size < recipeGroupNames.length && (
                    <> · Includes: {Array.from(selectedGroups).join(', ')}</>
                  )}
                </p>
              </div>
              <ScaledIngredientTable result={scaledCostResult} showGroupColumn={hasMultipleGroups} />
              <RecipeCostSummary result={scaledCostResult} yieldLabel={recipe.baseYieldLabel} />
            </div>
          </div>
        )
      )}
    </PageContainer>
  );
}
