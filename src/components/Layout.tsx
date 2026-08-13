import { NavLink, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/transactions', label: 'Transaksi' },
  { to: '/wallets', label: 'Dompet' },
  { to: '/categories', label: 'Kategori' },
  { to: '/analytics', label: 'Analitik' },
]

export default function Layout({ children }: { children: ReactNode }) {
  const { displayName, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-emerald-600 text-white px-6 py-3 flex items-center justify-between">
        <h1 className="font-bold">Dompet</h1>
        <nav className="flex gap-4">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => (isActive ? 'underline font-semibold' : '')}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span>{displayName}</span>
          <button
            className="bg-white/20 px-3 py-1 rounded"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            Keluar
          </button>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
