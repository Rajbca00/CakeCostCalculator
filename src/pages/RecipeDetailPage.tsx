import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/common/Button';
import { TextInput } from '../components/common/TextInput';
import { NumberInput } from '../components/common/NumberInput';
import { RecipeIngredientLineEditor } from '../components/recipes/RecipeIngredientLineEditor';
import { ExtraCostEditor } from '../components/recipes/ExtraCostEditor';
import { RecipeCostSummary } from '../components/recipes/RecipeCostSummary';
import { RecipeCostBreakdown } from '../components/recipes/RecipeCostBreakdown';
import { RecipeVersionHistory } from '../components/recipes/RecipeVersionHistory';
import { CloneRecipeDialog } from '../components/recipes/CloneRecipeDialog';
import { RenameRecipeDialog } from '../components/recipes/RenameRecipeDialog';
import { Select } from '../components/common/Select';
import { RecipeScalePanel } from '../components/scaling/RecipeScalePanel';
import { RecipeGroupFilter } from '../components/scaling/RecipeGroupFilter';
import { ScaledIngredientTable } from '../components/scaling/ScaledIngredientTable';
import { Link } from 'react-router-dom';
import {
  useAppDataContext,
  useIngredients,
  useIngredientsById,
  useRecipeById,
  useRecipes,
  useRecipesById,
  useRecipeVersions,
  useSettings,
} from '../state/useAppData';
import {
  RECIPE_CATEGORIES,
  RECIPE_STATUSES,
  type ExtraCost,
  type Recipe,
  type RecipeCategory,
  type RecipeIngredientLine,
  type RecipeStatus,
} from '../types';
import { generateId } from '../lib/id';
import { calculateRecipeCost } from '../lib/costCalculations';
import { getGroupNames } from '../lib/recipeGroups';
import { getEffectiveRecipe, wouldCreateCycle } from '../lib/recipeHierarchy';
import {
  isNonEmptyString,
  isNonNegativeNumber,
  isPositiveNumber,
  isRecipeNameUnique,
} from '../lib/validation';
import { cloneRecipeWithName } from '../lib/recipeClone';
import { captureElementAsPng, shareOrDownloadImage } from '../lib/shareImage';
import { formatCurrency, formatQuantity } from '../lib/format';
import { useToast } from '../components/layout/Toast';

interface DraftState {
  name: string;
  baseYieldQuantity: number;
  baseYieldLabel: string;
  profitPercent: number;
  ingredientLines: RecipeIngredientLine[];
  extraCosts: ExtraCost[];
  notes: string;
  category: RecipeCategory | '';
  activeTimeMinutes: number;
  bakeTimeMinutes: number;
  ovenPowerWatts: number;
  wastagePercentOverride: number;
  parentRecipeId: string;
  status: RecipeStatus;
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
    category: recipe?.category ?? '',
    activeTimeMinutes: recipe?.activeTimeMinutes ?? NaN,
    bakeTimeMinutes: recipe?.bakeTimeMinutes ?? NaN,
    ovenPowerWatts: recipe?.ovenPowerWatts ?? NaN,
    wastagePercentOverride: recipe?.wastagePercentOverride ?? NaN,
    parentRecipeId: recipe?.parentRecipeId ?? '',
    status: recipe?.status ?? 'Draft',
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
  const recipesById = useRecipesById();
  const recipeVersions = useRecipeVersions(recipe?.id);
  const settings = useSettings();
  const { addRecipe, updateRecipe, addRecipeVersion } = useAppDataContext();
  const { showToast } = useToast();

