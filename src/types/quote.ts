/** A saved customer quotation: a recipe (optionally via an existing menu item) plus add-ons, auto-priced. */
export interface Quote {
  id: string;
  recipeId: string;
  /** Existing Price Listing menu item this quote was built from, if any. */
  variantId?: string;
  addOnIds: string[];
  /** Yield scale used for this quote (mirrors the variant's if one was selected). */
  multiplier: number;
  /** Free-text customization note, e.g. "Happy Birthday Topper". */
  customLabel?: string;
  customerName?: string;
  notes?: string;
  /** The quoted price shown to the customer -- recipe/variant price + add-ons, snapshotted at quote time. */
  sellingPrice: number;
  /** Internal-only cost snapshot for the owner's own records; never shown to the customer. */
  internalCost?: number;
  createdAt: string;
  updatedAt: string;
}
