import type { DashboardForm } from '../components/dashboard/types'
import type { FormData } from '../components/form-editor/types'

/** Full API response for a single form — includes both dashboard metadata and editor config */
export type FullForm = DashboardForm & Pick<FormData, 'config'>

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

export const formsService = {
  list: (): Promise<DashboardForm[]> =>
    fetch('/api/v1/forms').then(handleResponse<DashboardForm[]>),

  delete: (id: string): Promise<void> =>
    fetch(`/api/v1/forms/${id}`, { method: 'DELETE' }).then(handleResponse<void>),

  toggle: (id: string): Promise<Pick<DashboardForm, 'id' | 'isActive'>> =>
    fetch(`/api/v1/forms/${id}/toggle`, { method: 'PATCH' }).then(
      handleResponse<Pick<DashboardForm, 'id' | 'isActive'>>
    ),

  duplicate: (id: string): Promise<DashboardForm> =>
    fetch(`/api/v1/forms/${id}/duplicate`, { method: 'POST' }).then(
      handleResponse<DashboardForm>
    ),

  create: (payload: { name: string; slug: string; description: string }): Promise<DashboardForm> =>
    fetch('/api/v1/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handleResponse<DashboardForm>),

  batchToggle: (ids: string[], isActive: boolean): Promise<void> =>
    fetch('/api/v1/forms/batch-toggle', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, isActive }),
    }).then(handleResponse<void>),

  batchDelete: (ids: string[]): Promise<void> =>
    fetch('/api/v1/forms/batch', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    }).then(handleResponse<void>),

  getById: (id: string): Promise<FullForm> =>
    fetch(`/api/v1/forms/${id}`).then(handleResponse<FullForm>),

  save: (id: string, payload: { name: string; config: FormData['config'] }): Promise<FullForm> =>
    fetch(`/api/v1/forms/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handleResponse<FullForm>),
}
