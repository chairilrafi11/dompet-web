import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getMonthlyTrend } from '../api/analytics'
import { formatRupiah } from '../lib/format'

export default function AnalyticsPage() {
  const { data: trend = [] } = useQuery({
    queryKey: ['monthly-trend'],
    queryFn: () => getMonthlyTrend(6),
  })

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Analitik</h2>

      <div className="bg-white p-5 rounded shadow">
        <h3 className="font-semibold mb-4">Tren 6 Bulan Terakhir</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(v) => formatRupiah(Number(v))} />
            <Legend />
            <Bar dataKey="income" name="Pemasukan" fill="#059669" />
            <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
