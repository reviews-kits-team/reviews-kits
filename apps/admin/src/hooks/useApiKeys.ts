import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiKeysService } from '../services/api-keys.service'
import type { ApiKeys } from '../components/dashboard/types'

const API_KEYS_KEY = ['api-keys'] as const

export function useApiKeys(enabled: boolean) {
  return useQuery({ queryKey: API_KEYS_KEY, queryFn: apiKeysService.get, enabled })
}

export function useRotateApiKeys() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: apiKeysService.rotate,
    onSuccess: (newKeys) => {
      qc.setQueryData<ApiKeys>(API_KEYS_KEY, newKeys)
    },
  })
}
