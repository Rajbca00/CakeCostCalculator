interface NumberInputProps {
  label?: string;
  value: number;
  onValueChange: (value: number) => void;
  error?: string;
  min?: number;
  step?: number;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function NumberInput({
  label,
  value,
  onValueChange,
  error,
  min,
  step = 'any' as unknown as number,
  placeholder,
  className = '',
  id,
}: NumberInputProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label && <span className="font-medium text-slate-700">{label}</span>}
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        placeholder={placeholder}
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => onValueChange(e.target.value === '' ? NaN : Number(e.target.value))}
        className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 ${
          error ? 'border-red-400' : 'border-slate-300'
        } ${className}`}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
