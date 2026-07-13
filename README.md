# Cake Cost Calculator

Track ingredient costs and use them to cost out your cake recipes — with support
for weight, volume, and count units, and a view to scale any recipe to a
different batch size.

Data syncs across devices via a [Supabase](https://supabase.com) backend: sign up
with an email/password, and your ingredients and recipes follow you to any
browser or device where you sign in with the same account.

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
- **Export/Import**: back up all data to a JSON file and restore it, or move
  it between accounts.
- **Accounts**: email/password sign-up via Supabase Auth. Each account's data
  is private (enforced by Postgres row-level security) and syncs to every
  device you sign in on. There's no self-service password reset yet — if
  you're locked out, reset the password from your Supabase project's dashboard
  (Authentication → Users).

## Backend setup (Supabase)

This app needs a Supabase project to store data and handle auth. You'll need
to create one yourself (free tier is enough for personal use):

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL Editor and run the contents of [`supabase/schema.sql`](supabase/schema.sql)
   once — this creates the `ingredients` and `recipes` tables with row-level
   security so each account only sees its own data.
3. Optional but recommended for personal/family use: in **Authentication →
   Providers → Email**, turn off "Confirm email" so sign-up doesn't require
   clicking an email link.
4. In **Project Settings → API**, copy the **Project URL** and **anon public
   key**.
5. Copy `.env.example` to `.env.local` and fill in those two values:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

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

This is a static single-page app using a hash-based router, so it deploys with
zero routing configuration on any static host — the only extra step versus a
fully static app is setting the two Supabase environment variables on your
host.

### Vercel (recommended)

1. Push this repo to GitHub.
2. In the [Vercel dashboard](https://vercel.com/new), import the repo.
   Vercel auto-detects Vite (`vite build`, output `dist`) — no build config needed.
3. In the project's **Settings → Environment Variables**, add
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (same values as your
   `.env.local`).
4. Deploy. Every push to `main` redeploys automatically.

### Netlify

Connect the repo and set:
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### GitHub Pages

1. In `vite.config.ts`, set `base: '/<repo-name>/'` (skip this if deploying to
   a `<username>.github.io` root repo).
2. Add a GitHub Actions workflow that runs `npm run build` (with the Supabase
   env vars available as repo secrets) and publishes `dist/` via
   `actions/upload-pages-artifact` + `actions/deploy-pages`.
