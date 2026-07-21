# Laya & Bee — App Guide

A walkthrough of every part of the app, told through one running example: a
home bakery selling **Vanilla Sponge** cakes and two of its flavour
variations, **Chocolate Cake** and **Red Velvet**.

The mental model, top to bottom:

```
Ingredients  →  Recipes (with parent/child + versions)  →  Price Listing (customer menu)  →  Quotes
                                     ↓
                                   Settings + Add-ons feed all of the above
```

---

## 1. Settings — set this up first

**Settings** holds every number the rest of the app uses automatically, so it's
worth filling in before you build recipes.

| Field | What it's for |
|---|---|
| Labour rate (per hour) | Turns a recipe's "active time" into a ₹ labour cost |
| Electricity tariff (per kWh) | Turns oven power × bake time into a ₹ electricity cost |
| Default oven power (W) | Used unless a recipe overrides it |
| LPG cost (per hour) | For gas-based baking, if you track it |
| Default wastage % | Applied to ingredient cost automatically (starts at 3%) |
| Default markup % | A starting point for new recipes' Profit % |
| Currency code / symbol | e.g. `INR` / `₹` |
| Tax % | Reserved for tax-inclusive pricing |

**Example:** set Labour rate to ₹300/hr and Electricity tariff to ₹8/kWh.
Every recipe with an "active time" and "bake time" filled in will now show a
real labour and electricity cost — no manual entry per recipe.

Also on this page:

- **Add-ons** — optional extras customers can add to a quote, each with its
  own cost and selling price. Add `Nutella Filling` (cost ₹40, sells for
  ₹80) and `Custom Theme Topper` (cost ₹60, sells for ₹150).

> For a flat packaging cost (e.g. a ₹30 box), add it as an **Extra cost**
> line on the recipe itself (see §3) rather than looking for a packaging
> option here — that's the mechanism that actually feeds into price.

---

## 2. Ingredients

Add every raw ingredient you buy, with what you paid and how much you got —
the app works out the cost per gram/ml/piece automatically.

**Example:**

| Name | Purchase | Unit |
|---|---|---|
| All-purpose flour | ₹60 | 1 kg |
| Sugar | ₹45 | 1 kg |
| Butter | ₹550 | 1 kg |
| Eggs | ₹90 | 6 piece |
| Cocoa powder | ₹320 | 500 g |
| Red velvet colour + cocoa mix | ₹180 | 100 g |
| Vanilla extract | ₹250 | 100 ml |

---

## 3. Recipes — the parent

Create your base recipe first. This becomes the **parent** that flavour
variations will inherit from.

**Recipe → Add recipe → "Vanilla Sponge"**

- Category: `Cakes`
- Base yield: `1` `kg` (however you think about a batch)
- Profit %: `40`
- Ingredients: flour, sugar, butter, eggs, vanilla extract — each with a
  quantity and, optionally, a **group** name like `Base batter` (groups are
  used later for menu combinations, see §6)
- Active time: `25` min, Bake time: `40` min — now that Settings has real
  rates, the **Cost breakdown** panel below shows a real Labour and
  Electricity line instead of ₹0
- Save recipe

You now have a costed base recipe with its own Cost breakdown: Ingredients,
Packaging, Overheads, Labour, Wastage, and **Total cost (priced)** all
itemised. Wastage, labour, and electricity aren't just shown for reference —
they're folded straight into the recipe's Cost total, so the selling price
(Profit % applied on top) already covers them.

---

## 4. Recipes — the children (this is where inheritance happens)

Now build the two flavours **without re-entering the sponge ingredients**.

**Recipe → Add recipe → "Chocolate Cake"**

- Parent recipe: `Vanilla Sponge`
- Category: `Cakes`
- Ingredients: **only the extra ingredient this flavour needs** — cocoa
  powder. Nothing from the sponge.
- Save recipe

The edit screen now shows:

> Inherits **Vanilla Sponge**'s 5 ingredient lines (₹142.50 inherited cost) —
> editing that recipe updates this one automatically.

The Cost breakdown for Chocolate Cake already includes the sponge's flour,
sugar, butter, eggs, and vanilla — plus its own cocoa powder — added
together. **Nothing was copied**; it's computed fresh every time from the
live parent.

Repeat for **"Red Velvet"** (parent: `Vanilla Sponge`, own ingredient: red
velvet colour + cocoa mix).

**Try this:** go back to Vanilla Sponge and increase the butter quantity.
Open Chocolate Cake or Red Velvet again — the cost has already changed. You
never touched either child recipe.

> **Only ingredients and extra costs are inherited.** Yield, Profit %,
> labour/bake time, and notes are always the child's own — a bigger flavour
> variant doesn't have to scale the same way as its parent.

---

## 5. Versions and status

Every recipe has a **Status** (Draft / Testing / Final) and a version
history.

**Example:** while you're still testing Chocolate Cake's cocoa quantity,
leave Status as `Draft`. Once you've baked it and you're happy, set Status
to `Testing` and click **Save new version** — this checkpoints the recipe as
`v1 (Testing)`. Keep tweaking; the recipe you're editing is always the live,
current version. When it's ready to sell, set Status to `Final` and **Save
new version** again — now you have `v1 (Testing)` and `v2 (Final)` in the
version list, both read-only history.

