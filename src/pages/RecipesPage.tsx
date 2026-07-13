import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { EmptyState } from '../components/layout/EmptyState';
import { ConfirmDialog } from '../components/layout/ConfirmDialog';
import { Button } from '../components/common/Button';
import { RecipeList } from '../components/recipes/RecipeList';
import { CloneRecipeDialog } from '../components/recipes/CloneRecipeDialog';
import { useAppDataContext, useRecipes } from '../state/useAppData';
import type { Recipe } from '../types';
import { cloneRecipeWithName } from '../lib/recipeClone';

export function RecipesPage() {
  const recipes = useRecipes();
  const { addRecipe, deleteRecipe } = useAppDataContext();
  const [pendingDelete, setPendingDelete] = useState<Recipe | undefined>(undefined);
  const [cloningRecipe, setCloningRecipe] = useState<Recipe | undefined>(undefined);
  const [deleting, setDeleting] = useState(false);
  const [cloning, setCloning] = useState(false);
  const navigate = useNavigate();

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
        <RecipeList recipes={recipes} onClone={setCloningRecipe} onDelete={setPendingDelete} />
      )}

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
