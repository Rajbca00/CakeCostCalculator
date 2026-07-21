import type { Ingredient, PriceListingVariant, Recipe } from '../../types';
import { calculateVariantCost } from '../../lib/priceListing';
import { getGroupNames } from '../../lib/recipeGroups';
import { getEffectiveRecipe } from '../../lib/recipeHierarchy';
import { formatCurrency, formatQuantity } from '../../lib/format';
import { useSettings } from '../../state/useAppData';

interface PriceListingMenuProps {
  variants: PriceListingVariant[];
  recipesById: Map<string, Recipe>;
  ingredientsById: Map<string, Ingredient>;
  title?: string;
}

export function PriceListingMenu({
  variants,
  recipesById,
  ingredientsById,
  title = 'Price List',
}: PriceListingMenuProps) {
  const settings = useSettings();

  return (
    <div className="flex flex-col gap-1 bg-white p-6">
      <h2 className="mb-2 text-center text-2xl font-semibold tracking-wide text-slate-900">
        {title}
      </h2>
      <div className="divide-y divide-slate-200 border-y border-slate-200">
        {variants.map((variant) => {
          const recipe = recipesById.get(variant.recipeId);
          if (!recipe) return null;
          const result = calculateVariantCost(variant, recipe, ingredientsById, recipesById, settings);
          const allGroups = getGroupNames(getEffectiveRecipe(recipe, recipesById));
          const isPartial = variant.groupNames.length < allGroups.length;
          return (
            <div key={variant.id} className="flex items-start justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="font-medium text-slate-900">{variant.name}</p>
                <p className="text-xs text-slate-500">
                  {formatQuantity(result.yieldQuantity)} {recipe.baseYieldLabel}
                  {isPartial && <> · {variant.groupNames.join(', ')}</>}
                </p>
              </div>
              <p className="shrink-0 font-semibold text-slate-900">
                {formatCurrency(result.sellingTotal)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
