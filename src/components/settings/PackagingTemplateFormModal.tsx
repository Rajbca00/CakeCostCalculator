import { useState, type FormEvent } from 'react';
import type { PackagingTemplate } from '../../types';
import { Modal } from '../layout/Modal';
import { TextInput } from '../common/TextInput';
import { MoneyInput } from '../common/MoneyInput';
import { Button } from '../common/Button';
import { generateId } from '../../lib/id';
import { isNonEmptyString, isNonNegativeNumber } from '../../lib/validation';

interface PackagingTemplateFormModalProps {
  open: boolean;
  template?: PackagingTemplate;
  onClose: () => void;
  onSave: (template: PackagingTemplate) => Promise<void>;
}

interface FormState {
  name: string;
  cost: number;
  description: string;
}

function initialFormState(template?: PackagingTemplate): FormState {
  return {
    name: template?.name ?? '',
    cost: template?.cost ?? NaN,
    description: template?.description ?? '',
  };
}

export function PackagingTemplateFormModal({
  open,
  template,
  onClose,
  onSave,
}: PackagingTemplateFormModalProps) {
  const [form, setForm] = useState<FormState>(() => initialFormState(template));
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const errors = {
    name: isNonEmptyString(form.name) ? undefined : 'Name is required',
    cost: isNonNegativeNumber(form.cost) ? undefined : 'Enter a valid cost',
  };
  const hasErrors = Object.values(errors).some(Boolean);

  function handleClose() {
    setForm(initialFormState(template));
    setTouched(false);
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (hasErrors || saving) return;

    const now = new Date().toISOString();
    const saved: PackagingTemplate = {
      id: template?.id ?? generateId(),
      name: form.name.trim(),
      cost: form.cost,
      description: form.description.trim() || undefined,
      createdAt: template?.createdAt ?? now,
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
    <Modal
      open={open}
      title={template ? 'Edit packaging template' : 'Add packaging template'}
      onClose={handleClose}
    >
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <TextInput
          label="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          error={touched ? errors.name : undefined}
          placeholder="e.g. Box of 6, 1 Kg Cake"
          autoFocus
        />
        <MoneyInput
          label="Package cost"
          value={form.cost}
          onValueChange={(v) => setForm((f) => ({ ...f, cost: v }))}
          error={touched ? errors.cost : undefined}
        />
        <TextInput
          label="Description (optional)"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="e.g. Cardboard box + board + ribbon for a 1kg cake"
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
