import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Modal } from '../layout/Modal';
import { Select } from '../common/Select';
import { TextInput } from '../common/TextInput';
import { NumberInput } from '../common/NumberInput';
import { MoneyInput } from '../common/MoneyInput';
import { Button } from '../common/Button';
import { RecipeGroupFilter } from '../scaling/RecipeGroupFilter';
import { RecipeScalePanel } from '../scaling/RecipeScalePanel';
import { getGroupNames } from '../../lib/recipeGroups';
import { getEffectiveRecipe } from '../../lib/recipeHierarchy';
import { suggestVariantName } from '../../lib/priceListing';
import { isNonEmptyString, isPositiveNumber } from '../../lib/validation';
import {
  PRICING_STRATEGIES,
  PRICING_STRATEGY_LABELS,
  type PackagingTemplate,
  type PriceListingVariant,
  type PricingStrategy,
  type Recipe,
} from '../../types';

export interface VariantDialogInput {
  recipeId: string;
  name: string;
  groupNames: string[];
  multiplier: number;
  servingSize?: string;
  packagingTemplateId?: string;
  pricingStrategy?: PricingStrategy;
  fixedPrice?: number;
  targetProfitAmount?: number;
  targetFoodCostPercent?: number;
}

interface VariantDialogProps {
  open: boolean;
  recipes: Recipe[];
  packagingTemplates: PackagingTemplate[];
  editingVariant?: PriceListingVariant;
  confirming?: boolean;
  onClose: () => void;
  onConfirm: (input: VariantDialogInput) => void;
}

