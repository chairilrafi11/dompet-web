import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PencilSimple, Plus, Tag } from '@phosphor-icons/react'
import { createCategory, deleteCategory, getCategories, updateCategory } from '../api/categories'
import type { Category, CategoryType } from '../api/types'
import ConfirmButton from '../components/ConfirmButton'
import ErrorBanner from '../components/ErrorBanner'
import PageHeader from '../components/PageHeader'
import Select from '../components/Select'
import SlideOver from '../components/SlideOver'
import SpotlightCard from '../components/SpotlightCard'
import { useToast } from '../components/toast-context'

const inputClass =
  'w-full rounded-xl border border-line bg-white/5 px-3 py-2 text-fg-primary placeholder:text-fg-muted focus:border-brand focus:outline-none'

interface FormState {
  name: string
  type: CategoryType
}

const emptyForm: FormState = { name: '', type: 1 }

export default function CategoriesPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const categoriesQ = useQuery({ queryKey: ['categories'], queryFn: () => getCategories() })
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editing, setEditing] = useState<Category | null>(null)
  const [error, setError] = useState('')

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['categories'] })

  const create = useMutation({
    mutationFn: () => createCategory(form.name, form.type),
    onSuccess: () => {
      setOpen(false)
      setForm(emptyForm)
      toast('Kategori ditambahkan')
      invalidate()
    },
    onError: () => setError('Gagal menyimpan kategori. Coba lagi.'),
  })

  const update = useMutation({
    mutationFn: () => updateCategory(editing!.id, form.name, form.type),
    onSuccess: () => {
      setOpen(false)
      setForm(emptyForm)
      setEditing(null)
      toast('Kategori diperbarui')
      invalidate()
    },
    onError: () => setError('Gagal menyimpan kategori. Coba lagi.'),
  })

  const remove = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      toast('Kategori dihapus')
      invalidate()
    },
    onError: () => setError('Kategori sedang dipakai transaksi.'),
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (editing) update.mutate()
    else create.mutate()
  }

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setOpen(true)
  }

  function openEdit(c: Category) {
    setEditing(c)
    setForm({ name: c.name, type: c.type })
    setError('')
    setOpen(true)
  }

  const categories = categoriesQ.data ?? []
  const income = categories.filter((c) => c.type === 0)
  const expense = categories.filter((c) => c.type === 1)

  const renderGroup = (title: string, items: Category[]) => (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-fg-secondary">{title}</h3>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-fg-muted">
          Belum ada kategori
        </p>
      ) : (
        items.map((c) => (
          <SpotlightCard key={c.id} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-dim text-brand-bright">
                  <Tag size={16} />
                </span>
                <p className="font-medium text-fg-primary">{c.name}</p>
              </div>
              <div className="flex gap-1">
                <button
                  aria-label={`Edit ${c.name}`}
                  onClick={() => openEdit(c)}
                  className="rounded-lg border border-line p-2 text-fg-secondary transition-colors hover:border-brand/40 hover:text-brand-bright"
                >
                  <PencilSimple size={14} />
                </button>
                <ConfirmButton onConfirm={() => remove.mutate(c.id)} busy={remove.isPending} />
              </div>
            </div>
          </SpotlightCard>
        ))
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategori"
        subtitle="Kelola label pemasukan dan pengeluaran"
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-bright active:scale-[0.98]"
          >
            <Plus size={16} weight="bold" /> Tambah
          </button>
        }
      />

      {categoriesQ.isError && (
        <ErrorBanner message="Gagal memuat kategori." onRetry={() => categoriesQ.refetch()} />
      )}
      {error && <ErrorBanner message={error} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {renderGroup('Pemasukan', income)}
        {renderGroup('Pengeluaran', expense)}
      </div>

      <SlideOver
        open={open}
        title={editing ? 'Edit Kategori' : 'Tambah Kategori'}
        onClose={() => setOpen(false)}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <ErrorBanner message={error} />}
          <div>
            <label className="mb-1 block text-sm text-fg-secondary">Nama</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-fg-secondary">Tipe</label>
            <Select
              ariaLabel="Tipe"
              value={String(form.type)}
              onChange={(v) => setForm({ ...form, type: Number(v) as CategoryType })}
              options={[
                { value: '0', label: 'Pemasukan' },
                { value: '1', label: 'Pengeluaran' },
              ]}
            />
          </div>
          <button
            disabled={create.isPending || update.isPending}
            className="w-full rounded-xl bg-brand py-2.5 font-semibold text-ink-950 transition-colors hover:bg-brand-bright disabled:opacity-60"
            type="submit"
          >
            {create.isPending || update.isPending ? 'Menyimpan…' : 'Simpan'}
          </button>
        </form>
      </SlideOver>
    </div>
  )
}
