# @lovable.dev/vite-tanstack-config

Vite config wrapper for Lovable TanStack Start projects.

## What It Does

- Gives TanStack Start projects a single `defineConfig` helper for local preview and production builds.
- Keeps Lovable sandbox previews predictable by setting the server shape, watched paths, HMR coordination, and asset routing expected by the platform.
- Adds diagnostics that help the preview tell build, Vite, SSR, and app errors apart.
- Produces deployable build output for Lovable while still letting self-hosted projects choose their own target.

## Customization

Apps can pass through Vite options and adjust the React, TanStack Start, Nitro, HMR gate, and error-logging behavior when they need to.
