import type { ApiKeys } from '../components/dashboard/types'

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json()
  if (!res.ok) {
    const message =
      typeof data.error === 'object'
        ? data.error?.message ?? JSON.stringify(data.error)
        : data.error ?? `HTTP ${res.status}`
    throw new Error(message)
  }
  return data as T
}

export const apiKeysService = {
  get: (): Promise<ApiKeys> =>
    fetch('/api/v1/api-keys').then(handleResponse<ApiKeys>),

  rotate: (): Promise<ApiKeys> =>
    fetch('/api/v1/api-keys/rotate', { method: 'POST' }).then(handleResponse<ApiKeys>),
}