> Version snapshots capture the recipe's *own* fields only, not its parent's
> state at that moment — if you need to know exactly what a child cost in the
> past, the parent's own history won't retroactively line up with it.

---

## 6. Recipe Book

**Recipe Book** is the searchable, filterable view of everything you've
built. Search by name, filter by Category or Status, and expand **Vanilla
Sponge** to see **Chocolate Cake** and **Red Velvet** nested underneath it as
an actual family tree — cost, yield, and selling price shown for each.

---

## 7. Price Listing — turning a recipe into menu items (variants)

A recipe is not a menu item. **Price Listing** is where you decide what
you actually sell, in what sizes, at what price — one recipe can produce
several menu items ("variants").

**Example — two sizes of the same cake:**

**Price Listing → Add menu item**

1. Recipe: `Chocolate Cake`
   Name: `Chocolate Cake — 0.5 Kg`
   Target yield: `0.5` kg (the scale panel converts this to a multiplier automatically)
   Serving size: `Serves 4-6`
   Pricing strategy: `Markup % (recipe's own Profit %)`

2. Recipe: `Chocolate Cake`
   Name: `Chocolate Cake — 1 Kg`
   Target yield: `1` kg
   Serving size: `Serves 8-10`
   Pricing strategy: `Target food cost %` → `30`

You now have **two independently priced products from one recipe** — the
0.5 Kg uses your recipe's normal 40% markup, while the 1 Kg is priced so
ingredient cost is exactly 30% of the selling price, regardless of what the
40% markup would have produced. Recipe cost and menu price are deliberately
decoupled — the pricing strategy is the bridge between them.

**If a recipe has multiple ingredient groups** (e.g. Vanilla Sponge's
`Base batter` plus a separate `Ganache Topping` group on Chocolate Cake),
the menu item form lets you tick which groups are included — so you could
sell "Chocolate Cake — plain" and "Chocolate Cake — with ganache" as two
more variants, each pricing only the groups it includes.

**The customer-facing menu:** scroll down on Price Listing to see the
generated menu, automatically grouped into sections like **Cake Menu**
by each recipe's category. It shows product, serving size, and price —
**never cost**. Tick/untick which items to include, then **Export as
image** to share it or print it.

---

## 8. Quote Builder — one-off pricing for a specific customer

Not every sale is off the standard menu. **Quotes** let you combine a
recipe (optionally one of its saved menu items), any add-ons, and a
free-text customization, then auto-calculate the price.

**Example:** a customer wants the 1 Kg Chocolate Cake with a Nutella filling
and a birthday topper.

**Quotes**
- Recipe: `Chocolate Cake`
- Menu item / size: `Chocolate Cake — 1 Kg`
- Add-ons: tick `Nutella Filling` and `Custom Theme Topper`
- Customization: `Happy Birthday Topper — "Priya turns 30"`
- Customer name: `Priya`

The page shows **you** both the cost and the quoted price, so you can sanity
check the margin before sending it. Click **Export as image** — the exported
card shows only the product, the customization, and the final price, never
the cost breakdown. **Save quote** keeps a record in the list below for your
own reference.

---

## 9. Business Dashboard

A book-level view across every recipe:

- **Total recipes**
- **Most profitable** recipe, by margin %
- **Blended cost composition** — what share of your total cost, across every
  recipe, is ingredients vs. labour vs. packaging vs. overheads (shown as
  proportion bars)
- **Low margin products** — anything under 20% margin, so you can spot a
  recipe that's underpriced

There's deliberately **no "monthly profit" figure** — that needs real sales
history (what sold, when), and this app doesn't track orders yet. A number
without that data would just be a guess wearing a business-metric costume.

---

## 10. Back up your data

On the Ingredients or Price Listing page, **Export all data** downloads one
JSON file with everything — ingredients, recipes, menu items, settings,
add-ons, and quotes. **Import all data** restores from that file (it
replaces what's currently in your account, so it will ask you to confirm
first).

---

## Glossary

| Term | Meaning |
|---|---|
| **Parent recipe** | A recipe another recipe inherits ingredients/extra costs from |
| **Child recipe** | A recipe with a parent set; only stores its *own* additional ingredients |
| **Effective cost** | A recipe's real cost once its whole parent chain is merged in |
| **Version** | A saved, read-only checkpoint of a recipe (via "Save new version") |
| **Status** | Draft / Testing / Final — the current version's lifecycle stage |
| **Menu item (variant)** | A specific sellable product built from a recipe: a size, a group combination, a price |
| **Pricing strategy** | How a menu item's price is derived: Fixed, Markup %, Target Profit, or Target Food Cost % |
| **Add-on** | An optional extra (cost + price) attachable to a quote |
| **Quote** | A one-off, customer-specific price built from a recipe + optional menu item + add-ons |
| **Wastage %** | Automatic buffer added to ingredient cost, global default or per-recipe override |
| **Actual cost** | Ingredients + Packaging + Overheads + Labour + Wastage — the fully-loaded cost |
| **Food cost %** | Ingredient cost as a percentage of the selling price |
