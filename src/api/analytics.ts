import { api } from './client'
import type { AnalyticsSummary, CategoryBreakdown, MonthlyTrend } from './types'

export async function getSummary() {
  const { data } = await api.get<AnalyticsSummary>('/analytics/summary')
  return data
}

export async function getByCategory() {
  const { data } = await api.get<CategoryBreakdown[]>('/analytics/by-category')
  return data
}

export async function getMonthlyTrend(months = 6) {
  const { data } = await api.get<MonthlyTrend[]>('/analytics/monthly-trend', { params: { months } })
  return data
}
