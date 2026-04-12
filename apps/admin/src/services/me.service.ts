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

export interface NotificationPrefs {
  newReview: boolean
  weeklyReport: boolean
}

export interface MeResponse {
  user: {
    id: string
    name: string
    email: string
    notificationPrefs?: NotificationPrefs
    [key: string]: unknown
  }
  session: unknown
}

export interface UserProfile {
  name: string
  email: string
}

export const meService = {
  getMe: (): Promise<MeResponse> =>
    fetch('/api/v1/me').then(handleResponse<MeResponse>),

  update: (payload: UserProfile): Promise<UserProfile> =>
    fetch('/api/v1/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handleResponse<UserProfile>),

  updateNotificationPrefs: (prefs: Partial<NotificationPrefs>): Promise<{ success: boolean }> =>
    fetch('/api/v1/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationPrefs: prefs }),
    }).then(handleResponse<{ success: boolean }>),
}
