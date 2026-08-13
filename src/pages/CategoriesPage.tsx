import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCategory, deleteCategory, getCategories, updateCategory } from '../api/categories'
import type { CategoryType } from '../api/types'

const labels: Record<CategoryType, string> = { 0: 'Pemasukan', 1: 'Pengeluaran' }

export default function CategoriesPage() {
  const queryClient = useQueryClient()
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => getCategories() })
  const [name, setName] = useState('')
  const [type, setType] = useState<CategoryType>(1)
  const [editing, setEditing] = useState<{ id: number; name: string; type: CategoryType } | null>(null)

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['categories'] })

  const create = useMutation({
    mutationFn: () => createCategory(name, type),
    onSuccess: () => {
      setName('')
      invalidate()
    },
  })

  const update = useMutation({
    mutationFn: () => updateCategory(editing!.id, editing!.name, editing!.type),
    onSuccess: () => {
      setEditing(null)
      invalidate()
    },
  })

  const remove = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: invalidate,
    onError: () => alert('Kategori sedang dipakai transaksi'),
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (editing) update.mutate()
    else create.mutate()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Kategori</h2>

      <form onSubmit={onSubmit} className="bg-white p-4 rounded shadow flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-sm text-slate-600">Nama</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={editing?.name ?? name}
            onChange={(e) =>
              editing ? setEditing({ ...editing, name: e.target.value }) : setName(e.target.value)
            }
            required
          />
        </div>
        <div>
          <label className="text-sm text-slate-600">Tipe</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={editing?.type ?? type}
            onChange={(e) => {
              const v = Number(e.target.value) as CategoryType
              editing ? setEditing({ ...editing, type: v }) : setType(v)
            }}
          >
            <option value={0}>Pemasukan</option>
            <option value={1}>Pengeluaran</option>
          </select>
        </div>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded" type="submit">
          {editing ? 'Simpan' : 'Tambah'}
        </button>
        {editing && (
          <button type="button" className="px-3 py-2 rounded border" onClick={() => setEditing(null)}>
            Batal
          </button>
        )}
      </form>

      <div className="space-y-2">
        {categories.map((c) => (
          <div key={c.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-slate-600">{labels[c.type]}</p>
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded border"
                onClick={() => setEditing({ id: c.id, name: c.name, type: c.type })}
              >
                Edit
              </button>
              <button className="px-3 py-1 rounded border text-red-600" onClick={() => remove.mutate(c.id)}>
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
