import { useQuery } from '@tanstack/react-query'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { getByCategory, getSummary } from '../api/analytics'
import { getWallets } from '../api/wallets'
import { formatRupiah } from '../lib/format'

const COLORS = ['#059669', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function DashboardPage() {
  const { data: summary } = useQuery({ queryKey: ['summary'], queryFn: getSummary })
  const { data: breakdown = [] } = useQuery({ queryKey: ['by-category'], queryFn: getByCategory })
  const { data: wallets = [] } = useQuery({ queryKey: ['wallets'], queryFn: getWallets })

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0)

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Dashboard</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded shadow">
          <p className="text-sm text-slate-600">Saldo Total</p>
          <p className="text-xl font-bold">{formatRupiah(totalBalance)}</p>
        </div>
        <div className="bg-white p-5 rounded shadow">
          <p className="text-sm text-slate-600">Pemasukan (bulan ini)</p>
          <p className="text-xl font-bold text-emerald-600">{formatRupiah(summary?.income ?? 0)}</p>
        </div>
        <div className="bg-white p-5 rounded shadow">
          <p className="text-sm text-slate-600">Pengeluaran (bulan ini)</p>
          <p className="text-xl font-bold text-red-600">{formatRupiah(summary?.expense ?? 0)}</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded shadow">
        <h3 className="font-semibold mb-4">Pengeluaran per Kategori</h3>
        {breakdown.length === 0 ? (
          <p className="text-slate-500 text-sm">Belum ada data bulan ini.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={breakdown}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {breakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatRupiah(Number(v))} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
