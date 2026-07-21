import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { EmptyState } from '../components/layout/EmptyState';
import { ConfirmDialog } from '../components/layout/ConfirmDialog';
import { Button } from '../components/common/Button';
import { RecipeList } from '../components/recipes/RecipeList';
import { CloneRecipeDialog } from '../components/recipes/CloneRecipeDialog';
import { RenameRecipeDialog } from '../components/recipes/RenameRecipeDialog';
import { useAppDataContext, useRecipes } from '../state/useAppData';
import { RECIPE_CATEGORIES, type Recipe } from '../types';
import { cloneRecipeWithName } from '../lib/recipeClone';

const UNCATEGORIZED = 'Uncategorized';

export function RecipesPage() {
  const recipes = useRecipes();
  const { addRecipe, updateRecipe, deleteRecipe } = useAppDataContext();
  const [pendingDelete, setPendingDelete] = useState<Recipe | undefined>(undefined);
  const [cloningRecipe, setCloningRecipe] = useState<Recipe | undefined>(undefined);
  const [renamingRecipe, setRenamingRecipe] = useState<Recipe | undefined>(undefined);
  const [deleting, setDeleting] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const groupedByCategory = useMemo(() => {
    const map = new Map<string, Recipe[]>();
    recipes.forEach((r) => {
      const key = r.category ?? UNCATEGORIZED;
      const arr = map.get(key) ?? [];
      arr.push(r);
      map.set(key, arr);
    });
    return map;
  }, [recipes]);

  const categoryOrder = [...RECIPE_CATEGORIES, UNCATEGORIZED].filter((c) =>
    groupedByCategory.has(c),
  );

  function toggleCategory(category: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  async function handleConfirmClone(newName: string) {
    if (!cloningRecipe) return;
    const cloned = cloneRecipeWithName(cloningRecipe, newName);
    setCloning(true);
    try {
      await addRecipe(cloned, `Cloned as "${cloned.name}"`);
      setCloningRecipe(undefined);
      navigate(`/recipes/${cloned.id}`);
    } catch {
      // failure toast already shown; keep dialog open so the user can retry
    } finally {
      setCloning(false);
    }
  }

  async function handleConfirmRename(newName: string) {
    if (!renamingRecipe) return;
    const updated: Recipe = {
      ...renamingRecipe,
      name: newName,
      updatedAt: new Date().toISOString(),
    };
    setRenaming(true);
    try {
      await updateRecipe(updated);
      setRenamingRecipe(undefined);
    } catch {
      // failure toast already shown; keep dialog open so the user can retry
    } finally {
      setRenaming(false);
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteRecipe(pendingDelete.id);
      setPendingDelete(undefined);
    } catch {
      // failure toast already shown; keep dialog open so the user can retry
    } finally {
      setDeleting(false);
    }
  }

  return (
    <PageContainer>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">Recipes</h1>
        <Button onClick={() => navigate('/recipes/new')}>Add recipe</Button>
      </div>

      {recipes.length === 0 ? (
        <EmptyState
          title="No cake recipes yet"
          description="Create a recipe and add ingredient lines to see its total cost."
          action={<Button onClick={() => navigate('/recipes/new')}>Add your first recipe</Button>}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {categoryOrder.map((category) => {
            const categoryRecipes = groupedByCategory.get(category)!;
            const expanded = expandedCategories.has(category);
            return (
              <div key={category} className="rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
                >
                  <span className="text-sm font-semibold text-slate-800">
                    {category}{' '}
                    <span className="font-normal text-slate-400">({categoryRecipes.length})</span>
                  </span>
                  <span className="text-slate-400">{expanded ? '▲' : '▼'}</span>
                </button>
                {expanded && (
                  <div className="border-t border-slate-200 p-3">
                    <RecipeList
                      recipes={categoryRecipes}
                      onRename={setRenamingRecipe}
                      onClone={setCloningRecipe}
                      onDelete={setPendingDelete}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <RenameRecipeDialog
        open={!!renamingRecipe}
        recipe={renamingRecipe}
        existingRecipes={recipes}
        confirming={renaming}
        onClose={() => setRenamingRecipe(undefined)}
        onConfirm={handleConfirmRename}
      />

      <CloneRecipeDialog
        open={!!cloningRecipe}
        sourceRecipe={cloningRecipe}
        existingRecipes={recipes}
        confirming={cloning}
        onClose={() => setCloningRecipe(undefined)}
        onConfirm={handleConfirmClone}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Delete "${pendingDelete?.name}"?`}
        description="This cannot be undone."
        confirmLabel="Delete"
        danger
        confirming={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(undefined)}
      />
    </PageContainer>
  );
}
