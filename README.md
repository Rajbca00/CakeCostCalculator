# Cake Cost Calculator

Track ingredient costs and use them to cost out your cake recipes — with support
for weight, volume, and count units, and a view to scale any recipe to a
different batch size.

All data is stored locally in your browser (`localStorage`). There is no
backend or account — use **Export** on the Ingredients page regularly to back
up your data, and **Import** to restore it or move it to another browser.

## Features

- **Ingredients**: record what you paid, how much you bought, and in what
  unit. The app computes a cost per base unit (gram, milliliter, or piece)
  automatically.
- **Units**: full conversion within weight (g, kg, oz, lb), volume (ml, l,
  tsp, tbsp, cup — US customary), and count (piece). A recipe line can use any
  unit compatible with its ingredient's category.
- **Recipes**: build a recipe from ingredient lines plus optional flat extra
  costs (packaging, etc.), and see the total cost and cost per serving.
- **Calculate view**: scale a saved recipe to a different yield or multiplier
  and see quantities and cost update live, without touching the saved base
  recipe.
- **Export/Import**: back up all data to a JSON file and restore it later.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Outputs a static site to `dist/`.

## Deployment

This is a static single-page app (no server required) using a hash-based
router, so it deploys with zero routing configuration on any static host.

### Vercel (recommended)

1. Push this repo to GitHub.
2. In the [Vercel dashboard](https://vercel.com/new), import the repo.
   Vercel auto-detects Vite (`vite build`, output `dist`) — no config needed.
3. Deploy. Every push to `main` redeploys automatically.

### Netlify

Connect the repo and set:
- Build command: `npm run build`
- Publish directory: `dist`

Or drag-and-drop the `dist/` folder into the Netlify dashboard for a one-off
deploy.

### GitHub Pages

1. In `vite.config.ts`, set `base: '/<repo-name>/'` (skip this if deploying to
   a `<username>.github.io` root repo).
2. Add a GitHub Actions workflow that runs `npm run build` and publishes
   `dist/` via `actions/upload-pages-artifact` + `actions/deploy-pages`.
