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

export interface TestimonialDetail {
  id: string
  content: string
  authorName: string
  authorEmail?: string
  authorTitle?: string
  authorUrl?: string
  rating?: number
  status: 'pending' | 'approved' | 'rejected'
  source: 'form' | 'import' | 'api'
  formId?: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface TestimonialListItem {
  id: string
  authorName: string
  content: string
  rating: number
  createdAt: string
  status: string
  authorEmail?: string
}

export interface FormStats {
  totalReviews: number
  averageRating: number
  uniqueRespondents: number
  ratingDistribution: { rating: number; count: number }[]
  reviewVolume: { label: string; value: number }[]
  reviewsGrowth?: number
  completionRate?: number
  completionGrowth?: number
}

export interface ImportPayload {
  formId: string
  data: {
    authorName: string
    authorEmail?: string
    rating: number
    content: string
    createdAt: string
  }[]
}

export const testimonialsService = {
  getById: (id: string): Promise<TestimonialDetail> =>
    fetch(`/api/v1/testimonials/${id}`).then(handleResponse<TestimonialDetail>),

  updateStatus: (id: string, status: 'approved' | 'rejected' | 'pending'): Promise<void> =>
    fetch(`/api/v1/testimonials/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(handleResponse<void>),

  batchUpdateStatus: (ids: string[], status: 'approved' | 'rejected' | 'pending'): Promise<void> =>
    fetch('/api/v1/testimonials/batch-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, status }),
    }).then(handleResponse<void>),

  reorder: (positions: { id: string; position: number }[]): Promise<void> =>
    fetch('/api/v1/testimonials/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positions }),
    }).then(handleResponse<void>),

  import: (payload: ImportPayload): Promise<{ importedCount: number }> =>
    fetch('/api/v1/testimonials/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handleResponse<{ importedCount: number }>),

  listByForm: (
    formId: string,
    params: { page?: number; sort?: string | null; order?: 'asc' | 'desc' }
  ): Promise<TestimonialListItem[]> => {
    const qs = new URLSearchParams({ page: String(params.page ?? 1) })
    if (params.sort) { qs.set('sort', params.sort); qs.set('order', params.order ?? 'desc') }
    return fetch(`/api/v1/forms/${formId}/testimonials?${qs}`).then(handleResponse<TestimonialListItem[]>)
  },

  getFormStats: (formId: string): Promise<FormStats> =>
    fetch(`/api/v1/forms/${formId}/stats`).then(handleResponse<FormStats>),

  exportUrl: (formId: string): string => `/api/v1/testimonials/export?formId=${formId}`,
}
