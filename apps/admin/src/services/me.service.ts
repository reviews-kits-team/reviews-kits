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

export interface UserProfile {
  name: string
  email: string
}

export const meService = {
  update: (payload: UserProfile): Promise<UserProfile> =>
    fetch('/api/v1/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handleResponse<UserProfile>),
}
