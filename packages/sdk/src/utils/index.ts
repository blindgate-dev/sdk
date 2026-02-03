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

export const base64UrlEncode = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export const base64UrlDecode = (base64url: string): ArrayBuffer => {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer as ArrayBuffer
}
