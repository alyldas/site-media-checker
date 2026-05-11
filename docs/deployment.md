# Deployment

## Frontend

The frontend is a static Vite build.

```sh
npm install
npm run build:web
```

The output directory is `apps/web/dist`.

GitHub Pages deployment is configured in `.github/workflows/deploy-web.yml`.
The workflow uploads `apps/web/dist` with `actions/upload-pages-artifact` and
deploys it with `actions/deploy-pages`.

Set the API URL for production builds:

```sh
VITE_API_BASE_URL=https://<project>.deno.dev
```

## API

The API is a Deno/Hono app with this entrypoint:

```txt
apps/api/main.ts
```

Manual GitHub Actions deployment is configured in
`.github/workflows/deploy-api.yml`. Add `DENO_DEPLOY_TOKEN` as a repository
secret, then run the workflow with the Deno Deploy project name.

Recommended Deno Deploy settings:

```txt
ALLOWED_ORIGINS=https://<your-pages-host>
ALLOW_UNSAFE_DNS_FALLBACK=false
USER_AGENT=SiteMediaCheckerBot/1.0 (+https://github.com/alyldas/site-media-checker)
```

Optional limits:

```txt
MAX_HTML_BYTES=1500000
MAX_MANIFEST_BYTES=262144
MAX_ASSET_BYTES=4000000
MAX_REQUEST_BYTES=4096
MAX_ASSETS_PER_SCAN=30
FETCH_TIMEOUT_MS=5000
MAX_REDIRECTS=5
```

## Verification

Before publishing a deployment, run:

```sh
npm run check
```

After deployment:

```sh
curl https://<project>.deno.dev/health
curl -X POST https://<project>.deno.dev/inspect \
  -H "content-type: application/json" \
  -d '{"url":"https://developer.mozilla.org/"}'
```
