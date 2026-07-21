import type { Ingredient, RecipeIngredientLine } from '../../types';
import { getUnitCategory } from '../../lib/units';
import { lineCost } from '../../lib/costCalculations';
import { resolveIngredientLineCategory } from '../../lib/costCategory';
import { formatCurrency } from '../../lib/format';
import { generateId } from '../../lib/id';
import { NumberInput } from '../common/NumberInput';
import { Select } from '../common/Select';
import { UnitSelect } from '../common/UnitSelect';
import { Button } from '../common/Button';
import { GroupSelect } from './GroupSelect';
import { CategorySelect } from './CategorySelect';
import { Link } from 'react-router-dom';

interface RecipeIngredientLineEditorProps {
  lines: RecipeIngredientLine[];
  ingredients: Ingredient[];
  groupOptions: string[];
  onChange: (lines: RecipeIngredientLine[]) => void;
}

export function RecipeIngredientLineEditor({
  lines,
  ingredients,
  groupOptions,
  onChange,
}: RecipeIngredientLineEditorProps) {
  const ingredientsById = new Map(ingredients.map((i) => [i.id, i]));

  function updateLine(id: string, patch: Partial<RecipeIngredientLine>) {
    onChange(lines.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function removeLine(id: string) {
    onChange(lines.filter((l) => l.id !== id));
  }

  function addLine() {
    const first = ingredients[0];
    if (!first) return;
    onChange([
      ...lines,
      { id: generateId(), ingredientId: first.id, quantity: NaN, unit: first.purchaseUnit },
    ]);
  }

  function handleIngredientChange(line: RecipeIngredientLine, ingredientId: string) {
    const ingredient = ingredientsById.get(ingredientId);
    updateLine(line.id, {
      ingredientId,
      unit: ingredient ? ingredient.purchaseUnit : line.unit,
    });
  }

  if (ingredients.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500">
        No ingredients available —{' '}
        <Link to="/ingredients" className="text-rose-600 hover:underline">
          add ingredients first
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {lines.map((line) => {
        const ingredient = ingredientsById.get(line.ingredientId);
        const category = ingredient ? getUnitCategory(ingredient.purchaseUnit) : 'weight';
        return (
          <div
            key={line.id}
            className="flex flex-wrap items-end gap-2 rounded-md border border-slate-200 p-2"
          >
            <Select
              label="Ingredient"
              value={line.ingredientId}
              onChange={(e) => handleIngredientChange(line, e.target.value)}
              className="min-w-[10rem] flex-1 sm:flex-none"
            >
              {ingredients.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </Select>
            <NumberInput
              label="Quantity"
              value={line.quantity}
              onValueChange={(v) => updateLine(line.id, { quantity: v })}
              min={0}
              className="w-24"
            />
            <UnitSelect
              label="Unit"
              category={category}
              value={line.unit}
              onChange={(unit) => updateLine(line.id, { unit })}
            />
            <GroupSelect
              value={line.groupName}
              groupOptions={groupOptions}
              onChange={(groupName) => updateLine(line.id, { groupName })}
              className="w-36"
            />
            <CategorySelect
              value={resolveIngredientLineCategory(line)}
              onChange={(category) => updateLine(line.id, { category })}
              className="w-32"
            />
            <span className="mb-2 min-w-[5rem] text-sm text-slate-600">
              {formatCurrency(lineCost(line, ingredient))}
            </span>
            <Button variant="ghost" type="button" onClick={() => removeLine(line.id)}>
              Remove
            </Button>
          </div>
        );
      })}
      <Button type="button" variant="secondary" onClick={addLine} className="self-start">
        Add ingredient line
      </Button>
    </div>
  );
}
