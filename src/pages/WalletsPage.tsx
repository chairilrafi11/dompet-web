import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PencilSimple, Plus, Wallet } from '@phosphor-icons/react'
import { createWallet, deleteWallet, getWallets, updateWallet } from '../api/wallets'
import type { Wallet as WalletModel } from '../api/types'
import { formatRupiah } from '../lib/format'
import ConfirmButton from '../components/ConfirmButton'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import PageHeader from '../components/PageHeader'
import RupiahInput from '../components/RupiahInput'
import SlideOver from '../components/SlideOver'
import SpotlightCard from '../components/SpotlightCard'
import { useToast } from '../components/toast-context'

const inputClass =
  'w-full rounded-xl border border-line bg-white/5 px-3 py-2 text-fg-primary placeholder:text-fg-muted focus:border-brand focus:outline-none'

interface FormState {
  name: string
  initialBalance: string
}

const emptyForm: FormState = { name: '', initialBalance: '0' }

export default function WalletsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const walletsQ = useQuery({ queryKey: ['wallets'], queryFn: getWallets })
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editing, setEditing] = useState<WalletModel | null>(null)
  const [error, setError] = useState('')

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['wallets'] })

  const create = useMutation({
    mutationFn: () => createWallet(form.name, Number(form.initialBalance)),
    onSuccess: () => {
      setOpen(false)
      setForm(emptyForm)
      toast('Dompet ditambahkan')
      invalidate()
    },
    onError: () => setError('Gagal menyimpan dompet. Coba lagi.'),
  })

  const update = useMutation({
    mutationFn: () => updateWallet(editing!.id, form.name, Number(form.initialBalance)),
    onSuccess: () => {
      setOpen(false)
      setForm(emptyForm)
      setEditing(null)
      toast('Dompet diperbarui')
      invalidate()
    },
    onError: () => setError('Gagal menyimpan dompet. Coba lagi.'),
  })

  const remove = useMutation({
    mutationFn: (id: number) => deleteWallet(id),
    onSuccess: () => {
      toast('Dompet dihapus')
      invalidate()
    },
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

  function openEdit(w: WalletModel) {
    setEditing(w)
    setForm({ name: w.name, initialBalance: String(w.initialBalance) })
    setError('')
    setOpen(true)
  }

  const wallets = walletsQ.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dompet"
        subtitle="Kelola sumber dana"
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-bright active:scale-[0.98]"
          >
            <Plus size={16} weight="bold" /> Tambah
          </button>
        }
      />

      {walletsQ.isError && (
        <ErrorBanner message="Gagal memuat dompet." onRetry={() => walletsQ.refetch()} />
      )}

      {wallets.length === 0 ? (
        <EmptyState
          title="Belum ada dompet"
          description="Buat dompet pertama untuk mulai mencatat."
          action={
            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-bright"
            >
              <Plus size={16} weight="bold" /> Tambah dompet
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wallets.map((w) => (
            <SpotlightCard key={w.id} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-fg-secondary">
                  <Wallet size={18} /> {w.name}
                </div>
                <div className="flex gap-1">
                  <button
                    aria-label={`Edit ${w.name}`}
                    onClick={() => openEdit(w)}
                    className="rounded-lg border border-line p-2 text-fg-secondary transition-colors hover:border-brand/40 hover:text-brand-bright"
                  >
                    <PencilSimple size={14} />
                  </button>
                  <ConfirmButton onConfirm={() => remove.mutate(w.id)} busy={remove.isPending} />
                </div>
              </div>
              <p className="mt-4 text-2xl font-semibold tabular-nums text-fg-primary">
                {formatRupiah(w.balance)}
              </p>
              {w.monthlyTarget != null && w.monthlyTarget > 0 && (
                <div className="mt-4">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-brand transition-all"
                      style={{ width: `${Math.min(100, (w.balance / w.monthlyTarget) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-fg-muted">
                    Target {formatRupiah(w.monthlyTarget)}
                  </p>
                </div>
              )}
            </SpotlightCard>
          ))}
        </div>
      )}

      <SlideOver
        open={open}
        title={editing ? 'Edit Dompet' : 'Tambah Dompet'}
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
            <label className="mb-1 block text-sm text-fg-secondary">Saldo awal</label>
            <RupiahInput
              className={inputClass}
              value={form.initialBalance}
              onChange={(v) => setForm({ ...form, initialBalance: v })}
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
