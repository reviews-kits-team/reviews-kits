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

export interface ApiKey {
  id: string
  key: string
  type: 'public' | 'secret'
  name?: string
  lastUsed?: string | Date
  isActive: boolean
}

export interface ApiKeys {
  publicKey: string
  secretKey: string
}
