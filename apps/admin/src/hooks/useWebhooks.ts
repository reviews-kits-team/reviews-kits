import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { webhooksService, type Webhook } from '../services/webhooks.service'

const WEBHOOKS_KEY = ['webhooks'] as const

export function useWebhooks() {
  return useQuery({ queryKey: WEBHOOKS_KEY, queryFn: webhooksService.list })
}

export function useCreateWebhook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: webhooksService.create,
    onSuccess: (newHook) => {
      qc.setQueryData<Webhook[]>(WEBHOOKS_KEY, (prev = []) => [...prev, newHook])
    },
  })
}

export function useDeleteWebhook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: webhooksService.delete,
    onSuccess: (_, id) => {
      qc.setQueryData<Webhook[]>(WEBHOOKS_KEY, (prev = []) => prev.filter((w) => w.id !== id))
    },
  })
}

export function useTestWebhook() {
  return useMutation({ mutationFn: webhooksService.test })
}
