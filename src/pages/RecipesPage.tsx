import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { EmptyState } from '../components/layout/EmptyState';
import { ConfirmDialog } from '../components/layout/ConfirmDialog';
import { Button } from '../components/common/Button';
import { RecipeList } from '../components/recipes/RecipeList';
import { useAppDataContext, useRecipes } from '../state/useAppData';
import type { Recipe } from '../types';

export function RecipesPage() {
  const recipes = useRecipes();
  const { deleteRecipe } = useAppDataContext();
  const [pendingDelete, setPendingDelete] = useState<Recipe | undefined>(undefined);
  const navigate = useNavigate();

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
        <RecipeList recipes={recipes} onDelete={setPendingDelete} />
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Delete "${pendingDelete?.name}"?`}
        description="This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (pendingDelete) deleteRecipe(pendingDelete.id);
          setPendingDelete(undefined);
        }}
        onCancel={() => setPendingDelete(undefined)}
      />
    </PageContainer>
  );
}
