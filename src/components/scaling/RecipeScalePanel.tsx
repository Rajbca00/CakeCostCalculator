import { NumberInput } from '../common/NumberInput';

interface RecipeScalePanelProps {
  baseYieldQuantity: number;
  baseYieldLabel: string;
  baseServings?: number;
  multiplier: number;
  onMultiplierChange: (multiplier: number) => void;
}

export function RecipeScalePanel({
  baseYieldQuantity,
  baseYieldLabel,
  baseServings,
  multiplier,
  onMultiplierChange,
}: RecipeScalePanelProps) {
  const targetYield = baseYieldQuantity * multiplier;
  const targetServings = baseServings ? baseServings * multiplier : undefined;

  function handleTargetYieldChange(value: number) {
    if (!Number.isFinite(value) || baseYieldQuantity <= 0) return;
    onMultiplierChange(value / baseYieldQuantity);
  }

  function handleTargetServingsChange(value: number) {
    if (!Number.isFinite(value) || !baseServings || baseServings <= 0) return;
    onMultiplierChange(value / baseServings);
  }

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border border-slate-200 p-4">
      <NumberInput
        label={`Target yield (${baseYieldLabel || 'units'})`}
        value={targetYield}
        onValueChange={handleTargetYieldChange}
        min={0}
        className="w-32"
      />
      {baseServings !== undefined && (
        <NumberInput
          label="Target servings"
          value={targetServings ?? NaN}
          onValueChange={handleTargetServingsChange}
          min={0}
          className="w-28"
        />
      )}
      <NumberInput
        label="Multiplier"
        value={multiplier}
        onValueChange={onMultiplierChange}
        min={0}
        className="w-24"
      />
      <p className="text-sm text-slate-500">
        Base recipe: {baseYieldQuantity} {baseYieldLabel}
        {baseServings !== undefined ? ` · ${baseServings} servings` : ''}
      </p>
    </div>
  );
}
