interface MoneyInputProps {
  label?: string;
  value: number;
  onValueChange: (value: number) => void;
  error?: string;
  id?: string;
}

export function MoneyInput({ label, value, onValueChange, error, id }: MoneyInputProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label && <span className="font-medium text-slate-700">{label}</span>}
      <div
        className={`flex items-center rounded-md border bg-white focus-within:ring-2 focus-within:ring-rose-400 ${
          error ? 'border-red-400' : 'border-slate-300'
        }`}
      >
        <span className="pl-3 text-slate-500">₹</span>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => onValueChange(e.target.value === '' ? NaN : Number(e.target.value))}
          className="w-full rounded-md bg-transparent px-2 py-2 text-sm text-slate-900 focus:outline-none"
        />
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
