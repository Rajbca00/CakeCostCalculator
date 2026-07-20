import { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { EmptyState } from '../components/layout/EmptyState';
import { ConfirmDialog } from '../components/layout/ConfirmDialog';
import { DataBackupControls } from '../components/layout/DataBackupControls';
import { Button } from '../components/common/Button';
import { IngredientTable } from '../components/ingredients/IngredientTable';
import { IngredientFormModal } from '../components/ingredients/IngredientFormModal';
import { useAppDataContext, useIngredients, useRecipesUsingIngredient } from '../state/useAppData';
import type { Ingredient } from '../types';

export function IngredientsPage() {
  const ingredients = useIngredients();
  const { addIngredient, updateIngredient, deleteIngredient } = useAppDataContext();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Ingredient | undefined>(undefined);
  const [deleting, setDeleting] = useState(false);

  const usedByRecipes = useRecipesUsingIngredient(pendingDelete?.id ?? '');

  function openAddModal() {
    setEditingIngredient(undefined);
    setModalOpen(true);
  }

  function openEditModal(ingredient: Ingredient) {
    setEditingIngredient(ingredient);
    setModalOpen(true);
  }

  async function handleSave(ingredient: Ingredient) {
    if (editingIngredient) {
      await updateIngredient(ingredient);
    } else {
      await addIngredient(ingredient);
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteIngredient(pendingDelete.id);
      setPendingDelete(undefined);
    } catch {
      // failure toast already shown; keep dialog open so the user can retry
    } finally {
      setDeleting(false);
    }
  }

  return (
    <PageContainer>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Ingredients</h1>
        <div className="flex flex-wrap gap-2">
          <DataBackupControls />
          <Button onClick={openAddModal}>Add ingredient</Button>
        </div>
      </div>

      {ingredients.length === 0 ? (
        <EmptyState
          title="No ingredients yet"
          description="Add the ingredients you buy along with their price and quantity so you can cost out recipes."
          action={<Button onClick={openAddModal}>Add your first ingredient</Button>}
        />
      ) : (
        <IngredientTable
          ingredients={ingredients}
          onEdit={openEditModal}
          onDelete={setPendingDelete}
        />
      )}

      <IngredientFormModal
        open={modalOpen}
        ingredient={editingIngredient}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Delete "${pendingDelete?.name}"?`}
        description={
          usedByRecipes.length > 0 ? (
            <>
              Used in {usedByRecipes.length} recipe{usedByRecipes.length > 1 ? 's' : ''}:{' '}
              {usedByRecipes.map((r) => r.name).join(', ')}. Those recipes will keep the
              reference but show it as a deleted ingredient. Delete anyway?
            </>
          ) : (
            'This cannot be undone.'
          )
        }
        confirmLabel="Delete"
        danger
        confirming={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(undefined)}
      />
    </PageContainer>
  );
}
