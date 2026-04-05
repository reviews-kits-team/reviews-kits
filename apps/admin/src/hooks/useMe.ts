import { useMutation } from '@tanstack/react-query'
import { meService, type UserProfile } from '../services/me.service'

export function useUpdateProfile(onSuccess?: () => void) {
  return useMutation<UserProfile, Error, UserProfile>({
    mutationFn: meService.update,
    onSuccess,
  })
}
