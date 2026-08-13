import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTransaction, deleteTransaction, getTransactions } from '../api/transactions'
import { getWallets } from '../api/wallets'
import { getCategories } from '../api/categories'
import { formatRupiah } from '../lib/format'

export default function TransactionsPage() {
  const queryClient = useQueryClient()
  const { data: wallets = [] } = useQuery({ queryKey: ['wallets'], queryFn: getWallets })
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => getCategories() })
  const { data: transactions = [] } = useQuery({ queryKey: ['transactions'], queryFn: () => getTransactions() })

  const [walletId, setWalletId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

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
        date: new Date().toISOString(),
      })
    },
    onSuccess: () => {
      setAmount('')
      setNote('')
      invalidate()
    },
  })

  const remove = useMutation({
    mutationFn: (id: number) => deleteTransaction(id),
    onSuccess: invalidate,
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    create.mutate()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Transaksi</h2>

      <form onSubmit={onSubmit} className="bg-white p-4 rounded shadow flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-sm text-slate-600">Dompet</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            required
          >
            <option value="">Pilih...</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-600">Kategori</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Pilih...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type === 0 ? 'In' : 'Out'})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-600">Jumlah</label>
          <input
            className="w-full border rounded px-3 py-2"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="flex-1 min-w-40">
          <label className="text-sm text-slate-600">Catatan</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded" type="submit">
          Tambah
        </button>
      </form>

      <div className="space-y-2">
        {transactions.map((t) => (
          <div key={t.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <p className="font-semibold">{t.categoryName}</p>
              <p className="text-sm text-slate-600">
                {t.walletName} · {t.note || '-'}
              </p>
              <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString('id-ID')}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={t.type === 0 ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
                {t.type === 0 ? '+' : '-'}
                {formatRupiah(t.amount)}
              </span>
              <button className="px-3 py-1 rounded border text-red-600" onClick={() => remove.mutate(t.id)}>
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
