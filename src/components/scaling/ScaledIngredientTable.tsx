import type { RecipeCostResult } from '../../lib/costCalculations';
import { UNIT_LABELS } from '../../lib/units';
import type { Unit } from '../../types';
import { formatCurrency, formatQuantity } from '../../lib/format';

interface ScaledIngredientTableProps {
  result: RecipeCostResult;
}

export function ScaledIngredientTable({ result }: ScaledIngredientTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-2 font-medium">Ingredient</th>
            <th className="px-4 py-2 font-medium">Quantity</th>
            <th className="px-4 py-2 font-medium text-right">Cost</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {result.lines.map((line) => (
            <tr key={line.lineId} className={line.missingIngredient ? 'text-amber-600' : ''}>
              <td className="px-4 py-2">{line.ingredientName}</td>
              <td className="px-4 py-2">
                {formatQuantity(line.quantity)} {UNIT_LABELS[line.unit as Unit]}
              </td>
              <td className="px-4 py-2 text-right">{formatCurrency(line.cost)}</td>
            </tr>
          ))}
          {result.extraCosts.map((extra) => (
            <tr key={extra.id}>
              <td className="px-4 py-2 text-slate-500" colSpan={2}>
                {extra.label || 'Extra cost'}
              </td>
              <td className="px-4 py-2 text-right text-slate-500">
                {formatCurrency(extra.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
