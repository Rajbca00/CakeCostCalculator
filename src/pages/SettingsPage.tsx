import { useEffect, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { EmptyState } from '../components/layout/EmptyState';
import { ConfirmDialog } from '../components/layout/ConfirmDialog';
import { Button } from '../components/common/Button';
import { NumberInput } from '../components/common/NumberInput';
import { MoneyInput } from '../components/common/MoneyInput';
import { TextInput } from '../components/common/TextInput';
import { PackagingTemplateFormModal } from '../components/settings/PackagingTemplateFormModal';
import { PackagingTemplateTable } from '../components/settings/PackagingTemplateTable';
import { AddOnFormModal } from '../components/settings/AddOnFormModal';
import { AddOnTable } from '../components/settings/AddOnTable';
import { useAddOns, useAppDataContext, usePackagingTemplates, useSettings } from '../state/useAppData';
import type { AddOn, BusinessSettings, PackagingTemplate } from '../types';
import { isNonNegativeNumber } from '../lib/validation';

function clampPercent(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(100, value);
}

export function SettingsPage() {
  const settings = useSettings();
  const packagingTemplates = usePackagingTemplates();
  const addOns = useAddOns();
  const {
    updateSettings,
    addPackagingTemplate,
    updatePackagingTemplate,
    deletePackagingTemplate,
    addAddOn,
    updateAddOn,
    deleteAddOn,
  } = useAppDataContext();

  const [form, setForm] = useState<BusinessSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PackagingTemplate | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<PackagingTemplate | undefined>(undefined);
  const [deleting, setDeleting] = useState(false);

  const [addOnModalOpen, setAddOnModalOpen] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState<AddOn | undefined>(undefined);
  const [pendingDeleteAddOn, setPendingDeleteAddOn] = useState<AddOn | undefined>(undefined);
  const [deletingAddOn, setDeletingAddOn] = useState(false);

  const errors = {
    laborHourlyRate: isNonNegativeNumber(form.laborHourlyRate) ? undefined : 'Enter a valid rate',
    electricityRatePerUnit: isNonNegativeNumber(form.electricityRatePerUnit)
      ? undefined
      : 'Enter a valid rate',
    ovenPowerWatts: isNonNegativeNumber(form.ovenPowerWatts) ? undefined : 'Enter a valid wattage',
    lpgCostPerHour: isNonNegativeNumber(form.lpgCostPerHour) ? undefined : 'Enter a valid cost',
    currencyCode: form.currencyCode.trim() ? undefined : 'Required',
    currencySymbol: form.currencySymbol.trim() ? undefined : 'Required',
  };
  const hasErrors = Object.values(errors).some(Boolean);

  async function handleSaveSettings() {
    setTouched(true);
    if (hasErrors || saving) return;
    setSaving(true);
    try {
      await updateSettings({ ...form, updatedAt: new Date().toISOString() });
    } catch {
      // failure toast already shown by the context
    } finally {
      setSaving(false);
    }
  }

  function openAddTemplate() {
    setEditingTemplate(undefined);
    setTemplateModalOpen(true);
  }

  function openEditTemplate(template: PackagingTemplate) {
    setEditingTemplate(template);
    setTemplateModalOpen(true);
  }

  async function handleSaveTemplate(template: PackagingTemplate) {
    if (editingTemplate) {
      await updatePackagingTemplate(template);
    } else {
      await addPackagingTemplate(template);
    }
  }

  async function handleConfirmDeleteTemplate() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deletePackagingTemplate(pendingDelete.id);
      setPendingDelete(undefined);
    } catch {
      // failure toast already shown; keep dialog open so the user can retry
    } finally {
      setDeleting(false);
    }
  }

  function openAddAddOn() {
    setEditingAddOn(undefined);
    setAddOnModalOpen(true);
  }

  function openEditAddOn(addOn: AddOn) {
    setEditingAddOn(addOn);
    setAddOnModalOpen(true);
  }

  async function handleSaveAddOn(addOn: AddOn) {
    if (editingAddOn) {
      await updateAddOn(addOn);
    } else {
      await addAddOn(addOn);
    }
  }

  async function handleConfirmDeleteAddOn() {
    if (!pendingDeleteAddOn) return;
    setDeletingAddOn(true);
    try {
      await deleteAddOn(pendingDeleteAddOn.id);
      setPendingDeleteAddOn(undefined);
    } catch {
      // failure toast already shown; keep dialog open so the user can retry
    } finally {
      setDeletingAddOn(false);
    }
  }

  return (
    <PageContainer>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Settings</h1>

      <div className="mb-8 flex flex-col gap-4 rounded-lg border border-slate-200 p-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Business settings</h2>
          <p className="text-sm text-slate-500">
            Recipes automatically use these values for labour, electricity, and wastage costs.
            Labour/electricity rates default to 0 so nothing changes until you set real rates
            here.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <MoneyInput
            label="Labour rate (per hour)"
            value={form.laborHourlyRate}
            onValueChange={(v) => setForm((f) => ({ ...f, laborHourlyRate: v }))}
            error={touched ? errors.laborHourlyRate : undefined}
          />
          <MoneyInput
            label="Electricity tariff (per kWh)"
            value={form.electricityRatePerUnit}
            onValueChange={(v) => setForm((f) => ({ ...f, electricityRatePerUnit: v }))}
            error={touched ? errors.electricityRatePerUnit : undefined}
          />
          <NumberInput
            label="Default oven power (W)"
            value={form.ovenPowerWatts}
            onValueChange={(v) => setForm((f) => ({ ...f, ovenPowerWatts: v }))}
            error={touched ? errors.ovenPowerWatts : undefined}
            min={0}
            step={50}
          />
          <MoneyInput
            label="LPG cost (per hour)"
            value={form.lpgCostPerHour}
            onValueChange={(v) => setForm((f) => ({ ...f, lpgCostPerHour: v }))}
            error={touched ? errors.lpgCostPerHour : undefined}
          />
          <NumberInput
            label="Default wastage %"
            value={form.wastagePercent}
            onValueChange={(v) => setForm((f) => ({ ...f, wastagePercent: clampPercent(v) }))}
            min={0}
            step={1}
          />
          <NumberInput
            label="Default markup %"
            value={form.defaultMarkupPercent}
            onValueChange={(v) => setForm((f) => ({ ...f, defaultMarkupPercent: clampPercent(v) }))}
            min={0}
            step={1}
          />
          <NumberInput
            label="Tax %"
            value={form.taxPercent}
            onValueChange={(v) => setForm((f) => ({ ...f, taxPercent: clampPercent(v) }))}
            min={0}
            step={1}
          />
          <TextInput
            label="Currency code"
            value={form.currencyCode}
            onChange={(e) => setForm((f) => ({ ...f, currencyCode: e.target.value.toUpperCase() }))}
            error={touched ? errors.currencyCode : undefined}
            placeholder="e.g. INR"
          />
          <TextInput
            label="Currency symbol"
            value={form.currencySymbol}
            onChange={(e) => setForm((f) => ({ ...f, currencySymbol: e.target.value }))}
            error={touched ? errors.currencySymbol : undefined}
            placeholder="e.g. ₹"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} loading={saving}>
            Save settings
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Packaging templates</h2>
          <p className="text-sm text-slate-500">
            Reusable packaging options (name, cost, description) for use in product variants.
          </p>
        </div>
        <Button onClick={openAddTemplate}>Add packaging template</Button>
      </div>

      {packagingTemplates.length === 0 ? (
        <EmptyState
          title="No packaging templates yet"
          description='e.g. "Box of 6", "1 Kg Cake" -- each with its own cost.'
          action={<Button onClick={openAddTemplate}>Add your first template</Button>}
        />
      ) : (
        <PackagingTemplateTable
          templates={packagingTemplates}
          onEdit={openEditTemplate}
          onDelete={setPendingDelete}
        />
      )}

      <PackagingTemplateFormModal
        open={templateModalOpen}
        template={editingTemplate}
        onClose={() => setTemplateModalOpen(false)}
        onSave={handleSaveTemplate}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Delete "${pendingDelete?.name}"?`}
        description="This cannot be undone."
        confirmLabel="Delete"
        danger
        confirming={deleting}
        onConfirm={handleConfirmDeleteTemplate}
        onCancel={() => setPendingDelete(undefined)}
      />

      <div className="mb-4 mt-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Add-ons</h2>
          <p className="text-sm text-slate-500">
            Reusable extras (e.g. "Nutella", "Custom Theme") attachable to a quote.
          </p>
        </div>
        <Button onClick={openAddAddOn}>Add add-on</Button>
      </div>

      {addOns.length === 0 ? (
        <EmptyState
          title="No add-ons yet"
          description='e.g. "Nutella", "Biscoff", "Custom Theme" -- each with its own cost and price.'
          action={<Button onClick={openAddAddOn}>Add your first add-on</Button>}
        />
      ) : (
        <AddOnTable addOns={addOns} onEdit={openEditAddOn} onDelete={setPendingDeleteAddOn} />
      )}

      <AddOnFormModal
        open={addOnModalOpen}
        addOn={editingAddOn}
        onClose={() => setAddOnModalOpen(false)}
        onSave={handleSaveAddOn}
      />

      <ConfirmDialog
        open={!!pendingDeleteAddOn}
        title={`Delete "${pendingDeleteAddOn?.name}"?`}
        description="This cannot be undone."
        confirmLabel="Delete"
        danger
        confirming={deletingAddOn}
        onConfirm={handleConfirmDeleteAddOn}
        onCancel={() => setPendingDeleteAddOn(undefined)}
      />
    </PageContainer>
  );
}
