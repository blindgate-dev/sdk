export type {
  AuthUser,
  SignInResponse,
  SignUpResponse,
  AuthSignInBody,
  AuthSignUpBody,
} from '@blindgate/api'

export type BlindgateConfig = {
  publishableKey: string
  baseUrl?: string
  storage?: StorageProvider
}

export type StorageProvider = {
  getItem(key: string): string | null | Promise<string | null>
  setItem(key: string, value: string): void | Promise<void>
  removeItem(key: string): void | Promise<void>
}

export type PasskeyOptions = {
  challenge: string
  rpId: string
  userId: string
  userName: string
  userDisplayName?: string
}

export type PasskeyCredential = {
  id: string
  rawId: string
  response: {
    clientDataJSON: string
    authenticatorData: string
    signature: string
    userHandle?: string
  }
  type: 'public-key'
}

export class BlindgateError extends Error {
  code: string
  statusCode?: number

  constructor(message: string, code: string, statusCode?: number) {
    super(message)
    this.name = 'BlindgateError'
    this.code = code
    this.statusCode = statusCode
  }
}
