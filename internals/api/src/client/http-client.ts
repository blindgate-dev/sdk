export class HttpClientError extends Error {
  status: number
  data: unknown

  constructor(status: number, message: string, data?: unknown) {
    super(message)
    this.name = 'HttpClientError'
    this.status = status
    this.data = data
  }
}

type HttpClientConfig = {
  baseUrl: string
  publishableKey: string
  getToken: () => string | null | Promise<string | null>
}

let config: HttpClientConfig | null = null

export const configureHttpClient = (options: HttpClientConfig) => {
  config = options
}

export const getHttpClientConfig = () => config

export const httpClient = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const headers = new Headers(options.headers)

  if (config) {
    headers.set('x-publishable-key', config.publishableKey)

    const token = await config.getToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const fullUrl = config && url.startsWith('/') ? `${config.baseUrl}${url}` : url

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const data = await response.json()

  if (!response.ok) {
    throw new HttpClientError(
      response.status,
      data?.message ?? `HTTP error ${response.status}`,
      data,
    )
  }

  return data as T
}
