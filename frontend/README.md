# Frontend Environment Setup

## Local Development

- Run `yarn dev`.
- Keep `VITE_API_BASE_URL` empty (or not set).
- Requests to `/api/*` are proxied by `vite.config.ts` to `http://localhost:4000`.

## Production (Cloudflare)

Set this environment variable in Cloudflare build/runtime settings:

```bash
VITE_API_BASE_URL=https://your-api-domain.com
```

Example:

```bash
VITE_API_BASE_URL=https://api.example.com
```

Then rebuild/redeploy frontend so Vite injects the variable at build time.