export function VariantDialog({
  open,
  recipes,
  packagingTemplates,
  editingVariant,
  confirming = false,
  onClose,
  onConfirm,
}: VariantDialogProps) {
  const [recipeId, setRecipeId] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [multiplier, setMultiplier] = useState(1);
  const [name, setName] = useState('');
  const [nameEdited, setNameEdited] = useState(false);
  const [servingSize, setServingSize] = useState('');
  const [packagingTemplateId, setPackagingTemplateId] = useState('');
  const [pricingStrategy, setPricingStrategy] = useState<PricingStrategy>('markup');
  const [fixedPrice, setFixedPrice] = useState(NaN);
  const [targetProfitAmount, setTargetProfitAmount] = useState(NaN);
  const [targetFoodCostPercent, setTargetFoodCostPercent] = useState(NaN);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editingVariant) {
      setRecipeId(editingVariant.recipeId);
      setSelectedGroups(new Set(editingVariant.groupNames));
      setMultiplier(editingVariant.multiplier);
      setName(editingVariant.name);
      setNameEdited(true);
      setServingSize(editingVariant.servingSize ?? '');
      setPackagingTemplateId(editingVariant.packagingTemplateId ?? '');
      setPricingStrategy(editingVariant.pricingStrategy ?? 'markup');
      setFixedPrice(editingVariant.fixedPrice ?? NaN);
      setTargetProfitAmount(editingVariant.targetProfitAmount ?? NaN);
      setTargetFoodCostPercent(editingVariant.targetFoodCostPercent ?? NaN);
    } else {
      setRecipeId(recipes[0]?.id ?? '');
      setMultiplier(1);
      setNameEdited(false);
      setServingSize('');
      setPackagingTemplateId('');
      setPricingStrategy('markup');
      setFixedPrice(NaN);
      setTargetProfitAmount(NaN);
      setTargetFoodCostPercent(NaN);
    }
    setTouched(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingVariant?.id]);

  const recipesById = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);
  const recipe = useMemo(() => recipes.find((r) => r.id === recipeId), [recipes, recipeId]);
  const groupNames = useMemo(
    () => (recipe ? getGroupNames(getEffectiveRecipe(recipe, recipesById)) : []),
    [recipe, recipesById],
  );

  useEffect(() => {
    // Only reset groups/yield when the user actively switches recipes, not on initial open for edit.
    if (!open || recipeId === editingVariant?.recipeId) return;
    const r = recipes.find((rr) => rr.id === recipeId);
    setSelectedGroups(new Set(r ? getGroupNames(getEffectiveRecipe(r, recipesById)) : []));
    setMultiplier(1);
    setNameEdited(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId]);

  useEffect(() => {
    if (nameEdited) return;
    if (!recipe || selectedGroups.size === 0) {
      setName('');
      return;
    }
    setName(
      suggestVariantName(
        recipe,
        groupNames.filter((g) => selectedGroups.has(g)),
        recipesById,
      ),
    );
  }, [recipe, groupNames, selectedGroups, nameEdited, recipesById]);

  if (!open) return null;

  const errors = {
    recipe: recipe ? undefined : 'Choose a recipe',
    groups: selectedGroups.size > 0 ? undefined : 'Select at least one group',
    name: isNonEmptyString(name) ? undefined : 'Name is required',
    multiplier: isPositiveNumber(multiplier) ? undefined : 'Enter a yield greater than 0',
  };
  const hasErrors = Object.values(errors).some(Boolean);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (hasErrors || confirming || !recipe) return;
    onConfirm({
      recipeId: recipe.id,
      name: name.trim(),
      groupNames: groupNames.filter((g) => selectedGroups.has(g)),
      multiplier,
      servingSize: servingSize.trim() || undefined,
      packagingTemplateId: packagingTemplateId || undefined,
      pricingStrategy,
      fixedPrice: Number.isFinite(fixedPrice) ? fixedPrice : undefined,
      targetProfitAmount: Number.isFinite(targetProfitAmount) ? targetProfitAmount : undefined,
      targetFoodCostPercent: Number.isFinite(targetFoodCostPercent)
        ? targetFoodCostPercent
        : undefined,
    });
  }

  return (
    <Modal
      open={open}
      title={editingVariant ? 'Edit menu item' : 'Add menu item'}
      onClose={onClose}
    >
      <form className="flex flex-col gap-3" onSubmit={handleSubmit} noValidate>
        <Select
          label="Recipe"
          value={recipeId}
          onChange={(e) => setRecipeId(e.target.value)}
          error={touched ? errors.recipe : undefined}
        >
          <option value="" disabled>
            Choose a recipe
          </option>
          {recipes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>

        {recipe && groupNames.length > 1 && (
          <div>
            <RecipeGroupFilter
              groups={groupNames}
              selectedGroups={selectedGroups}
              onChange={setSelectedGroups}
            />
            {touched && errors.groups && (
              <p className="mt-1 text-xs text-red-600">{errors.groups}</p>
            )}
          </div>
        )}

        {recipe && (
          <RecipeScalePanel
            baseYieldQuantity={recipe.baseYieldQuantity}
            baseYieldLabel={recipe.baseYieldLabel}
            multiplier={multiplier}
            onMultiplierChange={setMultiplier}
          />
        )}
        {touched && errors.multiplier && (
          <p className="-mt-2 text-xs text-red-600">{errors.multiplier}</p>
        )}

        <TextInput
          label="Menu name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setNameEdited(true);
          }}
          error={touched ? errors.name : undefined}
        />

        <TextInput
          label="Serving size (optional)"
          value={servingSize}
          onChange={(e) => setServingSize(e.target.value)}
          placeholder='e.g. "Serves 8-10"'
        />

        <Select
          label="Packaging (optional)"
          value={packagingTemplateId}
          onChange={(e) => setPackagingTemplateId(e.target.value)}
        >
          <option value="">No packaging template</option>
          {packagingTemplates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>

        <Select
          label="Pricing strategy"
          value={pricingStrategy}
          onChange={(e) => setPricingStrategy(e.target.value as PricingStrategy)}
        >
          {PRICING_STRATEGIES.map((strategy) => (
            <option key={strategy} value={strategy}>
              {PRICING_STRATEGY_LABELS[strategy]}
            </option>
          ))}
        </Select>

        {pricingStrategy === 'fixed' && (
          <MoneyInput label="Fixed price" value={fixedPrice} onValueChange={setFixedPrice} />
        )}
        {pricingStrategy === 'targetProfit' && (
          <MoneyInput
            label="Target profit amount"
            value={targetProfitAmount}
            onValueChange={setTargetProfitAmount}
          />
        )}
        {pricingStrategy === 'foodCostPercent' && (
          <NumberInput
            label="Target food cost %"
            value={targetFoodCostPercent}
            onValueChange={(v) => setTargetFoodCostPercent(Math.min(100, Math.max(0, v)))}
            min={1}
            placeholder="e.g. 30"
          />
        )}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={confirming}>
            Cancel
          </Button>
          <Button type="submit" loading={confirming}>
            {editingVariant ? 'Save changes' : 'Add to menu'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
