# Bıçak Atlası · Render distribution

Prebuilt public directory and browser-local decision comparison application.

Render Static Site settings:

- Build command: `node bicak-atlasi/render/prepare-deploy.mjs`
- Publish path: `bicak-atlasi/render/public`
- Environment: `SKIP_INSTALL_DEPS=true`

The build uses Render’s `RENDER_EXTERNAL_URL` for canonical and sitemap URLs. No database or server runtime is required.