  const [draft, setDraft] = useState<DraftState>(() => draftFromRecipe(recipe));
  const [touched, setTouched] = useState(false);
  const [tab, setTab] = useState<'edit' | 'calculate'>('edit');
  const [multiplier, setMultiplier] = useState(1);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingVersion, setSavingVersion] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [sharing, setSharing] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const effectiveRecipe = useMemo(
    () => (recipe ? getEffectiveRecipe(recipe, recipesById) : undefined),
    [recipe, recipesById],
  );
  const recipeGroupNames = useMemo(
    () => (effectiveRecipe ? getGroupNames(effectiveRecipe) : []),
    [effectiveRecipe],
  );
  const hasMultipleGroups = recipeGroupNames.length > 1;

  useEffect(() => {
    if (effectiveRecipe) setSelectedGroups(new Set(getGroupNames(effectiveRecipe)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe?.id]);

  const parentRecipe = draft.parentRecipeId ? recipesById.get(draft.parentRecipeId) : undefined;
  const parentCostResult = useMemo(
    () =>
      parentRecipe
        ? calculateRecipeCost(
            getEffectiveRecipe(parentRecipe, recipesById),
            ingredientsById,
            1,
            undefined,
            0,
            settings,
          )
        : undefined,
    [parentRecipe, recipesById, ingredientsById, settings],
  );
  const parentOptions = useMemo(
    () =>
      recipes.filter(
        (r) => !recipe || (r.id !== recipe.id && !wouldCreateCycle(recipe.id, r.id, recipesById)),
      ),
    [recipes, recipe, recipesById],
  );

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
      category: draft.category || undefined,
      activeTimeMinutes: isNonNegativeNumber(draft.activeTimeMinutes)
        ? draft.activeTimeMinutes
        : undefined,
      bakeTimeMinutes: isNonNegativeNumber(draft.bakeTimeMinutes) ? draft.bakeTimeMinutes : undefined,
      ovenPowerWatts: isNonNegativeNumber(draft.ovenPowerWatts) ? draft.ovenPowerWatts : undefined,
      wastagePercentOverride: isNonNegativeNumber(draft.wastagePercentOverride)
        ? draft.wastagePercentOverride
        : undefined,
      parentRecipeId: draft.parentRecipeId || undefined,
      status: draft.status,
      createdAt: recipe?.createdAt ?? '',
      updatedAt: recipe?.updatedAt ?? '',
    }),
    [draft, recipe],
  );

  const baseCostResult = useMemo(
    () =>
      calculateRecipeCost(
        getEffectiveRecipe(draftAsRecipe, recipesById),
        ingredientsById,
        1,
        undefined,
        0,
        settings,
      ),
    [draftAsRecipe, recipesById, ingredientsById, settings],
  );

  const scaledCostResult = useMemo(
    () =>
      effectiveRecipe
        ? calculateRecipeCost(
            effectiveRecipe,
            ingredientsById,
            multiplier,
            hasMultipleGroups ? selectedGroups : undefined,
            discountPercent,
            settings,
          )
        : baseCostResult,
    [
      effectiveRecipe,
      ingredientsById,
      multiplier,
      hasMultipleGroups,
      selectedGroups,
      discountPercent,
      settings,
      baseCostResult,
    ],
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

  async function handleConfirmRename(newName: string) {
    if (!recipe) return;
    const updated: Recipe = { ...recipe, name: newName, updatedAt: new Date().toISOString() };
    setRenaming(true);
    try {
      await updateRecipe(updated);
      setDraft((d) => ({ ...d, name: newName }));
      setRenameDialogOpen(false);
    } catch {
      // failure toast already shown; keep dialog open so the user can retry
    } finally {
      setRenaming(false);
    }
  }

  function buildSavedRecipe(): Recipe {
    const now = new Date().toISOString();
    return {
      id: recipe?.id ?? generateId(),
      name: draft.name.trim(),
      baseYieldQuantity: draft.baseYieldQuantity,
      baseYieldLabel: draft.baseYieldLabel.trim() || 'servings',
      profitPercent: isNonNegativeNumber(draft.profitPercent) ? draft.profitPercent : 0,
      ingredientLines: draft.ingredientLines,
      extraCosts: draft.extraCosts,
      notes: draft.notes.trim() || undefined,
      category: draft.category || undefined,
      activeTimeMinutes: isNonNegativeNumber(draft.activeTimeMinutes)
        ? draft.activeTimeMinutes
        : undefined,
      bakeTimeMinutes: isNonNegativeNumber(draft.bakeTimeMinutes) ? draft.bakeTimeMinutes : undefined,
      ovenPowerWatts: isNonNegativeNumber(draft.ovenPowerWatts) ? draft.ovenPowerWatts : undefined,
      wastagePercentOverride: isNonNegativeNumber(draft.wastagePercentOverride)
        ? draft.wastagePercentOverride
        : undefined,
      parentRecipeId: draft.parentRecipeId || undefined,
      status: draft.status,
      createdAt: recipe?.createdAt ?? now,
      updatedAt: now,
    };
  }

  async function handleSave() {
    setTouched(true);
    if (hasErrors || saving) return;

    const saved = buildSavedRecipe();
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

  async function handleSaveNewVersion() {
    setTouched(true);
    if (hasErrors || savingVersion || !recipe) return;

    const saved = buildSavedRecipe();
    setSavingVersion(true);
    try {
      await updateRecipe(saved);
      await addRecipeVersion({
        id: generateId(),
        recipeId: saved.id,
        versionNumber: recipeVersions.length + 1,
        status: saved.status ?? 'Draft',
        name: saved.name,
        baseYieldQuantity: saved.baseYieldQuantity,
        baseYieldLabel: saved.baseYieldLabel,
        profitPercent: saved.profitPercent,
        ingredientLines: saved.ingredientLines,
        extraCosts: saved.extraCosts,
        notes: saved.notes,
        category: saved.category,
        parentRecipeId: saved.parentRecipeId,
        activeTimeMinutes: saved.activeTimeMinutes,
        bakeTimeMinutes: saved.bakeTimeMinutes,
        ovenPowerWatts: saved.ovenPowerWatts,
        wastagePercentOverride: saved.wastagePercentOverride,
        createdAt: new Date().toISOString(),
      });
      showToast(`Saved as v${recipeVersions.length + 1}`, 'success');
    } catch {
      // failure toast already shown by the context
    } finally {
      setSavingVersion(false);
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
            <>
              <Button variant="secondary" onClick={() => setRenameDialogOpen(true)}>
                Rename
              </Button>
              <Button variant="secondary" onClick={() => setCloneDialogOpen(true)}>
                Clone
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={() => navigate('/recipes')}>
            Back to recipes
          </Button>
        </div>
      </div>

      <RenameRecipeDialog
        open={renameDialogOpen}
        recipe={recipe}
        existingRecipes={recipes}
        confirming={renaming}
        onClose={() => setRenameDialogOpen(false)}
        onConfirm={handleConfirmRename}
      />

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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <NumberInput
              label="Profit % (optional)"
              value={draft.profitPercent}
              onValueChange={(v) => setDraft((d) => ({ ...d, profitPercent: v }))}
              error={touched ? errors.profitPercent : undefined}
              min={0}
              placeholder="e.g. 30"
            />
            <Select
              label="Category (optional)"
              value={draft.category}
              onChange={(e) =>
                setDraft((d) => ({ ...d, category: e.target.value as RecipeCategory | '' }))
              }
            >
              <option value="">No category</option>
              {RECIPE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
            <Select
              label="Parent recipe (optional)"
              value={draft.parentRecipeId}
              onChange={(e) => setDraft((d) => ({ ...d, parentRecipeId: e.target.value }))}
            >
              <option value="">No parent -- standalone recipe</option>
              {parentOptions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
            <Select
              label="Status"
              value={draft.status}
              onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as RecipeStatus }))}
            >
              {RECIPE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>

          {parentRecipe && parentCostResult && (
            <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Inherits{' '}
              <Link to={`/recipes/${parentRecipe.id}`} className="text-rose-600 hover:underline">
                {parentRecipe.name}
              </Link>
              's {parentRecipe.ingredientLines.length} ingredient line
              {parentRecipe.ingredientLines.length === 1 ? '' : 's'} (
              {formatCurrency(parentCostResult.total)} inherited cost) -- editing that recipe
              updates this one automatically.
            </p>
          )}

          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-800">
              Labour &amp; electricity{' '}
              <span className="font-normal text-slate-400">
                (optional -- uses rates from Settings)
              </span>
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <NumberInput
                label="Active time (min)"
                value={draft.activeTimeMinutes}
                onValueChange={(v) => setDraft((d) => ({ ...d, activeTimeMinutes: v }))}
                min={0}
                placeholder="e.g. 25"
              />
              <NumberInput
                label="Bake time (min)"
                value={draft.bakeTimeMinutes}
                onValueChange={(v) => setDraft((d) => ({ ...d, bakeTimeMinutes: v }))}
                min={0}
                placeholder="e.g. 40"
              />
              <NumberInput
                label="Oven power override (W)"
                value={draft.ovenPowerWatts}
                onValueChange={(v) => setDraft((d) => ({ ...d, ovenPowerWatts: v }))}
                min={0}
                placeholder={`Default ${settings.ovenPowerWatts}`}
              />
              <NumberInput
                label="Wastage % override"
                value={draft.wastagePercentOverride}
                onValueChange={(v) => setDraft((d) => ({ ...d, wastagePercentOverride: v }))}
                min={0}
                placeholder={`Default ${settings.wastagePercent}`}
              />
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-800">
              Ingredients{' '}
              <span className="font-normal text-slate-400">
                (optionally assign a group, e.g. "Base cake", "Icing 1")
              </span>
            </h2>
            <RecipeIngredientLineEditor
              lines={draft.ingredientLines}
              ingredients={ingredients}
              groupOptions={draftGroupSuggestions}
              onChange={(lines) => setDraft((d) => ({ ...d, ingredientLines: lines }))}
            />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-800">
              Extra costs <span className="font-normal text-slate-400">(optional)</span>
            </h2>
            <ExtraCostEditor
              extraCosts={draft.extraCosts}
              groupOptions={draftGroupSuggestions}
              onChange={(extraCosts) => setDraft((d) => ({ ...d, extraCosts }))}
            />
          </div>

          <RecipeCostSummary result={baseCostResult} yieldLabel={draft.baseYieldLabel} />
          <RecipeCostBreakdown result={baseCostResult} />

          {recipe && (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-slate-800">Versions</h2>
              <RecipeVersionHistory versions={recipeVersions} currentStatus={draft.status} />
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={() => navigate('/recipes')} disabled={saving}>
              Cancel
            </Button>
            {recipe && (
              <Button
                variant="secondary"
                onClick={handleSaveNewVersion}
                loading={savingVersion}
                disabled={saving}
                title="Save the recipe and checkpoint this state as a new version"
              >
                Save new version
              </Button>
            )}
            <Button onClick={handleSave} loading={saving} disabled={savingVersion}>
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

            <div className="flex flex-wrap items-end gap-4 rounded-lg border border-slate-200 p-4">
              <NumberInput
                label="Discount % (optional)"
                value={discountPercent}
                onValueChange={(v) => {
                  if (!Number.isFinite(v) || v < 0) return;
                  setDiscountPercent(Math.min(100, v));
                }}
                min={0}
                className="w-32"
                placeholder="e.g. 10"
              />
            </div>

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
              <ScaledIngredientTable result={scaledCostResult} groupBy={hasMultipleGroups} />
              <RecipeCostSummary result={scaledCostResult} yieldLabel={recipe.baseYieldLabel} />
              <RecipeCostBreakdown result={scaledCostResult} />
            </div>
          </div>
        )
      )}
    </PageContainer>
  );
}
