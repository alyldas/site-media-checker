# Site Media Checker

Site Media Checker validates website media metadata from a single URL:
favicons, Apple Touch Icon, Web App Manifest, PWA icons, maskable icons,
Open Graph metadata and Twitter/X Card metadata.

The project is MIT licensed and built as a small monorepo:

- Vue 3 frontend for inspection results and realistic media previews.
- Deno API for fetching, SSRF-safe URL inspection and image metadata parsing.
- Shared TypeScript core package for contracts, URL handling and scoring.

## Features

- Detects declared favicons, fallback favicon paths and multi-size `.ico` files.
- Groups favicon assets by practical browser/app/search purpose.
- Checks Apple Touch Icon, Web App Manifest, PWA icon sizes and maskable icons.
- Parses Open Graph and Twitter/X metadata.
- Renders browser tab, iOS/Android home screen, search result and social platform previews.
- Blocks local, private and reserved network targets before fetching remote URLs.
- Ships shared `InspectReport` and `ErrorResponse` contracts from `packages/core`.

## Repository Layout

- `apps/web` - Vue 3 + Vite frontend for GitHub Pages.
- `apps/api` - Deno Deploy API built with Hono.
- `packages/core` - shared TypeScript types, rules and helpers.
- `docs` - project documentation.

## Development

```sh
npm install
npm run check
```

Run the frontend:

```sh
npm run dev:web
```

Run the API:

```sh
npm run dev:api
```

The API uses Deno. The npm scripts use the project dependency that provides
`deno`, so `npm run check` works after `npm install`.

## API

Inspect a public URL:

```sh
curl -X POST http://localhost:8787/inspect \
  -H "content-type: application/json" \
  -d '{"url":"https://developer.mozilla.org/"}'
```

Successful responses follow the shared `InspectReport` contract. Errors follow
the shared `ErrorResponse` contract:

```json
{
  "version": "1.0.0",
  "error": {
    "code": "invalid_url",
    "message": "Enter a valid URL"
  }
}
```

## Checks

```sh
npm run check:web
npm run check:core
npm run lint:api
npm run check:api
npm run test:api
```

## License

MIT. See [LICENSE](LICENSE).
