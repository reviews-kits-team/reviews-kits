import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formsService } from '../services/forms.service'
import type { DashboardForm } from '../components/dashboard/types'

export const FORMS_KEY = ['forms'] as const

export function useForms() {
  return useQuery({
    queryKey: FORMS_KEY,
    queryFn: formsService.list,
  })
}

export function useDeleteForm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: formsService.delete,
    onSuccess: (_, id) => {
      qc.setQueryData<DashboardForm[]>(FORMS_KEY, (prev) =>
        prev ? prev.filter((f) => f.id !== id) : []
      )
    },
  })
}

export function useToggleFormStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: formsService.toggle,
    onSuccess: (updated) => {
      qc.setQueryData<DashboardForm[]>(FORMS_KEY, (prev) =>
        prev
          ? prev.map((f) => (f.id === updated.id ? { ...f, isActive: updated.isActive } : f))
          : []
      )
    },
  })
}

export function useDuplicateForm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: formsService.duplicate,
    onSuccess: (newForm) => {
      qc.setQueryData<DashboardForm[]>(FORMS_KEY, (prev) =>
        prev ? [newForm, ...prev] : [newForm]
      )
    },
  })
}

export function useCreateForm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: formsService.create,
    onSuccess: (newForm) => {
      qc.setQueryData<DashboardForm[]>(FORMS_KEY, (prev) =>
        prev ? [newForm, ...prev] : [newForm]
      )
    },
  })
}

export function useBatchToggleStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ids, isActive }: { ids: string[]; isActive: boolean }) =>
      formsService.batchToggle(ids, isActive),
    onSuccess: (_, { ids, isActive }) => {
      qc.setQueryData<DashboardForm[]>(FORMS_KEY, (prev) =>
        prev ? prev.map((f) => (ids.includes(f.id) ? { ...f, isActive } : f)) : []
      )
    },
  })
}

export function useBatchDeleteForms() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: formsService.batchDelete,
    onSuccess: (_, ids) => {
      qc.setQueryData<DashboardForm[]>(FORMS_KEY, (prev) =>
        prev ? prev.filter((f) => !ids.includes(f.id)) : []
      )
    },
  })
}
