export interface DashboardForm {
  id: string
  userId: string
  name: string
  slug: string
  description?: string
  status?: string
  isActive?: boolean
  responses?: number
  rating?: number | null
  completion?: number
  createdAt: string | Date
  updatedAt?: string | Date
}

export interface ApiKeys {
  publicKey: string
  secretKey: string
}
