import type { Unit, UnitCategory } from '../../types';
import { UNITS_BY_CATEGORY, UNIT_CATEGORY_LABELS, UNIT_LABELS } from '../../lib/units';
import { Select } from './Select';

interface UnitSelectProps {
  category: UnitCategory;
  value: Unit;
  onChange: (unit: Unit) => void;
  label?: string;
  id?: string;
}

export function UnitSelect({ category, value, onChange, label, id }: UnitSelectProps) {
  const options = UNITS_BY_CATEGORY[category];
  return (
    <Select
      id={id}
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as Unit)}
    >
      {options.map((unit) => (
        <option key={unit} value={unit}>
          {UNIT_LABELS[unit]}
        </option>
      ))}
    </Select>
  );
}

interface AnyUnitSelectProps {
  value: Unit;
  onChange: (unit: Unit) => void;
  label?: string;
  id?: string;
}

export function AnyUnitSelect({ value, onChange, label, id }: AnyUnitSelectProps) {
  return (
    <Select
      id={id}
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as Unit)}
    >
      {(Object.keys(UNITS_BY_CATEGORY) as UnitCategory[]).map((category) => (
        <optgroup key={category} label={UNIT_CATEGORY_LABELS[category]}>
          {UNITS_BY_CATEGORY[category].map((unit) => (
            <option key={unit} value={unit}>
              {UNIT_LABELS[unit]}
            </option>
          ))}
        </optgroup>
      ))}
    </Select>
  );
}
