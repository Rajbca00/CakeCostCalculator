import { useState, type FormEvent } from 'react';
import type { AddOn } from '../../types';
import { Modal } from '../layout/Modal';
import { TextInput } from '../common/TextInput';
import { MoneyInput } from '../common/MoneyInput';
import { Button } from '../common/Button';
import { generateId } from '../../lib/id';
import { isNonEmptyString, isNonNegativeNumber } from '../../lib/validation';

interface AddOnFormModalProps {
  open: boolean;
  addOn?: AddOn;
  onClose: () => void;
  onSave: (addOn: AddOn) => Promise<void>;
}

interface FormState {
  name: string;
  additionalCost: number;
  additionalSellingPrice: number;
}

function initialFormState(addOn?: AddOn): FormState {
  return {
    name: addOn?.name ?? '',
    additionalCost: addOn?.additionalCost ?? NaN,
    additionalSellingPrice: addOn?.additionalSellingPrice ?? NaN,
  };
}

export function AddOnFormModal({ open, addOn, onClose, onSave }: AddOnFormModalProps) {
  const [form, setForm] = useState<FormState>(() => initialFormState(addOn));
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const errors = {
    name: isNonEmptyString(form.name) ? undefined : 'Name is required',
    additionalCost: isNonNegativeNumber(form.additionalCost) ? undefined : 'Enter a valid cost',
    additionalSellingPrice: isNonNegativeNumber(form.additionalSellingPrice)
      ? undefined
      : 'Enter a valid price',
  };
  const hasErrors = Object.values(errors).some(Boolean);

  function handleClose() {
    setForm(initialFormState(addOn));
    setTouched(false);
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (hasErrors || saving) return;

    const now = new Date().toISOString();
    const saved: AddOn = {
      id: addOn?.id ?? generateId(),
      name: form.name.trim(),
      additionalCost: form.additionalCost,
      additionalSellingPrice: form.additionalSellingPrice,
      createdAt: addOn?.createdAt ?? now,
      updatedAt: now,
    };
    setSaving(true);
    try {
      await onSave(saved);
    } catch {
      setSaving(false);
      return;
    }
    setSaving(false);
    handleClose();
  }

  return (
    <Modal open={open} title={addOn ? 'Edit add-on' : 'Add add-on'} onClose={handleClose}>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <TextInput
          label="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          error={touched ? errors.name : undefined}
          placeholder="e.g. Nutella, Custom Theme"
          autoFocus
        />
        <MoneyInput
          label="Additional cost"
          value={form.additionalCost}
          onValueChange={(v) => setForm((f) => ({ ...f, additionalCost: v }))}
          error={touched ? errors.additionalCost : undefined}
        />
        <MoneyInput
          label="Additional selling price"
          value={form.additionalSellingPrice}
          onValueChange={(v) => setForm((f) => ({ ...f, additionalSellingPrice: v }))}
          error={touched ? errors.additionalSellingPrice : undefined}
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
