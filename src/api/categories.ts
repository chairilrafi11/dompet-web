import { api } from './client'
import type { Category, CategoryType } from './types'

export async function getCategories(type?: CategoryType) {
  const { data } = await api.get<Category[]>('/categories', { params: { type } })
  return data
}

export async function createCategory(name: string, type: CategoryType) {
  const { data } = await api.post<Category>('/categories', { name, type })
  return data
}

export async function updateCategory(id: number, name: string, type: CategoryType) {
  const { data } = await api.put<Category>(`/categories/${id}`, { name, type })
  return data
}

export async function deleteCategory(id: number) {
  await api.delete(`/categories/${id}`)
}
