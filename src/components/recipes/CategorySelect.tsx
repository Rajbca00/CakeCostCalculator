import { COST_CATEGORIES, type CostCategory } from '../../types';
import { Select } from '../common/Select';

interface CategorySelectProps {
  value: CostCategory;
  onChange: (category: CostCategory) => void;
  className?: string;
}

/** Fixed cost-category picker (Batter/Frosting/.../Labour) for the cost-breakdown dashboard. */
export function CategorySelect({ value, onChange, className }: CategorySelectProps) {
  return (
    <Select
      label="Category"
      value={value}
      onChange={(e) => onChange(e.target.value as CostCategory)}
      className={className}
    >
      {COST_CATEGORIES.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </Select>
  );
}
