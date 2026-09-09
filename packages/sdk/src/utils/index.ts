import type { StorageProvider } from '../types'

export class LocalStorageProvider implements StorageProvider {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(key)
  }

  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(key, value)
  }

  removeItem(key: string): void {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(key)
  }
}

export const STORAGE_KEYS = {
  SESSION_TOKEN: 'blindgate_session_token',
  REFRESH_TOKEN: 'blindgate_refresh_token',
  USER_DATA: 'blindgate_user_data',
} as const

export const isBrowser = (): boolean => {
  return typeof window !== 'undefined'
}
