import type { RecipeCostResult } from '../../lib/costCalculations';
import { formatCurrency, formatUnitCost } from '../../lib/format';

interface RecipeCostSummaryProps {
  result: RecipeCostResult;
  yieldLabel: string;
}

export function RecipeCostSummary({ result, yieldLabel }: RecipeCostSummaryProps) {
  return (
    <div className="rounded-lg bg-slate-50 p-4 text-sm">
      {result.hasMissingIngredients && (
        <p className="mb-2 rounded-md bg-amber-100 px-3 py-1.5 text-amber-800">
          One or more ingredient lines reference a deleted ingredient or mismatched unit; totals
          may be incomplete.
        </p>
      )}
      <div className="flex justify-between py-1">
        <span className="text-slate-600">Ingredients subtotal</span>
        <span className="font-medium">{formatCurrency(result.ingredientsTotal)}</span>
      </div>
      <div className="flex justify-between py-1">
        <span className="text-slate-600">Extras subtotal</span>
        <span className="font-medium">{formatCurrency(result.extrasTotal)}</span>
      </div>
      <div className="flex justify-between border-t border-slate-200 py-1 pt-2">
        <span className="font-semibold text-slate-900">Cost total</span>
        <span className="font-semibold text-slate-900">{formatCurrency(result.total)}</span>
      </div>
      <div className="flex justify-between py-1 text-slate-600">
        <span>
          Cost per {yieldLabel || 'unit'} ({result.yieldQuantity || 0})
        </span>
        <span>{formatUnitCost(result.costPerYieldUnit)}</span>
      </div>

      {result.profitPercent > 0 && (
        <>
          <div className="mt-2 flex justify-between border-t border-slate-200 py-1 pt-2">
            <span className="font-semibold text-emerald-700">
              Selling price total ({result.profitPercent}% profit)
            </span>
            <span className="font-semibold text-emerald-700">
              {formatCurrency(result.sellingTotal)}
            </span>
          </div>
          <div className="flex justify-between py-1 text-emerald-700">
            <span>Selling price per {yieldLabel || 'unit'}</span>
            <span>{formatUnitCost(result.sellingPricePerYieldUnit)}</span>
          </div>
          <div className="flex justify-between py-1 text-emerald-700">
            <span>Profit amount</span>
            <span className="font-medium">{formatCurrency(result.profitAmount)}</span>
          </div>
        </>
      )}
    </div>
  );
}
