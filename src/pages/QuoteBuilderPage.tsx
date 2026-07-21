import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { EmptyState } from '../components/layout/EmptyState';
import { ConfirmDialog } from '../components/layout/ConfirmDialog';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { TextInput } from '../components/common/TextInput';
import {
  useAddOns,
  useAppDataContext,
  useIngredientsById,
  usePriceListingVariants,
  useQuotes,
  useRecipes,
  useRecipesById,
  useSettings,
} from '../state/useAppData';
import type { Quote } from '../types';
import { generateId } from '../lib/id';
import { round2, calculateRecipeCost } from '../lib/costCalculations';
import { getEffectiveRecipe } from '../lib/recipeHierarchy';
import { calculateVariantSellingPrice } from '../lib/priceListing';
import { formatCurrency } from '../lib/format';
import { captureElementAsPng, shareOrDownloadImage } from '../lib/shareImage';
import { useToast } from '../components/layout/Toast';

export function QuoteBuilderPage() {
  const navigate = useNavigate();
  const recipes = useRecipes();
  const recipesById = useRecipesById();
  const ingredientsById = useIngredientsById();
  const settings = useSettings();
  const variants = usePriceListingVariants();
  const addOns = useAddOns();
  const quotes = useQuotes();
  const { addQuote, deleteQuote } = useAppDataContext();
  const { showToast } = useToast();

  const [recipeId, setRecipeId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [multiplier, setMultiplier] = useState(1);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<Set<string>>(new Set());
  const [customLabel, setCustomLabel] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Quote | undefined>(undefined);
  const [deleting, setDeleting] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const recipe = recipeId ? recipesById.get(recipeId) : undefined;
  const variantsForRecipe = useMemo(
    () => variants.filter((v) => v.recipeId === recipeId),
    [variants, recipeId],
  );
  const variant = variantId ? variantsForRecipe.find((v) => v.id === variantId) : undefined;
  const effectiveMultiplier = variant ? variant.multiplier : multiplier;

  const costResult = useMemo(() => {
    if (!recipe) return undefined;
    return calculateRecipeCost(
      getEffectiveRecipe(recipe, recipesById),
      ingredientsById,
      effectiveMultiplier,
      variant ? new Set(variant.groupNames) : undefined,
      0,
      settings,
    );
  }, [recipe, recipesById, ingredientsById, effectiveMultiplier, variant, settings]);

  const basePrice = costResult
    ? variant
      ? calculateVariantSellingPrice(variant, costResult)
      : costResult.sellingTotal
    : 0;
  const baseCost = costResult?.actualCost ?? 0;

  const selectedAddOns = addOns.filter((a) => selectedAddOnIds.has(a.id));
  const addOnsPriceTotal = round2(
    selectedAddOns.reduce((sum, a) => sum + a.additionalSellingPrice, 0),
  );
  const addOnsCostTotal = round2(selectedAddOns.reduce((sum, a) => sum + a.additionalCost, 0));
  const finalPrice = round2(basePrice + addOnsPriceTotal);
  const finalCost = round2(baseCost + addOnsCostTotal);

  function toggleAddOn(id: string) {
    setSelectedAddOnIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleRecipeChange(id: string) {
    setRecipeId(id);
    setVariantId('');
    setMultiplier(1);
  }

  function handleVariantChange(id: string) {
    setVariantId(id);
    if (id) {
      const v = variantsForRecipe.find((vv) => vv.id === id);
      if (v) setMultiplier(v.multiplier);
    }
  }

  async function handleSaveQuote() {
    if (!recipe) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      await addQuote({
        id: generateId(),
        recipeId: recipe.id,
        variantId: variant?.id,
        addOnIds: Array.from(selectedAddOnIds),
        multiplier: effectiveMultiplier,
        customLabel: customLabel.trim() || undefined,
        customerName: customerName.trim() || undefined,
        notes: notes.trim() || undefined,
        sellingPrice: finalPrice,
        internalCost: finalCost,
        createdAt: now,
        updatedAt: now,
      });
      setCustomLabel('');
      setCustomerName('');
      setNotes('');
    } catch {
      // failure toast already shown by the context
    } finally {
      setSaving(false);
    }
  }

  async function handleExportImage() {
    if (!shareRef.current || !recipe) return;
    setExporting(true);
    try {
      const blob = await captureElementAsPng(shareRef.current);
      const result = await shareOrDownloadImage(blob, 'quote.png', 'Quote');
      if (result === 'downloaded') showToast('Image downloaded', 'success');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // user cancelled the native share sheet — not an error
      } else {
        showToast('Could not create the image. Please try again.', 'error');
      }
    } finally {
      setExporting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteQuote(pendingDelete.id);
      setPendingDelete(undefined);
    } catch {
      // failure toast already shown; keep dialog open so the user can retry
    } finally {
      setDeleting(false);
    }
  }

  if (recipes.length === 0) {
    return (
      <PageContainer>
        <h1 className="mb-4 text-xl font-semibold text-slate-900">Quote Builder</h1>
        <EmptyState
          title="No recipes yet"
          description="Add a recipe first, then come back here to build a customer quote from it."
          action={<Button onClick={() => navigate('/recipes/new')}>Add a recipe</Button>}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Quote Builder</h1>

      <div className="mb-8 flex flex-col gap-4 rounded-lg border border-slate-200 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            label="Recipe"
            value={recipeId}
            onChange={(e) => handleRecipeChange(e.target.value)}
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
          <Select
            label="Menu item / size (optional)"
            value={variantId}
            onChange={(e) => handleVariantChange(e.target.value)}
            disabled={!recipe}
          >
            <option value="">Custom (no saved menu item)</option>
            {variantsForRecipe.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
                {v.servingSize ? ` — ${v.servingSize}` : ''}
              </option>
            ))}
          </Select>
        </div>

        {addOns.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-800">Add-ons</p>
            <div className="flex flex-wrap gap-2">
              {addOns.map((addOn) => {
                const active = selectedAddOnIds.has(addOn.id);
                return (
                  <button
                    key={addOn.id}
                    type="button"
                    onClick={() => toggleAddOn(addOn.id)}
                    className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                      active
                        ? 'border-rose-600 bg-rose-600 text-white'
                        : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {addOn.name} (+{formatCurrency(addOn.additionalSellingPrice)})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <TextInput
            label="Customization (optional)"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder='e.g. "Happy Birthday Topper"'
          />
          <TextInput
            label="Customer name (optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <TextInput
            label="Notes (optional, internal)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {recipe && (
          <div className="rounded-lg bg-slate-50 p-4 text-sm">
            <div className="flex justify-between py-1 text-slate-500">
              <span>Your cost (internal only)</span>
              <span>{formatCurrency(finalCost)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 py-1 pt-2">
              <span className="font-semibold text-slate-900">Quoted price</span>
              <span className="font-semibold text-slate-900">{formatCurrency(finalPrice)}</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="secondary"
            onClick={handleExportImage}
            loading={exporting}
            disabled={!recipe}
          >
            Export as image
          </Button>
          <Button onClick={handleSaveQuote} loading={saving} disabled={!recipe}>
            Save quote
          </Button>
        </div>

        {recipe && (
          <div ref={shareRef} className="rounded-lg bg-white p-6">
            <h3 className="text-center text-xl font-semibold text-slate-900">Quote</h3>
            <div className="mt-3 flex flex-col gap-1 text-sm">
              <p className="font-medium text-slate-900">
                {variant?.name ?? recipe.name}
                {variant?.servingSize && ` — ${variant.servingSize}`}
              </p>
              {customLabel && <p className="text-slate-600">{customLabel}</p>}
              {selectedAddOns.length > 0 && (
                <p className="text-slate-600">
                  Add-ons: {selectedAddOns.map((a) => a.name).join(', ')}
                </p>
              )}
              {customerName && <p className="text-slate-500">For: {customerName}</p>}
            </div>
            <div className="mt-4 flex justify-between border-t border-slate-200 pt-3">
              <span className="font-semibold text-slate-900">Price</span>
              <span className="font-semibold text-slate-900">{formatCurrency(finalPrice)}</span>
            </div>
          </div>
        )}
      </div>

      <h2 className="mb-2 text-sm font-semibold text-slate-800">Saved quotes</h2>
      {quotes.length === 0 ? (
        <EmptyState
          title="No quotes yet"
          description="Build a quote above and click Save quote to keep a record of it."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {[...quotes]
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((quote) => {
              const quoteRecipe = recipesById.get(quote.recipeId);
              const quoteAddOns = addOns.filter((a) => quote.addOnIds.includes(a.id));
              return (
                <div
                  key={quote.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">
                      {quoteRecipe?.name ?? '(deleted recipe)'}
                      {quote.customLabel && ` — ${quote.customLabel}`}
                    </p>
                    <p className="text-sm text-slate-500">
                      {quote.customerName && <>{quote.customerName} · </>}
                      {formatCurrency(quote.sellingPrice)}
                      {quoteAddOns.length > 0 && (
                        <> · {quoteAddOns.map((a) => a.name).join(', ')}</>
                      )}
                      {' · '}
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="danger" onClick={() => setPendingDelete(quote)}>
                    Delete
                  </Button>
                </div>
              );
            })}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this quote?"
        description="This cannot be undone."
        confirmLabel="Delete"
        danger
        confirming={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(undefined)}
      />
    </PageContainer>
  );
}
