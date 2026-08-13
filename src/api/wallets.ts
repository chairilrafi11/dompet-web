import { api } from './client'
import type { Wallet } from './types'

export async function getWallets() {
  const { data } = await api.get<Wallet[]>('/wallets')
  return data
}

export async function createWallet(name: string, initialBalance: number) {
  const { data } = await api.post<Wallet>('/wallets', { name, initialBalance })
  return data
}

export async function updateWallet(id: number, name: string, initialBalance: number) {
  const { data } = await api.put<Wallet>(`/wallets/${id}`, { name, initialBalance })
  return data
}

export async function deleteWallet(id: number) {
  await api.delete(`/wallets/${id}`)
}
