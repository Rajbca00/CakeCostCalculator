# Laya & Bee — Bakery Management v2 Roadmap

Tracks the multi-phase build-out from "cost calculator" to full bakery
management (recipe hierarchy, versioning, categories, detailed costing,
settings, packaging templates, pricing strategies, customer menus, quotes,
and a business dashboard). Each phase ships as its own PR against `main`
so nothing lands as one giant, unreviewable change.

**Ground rules for every phase:**
- Additive migrations only — never drop or rewrite existing `ingredients`,
  `recipes`, or `price_listing_variants` rows/columns without a reviewed
  backfill step. Old data must keep working through every phase.
- Prefer extending the current architecture (see `src/types`, `src/lib`,
  `src/state`) over parallel rewrites.
- Each phase must build clean (`npm run build`) and typecheck before merge.

## Locked decisions

These were confirmed with the bakery owner before implementation started:

1. **Hierarchy model**: one *current parent* per recipe (e.g. Chocolate Cake
   → parent Vanilla Sponge), not per-version pinning. Simpler to cost and
   reason about; matches the examples given.
2. **Groups + categories (revised during Phase 1 implementation, then again
   later)**: the plan was to *replace* free-text `groupName` with the fixed
   cost category enum. Implementing that literally would have broken Price
   Listing: two different named groups on the same recipe (e.g. "Icing 1" vs
   "Icing 2") would both resolve to the same category ("Frosting"), making
   them indistinguishable — so a menu item built from one specific icing
   could no longer be told apart from one built from the other. Since "don't
   break existing functionality" overrides this specific sub-decision,
   `groupName` is kept exactly as-is (still drives Price Listing variant
   combinations and the grouped Calculate-tab view). A per-line `category`
   dropdown was added alongside it for the cost-breakdown dashboard, but the
   owner found picking a category per ingredient/extra-cost line redundant
   with the group name they'd already typed. It was replaced with
   `Recipe.groupBuckets`: a per-recipe map from group name to one of 4
   dashboard buckets (Ingredients/Packaging/Overheads/Labour), assigned once
   per group name via the recipe editor's "Groups & cost buckets" panel and
   reused automatically by every line/extra cost sharing that group name. The
   per-line `category` field is kept only for backward compatibility — any
   line that already has one explicitly set still costs into that bucket
   (recipes saved before this change keep costing exactly the same); the UI
   no longer sets it. Groups without an explicit bucket assignment fall back
   to a keyword guess from the group name (e.g. "icing" → Ingredients, "box"
   → Packaging), computed on read.
3. **Price Listing supersession**: the current Price Listing page (recipe +
   group-subset + yield, exported as an image) is folded into the new
   Product Variant + Customer Menu Generator model instead of living
   alongside it as a second, similar system. Existing `price_listing_variants`
   rows are migrated into the new variant table; no menu items are lost.
4. **Automatic costs are now priced in, not just shown (deviates from the
   original Phase 1 "additive-only" decision, by explicit owner request)**:
   Phase 1 shipped with `total`/`sellingTotal`/`profitAmount`/`finalPrice`
   computed exactly as before, and `wastageAmount`/`laborAmount`/
   `electricityAmount`/`actualCost` as purely informational dashboard
   figures alongside them. The owner asked for wastage, labour, and
   electricity to actually be reflected in the selling price rather than
   sitting next to it unused. `total` is now `ingredientsTotal + extrasTotal
   + wastageAmount + laborAmount + electricityAmount`, and every
   price/profit/discount figure derives from that. `actualCost` is kept as
   a field (equal to `total`) only because `BusinessDashboardPage` and
   `QuoteBuilderPage` already read it as "the fully-loaded cost" — no
   behavior change for them, since that's now literally true. This does
   change the selling price of any existing recipe that already has active
   time / bake time / a wastage override set — deliberately, on the owner's
   instruction, applied automatically (no opt-in toggle).

## Open assumption to confirm before Phase 1 costing work lands

