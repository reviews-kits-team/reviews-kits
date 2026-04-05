export interface DashboardStats {
  totalReviews: number
  completionRate: number
  averageRating: number
  uniqueRespondents: number
  reviewsGrowth?: number
  completionGrowth?: number
}

export const dashboardService = {
  getStats: (): Promise<DashboardStats> =>
    fetch('/api/v1/dashboard/stats').then(async (res) => {
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message ?? `HTTP ${res.status}`)
      return data as DashboardStats
    }),
}
