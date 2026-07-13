import { useState } from 'react';
import type { Ingredient, Unit } from '../../types';
import { Modal } from '../layout/Modal';
import { TextInput } from '../common/TextInput';
import { NumberInput } from '../common/NumberInput';
import { MoneyInput } from '../common/MoneyInput';
import { AnyUnitSelect } from '../common/UnitSelect';
import { Button } from '../common/Button';
import { generateId } from '../../lib/id';
import { isNonEmptyString, isNonNegativeNumber, isPositiveNumber } from '../../lib/validation';

interface IngredientFormModalProps {
  open: boolean;
  ingredient?: Ingredient;
  onClose: () => void;
  onSave: (ingredient: Ingredient) => void;
}

interface FormState {
  name: string;
  purchaseCost: number;
  purchaseQuantity: number;
  purchaseUnit: Unit;
  notes: string;
}

function initialFormState(ingredient?: Ingredient): FormState {
  return {
    name: ingredient?.name ?? '',
    purchaseCost: ingredient?.purchaseCost ?? NaN,
    purchaseQuantity: ingredient?.purchaseQuantity ?? NaN,
    purchaseUnit: ingredient?.purchaseUnit ?? 'g',
    notes: ingredient?.notes ?? '',
  };
}

export function IngredientFormModal({
  open,
  ingredient,
  onClose,
  onSave,
}: IngredientFormModalProps) {
  const [form, setForm] = useState<FormState>(() => initialFormState(ingredient));
  const [touched, setTouched] = useState(false);

  if (!open) return null;

  const errors = {
    name: isNonEmptyString(form.name) ? undefined : 'Name is required',
    purchaseCost: isNonNegativeNumber(form.purchaseCost) ? undefined : 'Enter a valid cost',
    purchaseQuantity: isPositiveNumber(form.purchaseQuantity)
      ? undefined
      : 'Enter a quantity greater than 0',
  };
  const hasErrors = Object.values(errors).some(Boolean);

  function handleClose() {
    setForm(initialFormState(ingredient));
    setTouched(false);
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (hasErrors) return;

    const now = new Date().toISOString();
    const saved: Ingredient = {
      id: ingredient?.id ?? generateId(),
      name: form.name.trim(),
      purchaseCost: form.purchaseCost,
      purchaseQuantity: form.purchaseQuantity,
      purchaseUnit: form.purchaseUnit,
      notes: form.notes.trim() || undefined,
      createdAt: ingredient?.createdAt ?? now,
      updatedAt: now,
    };
    onSave(saved);
    handleClose();
  }

  return (
    <Modal open={open} title={ingredient ? 'Edit ingredient' : 'Add ingredient'} onClose={handleClose}>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <TextInput
          label="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          error={touched ? errors.name : undefined}
          placeholder="e.g. All-purpose flour"
          autoFocus
        />
        <div className="grid grid-cols-2 gap-3">
          <MoneyInput
            label="Purchase cost"
            value={form.purchaseCost}
            onValueChange={(v) => setForm((f) => ({ ...f, purchaseCost: v }))}
            error={touched ? errors.purchaseCost : undefined}
          />
          <NumberInput
            label="Purchase quantity"
            value={form.purchaseQuantity}
            onValueChange={(v) => setForm((f) => ({ ...f, purchaseQuantity: v }))}
            error={touched ? errors.purchaseQuantity : undefined}
            min={0}
          />
        </div>
        <AnyUnitSelect
          label="Unit"
          value={form.purchaseUnit}
          onChange={(unit) => setForm((f) => ({ ...f, purchaseUnit: unit }))}
        />
        <TextInput
          label="Notes (optional)"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
}
