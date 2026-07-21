import type { Ingredient } from '../../types';
import { costPerBaseUnit } from '../../lib/costCalculations';
import { UNIT_LABELS, BASE_UNIT, getUnitCategory } from '../../lib/units';
import { formatCurrency, formatQuantity, formatUnitCost } from '../../lib/format';
import { Button } from '../common/Button';

interface IngredientTableProps {
  ingredients: Ingredient[];
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
}

export function IngredientTable({ ingredients, onEdit, onDelete }: IngredientTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-2 font-medium">Name</th>
            <th className="px-4 py-2 font-medium">Purchase</th>
            <th className="px-4 py-2 font-medium">Cost per unit</th>
            <th className="px-4 py-2 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {ingredients.map((ingredient) => {
            const base = BASE_UNIT[getUnitCategory(ingredient.purchaseUnit)];
            return (
              <tr key={ingredient.id}>
                <td className="px-4 py-2 font-medium text-slate-900">
                  {ingredient.name}
                  {ingredient.containsEgg && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      Egg
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-slate-600">
                  {formatCurrency(ingredient.purchaseCost)} for{' '}
                  {formatQuantity(ingredient.purchaseQuantity)}{' '}
                  {UNIT_LABELS[ingredient.purchaseUnit]}
                </td>
                <td className="px-4 py-2 text-slate-600">
                  {formatUnitCost(costPerBaseUnit(ingredient))} / {UNIT_LABELS[base]}
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => onEdit(ingredient)}>
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => onDelete(ingredient)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
