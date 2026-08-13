import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createWallet, deleteWallet, getWallets, updateWallet } from '../api/wallets'
import { formatRupiah } from '../lib/format'

export default function WalletsPage() {
  const queryClient = useQueryClient()
  const { data: wallets = [] } = useQuery({ queryKey: ['wallets'], queryFn: getWallets })
  const [name, setName] = useState('')
  const [initialBalance, setInitialBalance] = useState('0')
  const [editing, setEditing] = useState<{ id: number; name: string; initialBalance: string } | null>(null)

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['wallets'] })

  const create = useMutation({
    mutationFn: () => createWallet(name, Number(initialBalance)),
    onSuccess: () => {
      setName('')
      setInitialBalance('0')
      invalidate()
    },
  })

  const update = useMutation({
    mutationFn: () => updateWallet(editing!.id, editing!.name, Number(editing!.initialBalance)),
    onSuccess: () => {
      setEditing(null)
      invalidate()
    },
  })

  const remove = useMutation({
    mutationFn: (id: number) => deleteWallet(id),
    onSuccess: invalidate,
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (editing) update.mutate()
    else create.mutate()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Dompet</h2>

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
        <div className="w-48">
          <label className="text-sm text-slate-600">Saldo awal</label>
          <input
            className="w-full border rounded px-3 py-2"
            type="number"
            value={editing?.initialBalance ?? initialBalance}
            onChange={(e) =>
              editing
                ? setEditing({ ...editing, initialBalance: e.target.value })
                : setInitialBalance(e.target.value)
            }
            required
          />
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
        {wallets.map((w) => (
          <div key={w.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <p className="font-semibold">{w.name}</p>
              <p className="text-sm text-slate-600">{formatRupiah(w.balance)}</p>
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded border"
                onClick={() => setEditing({ id: w.id, name: w.name, initialBalance: String(w.initialBalance) })}
              >
                Edit
              </button>
              <button className="px-3 py-1 rounded border text-red-600" onClick={() => remove.mutate(w.id)}>
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
