export interface AuthResponse {
  token: string
  email: string
  displayName: string
}

export interface Wallet {
  id: number
  name: string
  initialBalance: number
  balance: number
}

export type CategoryType = 0 | 1

export interface Category {
  id: number
  name: string
  type: CategoryType
}

export interface Transaction {
  id: number
  walletId: number
  walletName: string
  categoryId: number
  categoryName: string
  amount: number
  type: CategoryType
  note: string | null
  date: string
}

export interface AnalyticsSummary {
  income: number
  expense: number
  net: number
}

export interface CategoryBreakdown {
  category: string
  amount: number
}

export interface MonthlyTrend {
  month: string
  income: number
  expense: number
}
