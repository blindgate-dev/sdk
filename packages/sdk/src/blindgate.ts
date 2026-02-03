import {
  configureHttpClient,
  postApiV1AuthSignOut,
  getApiV1AuthSession,
  postApiV1AuthRefresh,
  type AuthUser,
  type SignInResponse,
  type SignUpResponse,
  type SignInSuccessResponse,
} from '@blindgate/api'
import type { BlindgateConfig } from './types'
import { EmailAuth } from './auth/email'
import { PasskeyAuth } from './auth/passkey'
import { LocalStorageProvider, STORAGE_KEYS, isBrowser } from './utils'

export class Blindgate {
  private config: BlindgateConfig
  private emailAuth: EmailAuth
  private passkeyAuth: PasskeyAuth
  private storage: NonNullable<BlindgateConfig['storage']>

  constructor(config: BlindgateConfig) {
    if (!config.publishableKey) {
      throw new Error('Blindgate SDK requires a publishableKey')
    }

    this.config = {
      baseUrl: 'https://api.blindgate.dev',
      ...config,
    }

    this.storage = config.storage ?? new LocalStorageProvider()

    configureHttpClient({
      baseUrl: this.config.baseUrl!,
      publishableKey: this.config.publishableKey,
      getToken: () => this.storage.getItem(STORAGE_KEYS.SESSION_TOKEN),
    })

    this.emailAuth = new EmailAuth()
    this.passkeyAuth = new PasskeyAuth()
  }

  signIn = {
    email: async (credentials: {
      identifier: string
      password: string
    }): Promise<SignInResponse> => {
      const result = await this.emailAuth.signIn(credentials)
      await this.persistSession(result)
      return result
    },

    passkey: async (): Promise<SignInSuccessResponse> => {
      const result = await this.passkeyAuth.signIn()
      await this.persistSession(result)
      return result
    },
  }

  signUp = {
    email: async (data: {
      email: string
      password: string
      firstName?: string
      lastName?: string
    }): Promise<SignUpResponse> => {
      const result = await this.emailAuth.signUp(data)
      await this.persistSession(result)
      return result
    },

    passkey: async (name?: string): Promise<SignUpResponse> => {
      const result = await this.passkeyAuth.signUp(name)
      await this.persistSession(result)
      return result
    },
  }

  async signOut(): Promise<void> {
    const token = await this.storage.getItem(STORAGE_KEYS.SESSION_TOKEN)

    if (token) {
      try {
        await postApiV1AuthSignOut()
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
      const session = await getApiV1AuthSession()

      if ('user' in session && session.user) {
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
      const result = await postApiV1AuthRefresh({ refreshToken })
      await this.storage.setItem(STORAGE_KEYS.SESSION_TOKEN, result.sessionToken)
      await this.storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, result.refreshToken)
      return true
    } catch {
      await this.clearSession()
      return false
    }
  }

  private async persistSession(
    result: SignInResponse | SignUpResponse | SignInSuccessResponse,
  ): Promise<void> {
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
