export interface DashboardForm {
  id: number
  name: string
  status: 'active' | 'draft' | string
  responses: number
  rating: number | null
  completion: number
  created: string
}