- **Labour "Active Time"**: the spec says labour cost should never be
  manually entered, only derived from `hourly rate × active time`. There's
  no timer/tracking feature in this app, so *active time* itself has to be
  a manual input (minutes) per recipe — the automation is that the app
  computes the ₹ labour cost from that time and the global hourly rate, so
  a rate change propagates everywhere automatically. Flagging this so it's
  not a surprise when the recipe form grows an "Active time (minutes)"
  field.

## Phases

### Phase 1 — Foundation (shipped)
Schema + Settings, mostly invisible to existing recipes until they opt in.
- Global Settings page: labour rate, electricity tariff, oven power, LPG
  cost, wastage %, default markup %, currency code/symbol, tax %. One row
  per user (`business_settings` table), rates default to 0 so nothing
  changes until the owner sets real numbers.
- Cost category enum (Batter/Frosting/Filling/Decoration/Packaging/
  Overheads/Labour) added *alongside* `groupName` (see revised decision #2
  above), with a keyword-based guess from legacy `groupName` when
  `category` isn't set explicitly.
- Cost breakdown restructure: `calculateRecipeCost` now additionally returns
  `bucketTotals` (Ingredients/Packaging/Overheads/Labour), `laborAmount`,
  `electricityAmount`, `wastageAmount`, and `actualCost`. Shown on the
  recipe page as a new "Cost breakdown" panel underneath the existing
  summary. Originally additive-only (no effect on `total`/`sellingTotal`);
  see locked decision #4 above -- these are now folded into `total` and
  every price/profit figure derived from it.
- Labour cost = hourly rate × active time (`Recipe.activeTimeMinutes`, new
  optional field, scales with batch multiplier).
- Electricity cost = oven power × electricity rate × bake time
  (`Recipe.bakeTimeMinutes` + optional `Recipe.ovenPowerWatts` override).
- Wastage %: global default (3%, visible as its own line item, not folded
  invisibly into cost), overridable per recipe via
  `Recipe.wastagePercentOverride`.
- Packaging Templates: CRUD (name, cost, description) on the Settings page,
  not yet linked to a recipe/variant — that wiring is Phase 3's Product
  Variants work.
- Recipe Categories (Cakes/Cupcakes/Brownies/Cookies/Frostings/Fillings/
  Ganache/Decorations): field on Recipe + edit-form dropdown. Not yet used
  for filtering/grouping on the Recipes page — that's Phase 4 UI work.

**Known gaps left for later phases:** `currencyCode`/`currencySymbol` are
captured in Settings but `formatCurrency()` still hardcodes ₹ everywhere;
wiring it through is deferred to avoid scope creep in this phase.

### Phase 2 — Hierarchy & Versioning (shipped)
- **Parent/child inheritance**: `Recipe.parentRecipeId` links a recipe to one
  parent. `lib/recipeHierarchy.ts#getEffectiveRecipe` merges the whole
  ancestor chain's ingredient lines/extra costs (root-first) with the
  recipe's own on every read -- nothing is duplicated or stored, so editing
  an ancestor is reflected in every descendant's cost immediately. Wired
  into recipe costing, Price Listing variant costing, and the Recipes list.
  Cycles are prevented in the UI (`wouldCreateCycle`) and defensively capped
  in the merge itself.
- **Recipe versions**: `Recipe.status` (Draft/Testing/Final) is the live
  row's status. "Save new version" saves the recipe and additionally writes
  a read-only snapshot to a new `recipe_versions` table (own fields only --
  it does not snapshot the parent's state at that point in time, so a past
  version's cost can't be retroactively reconstructed if the parent has
  since changed). The recipe page shows a version list (v1, v2, ... plus
  the live row as the current version).
- **Recipe Dashboard**: folded into the existing Phase 1 "Cost breakdown"
  panel rather than a separate screen -- it already showed
  Ingredients/Packaging/Overheads/Labour/Actual cost; this phase adds
  Food cost % (ingredient cost ÷ selling price).
