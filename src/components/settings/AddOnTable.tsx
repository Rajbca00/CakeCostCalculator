import type { AddOn } from '../../types';
import { formatCurrency } from '../../lib/format';
import { Button } from '../common/Button';

interface AddOnTableProps {
  addOns: AddOn[];
  onEdit: (addOn: AddOn) => void;
  onDelete: (addOn: AddOn) => void;
}

export function AddOnTable({ addOns, onEdit, onDelete }: AddOnTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-2 font-medium">Name</th>
            <th className="px-4 py-2 font-medium">Additional cost</th>
            <th className="px-4 py-2 font-medium">Additional selling price</th>
            <th className="px-4 py-2 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {addOns.map((addOn) => (
            <tr key={addOn.id}>
              <td className="px-4 py-2 font-medium text-slate-900">{addOn.name}</td>
              <td className="px-4 py-2 text-slate-600">{formatCurrency(addOn.additionalCost)}</td>
              <td className="px-4 py-2 text-slate-600">
                {formatCurrency(addOn.additionalSellingPrice)}
              </td>
              <td className="px-4 py-2 text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => onEdit(addOn)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => onDelete(addOn)}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
