# Blindgate SDK Monorepo

Vanilla TypeScript authentication SDK monorepo for Blindgate.

## Package Structure

- `packages/sdk` — Public `@blindgate/sdk` package (browser auth SDK)
- `internals/api` — Private `@blindgate/api` package (generated API client via orval)
- `internals/typescript-config` — Shared `tsconfig` base

`packages/` contains publishable packages. `internals/` contains private workspace-only packages.

## Commands

```bash
bun install              # Install all dependencies
bun run build            # Build all packages (turbo)
bun run typecheck        # Type-check all packages (turbo)
bun run api:generate     # Regenerate API client from OpenAPI spec
bun run format           # Format with Biome
bun run format:check     # Check formatting
bun run clean            # Clean all build artifacts and node_modules
```

## Tech Stack

- **Runtime/Package Manager:** Bun
- **Monorepo:** Turborepo with Bun workspaces
- **API Generation:** Orval (fetch client) from OpenAPI spec
- **Formatting/Linting:** Biome
- **Language:** TypeScript (strict, ESNext, bundler module resolution)
- **Build:** `bun build` targeting browser

## Architecture

- `@blindgate/api` provides a configurable `httpClient` mutator used by orval-generated fetch functions
- SDK calls `configureHttpClient({ baseUrl, publishableKey, getToken })` in its constructor
- All API calls auto-inject `x-publishable-key` header and `Authorization: Bearer` token
- Publishable keys follow format: `pk_test_xxx` / `pk_live_xxx`
- Auth responses use `sessionToken` + `refreshToken` (not a session object)

## Environment Variables

- `OPENAPI_URL` — Override OpenAPI spec URL for generation (default: `https://api.blindgate.dev/openapi.json`)

## Formatting Rules

- Biome config in `biome.json`
- 2-space indent, 100 char line width
- Single quotes, no semicolons
- Organize imports on save

## Bun Notes

- `bunfig.toml` sets `bun = true` and `silent = true` for script running
- SDK builds with `bun build --target browser`
- Uses Bun workspace protocol (`workspace:*`) and catalogs (`catalog:`)