- **Recipe Book page** (`/recipe-book`): search by name, filter by category
  and status, grouped by category, with an expandable parent → children
  tree (a recipe nests under its parent only if the parent also passed the
  current filter, so filtering never hides a match; otherwise it's shown as
  its own top-level row).

**Known gap:** version snapshots are per-recipe only, not per-family, so a
child's historical cost at a given version can't be reconstructed exactly if
its parent changed in the meantime -- flagged in the roadmap rather than
solved now, since fixing it means snapshotting the whole ancestor chain.

### Phase 3 — Pricing & Customer Menu (shipped)
- **Pricing strategies** (`lib/pricingStrategy.ts#resolveVariantPrice`): each
  menu item (`PriceListingVariant`) picks one of Fixed Price, Markup %
  (default, uses the recipe's own Profit % exactly like before), Target
  Profit amount, or Target Food Cost % — `pricingStrategy` unset behaves
  identically to pre-Phase-3 behavior, so existing menu items don't change
  price.
- **Product Variants**: extended the existing `price_listing_variants`
  table in place (rather than migrating to a parallel table) with
  `servingSize`, `packagingTemplateId`, and the pricing-strategy fields --
  additive columns, no data migration needed, no menu items lost. Building
  a physically separate "product_variants" table was considered and
  rejected: it would have required a migration step with real failure risk
  for zero functional benefit over extending the existing table.
- **Add-ons**: new reusable catalog (name, additional cost, additional
  selling price) managed on the Settings page, attachable to a quote.
- **Customer Menu Generator**: folded into the existing Price Listing page
  rather than a new screen -- the menu view now groups items by the
  underlying recipe's category into "Cake Menu" / "Cupcake Menu" / etc.
  sections, shows serving size, and prices via the chosen pricing strategy.
  Cost is still never shown here (unchanged from before).
- **Quote Builder** (`/quotes`): pick a recipe (optionally one of its saved
  menu items/sizes), toggle add-ons, add a customization note + customer
  name, get an auto-calculated price. Cost is shown to the *owner* while
  composing (to help them price it) but the exportable/shareable quote
  card never includes cost -- only product, customization, and price.
  Saved quotes are listed for record-keeping with delete (no edit --
  if a quote's wrong, delete and requote, matching how a real quote
  workflow works).

### Phase 4 — Business Intelligence & UI (shipped)
- **Business Dashboard** (`/dashboard`): total recipes, most profitable
  recipe by margin %, blended Ingredient/Labour/Packaging/Overheads cost %
  across all recipes (weighted by actual cost, not a plain average), and a
  low-margin products list (<20% margin). **"Monthly profit" is
  intentionally not shown** -- it requires real sales/order data (what sold,
  when), which this app has no way to track yet (that's Phase 5+ territory:
  Invoice Generation, etc.). Showing a number without that data would be a
  guess dressed up as a metric, so it's omitted with an explanation instead
  of faked.
- **UI**: added a proportion bar chart to the existing cost-breakdown panel
  (Ingredients/Packaging/Overheads/Labour share of cost). Recipe search,
  category/status filtering, category grouping, and the expandable
  parent → children tree were already delivered in Phase 2's Recipe Book,
  so there was nothing left to add there. Reusable cards/dialogs and
  mobile-responsive layouts were already the existing pattern throughout
  (Button/Modal/Select/EmptyState + Tailwind `sm:`/`lg:` breakpoints).

### Phase 5 — Future-Ready Schema (design-only, not started)
No user-facing features yet — just making sure Phase 1–4 tables have the
right foreign keys/extension points so these can be added later without
another migration:
- Inventory management, purchase orders, supplier management, stock
  deduction, recipe scaling, seasonal pricing, discount coupons, invoice
  generation, WhatsApp quote sharing, PDF menu generation.

## Status

| Phase | Status |
|---|---|
| 1. Foundation | Shipped |
| 2. Hierarchy & Versioning | Shipped |
| 3. Pricing & Customer Menu | Shipped |
| 4. Business Intelligence & UI | Shipped |
| 5. Future-Ready Schema | Not started |
