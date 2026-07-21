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
2. **Groups + categories (revised during Phase 1 implementation)**: the plan
   was to *replace* free-text `groupName` with the fixed cost category enum.
   Implementing that literally would have broken Price Listing: two
   different named groups on the same recipe (e.g. "Icing 1" vs "Icing 2")
   would both resolve to the same category ("Frosting"), making them
   indistinguishable — so a menu item built from one specific icing could no
   longer be told apart from one built from the other. Since "don't break
   existing functionality" overrides this specific sub-decision, `groupName`
   is kept exactly as-is (still drives Price Listing variant combinations and
   the grouped Calculate-tab view) and a new, independent `category` field
   was added alongside it purely for the cost-breakdown dashboard. Existing
   lines without an explicit `category` get one guessed from their
   `groupName` via keyword matching (e.g. "icing" → Frosting, "box" →
   Packaging), computed on read — no data is rewritten until a line is
   explicitly re-saved with a category.
3. **Price Listing supersession**: the current Price Listing page (recipe +
   group-subset + yield, exported as an image) is folded into the new
   Product Variant + Customer Menu Generator model instead of living
   alongside it as a second, similar system. Existing `price_listing_variants`
   rows are migrated into the new variant table; no menu items are lost.

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
  `categoryTotals`, `bucketTotals` (Ingredients/Packaging/Overheads/Labour),
  `laborAmount`, `electricityAmount`, `wastageAmount`, and `actualCost` —
  all additive; `total`/`sellingTotal`/`profitAmount`/`finalPrice` are
  computed exactly as before, so no existing price changes. Shown on the
  recipe page as a new "Cost breakdown" panel underneath the existing
  summary.
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

### Phase 2 — Hierarchy & Versioning (not started)
The structural change: a "recipe" becomes a family with versions.
- Parent/child recipe inheritance: child stores only its additional
  ingredients/costs; effective cost = parent's current-version cost +
  child's own. Editing the parent recalculates every child automatically.
- Recipe versions (Draft / Testing / Final), with one version marked
  "current" per recipe; version history is browsable, not destructive.
- Recipe Dashboard: ingredient cost, packaging cost, labour, overheads,
  actual cost, selling price, profit, profit %, food cost % for the
  current version.
- Recipe Book page: name, category, parent recipe, version, yield, cost,
  selling price, status, notes — searchable/filterable, grouped by
  category, with an expandable parent → children tree.

### Phase 3 — Pricing & Customer Menu (not started)
- Selling price strategies per recipe: Fixed Price, Markup %, Target
  Profit, Food Cost % — user picks the strategy; recipe cost stays
  internal-only.
- Product Variants (0.5kg/1kg cake, box of 4/8 cupcakes, etc.): selling
  price + serving size + packaging template, without duplicating the
  recipe. Existing `price_listing_variants` migrate into this table.
- Add-ons (Nutella, Biscoff, Ganache, Dry Fruits, Custom Theme): additional
  cost + additional selling price, attachable to a variant/quote.
- Customer Menu Generator: Cake Menu / Cupcake Menu / Brownie Menu views
  showing product, description, sizes, and prices — cost figures never
  rendered. Replaces the current Price Listing export flow (same "export
  as image" capability, built on the new variant model).
- Quote Builder: pick a recipe + variant + add-ons, auto-price it,
  produce a shareable quote.

### Phase 4 — Business Intelligence & UI (not started)
- Business Dashboard: total recipes, most profitable product, ingredient
  cost %, labour %, packaging %, monthly profit, low-margin products.
- UI: reusable card/dialog components, recipe search + filters, category
  grouping, expandable recipe trees, cost breakdown charts/progress bars,
  mobile-friendly layouts throughout.

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
| 2. Hierarchy & Versioning | Not started |
| 3. Pricing & Customer Menu | Not started |
| 4. Business Intelligence & UI | Not started |
| 5. Future-Ready Schema | Not started |
