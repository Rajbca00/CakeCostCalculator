import { useEffect, useState } from 'react';
import type { Recipe } from '../../types';
import { Modal } from '../layout/Modal';
import { TextInput } from '../common/TextInput';
import { Button } from '../common/Button';
import { isNonEmptyString, isRecipeNameUnique } from '../../lib/validation';
import { generateUniqueCloneName } from '../../lib/recipeClone';

interface CloneRecipeDialogProps {
  open: boolean;
  sourceRecipe: Recipe | undefined;
  existingRecipes: Recipe[];
  onClose: () => void;
  onConfirm: (newName: string) => void;
}

export function CloneRecipeDialog({
  open,
  sourceRecipe,
  existingRecipes,
  onClose,
  onConfirm,
}: CloneRecipeDialogProps) {
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open && sourceRecipe) {
      setName(generateUniqueCloneName(sourceRecipe.name, existingRecipes));
      setTouched(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sourceRecipe?.id]);

  if (!open || !sourceRecipe) return null;

  const error = !isNonEmptyString(name)
    ? 'Name is required'
    : !isRecipeNameUnique(name, existingRecipes)
      ? 'A recipe with this name already exists'
      : undefined;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (error) return;
    onConfirm(name.trim());
  }

  return (
    <Modal open={open} title={`Clone "${sourceRecipe.name}"`} onClose={onClose}>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <TextInput
          label="New recipe name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={touched ? error : undefined}
          autoFocus
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Clone recipe</Button>
        </div>
      </form>
    </Modal>
  );
}
