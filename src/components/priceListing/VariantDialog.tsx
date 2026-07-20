import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Modal } from '../layout/Modal';
import { Select } from '../common/Select';
import { TextInput } from '../common/TextInput';
import { Button } from '../common/Button';
import { RecipeGroupFilter } from '../scaling/RecipeGroupFilter';
import { RecipeScalePanel } from '../scaling/RecipeScalePanel';
import { getGroupNames } from '../../lib/recipeGroups';
import { suggestVariantName } from '../../lib/priceListing';
import { isNonEmptyString, isPositiveNumber } from '../../lib/validation';
import type { PriceListingVariant, Recipe } from '../../types';

export interface VariantDialogInput {
  recipeId: string;
  name: string;
  groupNames: string[];
  multiplier: number;
}

interface VariantDialogProps {
  open: boolean;
  recipes: Recipe[];
  editingVariant?: PriceListingVariant;
  confirming?: boolean;
  onClose: () => void;
  onConfirm: (input: VariantDialogInput) => void;
}

export function VariantDialog({
  open,
  recipes,
  editingVariant,
  confirming = false,
  onClose,
  onConfirm,
}: VariantDialogProps) {
  const [recipeId, setRecipeId] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [multiplier, setMultiplier] = useState(1);
  const [name, setName] = useState('');
  const [nameEdited, setNameEdited] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editingVariant) {
      setRecipeId(editingVariant.recipeId);
      setSelectedGroups(new Set(editingVariant.groupNames));
      setMultiplier(editingVariant.multiplier);
      setName(editingVariant.name);
      setNameEdited(true);
    } else {
      setRecipeId(recipes[0]?.id ?? '');
      setMultiplier(1);
      setNameEdited(false);
    }
    setTouched(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingVariant?.id]);

  const recipe = useMemo(() => recipes.find((r) => r.id === recipeId), [recipes, recipeId]);
  const groupNames = useMemo(() => (recipe ? getGroupNames(recipe) : []), [recipe]);

  useEffect(() => {
    // Only reset groups/yield when the user actively switches recipes, not on initial open for edit.
    if (!open || recipeId === editingVariant?.recipeId) return;
    const r = recipes.find((rr) => rr.id === recipeId);
    setSelectedGroups(new Set(r ? getGroupNames(r) : []));
    setMultiplier(1);
    setNameEdited(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId]);

  useEffect(() => {
    if (nameEdited) return;
    if (!recipe || selectedGroups.size === 0) {
      setName('');
      return;
    }
    setName(suggestVariantName(recipe, groupNames.filter((g) => selectedGroups.has(g))));
  }, [recipe, groupNames, selectedGroups, nameEdited]);

  if (!open) return null;

  const errors = {
    recipe: recipe ? undefined : 'Choose a recipe',
    groups: selectedGroups.size > 0 ? undefined : 'Select at least one group',
    name: isNonEmptyString(name) ? undefined : 'Name is required',
    multiplier: isPositiveNumber(multiplier) ? undefined : 'Enter a yield greater than 0',
  };
  const hasErrors = Object.values(errors).some(Boolean);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (hasErrors || confirming || !recipe) return;
    onConfirm({
      recipeId: recipe.id,
      name: name.trim(),
      groupNames: groupNames.filter((g) => selectedGroups.has(g)),
      multiplier,
    });
  }

  return (
    <Modal
      open={open}
      title={editingVariant ? 'Edit menu item' : 'Add menu item'}
      onClose={onClose}
    >
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <Select
          label="Recipe"
          value={recipeId}
          onChange={(e) => setRecipeId(e.target.value)}
          error={touched ? errors.recipe : undefined}
        >
          <option value="" disabled>
            Choose a recipe
          </option>
          {recipes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>

        {recipe && groupNames.length > 1 && (
          <div>
            <RecipeGroupFilter
              groups={groupNames}
              selectedGroups={selectedGroups}
              onChange={setSelectedGroups}
            />
            {touched && errors.groups && (
              <p className="mt-1 text-xs text-red-600">{errors.groups}</p>
            )}
          </div>
        )}

        {recipe && (
          <RecipeScalePanel
            baseYieldQuantity={recipe.baseYieldQuantity}
            baseYieldLabel={recipe.baseYieldLabel}
            multiplier={multiplier}
            onMultiplierChange={setMultiplier}
          />
        )}
        {touched && errors.multiplier && (
          <p className="-mt-2 text-xs text-red-600">{errors.multiplier}</p>
        )}

        <TextInput
          label="Menu name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setNameEdited(true);
          }}
          error={touched ? errors.name : undefined}
        />

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={confirming}>
            Cancel
          </Button>
          <Button type="submit" loading={confirming}>
            {editingVariant ? 'Save changes' : 'Add to menu'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
