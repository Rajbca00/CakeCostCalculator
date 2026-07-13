import { useRef, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { EmptyState } from '../components/layout/EmptyState';
import { ConfirmDialog } from '../components/layout/ConfirmDialog';
import { Button } from '../components/common/Button';
import { IngredientTable } from '../components/ingredients/IngredientTable';
import { IngredientFormModal } from '../components/ingredients/IngredientFormModal';
import { useAppDataContext, useIngredients, useRecipesUsingIngredient } from '../state/useAppData';
import type { Ingredient } from '../types';
import { exportAppData, parseImportedAppData } from '../lib/exportImport';
import { useToast } from '../components/layout/Toast';

export function IngredientsPage() {
  const ingredients = useIngredients();
  const { addIngredient, updateIngredient, deleteIngredient, replaceAllData, getSnapshot } =
    useAppDataContext();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Ingredient | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const usedByRecipes = useRecipesUsingIngredient(pendingDelete?.id ?? '');

  function openAddModal() {
    setEditingIngredient(undefined);
    setModalOpen(true);
  }

  function openEditModal(ingredient: Ingredient) {
    setEditingIngredient(ingredient);
    setModalOpen(true);
  }

  function handleSave(ingredient: Ingredient) {
    if (editingIngredient) {
      updateIngredient(ingredient);
    } else {
      addIngredient(ingredient);
    }
  }

  function handleConfirmDelete() {
    if (pendingDelete) {
      deleteIngredient(pendingDelete.id);
      setPendingDelete(undefined);
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const result = parseImportedAppData(String(reader.result));
      if (!result.success || !result.data) {
        showToast(result.error ?? 'Import failed.', 'error');
        return;
      }
      const current = getSnapshot();
      const confirmed = window.confirm(
        `This will replace ${current.ingredients.length} ingredients and ${current.recipes.length} recipes with ${result.data.ingredients.length} ingredients and ${result.data.recipes.length} recipes from the file. Continue?`,
      );
      if (!confirmed) return;
      try {
        await replaceAllData(result.data);
        showToast('Data imported successfully.', 'success');
      } catch {
        showToast('Import failed while saving to the server. Please try again.', 'error');
      }
    };
    reader.readAsText(file);
  }

  return (
    <PageContainer>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Ingredients</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => exportAppData(getSnapshot())}>
            Export
          </Button>
          <Button variant="secondary" onClick={handleImportClick}>
            Import
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImportFile}
          />
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
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(undefined)}
      />
    </PageContainer>
  );
}
