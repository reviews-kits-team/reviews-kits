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

export interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  isActive?: boolean
}

export const webhooksService = {
  list: (): Promise<Webhook[]> =>
    fetch('/api/v1/webhooks').then(handleResponse<Webhook[]>),

  create: (payload: { name: string; url: string; events: string[] }): Promise<Webhook> =>
    fetch('/api/v1/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handleResponse<Webhook>),

  delete: (id: string): Promise<void> =>
    fetch(`/api/v1/webhooks/${id}`, { method: 'DELETE' }).then(handleResponse<void>),

  test: (id: string): Promise<void> =>
    fetch(`/api/v1/webhooks/${id}/test`, { method: 'POST' }).then(handleResponse<void>),
}
