export interface AppNotification {
  id: string
  type: string
  title: string
  body: string | null
  formId: string | null
  testimonialId: string | null
  isRead: boolean
  createdAt: string
}

interface NotificationsResponse {
  notifications: AppNotification[]
  unreadCount: number
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json()
  if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : `HTTP ${res.status}`)
  return data as T
}

export const notificationsService = {
  list: (limit = 20, offset = 0): Promise<NotificationsResponse> =>
    fetch(`/api/v1/notifications?limit=${limit}&offset=${offset}`).then(handleResponse),

  markRead: (id: string): Promise<{ success: boolean }> =>
    fetch(`/api/v1/notifications/${id}/read`, { method: 'PATCH' }).then(handleResponse),

  markAllRead: (): Promise<{ success: boolean }> =>
    fetch('/api/v1/notifications/read-all', { method: 'POST' }).then(handleResponse),
}
