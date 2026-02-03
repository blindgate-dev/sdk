# @blindgate/sdk

Blindgate authentication SDK for building secure authentication flows.

## Installation

```bash
npm install @blindgate/sdk
```

## Quick Start

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

// Or use passkeys
const result = await auth.signIn.passkey()

// Get current user
const user = await auth.getUser()

// Refresh session
await auth.refreshSession()

// Sign out
await auth.signOut()
```

## Configuration

### Basic Configuration

```typescript
const auth = new Blindgate({
  publishableKey: 'pk_test_...',
  baseUrl: 'https://api.blindgate.dev', // Optional, defaults to production
})
```

### Custom Storage Provider

```typescript
import { Blindgate } from '@blindgate/sdk'

const auth = new Blindgate({
  publishableKey: 'pk_test_...',
  storage: {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
    removeItem: (key) => localStorage.removeItem(key),
  },
})
```

## API Reference

### `Blindgate`

Main SDK class for managing authentication.

#### Constructor Options

- `publishableKey` (required): Your Blindgate publishable key (`pk_test_...` or `pk_live_...`)
- `baseUrl` (optional): Custom API base URL
- `storage` (optional): Custom storage provider

#### Methods

##### `signIn.email(credentials)`

Sign in with identifier (email, phone, or username) and password.

```typescript
const result = await auth.signIn.email({
  identifier: 'user@example.com',
  password: 'password',
})
// Returns: SignInResponse (includes user, sessionToken, refreshToken)
```

##### `signIn.passkey()`

Sign in using WebAuthn/Passkey (browser only).

```typescript
const result = await auth.signIn.passkey()
// Returns: SignInSuccessResponse
```

##### `signUp.email(data)`

Create a new account with email and password.

```typescript
const result = await auth.signUp.email({
  email: 'user@example.com',
  password: 'password',
  firstName: 'John', // optional
  lastName: 'Doe',   // optional
})
// Returns: SignUpResponse
```

##### `signUp.passkey(name?)`

Create a new account using WebAuthn/Passkey (browser only).

```typescript
const result = await auth.signUp.passkey('John Doe')
// Returns: SignUpResponse
```

##### `signOut()`

Sign out the current user and clear session.

```typescript
await auth.signOut()
```

##### `getUser()`

Get the currently authenticated user.

```typescript
const user = await auth.getUser()
// Returns: AuthUser | null
```

##### `refreshSession()`

Refresh the current session using the stored refresh token.

```typescript
const success = await auth.refreshSession()
// Returns: boolean
```

## Error Handling

The SDK throws `BlindgateError` with additional context:

```typescript
import { BlindgateError } from '@blindgate/sdk'

try {
  await auth.signIn.email({ identifier: email, password })
} catch (error) {
  if (error instanceof BlindgateError) {
    console.error('Auth failed:', error.message)
    console.error('Code:', error.code)
    console.error('Status:', error.statusCode)
  }
}
```

## Browser Support

- **Email/Password**: Works in all environments (browser, Node.js, Bun)
- **Passkeys/WebAuthn**: Requires modern browsers with WebAuthn support

## License

MIT
