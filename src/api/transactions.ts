import { api } from './client'
import type { CategoryType, PagedResult, Transaction } from './types'

export interface TransactionFilters {
  dateFrom?: string
  dateTo?: string
  categoryId?: number
  walletId?: number
  type?: CategoryType
}

export async function getTransactions(
  filters: TransactionFilters = {},
  page = 1,
  pageSize = 20,
) {
  const { data } = await api.get<PagedResult<Transaction>>('/transactions', {
    params: { ...filters, page, pageSize },
  })
  return data
}

export interface TransactionInput {
  walletId: number
  categoryId: number
  amount: number
  type: CategoryType
  note?: string | null
  date: string
}

export async function createTransaction(input: TransactionInput) {
  const { data } = await api.post<Transaction>('/transactions', input)
  return data
}

export async function deleteTransaction(id: number) {
  await api.delete(`/transactions/${id}`)
}
