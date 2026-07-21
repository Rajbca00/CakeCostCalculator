import type { PackagingTemplate } from '../../types';
import { formatCurrency } from '../../lib/format';
import { Button } from '../common/Button';

interface PackagingTemplateTableProps {
  templates: PackagingTemplate[];
  onEdit: (template: PackagingTemplate) => void;
  onDelete: (template: PackagingTemplate) => void;
}

export function PackagingTemplateTable({
  templates,
  onEdit,
  onDelete,
}: PackagingTemplateTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-2 font-medium">Name</th>
            <th className="px-4 py-2 font-medium">Description</th>
            <th className="px-4 py-2 font-medium">Cost</th>
            <th className="px-4 py-2 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {templates.map((template) => (
            <tr key={template.id}>
              <td className="px-4 py-2 font-medium text-slate-900">{template.name}</td>
              <td className="px-4 py-2 text-slate-500">{template.description || '—'}</td>
              <td className="px-4 py-2 text-slate-600">{formatCurrency(template.cost)}</td>
              <td className="px-4 py-2 text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => onEdit(template)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => onDelete(template)}>
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
