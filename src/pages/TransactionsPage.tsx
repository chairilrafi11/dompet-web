import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Funnel, MagnifyingGlass, Plus } from '@phosphor-icons/react'
import { createTransaction, deleteTransaction, getTransactions } from '../api/transactions'
import { getWallets } from '../api/wallets'
import { getCategories } from '../api/categories'
import type { CategoryType } from '../api/types'
import { formatRupiah } from '../lib/format'
import ConfirmButton from '../components/ConfirmButton'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import PageHeader from '../components/PageHeader'
import Pagination from '../components/Pagination'
import RupiahInput from '../components/RupiahInput'
import Select from '../components/Select'
import DatePicker from '../components/DatePicker'
import DateRangePicker from '../components/DateRangePicker'
import SlideOver from '../components/SlideOver'
import SpotlightCard from '../components/SpotlightCard'
import TableSkeleton from '../components/TableSkeleton'
import { useToast } from '../components/toast-context'

const inputClass =
  'w-full rounded-xl border border-line bg-white/5 px-3 py-2 text-fg-primary placeholder:text-fg-muted focus:border-brand focus:outline-none'

type TypeFilter = '' | '0' | '1'

const PAGE_SIZE = 20

export default function TransactionsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { data: wallets = [] } = useQuery({ queryKey: ['wallets'], queryFn: getWallets })
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => getCategories() })
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [page, setPage] = useState(1)
  const transactionsQ = useQuery({
    queryKey: ['transactions', typeFilter, categoryFilter, dateFrom, dateTo, page],
    queryFn: () =>
      getTransactions(
        {
          ...(typeFilter === '' ? {} : { type: Number(typeFilter) as CategoryType }),
          ...(categoryFilter === '' ? {} : { categoryId: Number(categoryFilter) }),
          ...(dateFrom
            ? { dateFrom: new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate()).toISOString() }
            : {}),
          ...(dateTo
            ? { dateTo: new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate(), 23, 59, 59, 999).toISOString() }
            : {}),
        },
        page,
        PAGE_SIZE,
      ),
  })

  const [open, setOpen] = useState(false)
  const [walletId, setWalletId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState<Date>(() => new Date())
  const [error, setError] = useState('')

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
    queryClient.invalidateQueries({ queryKey: ['wallets'] })
  }

  const create = useMutation({
    mutationFn: () => {
      const category = categories.find((c) => c.id === Number(categoryId))!
      return createTransaction({
        walletId: Number(walletId),
        categoryId: Number(categoryId),
        amount: Number(amount),
        type: category.type,
        note: note || null,
        date: new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString(),
      })
    },
    onSuccess: () => {
      setAmount('')
      setNote('')
      setDate(new Date())
      setOpen(false)
      toast('Transaksi dicatat')
      invalidate()
    },
    onError: () => setError('Gagal menyimpan transaksi. Coba lagi.'),
  })

  const remove = useMutation({
    mutationFn: (id: number) => deleteTransaction(id),
    onSuccess: () => {
      toast('Transaksi dihapus')
      invalidate()
    },
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    create.mutate()
  }

  const all = transactionsQ.data?.items ?? []
  const totalCount = transactionsQ.data?.totalCount ?? 0
  const totalPages = transactionsQ.data?.totalPages ?? 0
  const q = search.trim().toLowerCase()
  const filtered = q
    ? all.filter((t) =>
        [t.categoryName, t.walletName, t.note ?? ''].some((s) => s.toLowerCase().includes(q)),
      )
    : all

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaksi"
        subtitle={totalCount > 0 ? `${totalCount} catatan` : 'Catat dan kelola transaksi'}
        action={
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-bright active:scale-[0.98]"
          >
            <Plus size={16} weight="bold" /> Catat
          </button>
        }
      />

      {transactionsQ.isError && (
        <ErrorBanner message="Gagal memuat transaksi." onRetry={() => transactionsQ.refetch()} />
      )}

      {transactionsQ.isLoading ? (
        <SpotlightCard className="p-0">
          <TableSkeleton />
        </SpotlightCard>
      ) : totalCount === 0 ? (
        <EmptyState
          title="Belum ada transaksi"
          description="Catat pengeluaran atau pemasukan pertamamu."
          action={
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-bright"
            >
              <Plus size={16} weight="bold" /> Catat pertama
            </button>
          }
        />
      ) : (
        <SpotlightCard className="p-0">
          <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
            <div className="relative min-w-52 flex-1">
              <MagnifyingGlass
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted"
              />
              <input
                className="w-full rounded-xl border border-line bg-white/5 py-2 pl-9 pr-3 text-sm text-fg-primary placeholder:text-fg-muted focus:border-brand focus:outline-none"
                placeholder="Cari kategori, dompet, catatan…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Funnel size={16} className="text-fg-muted" />
              <div className="w-40">
                <Select
                  ariaLabel="Filter tipe"
                  value={typeFilter}
                  onChange={(v) => {
                    setTypeFilter(v as TypeFilter)
                    setPage(1)
                  }}
                  options={[
                    { value: '', label: 'Semua tipe' },
                    { value: '0', label: 'Pemasukan' },
                    { value: '1', label: 'Pengeluaran' },
                  ]}
                />
              </div>
              <div className="w-44">
                <Select
                  ariaLabel="Filter kategori"
                  value={categoryFilter}
                  onChange={(v) => {
                    setCategoryFilter(v)
                    setPage(1)
                  }}
                  options={[
                    { value: '', label: 'Semua kategori' },
                    ...categories.map((c) => ({
                      value: String(c.id),
                      label: `${c.name} (${c.type === 0 ? 'Masuk' : 'Keluar'})`,
                    })),
                  ]}
                />
              </div>
  <DateRangePicker
    from={dateFrom}
    to={dateTo}
    onChange={(f, t) => {
      setDateFrom(f)
      setDateTo(t)
      setPage(1)
    }}
    onClear={() => {
      setDateFrom(undefined)
      setDateTo(undefined)
      setPage(1)
    }}
  />
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-fg-muted">
                  <th className="px-4 py-3 font-medium">No</th>
                  <th className="px-4 py-3 font-medium">Kategori</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Dompet</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Catatan</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">Tanggal</th>
                  <th className="px-4 py-3 text-right font-medium">Jumlah</th>
                  <th className="px-4 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr
                    key={t.id}
                    className="border-b border-line/60 transition-colors last:border-b-0 hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-3 text-sm tabular-nums text-fg-muted">
                      {(page - 1) * PAGE_SIZE + i + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-fg-primary">{t.categoryName}</td>
                    <td className="hidden px-4 py-3 text-fg-secondary md:table-cell">{t.walletName}</td>
                    <td className="hidden px-4 py-3 text-fg-secondary lg:table-cell">
                      {t.note || <span className="text-fg-muted">—</span>}
                    </td>
                    <td className="hidden px-4 py-3 text-fg-secondary sm:table-cell">
                      {new Date(t.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums ${
                        t.type === 0 ? 'text-brand-bright' : 'text-danger'
                      }`}
                    >
                      {t.type === 0 ? '+' : '-'}
                      {formatRupiah(t.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ConfirmButton onConfirm={() => remove.mutate(t.id)} busy={remove.isPending} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-line/60 md:hidden">
            {filtered.map((t, i) => (
              <li key={t.id} className="flex items-start gap-3 p-4">
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    t.type === 0 ? 'bg-brand-dim text-brand-bright' : 'bg-danger/10 text-danger'
                  }`}
                >
                  {t.type === 0 ? '+' : '-'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate font-medium text-fg-primary">{t.categoryName}</p>
                    <p
                      className={`whitespace-nowrap font-semibold tabular-nums ${
                        t.type === 0 ? 'text-brand-bright' : 'text-danger'
                      }`}
                    >
                      {t.type === 0 ? '+' : '-'}
                      {formatRupiah(t.amount)}
                    </p>
                  </div>
                  <p className="truncate text-sm text-fg-secondary">
                    {t.note || t.walletName}
                    {t.note ? ` · ${t.walletName}` : ''}
                  </p>
                  <p className="text-xs text-fg-muted">
                    #{i + 1} ·{' '}
                    {new Date(t.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <ConfirmButton
                  className="shrink-0"
                  onConfirm={() => remove.mutate(t.id)}
                  busy={remove.isPending}
                />
              </li>
            ))}
          </ul>
          {filtered.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-fg-secondary">
              Tidak ada transaksi yang cocok dengan filter.
            </p>
          )}
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(p) => {
              setPage(p)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        </SpotlightCard>
      )}

      <SlideOver open={open} title="Catat Transaksi" onClose={() => setOpen(false)}>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <ErrorBanner message={error} />}
          <div>
            <label className="mb-1 block text-sm text-fg-secondary">Dompet</label>
            <Select
              ariaLabel="Dompet"
              value={walletId}
              onChange={setWalletId}
              placeholder="Pilih dompet"
              options={wallets.map((w) => ({ value: String(w.id), label: w.name }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-fg-secondary">Kategori</label>
            <Select
              ariaLabel="Kategori"
              value={categoryId}
              onChange={setCategoryId}
              placeholder="Pilih kategori"
              options={categories.map((c) => ({
                value: String(c.id),
                label: `${c.name} (${c.type === 0 ? 'Masuk' : 'Keluar'})`,
              }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-fg-secondary">Jumlah</label>
            <RupiahInput
              className={inputClass}
              value={amount}
              onChange={setAmount}
              placeholder="0"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-fg-secondary">Tanggal</label>
            <DatePicker value={date} onChange={(d) => d && setDate(d)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-fg-secondary">Catatan</label>
            <input
              className={inputClass}
              value={note}
              placeholder="Opsional"
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <button
            disabled={create.isPending}
            className="w-full rounded-xl bg-brand py-2.5 font-semibold text-ink-950 transition-colors hover:bg-brand-bright disabled:opacity-60"
            type="submit"
          >
            {create.isPending ? 'Menyimpan…' : 'Simpan'}
          </button>
        </form>
      </SlideOver>
    </div>
  )
}
