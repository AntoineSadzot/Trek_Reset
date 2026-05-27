# Trek & Reset - Static Client

Static-only version of the Trek & Reset app, designed for GitHub Pages.

## What changed

- No backend dependency at runtime.
- Bivouac data is embedded in the frontend.
- Routes are loaded from `src/data/generated-routes.json`.
- For identical parameters, the app rotates across available pre-generated variants.

## Regenerate routes data

Update `src/data/generated-routes.json` with freshly generated route data when needed.

## Local run

1. Install dependencies:

```bash
npm install
```

2. Configure env file:

```bash
cp .env.example .env
```

3. Optional: set `VITE_ORS_API_KEY` in `.env` for realistic hiking routes.

4. Start dev server:

```bash
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## GitHub Pages

The repository includes [../.github/workflows/deploy-pages.yml](../.github/workflows/deploy-pages.yml) to deploy automatically.

- Trigger: push on `main` affecting `client-static/**`.
- `VITE_BASE_PATH` is automatically set to `/${repo-name}/` in CI.
- Add repository secret `VITE_ORS_API_KEY` to enable external hiking routing in production.
