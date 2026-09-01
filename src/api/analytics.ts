import { api } from './client'
import type {
  AnalyticsSummary,
  CategoryBreakdown,
  TrendPoint,
  WalletRecap,
} from './types'

export interface DateRangeParam {
  from?: string
  to?: string
}

export async function getSummary(range?: DateRangeParam) {
  const { data } = await api.get<AnalyticsSummary>('/analytics/summary', { params: range })
  return data
}

export async function getByCategory(range?: DateRangeParam) {
  const { data } = await api.get<CategoryBreakdown[]>('/analytics/by-category', { params: range })
  return data
}

export async function getTrend(range?: DateRangeParam) {
  const { data } = await api.get<TrendPoint[]>('/analytics/trend', { params: range })
  return data
}

export async function getWalletRecap(range?: DateRangeParam) {
  const { data } = await api.get<WalletRecap[]>('/analytics/wallet-recap', { params: range })
  return data
}
