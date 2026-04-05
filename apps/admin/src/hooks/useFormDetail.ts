import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { testimonialsService } from '../services/testimonials.service'
import { formsService, type FullForm } from '../services/forms.service'
import type { DashboardForm } from '../components/dashboard/types'
import type { FormData } from '../components/form-editor/types'
import { normalizeStepOrder } from '../components/form-editor/utils'

export const formDetailKey = (id: string) => ['form', id] as const
export const formStatsKey = (id: string) => ['form', id, 'stats'] as const
export const formTestimonialsKey = (id: string, page: number, sort: string | null, order: string) =>
  ['form', id, 'testimonials', page, sort, order] as const

/** For FormEditorPage — returns FullForm with steps normalized */
export function useFormById(id: string | undefined) {
  return useQuery<FullForm>({
    queryKey: formDetailKey(id ?? ''),
    queryFn: async () => {
      const data = await formsService.getById(id!)
      if (data.config?.steps) data.config.steps = normalizeStepOrder(data.config.steps)
      return data
    },
    enabled: !!id,
  })
}

/** For FormDetailPage — same endpoint, typed as DashboardForm (FullForm satisfies it) */
export function useDashboardFormById(id: string | undefined) {
  return useQuery<DashboardForm>({
    queryKey: formDetailKey(id ?? ''),
    queryFn: () => formsService.getById(id!),
    enabled: !!id,
  })
}

export function useFormStats(formId: string) {
  return useQuery({
    queryKey: formStatsKey(formId),
    queryFn: () => testimonialsService.getFormStats(formId),
    enabled: !!formId,
  })
}

export function useFormTestimonials(
  formId: string,
  page: number,
  sort: string | null,
  order: 'asc' | 'desc'
) {
  return useQuery({
    queryKey: formTestimonialsKey(formId, page, sort, order),
    queryFn: () => testimonialsService.listByForm(formId, { page, sort, order }),
    enabled: !!formId,
  })
}

const formTestimonialsBaseKey = (formId: string) => ['form', formId, 'testimonials'] as const

export function useUpdateTestimonialStatus(formId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' | 'pending' }) =>
      testimonialsService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: formTestimonialsBaseKey(formId) })
    },
  })
}

export function useBatchUpdateStatus(formId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: 'approved' | 'rejected' | 'pending' }) =>
      testimonialsService.batchUpdateStatus(ids, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: formTestimonialsBaseKey(formId) })
    },
  })
}

export function useReorderTestimonials() {
  return useMutation({
    mutationFn: (positions: { id: string; position: number }[]) =>
      testimonialsService.reorder(positions),
  })
}

export function useSaveForm(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name: string; config: FormData['config'] }) =>
      formsService.save(id, payload),
    onSuccess: (updated) => {
      qc.setQueryData<FullForm>(formDetailKey(id), updated)
    },
  })
}
