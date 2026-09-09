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
