import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { testimonialsService, type TestimonialDetail } from '../services/testimonials.service'

const testimonialKey = (id: string) => ['testimonial', id] as const

export function useTestimonial(id: string | undefined) {
  return useQuery({
    queryKey: testimonialKey(id ?? ''),
    queryFn: () => testimonialsService.getById(id!),
    enabled: !!id,
  })
}

export function useUpdateTestimonialStatus(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (status: 'approved' | 'rejected' | 'pending') =>
      testimonialsService.updateStatus(id, status),
    onSuccess: (_, status) => {
      qc.setQueryData<TestimonialDetail>(testimonialKey(id), (prev) =>
        prev ? { ...prev, status } : prev
      )
    },
  })
}
