import type { ExtraCost } from '../../types';
import { generateId } from '../../lib/id';
import { TextInput } from '../common/TextInput';
import { MoneyInput } from '../common/MoneyInput';
import { Button } from '../common/Button';

interface ExtraCostEditorProps {
  extraCosts: ExtraCost[];
  onChange: (extraCosts: ExtraCost[]) => void;
}

export function ExtraCostEditor({ extraCosts, onChange }: ExtraCostEditorProps) {
  function updateCost(id: string, patch: Partial<ExtraCost>) {
    onChange(extraCosts.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function removeCost(id: string) {
    onChange(extraCosts.filter((c) => c.id !== id));
  }

  function addCost() {
    onChange([
      ...extraCosts,
      { id: generateId(), label: '', amount: NaN, scalesWithYield: true },
    ]);
  }

  return (
    <div className="flex flex-col gap-2">
      {extraCosts.map((cost) => (
        <div key={cost.id} className="flex items-end gap-2 rounded-md border border-slate-200 p-2">
          <TextInput
            label="Label"
            value={cost.label}
            onChange={(e) => updateCost(cost.id, { label: e.target.value })}
            placeholder="e.g. Box + packaging"
            className="min-w-[10rem]"
          />
          <MoneyInput
            label="Amount"
            value={cost.amount}
            onValueChange={(v) => updateCost(cost.id, { amount: v })}
          />
          <label className="mb-2 flex items-center gap-1.5 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={cost.scalesWithYield}
              onChange={(e) => updateCost(cost.id, { scalesWithYield: e.target.checked })}
            />
            Scales with batch size
          </label>
          <Button variant="ghost" type="button" onClick={() => removeCost(cost.id)}>
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={addCost} className="self-start">
        Add extra cost
      </Button>
    </div>
  );
}
