import {
  type AuthSignInBody,
  type AuthSignUpBody,
  type AuthUser,
  configureHttpClient,
  getSession,
  refreshToken as refreshSessionToken,
  type SignInResponse,
  type SignUpResponse,
  signOut,
} from '@blindgate/api'
import { EmailAuth } from './auth/email'
import { PasskeyAuth } from './auth/passkey'
import type { BlindgateConfig } from './types'
import { LocalStorageProvider, STORAGE_KEYS } from './utils'

const DEFAULT_BASE_URL = 'https://api.blindgate.dev'

export class Blindgate {
  private config: BlindgateConfig
  private emailAuth: EmailAuth
  private passkeyAuth: PasskeyAuth
  private storage: NonNullable<BlindgateConfig['storage']>

  constructor(config: BlindgateConfig) {
    if (!config.publishableKey) {
      throw new Error('Blindgate SDK requires a publishableKey')
    }

    const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL
    this.config = { ...config, baseUrl }

    this.storage = config.storage ?? new LocalStorageProvider()

    configureHttpClient({
      baseUrl,
      publishableKey: this.config.publishableKey,
      getToken: () => this.storage.getItem(STORAGE_KEYS.SESSION_TOKEN),
    })

    this.emailAuth = new EmailAuth()
    this.passkeyAuth = new PasskeyAuth()
  }

  signIn = {
    email: async (credentials: AuthSignInBody): Promise<SignInResponse> => {
      const result = await this.emailAuth.signIn(credentials)
      await this.persistSession(result)
      return result
    },

    passkey: async (email: string): Promise<SignInResponse> => {
      const result = await this.passkeyAuth.signIn(email)
      await this.persistSession(result)
      return result
    },
  }

  signUp = {
    email: async (data: AuthSignUpBody): Promise<SignUpResponse> => {
      const result = await this.emailAuth.signUp(data)
      await this.persistSession(result)
      return result
    },
  }

  /** Manage passkeys for the signed-in user. */
  passkeys = {
    register: () => this.passkeyAuth.register(),
    list: () => this.passkeyAuth.list(),
    delete: (id: string) => this.passkeyAuth.delete(id),
  }

  async signOut(): Promise<void> {
    const token = await this.storage.getItem(STORAGE_KEYS.SESSION_TOKEN)

    if (token) {
      try {
        await signOut()
      } catch {
        // Ignore network errors during sign out
      }
    }

    await this.clearSession()
  }

  async getUser(): Promise<AuthUser | null> {
    const token = await this.storage.getItem(STORAGE_KEYS.SESSION_TOKEN)

    if (!token) {
      return null
    }

    try {
      const session = await getSession()

      if (session.authenticated) {
        await this.storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(session.user))
        return session.user
      }

      await this.clearSession()
      return null
    } catch {
      return null
    }
  }

  async refreshSession(): Promise<boolean> {
    const refreshToken = await this.storage.getItem(STORAGE_KEYS.REFRESH_TOKEN)

    if (!refreshToken) {
      return false
    }

    try {
      const result = await refreshSessionToken({ refreshToken })
      await this.storage.setItem(STORAGE_KEYS.SESSION_TOKEN, result.sessionToken)
      await this.storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, result.refreshToken)
      return true
    } catch {
      await this.clearSession()
      return false
    }
  }

  private async persistSession(result: SignInResponse | SignUpResponse): Promise<void> {
    if ('sessionToken' in result) {
      await this.storage.setItem(STORAGE_KEYS.SESSION_TOKEN, result.sessionToken)
      await this.storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, result.refreshToken)
    }
    if ('user' in result) {
      await this.storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(result.user))
    }
  }

  private async clearSession(): Promise<void> {
    await this.storage.removeItem(STORAGE_KEYS.SESSION_TOKEN)
    await this.storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    await this.storage.removeItem(STORAGE_KEYS.USER_DATA)
  }
}
