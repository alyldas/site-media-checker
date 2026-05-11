# Documentation

## Architecture

Site Media Checker is split into three areas:

- `apps/web` renders the user interface, media previews and inspection results.
- `apps/api` performs URL normalization, SSRF checks, HTML fetching, metadata
  parsing and asset inspection.
- `packages/core` owns shared contracts and pure helpers used by both sides.

## Data Flow

1. The frontend posts a URL to `/inspect`.
2. The API normalizes the URL and rejects unsupported, private or unsafe targets.
3. The API fetches the HTML with redirect limits and byte limits.
4. HTML metadata is parsed into page, icon, manifest and social candidates.
5. Image assets are fetched with the same network protections and inspected for
   type, dimensions and detected sizes.
6. The API returns a versioned `InspectReport`.
7. The frontend groups assets into practical preview sections.

## Public Contracts

The stable public contracts live in `packages/core/src/types.ts`:

- `InspectReport`
- `IconAsset`
- `ManifestReport`
- `SocialReport`
- `Check`
- `ErrorResponse`

When changing API responses, update these contracts first and keep both API and
web imports pointed at `@site-media-checker/core`.

## Release Checklist

Run the full local check before publishing:

```sh
npm run check
```

This runs web build/tests, core typecheck/tests, API lint, API typecheck and API
tests.
