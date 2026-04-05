import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboard.service'

export const DASHBOARD_STATS_KEY = ['dashboard-stats'] as const

export function useDashboardStats() {
  return useQuery({
    queryKey: DASHBOARD_STATS_KEY,
    queryFn: dashboardService.getStats,
  })
}
