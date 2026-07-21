import { RECIPE_CATEGORIES, type Ingredient, type PriceListingVariant, type Recipe, type RecipeCategory } from '../../types';
import { calculateVariantCost, calculateVariantSellingPrice } from '../../lib/priceListing';
import { getGroupNames } from '../../lib/recipeGroups';
import { getEffectiveRecipe } from '../../lib/recipeHierarchy';
import { recipeContainsEgg } from '../../lib/eggFlag';
import { formatCurrency, formatQuantity } from '../../lib/format';
import { useSettings } from '../../state/useAppData';
import { EggFlagBadge } from '../recipes/EggFlagBadge';

interface PriceListingMenuProps {
  variants: PriceListingVariant[];
  recipesById: Map<string, Recipe>;
  ingredientsById: Map<string, Ingredient>;
  title?: string;
}

const CATEGORY_MENU_TITLES: Record<RecipeCategory, string> = {
  Cakes: 'Cake Menu',
  Cupcakes: 'Cupcake Menu',
  Brownies: 'Brownie Menu',
  Cookies: 'Cookie Menu',
  Frostings: 'Frosting Menu',
  Fillings: 'Filling Menu',
  Ganache: 'Ganache Menu',
  Decorations: 'Decoration Menu',
};
const UNCATEGORIZED_MENU_TITLE = 'Menu';

export function PriceListingMenu({
  variants,
  recipesById,
  ingredientsById,
  title = 'Price List',
}: PriceListingMenuProps) {
  const settings = useSettings();

  const sections = new Map<string, PriceListingVariant[]>();
  variants.forEach((variant) => {
    const recipe = recipesById.get(variant.recipeId);
    const sectionTitle = recipe?.category
      ? CATEGORY_MENU_TITLES[recipe.category]
      : UNCATEGORIZED_MENU_TITLE;
    const list = sections.get(sectionTitle) ?? [];
    list.push(variant);
    sections.set(sectionTitle, list);
  });
  const sectionOrder = [
    ...RECIPE_CATEGORIES.map((c) => CATEGORY_MENU_TITLES[c]),
    UNCATEGORIZED_MENU_TITLE,
  ].filter((sectionTitle) => sections.has(sectionTitle));

  return (
    <div className="flex flex-col gap-6 bg-white p-6">
      <h2 className="text-center text-2xl font-semibold tracking-wide text-slate-900">{title}</h2>
      {sectionOrder.map((sectionTitle) => (
        <div key={sectionTitle} className="flex flex-col gap-1">
          {sectionOrder.length > 1 && (
            <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-rose-600">
              {sectionTitle}
            </h3>
          )}
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {sections.get(sectionTitle)!.map((variant) => {
              const recipe = recipesById.get(variant.recipeId);
              if (!recipe) return null;
              const result = calculateVariantCost(
                variant,
                recipe,
                ingredientsById,
                recipesById,
                settings,
              );
              const price = calculateVariantSellingPrice(variant, result);
              const effectiveRecipe = getEffectiveRecipe(recipe, recipesById);
              const allGroups = getGroupNames(effectiveRecipe);
              const isPartial = variant.groupNames.length < allGroups.length;
              return (
                <div key={variant.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">
                      {variant.name}{' '}
                      <EggFlagBadge containsEgg={recipeContainsEgg(effectiveRecipe, ingredientsById)} />
                    </p>
                    <p className="text-xs text-slate-500">
                      {variant.servingSize ?? (
                        <>
                          {formatQuantity(result.yieldQuantity)} {recipe.baseYieldLabel}
                        </>
                      )}
                      {isPartial && <> · {variant.groupNames.join(', ')}</>}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold text-slate-900">{formatCurrency(price)}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
