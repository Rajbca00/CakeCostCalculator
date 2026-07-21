import { BUCKET_LABELS, COST_BUCKETS } from '../../types';
import { foodCostPercent, round2, type RecipeCostResult } from '../../lib/costCalculations';
import { formatCurrency } from '../../lib/format';

interface RecipeCostBreakdownProps {
  result: RecipeCostResult;
}

/**
 * Additive cost-breakdown / recipe-dashboard view (Ingredients/Packaging/Overheads/Labour +
 * wastage + actual cost + food cost %). Purely informational -- selling price / profit figures
 * in RecipeCostSummary are unaffected.
 */
export function RecipeCostBreakdown({ result }: RecipeCostBreakdownProps) {
  const hasAutomaticCosts =
    result.laborAmount > 0 || result.electricityAmount > 0 || result.wastageAmount > 0;
  const bucketSum = COST_BUCKETS.reduce((sum, bucket) => sum + result.bucketTotals[bucket], 0);

  return (
    <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm">
      <p className="mb-2 font-semibold text-slate-800">Cost breakdown</p>
      <div className="flex flex-col gap-2">
        {COST_BUCKETS.map((bucket) => {
          const amount = result.bucketTotals[bucket];
          const share = bucketSum > 0 ? round2((amount / bucketSum) * 100) : 0;
          return (
            <div key={bucket}>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-600">{BUCKET_LABELS[bucket]}</span>
                <span className="font-medium text-slate-800">
                  {formatCurrency(amount)}
                  {bucketSum > 0 && <span className="ml-1 text-xs text-slate-400">({share}%)</span>}
                </span>
              </div>
              {bucketSum > 0 && (
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-rose-500"
                    style={{ width: `${share}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
        {result.wastageAmount > 0 && (
          <div className="flex justify-between py-0.5 text-amber-700">
            <span>Wastage ({result.wastagePercent}%)</span>
            <span className="font-medium">{formatCurrency(result.wastageAmount)}</span>
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-between border-t border-slate-200 py-1 pt-2">
        <span className="font-semibold text-slate-900">Actual cost</span>
        <span className="font-semibold text-slate-900">{formatCurrency(result.actualCost)}</span>
      </div>
      {result.profitPercent > 0 && (
        <div className="flex justify-between py-1">
          <span className="text-slate-600">Food cost %</span>
          <span className="font-medium text-slate-800">{foodCostPercent(result)}%</span>
        </div>
      )}
      {!hasAutomaticCosts && (
        <p className="mt-2 text-xs text-slate-400">
          Set active time / bake time on this recipe and rates in Settings to include automatic
          labour, electricity, and wastage costs here.
        </p>
      )}
    </div>
  );
}
