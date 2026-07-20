import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { EmptyState } from '../components/layout/EmptyState';
import { ConfirmDialog } from '../components/layout/ConfirmDialog';
import { Button } from '../components/common/Button';
import { AddVariantDialog, type AddVariantInput } from '../components/priceListing/AddVariantDialog';
import { PriceListingMenu } from '../components/priceListing/PriceListingMenu';
import {
  useAppDataContext,
  useIngredientsById,
  usePriceListingVariants,
  useRecipes,
} from '../state/useAppData';
import type { PriceListingVariant } from '../types';
import { generateId } from '../lib/id';
import { calculateVariantCost } from '../lib/priceListing';
import { formatCurrency } from '../lib/format';
import { captureElementAsPng, shareOrDownloadImage } from '../lib/shareImage';
import { useToast } from '../components/layout/Toast';

export function PriceListingPage() {
  const navigate = useNavigate();
  const recipes = useRecipes();
  const ingredientsById = useIngredientsById();
  const variants = usePriceListingVariants();
  const { addPriceListingVariant, deletePriceListingVariant } = useAppDataContext();
  const { showToast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PriceListingVariant | undefined>(undefined);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const recipesById = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);
  const activeVariants = useMemo(
    () => variants.filter((v) => recipesById.has(v.recipeId)),
    [variants, recipesById],
  );

  async function handleConfirmAdd(input: AddVariantInput) {
    const now = new Date().toISOString();
    const variant: PriceListingVariant = {
      id: generateId(),
      recipeId: input.recipeId,
      name: input.name,
      groupNames: input.groupNames,
      multiplier: input.multiplier,
      createdAt: now,
      updatedAt: now,
    };
    setAdding(true);
    try {
      await addPriceListingVariant(variant);
      setDialogOpen(false);
    } catch {
      // failure toast already shown; keep dialog open so the user can retry
    } finally {
      setAdding(false);
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deletePriceListingVariant(pendingDelete.id);
      setPendingDelete(undefined);
    } catch {
      // failure toast already shown; keep dialog open so the user can retry
    } finally {
      setDeleting(false);
    }
  }

  async function handleExportImage() {
    if (!shareRef.current) return;
    setExporting(true);
    try {
      const blob = await captureElementAsPng(shareRef.current);
      const result = await shareOrDownloadImage(blob, 'price-list.png', 'Price List');
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

  return (
    <PageContainer>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">Price Listing</h1>
        <Button onClick={() => setDialogOpen(true)} disabled={recipes.length === 0}>
          Add menu item
        </Button>
      </div>

      {recipes.length === 0 ? (
        <EmptyState
          title="No recipes yet"
          description="Add a recipe first, then come back here to build priced menu variants from it."
          action={<Button onClick={() => navigate('/recipes/new')}>Add a recipe</Button>}
        />
      ) : activeVariants.length === 0 ? (
        <EmptyState
          title="No menu items yet"
          description="Add a menu item to pick a recipe and a combination of its groups, e.g. base cake + a specific icing."
          action={<Button onClick={() => setDialogOpen(true)}>Add your first menu item</Button>}
        />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            {activeVariants.map((variant) => {
              const recipe = recipesById.get(variant.recipeId)!;
              const result = calculateVariantCost(variant, recipe, ingredientsById);
              return (
                <div
                  key={variant.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{variant.name}</p>
                    <p className="text-sm text-slate-500">
                      {recipe.name} · {formatCurrency(result.sellingTotal)}
                      {result.hasMissingIngredients && (
                        <span className="ml-2 text-amber-600">⚠ missing ingredient</span>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    className="self-start sm:self-auto"
                    onClick={() => setPendingDelete(variant)}
                  >
                    Delete
                  </Button>
                </div>
              );
            })}
          </div>

          <div>
            <div className="mb-2 flex justify-end">
              <Button variant="secondary" onClick={handleExportImage} loading={exporting}>
                Export as image
              </Button>
            </div>
            <div ref={shareRef}>
              <PriceListingMenu
                variants={activeVariants}
                recipesById={recipesById}
                ingredientsById={ingredientsById}
              />
            </div>
          </div>
        </div>
      )}

      <AddVariantDialog
        open={dialogOpen}
        recipes={recipes}
        confirming={adding}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmAdd}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Remove "${pendingDelete?.name}"?`}
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
