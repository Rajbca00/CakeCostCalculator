import {
  round2,
  type RecipeCostExtraResult,
  type RecipeCostLineResult,
  type RecipeCostResult,
} from '../../lib/costCalculations';
import { UNIT_LABELS } from '../../lib/units';
import type { Unit } from '../../types';
import { formatCurrency, formatQuantity } from '../../lib/format';

interface ScaledIngredientTableProps {
  result: RecipeCostResult;
  /** Render a separate table per ingredient/extra-cost group instead of one flat table. */
  groupBy?: boolean;
}

function GroupTable({
  lines,
  extras,
}: {
  lines: RecipeCostLineResult[];
  extras: RecipeCostExtraResult[];
}) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <th className="px-4 py-2 font-medium">Ingredient</th>
          <th className="px-4 py-2 font-medium">Quantity</th>
          <th className="px-4 py-2 font-medium text-right">Cost</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {lines.map((line) => (
          <tr key={line.lineId} className={line.missingIngredient ? 'text-amber-600' : ''}>
            <td className="px-4 py-2">{line.ingredientName}</td>
            <td className="px-4 py-2">
              {formatQuantity(line.quantity)} {UNIT_LABELS[line.unit as Unit]}
            </td>
            <td className="px-4 py-2 text-right">{formatCurrency(line.cost)}</td>
          </tr>
        ))}
        {extras.map((extra) => (
          <tr key={extra.id}>
            <td className="px-4 py-2 text-slate-500" colSpan={2}>
              {extra.label || 'Extra cost'}
            </td>
            <td className="px-4 py-2 text-right text-slate-500">{formatCurrency(extra.amount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ScaledIngredientTable({ result, groupBy = false }: ScaledIngredientTableProps) {
  if (!groupBy) {
    return (
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <GroupTable lines={result.lines} extras={result.extraCosts} />
      </div>
    );
  }

  const order: string[] = [];
  const seen = new Set<string>();
  const linesByGroup = new Map<string, RecipeCostLineResult[]>();
  const extrasByGroup = new Map<string, RecipeCostExtraResult[]>();

  function ensureGroup(name: string) {
    if (!seen.has(name)) {
      seen.add(name);
      order.push(name);
    }
  }

  result.lines.forEach((line) => {
    ensureGroup(line.groupName);
    const arr = linesByGroup.get(line.groupName) ?? [];
    arr.push(line);
    linesByGroup.set(line.groupName, arr);
  });
  result.extraCosts.forEach((extra) => {
    ensureGroup(extra.groupName);
    const arr = extrasByGroup.get(extra.groupName) ?? [];
    arr.push(extra);
    extrasByGroup.set(extra.groupName, arr);
  });

  return (
    <div className="flex flex-col gap-4">
      {order.map((group) => {
        const lines = linesByGroup.get(group) ?? [];
        const extras = extrasByGroup.get(group) ?? [];
        const subtotal = round2(
          lines.reduce((sum, l) => sum + l.cost, 0) + extras.reduce((sum, e) => sum + e.amount, 0),
        );
        return (
          <div key={group} className="overflow-hidden rounded-lg border border-slate-200">
            <div className="flex items-center justify-between bg-slate-100 px-4 py-2">
              <span className="text-sm font-semibold text-slate-800">{group}</span>
              <span className="text-sm font-medium text-slate-600">{formatCurrency(subtotal)}</span>
            </div>
            <div className="overflow-x-auto">
              <GroupTable lines={lines} extras={extras} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
