# Blindgate SDK

Authentication SDK for [Blindgate](https://blindgate.dev) — email/password, passkeys, and session management.

## Packages

| Package | Description |
|---------|-------------|
| `@blindgate/sdk` | Public auth SDK for browsers |
| `@blindgate/api` | Internal generated API client (orval + fetch) |
| `@blindgate/typescript-config` | Shared TypeScript config |

## Quick Start

```bash
npm install @blindgate/sdk
```

```typescript
import { Blindgate } from '@blindgate/sdk'

const auth = new Blindgate({
  publishableKey: 'pk_test_...',
})

// Sign in with email
const result = await auth.signIn.email({
  identifier: 'user@example.com',
  password: 'secure-password',
})

// Sign in with passkey
const result = await auth.signIn.passkey()

// Get current user
const user = await auth.getUser()

// Refresh session
await auth.refreshSession()

// Sign out
await auth.signOut()
```

## Development

```bash
# Install dependencies
bun install

# Regenerate API client from OpenAPI spec
bun run api:generate

# Type-check all packages
bun run typecheck

# Build all packages
bun run build

# Format code
bun run format
```

## Project Structure

```
sdk/
├── packages/
│   └── sdk/                    # @blindgate/sdk — public auth SDK
├── internals/
│   ├── api/                    # @blindgate/api — generated API client
│   └── typescript-config/      # shared tsconfig
├── biome.json
├── turbo.json
└── package.json
```

## License

MIT
